"""
Periodically Update the Admin | Cannlytics Website
Copyright (c) 2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 2/10/2024
Updated: 10/11/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Internal imports.
import base64
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import smtplib
import ssl
from string import Template

# External imports.
from firebase_admin import auth, initialize_app, firestore
from google.auth import default
from google.cloud.firestore_v1 import aggregation
from google.cloud.firestore_v1.base_query import FieldFilter


# Initialize Firestore.
try:
    initialize_app()
except ValueError:
    pass

# Get the project ID.
_, project_id = default()


def count_collection(ref, field, value, operation='>='):
    """Count the number of new data in Firestore."""
    query = ref.where(filter=FieldFilter(field, operation, value))
    aggregate_query = aggregation.AggregationQuery(query)
    aggregate_query.count(alias='all')
    response = aggregate_query.get()
    return response[0][0].value


def get_contact_messages(db):
    """Get `pending` contact messages."""
    messages = []
    ref = db.collection('website').document('support') \
            .collection('support_messages')
    query = ref.where(filter=FieldFilter('status', '==', 'pending'))
    docs = query.get()
    for doc in docs:
        messages.append(doc.to_dict())
    return messages


def get_reported_data(db):
    """Get `pending` reported data."""
    reported_data = []
    ref = db.collection('website').document('reports') \
            .collection('reported_observations')
    query = ref.where(filter=FieldFilter('status', '==', 'pending'))
    docs = query.get()
    for doc in docs:
        reported_data.append(doc.to_dict())
    return reported_data


def update_user_stats(db):
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
    print('Updated `stats/users` document.')
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
    db = firestore.client()

    # Update user statistics.
    updated_user_stats = update_user_stats(db)

    # Get `pending` contact messages.
    messages = get_contact_messages(db)
    print(f'Number of pending messages: {len(messages)}')

    # Get `pending` reported data.
    reported_data = get_reported_data(db)
    print(f'Number of data reported: {len(reported_data)}')
    
    # Count the number of new data in Firestore.
    start_of_month = datetime(datetime.now().year, datetime.now().month, 1)
    date = start_of_month.strftime('%Y-%m-%d')
    collections = [
        ('coas', 'coa_parsed_at'),
        ('results', 'date_tested'),
        ('strains', 'updated_at'),
        ('licenses', 'updated_at'),
    ]
    new_data_counts = {}
    for col, field in collections:
        ref = db.collection(col)
        count = count_collection(ref, field, date)
        new_data_counts[col] = count
        print(f'Number of new `{col}`: {count}')

    # Future work: Count the number of website page visits (for the top 10 visited). 

    # Format messages HTML.
    messages_html = ""
    for msg in messages:
        messages_html += f"""
        <div class="message-item">
            <strong>From:</strong> {msg.get('name', 'N/A')}<br>
            <strong>Email:</strong> {msg.get('email', 'N/A')}<br>
            <strong>Message:</strong> {msg.get('message', 'N/A')}
        </div>
        """

    # Format reported data HTML.
    reported_data_html = ""
    for data in reported_data:
        reported_data_html += f"""
        <div class="message-item">
            <strong>Type:</strong> {data.get('type', 'N/A')}<br>
            <strong>Details:</strong> {data.get('details', 'N/A')}
        </div>
        """

    # Read the HTML template
    with open('admin-email-template.html', 'r') as file:
        html_template = Template(file.read())

    # Fill in the template
    html_content = html_template.safe_substitute(
        current_date=datetime.now().strftime('%Y-%m-%d'),
        total_users=updated_user_stats['total_users'],
        change_in_users=updated_user_stats['change_in_users'],
        monthly_users=updated_user_stats['monthly_users'],
        change_in_monthly_users=updated_user_stats['change_in_monthly_users'],
        new_coas=new_data_counts['coas'],
        new_results=new_data_counts['results'],
        new_strains=new_data_counts['strains'],
        new_licenses=new_data_counts['licenses'],
        num_messages=len(messages),
        messages_html=messages_html,
        num_reported_data=len(reported_data),
        reported_data_html=reported_data_html
    )

    # Send an email to the admin with the stats and messages.
    admin_email = os.environ.get('EMAIL_HOST_USER')
    admin_email_password = os.environ.get('EMAIL_HOST_PASSWORD')
    admin_email_host = os.environ.get('EMAIL_HOST')
    admin_email_port = int(os.environ.get('EMAIL_PORT', 587))
    context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    with smtplib.SMTP(admin_email_host, admin_email_port) as server:
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(admin_email, admin_email_password)
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Cannlytics Admin Update - {datetime.now().strftime('%Y-%m-%d')}"
        msg['From'] = admin_email
        msg['To'] = admin_email
        part = MIMEText(html_content, 'html')
        msg.attach(part)
        server.send_message(msg)


# === Tests ===
# [✓] Tested: 2024-10-11 by Keegan Skeate <keegan@cannlytics>
if __name__ == '__main__':

    # Test sending the admin an update email.
    event = {
        'data': base64.b64encode(b'success').decode('utf-8'),
    }
    context = {}
    admin_update(event, context)
