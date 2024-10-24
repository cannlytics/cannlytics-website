/**
 * Licenses JavaScript | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 2/13/2024
 * Updated: 3/29/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { createGrid } from 'ag-grid-community';
import { db } from '../firebase.js';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';

export const licensesJS = {

  licensees: [],
  viewType: 'grid',
  
  initializeLicensees() {
    /**
     * Initialize the licensees page.
     */
    console.log('Initializing licensees page...');
  
    const searchTerm = document.getElementById('searchInput').value;
    const selectedState = document.querySelector('.btn-group .btn-primary').id.replace('btn', '');
    const startDate = null;
    const endDate = null;

    // Add event listeners for view toggle buttons
    document.getElementById('listViewButton').addEventListener('click', () => {
      this.renderTable(this.licensees);
      this.viewType = 'table';
    });
    document.getElementById('gridViewButton').addEventListener('click', () => {
      this.renderMasonry(this.licensees);
      this.viewType = 'grid';
    });

    // TODO: Listen to realtime license data.
    // const db = getFirestore(firebaseApp);
    const q = query(
      collection(db, 'licenses'),
      where('state', '==', 'ca'),
      limit(10),
    );
    onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push(doc.data());
      });
      console.log("Current licenses in CA: ", docs.length);
      this.licensees = docs;

      // Render table or list.
      if (this.viewType === 'table') {
        this.renderTable(docs);
      } else {
        this.renderMasonry(docs);
      }

    },
    (error) => {
      console.log('Error getting documents: ', error);
    });
  
    // // Fetch licensees data from Firestore
    // this.fetchLicensees(searchTerm, startDate, endDate, selectedState)
    //   .then((licensees) => {
    //     console.log('Licensees:', licensees);


    //     // Default to grid view
    //     this.renderMasonry(licensees);

    //   })
    //   .catch((error) => {
    //     // FIXME: Spruce up this HTML.
    //     console.error('Error initializing licensees:', error);
    //     const licenseesContainer = document.getElementById('licenseesContainer');
    //     licenseesContainer.innerHTML = '';
    //     const errorMessage = document.createElement('p');
    //     errorMessage.textContent = 'Failed to fetch licensees data. Please try again later.';
    //     licenseesContainer.appendChild(errorMessage);
    //   });

  },

  fetchLicensees(searchTerm, startDate, endDate, selectedState) {
    /**
     * Fetch licensees data from Firestore based on search term, date range, and selected state.
     */
    // FIXME:
    const filters = [];
    if (searchTerm) {
      filters.push({ key: 'legal_name', operation: '>=', value: searchTerm });
      filters.push({ key: 'legal_name', operation: '<=', value: searchTerm + '\uf8ff' });
    }
    if (selectedState && selectedState !== 'ALL') {
      filters.push({ key: 'state', operation: '==', value: selectedState });
    }
    console.log('FILTERS:');
    console.log(filters);
    return getCollection('licenses', {
      order: 'legal_name',
      max: 10,
      // filters: filters,
    });
  },

  renderMasonry(licensees) {
    /**
     * Render the licensees in a list view.
     */
    document.getElementById('gridViewButton').classList.add('btn-primary');
    document.getElementById('gridViewButton').classList.remove('btn-outline-primary');
    document.getElementById('listViewButton').classList.remove('btn-primary');
    document.getElementById('listViewButton').classList.add('btn-outline-primary');
  
    const licenseesContainer = document.getElementById('licenseesContainer');
    licenseesContainer.innerHTML = '';
  
    if (licensees && licensees.length > 0) {
      licensees.forEach((licensee) => {
        const licenseeCard = createLicenseeCard(licensee);
        licenseesContainer.appendChild(licenseeCard);
      });
  
      // Initialize Masonry after rendering the licensee cards
      var msnry = new Masonry(licenseesContainer, {
        itemSelector: '.col-sm-6',
        percentPosition: false,
      });
      msnry.on( 'layoutComplete', function() {
        document.getElementById('licenseesContainer').style.height = undefined;
      });
    } else {
      const noDataMessage = document.createElement('p');
      noDataMessage.textContent = 'No licensees data available.';
      licenseesContainer.appendChild(noDataMessage);
    }
  },

  renderTable(licensees) {
    /**
     * Render the licensees in a table view.
     */
    document.getElementById('listViewButton').classList.add('btn-primary');
    document.getElementById('listViewButton').classList.remove('btn-outline-primary');
    document.getElementById('gridViewButton').classList.remove('btn-primary');
    document.getElementById('gridViewButton').classList.add('btn-outline-primary');
    const licenseesContainer = document.getElementById('licenseesContainer');
    licenseesContainer.innerHTML = '';
    const gridOptions = {
      columnDefs: [
        { field: 'legal_name', headerName: 'Legal Name', flex: 1 },
        { field: 'dba', headerName: 'DBA Name', flex: 1 },
        { field: 'license_number', headerName: 'License Number', flex: 1 },
        { field: 'license_type', headerName: 'License Type', flex: 1 },
        { field: 'city', headerName: 'City', flex: 1 },
      ],
      rowData: licensees,
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
        const licenseeId = params.data.id;
        localStorage.setItem('licensee', JSON.stringify(params.data));
        window.location.href = `/licenses/${licenseeId}`;
      },
    };
    createGrid(licenseesContainer, gridOptions);
    cannlytics.ui.setTableTheme();
    // FIXME: Why is the height weird?
    document.getElementById('licenseesContainer').style.height = '100%';
  },

  initializeRetailers() {
    /**
     * Initialize the retailers page.
     */
    const stateFipsCodes = {
      "01": "Alabama",
      "02": "Alaska",
      "04": "Arizona",
      "05": "Arkansas",
      "06": "California",
      "08": "Colorado",
      "09": "Connecticut",
      "10": "Delaware",
      "11": "District of Columbia",
      "12": "Florida",
      "13": "Georgia",
      "15": "Hawaii",
      "16": "Idaho",
      "17": "Illinois",
      "18": "Indiana",
      "19": "Iowa",
      "20": "Kansas",
      "21": "Kentucky",
      "22": "Louisiana",
      "23": "Maine",
      "24": "Maryland",
      "25": "Massachusetts",
      "26": "Michigan",
      "27": "Minnesota",
      "28": "Mississippi",
      "29": "Missouri",
      "30": "Montana",
      "31": "Nebraska",
      "32": "Nevada",
      "33": "New Hampshire",
      "34": "New Jersey",
      "35": "New Mexico",
      "36": "New York",
      "37": "North Carolina",
      "38": "North Dakota",
      "39": "Ohio",
      "40": "Oklahoma",
      "41": "Oregon",
      "42": "Pennsylvania",
      "44": "Rhode Island",
      "45": "South Carolina",
      "46": "South Dakota",
      "47": "Tennessee",
      "48": "Texas",
      "49": "Utah",
      "50": "Vermont",
      "51": "Virginia",
      "53": "Washington",
      "54": "West Virginia",
      "55": "Wisconsin",
      "56": "Wyoming"
    };

    function zoomToState(d, us) {
      /**
       * Zoom into an individual state.
       */

      // Show the close button.
      document.getElementById('closeBtn').style.display = 'inline-block';

      d3.select('#state-map').style("display", "block");
  
      // Render the individual state map.
      renderIndividualStateMap(d, us);

      // Hide the national map.
      d3.select('#map').style("display", "none");

    }

    function renderIndividualStateMap(d, us) {
      /**
       * Render an individual state map.
       */
  
      // Get the state from the topojson data.
      const states = topojson.feature(us, us.objects.states).features;
      const state = states.find(s => s.id === d.id);
    
      // Prepare the SVG container for the state map.
      const stateMapDiv = d3.select('#state-map');
      stateMapDiv.selectAll("*").remove(); // Clear previous content
      const mapDiv = document.getElementById('state-map');
      const width = mapDiv.offsetWidth;
      const height = mapDiv.offsetHeight;

      // Assuming the initial projection was used to draw the national map.
      const statePath = d3.geoPath(); // Reuse the path generator with the initial projection
    
      // Append a new SVG for the state.
      const stateSVG = stateMapDiv.append('svg')
        .attr('width', width)
        .attr('height', height);
    
      // Calculate bounding box for the state path.
      const bounds = statePath.bounds(state),
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2;
    
      // Compute scale and translation to fit the state in the container.
      const scale = .95 / Math.max(dx / width, dy / height);
      const translate = [(width / 2) - scale * x, (height / 2) - scale * y];
    
      // Render the state path with the computed transformation.
      stateSVG.append("path")
          .datum(state)
          .attr("fill", "#ccc")
          .attr("d", statePath)
          .attr("stroke", "white")
          .attr("stroke-linejoin", "round")
          .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
    
      // Show the close button.
      document.getElementById('closeBtn').style.display = 'block';
    }

    // Load the map.
    const geoJSON = 'https://d3js.org/us-10m.v1.json';
    const mapDiv = document.getElementById('map'); // Get the container element
    const width = mapDiv.offsetWidth; // Use the container's width
    const height = window.innerHeight; // Use the window's height or any other logic for the height
    console.log('Width:', width, 'Height:', height);
    const aspectRatio = { width: 960, height: 600 };

    // Create the SVG element inside the map container with a viewBox.
    const svg = d3.select('#map').append('svg')
                  .attr('viewBox', `0 0 ${aspectRatio.width} ${aspectRatio.height}`);

    // Render the map.
    let path = d3.geoPath();
    d3.json(geoJSON).then(us => {
        var states = topojson.feature(us, us.objects.states).features;

        // Paths for each state.
        svg.append("g")
          .selectAll("path")
          .data(states)
          .join("path")
          .attr("fill", "#ccc")
          .attr("d", path)
          .on('click', function(event, d) {
            zoomToState(d, us);
            document.getElementById('closeBtn').style.display = 'inline-block'; // Show the close button.
          })
          .append("title")
          .text(d => stateFipsCodes[d.id]);
          
        // Outline between states.
        svg.append("path")
           .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
           .attr("fill", "none")
           .attr("stroke", "white")
           .attr("stroke-linejoin", "round")
           .attr("d", path);
    });

    // Attach close functionality.
    document.getElementById('closeBtn').addEventListener('click', function() {
      this.style.display = 'none'; // Hide the close button.
      d3.select('#state-map').selectAll("*").remove(); // Hide the state map.
      d3.select('#map').style("display", "block"); // Show the national map.
      d3.select('#state-map').style("display", "none");
    });

  },

  async initializeLicensee() {
    /**
     * Initialize the licensee page.
     */
    let data = JSON.parse(localStorage.getItem('licensee'));
    const slug = window.location.pathname.split('/').pop();
    if (data && data.id === slug) {
      console.log('Initializing licensee page from local data:', data);
    } else {
      const path = `public/data/licenses/${slug}`;
      data = await getDocument(path);
      console.log('Initializing licensee page from Firestore:', data);
    }
    // Render licensee data in the UI
    document.getElementById('licenseeImageUrl').src = data.image_url || '';
    document.getElementById('licenseeLegalName').textContent = data.legal_name || '';
    document.getElementById('licenseeDbaName').textContent = data.business_dba_name || '';
    document.getElementById('licenseeNumber').textContent = data.license_number || '';
    document.getElementById('licenseeType').textContent = data.license_type || '';

    // Business Information
    document.getElementById('businessLegalName').textContent = data.legal_name || '';
    document.getElementById('businessDbaName').textContent = data.business_dba_name || '';

    // License Details
    document.getElementById('licenseType').textContent = data.license_type || '';
    document.getElementById('licenseNumber').textContent = data.license_number || '';
    document.getElementById('licenseStatus').textContent = data.license_status || '';
    document.getElementById('licenseStatusDate').textContent = data.license_status_date || '';
    // Populate other license details

    // Contact Information
    document.getElementById('businessEmail').textContent = data.business_email || '';
    document.getElementById('businessPhone').textContent = data.business_phone || '';
    document.getElementById('businessWebsite').textContent = data.business_website || '';

    // Location
    document.getElementById('premiseStreetAddress').textContent = data.premise_street_address || '';
    document.getElementById('premiseCity').textContent = data.premise_city || '';
    // Populate other location details

  },

};

const createLicenseeCard = (licensee) => {
  /* Create a card for a licensee following the same pattern as createCard. */

  // Create the card template
  const col = document.createElement('div');
  col.className = 'observation col-12 col-md-6 col-lg-4 mb-4';
  col.dataset.id = licensee.id;
  col.dataset.type = licensee.data_type;
  
  const card = document.createElement('div');
  card.className = 'card h-100 shadow-sm border-0';

  // Add placeholder image or licensee image if available
  const imageUrl = licensee.image_url || 'https://via.placeholder.com/100';
  if (imageUrl) {
    const link = document.createElement('a');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'card-img-top';
    img.alt = licensee.legal_name || 'Licensee Image';
    link.href = licensee.link;
    link.appendChild(img);
    card.appendChild(link);
  }

  // Card body
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body d-flex flex-column';

  // Title
  const title = document.createElement('h6');
  const titleLink = document.createElement('a');
  title.className = 'card-title';
  titleLink.className = 'sans-serif text-dark';
  titleLink.textContent = licensee.title || `${licensee.legal_name} (${licensee.license_number})`;
  titleLink.href = licensee.link;
  title.appendChild(titleLink);
  cardBody.appendChild(title);

  // Add DBA if different from legal name
  if (licensee.dba && licensee.dba !== licensee.legal_name) {
    const dba = document.createElement('p');
    dba.className = 'card-text small text-muted mb-2';
    dba.textContent = `DBA: ${licensee.dba}`;
    cardBody.appendChild(dba);
  }

  // Add license status and type
  const status = document.createElement('p');
  status.className = 'card-text small mb-2';
  status.textContent = `${licensee.license_status} ${licensee.license_type}`;
  cardBody.appendChild(status);

  // Add location if available
  if (licensee.city !== 'Data Not Available' || licensee.county) {
    const location = document.createElement('p');
    location.className = 'card-text small text-muted mb-2';
    location.textContent = [
      licensee.city !== 'Data Not Available' ? licensee.city : '',
      licensee.county ? licensee.county + ' County' : '',
      licensee.state.toUpperCase()
    ].filter(Boolean).join(', ');
    cardBody.appendChild(location);
  }

  // Add tags
  if (licensee.tags && licensee.tags.length > 0) {
    const tagContainer = document.createElement('div');
    tagContainer.className = 'd-flex flex-wrap';
    licensee.tags.forEach(tag => {
      const link = document.createElement('a');
      const badge = document.createElement('span');
      badge.className = 'badge me-1 mb-1';
      badge.style.backgroundColor = tag.tag_color;
      badge.textContent = tag.tag_name;
      link.href = `/search?q=${tag.tag_id}`;
      link.appendChild(badge);
      tagContainer.appendChild(link);
    });
    cardBody.appendChild(tagContainer);
  }

  // Add toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'd-flex justify-content-end align-items-center btn-toolbar mt-auto';
  toolbar.role = 'toolbar';
  cardBody.appendChild(toolbar);

  // Complete the card
  card.appendChild(cardBody);
  col.appendChild(card);
  return col;
};