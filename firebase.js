// /firebase.js
// Shared Firebase initialization for offer + success pages (ES Modules).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  "apiKey": "AIzaSyDB_FK8-3ATZBpuvfL34EMp9WHTTd5sfIo",
  "authDomain": "gradeo-in.firebaseapp.com",
  "projectId": "gradeo-in",
  "storageBucket": "gradeo-in.firebasestorage.app",
  "messagingSenderId": "784963451684",
  "appId": "1:784963451684:web:9d57beed639d488e4891b1",
  "measurementId": "G-JSNGKKMJEH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics is optional; wrapped in try/catch to avoid issues in some environments.
try {
  getAnalytics(app);
} catch (e) {
  // ignore
}
