import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBeWoQmx6ISZ--WCjnHJPVvNFmQENldZtU",
  authDomain: "ecleaningdevice.firebaseapp.com",
  projectId: "ecleaningdevice",
  storageBucket: "ecleaningdevice.firebasestorage.app",
  messagingSenderId: "340648252215",
  appId: "1:340648252215:web:b978a140debfbdf01380b2",
  measurementId: "G-WWSE8BXPJ0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);