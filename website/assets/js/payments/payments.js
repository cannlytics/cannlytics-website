/**
 * Payment JavaScript | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 1/17/2021
 * Updated: 1/1/2022
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { getDocument } from '../firebase.js';
import { authRequest, getUrlParameter, showNotification, validateEmail } from '../utils.js';
import { hideLoadingButton, showLoadingButton } from '../ui/ui.js';

export const payments = {

  // State.

  sponsorshipTiers: ['1', '2', '3', '4'],

  // Functions.

  // FIXME: Cancel subscription with PayPal API.
  // https://developer.paypal.com/docs/api/reference/get-an-access-token/
  // https://developer.paypal.com/docs/api/overview/#get-an-access-token
  // https://developer.paypal.com/docs/api/reference/api-requests/#http-request-headers
  cancelSubscription() {
    /**
     * Cancel a user's subscription.
     */
    // FIXME: Prefer to do this through the API. (Will need to get clientId and secret.)
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
    const response = await authRequest('/src/payments/subscriptions');
    return response.data;
  },

  initializeSupport() {
    /**
     * Initialize the user's current level of support.
     */
  },

  initializeSponsorships() {
    /**
     * Initialize the user's current sponsorship tiers.
     */
    const userSponsorships = JSON.parse(document.getElementById('sponsorships').textContent);
    document.getElementById('select-all-tiers-button').addEventListener('click', this.selectAllSponsorshipTiers);
    document.getElementById('save-button').addEventListener('click', this.saveSponsorshipTiers);
    document.getElementById('cancel-button').addEventListener('click', this.cancelNewSponsorships);
    this.sponsorshipTiers.forEach(id => {
      const tierInput = document.getElementById(`sponsor-tier-${id}`);
      if (userSponsorships.includes(id)) tierInput.checked = true;
      // tierInput.onchange = this.toggleSponsorCheckout;
    });
  },

  cancelNewSponsorships() {
    /**
     * Cancels a user's newly selected sponsorships.
     */
    document.getElementById('checkout-button').classList.add('d-none');
    document.getElementById('save-button').classList.add('d-none');
    document.getElementById('cancel-button').classList.add('d-none');
    const userSponsorships = JSON.parse(document.getElementById('sponsorships').textContent);
    cannlytics.payments.sponsorshipTiers.forEach(id => {
      const tierInput = document.getElementById(`sponsor-tier-${id}`);
      if (userSponsorships.includes(id)) tierInput.checked = true;
      else tierInput.checked = false;
    });
  },

  saveSponsorshipTiers() {
    /**
     * Save the user's sponsorship tiers.
     */
    // TODO: Save a user's sponsorship tiers.
  },

  selectAllSponsorshipTiers() {
    /**
     * Select all sponsorship tiers.
     */
    const tiers = ['1', '2', '3', '4'];
    tiers.forEach(function(id) {
      document.getElementById(`sponsor-tier-${id}`).checked = true;
    });
    document.getElementById('checkout-button').classList.remove('d-none');
    document.getElementById('cancel-button').classList.remove('d-none');
  },

  toggleSponsorCheckout(input) {
    /**
     * Show checkout if a user is selecting new sponsorship options,
     * show save if a user deselects a current sponsorship, and
     * hide the checkout button if the user returns to their original tiers.
     */
    const tier = input.id.replace('sponsor-tier-', '');
    const userSponsorships = JSON.parse(document.getElementById('sponsorships').textContent) || [];
    if (input.checked) {
      if (!userSponsorships.includes(tier)) {
        const newTiers = JSON.parse(localStorage.getItem('cannlytics_new_sponsor_tiers')) || userSponsorships;
        newTiers.push(tier);
        localStorage.setItem('cannlytics_new_sponsor_tiers', JSON.stringify(newTiers));
        document.getElementById('checkout-button').classList.remove('d-none');
        document.getElementById('cancel-button').classList.remove('d-none');
      }
    } else {
      let newTiers = JSON.parse(localStorage.getItem('cannlytics_new_sponsor_tiers')) || userSponsorships;
      newTiers = newTiers.filter(item => item !== tier)
      localStorage.setItem('cannlytics_new_sponsor_tiers', JSON.stringify(newTiers));
      if (newTiers !== userSponsorships) {
        document.getElementById('save-button').classList.remove('d-none');
        document.getElementById('cancel-button').classList.remove('d-none');
      } else {
        document.getElementById('checkout-button').classList.add('d-none');
        document.getElementById('save-button').classList.add('d-none');
        document.getElementById('cancel-button').classList.add('d-none');
      }
    }
  },

  async logPromo() {
    /**
     * Log a promotional event.
     */
    const code = getUrlParameter('source');
    if (!code) return;
    const data = { 'promo_code': code };
    await authRequest('/src/market/promotions', data);
  },

  async subscribeToFreeNewsletter() {
    /**
     * Subscribe the user to the free newsletter.
     */
    
  },

  async subscribe(subscription) {
    /**
     * Subscribe email, then navigate to the confirmation page.
     * @param {String} subscription A subscription class.
     */
    console.log('TODO: Subscribe the user to:', subscription);
    // const form = document.getElementById('account-information');
    // let data;
    // showLoadingButton('subscribe-button');
    // if (form) {
    //   data = Object.fromEntries(new FormData(form).entries());
    //   data = { ...data, ...subscription };
    // } else {
    //   const userEmail = document.getElementById('email-input').value;
    //   if (!validateEmail(userEmail)) {
    //     const message = 'Please provide a valid email.'
    //     showNotification('Invalid email', message, /* type = */ 'error');
    //     hideLoadingButton('subscribe-button');
    //     return;
    //   }
    //   data = { email: userEmail };
    // }
    // const response = await authRequest('/src/payments/subscribe', data);
    // if (response.success) {
    //   window.location.href = `${window.location.origin}/subscriptions/subscribed`;
    // } else {
    //   const message = 'An error occurred when saving your account.'
    //   showNotification('Error saving your account', response.message, /* type = */ 'error');
    //   hideLoadingButton('subscribe-button');
    // }
  },

  // OLD | refactor if needed.
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
