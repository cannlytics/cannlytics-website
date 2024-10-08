/**
 * Search JavaScript | Cannlytics Website
 * Copyright (c) 2024 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 9/28/2024
 * Updated: 10/6/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { onAuthChange } from '../firebase.js';
import { authRequest  } from '../utils.js';
import {
  initializeReportButtons,
  initializeShareButtons,
  initializeStarButtons,
  initializeVoteButtons,
  fetchUserStarsAndVotes,
} from '../stats/stats.js';

export const searchJS = {

  selectedDataType: 'all',
  selectedState: 'all',
  selectedSort: 'best_match',

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

    // Function to toggle the visibility of the clear button
    searchInput.addEventListener('input', function() {
      if (searchInput.value.length > 0) {
        clearButton.style.display = 'inline-block';
      } else {
        clearButton.style.display = 'none';
      }
    });

    // Clear the input when the clear button is clicked.
    const clearButton = document.getElementById('clear-search-button');
    clearButton.addEventListener('click', function() {
      searchInput.value = '';
      searchInput.focus();
      clearButton.style.display = 'none';
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
    if (this.selectedSort) {
      params.append('sort', this.selectedSort);
    }
    window.location.href = '/search?' + params.toString();
  },

  initializeSearchResults() {
    /* Initialize the search results. */

    // Future work: Infinite scroll logic
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
    const sortOption = params.get('sort') || 'best_match';
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

    // Handle sort change with the select dropdown.
    this.selectedSort = sortOption;
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.value = sortOption;
    sortSelect.addEventListener('change', (event) => {
        const selectedSort = event.target.value;
        this.selectedSort = selectedSort;
        this.performSearch();
    });

    // Future work: Add filter functionality.
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

    // Build the API search query.
    const body = {q: query, limit: limit, sort: sortOption};
    if (dataType && dataType !== 'all') {
      body['data_type'] = dataType;
    }
    if (state && state !== 'all') {
      body['state'] = state;
    }
    if (startDate) {
      body['start_date'] = startDate;
    }
    if (endDate) {
      body['end_date'] = endDate;
    }

    // Setup the paywall.
    const searchContent = document.getElementById('search-content');
    const subscribeContent = document.getElementById('subscribe-content');
    searchContent.classList.remove('d-none');
    console.log('INITIALIZING SEARCH');

    // Listen for the usr.
    onAuthChange(async user => {

      // Update the filter menu size.
      this.updateFilterMenuSize();
      
      // Only search the API if the user is authenticated.
      if (user) {
        console.log('USER:', user);
        searchContent.classList.remove('d-none');
        subscribeContent.classList.add('d-none');
        const response = await authRequest('/api/search', body);
        try {
          this.displaySearchResults(response.data);
        } catch (error) {
          showNotification('Error', 'There was an error getting search results. Please contact support or try again later.', 'error');
        }
      } else {
        // Show the paywall.
        console.log('NO USER');
        searchContent.classList.add('d-none');
        subscribeContent.classList.remove('d-none');
      }
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

  displaySearchResults(data) {
    /* Display the search results on the page. */
    console.log('DATA:', data);
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    const filteredData = this.selectedDataType === 'all' ? data : data.filter(result => result.data_type === this.selectedDataType);
    const observationList = [];
    if (filteredData && filteredData.length > 0) {
      filteredData.forEach(item => {
        const resultCard = this.formatSearchResultRow(item);
        resultsContainer.innerHTML += resultCard;
        observationList.push({
          id: item.id,
          data_type: item.data_type
        });
      });
      fetchUserStarsAndVotes(observationList);
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

  formatSearchResultRow(item) {
    return `
    <div class="col-md-12 mb-3">
      <div class="card shadow-sm border-0">
        <div class="card-body d-flex justify-content-between">
          <div class="d-flex align-items-center">
            <a href="${item.link}" class="rounded me-3 bg-transparent">
              <img src="${item.image_url}" alt="${item.data_type}" class="rounded" width="75" height="75">
            </a>
            <div>
              <a class="fs-6 sans-serif text-decoration-none text-dark" href="${item.link}">${item.title}</a>
              <p class="small mt-0 mb-1">
                <small class="sans-serif text-dark">${item.updated_at}</small>
              </p>
              <div class="d-flex">
                ${item.tags.map(tag => `
                  <a href="/search?q=${tag.tag_name}" class="bg-transparent">
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
              <button class="btn btn-outline-secondary btn-sm me-2 star-btn" data-starred="false" data-hash="${item.id}" data-type="${item.data_type}">
                <span class="star-count mx-1">${item.star_count || 0}</span>
                <i class="bi bi-star star-icon"></i>
              </button>
              <div class="dropdown">
                <button class="btn btn-outline-secondary btn-sm dropdown-toggle no-caret" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu dropdown-compact py-0">
                  <li class="mb-0">
                    <a class="dropdown-item py-1 fw-normal share-btn" href="#" data-link="${item.link}">
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
              <button class="btn btn-sm upvote" data-voted="false" data-hash="${item.id}" data-type="${item.data_type}">
                <img src="/static/website/images/ai-icons/up-arrow.svg" alt="Upvote" class="arrow-icon">
              </button>
              <span class="mx-1"><small class="rating fw-bold text-dark">${item.upvote_count - item.downvote_count}</small></span>
              <button class="btn btn-sm downvote" data-voted="false" data-hash="${item.id}" data-type="${item.data_type}">
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

  // Optional: Add user link.
  // by
  // <a class="text-dark" href="/user/${item.created_by}">
  //   <small class="sans-serif">${item.created_by}</small>
  // </a>

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
