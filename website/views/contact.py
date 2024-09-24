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
