"""
Users Views | Cannlytics API
Copyright (c) 2021-2023 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 1/22/2021
Updated: 6/22/2023
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>

Description: API interface for Cannlytics users to manage their personal data.
"""
# Standard imports:
from json import loads

# External imports:
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Internal imports:
from website.auth import authenticate_request
from website.firebase import (
    create_log,
    get_document,
    update_document,
)


@api_view(['GET', 'POST'])
@csrf_exempt
def users(request):
    """Get, update, or create user's data."""

    # Authenticate the user.
    claims = authenticate_request(request)
    if not claims:
        return Response(
            {'success': False},
            content_type='application/json',
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Get the user's ID.
    uid = claims['uid']

    # Get the user's data.
    if request.method == 'GET':
        user_data = get_document(f'users/{uid}')
        response = {'success': True, 'data': user_data}
        return Response(response, content_type='application/json')

    # Update a user's data.
    if request.method == 'POST':
        try:

            # Edit user data if a 'POST' request.
            post_data = loads(request.body.decode('utf-8'))
            doc_id = f'users/{uid}'
            update_document(doc_id, post_data)
            user_data = get_document(doc_id)
            create_log(
                ref=f'users/{uid}/logs',
                claims=claims,
                action='Updated user data.',
                log_type='users',
                key='user_data',
                changes=[post_data]
            )
            response = {'success': True, 'data': user_data}
            return Response(response, content_type='application/json')

        except:
            return Response(
                {'success': False},
                content_type='application/json',
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
