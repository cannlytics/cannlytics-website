"""
Data Market Views | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 1/5/2021
Updated: 1/5/2022
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
# import os
from datetime import datetime
from json import loads

# External imports
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.http import FileResponse
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

# Internal imports.
from cannlytics.auth.auth import authenticate_request
from cannlytics.firebase import (
    add_to_array,
    create_log,
    get_collection,
    get_document,
    increment_value,
    update_document,
)
# from cannlytics.data import market
# from cannlytics.paypal import (
#     cancel_paypal_subscription,
#     get_paypal_access_token,
# )
from website.views.mixins import BaseMixin


class DatasetView(BaseMixin, TemplateView):
    """Dataset page."""

    def get_template_names(self):
        return ['website/pages/data/dataset.html']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Get PayPal credentials.
        context['paypal'] = get_document('credentials/paypal')

        # FIXME: Get a dataset.
        # dataset_id = self.kwargs.get('dataset_id', '')
        # if dataset_id:
        #     context['dataset'] = get_document(f'public/data/datasets/{dataset_id}')
        context['dataset'] = {
            "access_type": "token",
            "algorithm_url": "https://github.com/cannlytics/cannlytics-ai",
            "data_guide_url": "",
            "data_sources": [],
            "description": "Washington State lab results combined with licensee, inventory, and strain data.",
            "doc": "datasets/WA/augmented-washington-state-lab-results",
            "file_size": "166 MB",
            "file_size_bytes": "",
            "file_types": [".csv", ".xlsx", ".json"],
            "id": "augmented-washington-state-lab-results",
            "image_ref": "public/images/datasets/augmented-washington-state-lab-results/washington-state-flag.svg",
            "image_url": "https://storage.googleapis.com/cannlytics.appspot.com/public/images/datasets/augmented-washington-state-lab-results/washington-state-flag.svg?Expires=4796621027&GoogleAccessId=firebase-adminsdk-e6c0x%40cannlytics.iam.gserviceaccount.com&Signature=PW0eZP%2BYVuQ80kBCO27XQcAeIB1AYd2VhdveALCDOgUwWklp7ay%2BANh4o%2FdF%2BIuNdg0Ip2ISB23BWRvSZ3DoYQqcboINzecKW8417%2FJ5314rJh9aC%2FYpSHSSH7njunPWBe2tLLwQAGAt4TcmNG1T%2FaLHZP2b86OPYIPVoVsiTS9JMS%2BY1zYmK9k7Ht0wbAo0LxoqcnGSBN0hlxecLCTvvsvfaCqdBwdp1AaxOXEUl5n%2F7eeUQFaEPJVXVSsG5qJCwd7tiPrLh7H6WBXBTR2tl44a0dTEcmbeCaY%2BiJc8kjJ8AR7GZlAgvrC0s%2Bd4lbrtcu%2BiGwkBb4sgOJQmcXcd0g%3D%3D",
            "license": "CC BY-SA 3.0",
            "license_url": "https://creativecommons.org/licenses/by-sa/3.0/",
            "name": "Augmented Washington State Lab Results",
            "new": True,
            "number_of_downloads": 1,
            "number_of_fields": 56,
            "number_of_observations": 2000000,
            "price_usd": "$499",
            "price_usd_students": "$99",
            "published_at": "2022-01-20",
            "published_at_formatted": "January 20, 2022",
            "published_by": "Cannlytics",
            "published_by_url": "https://cannlytics.com",
            "sample_file_name": "",
            "sample_file_url": "",
            "tags": ["leaf-data-systems", "lab-results", "inventory", "strains", "licensees", "labs"],
            "time_period_start": "",
            "time_period_end": "",
            "updated_at": "",
            "updated_at_formatted": "",
            "url": "https://cannlyitcs.com/data/market/augmented-washington-state-lab-results",
            "short_url": "",
            "value_generated_usd": 499
        }

        return context


@csrf_exempt
def buy_data(request):
    """Facilitate the purchase of a dataset on the data market."""

    # Ensure that the user has a valid email.
    data = loads(request.body)
    try:
        user_email = data['email']
        validate_email(user_email)
    except ValidationError:
        response = {'success': False, 'message': 'Invalid email in request body.'}
        return JsonResponse(response)
    
    # TODO: Check if the payment ID is valid.

    # Create a promo code that can be used to download data.
    # promo_code = get_promo_code(8)
    # add_to_array('promos/data', 'promo_codes', promo_code)

    # Record the subscription in Firestore.
    now = datetime.now()
    iso_time = now.isoformat()
    data['created_at'] = iso_time
    data['updated_at'] = iso_time
    # data['promo_code'] = promo_code
    # update_document(f'subscribers/{user_email}', data)

    # Save the user's subscription.
    plan_name = data['plan_name']
    try:
        claims = authenticate_request(request)
        uid = claims['uid']
        # TODO: Keep track of a user's downloaded ata.
        # user_data = {'support': True}
        # if plan_name == 'newsletter':
        #     user_data['newsletter'] = True
        # else:
        #     user_data[f'{plan_name}_subscription_id'] = data['id']
        # update_document(f'users/{uid}', user_data)
    except KeyError:
        pass

    # Optional: Email the data to the user.
    # Optional: Load messages from state?
    # try:
    #     name = (data.get('first_name', '') + data.get('last_name', '')).strip()
    #     _, password = create_user(name, user_email)
    #     message = f'Congratulations,\n\nYou can now login to the Cannlytics console (https://console.cannlytics.com) with the following credentials.\n\nEmail: {user_email}\nPassword: {password}\n\nAlways here to help,\nThe Cannlytics Team' #pylint: disable=line-too-long
    #     subject = 'Welcome to the Cannlytics Platform'
    # except:
    #     message = f'Congratulations,\n\nYou are now subscribed to Cannlytics.\n\nPlease stay tuned for more material or email {DEFAULT_FROM_EMAIL} to begin.\n\nAlways here to help,\nThe Cannlytics Team' #pylint: disable=line-too-long
    #     subject = 'Welcome to the Cannlytics Newsletter'
    # # (Optional: Use HTML template.)
    # # template_url = 'website/emails/newsletter_subscription_thank_you.html'
    # send_mail(
    #     subject=subject,
    #     message=message,
    #     from_email=DEFAULT_FROM_EMAIL,
    #     recipient_list=[user_email],
    #     fail_silently=False,
    #     # html_message = render_to_string(template_url, {'context': 'values'})
    # )

    # Create an activity log.
    create_log(
        ref='logs/website/payments',
        claims=claims,
        action=f'User ({user_email}) bought a dataset.',
        log_type='market',
        key='buy_data',
        changes=data,
    )

    # TODO: Get the dataset.
    filename = ''
    datafile = ''

    # Return the file to download.
    return FileResponse(open(datafile, 'rb'), filename=filename)


# TODO: Implement blockchain market.

# @csrf_exempt
# def publish_data(request):
#     """Publish a dataset on the data market."""
#     ocean = market.initialize_market()
#     files = [
#         {
#             'index': 0,
#             'contentType': 'text/text',
#             'url': 'https://raw.githubusercontent.com/trentmc/branin/main/branin.arff'
#         }
#     ]
#     data_token, asset = market.publish_data(
#         ocean,
#         os.environ('TEST_PRIVATE_KEY1'),
#         files,
#         'DataToken1',
#         'DT1',
#         'KLS',
#         data_license='CC0: Public Domain',
#     )
#     # TODO: Keep track of data_token and asset on the data market?


# @csrf_exempt
# def sell_data(request):
#     """Sell a dataset on the data market."""
#     ocean = market.initialize_market()
#     # TODO: Get the data token!!!
#     data_token = None
#     market.sell_data(
#         ocean,
#         os.environ('TEST_PRIVATE_KEY1'),
#         data_token,
#         100,
#         fixed_price=True,
#     )


# @csrf_exempt
# def buy_data(request):
#     """Buy a dataset on the data market."""
#     # TODO: Get the data token and asset!!!
#     data_token, asset = None, None
#     ocean = market.initialize_market()
#     seller_wallet = market.get_wallet(
#         ocean,
#         os.environ('TEST_PRIVATE_KEY1')
#     )
#     market.buy_data(
#         ocean,
#         os.environ('TEST_PRIVATE_KEY2'),
#         data_token.address,
#         seller_wallet,
#         min_amount=2,
#         max_amount=5,
#     )
#     market.download_data(
#         ocean,
#         os.environ('TEST_PRIVATE_KEY2'),
#         asset.did
#     )
#     # TODO: Facilitate the download for the user.


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
