import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getDatabase} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBwGIASU2a9b2piokVqoY7IpNEImfBAHYA",
    authDomain: "wist-956c3.firebaseapp.com",
    databaseURL: "https://wist-956c3-default-rtdb.firebaseio.com",
    projectId: "wist-956c3",
    storageBucket: "wist-956c3.appspot.com",
    messagingSenderId: "393815346520",
    appId: "1:393815346520:web:7bad2a70e3896022c2e92d"
  };
  
const firebaseapp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseapp);
const auth = getAuth();

export{database,auth}