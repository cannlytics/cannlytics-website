/**
 * Payment JavaScript | Cannlytics Website
 * Created: 1/17/2021
 * Updated: 7/31/2021
 */

import { getDocument } from '../firebase.js';


export const payments = {


  async getSubscription(name) {
    /*
     * Get a subscription given its name.
     */
    return await getDocument(`public/subscriptions/subscription_plans/${name}`);
  },


  subscribe(subscription) {
    /*
     * Save account information,
     * then navigate to the confirmation page.
     */
    const form = document.getElementById('account-information');
    let data;
    if (form) {
      data = Object.fromEntries(new FormData(form).entries());
      data = { ...data, ...subscription };
    } else {
      var userEmail = document.getElementById('email-input').value;
      data = { email: userEmail };
    }
    fetch(`${window.location.origin}/api/subscribe/`, {
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { 'Accept': 'application/json' },
    });
    window.location.href = `${window.location.origin}/subscriptions/subscribed/`;
  },


};
