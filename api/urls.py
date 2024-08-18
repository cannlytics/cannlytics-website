"""
URLs | Cannlytics API
Copyright (c) 2021-2024 Cannlytics

Authors:
    Keegan Skeate <https://github.com/keeganskeate>
Created: 4/21/2021
Updated: 8/17/2024
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>

Description: API URLs to interface with cannabis data and analytics.
"""
# External imports.
from django.urls import include, path
from rest_framework import urlpatterns #pylint: disable=unused-import

# Core API imports.
from api.auth import api_auth
from api.base import api_base

# Functional API imports.
import api.metrc

# Administrative API imports.
from api.users import api_users


app_name = 'api' # pylint: disable=invalid-name

urlpatterns = [

    # Base API endpoint for users to discover an index of endpoints.
    path('', api_base.index, name='index'),

    # Authentication API endpoints.
    path('auth', include([
        path('/create-key', api_auth.create_api_key),
        path('/delete-key', api_auth.delete_api_key),
        path('/get-keys', api_auth.get_api_key_hmacs),
    ])),

    # TODO: results


    # TODO: strains


    # TODO: licenses


    # Metrc API endpoints.
    path('metrc', include([
        path('/admin/add-key', api.metrc.add_metrc_user_api_key),
        path('/admin/delete-key', api.metrc.delete_metrc_user_api_key),
        path('/batches', api.metrc.batches),
        path('/batches/<batch_id>', api.metrc.batches),
        path('/deliveries', api.metrc.deliveries),
        path('/deliveries/<delivery_id>', api.metrc.deliveries),
        path('/employees', api.metrc.employees),
        path('/employees/<employee_id>', api.metrc.employees),
        path('/facilities', api.metrc.facilities),
        path('/facilities/<facility_id>', api.metrc.facilities),
        path('/harvests', api.metrc.harvests),
        path('/harvests/<harvest_id>', api.metrc.harvests),
        path('/items', api.metrc.items),
        path('/items/<item_id>', api.metrc.items),
        path('/locations', api.metrc.locations),
        path('/locations/<area_id>', api.metrc.locations),
        path('/packages', api.metrc.packages),
        path('/packages/<package_id>', api.metrc.packages),
        path('/patients', api.metrc.patients),
        path('/patients/<patient_id>', api.metrc.patients),
        path('/plants', api.metrc.plants),
        path('/plants/<plant_id>', api.metrc.plants),
        path('/tests', api.metrc.lab_tests),
        path('/tests/<test_id>', api.metrc.lab_tests),
        path('/tests/<test_id>/<coa_id>', api.metrc.lab_tests),
        path('/sales', api.metrc.sales),
        path('/sales/<sale_id>', api.metrc.sales),
        path('/transactions', api.metrc.transactions),
        path('/transactions/<start>', api.metrc.transactions),
        path('/transactions/<start>/<end>', api.metrc.transactions),
        path('/strains', api.metrc.strains),
        path('/strains/<strain_id>', api.metrc.strains),
        path('/transfers/templates', api.metrc.transfer_templates),
        path('/transfers/templates/<template_id>', api.metrc.transfer_templates),
        path('/transfers', api.metrc.transfers),
        path('/transfers/<transfer_id>', api.metrc.transfers),
        path('/drivers/<driver_id>', api.metrc.drivers),
        path('/vehicles/<vehicle_id>', api.metrc.vehicles),
        path('/types', include([
            path('/additives', api.metrc.additive_types),
            path('/adjustments', api.metrc.adjustment_reasons),
            path('/batches', api.metrc.batch_types),
            path('/categories', api.metrc.categories),
            path('/customers', api.metrc.customer_types),
            path('/locations', api.metrc.location_types),
            path('/growth-phases', api.metrc.growth_phases),
            path('/packages', api.metrc.package_types),
            path('/package-statuses', api.metrc.package_statuses),
            path('/return-reasons', api.metrc.return_reasons),
            path('/test-statuses', api.metrc.test_statuses),
            path('/tests', api.metrc.test_types),
            path('/transfers', api.metrc.transfer_types),
            path('/units', api.metrc.units),
            path('/waste', api.metrc.waste_types),
            path('/waste-methods', api.metrc.waste_methods),
            path('/waste-reasons', api.metrc.waste_reasons),
        ])),
    ])),

    # User API Endpoints.
    path('users', include([
        path('', api_users.users),
        path('/<user_id>', api_users.users),
        path('/<user_id>/about', api_users.users),
        path('/<user_id>/consumption', api_users.users),
        path('/<user_id>/spending', api_users.users),
        path('/<user_id>/settings', api_users.users),
    ])),
]
