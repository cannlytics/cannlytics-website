"""
Subscription Views | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 1/5/2021
Updated: 11/24/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
from datetime import datetime
from json import loads

# External imports
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from cannlytics.auth.auth import authenticate_request

# Internal imports.
from cannlytics.firebase import (
    add_to_array,
    create_user,
    get_document,
    update_document,
)
from website.settings import DEFAULT_FROM_EMAIL
from website.utils.utils import get_promo_code


def subscribe(request):
    """Subscribe a user to newsletters, sending them a notification with the
    ability to unsubscribe. Creates a Cannlytics account and sends a welcome
    email if the user does not have an account yet.
    """

    # Ensure that the user has a valid email.
    data = loads(request.body)
    try:
        user_email = data['email']
        validate_email(user_email)
    except ValidationError:
        response = {'success': False, 'message': 'Invalid email in request body.'}
        return JsonResponse(response, safe=False)

    # Create a promo code that can be used to download data.
    promo_code = get_promo_code(8)
    add_to_array('promos/data', 'promo_codes', promo_code)

    # Record subscription in Firestore.
    now = datetime.now()
    timestamp = now.strftime('%Y-%m-%d_%H-%M-%S')
    iso_time = now.isoformat()
    data['created_at'] = iso_time
    data['updated_at'] = iso_time
    data['promo_code'] = promo_code
    update_document(f'subscribers/{timestamp}', data)

    # Create an account if one does not exist.
    # Optional: Load messages from state?
    try:
        name = (data.get('first_name', '') + data.get('last_name', '')).strip()
        _, password = create_user(name, user_email)
        message = f'Congratulations,\n\nYou can now login to the Cannlytics console (https://console.cannlytics.com) with the following credentials.\n\nEmail: {user_email}\nPassword: {password}\n\nAlways here to help,\nThe Cannlytics Team' #pylint: disable=line-too-long
        subject = 'Welcome to the Cannlytics Platform'
    except:
        message = f'Congratulations,\n\nWelcome to the Cannlytics newsletter. You can download data with the promo code:\n\n{promo_code}\n\nPlease stay tuned for more material.\n\nAlways here to help,\nThe Cannlytics Team' #pylint: disable=line-too-long
        subject = 'Welcome to the Cannlytics Newsletter'

    # Send a welcome / thank you email.
    # (Optional: Use HTML template.)
    # template_url = 'website/emails/newsletter_subscription_thank_you.html'
    send_mail(
        subject=subject,
        message=message,
        from_email=DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
        # html_message = render_to_string(template_url, {'context': 'values'})
    )

    # Return a success message.
    response = {'success': True, 'message': 'User successfully subscribed.'}
    return JsonResponse(response, safe=False)


@api_view(['GET'])
def get_user_subscriptions(request):
    """Get a user's subscriptions."""
    claims = authenticate_request(request)
    try:
        user_id = claims['uid']
        subscriptions = get_document(f'subscribers/{user_id}')
        response = {'success': True, 'data': subscriptions}
        return Response(response, content_type='application/json')
    except KeyError:
        response = {'success': False, 'message': 'Invalid authentication.'}
        return Response(response, content_type='application/json')
