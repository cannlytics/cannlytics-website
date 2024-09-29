/**
 * Search JavaScript | Cannlytics Website
 * Copyright (c) 2024 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 9/28/2024
 * Updated: 9/28/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { onAuthChange, getCurrentUser } from '../firebase.js';
import { authRequest  } from '../utils.js';

export const searchJS = {

  selectedDataType: 'ALL',
  selectedState: 'ALL',

  initializeSearchBar() {
    /* Initialize the search bar. */

    // Get search elements.
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.getElementById('search-container');
    const filterMenu = document.getElementById('filter-menu');
    const filterButton = document.getElementById('search-filter-button');

    function updateFilterMenuSize() {
      /* Match the filter menu width to the search container width. */
      const searchContainerWidth = searchContainer.offsetWidth;
      const searchContainerLeft = searchContainer.getBoundingClientRect().left + window.pageXOffset;
      filterMenu.style.width = `${searchContainerWidth}px`;
      filterMenu.style.left = `${searchContainerLeft}px`;
    }

    // Change the filter menu size when the page changes.
    updateFilterMenuSize();
    window.addEventListener('resize', updateFilterMenuSize);
    onAuthChange(async user => {
      updateFilterMenuSize();
    });

    filterButton.addEventListener('click', function() {

      // Toggle the dropdown menu
      filterMenu.classList.toggle('show');

    });

    // Close menu if clicked outside
    document.addEventListener('click', (event) => {
      if (!searchContainer.contains(event.target) && !filterMenu.contains(event.target)) {
        filterMenu.classList.remove('show');
      }
    });

    // Handle search button click
    searchButton.addEventListener('click', () => {
      this.performSearch();
    });

    // Handle 'Enter' key in search input
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.performSearch();
      }
    });

    // Functions to handle selection
    window.selectDataType = (selectedType) => {
      // Reset all buttons to 'btn-outline-primary'
      document.querySelectorAll('.btn-group[data-group="data-type"] .btn').forEach((btn) => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
      });

      // Set the selected button to 'btn-primary'
      document.getElementById('btn' + selectedType).classList.remove('btn-outline-primary');
      document.getElementById('btn' + selectedType).classList.add('btn-primary');

      // Update the selected data type
      this.selectedDataType = selectedType;
    };

    window.selectState = (selectedStateParam) => {
      document.querySelectorAll('.btn-group[data-group="state"] .btn').forEach((btn) => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
      });
      document.getElementById('btn' + selectedStateParam).classList.remove('btn-outline-primary');
      document.getElementById('btn' + selectedStateParam).classList.add('btn-primary');

      // Update the selected state
      this.selectedState = selectedStateParam;
    };

  },

  performSearch() {
    /* Perform a search. */
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    const startDateInput = document.getElementById('dateTestedStart').value;
    const endDateInput = document.getElementById('dateTestedEnd').value;
    const params = new URLSearchParams();
    if (query) {
      params.append('q', query);
    }
    if (this.selectedDataType && this.selectedDataType !== 'ALL') {
      params.append('data_type', this.selectedDataType);
    }
    if (this.selectedState && this.selectedState !== 'ALL') {
      params.append('state', this.selectedState);
    }
    if (startDateInput) {
      params.append('start_date', startDateInput);
    }
    if (endDateInput) {
      params.append('end_date', endDateInput);
    }
    window.location.href = '/search?' + params.toString();
  },

  initializeSearchResults() {
    /* Initialize the search results. */

    // Parse query parameters from the URL.
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const dataType = params.get('data_type') || 'ALL';
    const state = params.get('state') || 'ALL';
    const startDate = params.get('start_date') || '';
    const endDate = params.get('end_date') || '';

    // Update the search input and filters on the page.
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = query;
    }

    // Update data type selection
    window.selectDataType(dataType);

    // Update state selection
    window.selectState(state);

    // Update date inputs
    const startDateInput = document.getElementById('dateTestedStart');
    const endDateInput = document.getElementById('dateTestedEnd');
    if (startDateInput && startDate) {
      startDateInput.value = startDate;
    }
    if (endDateInput && endDate) {
      endDateInput.value = endDate;
    }

    // Build the search parameters for the API
    const searchParams = {
      q: query,
    };
    if (dataType && dataType !== 'ALL') {
      searchParams['data_type'] = dataType;
    }
    if (state && state !== 'ALL') {
      searchParams['state'] = state;
    }
    if (startDate) {
      searchParams['start_date'] = startDate;
    }
    if (endDate) {
      searchParams['end_date'] = endDate;
    }

    // Call the API
    authRequest('/api/search', searchParams)
      .then(response => {
        // Display the search results.
        this.displaySearchResults(response);
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
        // Handle error, show error message to the user
      });

  },

  displaySearchResults(data) {
    // Implement the logic to display search results on the page
    // For example, update the DOM to show the results
    const resultsContainer = document.querySelector('.markdown.row.pt-4');
    if (resultsContainer) {
      // Clear previous results
      resultsContainer.innerHTML = '';

      if (data.results && data.results.length > 0) {
        data.results.forEach(result => {
          // Create elements to display each result
          const resultElement = document.createElement('div');
          resultElement.classList.add('search-result');
          // Customize this part based on the data structure
          resultElement.innerHTML = `
            <h3>${result.title}</h3>
            <p>${result.description}</p>
            <!-- Add more details as needed -->
          `;
          resultsContainer.appendChild(resultElement);
        });
      } else {
        // No results found
        resultsContainer.innerHTML = '<p>No results found.</p>';
      }
    }
  },

  searchAPI() {
    /* Search the Cannlytics API. */

    // TODO: Implement.

  },

};
