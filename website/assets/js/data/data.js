/**
 * Data JavaScript | Cannlytics Website
 * Created: 8/21/2021
 * Updated: 10/14/2021
 */
import { getCollection, getDocument } from '../firebase.js';

export const data = {


  getDataSet: (path) => new Promise((resolve) => {
    /*
     * Get metadata about a given dataset.
     */
    getDocument(path).then((data) => {
      resolve(data);
    });
  }),


  getStateData: () => new Promise((resolve) => {
    /*
     * Get metadata about a given dataset.
     */
    getCollection('public/data/state_data', null, 'state').then((data) => {
      resolve(data);
    });
  }),


  downloadDataSet() {
    /*
     * TODO: Download a given dataset.
     */
  },


  publishDataSet() {
    /*
     * TODO: Publish a given dataset on the data market.
     */
  },


  sellDataSet() {
    /*
     * TODO: Publish a given dataset on the data market.
     */
  },


  buyDataSet() {
    /*
     * TODO: Buy a given dataset on the data market.
     */
  },

};
