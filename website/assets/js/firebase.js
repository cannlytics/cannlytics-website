/**
 * Firebase JavaScript | Cannlytics Website
 * Created: 12/22/2020
 * Updated: 11/23/2021
 */
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteField,
  deleteDoc,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  getStorage,
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';

// Initialize Firebase.
const firebaseApp = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
});

// Get core modules.
const analytics = getAnalytics(firebaseApp);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

/*----------------------------------------------------------------------------
  Firestore Interface
  ----------------------------------------------------------------------------*/

 const createDocumentReference = (path) => {
  /**
   * Create a Firestore document reference from a path.
   * @param {string} path The path to the document. 
   * @return {DocumentReference}
   */
  const parts = path.replace(/^\//g, '').split('/');
  return doc(db, ...parts);
};

const createCollectionReference = (path) => {
  /**
   * Create a Firestore collection reference from a path.
   * @param {string} path The path to the collection. 
   * @return {CollectionReference}
   */
  const parts = path.replace(/^\//g, '').split('/');
  return collection(db, ...parts);
};

async function getCollection(path, params) {
  /**
   * Get documents from a collection in Firestore.
   * @param {string} path The path to the document.
   * @param {map} params Parameters for querying: `desc`, `filters`, `max`, `order`.
   * @return {Array}
   */
  const collectionRef = createCollectionReference(path);
  const args = [collectionRef];
  const { desc, filters=[], max, order } = params;
  filters.forEach((filter) => {
    args.push(where(filter.key, filter.operation, filter.value));
  });
  if (order && desc) args.push(orderBy(order, 'desc'));
  else if (order) args.push(orderBy(order));
  if (max) args.push(limit(max));
  const snapshot = await getDocs(...args);
  return snapshot.docs.map(doc => doc.data());
}

// TODO:
async function getDocument(path) {
  /**
   * Get a document from Firestore.
   * @param {string} path The path to the document.
   * @return {Map}
   */
}

/**
 * Create or update a document in Firestore.
 * @param {string} path The path to the document.
 * @param {map} path The path to the document.
 */
 async function setDocument(path, data) {
  const now = new Date().toISOString();
  const documentRef = createDocumentReference(path);
  const entry = {...data, created_at: now, updated_at: now };
  await setDoc(documentRef, entry);
  return { id: documentRef.id, ...entry };
}

// TODO: Delete document
async function deleteDocument(path) {
  /**
   * Delete a document from Firestore.
   * @param {string} path The path to the document.
   */
}

// const deleteDocument = (path) => new Promise((resolve, reject) => {
//   /*
//    * Delete a document from Firestore.
//    */
//   const ref = getReference(path);
//   ref.delete().then(() => resolve())
//     .catch((error) => reject(error));
// });


// Optional: Listen to document with a callback.

// Optional: Listen to collection with a callback.


// FIXME: Update to SDK v9





/*----------------------------------------------------------------------------
  Authentication Interface
  ----------------------------------------------------------------------------*/


// FIXME:
const changePhotoURL = (file) => new Promise((resolve, reject) => {
  /* 
  * Upload an image to Firebase Storage to use for a user's photo URL,
  * listening for state changes, errors, and the completion of the upload.
  */
  const uid = auth.currentUser.uid;
  const storageRef = storage.ref();
  const metadata = { contentType: 'image/jpeg' };
  const fileName = `users/${uid}/user_photos/${file.name}`;
  const uploadTask = storageRef.child(fileName).put(file, metadata);
  uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED:
          break;
        case firebase.storage.TaskState.RUNNING:
          break;
      }
    }, 
    (error) => {
      reject(error);
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        auth.currentUser.updateProfile({ photoURL: downloadURL });
        resolve(downloadURL);
      });
    }
  );
});

// FIXME:
const getUserToken = (refresh=false) => new Promise((resolve, reject) => {
  /*
   * Get an auth token for a given user.
   */
  if (!auth.currentUser) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken(refresh).then((idToken) => {
          resolve(idToken)
        }).catch((error) => {
          reject(error);
        });
      }
    });
  } else {
    auth.currentUser.getIdToken(refresh).then((idToken) => {
      resolve(idToken)
    }).catch((error) => {
      reject(error);
    });
  }
});

// FIXME:
const verifyUserToken = (token) => new Promise((resolve, reject) => {
  /*
   * Verify an authentication token for a given user.
   */
  auth.signInWithCustomToken(token)
    .then((userCredential) => resolve(userCredential.user))
    .catch((error) => reject(error));
});


/*----------------------------------------------------------------------------
  Storage Interface
  ----------------------------------------------------------------------------*/

// FIXME:
// const getDownloadURL = (path) => new Promise((resolve, reject) => {
//   /*
//    * Get a download URL for a given file path.
//    */
//   ref(storage, path).getDownloadURL()
//   .then((url) => resolve(url))
//   .catch((error) => reject(error));

// });


// FIXME:
// TODO: Combine uploadImage with uploadFile
const uploadImage = (path, data) => new Promise((resolve) => {
  /*
   * Upload an image to Firebase Storage given it's full destination path and 
   * the image as a data URL.
   */
  // const storageRef = storage.ref();
  // const ref = storageRef.child(path);
  // ref.putString(data, 'data_url').then((snapshot) => {
  //   resolve(snapshot);
  // });
  const storage = getStorage();
  const storageRef = ref(storage, path);

  // TODO: Create 'file' comes from the Blob or File API
  uploadBytes(storageRef, file).then((snapshot) => {
    console.log('Uploaded a blob or file!');
  });
});


// FIXME:
const uploadFile = (path, file) => new Promise((resolve, reject) => {
  /*
   * Upload an image to Firebase Storage given it's full destination path and 
   * the image as a data URL.
   */
  const storageRef = storage.ref();
  const ref = storageRef.child(path);
  ref.put(file).then((snapshot) => resolve(snapshot))
    .catch((error) => reject(error));
});


// FIXME:
const deleteFile = (path) => new Promise((resolve, reject) => {
  /*
   * Upload an image to Firebase Storage given it's full destination path and 
   * the image as a data URL.
   */
  const storageRef = storage.ref();
  const ref = storageRef.child(path);
  ref.delete().then(() => resolve())
    .catch((error) => reject(error));
});


// FIXME:
const downloadFile = async (ref, fileName) => {
  /*
   * Download a file given a path or a URL.
   */
  console.log(ref, fileName);
  if (!ref.startsWith('http')) ref = await getDownloadURL(ref);
  const response = await fetch(ref);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.style = 'display: none';
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(blob);
};


const storageErrors = {
  'storage/unknown':	'An unknown error occurred.',
  'storage/object-not-found':	'No file exists at the desired reference.',
  'storage/bucket-not-found':	'Improper storage configuration.',
  'storage/project-not-found':	'Project is not configured for Cloud Storage.',
  'storage/quota-exceeded':	"Your storage quota has been exceeded. If you're on the free tier, upgrade to a paid plan. If you're on a paid plan, reach out to Cannlytics support.",
  'storage/unauthenticated':	'Unauthenticated, please authenticate and try again.',
  'storage/unauthorized':	"You are not authorized to perform the desired action, check your privileges to ensure that they are correct.",
  'storage/retry-limit-exceeded':	"The operation took too long to complete. Please try uploading again.",
  'storage/invalid-checksum':	"There is an error with the file. Please try uploading again.",
  'storage/canceled':	'Operation canceled.',
  'storage/invalid-url': "Invalid URL name.",
  'storage/cannot-slice-blob': "Your local file may have changed. Please try uploading again after verifying that the file hasn't changed.",
  'storage/server-file-wrong-size':	"Your file is too large. Please try uploading a different file.",
};


export {
  analytics,
  auth,
  db,
  deleteDocument,
  getCollection,
  getDocument,
  logEvent,
  onAuthStateChanged,
  setDocument,
  storageErrors,
  // GoogleAuthProvider,
  // changePhotoURL,
  // deleteDocument,
  // deleteFile,
  // downloadFile,
  // getCollection,
  // getDownloadURL,
  // getUserToken,
  // getDocument,
  // updateDocument,
  // uploadImage,
  // uploadFile,
  // verifyUserToken,
};
