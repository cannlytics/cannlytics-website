/**
 * Website JavaScript | Cannlytics Website
 * Copyright (c) 2021-2024 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 12/3/2020
 * Updated: 10/2/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { onAuthChange } from '../firebase.js';
import { authRequest } from '../utils.js';
import { contact } from './contact.js';
import { dashboard } from './dashboard.js';

export const website = {

  ...contact,
  ...dashboard,

  initialize() {
    /* Initialize the website's features and functionality. */
    console.log('Initializing website...');

    // Set the theme.
    cannlytics.ui.setInitialTheme();

    // Scroll to any hash's anchor.
    this.scrollToHash();

    // Check if a user is signed in.
    onAuthChange(async user => {
      if (user) {

        // Update the UI with the user's information.
        try {
          document.getElementById('user-email').textContent = user.email;
          document.getElementById('user-name').textContent = user.displayName;
          if (user.photoURL) {
            document.getElementById('user-photo').src = user.photoURL;
          }
        } catch(error) {
          // Pass
        }

        // Show elements that depend on authentication.
        this.toggleAuthenticatedElements(true);

        // Login the user on the server.
        await authRequest('/src/auth/login');

      } else {
        // Hide any elements that depend on authentication.
        this.toggleAuthenticatedElements(false);

      }
    });

  },

  acceptCookies() {
    /* Save the user's choice to accept cookies. */
    localStorage.setItem('cannlytics_cookies', true);
    const toast = document.getElementById('accept-cookies');
    toast.style.display = 'none';
    toast.style.opacity = 0;
  },

  acceptCookiesCheck() {
    /* Checks if a user has or has not accepted cookies. */
    const acceptCookies = localStorage.getItem('cannlytics_cookies');
    if (!acceptCookies) {
      const toast = document.getElementById('accept-cookies');
      toast.style.display = 'block';
      toast.style.opacity = 1;
    }
  },

  ageCheck() {
    /**
     * Checks if a user has or has not accepted age verification.
     * Displays the age verification modal and adds an event listener
     * to the birthdate input to enable or disable the proceed button based on
     * age verification.
     */
    const acceptAge = localStorage.getItem('cannlytics_age');
    if (!acceptAge) {
      const modal = document.getElementById('age-verification');
      modal.style.display = 'block';
      modal.style.opacity = 1;
      const birthdateInput = document.getElementById('birthdate');
      birthdateInput.addEventListener('change', (event) => {
        if (cannlytics.website.verifyAge(event.target.value)) {
          document.getElementById('accept-age-verification-button').disabled = false;
        } else {
          document.getElementById('accept-age-verification-button').disabled = true;
        }
      });
    }
  },

  verifyAge(date) {
    /* Determines if the provided birthdate is for someone 21 years or older. */
    const birthdate = new Date(date);
    const year = birthdate.getFullYear();
    if (year < 1900 || year > 2099) return false;
    const currentTime = new Date();
    let age = currentTime.getFullYear() - birthdate.getFullYear();
    const m = currentTime.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && currentTime.getDate() < birthdate.getDate())) {
      age--;
    }
    return age >= 21;
  },

  acceptAgeCheck() {
    /* Save the user's choice to accept age verification. */
    localStorage.setItem('cannlytics_age', true);
    const modal = document.getElementById('age-verification');
    modal.style.display = 'none';
    modal.style.opacity = 0;
  },

  rejectAgeCheck() {
    /* Redirect the user to another site if they reject age verification. */
    window.location.href = "https://google.com";
  },

  redirectIfUser() {
    /* Redirect the user to the dashboard if they are signed in. */
    onAuthChange(async user => {
      if (user) {
        const currentPath = window.location.pathname;
        if (currentPath === '/account/sign-in' || currentPath === '/account/sign-up') {
          window.location.href = `${window.location.origin}/account`;
        }
      }
    });
  },

  scrollToHash () {
    /* Scroll to any an from any hash in the URL. */
    const hash = window.location.hash.substring(1);
    const element = document.getElementById(hash);
    if (element) element.scrollIntoView();
  },

  toggleAuthenticatedElements(authenticated = false) {
    /**
     * Show any material that requires authentication.
     * @param {bool} authenticated Whether or not the user is authenticated.
     */
    const indicatesAuth = document.getElementsByClassName('no-user-only');
    const requiresAuth = document.getElementsByClassName('requires-auth');
    for (let i = 0; i < indicatesAuth.length; i++) {
      if (authenticated) indicatesAuth.item(i).classList.add('visually-hidden');
      else indicatesAuth.item(i).classList.remove('visually-hidden');
    }
    for (let i = 0; i < requiresAuth.length; i++) {
      if (authenticated) requiresAuth.item(i).classList.remove('visually-hidden');
      else requiresAuth.item(i).classList.add('visually-hidden');
    }
  },

}
