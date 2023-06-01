// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB4Q1fZMqKqn_KtjgBK8qBj652gNy72LhE',
  authDomain: 'supa-presentation.firebaseapp.com',
  projectId: 'supa-presentation',
  storageBucket: 'supa-presentation.appspot.com',
  messagingSenderId: '270298647382',
  appId: '1:270298647382:web:bc3d0d9e9965f9606ba4f7',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
