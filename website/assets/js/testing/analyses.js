/**
 * Lab Analyses JavaScript | Cannlytics Website
 * Copyright (c) 2022 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 1/9/2022
 * Updated: 1/9/2022
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */

const labAnalyses = {

  async initializeAnalyses(id) {
    /**
     * Initialize analyses for a lab.
     * @param {String} id The ID of a lab.
     */
    const data = this.getLabAnalyses(id);
    // TODO: Show the data!
    console.log('Found analyses:', data);
  },

  async getAnalyses() {
    /**
     * Get analyses through the API.
     * @returns {Array}
     */
    const { data } = await authRequest('/api/data/analyses');
    return data;
  },

};
