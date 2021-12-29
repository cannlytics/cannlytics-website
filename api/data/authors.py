"""
Cannlypedia Views | Cannlytics API
Copyright (c) Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/5/2021
Updated: 12/5/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def scholars(request, format=None):
    """Get information about scholars."""

    if request.method == 'GET':
        author = request.query_params.get('q', None)
        if author:
            from scholarly import scholarly
            search_query = scholarly.search_author(author)
            author_source = next(search_query)
            author_data = {
                'author': author,
                'affiliation': author_source['affiliation'],
                'cited_by': author_source['citedby'],
                'email_domain': author_source['email_domain'],
                'interests': author_source['interests'],
                'photo_url': author_source['url_picture'],
            } 
            return Response(author_data, content_type="application/json")
        else:
            message = 'Author not found in request. Specify ?q={url_encoded_author_name}'
            return Response(
                {'success': False, 'message': message},
                content_type='application/json',
                status=status.HTTP_400_BAD_REQUEST
            )
