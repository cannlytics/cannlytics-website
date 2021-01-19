// Firebase JavaScript

// Firebase Configuration
// visit https://console.firebase.google.com/u/1/project/projectID/settings/general/
var firebaseConfig = {
    apiKey: 'AIzaSyCWEMwQitfiSSAg21KcRb0YpNOhdyD4bak',
    authDomain: 'cannlytics.firebaseapp.com',
    databaseURL: 'https://cannlytics.firebaseio.com',
    projectId: 'cannlytics',
    storageBucket: 'cannlytics.appspot.com',
    messagingSenderId: '464045168555',
    appId: '1:464045168555:web:901f17cf975e20ccf624ee',
    measurementId: 'G-L7L5FE68R5',
};
firebase.initializeApp(firebaseConfig);

// Listen for authentication state.
var auth = firebase.auth();
auth.onAuthStateChanged(function(user) {
  console.log('Current User:');
  console.log(user);
});

// Database reference
var db = firebase.firestore();

function resetPassword() {
  var email = document.getElementById('input_email').value;
  // TODO: Handle email validation
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      // this.success = true;
      // this.showResetSuccessCheckMark = true;
      // this.email = '';
    })
    .catch((error) => {
      // this.errorDialog = true;
      // this.errorDialogMessage = 'Unable to send your password reset email:';
      // this.errorDialogMessage += ` ${error}.`;
      // this.errorDialogMessage += ' Please check your internet connection,';
      // this.errorDialogMessage += ' then email support@prxslab.com';
    })
    .finally(() => {
      // this.authenticating = false;
    });
}

function signIn() {
  console.log('Signing in....');
  var email = document.getElementById('input_email').value;
  var password = document.getElementById('input_password').value;
  // TODO: Handle form validation
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // TODO: Handle Errors here.
    var errorMessage = error.message;
    console.log('Error:');
    console.log(errorMessage);
  });
}

function signUp() {
  var email = document.getElementById('input_email').value;
  var password = document.getElementById('input_password').value;
  // TODO: Handle form validation
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // TODO: Handle Errors here.
    var errorMessage = error.message;
    console.log('Error:');
    console.log(errorMessage);
  });
}

function signOut() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}

function sendFirestoreEmail() {
  // $('.toast').toast({ delay: 4000 }); // Optional: Initialize globally
  var email = document.getElementById('input_email').value;
  var message = document.getElementById('input_message').value;
  var name = document.getElementById('input_name').value;
  // TODO: Send by posting to Firestore.
  console.log(email);
  console.log(name);
  console.log(message);
  // $('#success-toast').toast('show');
  window.location.href = '/contact/thank-you/';
}

// function authenticateWithToken(token) {
//   firebase.auth().signInWithCustomToken(token).catch(function(error) {
//     // Handle Errors here.
//     console.log('Error:');
//     console.log(errorMessage);
//     // ...
//   });
// }

// db.collection('notifications').where("is_read", "==", false).onSnapshot(function
//     (querySnapshot) {
//     var undreaded_box = document.getElementById('undreaded_box');
//     undreaded_box.innerHTML = '';
//     querySnapshot.forEach(function (snapshot) {
//         undreaded_box.innerHTML +=
//             `<div id="` + snapshot.id + `" class="alert alert-success" role="alert">
//                     <h4 class="alert-heading">New Message</h4>
//                     <p>` + snapshot.data().message + `</p>
//                     <hr>
//                     <a href="#" class="make_as_read_link">Make As Read</a>
//                  </div>`;
//         $('.make_as_read_link').click(function (e) {
//             e.preventDefault();
//             makeAsRead(snapshot.id);
//         });
//     });
// });
// db.collection('notifications').where("is_read", "==", true).onSnapshot(function
//     (querySnapshot) {
//     var readed_box = document.getElementById('readed_box');
//     readed_box.innerHTML = '';
//     querySnapshot.forEach(function (snapshot) {
//         readed_box.innerHTML +=
//             `<div id="` + snapshot.id + `" class="alert alert-primary" role="alert">
//                     <h4 class="alert-heading">Old Message</h4>
//                     <p>` + snapshot.data().message + `</p>
//                  </div>`;
//     });
// });

// function makeAsRead(snapshot_id) {
//     $.ajax("/ajax/make-as-read/?snapshot_id=" + snapshot_id, {
//         success: function (data) {
//             console.log(data);
//         }
//     });
// }

// function sendMessage() {
//     var message_element = document.getElementById('id_message');
//     $.ajax('/ajax/send-message?message=' + message_element.value, {
//         success: function (data) {
//             console.log(data);
//             message_element.value = '';
//         }
//     });
// }
