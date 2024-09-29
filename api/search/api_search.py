"""
Search API | Cannlytics API
Copyright (c) 2024 Cannlytics

Authors:
    Keegan Skeate <https://github.com/keeganskeate>
Created: 9/28/2024
Updated: 9/28/2024
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>
"""
# Standard imports:
from datetime import datetime
import os
import secrets
import tempfile
from typing import List

# External imports:
from cannlytics.firebase import (
    access_secret_version,
    create_log,
    delete_document,
    delete_file,
    download_file,
    get_document,
    get_collection,
    get_file_url,
    update_document,
    update_documents,
    upload_file,
)
import google.auth
from google.cloud.firestore import Increment
from openai import OpenAI
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.parsers import MultiPartParser, FormParser
from pydantic import BaseModel

# Internal imports:
from website.auth import authenticate_request, AUTH_ERROR


class Filters(BaseModel):
    """A terpene found in a cannabis product."""
    name: str
    percentage: float

class Query(BaseModel):
    """A label for a cannabis product."""
    batch_number: str
    cannabinoids_units: str
    date_packaged: str
    dominant_terpenes: list[Terpene]


@csrf_exempt
@api_view(['POST', 'OPTIONS'])
def api_search(request: Request):
    """Standardize product names, strain names, and product types."""

    # Authenticate the user from a `CANNLYTICS_API_KEY`.
    claims = authenticate_request(request)
    if claims is None:
        return Response({'error': True, 'message': AUTH_ERROR}, status=403)

    # Get the parameters.
    uid = claims['uid']
    data = request.data.get('data', request.data)
    print('User:', uid)
    print('Data:', data)
    
    # Get the user's query.
    query = data.get('q', None)
    data_type = data.get('type', None)
    start_date = data.get('start_date', None)
    end_date = data.get('end_date', None)
    state = data.get('state', 'all')
    

    # FIXME: AI-powered search!
    client = OpenAI()

    # 1) Get ChatGPT to determine:
    # - The collection to query
    # - The appropriate filters

    # 2) Safety: Ensure that the query is allowable.


    # 3) Perform the query.
    # - gets 1- 3 at a time.


    # 4) Format the data.
    output = []

    # Create an activity log.
    # try:
    #     create_log(
    #         ref='logs/parsers/standardizer',
    #         claims=claims,
    #         action='standardize_names',
    #         log_type='parsers',
    #         key=uid,
    #         changes=output
    #     )
    # except:
    #     print('Failed to log activity.')

    # Return the entered data.
    response = {'success': True, 'data': output}
    return Response(response, status=200)
