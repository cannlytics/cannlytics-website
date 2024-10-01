"""
Contact Views | Cannlytics Website
Copyright (c) 2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 9/23/2024
Updated: 9/23/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports:
from datetime import datetime
import uuid

# External imports:
from django.http import JsonResponse
from firebase_admin import firestore


def save_message_to_firestore(request):
    """Save a message to Firestore."""
    if request.method == 'POST':
        created_at = datetime.now().isoformat()
        user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
        ip_address = request.META.get('REMOTE_ADDR')
        referrer = request.META.get('HTTP_REFERER')
        message_id = str(uuid.uuid4())
        data = {
            'message_id': message_id,
            'name': request.POST.get('name'),
            'email': request.POST.get('email'),
            'topic': request.POST.get('subject'),
            'message': request.POST.get('message'),
            'created_at': created_at,
            'user_agent': user_agent,
            'ip_address': ip_address,
            'referrer': referrer,
            'status': 'pending',
        }
        db = firestore.client()
        ref = db.collection('website').document('support') \
            .collection('support_messages').document(message_id)
        ref.set(data)
        return JsonResponse({'status': 'success'}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)


def report_data(request):
    """Handle reporting data to Firestore for admin review."""
    if request.method == 'POST':
        try:
            # Extract necessary data from the request
            report_id = str(uuid.uuid4())
            report_reason = request.data.get('reason')
            observation_id = request.data.get('id')
            data_type = request.data.get('type')
            created_at = datetime.now().isoformat()

            # Capture additional metadata from the request
            user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
            ip_address = request.META.get('REMOTE_ADDR')
            referrer = request.META.get('HTTP_REFERER')

            # Check for required fields
            if not report_reason or not observation_id:
                return JsonResponse({'error': 'Invalid data. Missing reason or observation ID.'}, status=400)

            # Prepare the data for saving
            report_data = {
                'report_id': report_id,
                'observation_id': observation_id,
                'data_type': data_type,
                'reason': report_reason,
                'created_at': created_at,
                'user_agent': user_agent,
                'ip_address': ip_address,
                'referrer': referrer,
                'status': 'pending',
            }

            # Save to Firestore in a 'reports' collection for admin review
            db = firestore.client()
            ref = db.collection('website').document('reports') \
                .collection('reported_observations').document(report_id)
            ref.set(report_data)

            # Return success response
            return JsonResponse({'status': 'success', 'report_id': report_id}, status=200)

        except Exception as e:
            # Log error (optional)
            print(f"Error saving report to Firestore: {str(e)}")
            return JsonResponse({'error': 'Failed to submit report'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)
