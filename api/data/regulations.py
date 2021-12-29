"""
Regulation Data Endpoints | Cannlytics API
Copyright (c) Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 4/21/2021
Updated: 7/31/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>

Description: API endpoints to interface with regulation data.
"""

# Standard imports
from datetime import datetime

# External imports
from django.template.defaultfilters import slugify
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Internal imports
from api.auth import auth
from cannlytics.firebase import (
    get_collection,
    get_document,
    update_document,
)


# TODO: Given a sample type and state, return the required analyses.


@api_view(['GET'])
def regulations(request, format=None):
    """Get regulation information."""
    message = f'Get information about regulations on a state-by-state basis.'
    return Response({'message': message}, content_type='application/json')


# @api_view(['GET', 'POST'])
# def regulations(request, format=None):
#     """Get, create, or update information about cannabis regulations."""

#     if request.method == 'GET':
#         return Response({'error': 'not_implemented'}, content_type='application/json')

#     elif request.method == 'POST':

#         return Response({'error': 'not_implemented'}, content_type='application/json')

#         # Return an error if no author is specified.
#         # error_message = 'Unknown error, please notify <support@cannlytics.com>'
#         # return Response(
#         #     {'error': error_message},
#         #     content_type='application/json',
#         #     status=status.HTTP_400_BAD_REQUEST
#         # )
