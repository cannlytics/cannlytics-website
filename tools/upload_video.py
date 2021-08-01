"""
Upload Video | Cannlytics Website

Author: Keegan Skeate
Contact: <keegan@cannlytics.com>
Created: Wed May 19 13:36:01 2021
License: MIT License <https://opensource.org/licenses/MIT>

This script uploads a specified video and it's data to the
Cannlytics video archive.

"""
from datetime import datetime



PUBLISHED_AT = '2021-02-'

def upload_video(file_name, video_data):
    """Upload a video to Firebase Storage.
    Args:
        file_name (str): The path of the file to upload.
        video_data (dict): Metadata about the video.
    Returns:
        (dict): The video data updated with the storage ref and URL.
    """
    
    
    return video_data

if __name__ == '__main__':
    
    # Get the specified video.
    
    # Upload the video to Firebase storage.
    
    # Get a reference for the video.
    
    # Save the reference to the video and the
    # video's metadta to Firestore.
    video_data = {
        'music': ['Vivaldi'],
        'category': 'Category: Science and Technology',
        'title': 'Data Wrangling | Cannabis Data Science Episode 1',
        'description': 'Join the fun, zany bunch on our first Cannabis Data Science meetup as we begin to wrangle the firehose of data that the Washington State traceability system offers to the public. Support the group: https://opencollective.com/cannlytics-company Find the data and source code: https://github.com/cannlytics/cannabis-data-science',
        'published_at': PUBLISHED_AT,
        'uploaded_at': datetime.now().isoformat(),
    }
