import { 
  FIREBASE_CONFIG, 
  FIREBASE_REQUIRED_FIELDS,
  type RequiredFirebaseField 
} from '@/constants/firebase';

/**
 * Valida configuración de Firebase en tiempo de ejecución
 * Lógica separada de configuración según principios SOLID
 */
export const validateFirebaseConfig = (): {
  isValid: boolean;
  missingFields: RequiredFirebaseField[];
  errorMessage?: string;
} => {
  const missingFields = FIREBASE_REQUIRED_FIELDS.filter(
    (key) => !FIREBASE_CONFIG[key] || FIREBASE_CONFIG[key].includes('your-')
  );

  if (missingFields.length === 0) {
    return { isValid: true, missingFields: [] };
  }

  const errorMessage = `Error: Configuración de Firebase incompleta. Faltan: ${missingFields.join(', ')}`;
  
  if (typeof window !== 'undefined') {
    console.error(errorMessage);
  } else {
    console.error('\x1b[31m%s\x1b[0m', errorMessage);
  }

  return { 
    isValid: false, 
    missingFields, 
    errorMessage 
  };
};

// Validar la configuración al cargar el módulo
export const firebaseValidationResult = validateFirebaseConfig();
export const isFirebaseConfigured = firebaseValidationResult.isValid;