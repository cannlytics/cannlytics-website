/**
 * Strains JavaScript | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 2/13/2024
 * Updated: 3/26/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
// import {
//   Firestore,
//   FieldValue,
//   VectorQuery,
//   VectorQuerySnapshot,
// } from "@google-cloud/firestore";
import { createGrid, ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { Modal } from 'bootstrap';
import { getCollection, getDocument } from '../firebase.js';
import { formatDecimal, formatPercentage } from '../utils.js';
import { renderCannabinoidChart } from './cannabinoidsChart.js';
import { renderTerpeneChart } from './terpeneChart.js';

export const strainsJS = {

  // Parameters.
  currentImageIndex: 0,
  modalCurrentIndex: 0,
  
  initializeStrains() {
    /**
     * Initialize the strains page.
     */
    console.log('Initializing strains page...');

    // Initialize AG Grid tables.
    ModuleRegistry.registerModules([ ClientSideRowModelModule ]); 
  
    const searchTerm = document.getElementById('searchInput').value;
    // const startDate = document.getElementById('dateTestedStart').value;
    // const endDate = document.getElementById('dateTestedEnd').value;
    const selectedState = document.querySelector('.btn-group .btn-primary').id.replace('btn', '');
    const startDate = null;
    const endDate = null;
  
    // Fetch strains data from Firestore
    this.fetchStrains(searchTerm, startDate, endDate, selectedState)
      .then((strains) => {
        console.log('Strains:', strains);

        // Add event listeners for view toggle buttons
        document.getElementById('listViewButton').addEventListener('click', () => {
          this.renderListView(strains);
        });
        document.getElementById('gridViewButton').addEventListener('click', () => {
          this.renderGridView(strains);
        });

        // Default to grid view
        this.renderGridView(strains);

      })
      .catch((error) => {
        console.error('Error initializing strains:', error);
        const strainsContainer = document.getElementById('strainsContainer');
        strainsContainer.innerHTML = '';
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Failed to fetch strains data. Please try again later.';
        strainsContainer.appendChild(errorMessage);
      });

  },

  fetchStrains(searchTerm, startDate, endDate, selectedState) {
    /**
     * Fetch strains data from Firestore based on search term, date range, and selected state.
     */
    const filters = [];
    if (searchTerm) {
      filters.push({ key: 'strain_name', operation: '>=', value: searchTerm });
      filters.push({ key: 'strain_name', operation: '<=', value: searchTerm + '\uf8ff' });
    }
    // if (startDate && endDate) {
    //   const startDateISO = new Date(startDate).toISOString();
    //   const endDateISO = new Date(endDate).toISOString();
    //   filters.push({ key: 'updated_at', operation: '>=', value: startDateISO });
    //   filters.push({ key: 'updated_at', operation: '<=', value: endDateISO });
    // }
    // if (selectedState && selectedState !== 'ALL') {
    //   filters.push({ key: 'state', operation: '==', value: selectedState });
    // }
    console.log('FILTERS:');
    console.log(filters);
    return getCollection('strains', {
      order: 'strain_name',
      max: 10,
      filters: filters,
    });
  },

  renderListView(strains) {
    // List view now shows the table view
    document.getElementById('listViewButton').classList.add('btn-primary');
    document.getElementById('listViewButton').classList.remove('btn-outline-primary');
    document.getElementById('gridViewButton').classList.remove('btn-primary');
    document.getElementById('gridViewButton').classList.add('btn-outline-primary');
    
    const strainsContainer = document.getElementById('strainsContainer');
    const masonryInstance = Masonry.data(strainsContainer);
    if (masonryInstance) {
      masonryInstance.destroy();
    }
    strainsContainer.innerHTML = '';
    
    const gridOptions = {
      columnDefs: [
        { field: 'strain_name', headerName: 'Name', flex: 1 },
        { field: 'latest_date_tested', headerName: 'Last Test', flex: 2 },
        { field: 'first_date_tested', headerName: 'First Test', flex: 2 },
        {
          field: 'avg_total_thc',
          headerName: 'Avg. THC',
          flex: 1,
          valueFormatter: formatDecimal,
        },
        {
          field: 'avg_total_cbd',
          headerName: 'Avg. CBD',
          flex: 1,
          valueFormatter: formatDecimal,
        },
        {
          field: 'avg_total_terpenes',
          headerName: 'Avg. Terpenes',
          flex: 1,
          valueFormatter: formatDecimal,
        },
      ],
      rowData: strains,
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
      },
      domLayout: 'autoHeight',
      pagination: true,
      paginationPageSize: 10,
      paginationPageSizeSelector: [5, 10, 20, 50],
      onRowClicked: (params) => {
        console.log('Selected:', params.data);
        const strainId = params.data.id;
        localStorage.setItem('strain', JSON.stringify(params.data));
        window.location.href = `/strains/${strainId}`;
      },
    };
    createGrid(strainsContainer, gridOptions);
    cannlytics.ui.setTableTheme();
  },

  renderGridView(strains) {
    // Grid view now shows the card-based layout
    document.getElementById('gridViewButton').classList.add('btn-primary');
    document.getElementById('gridViewButton').classList.remove('btn-outline-primary');
    document.getElementById('listViewButton').classList.remove('btn-primary');
    document.getElementById('listViewButton').classList.add('btn-outline-primary');
  
    const strainsContainer = document.getElementById('strainsContainer');
    strainsContainer.innerHTML = '';
  
    if (strains && strains.length > 0) {
      strains.forEach((strain) => {
        const strainCard = createStrainCard(strain);
        strainsContainer.appendChild(strainCard);
      });
  
      // Initialize Masonry after rendering the strain cards
      new Masonry(strainsContainer, {
        itemSelector: '.col-sm-6',
        percentPosition: true,
      });
    } else {
      const noDataMessage = document.createElement('p');
      noDataMessage.textContent = 'No strains data available.';
      strainsContainer.appendChild(noDataMessage);
    }
  },

  async searchStrainNames() {
    // Future work.
  },
  // Example:
  // async findSimilarStrains() {
  //   /**
  //    * Find similar strains based on the selected strain.
  //    */
  //   var chemotype = FieldValue.vector([3.0, 1.0, 2.0]);
  //   const db = new Firestore();
  //   const coll = db.collection('strains');
  //   const vectorQuery = coll.findNearest('chemotype', chemotype, {
  //     limit: 5,
  //     distanceMeasure: 'EUCLIDEAN'
  //   });
  //   const vectorQuerySnapshot = await vectorQuery.get();
  // },

  async initializeStrain() {
    /**
     * Initialize the strain page.
     */

    // Get the strain data from Firestore.
    let data = JSON.parse(localStorage.getItem('strain'));
    const strainId = window.location.pathname.split('/').pop();
    console.log('STRAIN ID:', strainId);
    if (data && data.id === strainId) {
      console.log('LOCAL STRAIN DATA:', data);
    } else {
      const path = `strains/${strainId}`;
      try {
        data = await getDocument(path);
      } catch (error) {
        console.error('ERROR:', error);
        return;
      }
      console.log('FIRESTORE STRAIN DATA:', data);
    }

    // TODO: Render the cannabinoids figure.
    renderCannabinoidChart(data);

    // Render the terpenes figure.
    renderTerpeneChart(data);

    // Render strain data.
    document.getElementById('strain_name').textContent = data.strain_name;
    document.getElementById('total_results').textContent = data.total_results;

    // Render dates.
    if (data.latest_date_tested) {
      const date = new Date(data.latest_date_tested);
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      document.getElementById('latest_date_tested').textContent = formatter.format(date);
    }
    if (data.first_date_tested) {
      const date = new Date(data.first_date_tested);
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      document.getElementById('first_date_tested').textContent = formatter.format(date);
    }
    
    // Render license data.
    document.getElementById('first_state').textContent = data.first_state;
    document.getElementById('first_producer').textContent = data.first_producer;
    document.getElementById('first_lab').textContent = data.first_lab;

    // Render totals.
    document.getElementById('avg_total_cannabinoids').textContent = formatPercentage(data.avg_total_cannabinoids);
    document.getElementById('avg_total_thc').textContent = formatPercentage(data.avg_total_thc);
    document.getElementById('avg_total_cbd').textContent = formatPercentage(data.avg_total_cbd);
    document.getElementById('avg_total_terpenes').textContent = formatPercentage(data.avg_total_terpenes);

    // Render diversity.
    document.getElementById('avg_cannabinoid_diversity').textContent = 
      data.avg_cannabinoid_diversity !== null ? data.avg_cannabinoid_diversity.toFixed(2) : '';
    document.getElementById('avg_terpene_diversity').textContent = 
        data.avg_terpene_diversity !== null ? data.avg_terpene_diversity.toFixed(2) : '';


    // OLD:
    // 
    // document.getElementById('strainTotalFavorites').textContent = data.totalFavorites;
    // total_tests
    // strain_type
    // first_date_tested

    // Primary image.
    // document.getElementById('image_url').src = data.image_url;

    // Get a gallery of images for the strain.
    // Collection: strains/{strain-id}/strain_images
    const gallery = await getCollection(`strains/${strainId}/strain_images`, {});
    console.log('Gallery:', gallery);

    // Render the strain images in the user interface.
    if (gallery && gallery.length > 0) {
      this.initializeGallery(gallery);
    }

    // TODO: Get results for the strain.
  },

  initializeGallery(images) {
    const thumbnailsTrack = document.getElementById('thumbnailsTrack');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    // Create and append thumbnails
    images.forEach((image, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
      
      const thumbImg = document.createElement('img');
      thumbImg.src = image.image_url;
      thumbImg.alt = `Thumbnail ${index + 1}`;
      
      thumbnail.appendChild(thumbImg);
      thumbnailsTrack.appendChild(thumbnail);
      
      // Add click handler for thumbnail
      thumbnail.addEventListener('click', () => {
        this.updateMainImage(images, index);
      });
    });
    
    // Set initial main image
    this.updateMainImage(images, 0);
    
    // Add click handlers for navigation buttons
    prevButton.addEventListener('click', () => {
      const newIndex = (this.currentImageIndex - 1 + images.length) % images.length;
      this.updateMainImage(images, newIndex);
    });
    
    nextButton.addEventListener('click', () => {
      const newIndex = (this.currentImageIndex + 1) % images.length;
      this.updateMainImage(images, newIndex);
    });
    
    // Optional: Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevButton.click();
      } else if (e.key === 'ArrowRight') {
        nextButton.click();
      }
    });
  
    // Initialize modal gallery.
    this.initializeModalGallery(images);
  },

  initializeModalGallery(images) {

    // Initialize the modal functionality
    const modal = new Modal(document.getElementById('galleryModal'), {});
    const mainImage = document.getElementById('mainImage');
    const modalImage = document.getElementById('modalMainImage');
    const modalPrevButton = document.getElementById('modalPrevButton');
    const modalNextButton = document.getElementById('modalNextButton');
    const dotsContainer = document.querySelector('.modal-dots');
  
    // Create dots for navigation
    images.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        updateModalImage(images, index);
      });
      dotsContainer.appendChild(dot);
    });
  
    // Add click handler to main image to open modal
    mainImage.addEventListener('click', () => {
      this.modalCurrentIndex = this.currentImageIndex;
      this.updateModalImage(images, this.modalCurrentIndex);
      modal.show();
    });
  
    // Add modal navigation handlers
    modalPrevButton.addEventListener('click', () => {
      const newIndex = (this.modalCurrentIndex - 1 + images.length) % images.length;
      this.updateModalImage(images, newIndex);
    });
  
    modalNextButton.addEventListener('click', () => {
      const newIndex = (this.modalCurrentIndex + 1) % images.length;
      this.updateModalImage(images, newIndex);
    });
  
    // Add keyboard navigation for modal
    document.addEventListener('keydown', (e) => {
      if (!modal._element.classList.contains('show')) return;
      if (e.key === 'ArrowLeft') {
        modalPrevButton.click();
      } else if (e.key === 'ArrowRight') {
        modalNextButton.click();
      } else if (e.key === 'Escape') {
        modal.hide();
      }
    });
  
    // Optional: Add swipe support for touch devices
    let touchStartX = 0;
    modalImage.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });
  
    modalImage.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) { // Minimum swipe distance
        if (diff > 0) {
          modalNextButton.click(); // Swipe left
        } else {
          modalPrevButton.click(); // Swipe right
        }
      }
    });
  },

  updateMainImage(images, index) {
    /**
     * Update the main image and active thumbnail.
     */
    this.currentImageIndex = index;
    const mainImage = document.getElementById('mainImage');
    mainImage.src = images[index].image_url;
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  },

  updateModalImage(images, index) {
    /**
     * Update the modal image.
     */
    this.modalCurrentIndex = index;
    const modalImage = document.getElementById('modalMainImage');
    modalImage.src = images[index].image_url;
    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  },

};

// Helper function to create a strain card element.
const createStrainCard = (strain) => {
  const cardElement = document.createElement('div');
  cardElement.classList.add('col-sm-6', 'col-md-4', 'mb-4');

  const cardInnerElement = document.createElement('div');
  cardInnerElement.classList.add('card');

  const imageElement = document.createElement('img');
  imageElement.src = strain.image_url || 'path/to/default/image.jpg';
  imageElement.classList.add('card-img-top');
  imageElement.alt = 'Strain';

  const cardBodyElement = document.createElement('div');
  cardBodyElement.classList.add('card-body');

  const titleElement = document.createElement('h5');
  titleElement.classList.add('card-title');
  titleElement.textContent = strain.name;

  const descriptionElement = document.createElement('p');
  descriptionElement.classList.add('card-text');
  descriptionElement.textContent = strain.description || 'No description available.';

  cardBodyElement.appendChild(titleElement);
  cardBodyElement.appendChild(descriptionElement);
  cardInnerElement.appendChild(imageElement);
  cardInnerElement.appendChild(cardBodyElement);
  cardElement.appendChild(cardInnerElement);

  return cardElement;
};
