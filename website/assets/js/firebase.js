/**
 * Firebase JavaScript | Cannlytics Website
 * Copyright (c) 2021 Cannlytics
 * 
 * Authors: Keegan Skeate <contact@cannlytics.com>
 * Created: 12/22/2020
 * Updated: 11/23/2021
 * License: MIT License
 */
import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  getDocs,
  setDoc,
  deleteField,
  deleteDoc,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
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

const createCollectionQuery = (path, params) => {
  /**
   * Create a Firestore collection query from a path and parameters.
   * @param {string} path The path to the collection.
   * @param {map} params Parameters for querying: `desc`, `filters`, `max`, `order`.
   * @return {Query}
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
   return query(...args);
};

async function getCollection(path, params) {
  /**
   * Get documents from a collection in Firestore.
   * @param {string} path The path to the document.
   * @param {map} params Parameters for querying: `desc`, `filters`, `max`, `order`.
   * @return {Array}
   */
  const q = createCollectionQuery(path, params);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => Object({ id: doc.id, ...doc.data() }));
}

async function getDocument(path) {
  /**
   * Get a document from Firestore.
   * @param {string} path The path to the document.
   * @return {Map}
   */
  const docRef = createDocumentReference(path);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docRef.id, ...docSnap.data() };
  } else {
    return {}
  }
}

async function setDocument(path, data) {
  /**
   * Create or update a document in Firestore.
   * @param {string} path The path to the document.
   * @param {map} path The path to the document.
   */
  const now = new Date().toISOString();
  const docRef = createDocumentReference(path);
  const entry = {...data, created_at: now, updated_at: now };
  await setDoc(docRef, entry, { merge: true });
  return { id: docRef.id, ...entry };
}

async function deleteDocument(path) {
  /**
   * Delete a document from Firestore.
   * @param {string} path The path to the document.
   */
  const docRef = createDocumentReference(path);
  await deleteDoc(docRef);
}

async function deleteDocumentField(path, key) {
  /**
   * Delete a field from a document in Firestore.
   * @param {string} path The path to the document.
   * @param {string} key The key of the field to delete.
   */
  const entry = {}
  entry[key] = deleteField();
  await setDocument(path, entry);
}

async function listenToDocument(path, callback, errorCallback = null) {
  /**
   * Listen to changes of a document in Firestore.
   * @param {string} path The path to the document.
   * @param {function} callback A callback to execute when the document changes.
   * @param {function} errorCallback A callback to execute if there is an error.
   * @returns {function}
   */
  const docRef = createDocumentReference(path);
  return onSnapshot(docRef, (doc) => {
    callback({ id: doc.id, ...doc.data() });
  },
  (error) => {
    if (errorCallback) errorCallback(error);
  });
}

async function listenToCollection(
  path,
  params,
  addedCallback = null,
  modifiedCallback = null,
  removedCallback = null,
  errorCallback = null,
) {
  /**
   * Listen to changes of a document in Firestore.
   * @param {string} path The path to the collection.
   * @param {map} params Parameters for querying: `desc`, `filters`, `max`, `order`.
   * @param {function} addedCallback A callback to execute when documents in the collection are added.
   * @param {function} modifiedCallback A callback to execute when documents in the collection are modified.
   * @param {function} removedCallback A callback to execute when documents in the collection are removed.
   * @returns {function}
   */
  const q = createCollectionQuery(path, params);
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' && addedCallback) {
        addedCallback({ id: change.doc.id, ...change.doc.data() });
      }
      if (change.type === 'modified') {
        modifiedCallback({ id: change.doc.id, ...change.doc.data() })
      }
      if (change.type === 'removed') {
        removedCallback({ id: change.doc.id, ...change.doc.data() })
      }
    });
  },
  (error) => {
    if (errorCallback) errorCallback(error);
  });
}

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
  deleteDocumentField,
  getCollection,
  getDocument,
  listenToDocument,
  listenToCollection,
  logEvent,
  onAuthStateChanged,
  setDocument,
  storageErrors,
  // GoogleAuthProvider,
  // changePhotoURL,
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
