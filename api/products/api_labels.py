"""
Labels Endpoints | Cannlytics API
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 9/25/2024
Updated: 9/25/2024
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>

Description: API endpoints to interface with label data.
"""
# Standard imports:
from datetime import datetime
from json import loads
import os

# External imports:
from django.views.decorators.csrf import csrf_exempt
import google.auth
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Internal imports
from api.api_utils import process_file_or_url
from website.auth import authenticate_request
from cannlytics.data.products.label_parser import LabelParser
# FIXME:
from cannlytics.data.strains.strains_ai import identify_strains
from cannlytics.firebase import (
    access_secret_version,
    create_log,
    create_short_url,
    get_collection,
    get_document,
    get_file_url,
    increment_value,
    update_documents,
    upload_file,
    delete_document,
    delete_file,
)
from website.settings import FIREBASE_API_KEY, STORAGE_BUCKET


# Maximum number of files that can be parsed in one request.
MAX_NUMBER_OF_FILES = 100

# Maximum file size for a single file.
MAX_FILE_SIZE = 1024 * 1000 * 100 # (100 MB)

# Specify file types.
FILE_TYPES = ['png', 'jpg', 'jpeg']

# Maximum number of observations that can be downloaded at once.
MAX_OBSERVATIONS_PER_FILE = 200_000

# API constants.
AI_MODEL = 'bud_spender'
COLLECTION = 'labels'


@api_view(['GET', 'POST', 'DELETE', 'OPTIONS'])
@csrf_exempt
def api_labels(request, label_id=None):
    """Manage label data (public API endpoint)."""

    # Authenticate the user.
    throttle = False
    claims = authenticate_request(request)
    total_cost = 0
    if not claims:
        uid = 'cannlytics'
        throttle = True
    else:
        uid = claims['uid']

    # Log the user ID and their level of support.
    support_level = claims.get('support_level', 'free')
    print('USER:', uid)
    print('SUPPORT LEVEL:', support_level)

    # Allow enterprise, pro, and premium users to query more than 1000.
    if support_level in ['enterprise', 'pro', 'premium']:
        throttle = False

    # Get previously parsed receipts.
    if request.method == 'GET':

        # Get a specific receipt.
        if label_id:
            ref = f'users/{uid}/{COLLECTION}/{label_id}'
            data = get_document(ref)
            response = {'success': True, 'data': data}
            return Response(response, status=200)

        # Query receipts.
        data, filters = [], []
        available_queries = [
            {
                'key': 'product_names',
                'operation': 'array_contains_any',
                'param': 'product_name',
            },
            {
                'key': 'product_types',
                'operation': 'array_contains_any',
                'param': 'product_type',
            },
            # {
            #     'key': 'date_sold',
            #     'operation': '>=',
            #     'param': 'date',
            # },
            # {
            #     'key': 'total_price',
            #     'operation': '>=',
            #     'param': 'price',
            # },
            # {
            #     'key': 'retailer_license_number',
            #     'operation': '==',
            #     'param': 'license',
            # },
            # {
            #     'key': 'invoice_number',
            #     'operation': '==',
            #     'param': 'number',
            # },
        ]
        params = request.query_params
        for query in available_queries:
            key = query['key']
            value = params.get(key)
            if value:
                filters.append({
                    'key': key,
                    'operation': params.get(key + '_op', query['operation']),
                    'value': value,
                })

        # Limit the number of observations.
        limit = int(params.get('limit', 1000))

        # Throttle the number of observations for free users.
        if throttle and limit > 1000:
            limit = 1000
        else:
            limit = params.get('limit')
        
        # Order the data.
        order_by = params.get('order_by', 'parsed_at')
        desc = params.get('desc', True)

        # Query documents.
        ref = f'users/{uid}/{COLLECTION}'
        data = get_collection(
            ref,
            desc=desc,
            filters=filters,
            limit=limit,
            order_by=order_by,
        )

        # Return the data.
        response = {'success': True, 'data': data}
        return Response(response, status=200)

    # Parse posted receipt images.
    if request.method == 'POST':

        # Get the user's level of support.
        user_subscription = get_document(f'subscribers/{uid}')
        current_tokens = user_subscription.get('tokens', 0) if user_subscription else 0
        if current_tokens < 1:
            message = 'You have 0 Cannlytics tokens. You need 1 token per parse. You can purchase more tokens at https://cannlytics.com/account/subscriptions.'
            print(message)
            response = {'success': False, 'message': message}
            return Response(response, status=402)
        
        # Get any user-posted files.
        images = []
        request_files = request.FILES.getlist('file')
        if request_files:
            print('POSTED FILES:', request_files)
            for image_file in request_files:
                filepath = process_file_or_url(
                    image_file,
                    max_file_size=MAX_FILE_SIZE,
                    file_types=FILE_TYPES,
                )
                if filepath:
                    images.append(filepath)

        # Get any user-posted URLs.
        try:
            urls = loads(request.body.decode('utf-8')).get('urls', [])
            print('POSTED URLS IN BODY:', urls)
        except:
            try:
                urls = request.data.get('urls', [])
                print('POSTED URLS IN DATA:', urls)
            except:
                urls = []

        # Process the URLs.
        for url in urls:
            filepath = process_file_or_url(url, is_url=True)
            if filepath:
                images.append(filepath)

        # Return an error if no PDFs or URLs are passed.
        if not images:
            message = 'Expecting request files. Valid file types are: %s' % ', '.join(FILE_TYPES)
            print(message)
            response = {'success': False, 'message': message}
            return Response(response, status=400)

        # Return an error if too many PDFs or URLs are passed.
        if len(images) > MAX_NUMBER_OF_FILES:
            message = f'Too many files, please limit your request to {MAX_NUMBER_OF_FILES} files at a time.'
            print(message)
            response = {'success': False, 'message': message}
            return Response(response, status=400)

        # Initialize OpenAI.
        openai_api_key = None
        try:
            _, project_id = google.auth.default()
            openai_api_key = access_secret_version(
                project_id=project_id,
                secret_id='OPENAI_API_KEY',
                version_id='latest',
            )
        except:
            try:
                openai_api_key = os.environ['OPENAI_API_KEY']
            except:
                # Load credentials from a local environment variables file if provided.
                from dotenv import dotenv_values
                env_file = os.path.join('../../', '.env')
                if os.path.isfile(env_file):
                    config = dotenv_values(env_file)
                    key = 'OPENAI_API_KEY'
                    os.environ[key] = config[key]

        # Return an error if OpenAI can't be initialized.
        if not openai_api_key:
            message = 'OpenAI API key not found.'
            print(message)
            response = {'success': False, 'message': message}
            return Response(response, status=400)

        # Parse the data.
        parser = LabelParser()
        data = []
        for image in images:

            # Parse the receipt.
            print('Parsing label:', image)
            # FIXME:
            try:
                extracted_data = parser.parse(
                    image,
                    openai_api_key=openai_api_key,
                    max_tokens=3333,
                    verbose=True,
                    user=uid,
                )
            except Exception as e:
                print('Error parsing label:', e)

            # Extract strain names from product names.
            strain_names = []
            for name in extracted_data.get('product_names', []):
                try:
                    print('Identifying strain:', name)
                    names = identify_strains(name, user=uid)
                    if names:
                        strain_names.extend(names)
                except Exception as e:
                    print('Error identifying strain:', e)
            
            # Add the strain names to the receipt data.
            extracted_data['strain_names'] = strain_names

            # Upload the temporary image file to Firebase Storage.
            ext = image.split('.').pop()
            doc_id = extracted_data['hash']
            ref = 'users/%s/%s/%s.%s' % (uid, COLLECTION, doc_id, ext)
            print('Uploading label:', doc_id)
            upload_file(
                destination_blob_name=ref,
                source_file_name=image,
                bucket_name=STORAGE_BUCKET
            )

            # Get download and short URLs.
            print('Getting download URL for receipt.')
            download_url = get_file_url(ref, bucket_name=STORAGE_BUCKET)
            print('Getting short URL for receipt.')
            short_url = create_short_url(
                api_key=FIREBASE_API_KEY,
                long_url=download_url,
                project_name=project_id,
            )
            extracted_data['file_ref'] = ref
            extracted_data['download_url'] = download_url
            extracted_data['short_url'] = short_url

            # Record the extracted data
            data.append(extracted_data)

            # Debit the tokens from the user's account.
            print('Debiting tokens from user account.')
            current_tokens -= 1
            increment_value(
                ref=f'subscribers/{uid}',
                field='tokens',
                amount=-1,
            )

            # Stop parsing if the user runs out of tokens.
            if current_tokens < 1:
                break

        # Record the cost and close the parser.
        total_cost = parser.total_cost
        parser.quit()

        # Create a usage log and save the user's results.
        changes, refs, docs = [], [], []
        for obs in data:
            doc_id = obs['hash']

            # Create entries for the user.
            if uid:
                refs.append(f'users/{uid}/{COLLECTION}/{doc_id}')
                docs.append(obs)

            # Create a log entry.
            changes.append(obs)
        
        # Create a usage log.
        create_log(
            f'logs/data/{COLLECTION}',
            claims=claims,
            action=f'Parsed {COLLECTION}.',
            log_type='data',
            key=f'api_{COLLECTION}',
            changes=changes
        )

        # Record costs for the admin and the user.
        timestamp = datetime.now().isoformat()
        doc_id = timestamp.replace(':', '-').replace('.', '-')
        refs.append(f'admin/ai/{AI_MODEL}_usage/{doc_id}')
        docs.append({
            'ai_model': AI_MODEL,
            'uid': uid,
            'timestamp': timestamp,
            'total_cost': total_cost,
            # 'prompts': all_prompts,
        })
        if claims:
            refs.append(f'users/{uid}/usage/{doc_id}')
            docs.append({
                'ai_model': AI_MODEL,
                'timestamp': timestamp,
                'total_cost': total_cost,
            })

        # Update the database.
        if refs:
            print('Updating the database...')
            update_documents(refs, docs)

        # Return the data.
        response = {'success': True, 'data': data}
        return Response(response, status=200)
    
    # Return the data.
    if request.method == 'DELETE':

        # Get the receipt ID.
        if not label_id:
            try:
                label_id = loads(request.body.decode('utf-8'))['label_id']
            except:
                message = 'Please provide a `label_id` in the URL or your request body.'
                response = {'success': False, message: message}
                return Response(response, status=200)
        
        # Delete the receipt data.
        ref = f'users/{uid}/{COLLECTION}/{label_id}'
        doc = get_document(ref)
        file_ref = doc.get('file_ref')
        delete_document(ref)

        # Delete the receipt file.
        if file_ref:
            delete_file(file_ref, bucket_name=STORAGE_BUCKET)

        # Return a success message.
        message = f'Label {label_id} deleted.'
        response = {'success': True, 'data': [], 'message': message}
        return Response(response, status=200)
