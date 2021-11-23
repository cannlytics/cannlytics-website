/**
 * Videos JavaScript | Cannlytics Website
 * Created: 7/30/2021
 * Updated: 7/30/2021
 */
 import { auth, getDocument, onAuthStateChanged } from '../firebase.js';


 export const videos = {

    authenticatePremiumVideo() {
      /* Authenticate the user to view a premium video.
      */
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('Current user:', user);
        } else {
          console.log('No user');
        }
      });
    },


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
