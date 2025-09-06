import { 
  FIREBASE_CONFIG, 
  FIREBASE_REQUIRED_FIELDS,
  type RequiredFirebaseField 
} from '@/constants/firebase';
import { Logger } from '../logger';

// Logger para validación de Firebase
const validationLogger = new Logger('FIREBASE_VALIDATION');

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
  
  // Usar logger profesional manteniendo el formato condicional para servidor
  if (typeof window !== 'undefined') {
    validationLogger.error(errorMessage);
  } else {
    validationLogger.error(`\x1b[31m${errorMessage}\x1b[0m`);
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