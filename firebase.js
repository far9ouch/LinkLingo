import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBt8s3bEQYaOJzmgBtUrm0ZkkjVNNo2OIE",
  authDomain: "linklingo-b9661.firebaseapp.com",
  projectId: "linklingo-b9661",
  storageBucket: "linklingo-b9661.firebasestorage.app",
  messagingSenderId: "21280895713",
  appId: "1:21280895713:web:138671c7881419bc12fda0",
  measurementId: "G-1G665RCDFJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, onValue, set }; 