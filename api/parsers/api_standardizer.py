"""
Standardizer API | Cannlytics API
Copyright (c) 2024 Cannlytics

Authors:
    Keegan Skeate <https://github.com/keeganskeate>
Created: 9/24/2024
Updated: 9/24/2024
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
import openai
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.parsers import MultiPartParser, FormParser

# Internal imports:
from website.auth import authenticate_request, AUTH_ERROR


@csrf_exempt
@api_view(['POST', 'OPTIONS'])
@parser_classes([MultiPartParser, FormParser])
def standardize_names(request: Request):
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
    request_files = request.FILES.getlist('file')
    if request_files is not None:
        # Log the posted files.
        print('POSTED FILES:', request_files)
    # if 'file' in request.FILES:
    #     uploaded_file = request.FILES['file']
    #     # Process the file here
    #     # For example, you could read its contents:
    #     file_content = uploaded_file.read().decode('utf-8')
    #     print(f"File content: {file_content}")


    # FIXME: Handle standardizing text!
    output = {
      'standard_product_name': 'Standard product name',
      'standard_strain_name': 'Standard strain name',
      'standard_product_type': 'Standard product type',
    }


    # FIXME: Handle standardizing files!


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
