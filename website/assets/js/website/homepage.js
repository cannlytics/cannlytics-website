/**
 * Homepage JavaScript | Cannlytics Website
 * Copyright (c) 2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 10/4/2024
 * Updated: 10/4/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { showNotification } from '../utils.js';

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
  testData: [
    {
      'id': 'test-coa',
      'title': 'Sample COA Result',
      'user_name': 'keeganskeate',
      'updated_on': 'Sep 29, 2024',
      'link': '/coa/sample',
      'data_type': 'coas',
      'image': 'https://via.placeholder.com/100',
      'badges': [{ 'text': 'COA', 'color': '#3498db', 'icon': 'bi bi-file-earmark-text' }],
      'rating': 0
    },
    {
      'id': 'test-strain',
      'title': 'Cannabis Strain: OG Kush',
      'user_name': 'john_doe',
      'updated_on': 'Sep 25, 2024',
      'link': '/strain/og-kush',
      'data_type': 'strains',
      'image': 'https://via.placeholder.com/100',
      'badges': [{ 'text': 'Strain', 'color': '#27ae60', 'icon': 'bi bi-droplet' }],
      'rating': 0
    },
  ],

  initializeHomepage() {
    /* Initialize the homepage. */
    console.log('Initializing homepage...');
    // this.initializeInfiniteScroll();
    this.listenToData();
  },

  initializeInfiniteScroll() {
    /* Initialize infinite scroll. */
    window.addEventListener('scroll', () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !this.dataLoading) {
        this.loadMoreData();
      }
    });
  },

  listenToData() {
    /* Listen to data collections. */
    // TODO: Apply filters
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
    console.log(`Listening to collection: ${selectedDataType}`);
    listenToDataCollection(
      this.selectedDataType,
      this.selectedOrder,
      this.selectedDirection,
      this.selectedLimit,
      (data) => {
        this.updateDataDisplay(type, data);
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
  
  async loadMoreData() {
    /* Load more data. */
    this.dataLoading = true;
    this.selectedLimit += 10;
    // const lastDoc = this.lastDoc; // Keep track of the last visible document
    // TODO: Find a more elegant way to update the UI without re-rendering everything.
    this.listenToData();
    this.dataLoading = false;
  },

  updateDataDisplay(dataType, data) {
    /* Update the UI with the new data. */
    const container = document.getElementById('data-grid');
    data.forEach(item => {
      const card = this.createCard(item, dataType);
      container.appendChild(card);
    });
    // TODO: Implement.
    // this.initializeStarButtons();
    // this.initializeShareButtons();
    // this.initializeVoteButtons();
    // this.initializeReportButtons();
  },

  createCard(item, dataType) {
    /* Create a card for an item. */

    // Create the card elements.
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4 mb-4';
    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm border-0';
  
    // If there's an image
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.className = 'card-img-top';
      img.alt = item.name || 'Item Image';
      card.appendChild(img);
    }
  
    // Card body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';
    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = item.name || item.title || 'Untitled';
    cardBody.appendChild(title);
    const description = document.createElement('p');
    description.className = 'card-text';
    description.textContent = item.description || 'No description available.';
    cardBody.appendChild(description);
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group mt-auto';
  
    // Star button
    const starBtn = document.createElement('button');
    starBtn.className = 'btn star-btn';
    starBtn.dataset.id = item.id;
    starBtn.dataset.type = dataType;
    starBtn.dataset.starred = 'false';
    starBtn.innerHTML = '<i class="bi bi-star"></i>';
    btnGroup.appendChild(starBtn);
  
    // Share button
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn share-btn';
    shareBtn.dataset.link = `/item/${item.id}`;
    shareBtn.innerHTML = '<i class="bi bi-share"></i>';
    btnGroup.appendChild(shareBtn);
  
    // TODO: upvote/downvote, report
  
    cardBody.appendChild(btnGroup);
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
