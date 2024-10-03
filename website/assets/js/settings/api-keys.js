/**
 * API Keys JavaScript | Cannlytics Website
 * Copyright (c) 2021-2023 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 7/13/2021
 * Updated: 10/2/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-console/blob/main/LICENSE>
 */
// import { createGrid } from 'ag-grid-community';
import { authRequest, deserializeForm, serializeForm, showNotification } from '../utils.js';
import { showLoadingButton, hideLoadingButton } from '../ui/ui.js';

export const apiSettings = {

  apiKeysTable: null,

  initializeAPIKeys() {
    /* Initialize API keys table. */

    // Render the date picker.
    $('.datepicker').datepicker({ format: 'mm/dd/yyyy' });

    // Specify the table columns.
    const columnDefs = [
      { field: 'name', headerName: 'Name' },
      { field: 'created_at', headerName: 'Created' },
      { field: 'expiration_at', headerName: 'Expiration' },
    ];

    // Specify the table options.
    const gridOptions = {
      columnDefs: columnDefs,
      defaultColDef: { flex: 1,  minWidth: 100 },
      rowClass: 'app-action',
      rowHeight: 40,
      // selection: {'mode': 'single', 'enableClickSelection': false},
      onRowClicked: this.selectAPIKey,
      overlayLoadingTemplate: `
        <div class="spinner-grow text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `,
      overlayNoRowsTemplate: `
        <div class="card-body bg-transparent text-center" style="max-width:540px;">
          <a href="cannlytics.settings.showNewKeyForm();">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/cannlytics.appspot.com/o/assets%2Fimages%2Fai%2Fcannlytics-api-bots.png?alt=media&token=03cf90fc-5ad6-44d9-84f2-c6e7ea9bb956"
              style="height:125px;"
              class="rounded-circle pt-3"
            >
          </a>
          <h2 class="fs-5 text-dark serif mt-3 mb-1">
            Create your 1st API Key
          </h2>
          <p class="text-secondary fs-6 text-small">
            <small class="serif">Create an API key to begin programmatic use of your account.
            You can share your API key with a third party that you trust to facilitate your Cannlytics workflow.
            </small>
          </p>
        </div>
      `
    };

    // Render the table.
    const eGridDiv = document.querySelector('#key-table');
    this.apiKeysTable = agGrid.createGrid(eGridDiv, gridOptions);
    cannlytics.ui.setTableTheme();

    // Add create API key functionality.
    const createAPIKeyButton = document.getElementById('create-api-key-button');
    createAPIKeyButton.addEventListener('click', function() {
      cannlytics.settings.createAPIKey().then(function(data) {
        cannlytics.settings.apiKeysTable.setGridOption('rowData', data);
      });
    });

    // Get the row data and provide it to the table via the AG Grid API.
    // Note that the user UID is passed from Django's user session.
    this.getAPIKeys().then(function(data) {
      cannlytics.settings.apiKeysTable.setGridOption('rowData', data);
    });

    // Set the expiration date.
    const expirationInput = document.getElementById('input-expiration-at');
    const currentDate = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(currentDate.getFullYear() + 1);
    const formattedDate = (oneYearFromNow.getMonth() + 1) + '/' + oneYearFromNow.getDate() + '/' + oneYearFromNow.getFullYear();
    expirationInput.value = formattedDate;
  },

  closeKeyCreatedForm() {
    /* Close the key created form. */
    document.getElementById('key-created-card').classList.add('d-none');
    document.getElementById('api-key').value = '';
    document.getElementById('key-table-container').classList.remove('d-none');
    this.getAPIKeys().then(function(data) {
      cannlytics.settings.apiKeysTable.setGridOption('rowData', data);
    });
  },

  showNewKeyForm() {
    /* Show the add new key form and hide the key information form. */
    document.getElementById('new-key-card').classList.remove('d-none');
    document.getElementById('key-table-container').classList.add('d-none');
  },

  hideNewKeyForm() {
    /* Show the add new key form and hide the key information form. */
    document.getElementById('new-key-card').classList.add('d-none');
    document.getElementById('key-table-container').classList.remove('d-none');
  },

  selectAPIKey(event) {
    /* Show a key's details on selection. */
    cannlytics.settings.hideNewKeyForm();
    // const selectedRows = cannlytics.settings.apiKeysTable.get
    console.log('SELECTED ROWS:', event);
    localStorage.setItem('api-key', JSON.stringify(event.data));
    window.location.href = `${window.location.origin}/account/api-key`;
  },

  async getAPIKeys() {
    /** 
    * Get all of a user's API key information.
    */
    const response = await authRequest('/api/auth/get-keys');
    return response['data'];
  },

  async createAPIKey() {
    /** 
    * Create an API key.
    */
    showLoadingButton('create-api-key-button');
    const data = serializeForm('new-api-key-form');
    try {
      // Attempt to create the API key.
      const response = await authRequest('/api/auth/create-key', data);
      document.getElementById('new-key-card').classList.add('d-none');
      document.getElementById('key-created-card').classList.remove('d-none');
      document.getElementById('api-key').value = response.api_key;
      await cannlytics.settings.getAPIKeys();
    } catch (error) {
      // Handle errors gracefully.
      showNotification('Error creating API key', 'Failed to create API key. Please try again shortly or contact support.', 'error');
    } finally {
      // Always hide the loading button
      hideLoadingButton('create-api-key-button');
    }
  },

  async deleteAPIKey() {
    /** 
    * Delete an API key.
    */
    showLoadingButton('delete-api-key-button');
    const data = serializeForm('api-key-form');
    const response = await authRequest('/api/auth/delete-key', data);
    hideLoadingButton('delete-api-key-button');
    if (!response.success) {
      showNotification('Error deleting API key', response.message, /* type = */ 'error');
      return;
    }
    window.location.href = `${window.location.origin}/account/api-keys`;; 
  },

  viewAPIKey() {
    /**
     * Render a project's data when navigating to a project page.
     */
    const data = JSON.parse(localStorage.getItem('api-key'));
    deserializeForm(document.forms['api-key-form'], data);
  },

};
