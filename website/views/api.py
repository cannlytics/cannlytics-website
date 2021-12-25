"""
API Views | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 1/22/2021
Updated: 12/24/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>

API to interface with cannabis-testing information.
"""
# External imports
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Internal imports
from cannlytics.auth.auth import authenticate_request
from cannlytics.firebase import get_collection, get_document

ENDPOINTS = ['labs']
VERSION = 'v1'

#----------------------------------------------#
# Base Endpoints
#----------------------------------------------#

@api_view(['GET'])
def index(request): #pylint: disable=unused-argument
    """Informational base endpoint."""
    message = f'Welcome to the Cannlytics API. The current version is {VERSION}.'
    return Response({'success': True, 'data': message}, content_type='application/json')


@api_view(['GET'])
def base(request): #pylint: disable=unused-argument
    """Informational version endpoint."""
    message = f'Welcome to {VERSION} of the Cannlytics API. Available endpoints:\n\n'
    for endpoint in ENDPOINTS:
        message += f'{endpoint}\n'
    return Response({'success': True, 'data': message}, content_type='application/json')


#----------------------------------------------#
# Subscription Endpoints
#----------------------------------------------#

@api_view(['GET'])
def get_user_subscriptions(request):
    """Get a user's subscriptions."""
    claims = authenticate_request(request)
    try:
        user_id = claims['uid']
        subscriptions = get_document(f'subscribers/{user_id}')
        response = {'success': True, 'data': subscriptions}
        return Response(response, content_type='application/json')
    except KeyError:
        response = {'success': False, 'message': 'Invalid authentication.'}
        return Response(response, content_type='application/json')


#----------------------------------------------#
# Lab Endpoints
#----------------------------------------------#

@api_view(['GET', 'POST'])
def labs(request):
    """
    Get or update information about labs.
    """

    # Query labs.
    if request.method == 'GET':
        limit = request.query_params.get('limit', None)
        order_by = request.query_params.get('order_by', 'state')
        # TODO: Get any filters from dict(request.query_params)
        labs = get_collection('labs', order_by=order_by, limit=limit, filters=[])
        return Response({'success': True, 'data': labs}, content_type='application/json')

    # Update a lab given a valid Firebase token and the user belongs to the lab.
    elif request.method == 'POST':

        # Check token.
        claims = authenticate_request(request)
        try:
            user_id = claims['uid']
        except KeyError:
            response = {'success': False, 'message': 'Invalid authentication.'}
            return Response(response, content_type='application/json')

        # FIXME: Ensure that lab's can only edit their own lab.
        return Response({'success': False, 'message': 'Not implemented yet :('}, content_type='application/json')

        # # Get the posted lab data.
        # lab = request.data
        # org_id = lab['id']
        # lab['slug'] = slugify(lab['name'])

        # # TODO: Handle adding labs.
        # # Create uuid, latitude, and longitude, other fields?

        # # Determine any changes.
        # existing_data = get_document(f'labs/{org_id}')
        # changes = []
        # for key, after in lab:
        #     before = existing_data[key]
        #     if before != after:
        #         changes.append({'key': key, 'before': before, 'after': after})

        # # Get a timestamp.
        # timestamp = datetime.now().isoformat()
        # lab['updated_at'] = timestamp

        # # Create a change log.
        # log_entry = {
        #     'action': 'Updated lab data.',
        #     'type': 'change',
        #     'created_at': lab['updated_at'],
        #     'user': claims['uid'],
        #     'user_name': claims['display_name'],
        #     'user_email': claims['email'],
        #     'photo_url': claims['photo_url'],
        #     'changes': changes,
        # }
        # update_document(f'labs/{org_id}/logs/{timestamp}', log_entry)

        # # Update the lab.
        # update_document(f'labs/{org_id}', lab)

        # return Response(log_entry, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
def lab_logs(request, org_id):
    """
    Get or create (TODO) lab logs.
    """

    if request.method == 'GET':
        data = get_collection(f'labs/{org_id}/logs')
        return Response({'success': True, 'data': data}, content_type='application/json')
    

    else:
        return Response({'success': False, 'message': 'Not implemented yet :('}, content_type='application/json')


@api_view(['GET', 'POST'])
def lab_analyses(request, org_id):
    """
    Get or update (TODO) lab analyses.
    """

    if request.method == 'GET':
        data = get_collection(f'labs/{org_id}/analyses')
        return Response({'success': True, 'data': data}, content_type='application/json')
    
    else:
        return Response({'success': False, 'message': 'Not implemented yet :('}, content_type='application/json')


@api_view(['GET', 'POST'])
def lab_prices(request, org_id):
    """
    Get or update (TODO) lab prices.
    """

    if request.method == 'GET':
        data = get_collection(f'labs/{org_id}/prices')
        return Response({'success': True, 'data': data}, content_type='application/json')
    
    else:
        return Response({'success': False, 'message': 'Not implemented yet :('}, content_type='application/json')
