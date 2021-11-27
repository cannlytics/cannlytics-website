"""
Email Views | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 8/22/2021
Updated: 8/22/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports
from django.core.mail import send_mail
from django.shortcuts import redirect

# Internal imports
from website.settings import (
    DEFAULT_FROM_EMAIL,
    LIST_OF_EMAIL_RECIPIENTS,
)

def send_message(request, *args, **argv): #pylint: disable=unused-argument
    """Send a message from the website to the Cannlytics admin with email."""
    name = request.POST.get('name')
    subject = request.POST.get('subject')
    message = request.POST.get('message')
    sender = request.POST.get('email')
    recipients = LIST_OF_EMAIL_RECIPIENTS
    if not sender:
        sender = DEFAULT_FROM_EMAIL
    text = 'New message from the Cannlytics website:'
    text += '\n\n{0}'.format(message)
    if name is not None:
        text += '\n\nFrom,\n' + str(name)
    # send_mail(
    #     subject=subject.strip(),
    #     message=text,
    #     from_email=sender,
    #     recipient_list=recipients,
    #     fail_silently=False,
    # )
    return redirect('/contact/thank-you/')
