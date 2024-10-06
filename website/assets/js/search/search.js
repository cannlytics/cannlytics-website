/**
 * Search JavaScript | Cannlytics Website
 * Copyright (c) 2024 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 9/28/2024
 * Updated: 10/5/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { onAuthChange, getCurrentUser, getDocument } from '../firebase.js';
import { authRequest, showNotification  } from '../utils.js';
import {
  initializeReportButtons,
  initializeShareButtons,
  initializeStarButtons,
  initializeVoteButtons,
} from '../stats/stats.js';

export const searchJS = {

  selectedDataType: 'all',
  selectedState: 'all',

  initializeSearchBar() {
    /* Initialize the search bar. */

    // Get search elements.
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.getElementById('search-container');
    const filterMenu = document.getElementById('filter-menu');
    const filterButton = document.getElementById('search-filter-button');

    // Change the filter menu size when the page changes.
    this.updateFilterMenuSize();
    window.addEventListener('resize', this.updateFilterMenuSize);

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
    if (this.selectedDataType && this.selectedDataType !== 'all') {
      params.append('data_type', this.selectedDataType);
    }
    if (this.selectedState && this.selectedState !== 'all') {
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
    const dataType = params.get('data_type') || 'all';
    const state = params.get('state') || 'all';
    const startDate = params.get('start_date') || '';
    const endDate = params.get('end_date') || '';
    let limit = parseInt(params.get('limit')) || 10;

    // Initialize the "More" button.
    this.initializeMoreButton();

    // Update the search input and filters on the page.
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = query;
    }

    // Style the data type select.
    document.querySelectorAll('#sidebar .filter-item').forEach(item => {
      item.classList.remove('active-filter'); // Clear any active filter
      const itemType = item.getAttribute('data-type');
      if (itemType === dataType) {
        item.classList.add('active-filter'); // Set the active filter
      }
    });
    const filterSelect = document.getElementById('filter-select');
    if (filterSelect) {
      filterSelect.value = dataType;
    }

    // Update data type selection
    this.selectDataType(dataType);

    // Update state selection
    this.selectState(state);

    // Add functionality to data type selection.
    // document.getElementById('filter-select').addEventListener('change', function() {
    //   const selectedFilter = this.value;
    //   console.log("Filter selected: ", selectedFilter);
    //   // window.location.href = `/search?filter=${selectedFilter}`;
    // });

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
    const searchParams = {q: query, limit: limit};
    if (dataType && dataType !== 'all') {
      searchParams['data_type'] = dataType;
    }
    if (state && state !== 'all') {
      searchParams['state'] = state;
    }
    if (startDate) {
      searchParams['start_date'] = startDate;
    }
    if (endDate) {
      searchParams['end_date'] = endDate;
    }

    // Setup the paywall.
    const searchContent = document.getElementById('search-content');
    const subscribeContent = document.getElementById('subscribe-content');
    searchContent.style.display = 'none';

    // Listen for the usr.
    onAuthChange(async user => {

      // Update the filter menu size.
      this.updateFilterMenuSize();
      
      // Only search the API if the user is authenticated.
      if (user) {
        searchContent.style.display = 'flex';
        subscribeContent.style.display = 'none';
        authRequest('/api/search', searchParams)
          .then(response => {
            this.displaySearchResults(response.data, limit);
          })
          .catch(error => {
            showNotification('Error', 'There was an error getting search results. Please contact support or try again later.', 'error');
          });
      }

      // Show the paywall for non-authenticated users.
      subscribeContent.style.display = 'flex';
      searchContent.style.display = 'none';
    });

  },

  initializeMoreButton() {
    /* Initialize the "More" button. */
    document.getElementById('more-button').addEventListener('click', function() {
      const params = new URLSearchParams(window.location.search);
      let currentLimit = parseInt(params.get('limit')) || 10;
      currentLimit += 10;
      params.set('limit', currentLimit);
      window.history.pushState({}, '', '?' + params.toString());
      cannlytics.search.initializeSearchResults();
    });
  },

  displaySearchResults(data, limit) {
    /* Display the search results on the page. */
    console.log('DATA:', data);
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    const filteredData = this.selectedDataType === 'all' ? data : data.filter(result => result.data_type === this.selectedDataType);
    const observationList = [];
    if (filteredData && filteredData.length > 0) {
      filteredData.forEach(result => {
        const resultCard = this.formatSearchResultRow(result);
        resultsContainer.innerHTML += resultCard;
        observationList.push({
          id: result.id,
          data_type: result.data_type
        });
      });
      this.fetchUserStarsAndVotes(observationList);
    } else {
      resultsContainer.innerHTML = '<p class="sans-serif">No results found.</p>';
    }

    // Initialize card functionality.
    initializeReportButtons();
    initializeShareButtons();
    initializeStarButtons();
    initializeVoteButtons();

    // Update the badge counts in the sidebar.
    updateCounts(data);

  },

  formatSearchResultRow(result) {
    return `
    <div class="col-md-12 mb-3">
      <div class="card shadow-sm border-0">
        <div class="card-body d-flex justify-content-between">
          <div class="d-flex align-items-center">
            <a href="${result.link}">
              <img src="${result.image}" alt="${result.data_type}" class="rounded me-3" width="75" height="75">
            </a>
            <div>
              <a class="fs-6 sans-serif text-decoration-none text-dark" href="${result.link}">${result.title}</a>
              <p class="small mt-0 mb-1">
                <small class="sans-serif text-dark">by
                <a class="text-dark" href="/user/${result.user_name}">
                  <small class="sans-serif">${result.user_name}</small>
                </a> - Updated on ${result.updated_on}</small>
              </p>
              <div class="d-flex">
                ${result.tags.map(tag => `
                  <a href="/search?q=${tag.tag_name}">
                    <span class="badge" style="background-color: ${tag.tag_color};">
                      ${tag.tag_name.toString()}
                    </span>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="d-flex flex-column justify-content-between align-items-center">
            <div class="d-flex">
              <button class="btn btn-outline-secondary btn-sm me-2 star-btn" data-starred="false" data-hash="${result.id}" data-type="${result.data_type}">
                <span class="star-count mx-1">${item.star_count || 0}</span>
                <i class="bi bi-star star-icon"></i>
              </button>
              <div class="dropdown">
                <button class="btn btn-outline-secondary btn-sm dropdown-toggle no-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu dropdown-compact py-0">
                  <li class="mb-0">
                    <a class="dropdown-item py-1 fw-normal share-btn" href="#" data-link="${result.link}">
                      <small>🔗 Share</small>
                    </a>
                  </li>
                  <li class="mb-0">
                    <a class="report-link dropdown-item py-1 fw-normal text-danger" href="#">
                      <small>🚩 Report</small>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <button class="btn btn-sm upvote" data-voted="false" data-hash="${result.id}" data-type="${result.data_type}">
                <img src="/static/website/images/ai-icons/up-arrow.svg" alt="Upvote" class="arrow-icon">
              </button>
              <span class="mx-1"><small class="rating fw-bold text-dark">${result.upvote_count - result.downvote_count}</small></span>
              <button class="btn btn-sm downvote" data-voted="false" data-hash="${result.id}" data-type="${result.data_type}">
                <img src="/static/website/images/ai-icons/down-arrow.svg" alt="Downvote" class="arrow-icon">
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  },
  // Optional: Add save button.
  // <li class="mb-0"><a class="dropdown-item py-1 fw-normal" href="#"><small>💾 Save</small></a></li>
  // <li class="mb-0"><hr class="dropdown-divider my-0"></li>

  updateFilterMenuSize() {
    /* Match the filter menu width to the search container width. */
    const filterMenu = document.getElementById('filter-menu');
    const searchContainer = document.getElementById('search-container');
    const searchContainerWidth = searchContainer.offsetWidth;
    const searchContainerLeft = searchContainer.getBoundingClientRect().left + window.pageXOffset;
    filterMenu.style.width = `${searchContainerWidth}px`;
    filterMenu.style.left = `${searchContainerLeft}px`;
  },

  filterByDataType(dataType) {
    /* Filter the search results by data type. */
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('data_type', dataType);
    window.location.href = currentUrl.toString();
  },

  selectDataType(selectedType) {
    /* Select a data type. */
    document.querySelectorAll('.btn-group[data-group="data-type"] .btn').forEach((btn) => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline-primary');
    });
    document.getElementById('btn-' + selectedType).classList.remove('btn-outline-primary');
    document.getElementById('btn-' + selectedType).classList.add('btn-primary');
    this.selectedDataType = selectedType;
  },

  selectState(selectedStateParam) {
    /* Select a state. */
    document.querySelectorAll('.btn-group[data-group="state"] .btn').forEach((btn) => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline-primary');
    });
    document.getElementById('btn-' + selectedStateParam).classList.remove('btn-outline-primary');
    document.getElementById('btn-' + selectedStateParam).classList.add('btn-primary');
    this.selectedState = selectedStateParam;
  },

};

function updateCounts(data) {
  /* Update the badge counts in the sidebar. */
  const counts = {
    all: data.length,
    coas: data.filter(item => item.data_type === 'coas').length,
    results: data.filter(item => item.data_type === 'results').length,
    strains: data.filter(item => item.data_type === 'strains').length,
    organizations: data.filter(item => item.data_type === 'organizations').length,
    compounds: data.filter(item => item.data_type === 'compounds').length,
  };
  updateBadge('[data-type="all"] .badge', counts.all);
  updateBadge('[data-type="coas"] .badge', counts.coas);
  updateBadge('[data-type="results"] .badge', counts.results);
  updateBadge('[data-type="strains"] .badge', counts.strains);
  updateBadge('[data-type="organizations"] .badge', counts.organizations);
  updateBadge('[data-type="compounds"] .badge', counts.compounds);
}

function updateBadge(selector, count) {
  /* Update the badge count in the sidebar. */
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = count;
  }
}
