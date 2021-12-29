/**
 * Data JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <contact@cannlytics.com>
 * Created: 8/21/2021
 * Updated: 12/27/2021
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
    // TODO: Implement.
  },

  publishDataset() {
    /**
     * Publish a given dataset on the data market.
     */
    // TODO: Implement.
  },

  sellDataset() {
    /**
     * Sell a given dataset on the data market.
     */
    // TODO: Implement.
  },

  buyDataset() {
    /**
     * Buy a given dataset on the data market.
     */
    // TODO: Implement.
  },

};
