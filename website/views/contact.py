"""
Contact Views | Cannlytics Website
Copyright (c) 2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 9/23/2024
Updated: 10/1/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports:
from datetime import datetime
import uuid

# External imports:
from django.http import JsonResponse
from firebase_admin import firestore

# Internal imports:
from website.auth import authenticate_request


def save_message_to_firestore(request):
    """Save a message to Firestore."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)
    claims = authenticate_request(request)
    created_at = datetime.now().isoformat()
    user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
    ip_address = request.META.get('REMOTE_ADDR')
    referrer = request.META.get('HTTP_REFERER')
    message_id = str(uuid.uuid4())
    data = {
        'uid': claims.get('uid'),
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
    

def report_data(request):
    """Handle reporting data to Firestore for admin review."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    claims = authenticate_request(request)
    report_id = str(uuid.uuid4())
    report_reason = request.data.get('reason')
    report_details = request.data.get('details')
    observation_id = request.data.get('id')
    data_type = request.data.get('type')
    created_at = datetime.now().isoformat()
    user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
    ip_address = request.META.get('REMOTE_ADDR')
    referrer = request.META.get('HTTP_REFERER')
    if not report_reason or not observation_id:
        message = 'Invalid data. Missing reason or observation ID.'
        return JsonResponse({'error': message}, status=400)
    report_data = {
        'uid': claims.get('uid'),
        'report_id': report_id,
        'observation_id': observation_id,
        'data_type': data_type,
        'reason': report_reason,
        'details': report_details,
        'created_at': created_at,
        'user_agent': user_agent,
        'ip_address': ip_address,
        'referrer': referrer,
        'status': 'pending',
    }
    db = firestore.client()
    ref = db.collection('website').document('reports') \
        .collection('reported_observations').document(report_id)
    ref.set(report_data)
    return JsonResponse({'status': 'success', 'report_id': report_id}, status=200)
