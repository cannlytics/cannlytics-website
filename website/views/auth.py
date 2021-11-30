"""
Authentication Views | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/18/2020
Updated: 11/24/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports
from django.http import HttpResponse, JsonResponse
from django.views.generic.base import TemplateView

# Internal imports
from cannlytics.firebase import (
    create_log,
    create_session_cookie,
    initialize_firebase,
    update_document,
    revoke_refresh_tokens,
    verify_session_cookie,
    verify_token,
)
from website.settings import SESSION_COOKIE_AGE


def login(request, *args, **argv): #pylint: disable=unused-argument
    """Functional view to create a user session.
    Optional: Ensure that the request succeeds on the client!
    """
    try:

        # Get the bearer token.
        authorization = request.headers.get('Authorization', '')
        token = authorization.split(' ').pop()
        if not token:
            message = 'Authorization token not provided in the request header.'
            return JsonResponse({'error': True, 'message': message}, status=401)

        # Initialize Firebase.
        initialize_firebase()

        # Set the session cookie in a cookie in the response.
        response = JsonResponse({'success': True}, status=200)
        session_cookie = create_session_cookie(token)
        response['Set-Cookie'] = f'__session={session_cookie}; Path=/'
        response['Cache-Control'] = f'public, max-age={SESSION_COOKIE_AGE}, s-maxage={SESSION_COOKIE_AGE}'

        # Save the session cookie in the session.
        # This method is preferred over cookies (but cookies are still needed for production).
        request.session['__session'] = session_cookie

        # Verify the user, create a log, update the user as signed-in,
        # and return a response with the session cookie.
        claims = verify_token(token)
        uid = claims['uid']
        create_log(
            ref=f'users/{uid}/logs',
            claims=claims,
            action='Signed in.',
            log_type='auth',
            key='login'
        )
        update_document(f'users/{uid}', {'signed_in': True})
        return response
    except:
        message = 'Authorization failed in entirety. Please contact support.'
        return JsonResponse({'error': True, 'message': message}, status=401)


def logout(request, *args, **argv): #pylint: disable=unused-argument
    """Functional view to remove a user session.
    FIXME: Does not appear to delete the user's session!
    """
    try:
        print('Signing user out.')
        session_cookie = request.COOKIES.get('__session')
        if session_cookie is None:
            session_cookie = request.session['__session']
        claims = verify_session_cookie(session_cookie)
        uid = claims['uid']
        create_log(
            ref=f'users/{uid}/logs',
            claims=claims,
            action='Signed out.',
            log_type='auth',
            key='logout'
        )
        update_document(f'users/{uid}', {'signed_in': False})
        revoke_refresh_tokens(claims['sub'])
        # request.session['__session'] = ''
        response = HttpResponse(status=205)
        # response = JsonResponse({'success': True}, status=205)
        response['Set-Cookie'] = '__session=None; Path=/'
        response['Cache-Control'] = 'public, max-age=300, s-maxage=900'
        return response
    except:
        # request.session['__session'] = ''
        response = HttpResponse(status=205)
        # response = JsonResponse({'success': True}, status=205)
        response['Set-Cookie'] = '__session=None; Path=/'
        response['Cache-Control'] = 'public, max-age=300, s-maxage=900'
        return response


def subscribe(request):
    """
    Subscribe a user to newsletters,
    sending them a notification with the ability to unsubscribe,
    and create a Cannlytics account if requested, sending a welcome email.
    FIXME: Refactor.
    """
    success = False
    data = loads(request.body)
    user_email = data['email']
    try:
        validate_email(user_email)
    except ValidationError:
        pass # Optional: Handle invalid emails client-side?
    else:

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
        try:
            name = (data.get('first_name', '') + data.get('last_name', '')).strip()
            _, password = create_user(name, user_email)
            send_mail(
                subject='Welcome to the Cannlytics Platform',
                message=f'Congratulations,\n\nYou can now login to the Cannlytics console (console.cannlytics.com) with the following credentials.\n\nEmail: {user_email}\nPassword: {password}\n\nAlways here to help,\nThe Cannlytics Team',
                from_email='contact@cannlytics.com',
                recipient_list=[user_email],
                fail_silently=False,
                # html_message = render_to_string(template_url, {'context': 'values'}) # Optional: Send HTML email
            )
        except:
            send_mail(
                subject='Welcome to the Cannlytics Newsletter',
                message=f'Congratulations,\n\nWelcome to the Cannlytics newsletter. You can download data with the promo code:\n\n{promo_code}\n\nPlease stay tuned for more material.\n\nAlways here to help,\nThe Cannlytics Team',
                from_email='contact@cannlytics.com',
                recipient_list=[user_email],
                fail_silently=False,
                # html_message = render_to_string(template_url, {'context': 'values'}) # Optional: Send HTML email
            )

        success = True
    return JsonResponse({'message': {'success': success}}, safe=False)
