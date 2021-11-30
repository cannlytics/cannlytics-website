/**
 * Authentication JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <contact@cannlytics.com>
 * Created: 1/17/2021
 * Updated: 11/23/2021
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */
import { auth as fbAuth, authErrors, createAccount, googleLogIn, logIn, logOut, onAuthStateChanged, sendPasswordReset } from '../firebase.js';
import { authRequest, showNotification } from '../utils.js';

export const auth = {

  // getUserData() {
  //   /**
  //    * Get a user's name, email, phone number, and photo URL.
  //    */
  //   const user = fbAuth.currentUser || {};
  //   return {
  //     email: user.email,
  //     name: user.displayName,
  //     phone_number: user.phoneNumber,
  //     photo_url: user.photoURL,
  //   }
  // },
  ifUserDetected(callback) {
    /**
     * Perform a callback if/when a user is detected.
     * @param {function} callback A callback to perform that gets the user as a parameter.
     */
    onAuthStateChanged(fbAuth, (user) => {
      if (user) callback(user);
    });
  },

  async resetPassword() {
    /**
     * Send the user a password reset email.
     */
    const email = document.getElementById('login-email').value;
    if (!email) {
      showNotification('Password reset error', 'Please enter your email to request a password reset.', /* type = */ 'error' );
      return;
    }
    document.getElementById('password-reset-button').classList.add('d-none');
    document.getElementById('password-reset-loading-button').classList.remove('d-none');
    try {
      await sendPasswordReset();
      window.location.href = `${window.location.origin}\\acount\\password-reset-done`;
    } catch(error) {
      document.getElementById('password-reset-button').classList.remove('d-none');
      document.getElementById('password-reset-loading-button').classList.add('d-none');
      showNotification('Password reset error', 'Password reset email failed to send. Try again later.', /* type = */ 'error' );
    }
  },

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
      await authRequest('/api/internal/login');
      const dialogElement = document.getElementById('login-dialog');
      const modal = bootstrap.Modal.getInstance(dialogElement);
      modal.hide();
    } catch(error) {
      const message = authErrors[error.message] || 'Unknown error encountered while signing in.';
      showNotification('Sign in error', message, /* type = */ 'error' );
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
    await authRequest('/api/internal/logout');
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
      await authRequest('/api/internal/login');
    } catch(error) {
      showNotification('Sign up error', error.message, /* type = */ 'error');
    }
    document.getElementById('signup-button').classList.remove('d-none');
    document.getElementById('signup-loading-button').classList.add('d-none');
  },

}
