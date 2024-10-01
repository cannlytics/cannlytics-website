"""
Stats | Cannlytics Website
Copyright (c) 2024 Cannlytics

Authors: Keegan Skeate <https://github.com/keeganskeate>
Created: 10/1/2024
Updated: 10/1/2024
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports:
from datetime import datetime
from json import loads

# External imports:
from cannlytics.firebase import create_log
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from firebase_admin import firestore
from rest_framework.decorators import api_view

# Internal imports:
from website.auth import authenticate_request


@api_view(['GET', 'POST'])
@csrf_exempt
def star_observation(request):
    """Star or unstar an observation."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)

    # Authenticate the user.
    claims = authenticate_request(request)
    uid = claims.get('uid')
    if not uid:
        return JsonResponse({'error': 'Authentication failed'}, status=403)

    # Get the observation ID and data type.
    post_data = loads(request.body.decode('utf-8'))
    print('POST DATA:', post_data)
    obs_id = post_data.get('id')
    data_type = post_data.get('data_type')
    choice = post_data.get('star')
    if not obs_id:
        return JsonResponse({'error': 'Missing `id`.'}, status=400)
    if not data_type:
        return JsonResponse({'error': 'Missing `type`.'}, status=400)

    # Get Firestore references.
    db = firestore.client()
    user_metadata_ref = db.collection('users').document(uid) \
                        .collection('stats').document('metadata')
    user_star_ref = db.collection('users').document(uid) \
                      .collection('stars').document(obs_id)
    obs_ref = db.collection(data_type).document(obs_id)

    # Create a log.
    create_log(
        ref=f'users/{uid}/logs',
        claims=claims,
        action='Starred data.' if choice else 'Unstarred data.',
        log_type='users',
        key='star_observation',
        changes=[{'id': obs_id, 'type': data_type, 'star': choice}],
        # database=db,
    )

    # Handle unstar.
    user_starred = user_star_ref.get()
    is_starred = user_starred.exists
    if not choice:
        if is_starred:
            user_star_ref.delete()
            entry = {'star_count': firestore.Increment(-1)}
            obs_ref.update(entry)
            user_metadata_ref.update(entry)
        return JsonResponse({'status': 'success', 'id': obs_id}, status=200)
    
    # Handle star.
    else:
        if is_starred:
            return JsonResponse({'error': 'Already starred.'}, status=400)
        created_at = datetime.now().isoformat()
        user_star_ref.set({
            'observation_id': obs_id,
            'starred_at': created_at,
        })
        entry = {'star_count': firestore.Increment(1)}
        obs_ref.update(entry)
        user_metadata_ref.update(entry)
        return JsonResponse({'status': 'success', 'id': obs_id}, status=200)


@api_view(['GET', 'POST'])
@csrf_exempt
def vote_observation(request):
    """Upvote or downvote an observation."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)

    # Authenticate the user.
    claims = authenticate_request(request)
    uid = claims.get('uid')
    if not uid:
        return JsonResponse({'error': 'Authentication failed'}, status=403)

    # Get the observation ID, data type, and vote type (up or down).
    post_data = loads(request.body.decode('utf-8'))
    print('POST DATA:', post_data)
    obs_id = post_data.get('id')
    data_type = post_data.get('data_type')
    vote_type = post_data.get('vote')  # Expected values: 'up' or 'down'
    if not obs_id or vote_type not in ['up', 'down']:
        return JsonResponse({'error': 'Invalid data'}, status=400)

    # Firestore references.
    db = firestore.client()
    user_metadata_ref = db.collection('users').document(uid) \
                        .collection('stats').document('metadata')
    user_vote_ref = db.collection('users').document(uid) \
                      .collection('votes').document(obs_id)
    obs_ref = db.collection(data_type).document(obs_id)

    # Check the user's current vote.
    user_vote = user_vote_ref.get()
    has_voted = user_vote.exists
    current_vote = user_vote.to_dict().get('vote_type') if has_voted else None

    # Prepare Firestore increment operations.
    vote_update = {}
    if vote_type == 'up':
        vote_update['upvote_count'] = firestore.Increment(1)
        if current_vote == 'down':
            vote_update['downvote_count'] = firestore.Increment(-1)  # Undo downvote
    else:  # vote_type == 'down'
        vote_update['downvote_count'] = firestore.Increment(1)
        if current_vote == 'up':
            vote_update['upvote_count'] = firestore.Increment(-1)  # Undo upvote

    # Handle user voting for the first time.
    if not has_voted:
        user_vote_ref.set({
            'observation_id': obs_id,
            'vote_type': vote_type,
            'voted_at': datetime.now().isoformat(),
        })
        obs_ref.update(vote_update)
        user_metadata_ref.update(vote_update)

    # Handle user changing their vote.
    else:

        # User is removing their vote.
        if current_vote == vote_type:
            if vote_type == 'up':
                vote_update['upvote_count'] = firestore.Increment(-1)
            else:
                vote_update['downvote_count'] = firestore.Increment(-1)
            user_vote_ref.delete()
            obs_ref.update(vote_update)
        
        # User is changing their vote.
        else:
            user_vote_ref.update({
                'vote_type': vote_type,
                'voted_at': datetime.now().isoformat(),
            })
            obs_ref.update(vote_update)

    # Create a log.
    if current_vote == vote_type:
        action = 'Removed upvote.' if vote_type == 'up' else 'Removed downvote.'
    else:
        action = 'Upvoted data.' if vote_type == 'up' else 'Downvoted data.'
    create_log(
        ref=f'users/{uid}/logs',
        claims=claims,
        action=action,
        log_type='users',
        key='vote_observation',
        changes=[{'id': obs_id, 'type': data_type, 'vote_type': vote_type}],
        # database=db,
    )
    data = {'vote': vote_type, 'id': obs_id, 'type': data_type}
    return JsonResponse({'status': 'success', 'data': data}, status=200)
