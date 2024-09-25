"""
Strain Data Endpoints | Cannlytics API | SkunkFx
Copyright (c) 2022 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 5/17/2022
Updated: 9/25/2024
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>

Description: API endpoints to interface with cannabis strain data.
"""
# Standard imports:
import json
import re

# External imports:
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Internal imports:
from cannlytics.compounds import cannabinoids, terpenes
from cannlytics.firebase import (
    get_collection,
    get_document,
)


# Define operations.
OPERATIONS = {
    'ge': '>=',
    'le': '<=',
    'l': '<',
    'g': '>',
}


@api_view(['GET'])
def api_strain_data(request, strain_name=None):
    """Get data about cannabis strains (public API endpoint)."""
    data = []
    collection = 'public/data/strains'
    if request.method == 'GET':

        # Get a specific observation.
        if strain_name is None:
            strain_name = request.query_params.get(
                'strain',
                request.query_params.get('strain_name'),
            )
        if strain_name is not None:
            strain_name = strain_name.replace('+', ' ')
            data = get_document(f'{collection}/{strain_name}')

        # Otherwise query observations.
        else:

            # Define query parameters.
            filters = []
            order_by = request.query_params.get('order', 'strain_name')
            desc = request.query_params.get('desc', False)
            limit = request.query_params.get('limit', None)
            if limit:
                limit = int(limit)

            # Allow user to specify whether to include all (default) or any.
            # FIXME: Currently any matches are returned, all matches would be nice.
            operation = 'array_contains_any'
            any = request.query_params.get('any')
            if any:
                operation = 'array_contains_any'

            # Allow user to query by effect or aroma.
            # Future work: Is there any way to query by effect AND aroma?
            effects = request.query_params.get('effects')
            aromas = request.query_params.get('aromas')
            if effects:
                outcomes = [f'effect_{x.replace(" ", "_").lower()}' for x in json.loads(effects)]
                filters.append({
                    'key': 'predicted_effects',
                    'operation': operation,
                    'value': outcomes,
                })
            elif aromas:
                outcomes = [f'aroma_{x.replace(" ", "_").lower()}' for x in json.loads(aromas)]
                filters.append({
                    'key': 'predicted_aromas',
                    'operation': operation,
                    'value': outcomes,
                })

            # Allow user to query by cannabinoid / terpene concentrations.
            # Handles open and closed ranges for a single analyte.
            # FIXME: This doesn't appear to work with 2 operations.
            totals = ['total_cannabinoids', 'total_thc', 'total_cbd', 'total_cbg',
                      'total_terpenes']
            for param in request.query_params:
                if param in totals + list(cannabinoids.keys()) + list(terpenes.keys()):
                    order_by = param
                    desc = request.query_params.get('desc', True)
                    value = request.query_params[param]
                    ops = re.sub(r'\d.+', '', value).split('+')
                    values = [re.sub(r'[^0-9.]', '', x) for x in value.split('+')]
                    for i, op in enumerate(ops):
                        print(param, op, values[i])
                        filters.append({
                            'key': param,
                            'operation': OPERATIONS[op],
                            'value': float(values[i]),
                        })
                    break

            # Query and return the docs.
            data = get_collection(
                collection,
                desc=desc,
                filters=filters,
                limit=limit,
                order_by=order_by,
            )

    # Return the data.
    response = {'success': True, 'data': data}
    return Response(response, status=200)
