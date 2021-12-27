"""
Manage Events | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/26/2021
Updated: 12/26/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
from datetime import datetime
from typing import List, Optional
import json
import sys

# Internal imports
sys.path.append('./')
sys.path.append('../')
from cannlytics.firebase import ( # pylint: disable=import-error, wrong-import-position
    get_collection,
    initialize_firebase,
    update_document,
)


def get_dataset(ref: str, datafile: Optional[str] = '') -> List[dict]:
    """Get a dataset saved in Firestore.
    Args:
        ref (str): The reference to a collection.
        datafile (str): Save the data locally to the project's `.datasets`
            if a data file is given.
    Returns:
        (list): Returns a list of data (dict).
    """
    print('Getting data...')
    database = initialize_firebase()
    data = get_collection(ref, database=database)
    print('Found {} observations.'.format(len(data)))
    if datafile:
        print('Saving data...')
        save_dataset(data, datafile)
        print('Saved data to', datafile)
    return data


def upload_dataset(
        file_name: str,
        collection: str,
        id_key: Optional[str] = 'id',
        stats_doc: Optional[str] = '',
):
    """ Upload a dataset to Firestore.
    Args:
        datafile (str): The path to a .json file containing the data.
        collection (str): The path of the collection where data will be stored.
        id_key (str): The key of the ID.
        stats_doc (str): An optional document to store statistics about the data.
    Returns:
        data (list): A list of partner data (dict).
    """
    database = initialize_firebase()
    with open(file_name) as datafile:
        data = json.load(datafile)
    print('Uploading dataset...')
    for item in data:
        item['updated_at'] = datetime.now().isoformat()
        doc_id = item[id_key]
        ref = f'{collection}/{doc_id}'
        update_document(ref, item, database=database)
        print('Updated:', ref)
    if stats_doc:
        update_document(stats_doc, {'total': len(data)}, database=database)
        print('Updated:', stats_doc)
    print('Finished uploading data.')
    return data


def save_dataset(data, file_name):
    """Save a dataset locally."""
    with open(file_name, 'w+') as datafile:
        json.dump(data, datafile, indent=4, sort_keys=True)
