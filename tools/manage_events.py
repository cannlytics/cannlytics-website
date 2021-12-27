"""
Manage Events | Cannlytics Website
Copyright (c) 2021 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 12/26/2021
Updated: 12/26/2021
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>

Command-line examples:

    Get and save data.

    ```
    python tools/manage_events.py get_event_data
    ```

    Upload data.

    ```
    python tools/manage_events.py upload_event_data
    ```
"""
# Standard imports
import os
import sys

# External imports
from dotenv import dotenv_values

# Internal imports
from datasets import get_dataset, upload_dataset

# Set credentials.
try:
    config = dotenv_values('../.env')
    credentials = config['GOOGLE_APPLICATION_CREDENTIALS']
except KeyError:
    config = dotenv_values('.env')
    credentials = config['GOOGLE_APPLICATION_CREDENTIALS']
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials


def get_event_data():
    """Get event data from Firestore."""
    ref = 'public/events/event_data'
    try:
        return get_dataset(ref, datafile='.datasets/events.json')
    except FileNotFoundError:
        return get_dataset(ref, datafile='../.datasets/events.json')


def upload_event_data():
    """Upload event data from local `.datasets`."""
    ref = 'public/events/event_data'
    stats_doc = 'public/events'
    try:
        upload_dataset('.datasets/events.json', ref, stats_doc=stats_doc)
    except FileNotFoundError:
        upload_dataset('../.datasets/events.json', ref, stats_doc=stats_doc)


if __name__ == '__main__':

    # Make functions available from the command line.
    globals()[sys.argv[1]]()

    # Get and save event data.
    # event_data = get_event_data()

    # Upload event data.
    # upload_event_data()
