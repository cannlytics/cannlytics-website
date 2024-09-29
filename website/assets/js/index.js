/**
 * Cannlytics Module Index | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 1/6/2021
 * Updated: 9/28/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
// import { analytics } from './analytics/analytics.js';
import { standardizer } from './parsers/standardizer.js';
import { CoADoc as coas } from './results/coas.js';
import { receiptsJS as receipts } from './sales/receipts.js';
import { labelsJS as labels } from './products/labels.js';
import { searchJS as search } from './website/search.js';
import { auth } from './auth/auth.js';
import { data } from './data/data.js';
import * as firebase from './firebase.js';
import { payments } from './payments/payments.js';
import { settings } from './settings/settings.js';
import { website } from './website/website.js';
import { showNotification } from './utils.js';
import { ui } from './ui/ui.js';
import { utils } from './utils.js';
import { resultsJS as results } from './results/results.js';
import { strainsJS as strains } from './strains/strains.js';
import { licensesJS as licenses } from './licenses/licenses.js';
import { retailersJS as retailers } from './licenses/retailers.js';

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
  standardizer,
  coas,
  labels,
  licenses,
  receipts,
  retailers,
  results,
  strains,
  search,
  showNotification,
};
