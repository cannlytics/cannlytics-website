"""
API Utils | Cannlytics API
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 9/25/2024
Updated: 9/30/2024
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>
"""
# Standard imports:
from datetime import datetime
from json import loads
import os
import tempfile
from urllib.parse import urlparse

# External imports:
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import google.auth
import requests
from rest_framework.decorators import api_view
import pandas as pd
from rest_framework.response import Response
import requests
from website.auth import authenticate_request
from website.settings import FIREBASE_API_KEY, STORAGE_BUCKET

# Internal imports:
from cannlytics.firebase import (
    create_log,
    create_short_url,
    get_file_url,
    upload_file,
)

# Maximum file size for a single file.
MAX_FILE_SIZE = 1024 * 1000 * 100 # (100 MB)

# Specify file types.
FILE_TYPES = ['png', 'jpg', 'jpeg']

# Maximum number of observations that can be downloaded at once.
MAX_OBSERVATIONS_PER_FILE = 200_000



def process_file_or_url(
        source,
        is_url=False,
        default_ext='jpg',
        max_file_size=None,
        file_types=None,
    ):
    """Process a file or URL and return the filepath.
    Args:
        source: The file or URL to process.
        is_url: Whether the source is a URL that needs to be downloaded.
        default_ext: The default extension if the file type is not known.
        max_file_size: The maximum file size in bytes.
        file_types: The valid file types.
    """
    # Read the file.
    if is_url:
        parsed_url = urlparse(source)
        base_name = os.path.basename(parsed_url.path)
        ext = os.path.splitext(base_name)[1].lstrip('.')
        if not ext: ext = default_ext
        response = requests.get(source)
        if response.status_code != 200:
            print(f"Failed to download {source}")
            return None
        file_content = response.content
    else:
        ext: str = source.name.split('.').pop()
        file_content = source.read()

    # Reject files that are too large.
    if max_file_size:
        if len(file_content) >= max_file_size:
            message = 'File too large. The maximum number of bytes is %i.' % max_file_size
            response = {'error': True, 'message': message}
            return JsonResponse(response, status=406)

    # Reject files that are not of valid types.
    if file_types:
        if ext.lower() not in file_types:
            message = 'Invalid file type. Valid file types are: %s' % ', '.join(file_types)
            response = {'error': True, 'message': message}
            return JsonResponse(response, status=406)

    # Save the file as a temp file for parsing.
    temp = tempfile.mkstemp(f'.{ext}')
    with os.fdopen(temp[0], 'wb') as temp_file:
        temp_file.write(file_content)
    return temp[1]


@api_view(['POST'])
@csrf_exempt
def download_user_data(request, data_type=None):
    """Download requested user data as a .xlsx file. Pass a `data` field in the
    body with the data, an object or an array of objects, to standardize
    and save in a workbook."""

    # Authenticate the user, throttle requests if unauthenticated.
    # TODO: Implement throttling if needed.
    throttle = False
    claims = authenticate_request(request)
    if not claims:
        uid = 'cannlytics'
        public, throttle = True, True
    else:
        uid = claims['uid']

    # Read the posted data.
    try:
        body = loads(request.body.decode('utf-8'))
        data = body['data']
    except:
        try:
            data = request.data.get('data', [])
        except:
            data = []

    # Handle no observations.
    if not data:
        message = f'No data, please post your data in a `data` field in the request body.'
        print(message)
        response = Response({'error': True, 'message': message}, status=401)
        response['Access-Control-Allow-Origin'] = '*'
        return response

    # Handle too many observations.
    if len(data) > MAX_OBSERVATIONS_PER_FILE:
        message = f'Too many observations, please limit your request to {MAX_OBSERVATIONS_PER_FILE} observations at a time.'
        print(message)
        response = {'success': False, 'message': message}
        return Response(response, status=401)
    
    # Specify the filename.
    timestamp = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
    filename = f'{data_type}-data-{timestamp}.xlsx'

    # Save a temporary workbook.
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as temp:
        pd.DataFrame(data).to_excel(temp.name, index=False, sheet_name='Data')

    # Upload the file to Firebase Storage.
    ref = 'users/%s/%s/%s' % (uid, data_type, filename)
    _, project_id = google.auth.default()
    upload_file(
        destination_blob_name=ref,
        source_file_name=temp.name,
        bucket_name=STORAGE_BUCKET
    )

    # Get download and short URLs.
    download_url = get_file_url(ref, bucket_name=STORAGE_BUCKET)
    short_url = create_short_url(
        api_key=FIREBASE_API_KEY,
        long_url=download_url,
        project_name=project_id
    )
    data = {
        'filename': filename,
        'file_ref': ref,
        'download_url': download_url,
        'short_url': short_url,
    }

    # Log the download.
    count = len(data)
    create_log(
        f'users/{uid}/downloads',
        claims=claims,
        action=f'Downloaded {count} {data_type}.',
        log_type='data',
        key='download_user_data',
        changes=[data]
    )

    # Delete the temporary file and return the data.
    os.unlink(temp.name)
    response = {'success': True, 'data': data}
    return Response(response, status=200)
