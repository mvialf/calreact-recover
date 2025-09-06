
// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '@/constants/firebase';

let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(FIREBASE_CONFIG);
} else {
  app = getApp();
}

db = getFirestore(app);

export { app, db };
