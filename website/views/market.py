"""
Data Market Views | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 1/5/2021
Updated: 11/24/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
import os
from datetime import datetime
from json import loads
from tempfile import NamedTemporaryFile

# External imports
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from pandas import DataFrame

# Internal imports.
from cannlytics.firebase import (
    add_to_array,
    get_collection,
    update_document,
    upload_file,
    increment_value,
)
from cannlytics.data import market


@csrf_exempt
def publish_data(request):
    """Publish a dataset on the data market."""
    ocean = market.initialize_market()
    files = [
        {
            'index': 0,
            'contentType': 'text/text',
            'url': 'https://raw.githubusercontent.com/trentmc/branin/main/branin.arff'
        }
    ]
    data_token, asset = market.publish_data(
        ocean,
        os.environ('TEST_PRIVATE_KEY1'),
        files,
        'DataToken1',
        'DT1',
        'KLS',
        data_license='CC0: Public Domain',
    )
    # TODO: Keep track of data_token and asset on the data market?


@csrf_exempt
def sell_data(request):
    """Sell a dataset on the data market."""
    ocean = market.initialize_market()
    # TODO: Get the data token!!!
    data_token = None
    market.sell_data(
        ocean,
        os.environ('TEST_PRIVATE_KEY1'),
        data_token,
        100,
        fixed_price=True,
    )


@csrf_exempt
def buy_data(request):
    """Buy a dataset on the data market."""
    # TODO: Get the data token and asset!!!
    data_token, asset = None, None
    ocean = market.initialize_market()
    seller_wallet = market.get_wallet(
        ocean,
        os.environ('TEST_PRIVATE_KEY1')
    )
    market.buy_data(
        ocean,
        os.environ('TEST_PRIVATE_KEY2'),
        data_token.address,
        seller_wallet,
        min_amount=2,
        max_amount=5,
    )
    market.download_data(
        ocean,
        os.environ('TEST_PRIVATE_KEY2'),
        asset.did
    )
    # TODO: Facilitate the download for the user.


@csrf_exempt
def promotions(request):
    """Record a promotion, by getting promo code,
    finding any matching promotion document,
    and updating the views."""
    try:
        data = loads(request.body)
        promo_code = data['promo_code']
        matches = get_collection('promos/events/promo_stats', filters=[
            {'key': 'hash', 'operation': '>=', 'value': promo_code},
            {'key': 'hash', 'operation': '<=', 'value': '\uf8ff'},
        ])
        match = matches[0]
        promo_hash = match['hash']
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        increment_value(f'promos/events/promo_stats/{promo_hash}', 'views')
        add_to_array(f'promos/events/promo_stats/{promo_hash}', 'viewed_at', timestamp)
        # Optional: If user has an account,
        # record which user visited in viewed_by collection.
        return JsonResponse({'message': {'success': True}}, safe=False)
    except:
        return JsonResponse({'message': {'success': False}}, safe=False)


@csrf_exempt
def download_lab_data(request):
    """Download either a free or premium lab data set."""

    # Optional: Store allowed data points in Firebase?
    data_points = {
        'free': [
            'id',
            'name',
            'trade_name',
            'license',
            'license_url',
            'license_issue_date',
            'license_expiration_date',
            'status',
            'street',
            'city',
            'county',
            'state',
            'zip',
            'description',
        ],
        'premium': [
            'formatted_address',
            'timezone',
            'longitude',
            'latitude',
            'capacity',
            'square_feet',
            'brand_color',
            'favicon',
            'email',
            'phone',
            'website',
            'linkedin',
            'image_url',
            'opening_hours',
            'analyses',
        ],
    }

    # Get promo code for premium data.
    subscriber = {}
    tier = 'free'
    try:
        authorization = request.headers['Authorization']
        token = authorization.split(' ')[1]
        filters = [{'key': 'promo_code', 'operation': '==', 'value': token}]
        subscriber = get_collection('subscribers', filters=filters)[0]
        if subscriber:
            subscriber['subscriber_created_at'] = subscriber['created_at']
            subscriber['subscriber_updated_at'] = subscriber['updated_at']
            tier = 'premium'
    except:
        pass

    # Get lab data.
    labs = get_collection('labs', order_by='state')
    data = DataFrame.from_dict(labs, orient='columns')

    # Restrict data points.
    if tier == 'premium':
        data = data[data_points['free'] + data_points['premium']]
    else:
        data = data[data_points['free']]

    # Convert JSON to CSV.
    with NamedTemporaryFile(delete=False) as temp:
        temp_name = temp.name + '.csv'
        data.to_csv(temp_name, index=False)
        temp.close()

    # Post a copy of the data to Firebase storage.
    now = datetime.now()
    timestamp = now.strftime('%Y-%m-%d_%H-%M-%S')
    filename = f'labs_{timestamp}.csv'
    destination = 'public/data/downloads/'
    ref = destination + filename
    upload_file(ref, temp_name)

    # Create an activity log.
    log_entry = {
        'created_at': now.isoformat(),
        'updated_at': now.isoformat(),
        'data_points': len(data),
        'tier': tier,
        'filename': filename,
        'ref': ref,
    }
    log_entry = {**subscriber, **log_entry}
    update_document(f'logs/website/data_downloads/{timestamp}', log_entry)

    # Return the file to download.
    return FileResponse(open(temp_name, 'rb'), filename=filename)