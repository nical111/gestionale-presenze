// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAghGBNG2Sx_SQGDLmx5Qrb_27LriRPehU",
  authDomain: "gestionalepresenze.firebaseapp.com",
  projectId: "gestionalepresenze",
  storageBucket: "gestionalepresenze.appspot.com",
  messagingSenderId: "869431670526",
  appId: "1:869431670526:web:9d5f8185ac079280597af",
  measurementId: "G-026K801RR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
