/**
 * Data JavaScript | Cannlytics Website
 * Created: 8/21/2021
 * Updated: 8/21/2021
 */
import { getDocument } from '../firebase.js';

export const data = {


  getDataSet: (path) => new Promise((resolve) => {
    /*
     * Get metadata about a given dataset.
     */
    getDocument(path).then((data) => {
      resolve(data);
    });
  }),


  downloadDataSet() {
    /*
     * TODO: Download a given dataset.
     */
  },

};
