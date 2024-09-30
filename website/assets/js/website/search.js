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

    // // Infinite scroll logic
    // window.addEventListener('scroll', () => {
    //   const scrollHeight = document.documentElement.scrollHeight;
    //   const scrollTop = document.documentElement.scrollTop;
    //   const clientHeight = document.documentElement.clientHeight;
    //   if (scrollTop + clientHeight >= scrollHeight - 10) {
    //     // Load more results when the user scrolls near the bottom
    //     // cannlytics.search.loadMoreResults();
    //     console.log('Time to search!!!');
    //   }
    // });

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

    // TODO: Add functionality to data type selection.
    document.getElementById('filter-select').addEventListener('change', function() {
      const selectedFilter = this.value;
      console.log("Filter selected: ", selectedFilter);
      // window.location.href = `/search?filter=${selectedFilter}`;
    });

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
        this.displaySearchResults(response.data);
        // DEV:
        // this.displaySearchResults([]);
      })
      .catch(error => {
        console.error('Error fetching search results:', error);
        // Handle error, show error message to the user
      });

  },

  displaySearchResults(data) {
    /* Display the search results on the page. */
    console.log('DATA:' , data);
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    if (data && data.length > 0) {
      data.forEach(result => {
        const resultCard = this.formatSearchResultRow(result);
        resultsContainer.innerHTML += resultCard;
      });
    } else {
      resultsContainer.innerHTML = '<p class="sans-serif">No results found.</p>';
    }
  },

  formatSearchResultRow(result) {
    // FIXME: Use better up / down arrows and fill-them in / change color on hover.
    return `
    <div class="col-md-12 mb-3">
      <div class="card shadow-sm border-0">
        <div class="card-body d-flex justify-content-between">
          <div class="d-flex align-items-center">
            <img src="${result.image}" alt="${result.data_type}" class="rounded me-3" width="75" height="75">
            <div>
              <a class="fs-6 sans-serif text-decoration-none text-dark" href="${result.link}">${result.title}</a>
              <p class="small mt-0 mb-1">
                <small class="sans-serif">by
                <a class="text-muted" href="/user/${result.user_name}">
                  <small class="sans-serif">${result.user_name}</small>
                </a> - Updated on ${result.updated_on}</small>
              </p>
              <div class="d-flex">
                ${result.badges.map(badge => `
                  <span class="badge" style="background-color: ${badge.color};">
                    ${badge.icon ? `<i class="${badge.icon}"></i>` : ''} ${badge.text}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="d-flex flex-column justify-content-between align-items-center">
            <div class="d-flex">
              <button class="btn btn-outline-secondary btn-sm me-2"><i class="bi bi-star"></i></button>
              <div class="dropdown">
                <button class="btn btn-outline-secondary btn-sm dropdown-toggle no-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu dropdown-compact py-0">
                  <li class="mb-0"><a class="dropdown-item py-1 fw-normal" href="#"><small>🔗 Share</small></a></li>
                  <li class="mb-0"><a class="dropdown-item py-1 fw-normal" href="#"><small>💾 Save</small></a></li>
                  <li class="mb-0"><hr class="dropdown-divider my-0"></li>
                  <li class="mb-0"><a class="dropdown-item py-1 fw-normal text-danger" href="#"><small>🚩 Report</small></a></li>
                </ul>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <button class="btn btn-sm text-muted"><i class="bi bi-arrow-up"></i></button>
              <span class="mx-1"><small class="fw-bold text-dark">${result.rating}</small></span>
              <button class="btn btn-sm text-muted"><i class="bi bi-arrow-down"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  // <div class="mt-2">
  //   <button class="btn btn-link text-muted">Share</button>
  //   <button class="btn btn-link text-muted">Save</button>
  // </div>
  },

};
