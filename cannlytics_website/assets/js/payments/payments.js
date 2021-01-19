/**
 * payments.js | Cannlytics Website
 * Created: 1/17/2021
 */

export const payments = {

  subscribe(subscription) {
    /*
     * Save account information to Firestore,
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
    fetch('/subscribe/', {
      method: 'POST', 
      body: JSON.stringify(data)
    });
    window.location.href = '/subscriptions/subscribed/';
  },

};
