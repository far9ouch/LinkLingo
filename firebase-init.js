import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getDatabase, ref, set, onValue, push, remove } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyBt8s3bEQYaOJzmgBtUrm0ZkkjVNNo2OIE",
  authDomain: "linklingo-b9661.firebaseapp.com",
  databaseURL: "https://linklingo-b9661-default-rtdb.firebaseio.com",
  projectId: "linklingo-b9661",
  storageBucket: "linklingo-b9661.appspot.com",
  messagingSenderId: "21280895713",
  appId: "1:21280895713:web:138671c7881419bc12fda0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, onValue, push, remove }; 