/**
 * Configuración centralizada de Firebase
 * Cumple con estructura obligatoria de CLAUDE.md
 */

// Valores por defecto para desarrollo
export const FIREBASE_DEFAULT_CONFIG = {
  apiKey: 'your-api-key',
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
  measurementId: 'G-XXXXXXXXXX',
} as const;

// Configuración construida desde variables de entorno
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FIREBASE_DEFAULT_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FIREBASE_DEFAULT_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FIREBASE_DEFAULT_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FIREBASE_DEFAULT_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FIREBASE_DEFAULT_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FIREBASE_DEFAULT_CONFIG.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || FIREBASE_DEFAULT_CONFIG.measurementId,
} as const;

// Campos requeridos para validación
export const FIREBASE_REQUIRED_FIELDS = [
  'apiKey',
  'authDomain', 
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

// Tipos para TypeScript
export type FirebaseConfigKey = keyof typeof FIREBASE_CONFIG;
export type RequiredFirebaseField = typeof FIREBASE_REQUIRED_FIELDS[number];