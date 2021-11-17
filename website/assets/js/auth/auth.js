/**
 * Authentication JavaScript | Cannlytics Website
 * Author: Keegan Skeate
 * Created: 1/17/2021
 * Updated: 11/15/2021
 */

import { auth as fbAuth, GoogleAuthProvider } from '../firebase.js';
import { authRequest, showNotification } from '../utils.js';

export const auth = {


  signIn(event) {
    /*
     * Sign in with username and password.
     */
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    document.getElementById('sign-in-button').classList.add('d-none');
    document.getElementById('sign-in-loading-button').classList.remove('d-none');
    fbAuth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        const dialog = document.getElementById('login-dialog');
        const modal = bootstrap.Modal.getInstance(dialog);
        modal.hide();
        // FIXME:
        authRequest('/api/login/');
      })
      .catch((error) => {
        showNotification('Sign in error', error.message, { type: 'error' });
      }).finally(() => {
        document.getElementById('sign-in-button').classList.remove('d-none');
        document.getElementById('sign-in-loading-button').classList.add('d-none');
      });
  },


  signOut() {
    /*
     * Sign a user out of their account.
     */
    authRequest('/api/logout/');
    fbAuth.signOut();
  },


  googleSignIn() {
    /*
     * Sign in with Google.
     */
    const provider = GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  },

}
