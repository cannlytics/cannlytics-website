"""
Periodically Get YouTube Views | Cannlytics Website
Copyright (c) 2021-2022 Cannlytics

Authors: Keegan Skeate <keegan@cannlytics.com>
Created: 1/23/2022
Updated: 1/23/2022
License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
"""
# Internal imports.
import os

# External imports.
from dotenv import dotenv_values


FIREBASE_YOUTUBE_CHANNEL_ID = 'UCP4bf6IHJJQehibu6ai__cg'


# // Fetch channel information
# // https://developers.google.com/youtube/v3/docs/channels/list
# const { data: channelData } = await youtube.channels.list({
#     part: 'snippet,statistics',
#     id: channelId,
#     maxResults: 1,
# });

# if (!channelData.items || channelData.items.length !== 1) {
#     response.send(`Channel with ID ${channelId} not found.`);
#     return;
# }

# const channel = channelData.items[0];

# // Fetch the channel's latest videos
# // https://developers.google.com/youtube/v3/docs/search/list
# const { data: videoData } = await youtube.search.list({
#     part: 'id, snippet',
#     order: 'date',
#     channelId,
#     maxResults: 3,
# });

# const videos = videoData.items || [];

# const channelDetails = {
#     id: channelId,
#     channelTitle: channel.snippet.title,
#     channelDescription: channel.snippet.description,
#     subscriberCount: channel.statistics.subscriberCount,
#     recentVideos: videos.map((video) => {
#     return {
#         videoTitle: video.snippet.title,
#         videoUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
#         videoDescription: video.snippet.description,
#     };
#     }),
# };


# Set credentials.
try:
    config = dotenv_values('../.env')
    credentials = config['GOOGLE_APPLICATION_CREDENTIALS']
except KeyError:
    config = dotenv_values('.env')
    credentials = config['GOOGLE_APPLICATION_CREDENTIALS']
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials
os.environ['FIREBASE_STORAGE_BUCKET'] = config['FIREBASE_STORAGE_BUCKET']

YOUTUBE_API_KEY