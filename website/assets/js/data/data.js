/**
 * Data JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <contact@cannlytics.com>
 * Created: 8/21/2021
 * Updated: 11/23/2021
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { getCollection, getDocument } from '../firebase.js';

export const data = {

  async getDataSet(path) {
    /*
     * Get metadata about a given dataset.
     */
    return await getDocument(path);
  },

  getDataMarketStats: () => new Promise((resolve) => {
    /*
     * Get metadata about the data market.
     */
    // TODO:
    // getDocument(path).then((data) => {
    //   resolve(data);
    // });
    resolve({});
  }),

  getStateData: () => new Promise((resolve) => {
    /*
     * Get metadata about a given dataset.
     */
    getCollection('public/data/state_data', { orderBy: 'state' }).then((data) => {
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
