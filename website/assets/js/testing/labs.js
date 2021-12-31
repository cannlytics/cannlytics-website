/**
 * Labs JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 1/17/2021
 * Updated: 7/31/2021
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { authRequest, showNotification } from '../utils.js';
import { addSelectOptions, setTableTheme } from '../ui/ui.js';
import { sortArrayOfObjects } from '../utils.js';

export const labs = {

  // State

  gridOptions: {},
  lab: {},
  labs: [],

  // Functions

  addLab(event) {
    /**
     * Submit a lab to be added to the directory through the API.
     * @param {Event} event A user-driven event.
     */
    // TODO: Get lab data.

    // TODO: Post data to the API.
  },

  async downloadLabs() {
    /**
     * Download either free or premium data sets.
     */

    // Get any promo code.
    const promoCode = document.getElementById('promo-input').value;

    // Download data.
    const url = `${window.location.origin}/api/labs/download`;
    const time = new Date().toISOString().slice(0, 19).replace(/T|:/g, '-');
    const filename = `labs-${time}.csv`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${promoCode}`
        }
      });
      const blob = await res.blob();
      const newBlob = new Blob([blob]);
      const blobUrl = window.URL.createObjectURL(newBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blob);
    } catch(error) {
      showNotification('Download error', error, /* type = */ 'error' );
    }

    // Hide dialog.
    const downloadDialog = document.getElementById('downloadDialog');
    const modal = bootstrap.Modal.getInstance(downloadDialog);
    modal.hide();

  },

  filterLabsByState(event) {
    /**
     * Filter the table of labs by a given state.
     * @param {Element} event The 
     */
    console.log(event);
    const state = event.value;
    console.log('Filter labs by state:', state);
    const subset = [];
    this.labs.forEach(lab => {
      if (lab.state === state || state === 'all') subset.push(lab);
    });
    this.gridOptions.api.setRowData(subset);
    if (state === 'all') this.viewLessLabs(/* original = */ true);
    else this.viewAllLabs();
  },

  async getLabs() {
    /**
     * Get labs with API.
     * @returns {list}
     */
    const { data } = await authRequest('/api/labs');
    return data;
  },

  async getLab() {
    /**
     * Get lab data with API.
     * @returns {list}
     */
    const { data } = await authRequest(`/api/labs/${license_number}`);
    return data;
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

  async initializeLabsTable() {
    /**
     * Initialize a table of labs.
     */
    this.labs = await this.getLabs();
    this.labs = sortArrayOfObjects(this.labs, 'state');
    console.log('Found labs:', this.labs);

    // Hide the placeholder and show the table.
    // document.getElementById('loading-placeholder').classList.add('d-none');
    // document.getElementById('data-placeholder').classList.add('d-none');
    // document.getElementById('simple-table-options').classList.remove('d-none');
    document.getElementById('data-table').classList.remove('d-none');

    // TODO: Render image (image_url) or favicon?.


    // Define columns.
    const columnDefs = [
      // {
      //   headerName: '', 
      //   field: 'favicon', 
      //   width: 60,
      //   sortable: false, 
      //   autoHeight: true,
      //   cellRenderer: (params) => {
      //     return `<span><img src="${params.value}"></span>`;
      //   },
      // },
      // { name:'Photo', field:'photoP' ,cellTemplate:"<img src='https://angularjs.org/img/AngularJS-large.png' />"}
      { headerName: 'Lab', field: 'name', sortable: true, filter: true },
      { headerName: 'State', field: 'state', sortable: true, filter: true },
      { headerName: 'Analyses', field: 'analyses', sortable: true, filter: true },
      { headerName: 'License', field: 'license', sortable: true, filter: true },
      { headerName: 'Email', field: 'email', sortable: true, filter: true }, // TODO: Require user to sign in for this field.
      { headerName: 'Phone', field: 'phone', sortable: true, filter: true }, // TODO: Require user to sign in for this field.
      { headerName: 'Address', field: 'formatted_address', sortable: true, filter: true },
    ];

    // TODO: Style analyses as chips.

    // Specify the table options.
    this.gridOptions = {
      columnDefs: columnDefs,
      // defaultColDef: { flex: 1,  minWidth: 175 },
      pagination: true,
      paginationAutoPageSize: true,
      rowClass: 'app-action',
      // rowHeight: 25,
      onGridReady: event => setTableTheme(),
      onRowClicked: event => {
        const { data } = event;
        localStorage.setItem('lab', JSON.stringify(data));
        window.location.href = `${window.location.origin}/testing/labs/${data.license}`;
      },
    };

    // Render the table
    const table = document.querySelector('#labs-table');
    table.innerHTML = '';
    new agGrid.Grid(table, this.gridOptions);
    this.gridOptions.api.setRowData(this.labs);

    // Add available state filters.
    let stateOptions = this.labs.map(x => { return { label: x.state, value: x.state } });
    stateOptions = stateOptions.filter((v , i, a) => a.findIndex(t => (t.value === v.value)) === i);
    // stateOptions = stateOptions.sort((a, b) => (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0));
    stateOptions = sortArrayOfObjects(stateOptions, 'value');
    addSelectOptions('lab-state-selection', stateOptions);

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

  initializeLabDetails() {
    /**
     * Initialize lab details page.
     */
    const data = JSON.parse(localStorage.getItem('lab'));
    console.log('Lab data in storage:', data);
    // deserializeForm(document.forms[`${modelSingular}-form`], data)
    // const form = document.querySelector('form');
    // form.addEventListener('submit', this.updateLab);
    // if (auth.currentUser) {
    //   document.getElementById('edit-button').classList.remove('visually-hidden');
    // }
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

  searchLabTable(event) {
    /**
     * Search the lab table for a given query.
     */
    console.log('Query:', event.value);
  },

  searchLabTableClear() {
    /**
     * Clear the search and reset the table.
     */
    const currentState = document.getElementById('lab-state-selection').value;
    this.filterLabsByState(currentState);
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

  viewAllLabs() {
    /**
     * View all of the labs by adjusting the table's height.
     */
    const rowCount = this.gridOptions.api.getDisplayedRowCount();
    const table = document.getElementById('labs-table');
    table.style.height = `${rowCount * 43 + 110}px`;
    document.getElementById('view-all-labs').classList.add('d-none');
    document.getElementById('view-less-labs').classList.remove('d-none');
  },

  viewLessLabs(original = false) {
    /**
     * View only a handful of labs at a time.
     * @param {Boolean} original Whether or not the table should be returned to its original size.
     */
    const currentHeight = document.getElementById('labs-table').style.height;
    if (parseInt(currentHeight, 10) > 750 || original) {
      document.getElementById('labs-table').style.height = '750px';
    }
    document.getElementById('view-all-labs').classList.remove('d-none');
    document.getElementById('view-less-labs').classList.add('d-none');
  },

}
