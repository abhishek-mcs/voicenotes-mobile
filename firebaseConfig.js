import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import * as db from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase

const firebaseConfig = {
  apiKey: "AIzaSyDPQPDEadmLo0Tm3dZTN_jpZjKAlcO5ZUY",
  authDomain: "voicenotes-747a1.firebaseapp.com",
  databaseURL: "https://voicenotes-747a1-default-rtdb.firebaseio.com",
  projectId: "voicenotes-747a1",
  storageBucket: "voicenotes-747a1.appspot.com",
  messagingSenderId: "406037921167",
  appId: "1:406037921167:web:af9b42c7c647c005145ffa",
  measurementId: "G-02898EPC2Q"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { app,db };
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
