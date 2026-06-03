import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6IXCk6EXm0ndord8Is6cRZf_mG2MY5UM",
  authDomain: "kedinasan-d9051.firebaseapp.com",
  projectId: "kedinasan-d9051",
  storageBucket: "kedinasan-d9051.firebasestorage.app",
  messagingSenderId: "488517479224",
  appId: "1:488517479224:web:57ed244cf69e2a010c6fcd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const COLLECTION_NAME = "cetakpresensi";

export async function fetchNpsnData(npsn: string) {
  try {
    const docRef = doc(db, COLLECTION_NAME, npsn);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { exists: true, data: docSnap.data() };
    }
    return { exists: false, data: null };
  } catch (error) {
    console.error("Error fetching NPSN data:", error);
    throw error;
  }
}

export async function saveNpsnData(npsn: string, data: any) {
  try {
    const docRef = doc(db, COLLECTION_NAME, npsn);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving NPSN data:", error);
    throw error;
  }
}
