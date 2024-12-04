// import { initializeApp } from 'firebase/app';
// import { getDatabase } from 'firebase/database';
import { firebase } from '@react-native-firebase/analytics';
// import { currentENV } from 'services/api/api-constants';

// // Optionally import the services that you want to use
// // import {...} from "firebase/auth";
// // import * as db from "firebase/database";
// // import {...} from "firebase/firestore";
// // import {...} from "firebase/functions";
// // import {...} from "firebase/storage";

// // Initialize Firebase

// const firebaseConfig = currentENV=='production'?{
//   apiKey: "AIzaSyDPQPDEadmLo0Tm3dZTN_jpZjKAlcO5ZUY",
//   authDomain: "voicenotes-747a1.firebaseapp.com",
//   databaseURL: "https://voicenotes-747a1-default-rtdb.firebaseio.com",
//   projectId: "voicenotes-747a1",
//   storageBucket: "voicenotes-747a1.appspot.com",
//   messagingSenderId: "406037921167",
//   appId: "1:406037921167:web:af9b42c7c647c005145ffa",
//   measurementId: "G-02898EPC2Q"
// }:{
//   apiKey: "AIzaSyB1vbhFzpg05KAJ81dHohzeQUwKTIRuw-g",
//   authDomain: "test-status-22295.firebaseapp.com",
//   databaseURL: "https://test-status-22295-default-rtdb.firebaseio.com",
//   projectId: "test-status-22295",
//   storageBucket: "test-status-22295.appspot.com",
//   messagingSenderId: "26565445812",
//   appId: "1:26565445812:web:970b0c212efff91af32fe1",
//   measurementId: "G-QR1ZT9GBG1"
// };

// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);
const analytics=firebase.analytics;
export { analytics };
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
