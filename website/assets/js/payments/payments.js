/**
 * Payment JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 1/17/2021
 * Updated: 11/23/2021
 * License: MIT License
 */
import { getDocument } from '../firebase.js';
import { authRequest, getUrlParameter } from '../utils.js';

export const payments = {

  // FIXME: Cancel subscription with PayPal API.
  // https://developer.paypal.com/docs/api/reference/get-an-access-token/
  // https://developer.paypal.com/docs/api/overview/#get-an-access-token
  // https://developer.paypal.com/docs/api/reference/api-requests/#http-request-headers
  cancelSubscription() {
    /**
     * Cancel a user's subscription.
     */
    // TODO: Get clientId and secret.
    headers.set('Authorization', 'Basic ' + Buffer.from(username + ":" + password).toString('base64'));
    const options = { headers };
    fetch(url, options)
    .then(response => {
      try {
        return response.json();
      } catch(error) {
        return response;
      }
      // return response.json();
    })
    .catch((error) => reject(error))
  },
  // headers.set('Authorization', 'Basic ' + Buffer.from(username + ":" + password).toString('base64'));

  async getSubscription(name) {
    /**
     * Get a subscription given its name.
     * @param {String} name The name of the subscription plan.
     */
    return await getDocument(`public/subscriptions/subscription_plans/${name}`);
  },

  async getUserSubscriptions() {
    /**
     * Get the current user's subscriptions.
     */
    const response = await authRequest('/api/subscriptions/');
    return response.data;
  },

  logPromo() {
    /**
     * Log a promotional event.
     */
    var code = getUrlParameter('source');
    if (!code) return;
    var data = { 'promo_code': code };
    fetch(`${window.location.origin}/promotions/`, {
      method: 'POST', 
      body: JSON.stringify(data),
      headers: { 'Accept': 'application/json' },
    });
  },

  // FIXME:
  subscribe(subscription) {
    /**
     * Save account information,
     * then navigate to the confirmation page.
     * @param {Subscription} subscription A subscription class.
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
  // subscribe() {
  //   /* Subscribe to newsletter functionality. */
  //   var emailInput = document.getElementById('email-input');
  //   var subscribeBtn = document.getElementById('subscribe-button');
  //   var email = emailInput.value;
  //   if (!email) return; // TODO: Check if email is valid and notify user of error.
  //   subscribeBtn.disabled = true;
  //   var xhr = new XMLHttpRequest();
  //   xhr.addEventListener('readystatechange', function() {
  //     if (this.readyState === 4) {
  //       var jsonResponse = JSON.parse(this.responseText);
  //       var success = jsonResponse.message.success;
  //       if (success) {
  //         emailInput.value = '';
  //         document.location.href = `${window.location.origin}/subscribed/`;
  //       }
  //       else {
  //         // TODO: Show success dismiss-able alert
  //         alert('Error subscribing. Please check that your email is valid and that you have a healthy internet connection.');
  //       }
  //       subscribeBtn.disabled = false;
  //     }
  //   });
  //   xhr.open('POST', `${window.location.origin}/api/subscribe/`);
  //   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  //   xhr.send(`email=${email}`);
  // },

};
