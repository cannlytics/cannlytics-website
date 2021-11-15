"""
Upload Verifications | Cannlytics Website

Author: Keegan Skeate <keegan@cannlytics.com>
Created: 11/15/2021
Updated: 11/15/2021
License: MIT License <https://opensource.org/licenses/MIT>
"""
# Standard imports
from dotenv import dotenv_values
import os

# Internal imports
import sys
root = '../'
sys.path.append(root)
from cannlytics import firebase # pylint: disable=import-error
from website_tools import upload_archived_data


def upload_verifications():
    """Upload state traceability system verification data.
    Expects the data in a JSON file in a .datasets folder in the
    root directory with the same name as the collection name."""

    # Specificy collection-specific variables.
    collection_name = 'verifications'
    subcollection_name = 'verification_data'
    id_key='state'

    # Initialize Firebase.
    config = dotenv_values(f'{root}.env')
    credentials = config['GOOGLE_APPLICATION_CREDENTIALS']
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials
    firebase.initialize_firebase()

    # Specify the JSON data file and upload the archived data.
    print(f'Uploading {collection_name} data...')
    datafile = f'{root}/.datasets/{collection_name}.json'
    data = upload_archived_data(
        datafile,
        collection=f'public/{collection_name}/{subcollection_name}',
        id_key=id_key,
        stats_doc=f'public/{collection_name}',
    )
    print(f'Uploaded {collection_name} data.')
    print('Total documents:', len(data))


if __name__ == '__main__':
    
    upload_verifications()
