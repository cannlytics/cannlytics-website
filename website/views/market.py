"""
Data Market Views | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 1/5/2021
Updated: 1/5/2022
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
import os
from datetime import datetime
from json import loads

# External imports
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Internal imports.
from cannlytics.firebase import (
    add_to_array,
    get_collection,
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
        return JsonResponse({'message': {'success': True}})
    except:
        return JsonResponse({'message': {'success': False}})
