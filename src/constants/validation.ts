/**
 * Constantes de validación para la aplicación
 * 
 * Define reglas de validación, límites y patrones que se usan
 * consistentemente en toda la aplicación.
 */

// ===== LÍMITES DE LONGITUD =====

export const LENGTH_LIMITS = {
  // Texto corto
  NAME_MIN: 3,
  NAME_MAX: 100,
  
  // Email
  EMAIL_MAX: 254,
  
  // Teléfono
  PHONE_MIN: 9,
  PHONE_MAX: 15,
  
  // Descripción
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 1000,
  
  // Comentarios/Observaciones
  COMMENTS_MAX: 2000,
  NOTES_MAX: 500,
  
  // Proyecto específico
  PROJECT_NUMBER_MIN: 1,
  PROJECT_NUMBER_MAX: 50,
  GLOSA_MAX: 200,
  
  // Dirección
  ADDRESS_MAX: 300,
  STREET_MAX: 100,
  CITY_MAX: 50,
  
  // Referencias
  REFERENCE_MAX: 100,
} as const;

// ===== LÍMITES NUMÉRICOS =====

export const NUMERIC_LIMITS = {
  // Montos y cantidades
  AMOUNT_MIN: 0,
  AMOUNT_MAX: 999999999, // 999 millones
  
  QUANTITY_MIN: 0,
  QUANTITY_MAX: 99999,
  
  // Porcentajes
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  
  // IVA específico
  TAX_RATE_MIN: 0,
  TAX_RATE_MAX: 100,
  TAX_DECIMALS: 2,
  
  // Medidas
  SQUARE_METERS_MIN: 0,
  SQUARE_METERS_MAX: 99999,
  
  WINDOWS_COUNT_MIN: 0,
  WINDOWS_COUNT_MAX: 999,
  
  // Fechas (años)
  YEAR_MIN: 2020,
  YEAR_MAX: 2050,
} as const;

// ===== PATRONES REGEX =====

export const REGEX_PATTERNS = {
  // Email básico
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Teléfono chileno
  PHONE_CHILE: /^(\+56)?[1-9]\d{8}$/,
  PHONE_E164: /^\+[1-9]\d{1,14}$/,
  
  // Números
  POSITIVE_NUMBER: /^\d+(\.\d+)?$/,
  POSITIVE_INTEGER: /^\d+$/,
  DECIMAL_TWO_PLACES: /^\d+(\.\d{1,2})?$/,
  
  // Texto
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  LETTERS_ONLY: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  
  // RUT chileno (básico)
  RUT_CHILE: /^[0-9]+[-|‐]{1}[0-9kK]{1}$/,
  
  // Código postal
  POSTAL_CODE: /^\d{7}$/,
  
  // UUID
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Número de proyecto (alfanumérico con guiones)
  PROJECT_NUMBER: /^[A-Za-z0-9\-]+$/,
} as const;

// ===== REGLAS DE VALIDACIÓN =====

export const VALIDATION_RULES = {
  // Campos requeridos por tipo
  REQUIRED_FIELDS: {
    PROJECT: ['clientId', 'projectNumber', 'date', 'status', 'fullAddress'],
    CLIENT: ['name'],
    PAYMENT: ['projectId', 'amount', 'date'],
    VISIT: ['name', 'phone', 'status', 'scheduledDate'],
    AFTERSALE: ['projectId', 'description', 'date'],
  },
  
  // Validaciones condicionales
  CONDITIONAL: {
    // Si hay teléfono, debe ser válido
    PHONE_IF_PROVIDED: 'phoneSchema',
    
    // Si hay uninstall = true, debe tener tipos
    UNINSTALL_TYPES_IF_UNINSTALL: 'uninstallTypes required if uninstall is true',
    
    // Si hay subtotal, debe tener IVA
    TAX_IF_SUBTOTAL: 'taxRate required if subtotal > 0',
  },
  
  // Formatos específicos
  FORMATS: {
    EMAIL: 'email',
    PHONE_CHILE: 'phone_chile',
    CURRENCY: 'currency_clp',
    PERCENTAGE: 'percentage',
    DATE: 'date_iso',
  },
} as const;

// ===== MENSAJES DE ERROR PERSONALIZADOS =====

export const FIELD_ERROR_MESSAGES = {
  // Por tipo de campo
  name: {
    required: 'El nombre es requerido',
    minLength: `El nombre debe tener al menos ${LENGTH_LIMITS.NAME_MIN} caracteres`,
    maxLength: `El nombre no puede exceder ${LENGTH_LIMITS.NAME_MAX} caracteres`,
    pattern: 'El nombre solo puede contener letras y espacios',
  },
  
  email: {
    required: 'El email es requerido',
    invalid: 'Email inválido',
    maxLength: `El email no puede exceder ${LENGTH_LIMITS.EMAIL_MAX} caracteres`,
  },
  
  phone: {
    required: 'El teléfono es requerido',
    invalid: 'Número de teléfono inválido. Use formato +56912345678 o 912345678',
    minLength: `El teléfono debe tener al menos ${LENGTH_LIMITS.PHONE_MIN} dígitos`,
  },
  
  amount: {
    required: 'El monto es requerido',
    positive: 'El monto debe ser positivo',
    max: `El monto no puede exceder $${NUMERIC_LIMITS.AMOUNT_MAX.toLocaleString()}`,
    invalid: 'El monto debe ser un número válido',
  },
  
  date: {
    required: 'La fecha es requerida',
    invalid: 'Fecha inválida',
    future: 'La fecha no puede ser futura',
    past: 'La fecha no puede ser pasada',
  },
  
  description: {
    required: 'La descripción es requerida',
    minLength: `La descripción debe tener al menos ${LENGTH_LIMITS.DESCRIPTION_MIN} caracteres`,
    maxLength: `La descripción no puede exceder ${LENGTH_LIMITS.DESCRIPTION_MAX} caracteres`,
  },
  
  projectNumber: {
    required: 'El número de proyecto es requerido',
    invalid: 'El número de proyecto contiene caracteres inválidos',
    maxLength: `El número de proyecto no puede exceder ${LENGTH_LIMITS.PROJECT_NUMBER_MAX} caracteres`,
  },
  
  taxRate: {
    required: 'La tasa de IVA es requerida',
    range: `La tasa de IVA debe estar entre ${NUMERIC_LIMITS.TAX_RATE_MIN}% y ${NUMERIC_LIMITS.TAX_RATE_MAX}%`,
    decimals: `Máximo ${NUMERIC_LIMITS.TAX_DECIMALS} decimales permitidos`,
  },
  
  address: {
    required: 'La dirección es requerida',
    placeId: 'Debe seleccionar una dirección válida de la lista',
    maxLength: `La dirección no puede exceder ${LENGTH_LIMITS.ADDRESS_MAX} caracteres`,
  },
} as const;

// ===== CONFIGURACIÓN DE VALIDACIÓN =====

export const VALIDATION_CONFIG = {
  // Modo de validación por defecto
  DEFAULT_MODE: 'onChange' as const,
  
  // Revalidación
  REVALIDATE_ON_BLUR: true,
  REVALIDATE_ON_CHANGE: true,
  
  // Debounce para validaciones async
  ASYNC_VALIDATION_DEBOUNCE: 300, // ms
  
  // Mostrar errores
  SHOW_ERRORS_ON_TOUCH: true,
  SHOW_ERRORS_ON_SUBMIT: true,
  
  // Colores de validación (para usar con Tailwind)
  COLORS: {
    ERROR: 'text-red-600 border-red-500',
    SUCCESS: 'text-green-600 border-green-500',
    WARNING: 'text-yellow-600 border-yellow-500',
    NEUTRAL: 'text-gray-600 border-gray-300',
  },
} as const;

// ===== UTILIDADES DE VALIDACIÓN =====

/**
 * Valida si un string cumple con una longitud mínima y máxima
 */
export const validateStringLength = (
  value: string, 
  min: number, 
  max: number
): boolean => {
  return value.length >= min && value.length <= max;
};

/**
 * Valida si un número está dentro de un rango
 */
export const validateNumberRange = (
  value: number, 
  min: number, 
  max: number
): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  return REGEX_PATTERNS.EMAIL.test(email);
};

/**
 * Valida formato de teléfono chileno
 */
export const validatePhoneChile = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^+\d]/g, '');
  return REGEX_PATTERNS.PHONE_CHILE.test(cleanPhone) || 
         REGEX_PATTERNS.PHONE_E164.test(cleanPhone);
};

/**
 * Valida que un número tenga máximo N decimales
 */
export const validateDecimalPlaces = (
  value: number, 
  maxDecimals: number
): boolean => {
  const decimalPart = String(value).split('.')[1];
  return !decimalPart || decimalPart.length <= maxDecimals;
};