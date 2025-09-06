import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { FIREBASE_CONFIG } from '@/constants/firebase';

// Inicializar Firebase
const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
