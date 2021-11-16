/**
 * Authentication JavaScript | Cannlytics Website
 * Author: Keegan Skeate
 * Created: 1/17/2021
 * Updated: 11/15/2021
 */

import { auth as fbAuth, GoogleAuthProvider } from '../firebase.js';

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
        // TODO: Is authRequest('/login') necessary here?
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // TODO: Show error
        console.log('Error:', errorMessage);
      });
  },


  signOut() {
    /*
     * Sign a user out of their account.
     */
    // TODO: Is authRequest('/logout') necessary here?
    fbAuth.signOut();
  },


  googleSignIn() {
    /*
     * Sign in with Google.
     */
    const provider = GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  },


  resetPassword() {
    const email = document.getElementById('email-input').value;
    fbAuth.sendPasswordResetEmail(email).then(() => {
      // window.location.href = '/account/password-reset-done';
      // TODO: Show reset email sent toast.
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // TODO: Show error
      console.log('Error:', errorMessage);
    });
  },

}
