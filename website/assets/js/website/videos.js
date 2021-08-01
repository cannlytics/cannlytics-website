/**
 * Videos JavaScript | Cannlytics Website
 * Created: 7/30/2021
 * Updated: 7/30/2021
 */
 import { getDocument } from '../firebase.js';


 export const videos = {

    async getVideo(videoId) {
      /* Get video data from Firestore.
      Args:
        videoId (string): The ID of the video to retrieve.
      Returns:
        (object): The document object if found, otherwise an empty object.
      */
      const videoData = await getDocument(`public/videos/video_data/${videoId}`);
      return videoData;
    },


    async updateVideoViews(videoId) {
      /* Increment video views for a given video in Firestore.
      Args:
        videoId (string): The ID of the video to increment views.
      Returns:
        (object): The document object if found, otherwise an empty object.
      */
      const videoData = await updateDocument(`public/videos/video_data/${videoId}`);
      return videoData;
    },

  
 };