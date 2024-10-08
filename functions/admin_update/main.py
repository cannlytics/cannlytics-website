"""
Periodically Update the Admin | Cannlytics Website
Copyright (c) 2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 2/10/2024
Updated: 9/7/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Internal imports.
import base64
from datetime import datetime
import os
import requests

# External imports.
# from cannlytics.firebase import (
#     get_collection,
#     update_documents,
# )
from firebase_admin import auth, initialize_app, firestore
from google.auth import default
from google.cloud import firestore
from google.cloud.firestore_v1 import aggregation
from google.cloud.firestore_v1.base_query import FieldFilter


# Initialize Firestore.
try:
    initialize_app()
except ValueError:
    pass

# Get the project ID.
_, project_id = default()


def update_user_stats():
    """Update user statistics."""

    # Get user statistics.
    users = []
    monthly_users = 0
    start_of_month = datetime(datetime.now().year, datetime.now().month, 1)
    page = auth.list_users()
    while page:
        for user in page.users:
            users.append(user)
            timestamp = user.user_metadata.creation_timestamp
            created_at = datetime.fromtimestamp(timestamp / 1000)
            if created_at >= start_of_month:
                monthly_users += 1
        page = page.get_next_page()
    number_of_users = len(users)
    print(f'Total number of users: {number_of_users}')
    print(f'Number of new users this month: {monthly_users}')

    # Update user stats
    db = firestore.client()
    ref = db.collection('stats').document('users')
    current_user_stats = ref.get().to_dict()
    if current_user_stats is None:
        current_user_stats = {
            'total_users': 0,
            'monthly_users': 0,
        }
    updated_user_stats = {
        'total_users': number_of_users,
        'monthly_users': monthly_users,
    }
    updated_user_stats['change_in_users'] = updated_user_stats['total_users'] - current_user_stats['total_users']
    updated_user_stats['change_in_monthly_users'] = updated_user_stats['monthly_users'] - current_user_stats['monthly_users']
    ref.set(updated_user_stats)
    print('Updated stats/users document.')
    return updated_user_stats


def admin_update(event, context):
    """Update the admin with the latest happenings.

    Triggered from a message on a Cloud Pub/Sub topic.

    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    if pubsub_message != 'success':
        return

    # Initialize Firebase.
    database = firestore.client()

    # Update user statistics.
    update_user_stats()

    # TODO: Get `pending` contact messages.
    # `status` == 'pending
    # db.collection('website').document('support') \
    #         .collection('support_messages')


    # TODO: Get `pending` reported data.
    # ref = db.collection('website').document('reports') \
    #             .collection('reported_observations').document(report_id)


    # TODO: Get the recent logs.


    # Optional: Perform statistics on the logs.
    # Optional: Ask ChatGPT to summarize the logs.
    # Optional: Count how many documents were created, updated, and deleted.
    # Optional: Get the number of Cloud Run requests.
    # Optional: Count the number of website page visits (for the top 10 visited). 

    
    # TODO: Summarize the data in Firestore:
    # - Number of new results
    # - Number of new strains
    # - Number of new producers
    # - Number of new labs
    # - Any new plant patents
    # - Any new licenses


    # Optional: Any new research articles about cannabis.

    # TODO: Get counts of data types.


    # Optional: Get counts of logs.


    # TODO: Read report template.


    # TODO: Fill-in report template.


    # TODO: Generate the report.


# === Tests ===
# [✓] Tested: 2024-09-07 by Keegan Skeate <keegan@cannlytics>
if __name__ == '__main__':

    # Update user statistics.
    user_stats = update_user_stats()
