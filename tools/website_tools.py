"""
Website Management Tools | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 11/15/2021
Updated: 11/15/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Standard imports
from datetime import datetime
import json

# Internal imports
import sys
root = '../'
sys.path.append(root)
from cannlytics.firebase import update_document


def upload_archived_data(
    datafile,
    collection,
    id_key='id',
    stats_doc=''
):
    """ Upload all video data.
    Args:
        datafile (str): The path to a .json file containing the video data.
        collection (str): The path of the collection where data will be stored.
        id_key (str): The key of the ID.
        stats_doc (str): An optional document to store statistics about the data.
    Returns:
        data (list): A list of partner data (dict).
    """
    # Read in the data.
    with open(datafile) as f:
        data = json.load(f)

    # Upload the data to Firestore, with an updated_at time.
    for item in data:
        item['updated_at'] = datetime.now().isoformat()
        doc_id = item[id_key]
        ref = f'{collection}/{doc_id}'
        update_document(ref, item)
    
    # Optionally update collection statistics.
    if stats_doc:
        update_document(stats_doc, {'total': len(data)})
    
    # Return the data.
    return data
