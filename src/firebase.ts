// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {connectAuthEmulator, getAuth} from 'firebase/auth';
import {getAnalytics} from 'firebase/analytics';
import {connectFirestoreEmulator, getFirestore} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Only load analytics in production
export const analytics =
  import.meta.env.MODE === 'production' ? getAnalytics(app) : undefined;

export const auth = getAuth(app);
export const firestore = getFirestore(app);

// We don't export storage because it is only used in a few pages (upload and editor).
// That helps reduce the bundle size for the majority of the pages.

if (import.meta.env.MODE === 'emulator') {
  console.log('setting up emulators');
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', {disableWarnings: true});
  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
}
