"""
Data Views | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 1/5/2021
Updated: 1/9/2022
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
from datetime import datetime
from tempfile import NamedTemporaryFile

# External imports
from django.http import FileResponse
from django.views.decorators.csrf import csrf_exempt
from pandas import DataFrame

# Internal imports.
from cannlytics.firebase import (
    get_collection,
    update_document,
    upload_file,
)


@csrf_exempt
def download_lab_data(request):
    """Download either a free or premium lab data set."""

    # Optional: Store allowed data points in Firebase?
    data_points = {
        'free': [
            'id',
            'name',
            'trade_name',
            'license',
            'license_url',
            'license_issue_date',
            'license_expiration_date',
            'status',
            'street',
            'city',
            'county',
            'state',
            'zip',
            'description',
        ],
        'premium': [
            'formatted_address',
            'timezone',
            'longitude',
            'latitude',
            'capacity',
            'square_feet',
            'brand_color',
            'favicon',
            'email',
            'phone',
            'website',
            'linkedin',
            'image_url',
            'opening_hours',
            'analyses',
        ],
    }

    # Get promo code for premium data.
    subscriber = {}
    tier = 'free'
    try:
        authorization = request.headers['Authorization']
        token = authorization.split(' ')[1]
        filters = [{'key': 'promo_code', 'operation': '==', 'value': token}]
        subscriber = get_collection('subscribers', filters=filters)[0]
        if subscriber:
            subscriber['subscriber_created_at'] = subscriber['created_at']
            subscriber['subscriber_updated_at'] = subscriber['updated_at']
            tier = 'premium'
    except:
        pass

    # Get lab data.
    labs = get_collection('labs', order_by='state')
    data = DataFrame.from_dict(labs, orient='columns')

    # Restrict data points.
    if tier == 'premium':
        data = data[data_points['free'] + data_points['premium']]
    else:
        data = data[data_points['free']]

    # Convert JSON to CSV.
    with NamedTemporaryFile(delete=False) as temp:
        temp_name = temp.name + '.csv'
        data.to_csv(temp_name, index=False)
        temp.close()

    # Post a copy of the data to Firebase storage.
    now = datetime.now()
    timestamp = now.strftime('%Y-%m-%d_%H-%M-%S')
    filename = f'labs_{timestamp}.csv'
    destination = 'public/data/downloads/'
    ref = destination + filename
    upload_file(ref, temp_name)

    # Create an activity log.
    log_entry = {
        'created_at': now.isoformat(),
        'updated_at': now.isoformat(),
        'data_points': len(data),
        'tier': tier,
        'filename': filename,
        'ref': ref,
    }
    log_entry = {**subscriber, **log_entry}
    update_document(f'logs/website/data_downloads/{timestamp}', log_entry)

    # Return the file to download.
    return FileResponse(open(temp_name, 'rb'), filename=filename)