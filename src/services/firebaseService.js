import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBofpNLEULB3fPwCe-1IuHqZaLDkVbGGLE",
  authDomain: "data-bmkg-fcebd.firebaseapp.com",
  projectId: "data-bmkg-fcebd",
  storageBucket: "data-bmkg-fcebd.firebasestorage.app",
  messagingSenderId: "363335895696",
  appId: "1:363335895696:web:6eaed611ae1779bab7a615",
  measurementId: "G-PES625FHK6"
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

export const registerUser = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// ── FIRESTORE: Bookmark Gempa ─────────────────────────────────────────────────

/**
 * Simpan gempa ke bookmark milik user (Firestore collection: bookmarks)
 */
export const addBookmark = async (userId, gempaData) => {
  return addDoc(collection(db, 'bookmarks'), {
    userId,
    magnitude:  gempaData.Magnitude,
    wilayah:    gempaData.Wilayah,
    tanggal:    gempaData.Tanggal,
    jam:        gempaData.Jam,
    kedalaman:  gempaData.Kedalaman,
    lintang:    gempaData.Lintang,
    bujur:      gempaData.Bujur,
    potensi:    gempaData.Potensi || '',
    shakemapUrl: gempaData.shakemapUrl || '',
    savedAt:    serverTimestamp(),
  });
};

/**
 * Ambil semua bookmark milik user tertentu
 */
export const getBookmarks = async (userId) => {
  const q = query(collection(db, 'bookmarks'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const removeBookmark = async (bookmarkId) => {
  await deleteDoc(doc(db, 'bookmarks', bookmarkId));
};
