/**
 * Errors JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 4/28/2021
 * Updated: 11/23/2021
 * License: MIT License
 */

import { authRequest } from '../utils.js';

export const errorSettings = {

  // FIXME:
  reportError(data) {
    /*
     * Reports an error to the back-end.
     */
    authRequest('/api/errors', data).then(() => {
      const message = 'Thank you for reporting this error. We will try to address it as soon as possible.';
      showNotification('Error report sent', message, { type: 'success' });
    }).catch((error) => {
      const message = "We're sorry, your error report failed to send. We will still try to find the root cause if possible.";
      showNotification('Failed to send error report', message, { type: 'error' });
    });
  },

};
