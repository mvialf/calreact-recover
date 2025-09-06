/**
 * @deprecated Este archivo se mantiene por compatibilidad.
 * Usar directamente @/constants/firebase para nueva funcionalidad.
 */

// Re-export de la configuración centralizada
export { 
  FIREBASE_CONFIG as firebaseConfig
} from '@/constants/firebase';

export { 
  validateFirebaseConfig,
  isFirebaseConfigured 
} from './validation';
