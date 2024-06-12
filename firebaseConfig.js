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
  apiKey: "AIzaSyB1vbhFzpg05KAJ81dHohzeQUwKTIRuw-g",
  authDomain: "test-status-22295.firebaseapp.com",
  databaseURL:"https://test-status-22295-default-rtdb.firebaseio.com",
  projectId: "test-status-22295",
  storageBucket: "test-status-22295.appspot.com",
  messagingSenderId: "26565445812",
  appId: "1:26565445812:web:970b0c212efff91af32fe1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { app,db };
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
