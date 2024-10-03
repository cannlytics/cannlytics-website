/**
 * Standardizer JavaScript | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 9/24/2024
 * Updated: 9/24/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import {deleteDocument, listenToCollection, onAuthChange } from '../firebase.js';
import { authRequest, showNotification } from '../utils.js';

export const standardizer = {

  initializeStandardizer() {
    /* Initialize the standardizer. */
  
    // Initialize the interface when the user is loaded.
    onAuthChange(async user => {
      if (user) {

        // Listen to user's standardized downloads
        console.log('Getting `standardized_downloads` for user:', user.uid);
        listenToCollection(
          `users/${user.uid}/standardized_downloads`,
          { order: 'created_at', desc: true },
          null,
          addDownloadToUI,
          updateDownloadInUI,
          removeDownloadFromUI
        );

      }

      // FIXME: Initialize the paywall if there is no user.
    });
    
  },

  async standardizeText(text) {
    /* Standardize the text. */
    // FIXME: Implement API.
    const response = await authRequest('/api/standardize', { text });
    const details = response.data;
    console.log('Standardized text:', details);
    document.getElementById('productName').value = details.standard_product_name;
    document.getElementById('strainName').value = details.standard_strain_name;
    document.getElementById('productType').value = details.standard_product_type;
  },

  async standardizeFile(file) {
    /* Standardize the file. */
    // FIXME: Implement API.
    const data = new FormData();
    data.append('file', file);
    authRequest('/api/standardize', { data }, {file: true});
    showNotification('File processing', 'Your download will be available below.', 'wait', 3500);
  },

  resetStandardizer() {
    /* Reset the standardizer form. */
    document.getElementById('productName').value = '';
    document.getElementById('strainName').value = '';
    document.getElementById('productType').value = '';
    document.getElementById('inputText').value = '';
    document.getElementById('fileInput').value = '';
  },

  noFileSelected() {
    /* Handle no file selected. */
    showNotification('No file selected', 'Please select a file to standardize.', 'error', 3500);
  }

};

function addDownloadToUI(download) {
  /* Add a download to the UI. */
  console.log('Adding download to UI:', download);
  const container = document.getElementById('downloadsContainer');
  const downloadElement = createDownloadElement(download);
  container.appendChild(downloadElement);
  
  // Show the downloads section if it was hidden
  const downloadsSection = document.getElementById('standardizer-downloads');
  downloadsSection.classList.remove('visually-hidden');
}

function updateDownloadInUI(download) {
  /* Update a download in the UI. */
  console.log('Updating download in UI:', download);
  const existingElement = document.getElementById(`download-${download.id}`);
  if (existingElement) {
    const updatedElement = createDownloadElement(download);
    existingElement.replaceWith(updatedElement);
  }
}

function removeDownloadFromUI(download) {
  /* Remove a download from the UI. */
  const element = document.getElementById(`download-${download.id}`);
  if (element) {
    element.remove();
    
    // Check if there are any remaining downloads
    const container = document.getElementById('downloadsContainer');
    if (container.children.length === 0) {
      // If no downloads remain, hide the downloads section
      const downloadsSection = document.getElementById('standardizer-downloads');
      downloadsSection.classList.add('visually-hidden');
    }
  }
}

function createDownloadElement(download) {
  /* Create a download element. */
  const element = document.createElement('div');
  element.id = `download-${download.id}`;
  element.className = 'card mb-3';
  element.innerHTML = `
    <div class="card-body d-flex justify-content-between align-items-center">
      <div>
        <h5 class="sans-serif-text text-dark mb-0">${download.file_name}</h5>
        <p class="mb-0 mt-0">
          <small class="sans-serif-text text-secondary">
            Generated: ${new Date(download.created_at).toLocaleString()}
          </small>
        </p>
      </div>
      <div>
        <a href="${download.download_url}" class="btn btn-sm btn-primary text-dark me-2" download>
          <i class="bi bi-download me-2"></i>Download
        </a>
        <button class="btn btn-warning delete-btn text-dark" data-id="${download.id}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  // Add event listener for delete button
  const deleteBtn = element.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this download?')) {
      try {
        const userId = cannlytics.firebase.getCurrentUser().uid;
        console.log('User:', userId);
        console.log('Deleting download:', download.id);
        await deleteDocument(`users/${userId}/standardized_downloads/${download.id}`);
        // The UI will update automatically due to the Firestore listener
      } catch (error) {
        console.error('Error deleting document:', error);
        showNotification('Error deleting download', 'An error occurred while deleting the download. Please try again.', 'error', 5500);
      }
    }
  });
  
  return element;
}
