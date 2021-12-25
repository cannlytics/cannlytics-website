/**
 * Account JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <contact@cannlytics.com>
 * Created: 11/28/2021
 * Updated: 11/28/2021
 * License: MIT License <https://github.com/cannlytics/cannlytics-website/blob/main/LICENSE>
 */

import { onAuthChange, updateUserPhoto, storageErrors } from '../firebase.js';
import { authRequest, deserializeForm, serializeForm, showNotification } from '../utils.js';

export const accountSettings = {

  chooseUserPhoto() {
    /**
     * Choose a file to upload.
     */
    document.getElementById('user-photo-url').click();
  },

  initializeAccountForm() {
    /**
     * Initialize the user account form.
     */
     onAuthChange(user => {
      if (user) {
        const fileElem = document.getElementById('user-photo-url');
        fileElem.addEventListener('change', this.uploadUserPhoto, false);
        document.getElementById('account-photo').src = user.photoURL;
        console.log(user);
        const userData = {
          name: user.displayName,
          email: user.email,
          phone_number: user.phoneNumber || '',
        };
        const userForm = document.forms['user-form'];
        userForm.reset();
        deserializeForm(userForm, userData);
      } else {
        window.location.href = `${window.location.origin}\\account\\sign-up`;
      }
    });
  },

  saveAccount() {
    /**
    * Saves a user's account fields.
    */
   // FIXME:
    const user = auth.currentUser;
    const data = serializeForm('user-form');
    if (data.email !== user.email) {
      user.updateEmail(data.email);
    }
    if (data.name !== user.displayName) {
      user.updateProfile({ displayName: data.name });
    }
    authRequest('https://console.cannlytics.com/api/users', data).then(() => {
      const message = 'Your account data has been successfully saved.'
      showNotification('Account saved', message, /* type = */ 'success');
    });
  },

  uploadUserPhoto() {
    /**
     * Upload a user's photo through the API.
     */
    // FIXME:
    if (this.files.length) {
      showNotification('Uploading photo', 'Uploading your profile picture...', /* type = */ 'wait');
      updateUserPhoto(this.files[0]).then((downloadURL) => {
        authRequest('https://console.cannlytics.com/api/users', { photo_url: downloadURL });
        document.getElementById('user-photo-url').src = downloadURL;
        document.getElementById('user-photo').src = downloadURL;
        const message = 'Successfully uploaded your profile picture.';
        showNotification('Uploading photo complete', message, /* type = */ 'success');
      }).catch((error) => {
        showNotification('Photo Change Error', storageErrors[error.code], /* type = */ 'error');
      });
    }
  },

};
