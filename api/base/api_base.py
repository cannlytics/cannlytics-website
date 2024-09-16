"""
Base API Views | Cannlytics API
Copyright (c) 2021-2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 12/6/2021
Updated: 9/15/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>

Description: API endpoint base URLs to provide user's with information about
how to use the API in aims for the Cannlytics API to be self-discoverable.
"""
# External imports:
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Internal imports:
from website.settings import APP_VERSION_NUMBER


# Define API constants.
BASE = 'https://cannlytics.com/api'


@api_view(['GET'])
@csrf_exempt
def index(request, format=None):
    """Informational base endpoint."""
    message = f'Welcome to the Cannlytics API (v{APP_VERSION_NUMBER}).'
    message +=' Get an API key at https://cannlytics.com/account/api-keys to begin.'
    return Response({'message': message}, content_type='application/json')
