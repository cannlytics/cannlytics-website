/**
 * Labs JavaScript | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 1/17/2021
 * Updated: 1/9/2022
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { authRequest, showNotification } from '../utils.js';
import { addSelectOptions, setTableTheme } from '../ui/ui.js';
import { downloadBlob, sortArrayOfObjects } from '../utils.js';
import { getCurrentUser } from '../firebase.js';

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
    // FIXME: Ensure that this works / is needed?
    event.preventDefault();
    const form = new FormData(event.target);
    const data = Object.fromEntries(form.entries());
    authRequest('/api/labs', data);
    if (response.success) {
      const message = 'Successfully added lab.'
      showNotification('Lab Added', message, /* type = */ 'success');
    } else {
      const message = 'An error occurred when trying to add lab data. Ensure that you have permission to edit this lab.';
      showNotification('Error Adding Lab', message, /* type = */ 'error');
    }
  },

  async downloadLabData() {
    /**
     * Download lab data, prompting the user to sign in if they are not already.
     */
    const user = getCurrentUser();
    if (!user) {
      const modal = Modal.getInstance(document.getElementById('sign-in-dialog'));
      modal.show();
      return;
    }
    const url = `${window.location.origin}/src/data/download-lab-data`;
    const time = new Date().toISOString().slice(0, 19).replace(/T|:/g, '-');
    try {
      const res = await authRequest(url);
      const blob = await res.blob();
      downloadBlob(blob, /* filename = */ `labs-${time}.csv`);
    } catch(error) {
      const message = 'Error downloading lab data. Please try again later and/or contact support.';
      showNotification('Download Error', message, /* type = */ 'error' );
    }
  },

  filterLabsByState(event) {
    /**
     * Filter the table of labs by a given state.
     * @param {Element} event The 
     */
    const state = event.value;
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

    // Define columns.
    const columnDefs = [
      {
        headerName: '', 
        field: 'slug', 
        width: 60,
        sortable: false, 
        autoHeight: true,
        cellRenderer: renderViewLabButton,
      },
      {
        headerName: 'Lab',
        field: 'name',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'State',
        field: 'state',
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        headerName: 'Analyses', field: 'analyses',
        sortable: true,
        filter: true,
        cellRenderer: renderAnalyses,
        width: 240,
      },
      {
        headerName: 'License',
        field: 'license',
        sortable: true,
        filter: true,
      },
      {
        headerName: 'Email',
        field: 'email',
        sortable: true,
        filter: true,
        cellRenderer: renderAuthRequired,
      },
      {
        headerName: 'Phone',
        field: 'phone',
        sortable: true,
        filter: true,
        cellRenderer: renderAuthRequired,
      },
      {
        headerName: 'Address',
        field: 'formatted_address',
        sortable: true,
        filter: true,
      },
    ];

    // Specify the table options.
    this.gridOptions = {
      columnDefs: columnDefs,
      pagination: true,
      paginationAutoPageSize: true,
      rowClass: 'app-action',
      onGridReady: event => setTableTheme(),
    };

    // Hide the placeholder and show the table.
    document.getElementById('loading-placeholder').classList.add('d-none');
    document.getElementById('data-table').classList.remove('d-none');

    // Render the table.
    const table = document.querySelector('#labs-table');
    table.innerHTML = '';
    new agGrid.Grid(table, this.gridOptions);
    this.gridOptions.api.setRowData(this.labs);

    // Add available state filters.
    let stateOptions = this.labs.map(x => { return { label: x.state, value: x.state } });
    stateOptions = stateOptions.filter((v , i, a) => a.findIndex(t => (t.value === v.value)) === i);
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

  async initializeLabDetails(license) {
    /**
     * Initialize lab details page.
     * @param {String} license The license number of the lab.
     */
    // FIXME: Ensure that this works.
    const data = await authRequest(`/api/labs/${license}`)
    deserializeForm(document.forms[`${modelSingular}-form`], data)
    const form = document.querySelector('form');
    form.addEventListener('submit', this.updateLab);
    if (auth.currentUser) {
      document.getElementById('edit-button').classList.remove('visually-hidden');
    }
  },

  async initializeLogs(id) {
    /**
     * Initialize logs for a lab.
     * @param {String} id The ID of a lab.
     */
    const data = this.getLabLogs(id);
    // TODO: Show the a lab logs!
    console.log('Found logs:', data);

  },

  searchLabTable(event) {
    /**
     * Search the lab table for a given query.
     */
    // FIXME: Search the lab list.
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
    event.preventDefault();
    const form = new FormData(event.target);
    const data = Object.fromEntries(form.entries());
    authRequest('/api/labs', data);
    if (response.success) {
      const message = 'Successfully updated lab.'
      showNotification('Lab Updated', message, /* type = */ 'success');
    } else {
      const message = 'An error occurred when trying to update lab data. Ensure that you have permission to edit this lab.';
      showNotification('Error Updating Lab', message, /* type = */ 'error');
    }
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
    if (parseInt(currentHeight, 10) > 540 || original) {
      document.getElementById('labs-table').style.height = '540px';
    }
    document.getElementById('view-all-labs').classList.remove('d-none');
    document.getElementById('view-less-labs').classList.add('d-none');
  },

  suggestAnalyses() {
    /**
     * Suggest analyses for a given lab to the staff.
     */
    // TODO:
  },

  suggestLab() {
    /**
     * Suggest a lab to the staff.
     */
    // TODO:
  },

  suggestPrices() {
    /**
     * Suggest analyses prices for a given lab to the staff.
     */
    // TODO:
  },

}

const renderAnalyses = (params) => {
  /**
   * Render analyses as chips in an AG grid table.
   * @param {Object} params The parameters passed by AG grid.
   */
  console.log(params.value);
  const analyses = params.value || [];
  if (analyses.length) {
    let html = '';
    try {
      analyses.forEach((analysis) => {
        // TODO: Style analyses as chips: Assign color based on analysis.
        html+= `<span class="badge rounded-pill">${analysis}</span>`;
      });
    } catch(error) {}
    return html;
  } else return `<button class="btn btn-sm nav-link">Suggest analyses</button>`;
};

const renderAuthRequired = (params) => {
  /**
   * Render analyses as chips in an AG grid table.
   * @param {Object} params The parameters passed by AG grid.
   */
  const user = getCurrentUser();
  if (user) {
    if (params.value) return `<span>${params.value}</span>`;
    else return '';
  } else return `<button class="btn btn-sm nav-link">Sign In or Sign Up to See</button>`;
};

const renderViewLabButton = (params) => {
  return `
  <a href="${window.location.origin}/testing/labs/${params.value}">
    <svg id="emoji" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
      <g id="color">
        <ellipse cx="43.9713" cy="25.4757" rx="11.1657" ry="11.1656" transform="matrix(0.5379 -0.843 0.843 0.5379 -1.1578 48.8391)" fill="#FFFFFF" stroke="none"/>
        <path fill="#92D3F5" stroke="none" d="M53.4402,31.8458c1.461-2.289,2.284-6.5149,1.6981-9.1673c-0.4014-1.8161-2.6553-3.8396-3.8988-5.1585 c0.6487,2.3544,1.0384,7.3509-2.1852,11.9716c-2.7358,3.9212-6.6908,5.6353-8.9477,6.0576 C44.3554,36.8323,50.9377,35.7667,53.4402,31.8458z"/>
        <path fill="#D0CFCE" stroke="none" d="M51.7774,13.2414c-3.2684-2.0837-7.1512-2.7717-10.9373-1.9372c-3.785,0.8366-7.0182,3.097-9.1041,6.3645 c-4.3036,6.746-2.3176,15.7369,4.4283,20.0415c6.745,4.3047,15.7348,2.3197,20.0415-4.4273 c2.0849-3.2675,2.7728-7.1524,1.9362-10.9374C57.3054,18.5604,55.046,15.3273,51.7774,13.2414z M53.6137,31.629 c-2.1788,3.4147-5.8819,5.2814-9.6611,5.2814c-2.1045,0.0009-4.2319-0.5785-6.1343-1.7924 c-5.3172-3.3926-6.8818-10.4791-3.4892-15.7954c1.6436-2.5754,4.1915-4.3576,7.1747-5.0159 c2.9841-0.6584,6.0444-0.1176,8.6208,1.5269c2.5755,1.6426,4.3567,4.1905,5.016,7.1747 C55.7999,25.9914,55.2572,29.0526,53.6137,31.629z"/>
        <path fill="#3F3F3F" stroke="none" d="M31.4429,40.2651l-6.918,10.335l-3.7106,5.8155c-0.4778,0.75,0.3797,3.2105,1.1294,3.6888 c0.3613,0.2305,2.5325,0.011,2.5325,0.011L36,42.9231L31.4429,40.2651z"/>
      </g>
      <g id="hair"/>
      <g id="skin"/>
      <g id="skin-shadow"/>
      <g id="line">
        <ellipse cx="43.9712" cy="25.4757" rx="14.6372" ry="14.6372" transform="matrix(0.5379 -0.843 0.843 0.5379 -1.1578 48.8391)" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/>
        <ellipse cx="43.9713" cy="25.4757" rx="11.1657" ry="11.1656" transform="matrix(0.5379 -0.843 0.843 0.5379 -1.1578 48.8391)" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2"/>
        <path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="2" d="M31.3102,39.9657l4.4057,2.811L25.22,59.2267c-0.7499,1.1753-2.344,1.4986-3.5606,0.7224l0,0 c-1.2166-0.7763-1.595-2.3582-0.8451-3.5335L31.3102,39.9657z"/>
      </g>
    </svg>
  </a>`;
}
