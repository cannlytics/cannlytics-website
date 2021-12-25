"""
Context Processors | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 4/26/2021
Updated: 12/14/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# External imports.
from django.conf import settings


def selected_settings(request): #pylint: disable=unused-argument
    """Include relevant settings in a view's context."""
    return {
        'APP_VERSION_NUMBER': settings.APP_VERSION_NUMBER,
        'DEBUG': settings.DEBUG,
    }
