/**
 * Website JavaScript | Cannlytics Website
 * Copyright (c) 2021-2022 Cannlytics
 * 
 * Authors: Keegan Skeate <https://github.com/keeganskeate>
 * Created: 12/3/2020
 * Updated: 9/15/2024
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { checkGoogleLogIn, onAuthChange, getCurrentUser } from '../firebase.js';
import { authRequest, hasClass } from '../utils.js';
import { contact } from './contact.js';
import { theme } from '../ui/theme.js';
import { dashboard } from './dashboard.js';

export const website = {

  ...contact,
  ...dashboard,

  initialize() {
    /**
     * Initialize the website's features and functionality.
     */
    console.log('Initializing website...');

    // Set the theme.
    this.setInitialTheme();

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
          // TODO: Replace with a default image.
          // else {
          //   const robohash = `${window.location.origin}/robohash/${user.email}/?width=60&height=60`;
          //   document.getElementById('user-photo').src = robohash;
          // }
        } catch(error) {
          // Pass
        }

        // Show elements that depend on authentication.
        this.toggleAuthenticatedElements(true);

        // Login the user on the server.
        await authRequest('/src/auth/login');

        // Redirect the user to the dashboard if they are on the sign-in page.
        // this.redirectIfUser();

      } else {
        // Hide any elements that depend on authentication.
        this.toggleAuthenticatedElements(false);

        // Retry to get user credentials.
        // checkForCredentials();
      }
    });

  },

  acceptCookies() {
    /**
     * Save the user's choice to accept cookies.
     */
    localStorage.setItem('cannlytics_cookies', true);
    const toast = document.getElementById('accept-cookies');
    toast.style.display = 'none';
    toast.style.opacity = 0;
  },

  acceptCookiesCheck() {
    /**
     * Checks if a user has or has not accepted cookies.
     */
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
    /**
     * Determines if the provided birthdate is for someone 21 years or older.
     */
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
    /**
     * Save the user's choice to accept age verification.
     */
    localStorage.setItem('cannlytics_age', true);
    const modal = document.getElementById('age-verification');
    modal.style.display = 'none';
    modal.style.opacity = 0;
  },

  rejectAgeCheck() {
    /**
     * Redirect the user to another site if they reject age verification.
     */
    window.location.href = "https://google.com";
  },

  redirectIfUser() {
    /**
     * Redirect the user to the dashboard if they are signed in.
     */
    onAuthChange(async user => {
      if (user) {
        const currentPath = window.location.pathname;
        if (currentPath === '/account/sign-in' || currentPath === '/account/sign-up') {
          window.location.href = `${window.location.origin}/account`;
        }
      }
    });
  },

  changeTheme() {
    /**
     * Change the website's theme.
     */
    let currentTheme = localStorage.getItem('cannlytics_theme');
    if (!currentTheme) {
      const hours = new Date().getHours();
      const dayTime = hours > 6 && hours < 20;
      currentTheme = dayTime ? 'light' : 'dark';
    }
    const newTheme = (currentTheme === 'light') ? 'dark' : 'light';
    this.setTheme(newTheme);
    theme.setTableTheme();
    localStorage.setItem('cannlytics_theme', newTheme);
  },

  setInitialTheme() {
    /**
     * Set the theme when the website loads.
     */
    if (typeof(Storage) !== 'undefined') {
      let currentTheme = localStorage.getItem('cannlytics_theme');
      if (!currentTheme) {
        const hours = new Date().getHours();
        const dayTime = hours > 6 && hours < 20;
        if (!dayTime) this.setTheme('dark');
        return;
      }
      this.setTheme(currentTheme);
      localStorage.setItem('cannlytics_theme', currentTheme);
    } else {
      document.getElementById('theme-toggle').style.display = 'none';
    }
  },

  setTheme(currentTheme) {
    /**
     * Set the website's theme.
     * @param {String} currentTheme The theme to set: `light` or `dark`.
     */
    if (currentTheme === 'light') document.body.className = 'base';
    else if (!hasClass(document.body, 'dark')) document.body.className += ' dark';
  },

  scrollToHash () {
    /**
     * Scroll to any an from any hash in the URL.
     */
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

async function checkForCredentials() {
  /**
   * Check if a user has signed in through a redirect from
   * an authentication provider, such as Google.
   */
  try {
    await checkGoogleLogIn();
    await authRequest('/src/auth/login');
  } catch(error) {
    // No Google sign-in token.
  }
}
