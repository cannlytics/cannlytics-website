/**
 * Authentication JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <contact@cannlytics.com>
 * Created: 1/17/2021
 * Updated: 11/23/2021
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { createAccount, googleLogIn, logIn, logOut } from '../firebase.js';
import { authRequest, showNotification } from '../utils.js';

export const auth = {

  // async checkForCredentials() {
  //   /**
  //    * Check if a user has signed in through a redirect from
  //    * an authentication provider, such as Google.
  //    */
  //   await checkGoogleLogIn();
  //   await authRequest('/api/login/');
  // },

  async signIn(event) {
    /**
     * Sign in with username and password.
     * @param {Event} event A user-driven event.
     */
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    document.getElementById('login-button').classList.add('d-none');
    document.getElementById('login-loading-button').classList.remove('d-none');
    try {
      await logIn(email, password);
      await authRequest('/api/login/');
      const dialogElement = document.getElementById('login-dialog');
      const modal = bootstrap.Modal.getInstance(dialogElement);
      modal.hide();
    } catch(error) {
      showNotification('Sign in error', error.message, /* type = */ 'error' );
    }
    document.getElementById('login-button').classList.remove('d-none');
    document.getElementById('login-loading-button').classList.add('d-none');
  },

  signInWithGoogle() {
    /**
     * Sign in with Google.
     */
    googleLogIn();
  },

  async signOut() {
    /**
     * Sign a user out of their account.
     */
    await logOut();
    await authRequest('/api/logout/');
  },

  async signUp() {
    /**
     * Sign a user up for a Firebase account with a username and password.
     */
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    document.getElementById('signup-button').classList.add('d-none');
    document.getElementById('signup-loading-button').classList.remove('d-none');
    try {
      await createAccount(email, password);
      await authRequest('/api/login/');
    } catch(error) {
      showNotification('Sign up error', error.message, /* type = */ 'error');
    }
    document.getElementById('signup-button').classList.remove('d-none');
    document.getElementById('signup-loading-button').classList.add('d-none');
  },

}
