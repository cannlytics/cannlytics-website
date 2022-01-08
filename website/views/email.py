"""
Email Views | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 8/22/2021
Updated: 1/7/2022
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports
from django.core.mail import send_mail
from django.http import JsonResponse

# Internal imports
from cannlytics.auth.auth import authenticate_request
from website.settings import DEFAULT_FROM_EMAIL, LIST_OF_EMAIL_RECIPIENTS


def send_message(request, *args, **argv): #pylint: disable=unused-argument
    """Send a message from the website to the Cannlytics admin through email.
    The user must be signed into their account to send a message. If the user
    does not send an authenticated request, then they are redirected to the
    sign-in page.
    """
    claims = authenticate_request(request)
    uid = claims.get('uid', 'User not signed in.')
    user_email = claims.get('email', 'User not signed in.')
    name = request.POST.get('name', claims.get('name', 'Unknown'))
    subject = request.POST.get('subject', 'Cannlytics Website Message')
    message = request.POST.get('message', 'No message body.')
    sender = request.POST.get('email', DEFAULT_FROM_EMAIL)
    recipients = LIST_OF_EMAIL_RECIPIENTS
    template = 'New message from the Cannlytics website:' \
               '\n\n{0}\n\nUser: {0}\nUser Email: {0}\n\nFrom,\n{0}'
    text = template.format(message, uid, user_email, name)
    send_mail(
        subject=subject.strip(),
        message=text,
        from_email=sender,
        recipient_list=recipients,
        fail_silently=False,
    )
    response = {'success': True, 'message': 'Message sent to admin.'}
    return JsonResponse(response)
