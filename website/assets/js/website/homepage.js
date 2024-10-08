/**
 * Homepage JavaScript | Cannlytics Website
 * Copyright (c) 2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 10/4/2024
 * Updated: 10/6/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, getDocument } from '../firebase.js';
import {
  initializeReportButtons,
  initializeStarButtons,
  initializeShareButtons,
  initializeVoteButtons,
  fetchUserStarsAndVotes,
} from '../stats/stats.js';

export const homepage = {

  // Parameters.
  dataTypes: ['coas', 'results', 'strains', 'licenses', 'compounds'],
  selectedDataType: 'all',
  selectedDirection: 'desc',
  selectedLimit: 3,
  selectedOrder: 'updated_at',
  filters: {},
  dataLoading: false,
  lastDoc: null,
  dataStats: null,
  testData: [
    {
      'id': 'test-coa',
      'title': 'Sample COA Result',
      'created_by': 'cannlytics',
      'updated_at': 'Sep 29, 2024',
      'link': '/coas/sample',
      'data_type': 'coas',
      'image_url': 'https://via.placeholder.com/100',
      'tags': [
        {'tag_id': 'coas', 'tag_name': 'COA', 'tag_color': '#3498db'},
      ],
      'star_count': 0,
      'upvote_count': 1,
      'downvote_count': 0,
    },
    {
      'id': 'test-strain',
      'title': 'Cannabis Strain: OG Kush',
      'created_by': 'cannlytics',
      'updated_at': 'Sep 25, 2024',
      'link': '/strains/og-kush',
      'data_type': 'strains',
      'image_url': 'https://via.placeholder.com/100',
      'tags': [
        {'tag_id': 'strains', 'tag_name': 'Strain', 'tag_color': '#27ae60'}
      ],
      'star_count': 0,
      'upvote_count': -1,
      'downvote_count': 0,
    },
  ],

  initializeHomepage() {
    /* Initialize the homepage. */

    // Listen to realtime data.
    this.listenToData();

    // FIXME: Set up infinite scroll with test data.
    // this.initializeInfiniteScroll();

    // Get the latest contributor.
    this.getLatestOpenCollectiveContributor();

    // Get data statistics.
    this.getDataStats();

  },

  initializeInfiniteScroll() {
    /* Initialize infinite scroll. */
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !this.dataLoading) {
        console.log('Loading more data...');
        this.dataLoading = true;
        this.selectedLimit += 10;
        this.listenToData();
        this.dataLoading = false;
      }
    });
  },

  listenToData() {
    /* Listen to data collections. */
    // Future work: Apply filters
    // if (filters.startDate) {
    //   q = query(q, where('date_tested', '>=', new Date(filters.startDate)));
    // }
    // if (filters.endDate) {
    //   q = query(q, where('date_tested', '<=', new Date(filters.endDate)));
    // }
    if (this.selectedDataType === 'all') {
      this.listenToAllData();
      return;
    }
    console.log(`Listening to collection: ${this.selectedDataType}`);
    listenToDataCollection(
      this.selectedDataType,
      this.selectedOrder,
      this.selectedDirection,
      this.selectedLimit,
      (data) => {
        this.updateDataDisplay(this.selectedDataType, data);
      },
    );
  },

  listenToAllData() {
    /* Listen to all data collections. */
    this.dataTypes.forEach(type => {
      console.log(`Listening to collection: ${type}`);
      listenToDataCollection(
        type,
        this.selectedOrder, 
        this.selectedDirection,
        this.selectedLimit,
        (data) => {
          this.updateDataDisplay(type, this.testData);
        },
      );
    });
  },

  updateDataDisplay(dataType, data) {
    /* Update the UI with the new data. */
    const container = document.getElementById('data-grid');

    // Track existing cards by ID
    const existingCards = new Map();
    container.querySelectorAll('[data-id]').forEach(card => {
      existingCards.set(card.dataset.id, card);
    });

    // Update or add cards
    const observationList = [];
    data.forEach(item => {
      if (existingCards.has(item.id)) {
        // Update the existing card
        const existingCard = existingCards.get(item.id);
        const newCard = this.createCard(item);
        existingCard.replaceWith(newCard);
        existingCards.delete(item.id);
      } else {
        // Add a new card
        const card = this.createCard(item);
        container.appendChild(card);
      }
      observationList.push({
        id: item.id,
        data_type: item.data_type
      });
    });

    // Remove cards that are not in the new data
    existingCards.forEach(card => {
      if (card.parentNode === container) {
        container.removeChild(card);
      }
    });

    // Initialize card functionality.
    initializeReportButtons();
    initializeShareButtons();
    initializeStarButtons();
    initializeVoteButtons();

    // Get user stars and votes.
    fetchUserStarsAndVotes(observationList);
  },

  createCard(item) {
    /* Create a card for an item. */

    // Create the card template.
    const col = document.createElement('div');
    col.className = 'observation col-12 col-md-6 col-lg-4 mb-4';
    col.dataset.id = item.id;
    col.dataset.type = item.data_type;
    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm border-0';
  
    // Add any image.
    // FIXME: Use a better placeholder image.
    item.image_url = 'https://via.placeholder.com/100';
    if (item.image_url) {
      const link = document.createElement('a');
      const img = document.createElement('img');
      img.src = item.image_url;
      img.className = 'card-img-top';
      img.alt = item.name || 'Item Image';
      link.href = `/${item.data_type}/${item.id}`;
      link.appendChild(img);
      card.appendChild(link);
    }
  
    // Card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';
    const title = document.createElement('h6');
    const titleLink = document.createElement('a');
    title.className = 'card-title';
    titleLink.className = 'sans-serif text-dark';
    titleLink.textContent = item.name || item.title || 'Untitled';
    titleLink.href = `/${item.data_type}/${item.id}`;
    title.appendChild(titleLink);
    cardBody.appendChild(title);
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group mt-auto';
    const toolbar = document.createElement('div');
    toolbar.className = 'd-flex justify-content-end align-items-center btn-toolbar';
    toolbar.role = 'toolbar';

    // Add badges.
    if (item.tags && item.tags.length > 0) {
      const tagContainer = document.createElement('div');
      tagContainer.className = 'd-flex flex-wrap';
      item.tags.forEach(tag => {
        const link = document.createElement('a');
        const badge = document.createElement('span');
        badge.className = 'badge me-1 mb-1';
        badge.style.backgroundColor = tag.tag_color;
        badge.textContent = `${tag.tag_name}`;
        link.href = `/search?q=${tag.tag_id}`;
        link.appendChild(badge);
        tagContainer.appendChild(link);
      });
      cardBody.appendChild(tagContainer);
    }

    // Add upvote button.
    const upvoteBtn = document.createElement('button');
    upvoteBtn.className = 'btn btn-sm upvote';
    upvoteBtn.dataset.voted = 'false';
    upvoteBtn.dataset.hash = item.id;
    upvoteBtn.dataset.type = item.data_type;
    upvoteBtn.innerHTML = '<img src="/static/website/images/ai-icons/up-arrow.svg" alt="Upvote" class="arrow-icon">';
    toolbar.appendChild(upvoteBtn);
  
    // Add the star count.
    const rating = item.upvote_count - item.downvote_count;
    const ratingSpan = document.createElement('span');
    ratingSpan.className = 'mx-1';
    ratingSpan.innerHTML = `<small class="rating fw-bold text-dark">${rating || 0}</small>`;
    toolbar.appendChild(ratingSpan);
  
    // Add downvote button.
    const downvoteBtn = document.createElement('button');
    downvoteBtn.className = 'btn btn-sm downvote';
    downvoteBtn.dataset.voted = 'false';
    downvoteBtn.dataset.hash = item.id;
    downvoteBtn.dataset.type = item.data_type;
    downvoteBtn.innerHTML = '<img src="/static/website/images/ai-icons/down-arrow.svg" alt="Downvote" class="arrow-icon">';
    toolbar.appendChild(downvoteBtn);
    toolbar.appendChild(btnGroup);
  
    // Add star button.
    const starBtn = document.createElement('button');
    starBtn.className = 'btn btn-outline-secondary btn-sm star-btn ms-2';
    starBtn.dataset.hash = item.id;
    starBtn.dataset.type = item.data_type;
    starBtn.dataset.starred = 'false';
    starBtn.innerHTML = `<span class="star-count mx-1">${item.star_count || 0}</span> <i class="bi bi-star star-icon"></i>`;
    toolbar.appendChild(starBtn);
  
    // Add dropdown menu.
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    const dropdownBtn = document.createElement('button');
    dropdownBtn.className = 'btn btn-outline-secondary btn-sm dropdown-toggle no-caret ms-2';
    dropdownBtn.type = 'button';
    dropdownBtn.dataset.bsToggle = 'dropdown';
    dropdownBtn.setAttribute('aria-expanded', 'false');
    dropdownBtn.innerHTML = '<i class="bi bi-three-dots"></i>';
    dropdown.appendChild(dropdownBtn);
    const dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'dropdown-menu dropdown-compact py-0';
  
    // Add share button.
    const shareOption = document.createElement('li');
    shareOption.className = 'mb-0';
    const shareLink = document.createElement('a');
    shareLink.className = 'dropdown-item py-1 fw-normal share-btn';
    shareLink.href = '#';
    shareLink.dataset.link = `/${item.data_type}/${item.id}`;
    shareLink.innerHTML = '<small>🔗 Share</small>';
    shareOption.appendChild(shareLink);
    dropdownMenu.appendChild(shareOption);

    // Add report button.
    const reportOption = document.createElement('li');
    reportOption.className = 'mb-0';
    const reportLink = document.createElement('a');
    reportLink.className = 'report-link dropdown-item py-1 fw-normal text-danger';
    reportLink.href = '#';
    reportLink.innerHTML = '<small>🚩 Report</small>';
    reportOption.appendChild(reportLink);
    dropdownMenu.appendChild(reportOption);
    dropdown.appendChild(dropdownMenu);
    toolbar.appendChild(dropdown);
  
    // Complete the card.
    cardBody.appendChild(toolbar);
    card.appendChild(cardBody);
    col.appendChild(card);
    return col;
  },

  changeDataType() {
    /* Change the data type. */
    const dataType = document.getElementById('data-type-select').value;
    this.selectedDataType = dataType;
    this.listenToData();
  },

  changeOrder() {
    /* Change the order. */
    const order = document.getElementById('order-select').value;
    this.selectedDirection = order;
    this.listenToData();
  },

  switchToGridView() {
    /* Switch the results container to grid view. */
    document.getElementById('data-grid').classList.add('grid-view');
    document.getElementById('data-grid').classList.remove('list-view');
    document.getElementById('grid-button').classList.add('btn-primary');
    document.getElementById('list-button').classList.remove('btn-primary');
  },

  switchToListView() {
    /* Switch the results container to list view. */
    document.getElementById('data-grid').classList.add('list-view');
    document.getElementById('data-grid').classList.remove('grid-view');
    document.getElementById('list-button').classList.add('btn-primary');
    document.getElementById('grid-button').classList.remove('btn-primary');
  },

  async getLatestOpenCollectiveContributor() {
    /* Get the latest Open Collective contributor. */
    const slug = 'cannlytics-company';
    const limit = 100;
    const offset = 10;
    try {
      const response = await fetch(`https://opencollective.com/${slug}/members/all.json?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      const contributors = data.filter(member => member.lastTransactionAmount);
      const latestContributor = contributors[contributors.length - 1];
      if (latestContributor) {
        const latestContribution = document.querySelector("#latest-contribution");
        latestContribution.innerHTML = `<small><i class="bi bi-cash-coin"></i> Latest donation: ${latestContributor.name} ($${latestContributor.totalAmountDonated.toFixed(2)})</small>`;
      } else {
        document.getElementById("latest-contribution").classList.add('d-none');
      }
    } catch (error) {
      // Log any errors
      console.error("Error: " + error);
    }
  },

  async getDataStats() {
    /* Get data statistics from Firestore. */
    const stats = await getDocument('stats/data');
    // let stats = {}
    // if (this.dataStats == null) {
    //   stats = await getDocument('stats/data');
    //   this.dataStats = stats;
    // }
    console.log('STATS:', stats);
    const date = new Date(stats.updated_at);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    try {
      document.getElementById('data-updated-at').textContent = formattedDate;
    } catch (error) {
      // Pass
    }

    // Fill in collection counts, e.g. 1,200 COAs
    try {
      document.getElementById('lab-result-count').textContent = stats.results_count.toLocaleString() + '+';
      document.getElementById('coas-count').textContent = stats.coas_count.toLocaleString() + '+';
      document.getElementById('strains-count').textContent = stats.strains_count.toLocaleString() + '+';
      document.getElementById('organizations-count').textContent = stats.licenses_count.toLocaleString() + '+';
      document.getElementById('compounds-count').textContent = stats.compounds_count.toLocaleString() + '+';
    } catch (error) {
      // Pass
    }
  },

};

function listenToDataCollection(
    dataType,
    orderField,
    orderDirection = 'desc',
    limitNum,
    callback,
  ) {
    /**
     * Listen to a collection in Firestore.
     */
  const colRef = collection(db, dataType);
  const q = query(colRef, orderBy(orderField, orderDirection), limit(limitNum));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error('Error listening to collection:', error);
  });
}
