/**
 * Homepage JavaScript | Cannlytics Website
 * Copyright (c) 2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 10/4/2024
 * Updated: 10/6/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
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
  // dataTypes: ['coas', 'results', 'strains', 'licenses', 'analytes'],
  dataTypes: ['coas',],
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

  // FIXME: Get data dynamically!
  legalityData: {
    "AL": { status: "medical", name: "Alabama" },
    "AK": { status: "recreational", name: "Alaska" },
    "AZ": { status: "recreational", name: "Arizona" },
    "AR": { status: "medical", name: "Arkansas" },
    "CA": { status: "recreational", name: "California" },
    "CO": { status: "recreational", name: "Colorado" },
    "CT": { status: "recreational", name: "Connecticut" },
    "DE": { status: "recreational", name: "Delaware" },
    "DC": { status: "recreational", name: "District of Columbia" },
    "FL": { status: "medical", name: "Florida" },
    "GA": { status: "no_program", name: "Georgia" },
    "HI": { status: "medical", name: "Hawaii" },
    "ID": { status: "no_program", name: "Idaho" },
    "IL": { status: "recreational", name: "Illinois" },
    "IN": { status: "no_program", name: "Indiana" },
    "IA": { status: "no_program", name: "Iowa" },
    "KS": { status: "no_program", name: "Kansas" },
    "KY": { status: "no_program", name: "Kentucky" },
    "LA": { status: "medical", name: "Louisiana" },
    "ME": { status: "recreational", name: "Maine" },
    "MD": { status: "recreational", name: "Maryland" },
    "MA": { status: "recreational", name: "Massachusetts" },
    "MI": { status: "recreational", name: "Michigan" },
    "MN": { status: "recreational", name: "Minnesota" },
    "MS": { status: "medical", name: "Mississippi" },
    "MO": { status: "recreational", name: "Missouri" },
    "MT": { status: "recreational", name: "Montana" },
    "NE": { status: "no_program", name: "Nebraska" },
    "NV": { status: "recreational", name: "Nevada" },
    "NH": { status: "medical", name: "New Hampshire" },
    "NJ": { status: "recreational", name: "New Jersey" },
    "NM": { status: "recreational", name: "New Mexico" },
    "NY": { status: "recreational", name: "New York" },
    "NC": { status: "no_program", name: "North Carolina" },
    "ND": { status: "recreational", name: "North Dakota" },
    "OH": { status: "recreational", name: "Ohio" },
    "OK": { status: "medical", name: "Oklahoma" },
    "OR": { status: "recreational", name: "Oregon" },
    "PA": { status: "medical", name: "Pennsylvania" },
    "RI": { status: "recreational", name: "Rhode Island" },
    "SC": { status: "no_program", name: "South Carolina" },
    "SD": { status: "no_program", name: "South Dakota" },
    "TN": { status: "no_program", name: "Tennessee" },
    "TX": { status: "no_program", name: "Texas" },
    "UT": { status: "medical", name: "Utah" },
    "VT": { status: "recreational", name: "Vermont" },
    "VA": { status: "recreational", name: "Virginia" },
    "WA": { status: "recreational", name: "Washington" },
    "WV": { status: "medical", name: "West Virginia" },
    "WI": { status: "no_program", name: "Wisconsin" },
    "WY": { status: "no_program", name: "Wyoming" }
  },

  initializeHomepage() {
    /* Initialize the homepage. */

    // Listen to realtime data.
    // this.listenToData();

    // FIXME: Set up infinite scroll with test data.
    // this.initializeInfiniteScroll();

    // Initialize the product types.
    this.initializeProductTypes();

    // Initialize the state map.
    this.initializeStateMap();

    // Get the latest contributor.
    this.getLatestOpenCollectiveContributor();

    // Get data statistics.
    this.getDataStats();

    // TODO: Get the latest strains!

  },

  async initializeProductTypes() {
    /* Initialize the product types. */

    // Create main grid container
    const container = document.getElementById('product-types-container');
    const gridContainer = document.createElement('div');
    gridContainer.className = 'product-types-grid';
    container.appendChild(gridContainer);
    gridContainer.innerHTML = '';

    // Get one of each of the most recently tested product types.
    const standardProductTypes = [
      { id: 'flower', name: 'Flower' },
      { id: 'concentrate', name: 'Concentrates' },
      { id: 'edible', name: 'Edibles' },
      { id: 'preroll', name: 'Pre-Rolls' },
      { id: 'infused', name: 'Infused' },
      { id: 'topical', name: 'Topicals' },
      { id: 'tincture', name: 'Tinctures' },
      { id: 'other', name: 'Other' }
    ];
    const productTypePromises = standardProductTypes.map(async (type) => {
      try {
        // Query Firestore for the most recent COA with an image for this product type.
        const coasRef = collection(db, 'coas');
        const q = query(coasRef,
          where('standard_product_type', '==', type.id),
          where('image_url', '!=', null),
          orderBy('date_tested', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);

        // Get the image URL from the COA or use a placeholder.
        let imageUrl = '/static/website/images/ai-icons/cannabis-leaf.png';
        if (!snapshot.empty) {
          console.log('DATA:', snapshot.docs[0].data());
          imageUrl = snapshot.docs[0].data().image_url;
        }

        // Create and return the card element.
        return this.createProductCard(type, imageUrl);
      } catch (error) {
        console.error(`Error fetching data for ${type.name}:`, error);
        return this.createProductCard(type, '/static/website/images/ai-icons/cannabis-leaf.png');
      }
    });

    // Wait for all cards to be created and add them to the grid.
    const cards = await Promise.all(productTypePromises);
    cards.forEach(card => gridContainer.appendChild(card));

  },

  createProductCard(type, imageUrl) {
    /* Create a product card with clickable navigation to filtered results. */

    // Create card container.
    const card = document.createElement('div');
    card.className = 'product-card bg-body';
    
    // Create image container.
    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-card-image';
    
    // Create and set up image.
    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = type.name;
    image.loading = 'lazy';
    
    // Create title container.
    const titleContainer = document.createElement('div');
    titleContainer.className = 'product-card-content border-top border-1';
    
    // Create title.
    const title = document.createElement('h3');
    title.className = 'product-card-title sans-serif text-dark text-center fw-bold fs-6';
    title.textContent = type.name;
    
    // Assemble the card.
    imageContainer.appendChild(image);
    titleContainer.appendChild(title);
    card.appendChild(imageContainer);
    card.appendChild(titleContainer);
    
    // Navigate to the results page when the card is clicked.
    card.addEventListener('click', () => {
      const url = `/results?product_type=${encodeURIComponent(type.id)}`;
      window.location.href = url;
    });
    
    return card;
  },

  initializeStateMap() {
    /* Initialize the state map. */

    // Set up dimensions.
    const width = 960;
    const height = 600;
    
    // Clear any existing map.
    const container = document.getElementById('state-map');
    container.innerHTML = '';
    
    // Create tooltip.
    const tooltip = d3.select("body").append("div")
      .attr("class", "state-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "100");
    
    // Create SVG.
    const svg = d3.create('svg')
      .attr('viewBox', [0, 0, width, height])
      .style('width', '100%')
      .style('height', 'auto')
      .style('max-height', '600px');
      
    // Create container for states.
    const g = svg.append('g');
    
    // Helper function to get state abbreviation.
    const getStateAbbr = (stateName) => {
      for (const [abbr, data] of Object.entries(this.legalityData)) {
        if (data.name === stateName) return abbr;
      }
      return null;
    };

    // Create legend data.
    const legendData = [
      { label: "Adult-Use", color: "#7561DB" }, // Rich periwinkle
      { label: "Medical", color: "#FF8FA1" },   // Soft coral pink
      { label: "No data", color: "#cccccc" }
    ];
    
    // Get state color based on status.
    const getStateColor = (stateAbbr) => {
      if (!stateAbbr) return '#cccccc';
      const status = this.legalityData[stateAbbr]?.status;
      switch(status) {
        case 'recreational':
          return '#7561DB';
        case 'medical':
          return '#FF8FA1';
        default:
          return '#cccccc';
      }
    };
    
    // Get hover color (slightly lighter).
    const getHoverColor = (stateAbbr) => {
      if (!stateAbbr) return '#cccccc';
      const status = self.legalityData[stateAbbr]?.status;
      switch(status) {
        case 'recreational':
          return '#9381FF'; // Darker periwinkle
        case 'medical':
          return '#FFB7C3'; // Darker coral pink
        default:
          return '#cccccc';
      }
    };
    
    // Store reference to this for event handlers.
    const self = this;

    // Load and process the map data.
    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(us => {
        // Convert TopoJSON to GeoJSON.
        const states = topojson.feature(us, us.objects.states);
        const stateNames = topojson.feature(us, us.objects.states).features.map(d => d.properties.name);
        
        // Set up projection.
        const projection = d3.geoAlbersUsa()
          .fitSize([width, height], states);
        
        const path = d3.geoPath()
          .projection(projection);
        
        // Add states.
        g.selectAll('path')
          .data(states.features)
          .join('path')
          .attr('d', path)
          .style('fill', d => {
            const stateAbbr = getStateAbbr(d.properties.name);
            return getStateColor(stateAbbr);
          })
          .style('stroke', '#ffffff')
          .style('stroke-width', '1')
          .style('cursor', d => {
            const stateAbbr = getStateAbbr(d.properties.name);
            return this.legalityData[stateAbbr]?.status === 'no_program' ? 'not-allowed' : 'pointer';
          })
          .on('mouseover', function(event, d) {
            const stateAbbr = getStateAbbr(d.properties.name);
            if (!stateAbbr) return;
            
            const status = self.legalityData[stateAbbr]?.status;
            if (status !== 'no_program') {
              d3.select(this).style('fill', getHoverColor(stateAbbr));
              
              tooltip.transition()
                .duration(200)
                .style("opacity", .9);
              
              let tooltipContent = `
                <strong>${d.properties.name}</strong><br/>
                ${status === 'recreational' ? 'Adult-use' : 'Medical'}<br/>
                » Click for results
              `;
              
              tooltip.html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            }
          })
          .on('mouseout', function(event, d) {
            const stateAbbr = getStateAbbr(d.properties.name);
            if (!stateAbbr) return;
            
            d3.select(this).style('fill', getStateColor(stateAbbr));
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          })
          .on('click', (event, d) => {
            const stateAbbr = getStateAbbr(d.properties.name);
            if (!stateAbbr) return;
            
            if (this.legalityData[stateAbbr]?.status !== 'no_program') {
              window.location.href = `/results?state=${stateAbbr}`;
            }
          });

        // Add state labels.
        g.selectAll('text')
          .data(states.features)
          .join('text')
          .attr('transform', d => {
            const centroid = path.centroid(d);
            if (isNaN(centroid[0]) || isNaN(centroid[1])) return 'translate(0,0)';
            return `translate(${centroid[0]},${centroid[1]})`;
          })
          .attr('dy', '.35em')
          .style('fill', '#ffffff')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .style('text-anchor', 'middle')
          .style('pointer-events', 'none')
          .text(d => getStateAbbr(d.properties.name) || '');

        // Add legend.
        const legendGroup = svg.append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(15, 15)`);

        const legendEntries = legendGroup.selectAll('.legend-entry')
          .data(legendData)
          .join('g')
          .attr('class', 'legend-entry')
          .attr('transform', (d, i) => `translate(0, ${i * 25})`);

        // Add circles for each legend item.
        legendEntries.append('circle')
          .attr('cx', 8)
          .attr('cy', 8)
          .attr('r', 8)
          .style('fill', d => d.color);

        // Add text labels.
        legendEntries.append('text')
          .attr('x', 25)
          .attr('y', 12)
          .style('fill', '#000000')
          .style('font-size', '14px')
          .style('font-weight', 'normal')
          .text(d => d.label);

        // Append the SVG to the container.
        container.appendChild(svg.node());
      })
      .catch(error => {
        console.error('Error loading map data:', error);
        container.innerHTML = 'Error loading map data';
      });
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
          this.updateDataDisplay(type, data);
        },
      );
    });
  },

  updateDataDisplay(dataType, data) {
    /* Update the UI with the new data. */
    console.log('Updating data display:', dataType, data);
    const container = document.getElementById('data-grid');

    // Track existing cards by ID
    const existingCards = new Map();
    container.querySelectorAll('[data-id]').forEach(card => {
      existingCards.set(card.dataset.id, card);
    });

    // Update or add cards
    const observationList = [];
    data.forEach(item => {
      if (item.reported) return;
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
    card.className = 'card h-100 color-border-on-hover border-1 rounded-2 overflow-hidden';
  
    // Add any image.
    if (item.image_url ?? item.thumbnail_url) {
      const link = document.createElement('a');
      const img = document.createElement('img');
      img.height = 225;
      img.width = '100%';
      img.src = item.image_url ?? item.thumbnail_url;
      img.className = 'card-img-top';
      img.alt = item.name || 'Item Image';
      img.style.objectFit = 'cover';
      link.href = `/${item.data_type}/${item.id}`;
      link.appendChild(img);
      card.appendChild(link);
    }
  
    // Card title.
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column flex-grow-1 border-top border-1';
    const title = document.createElement('h6');
    const titleLink = document.createElement('a');
    title.className = 'card-title';
    titleLink.className = 'sans-serif text-dark';
    titleLink.textContent = item.name || item.title || 'Untitled';
    titleLink.href = `/${item.data_type}/${item.id}`;
    title.appendChild(titleLink);
    cardBody.appendChild(title);

    // Create toolbar.
    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group mt-auto';
    const toolbar = document.createElement('div');
    toolbar.className = 'd-flex justify-content-end align-items-center btn-toolbar mt-auto';
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
        link.href = tag.tag_link;
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
    cardBody.appendChild(toolbar);
  
    // Return the card as a grid item.
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
        console.log('CONTRIBUTOR:', latestContributor);
        const latestContribution = document.querySelector("#latest-contribution");
        latestContribution.innerHTML = `<small><i class="bi bi-cash-coin"></i> Last Contribution: ${latestContributor.name} ($${latestContributor.lastTransactionAmount.toFixed(2)})</small>`;
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
      document.getElementById('licenses-count').textContent = stats.licenses_count.toLocaleString() + '+';
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
