# Cannlytics Website TODOs

Items are marked with checkboxes `[ ]` for tracking completion. Files are organized hierarchically by component type and functionality.

_Last updated: December 29, 2024_

## Templates

### Pages

#### Account Pages (`/website/templates/pages/account/`)

*account.html*

- [ ] Implement subscription banner for non-subscribed users

*password-reset-change.html*

- [ ] Implement Password Change Functionality (including on enter)

*subscriptions.html*

- [ ] Add usage index
- [ ] Implement usage table/graph display

#### Analytes Pages (`/website/templates/pages/analytes/`)

*analyte.html*

- [ ] Add image display from image_url
- [ ] Implement title from name
- [ ] Add metadata display (key, analysis)
- [ ] Add description section
- [ ] Display chemical data (CAS_number, chemical_formula, molar_mass)
- [ ] Add statistics by product type
- [ ] Implement distribution chart by product type
- [ ] Add highest concentration results table
- [ ] (Optional) Add highest concentration strains table

*analytes.html*

- [ ] Create masonry card layout for each analysis type
  - Include compound name links to /compounds/{key}

#### COAs Pages (`/website/templates/pages/coas/`)

*coa.html*

- [ ] Implement consumer COA viewing
- [ ] Add metadata display
- [ ] Create AG Grid table of results with analysis toggle
- [ ] Add similar results using nearest-neighbor approach

*coas.html*

- [ ] Add list views for states, producers, labs, and strains
- [ ] Implement compound sorting
- [ ] Add producer filtering

#### Results Pages (`/website/templates/pages/results/`)

*result.html*

- [ ] Add lab COA attachment functionality
- [ ] Implement public/private COA toggle
- [ ] Add QR code generation
- [ ] Implement similar results comparison
- [ ] Enable consumer COA viewing

*results.html*

- [ ] Add compound sorting
- [ ] Implement producer filtering

### Components

#### Charts (`/website/templates/components/charts/`)

*live_analytics.html*

- [ ] Implement Current Average with percent change underneath
- [ ] Add chart filtering options:
  - Filter by state
  - Filter by lab
- [ ] Add divider for cannabinoids (13-18)
- [ ] Add divider for terpenes (38-42)
- [ ] Implement time filters: 1W, 1M, 3M, YTD, 1Y, All
- [ ] (Optional) Show table of lab results for selected date

#### Dialogs (`/website/templates/components/dialogs/`)

*citation_dialog.html*

- [ ] Implement dynamic loading for each article

#### Layout (`/website/templates/components/layout/`)

*banner.html*

- [ ] Add Slug/organization support
- [ ] Implement New button

#### Placeholders (`/website/templates/components/placeholders/`)

*sign_in_placeholder.html*

- [ ] Replace with better image

#### Search (`/website/templates/components/search/`)

*search_bar.html*

- [ ] Add more data type-based filters


## API

### Core API (`/api/`)

*api_utils.py*

- [ ] Implement throttling if needed

*urls.py*

- [ ] Implement report endpoint

### Licenses API (`/api/licenses/`)

*api_licenses.py*

- [ ] Re-upload data to make current implementation obsolete

*test_api_licenses.py*

- [ ] Replicate tests in production environment

### Parsers API (`/api/parsers/`)

*api_standardizer.py*

- [ ] Implement text standardization
- [ ] Implement file standardization

### Results API (`/api/results/`)

*api_results.py*

- [ ] Add metrc_id search parameter support
- [ ] Enhance matching to return all matches

### Search API (`/api/search/`)

*api_search.py*

- [ ] Implement prompt hashing and lookup for cost savings
- [ ] Fix AI-powered search
- [ ] Add data type field retrieval


## Cloud Functions (`/functions/`)

### Sign Up Email (`/functions/auth_signup/`)

*main.py*

- [ ] Fix cloud welcome email sending
- [ ] Fix cloud admin notification email sending

### Calculate results statistics (`/functions/calc_results_stats/`)

*main.py*

- [ ] Implement lab result deletion from public/data/lab_results
- [ ] Add changes logging system
- [ ] Add data existence check and update logic
- [ ] Schedule daily lab results statistics calculation
- [ ] Implement strain statistics updates


## JavaScript (`/website/assets/js/`)

### Analytes

*analytes.js*

- [ ] Implement searchAnalytes() method
- [ ] Add analysis filtering via query parameters
- [ ] Rewrite queries with new syntax
- [ ] Implement Firestore analyses retrieval
- [ ] Fix analytes UI rendering
- [ ] Fix compound UI rendering

### COAs

*coa-parser.js*

- [ ] Add user lab results saving functionality

*coas.js*

- [ ] Implement Firestore COA retrieval

### Parsers

*live-results.js*

- [ ] Fix parameter retrieval
- [ ] Implement series connection
- [ ] Add Firestore data retrieval
- [ ] Enhance tooltip formatting


## CSS (`/website/assets/css/`)

*cannlytics.scss*

- [ ] Fix ugly menu styling
