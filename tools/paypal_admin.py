"""
PayPal Subscription Management
Copyright (c) 2021 Cannlytics

Author: Keegan Skeate
Contact: <keegan@cannlytics.com>
Created: 11/29/2021
Updated: 11/29/2021
License: MIT License <https://opensource.org/licenses/MIT>
"""
import environ
import requests

# API defaults.
BASE = 'https://api-m.paypal.com'
HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'en_US',
}


def cancel_paypal_subscription(
        access_token,
        subscription_id,
        reason='No reason provided.',
        base = 'https://api-m.paypal.com',
):
    """Cancel a PayPal subscription for an individual subscriber.
    Args:
        access_token (str): A required access token.
        subscription_id (str): A specific subscription ID.
        reason (str): The reason for cancellation.
        base (str): The base API URL, with the live URL as the default.
    Returns:
        (bool): An indicator if cancellation was successful.
    """
    url = f'{base}/v1/billing/subscriptions/{subscription_id}/cancel'
    authorization = {'Authorization': f'Bearer {access_token}'}
    headers = {**HEADERS, **authorization}
    data = {'reason': reason}
    response = requests.post(url, data=data, headers=headers)
    if response.status_code == 200:
        return True
    else:
        return False


def get_paypal_access_token(
        client_id,
        secret,
        base='https://api-m.paypal.com'
):
    """Get a PayPal access token.
    Args:
        client_id (str): Your PayPal client ID.
        secret (str): Your PayPal secret.
        base (str): The base API URL, with the live URL as the default.
    Returns:
        (str): The PayPal access token.
    """
    data = {'grant_type': 'client_credentials'}
    url = f'{base}/v1/oauth2/token'
    auth = (client_id, secret)
    response = requests.post(url, data=data, headers=HEADERS, auth=auth)
    body = response.json()
    return body['access_token']


def get_paypal_subscription_plans(
        access_token,
        product_id=None,
        page=None,
        page_size=None,
        total_required=True,
        base='https://api-m.paypal.com',
):
    """Get PayPal subscription plans.
    Args:
        access_token (str): A required access token.
        product_id (str): A specific subscription plan ID.
        page (int): The page at which to begin listing.
        page_size (int): The number of entries per page.
        total_required (bool): Whether or not to return the total.
        base (str): The base API URL,
            with the live URL as the default.
    Returns:
        (list): A list of PayPal subscriptions.    
    """
    url = f'{base}/v1/billing/plans'
    params = {
        'product_id': product_id,
        'page': page,
        'page_size': page_size,
        'total_required': total_required,
    }
    authorization = {'Authorization': f'Bearer {access_token}'}
    headers = {**HEADERS, **authorization}
    response = requests.get(url, params=params, headers=headers)
    body = response.json()
    return body['plans']


if __name__ == '__main__':

    # Get a PayPal access token.
    env = environ.Env()
    env.read_env('../.env')
    client_id = env('PAYPAL_CLIENT_ID')
    secret = env('PAYPAL_SECRET')
    access_token = get_paypal_access_token(client_id, secret)

    # Get all subscription plans.
    plans = get_paypal_subscription_plans(access_token)

    # UNTESTED: Cancel an individual subscription.
    # cancel_paypal_subscription(
    #     access_token,
    #     '<individual-subscription-id>',
    #     reason='Need to save funds.'
    # )
