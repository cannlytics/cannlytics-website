/**
 * Data JavaScript | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <contact@cannlytics.com>
 * Created: 8/21/2021
 * Updated: 1/7/2022
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { authRequest } from '../utils.js';

export const data = {

  async getDataset(id) {
    /**
     * Get metadata about a given dataset.
     * @param {String} id A dataset ID.
     */
    return await authRequest(`/api/datasets/${id}`);
  },

  async getDataMarketStats() {
    /**
     * Get metadata about the data market.
     */
    return await authRequest('/api/market');
  },

  async getStateData(id) {
    /**
     * Get metadata about a given state's data.
     * @param {String} id A state ID. Typically the lowercase state abbreviation.
     *    e.g. `nc` for North Carolina.
     */
    if (id) return await authRequest(`/api/data/state/${id}`);
    return await authRequest('/api/data/state');
  },

  downloadDataset() {
    /**
     * Download a given dataset.
     */
    authRequest('/api/market/download-lab-data');
  },

  async publishDataset() {
    /**
     * Publish a given dataset on the data market.
     */
    const response = authRequest('/api/market/download-lab-data');
    if (response.success) {
      const message = 'Your dataset has been published.';
      showNotification('Data Published', message, /* type = */ 'success');
    } else {
      const message = 'An error occurred when saving your account.';
      showNotification('Error Publishing Data', message, /* type = */ 'error');
    }
  },

  sellDataset() {
    /**
     * Sell a given dataset on the data market.
     */
    // TODO: Get dataset details from the UI.
    const dataset = {};
    const response = authRequest('/api/market/sell', dataset);
    if (response.success) {
      const message = 'Your dataset is now for sale.';
      showNotification('Data Listed for Sale', message, /* type = */ 'success');
    } else {
      const message = 'An error occurred when listing your data for sale.';
      showNotification('Error Listing Data for Sale', message, /* type = */ 'error');
    }
  },

  buyDataset() {
    /**
     * Buy a given dataset on the data market.
     */
    // TODO: Get dataset details from the UI.
    const dataset = {};
    const response = authRequest('/api/market/buy', dataset);
    if (response.success) {
      const message = 'Your have successfully bought a dataset.';
      showNotification('Data Purchased', message, /* type = */ 'success');
    } else {
      const message = 'An error occurred when purchasing this dataset.';
      showNotification('Error Purchasing Data', message, /* type = */ 'error');
    }
  },

};
