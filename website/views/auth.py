"""
Authentication Views | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/18/2020
Updated: 11/24/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports.
from datetime import datetime
from json import loads

# External imports.
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.http import JsonResponse

# Internal imports.
from cannlytics.auth.auth import authenticate_request
from cannlytics.firebase import (
    add_to_array,
    create_log,
    create_session_cookie,
    create_user,
    initialize_firebase,
    revoke_refresh_tokens,
    update_document,
    verify_token,
)
from website.settings import DEFAULT_FROM_EMAIL, SESSION_COOKIE_AGE
from website.utils.utils import get_promo_code


def login(request, *args, **argv): #pylint: disable=unused-argument
    """Functional view to create a user session."""
    try:

        # Ensure that the user passed an authorization bearer token.
        authorization = request.headers.get('Authorization')
        token = authorization.split(' ').pop()
        if not token:
            message = 'Authorization token not provided in the request header.'
            return JsonResponse({'success': False, 'message': message}, status=401)

        # Initialize Firebase and verify the Firebase ID token.
        initialize_firebase()
        claims = verify_token(token)
        uid = claims['uid']

        # Create and set a session cookie in the response.
        cache = f'public, max-age={SESSION_COOKIE_AGE}, s-maxage={SESSION_COOKIE_AGE}'
        session_cookie = create_session_cookie(token)
        response = JsonResponse({'success': True}, status=200)
        response['Cache-Control'] = cache
        response['Set-Cookie'] = f'__session={session_cookie}; Path=/'

        # Also save the session cookie in the session.
        # Note: The session is preferred over cookies,
        # but cookies are currently needed for production.
        request.session['__session'] = session_cookie

        # Log the login and update the user as signed-in.
        update_document(f'users/{uid}', {'signed_in': True})
        create_log(
            ref=f'users/{uid}/logs',
            claims=claims,
            action='Signed in.',
            log_type='auth',
            key='login'
        )
        return response

    except:
        message = f'Authorization failed in entirety. Please contact {DEFAULT_FROM_EMAIL}'
        return JsonResponse({'success': False, 'message': message}, status=401)


def logout(request, *args, **argv): #pylint: disable=unused-argument
    """Functional view to remove a user session."""
    try:
        claims = authenticate_request(request)
        uid = claims['uid']
        update_document(f'users/{uid}', {'signed_in': False})
        create_log(
            ref=f'users/{uid}/logs',
            claims=claims,
            action='Signed out.',
            log_type='auth',
            key='logout'
        )
        revoke_refresh_tokens(claims['sub'])
        response = JsonResponse({'success': True}, status=200)
        response['Set-Cookie'] = '__session=None; Path=/'
        response['Cache-Control'] = 'public, max-age=300, s-maxage=900'
        request.session['__session'] = ''
        return response
    except:
        response = JsonResponse({'success': False}, status=205)
        response['Set-Cookie'] = '__session=None; Path=/'
        response['Cache-Control'] = 'public, max-age=300, s-maxage=900'
        request.session['__session'] = ''
        return response


def subscribe(request):
    """
    Subscribe a user to newsletters,
    sending them a notification with the ability to unsubscribe,
    and create a Cannlytics account if requested, sending a welcome email.
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

    # Send a welcome email. (Optional: Use HTML template.)
    # template_url = 'website/emails/newsletter_subscription_thank_you.html'
    # Create an account if one does not exist.
    # TODO: Load messages from state?
    try:
        name = (data.get('first_name', '') + data.get('last_name', '')).strip()
        _, password = create_user(name, user_email)
        send_mail(
            subject='Welcome to the Cannlytics Platform',
            message=f'Congratulations,\n\nYou can now login to the Cannlytics console (https://console.cannlytics.com) with the following credentials.\n\nEmail: {user_email}\nPassword: {password}\n\nAlways here to help,\nThe Cannlytics Team',
            from_email=DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
            # html_message = render_to_string(template_url, {'context': 'values'}) # Optional: Send HTML email
        )
    except:
        send_mail(
            subject='Welcome to the Cannlytics Newsletter',
            message=f'Congratulations,\n\nWelcome to the Cannlytics newsletter. You can download data with the promo code:\n\n{promo_code}\n\nPlease stay tuned for more material.\n\nAlways here to help,\nThe Cannlytics Team',
            from_email=DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=False,
            # html_message = render_to_string(template_url, {'context': 'values'}) # Optional: Send HTML email
        )

    # Return a success message.
    response = {'success': True, 'message': 'User successfully subscribed.'}
    return JsonResponse(response, safe=False)
