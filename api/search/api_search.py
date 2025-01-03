"""
Search API | Cannlytics API
Copyright (c) 2024 Cannlytics

Authors:
    Keegan Skeate <https://github.com/keeganskeate>
Created: 9/28/2024
Updated: 9/29/2024
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>
"""
# Standard imports:
from datetime import datetime
import os
from typing import Union

# External imports:
from cannlytics.firebase import (
    create_log,
    get_document,
    get_collection,
    initialize_firebase,
)
from openai import OpenAI
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from openai import OpenAI
from pydantic import BaseModel

# Internal imports:
from website.auth import authenticate_request, AUTH_ERROR


class Filter(BaseModel):
    """A terpene found in a cannabis product."""
    key: str
    operation: str
    value: Union[str, float, int]

class Query(BaseModel):
    """A label for a cannabis product."""
    collection: str
    filters: list[Filter]


QUERY_SYSTEM_PROMPT = """Given a query, please return the most relevant Firestore collection path from the following table and any filters that should be applied to the query.

| Collection | Description |
|-------------|-------------|
| results | Lab results for cannabis products |
| strains | Cannabis strains |
| licenses | Data for licensed cannabis companies |

A Filter should have the following structure:

```py
Filter(key='total_thc', operation='>', value=0.3)
```

The Filter operation can be one of the following: `==`, `!=`, `>`, `<`, `>=`, `<=`, `array_contains`, `in`, `not_in`, `array_contains_any`, `array_contains_all`, `array_contains_none`.
"""
USER_PROMPT = "Given the following user prompt, strictly return the most relevant Firestore collection path (of only 'strains', 'results', 'licenses') and any filters that should be applied to the query."


@csrf_exempt
@api_view(['POST', 'OPTIONS'])
def api_search(request: Request):
    """Search various data types for specific queries."""

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
    sort_by = query_data.get('sort', None)
    limit = data.get('limit', 10)
    try:
        limit = int(limit)
    except:
        limit = 10
    if limit > 420 or limit < 1:
        limit = 420

    # TODO: Get fields by data type. Get all data types if `all`.

    # TODO: Hash and look-up the prompt to save on costs.
    

    # FIXME: AI-powered search!
    # client = OpenAI()

    # 1) Get ChatGPT to determine:
    # - The collection to query
    # - The appropriate filters
    query_data = {}

    # 2) Safety: Ensure that the query is allowable.
    ref = query_data.get('collection', None)
    filters = query_data.get('filters', None)
    order_by = 'updated_at'
    desc = True
    start_at = None

    # 3) Perform the query.
    print('REF:', ref)
    print('FILTERS:', filters)
    # db = initialize_firebase()
    # docs = get_collection(
    #     ref,
    #     limit=limit,
    #     order_by=order_by,
    #     desc=desc,
    #     filters=filters,
    #     database=db,
    #     start_at=start_at,
    # )

    # 4) Format the search results.
    docs = [
        {
            'id': 'test-coa',
            'title': 'Sample COA Result',
            'created_by': 'cannlytics',
            'updated_at': 'Sep 29, 2024',
            'link': '/coas/sample',
            'data_type': 'coas',
            'image_url': 'https://via.placeholder.com/100',
            'tags': [{'tag_id': 'coas', 'tag_name': 'COA', 'tag_color': '#3498db'}],
            'star_count': 0,
            'upvote_count': 1,
            'downvote_count': 0,
        },
        {
            'id': 'test-strain',
            'title': 'Cannabis Strain: OG Kush',
            'created_by': 'cannlytics',
            'updated_at': 'Sep 25, 2024',
            'link': '/strains/og-kush',
            'data_type': 'strains',
            'image_url': 'https://via.placeholder.com/100',
            'tags': [{'tag_id': 'strains', 'tag_name': 'Strain', 'tag_color': '#27ae60'}],
            'star_count': 0,
            'upvote_count': 1,
            'downvote_count': 0,
        },
    ]

    # Create an activity log.
    # try:
    #     create_log(
    #         ref='logs/website/search',
    #         claims=claims,
    #         action='api_search',
    #         log_type='search',
    #         key=uid,
    #         changes=[query]
    #     )
    # except:
    #     print('Failed to log activity.')

    # Return the entered data.
    response = {'success': True, 'data': docs}
    return Response(response, status=200)


# === Tests ===

if __name__ == '__main__':

    # EXAMPLE: Firestore nearest-neighbor query.
    from google.cloud.firestore_v1.base_vector_query import DistanceMeasure
    from google.cloud.firestore_v1.vector import Vector


    def nearest_neighbor_query(
            collection,
            query_vector,
            vector_field,
            limit=10,
        ):
        """
        Perform a nearest-neighbor query on Firestore.
        Args:
            query_vector (list): The query vector to find nearest neighbors for.
            vector_field (str): The field in Firestore containing the vector to compare against.
            limit (int): The maximum number of results to return.
        Returns:
            list: A list of nearest neighbor documents.
        """
        vector_query = collection.find_nearest(
            vector_field=vector_field,
            query_vector=Vector(query_vector),
            distance_measure=DistanceMeasure.COSINE,
            limit=limit,
        )
        return [doc.to_dict() for doc in vector_query.get()]

    # Initialize Firestore.
    db = initialize_firebase()

    # Initialize OpenAI.
    client = OpenAI()

    # # Example: Find most similar results.
    # sample_result = results.iloc[0]
    # embedding = sample_result['results_embedding']
    # collection = db.collection('coas')
    # nearest_results = nearest_neighbor_query(
    #     collection,
    #     embedding,
    #     vector_field='results_embedding',
    #     limit=10,
    # )
    # print("Nearest results:", nearest_results)

    # # Example: Find most similar product name.
    # product_name = "Blue Dream"
    # collection = db.collection('coas')
    # product_name_embedding = get_firestore_embedding(
    #     product_name,
    #     client=openai_client,
    #     db=db
    # )
    # nearest_products = nearest_neighbor_query(
    #     collection,
    #     product_name_embedding,
    #     vector_field='product_name_embedding',
    # )
    # print("Nearest products:", nearest_products)
