"""
Decorators | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 11/24/2021
Updated: 11/24/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports.
import requests
from django.conf import settings
from functools import wraps

# FIXME: Fix or remove.
def check_recaptcha(view_func):
    """Check if a reCaptcha is valid."""
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        request.recaptcha_is_valid = None
        if request.method == "POST":
            recaptcha_response = request.POST.get("g-recaptcha-response")
            data = {
                "secret": settings.GOOGLE_RECAPTCHA_SECRET_KEY,
                "response": recaptcha_response,
            }
            response = requests.post(
                "https://www.google.com/recaptcha/api/siteverify", data=data
            )
            result = response.json()
            if result["success"]:
                request.recaptcha_is_valid = True
            else:
                request.recaptcha_is_valid = False
                # messages.error(request, "Invalid reCAPTCHA. Please try again.")
        return view_func(request, *args, **kwargs)

    return _wrapped_view
