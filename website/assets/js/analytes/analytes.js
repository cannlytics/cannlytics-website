/**
 * Analytes JavaScript | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 10/14/2024
 * Updated: 10/14/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
 import { createGrid } from 'ag-grid-community';
import { getCollection, getDocument } from '../firebase.js';
import { formatDate, formatDecimal } from '../utils.js';

export const analytesJS = {


  async searchAnalytes() {
    /**
     * Use `key_embedding` to search for the nearest analyte.
     */

    // TODO: Implement!

  },
  
  async initializeAnalytes() {
    /**
     * Initialize the analytes page.
     */
    console.log('Initializing analytes page...');

    // TODO: Use query parameters to filter by analysis.
    const analysis = new URLSearchParams(window.location.search).get('analysis');

  
    // Get analytes from Firestore.
    // FIXME: Re-write with new query syntax.
    const data = await getCollection('analytes', {
      order: 'analysis',
      desc: false,
    });
    console.log('Data:', data);

    // FIXME: Render the analytes in the user interface.

  },

  async initializeAnalyte(key) {
    /**
     * Initialize the compound page.
     */
    console.log('Initializing compound page', key);

    // Get the compound from Firestore.
    const data = await getDocument(`analytes/${key}`);
    console.log('Analyte:', data);

    // FIXME: Render the compound in the user interface.

    // Update the compound page.
    // document.getElementById('compound_name').innerText = data.name;
    // document.getElementById('compound_description').innerText = data.description;
    // document.getElementById('compound_formula').innerText = data.formula;
    // document.getElementById('compound_molar_mass').innerText = data.molar_mass;

  },

};
