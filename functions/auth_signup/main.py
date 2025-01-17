"""
Authentication Sign Up | Cannlytics
Copyright (c) 2023-2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 6/23/2023
Updated: 10/4/2024
License: MIT License <https://github.com/cannlytics/cannlytics/blob/main/LICENSE>

Description:

    Populate a user's account with trial tokens when they sign up.
    Then send a welcome email to the user and a notification email
    to the admin.

"""
# Standard imports:
import os
import smtplib
import ssl
from email.mime.text import MIMEText

# External imports:
from firebase_admin import initialize_app
from firebase_admin import firestore

# Initialize Firebase.
try:
    initialize_app()
except ValueError:
    pass


def auth_signup(data, context):
    """Triggered by creation or deletion of a Firebase Auth user object.
    Args:
           data (dict): The event payload.
           context (google.cloud.functions.Context): Metadata for the event.
    """
    uid = data['uid']
    created_at = data['metadata']['createdAt']
    print('Creation/deletion of user: %s' % uid)

    # Get the user's email.
    user_email = None
    if 'email' in data:
        user_email = data['email']
        print('User email: %s' % user_email)

    # Add 10 trial tokens to the user's account.
    db = firestore.client()
    if created_at == data['metadata']['lastSignedInAt']:
        print('User signed up for the first time: %s' % created_at)
        entry = {
            'created_at': created_at,
            'support': 'free',
            'tokens': 10,
            'uid': uid,
            'email': user_email,
        }
        ref = db.collection('subscribers').document(uid)
        ref.set(entry, merge=True)
        print('Added 50 tokens for user: %s' % uid)

    # Create the user's profile in the database.
    profile_data = {
        'created_at': created_at,
        'uid': uid,
    }
    ref = db.collection('users').document(uid) \
        .collection('public_user_data').document('profile')
    ref.set(profile_data, merge=True)

    # Get email credentials.
    admin_email = os.environ.get('EMAIL_HOST_USER')
    admin_email_password = os.environ.get('EMAIL_HOST_PASSWORD')
    admin_email_host = os.environ.get('EMAIL_HOST')
    admin_email_port = int(os.environ.get('EMAIL_PORT', 587))

    # Start the email server.
    try:
        context = ssl.SSLContext(ssl.PROTOCOL_TLS)
        server = smtplib.SMTP(admin_email_host, admin_email_port)
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
        server.login(admin_email, admin_email_password)
    except Exception as e:
        print('Error connecting to SMTP server: ', str(e))
        return

    # Send a welcome email.
    # FIXME: This is failing every time in the cloud.
    try:
        msg = MIMEText('Welcome to Cannlytics')
        msg['Subject'] = 'Welcome!'
        msg['From'] = admin_email
        msg['To'] = user_email
        html = """
        <html>
        <head>
            <style>
                .serif {
                    font-family: 'Times New Roman', Times, serif;
                }
                .mt-2 {
                    margin-top: 0.5rem;
                }
                a {
                    color: #0d6efd;
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <p>Welcome to Cannlytics,</p>
            <p>Explore subscription plans and find the right plan for you at <a href="https://cannlytics.com/account/subscriptions">https://cannlytics.com/account/subscriptions</a>.</p>
            <p class="mt-2" style="max-width:560px;">
                With a subscription, you get access to:
                <a href="https://cannlytics.com/parsers/coa-parser">a COA parser</a>,
                <a href="https://cannlytics.com/parsers/label-parser">a label parser</a>,
                <a href="https://cannlytics.com/parsers/receipt-parser">a receipt parser</a>,
                <a href="https://cannlytics.com/organizations">data archives</a>, and
                <a href="https://cannlytics.com/api">API access</a>.
            </p>
            <p>As a new user, you have received <strong class="serif">10 free tokens</strong> to try parsing COAs, labels and receipts.</p>
            <p>Each parse consumes <strong class="serif">1 token</strong>. Only successful jobs will consume tokens. Your tokens are valid for <strong class="serif">one month</strong> after purchase. You can always purchase more tokens for your account at <a href="https://cannlytics.com/account">https://cannlytics.com/account</a>.</p>
            <p>Please parse as many COAs, labels, and receipts as you desire! Put your data to good use.</p>
            <p>Thank you for subscribing,<br>The Cannlytics Team</p>
        </body>
        </html>
        """
        part = MIMEText(html, 'html')
        msg.attach(part)
        server.send_message(msg)
        print('Welcome email sent to user: %s' % uid)
    except:
        print('Failed to send welcome email to user: %s' % uid)

    # Send an email to the Cannlytics admin.
    # FIXME: This is failing every time in the cloud.
    try:
        subject = 'A new user signed up!\n'
        for key, value in entry.items():
            subject += f'\n{key}: {value}'
        msg = MIMEText(f'New user: {uid}')
        msg['Subject'] = subject
        msg['From'] = admin_email
        msg['To'] = admin_email
        server.send_message(msg)
    except:
        print('Failed to send email to admin about new user: %s' % uid)

    # Close the email server.
    try:
        server.quit()
    except:
        pass


# === Test ===
if __name__ == '__main__':

    # Mock authentication sign up.
    data = {
        'uid': 'qXRaz2QQW8RwTlJjpP39c1I8xM03',
        'email': 'help@cannlytics.com',
        'metadata': {
            'createdAt': '2023-04-20T00:00:00.000Z',
            'lastSignedInAt': '2023-04-20T00:00:00.000Z',
        }
    }
    auth_signup(data, {})
