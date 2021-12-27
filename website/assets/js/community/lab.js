/**
 * Labs JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 1/17/2021
 * Updated: 7/31/2021
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { authRequest } from '../utils.js';

export const lab = {

  // State

  lab: {},

  // Functions

  initializeDetails() {
    /**
     * Initialize lab details page.
     */
    const form = document.querySelector('form');
    form.addEventListener('submit', cannlytics.community.updateLab);
    if (auth.currentUser) {
      document.getElementById('edit-button').classList.remove('visually-hidden');
    }
  },

  toggleEditLab(edit = true) {
    /**
     * Toggle editing for a lab if permitted by the user's account.
     * @param {bool} edit Whether or not the lab can be edited.
     */
    if (!auth.currentUser) {
      document.getElementById('login-alert').classList.add('show');
      return;
    }

    // Keep track of changes.
    const form = document.querySelector('form');
    const data = Object.fromEntries(new FormData(form));

    // Show buttons.
    const editButton = document.getElementById('edit-button');
    const cancelButton = document.getElementById('cancel-button');
    const saveButton = document.getElementById('save-button');
    if (edit) {
      editButton.classList.add('visually-hidden');
      cancelButton.classList.remove('visually-hidden');
      saveButton.classList.remove('visually-hidden');
      this.lab = data;
    } else {
      editButton.classList.remove('visually-hidden');
      cancelButton.classList.add('visually-hidden');
      saveButton.classList.add('visually-hidden');
      Object.keys(this.lab).forEach((key) => {
        document.getElementById(`input-${key}`).value = this.lab[key];
      });
    }

    // Toggle inputs.
    const inputs = document.getElementsByClassName('form-control');
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs.item(i);
      if (edit) { // Begin editing.
        input.readOnly = false;
        input.classList.remove('form-control-plaintext');
      }
      else { // Cancel editing, filling in original values.
        input.readOnly = true;
        input.classList.add('form-control-plaintext');
      }
    }
  },

  addLab(event) {
    /**
     * Submit a lab to be added to the directory through the API.
     * @param {Event} event A user-driven event.
     */
    // TODO: Get lab data.

    // TODO: Post data to the API.
  },

  async updateLab(event) {
    /**
     * Update a lab through the API.
     * @param {Event} event A user-driven event.
     */

    // Get the form data.
    event.preventDefault();
    const form = new FormData(event.target);
    const data = Object.fromEntries(form.entries());

    // Post the lab data.
    authRequest('/api/labs', data);
    
    // TODO: Show toast of save success with items changed.

  },

  async getLabAnalyses(id) {
    /**
     * Get analyses for a lab.
     * @param {String} id The ID of a lab.
     */
    return await authRequest(`/api/labs/${id}/analyses`);
  },

  async getLabLogs(id) {
    /**
     * Get change logs for a lab.
     * @param {String} id The ID of a lab.
     */
     return await authRequest(`/api/labs/${id}/logs`); 
  },

  async initializeAnalyses(id) {
    /**
     * Initialize analyses for a lab.
     * @param {String} id The ID of a lab.
     */
    const data = this.getLabAnalyses(id);
    // TODO: Show the data!
    console.log('Found analyses:', data);
  },

  async initializeLogs(id) {
    /**
     * Initialize logs for a lab.
     * @param {String} id The ID of a lab.
     */
    const data = this.getLabLogs(id);
    // TODO: Show the data!
    console.log('Found analyses:', data);

  },

}
