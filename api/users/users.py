"""
Users Views | Cannlytics API
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 1/22/2021
Updated: 12/13/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>

Description: API interface for Cannlytics users to manage their personal data.
"""
# External imports.
from json import loads
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Internal imports.
from api.auth.auth import authenticate_request
from cannlytics.firebase import (
    create_log,
    get_document,
    update_document,
)
from cannlytics.utils import utils


@api_view(['GET', 'POST'])
def users(request):
    """Get, update, or create user's data."""
    print('Request to users endpoint!')
    try:

        # Authenticate the user.
        claims = authenticate_request(request)
        uid = claims['uid']

        # Get the user's data.
        if request.method == 'GET':
            user_data = get_document(f'users/{uid}')
            return Response(user_data, content_type='application/json')

        # Edit user data if a 'POST' request.
        else:

            # Get the user's new data.
            post_data = loads(request.body.decode('utf-8'))
            post_data['uid'] = uid

            # Update the user's data, create a log, and return the data.
            try:
                update_document(f'users/{uid}', post_data)
                create_log(
                    ref=f'users/{uid}/logs',
                    claims=claims,
                    action='Updated user data.',
                    log_type='users',
                    key='user_data',
                    changes=[post_data]
                )
                return Response(post_data, content_type='application/json')

            except:

                # Optional: Create random hash inspired user image?

                # Create the user's data, create a log, and return the data.
                user_email = post_data['email']
                user = {
                    'email': user_email,
                    'created_at': utils.get_timestamp(),
                    'uid': post_data['uid'],
                    'photo_url': f'https://robohash.org/${user_email}?set=set1',
                }
                update_document(f'users/{uid}', post_data)
                create_log(
                    f'users/{uid}/logs',
                    claims,
                    'Created new user.',
                    'users',
                    'user_data',
                    [post_data]
                )
                return Response(user, content_type='application/json')

    except:

        # Return a server error.
        return Response(
            {'success': False},
            content_type='application/json',
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
