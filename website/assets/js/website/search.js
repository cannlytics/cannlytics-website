/**
 * Search JavaScript | Cannlytics Website
 * Copyright (c) 2024 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 9/28/2024
 * Updated: 10/2/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { Modal } from 'bootstrap';
import { onAuthChange, getCurrentUser, getDocument } from '../firebase.js';
import { authRequest, showNotification  } from '../utils.js';

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

  initializeReportButtons() {
    /* Initialize the report buttons. */
  
    // Add event listeners to all "Report" buttons
    document.querySelectorAll('.dropdown-item.text-danger').forEach(button => {
      button.addEventListener('click', function(event) {
        event.preventDefault();
        const reportModal = new Modal(document.getElementById('reportModal'));
        reportModal.show();
        const resultId = this.closest('.card').dataset.hash;
        document.getElementById('submitReport').dataset.hash = resultId;
      });
    });
  
    // Handle the form submission
    document.getElementById('submitReport').addEventListener('click', function() {
      const reportReason = document.querySelector('input[name="reason"]:checked').value;
      const details = document.getElementById('reportDetails').value;
      const reportId = this.dataset.hash;
      const data = {
        id: reportId,
        reason: reportReason,
        details: details,
      };
      authRequest('/src/report', { data })
        .then(response => {
          showNotification('Report Submitted', 'Thank you for reporting. We will review the issue.', 'success');
        })
        .catch(error => {
          showNotification('Error', 'There was an error submitting your report. Please try again later.', 'error');
        });
      const reportModal = Modal.getInstance(document.getElementById('reportModal'));
      reportModal.hide();
    });
  },

  initializeShareButtons() {
    // Initialize the share buttons.
    document.querySelectorAll('.share-btn').forEach(button => {
      button.addEventListener('click', function(event) {
        event.preventDefault();
        const link = `https://cannlytics.com${this.dataset.link}`;
        navigator.clipboard.writeText(link).then(() => {
          showNotification('Link Copied!', 'Link copied. Share as you see fit.', 'success');
        }).catch(err => {
          // Show an error notification if something goes wrong.
          showNotification('Error', 'Failed to copy the link.', 'error');
          console.error('Could not copy text: ', err);
        });
      });
    });
  },

  initializeStarButtons() {
    /* Initialize the star buttons. */
    document.querySelectorAll('.star-btn').forEach(button => {
      button.addEventListener('click', function() {
        const icon = this.querySelector('.star-icon');
        // FIXME: `observationId` is 'undefined'.
        const observationId = this.dataset.hash;
        const dataType = this.dataset.type;
        const isStarred = this.dataset.starred === "true";
        
        if (!isStarred) {
          // User is starring the observation
          icon.classList.remove('bi-star');
          icon.classList.add('bi-star-fill');
          this.dataset.starred = "true";
  
          // Send star request to server
          starObservation(observationId, true, dataType);
  
        } else {
          // User is unstarring the observation
          icon.classList.remove('bi-star-fill');
          icon.classList.add('bi-star');
          this.dataset.starred = "false";
  
          // Send unstar request to server
          starObservation(observationId, false, dataType);
        }
      });
    });
  },

  initializeVoteButtons() {
    /* Initialize the vote buttons. */
    document.querySelectorAll('.upvote').forEach(button => {
      button.addEventListener('click', function() {
        const img = this.querySelector('.arrow-icon');
        const observationId = this.dataset.hash;
        const dataType = this.dataset.type;
        const isVoted = this.dataset.voted === "true";
        const ratingElement = this.nextElementSibling.querySelector('.fw-bold');
        let currentRating = parseInt(ratingElement.textContent, 10);
  
        if (!isVoted) {
          // User is upvoting
          img.src = '/static/website/images/ai-icons/up-arrow-filled-dark.svg';
          this.dataset.voted = "true";
          this.nextElementSibling.nextElementSibling.disabled = true;
          ratingElement.textContent = currentRating + 1; // Increment vote count in UI
  
          // Send upvote request to server
          voteObservation(observationId, 'up', dataType);
        } else {
          // User is removing the upvote
          img.src = '/static/website/images/ai-icons/up-arrow.svg';
          this.dataset.voted = "false";
          this.nextElementSibling.nextElementSibling.disabled = false;
          ratingElement.textContent = currentRating - 1; // Decrement vote count in UI
  
          // Remove vote request to server
          voteObservation(observationId, null, dataType);
        }
      });
    });
  
    document.querySelectorAll('.downvote').forEach(button => {
      button.addEventListener('click', function() {
        const img = this.querySelector('.arrow-icon');
        const observationId = this.dataset.hash;
        const dataType = this.dataset.type;
        const isVoted = this.dataset.voted === "true";
        const ratingElement = this.previousElementSibling.querySelector('.fw-bold');
        let currentRating = parseInt(ratingElement.textContent, 10);
  
        if (!isVoted) {
          // User is downvoting
          img.src = '/static/website/images/ai-icons/down-arrow-filled-dark.svg';
          this.dataset.voted = "true";
          this.previousElementSibling.previousElementSibling.disabled = true;
          ratingElement.textContent = currentRating - 1; // Decrement vote count in UI
  
          // Send downvote request to server
          voteObservation(observationId, 'down', dataType);
        } else {
          // User is removing the downvote
          img.src = '/static/website/images/ai-icons/down-arrow.svg';
          this.dataset.voted = "false";
          this.previousElementSibling.previousElementSibling.disabled = false;
          ratingElement.textContent = currentRating + 1; // Increment vote count in UI
  
          // Remove vote request to server
          voteObservation(observationId, null, dataType);
        }
      });
    });
  },

  async fetchUserStarsAndVotes(observations) {
    /* Fetch the stars and votes for the current user. */
    const user = getCurrentUser();
    const uid = user.uid;

    // Loop through the observations and fetch stars/votes.
    for (let obs of observations) {
      const starPath = `users/${uid}/stars/${obs.id}`;
      const votePath = `users/${uid}/votes/${obs.id}`;
      
      // Fetch stars.
      const starData = await getDocument(starPath);
      if (Object.keys(starData).length > 0) {
        // Star exists, mark the star button as active.
        const starButton = document.querySelector(`.star-btn[data-hash="${obs.id}"]`);
        if (starButton) {
          const icon = starButton.querySelector('.star-icon');
          starButton.dataset.starred = "true";
          icon.classList.remove('bi-star');
          icon.classList.add('bi-star-fill');
        }
      }

      // Fetch votes.
      const voteData = await getDocument(votePath);
      if (Object.keys(voteData).length > 0) {
        const voteType = voteData.vote_type;
        const upvoteButton = document.querySelector(`.upvote[data-hash="${obs.id}"]`);
        const downvoteButton = document.querySelector(`.downvote[data-hash="${obs.id}"]`);
        if (voteType === 'up' && upvoteButton) {
          upvoteButton.dataset.voted = "true";
          upvoteButton.querySelector('.arrow-icon').src = '/static/website/images/ai-icons/up-arrow-filled-dark.svg';
          downvoteButton.disabled = true; // Disable opposite vote button
        } else if (voteType === 'down' && downvoteButton) {
          downvoteButton.dataset.voted = "true";
          downvoteButton.querySelector('.arrow-icon').src = '/static/website/images/ai-icons/down-arrow-filled-dark.svg';
          upvoteButton.disabled = true; // Disable opposite vote button
        }
      }
    }
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
    this.initializeVoteButtons();
    this.initializeStarButtons();
    this.initializeShareButtons();
    this.initializeReportButtons();
    updateCounts(data);
    // const moreButtonContainer = document.getElementById('more-button-container');
    // if (data.length === limit) {
    //   moreButtonContainer.classList.remove('d-none');
    // } else {
    //   moreButtonContainer.classList.add('d-none');
    // }
  },

  formatSearchResultRow(result) {
    return `
    <div class="col-md-12 mb-3">
      <div class="card shadow-sm border-0">
        <div class="card-body d-flex justify-content-between">
          <div class="d-flex align-items-center">
            <img src="${result.image}" alt="${result.data_type}" class="rounded me-3" width="75" height="75">
            <div>
              <a class="fs-6 sans-serif text-decoration-none text-dark" href="${result.link}">${result.title}</a>
              <p class="small mt-0 mb-1">
                <small class="sans-serif text-dark">by
                <a class="text-dark" href="/user/${result.user_name}">
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
              <button class="btn btn-outline-secondary btn-sm me-2 star-btn" data-starred="false" data-hash="${result.id}" data-type="${result.data_type}">
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
                    <a class="dropdown-item py-1 fw-normal text-danger" href="#">
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
              <span class="mx-1"><small class="fw-bold text-dark">${result.rating}</small></span>
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

async function voteObservation(observationId, voteType, dataType) {
  /* Vote on an observation. */
  const data = {
    id: observationId,
    vote: voteType,
    type: dataType
  };
  try {
    const response = await authRequest('/src/vote', data);
    if (response.status === 'success') {
      console.log(`Observation ${observationId} in ${dataType} collection voted as ${voteType}!`);
    } else {
      console.error('Vote failed:', response.error);
    }
  } catch (err) {
    console.error('Error voting on observation:', err);
  }
}

async function starObservation(observationId, isStarred, dataType) {
  /* Star or unstar an observation. */
  const data = {
    id: observationId,
    star: isStarred,
    data_type: dataType
  };
  try {
    const response = await authRequest('/src/star', data);
    if (response.status === 'success') {
      console.log(`Observation ${observationId} in ${dataType} collection star status updated!`);
    } else {
      console.error('Star operation failed:', response.error);
    }
  } catch (err) {
    console.error('Error starring/un-starring observation:', err);
  }
}

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
