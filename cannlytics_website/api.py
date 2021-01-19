"""
API Functions | Cannlytics Website
Created: 1/5/2021
"""
import json
from datetime import datetime
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string
from utils.firebase import create_account, update_document


@csrf_exempt
def subscribe(request):
    """
    Subscribe a user to newsletters,
    sending them a notification with the ability to unsubscribe,
    and create a Cannlytics account if requested, sending
    a welcome email.
    """
    success = False
    data = json.loads(request.body)
    user_email = data["email"]
    try:
        validate_email(user_email)
    except ValidationError:
        pass # TODO: Handle invalid emails client-side?
    else:

        # Record subscription in Firestore.
        now = datetime.now()
        timestamp = now.strftime('%Y-%m-%d_%H-%M-%S')
        iso_time = now.isoformat()
        data["created_at"] = iso_time
        data["updated_at"] = iso_time
        update_document(f'subscribers/{timestamp}', data)

        # Send a welcome email.
        # template_url = "cannlytics_website/emails/newsletter_subscription_thank_you.html"
        send_mail(
            subject="Welcome to the Cannlytics Newsletter",
            message="Congratulations,\n\nWelcome to the Cannlytics newsletter. Please stay tuned for your material.\n\nAlways here to help,\nThe Cannlytics Team",
            from_email="contact@cannlytics.com",
            recipient_list=[user_email],
            fail_silently=False,
            # html_message = render_to_string(template_url, {'context': 'values'}) # TODO: Send HTML email
        )

        # Create an account if requested.
        if data.get("create_account"):
            name = (data.get("first_name", "") + data.get("last_name", "")).strip()
            _, password = create_account(name, user_email)
            send_mail(
                subject="Welcome to the Cannlytics Engine",
                message=f"Congratulations,\n\nYou can now login to the Cannlytics console (console.cannlytics.com) with the following credentials.\n\nEmail: {user_email}\nPassword: {password}\n\nAlways here to help,\nThe Cannlytics Team",
                from_email="contact@cannlytics.com",
                recipient_list=[user_email],
                fail_silently=False,
                # html_message = render_to_string(template_url, {'context': 'values'}) # TODO: Send HTML email
            )

        success = True
    return JsonResponse({"message": {"success": success}}, safe=False)

