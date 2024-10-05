/**
 * Cannlytics Module Index | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 1/6/2021
 * Updated: 10/4/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
// import { analytics } from './analytics/analytics.js';
import { auth } from './auth/auth.js';
import { data } from './data/data.js';
import * as firebase from './firebase.js';
import { payments } from './payments/payments.js';
import { settings } from './settings/settings.js';
import { website } from './website/website.js';
import { ui } from './ui/ui.js';
import { utils } from './utils.js';
import { CoADoc as coas } from './results/coas.js';
import { licensesJS as licenses } from './licenses/licenses.js';
import { retailersJS as retailers } from './licenses/retailers.js';
import { resultsJS as results } from './results/results.js';
import { strainsJS as strains } from './strains/strains.js';
import { labelsJS as labels } from './products/labels.js';
import { receiptsJS as receipts } from './sales/receipts.js';
import { searchJS as search } from './search/search.js';
import { standardizer } from './parsers/standardizer.js';

import '../css/cannlytics.scss';

export {
  // analytics,
  auth,
  data,
  firebase,
  payments,
  settings,
  ui,
  utils,
  website,
  coas,
  licenses,
  retailers,
  results,
  strains,
  labels,
  receipts,
  search,
  standardizer,
};
