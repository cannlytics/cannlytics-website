/**
 * Website JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <keegan@cannlytics.com>
 * Created: 12/3/2020
 * Updated: 11/25/2021
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 * 
 * TODO: Refactor and move functions to better homes.
 */
import { auth, checkGoogleLogIn, onAuthStateChanged } from '../firebase.js';
import { authRequest } from '../utils.js';

async function checkForCredentials() {
  /**
   * Check if a user has signed in through a redirect from
   * an authentication provider, such as Google.
   */
  try {
    await checkGoogleLogIn();
    await authRequest('/api/internal/login');
  } catch(error) {
    // No Google sign-in token.
  }
}

export const website = {

  initialize() {
    /**
     * Initialize the website's features and functionality.
     */

    // Initialize accept cookies notification.
    this.acceptCookiesCheck();

    // Set the theme.
    this.setInitialTheme();

    // Scroll to any hash's anchor.
    this.scrollToHash();

    // Check if a user is signed in.
    onAuthStateChanged(auth, user => {
      if (user) {
        document.getElementById('user-email').textContent = user.email;
        document.getElementById('user-name').textContent = user.displayName;
        if (user.photoURL) {
          document.getElementById('user-photo').src = user.photoURL;
        } else {
          document.getElementById('user-photo').src = `/robohash/${user.email}/?width=60&height=60`
        }
        this.toggleAuthenticatedMaterial(true);
      } else {
        this.toggleAuthenticatedMaterial(false);
        checkForCredentials();
      }
    });

  },

  initializeToasts() {
    /**
     * Initialize Bootstrap toasts.
     */
    var toast = document.getElementById('cookie-toast');
    new bootstrap.Toast(toast, { autohide: false });
  },

  acceptCookies() {
    /**
     * Save choice that user accepted cookies.
     */
    localStorage.setItem('acceptCookies', true);
    var toast = document.getElementById('accept-cookies');
    toast.style.display = 'none';
    toast.style.opacity = 0;
    // TODO: Make entry in Firestore for cookie accepted?
  },

  acceptCookiesCheck() {
    /**
     * Checks if a user needs to accept cookies.
     */
    var acceptCookies = localStorage.getItem('acceptCookies');
    if (!acceptCookies) {
      var toast = document.getElementById('accept-cookies');
      toast.style.display = 'block';
      toast.style.opacity = 1;
    }
  },

  changeTheme() {
    /**
     * Change the website's theme.
     */
    var theme = localStorage.getItem('theme');
    if (!theme) {
      var hours = new Date().getHours();
      var dayTime = hours > 6 && hours < 20;
      theme = dayTime ? 'light' : 'dark';
    }
    var newTheme = (theme === 'light') ? 'dark' : 'light';
    this.setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  },

  setInitialTheme() {
    /**
     * Set the theme when the website loads.
     */
    if (typeof(Storage) !== 'undefined') {
      var theme = localStorage.getItem('theme');
      if (!theme) {
        var hours = new Date().getHours();
        var dayTime = hours > 6 && hours < 20;
        if (!dayTime) this.setTheme('dark');
        return;
      }
      this.setTheme(theme);
      localStorage.setItem('theme', theme);
    } else {
      document.getElementById('theme-toggle').style.display = 'none';
    }
  },

  setTheme(theme) {
    /**
     * Set the website's theme.
     * @param {String} theme The theme to set: `light` or `dark`.
     */
    if (theme === 'light') {
      document.body.className = 'base';
    } else if (! this.hasClass(document.body, 'dark')) {
      document.body.className += ' dark';
    }
  },

  hasClass(element, className) {
    /**
     * Check if an element has a class.
     * @param {Element} element An HTML element.
     * @param {String} className The class to check in the element's class list.
     * @returns {bool}
     */
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
  },

  scrollToHash () {
    /**
     * Scroll to any an from any hash in the URL.
     */
    var hash = window.location.hash.substring(1);
    var element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView();
    }
  },

  copyToClipboard(text) {
    /**
     * Prompt a user to copy a block of code to their clipboard.
     * @param {String} text The text to copy to the clipboard.
    */
    // Optional: Improve getting only text from between tags.
    // https://aaronluna.dev/blog/add-copy-button-to-code-blocks-hugo-chroma/
    var tags = [
      /<span class="p">/g,
      /<\/span>/g,
      /<span class="nx">/g,
      /<span class="o">/g,
      /<span class="s2">/g,
      /<span class="kn">/g,
      /<span class="n">/g,
      /<span class="nn">/g,
    ];
    tags.forEach((tag) => {
      text = text.replace(tag, '');
    });
    window.prompt('Copy to clipboard: Press Ctrl+C, then Enter', text);
  },

  toggleAuthenticatedMaterial(authenticated = false) {
    /**
     * Show any material that requires authentication.
     * @param {bool} authenticated Whether or not the user is authenticated.
     */
    const indicatesAuth = document.getElementsByClassName('indicates-auth');
    const requiresAuth = document.getElementsByClassName('requires-auth');
    for (var i = 0; i < indicatesAuth.length; i++) {
      if (authenticated) indicatesAuth.item(i).classList.add('visually-hidden');
      else indicatesAuth.item(i).classList.remove('visually-hidden');
    }
    for (var i = 0; i < requiresAuth.length; i++) {
      if (authenticated) requiresAuth.item(i).classList.remove('visually-hidden');
      else requiresAuth.item(i).classList.add('visually-hidden');
    }
  },

}
