/**
 * Utilidades compartidas para formularios
 *
 * Funciones puras reutilizables para validación y sanitización
 */

// ===== VALIDACIÓN NUMÉRICA =====

export interface NumericSanitizeOptions {
  min?: number;
  max?: number;
  integer?: boolean;
  allowNegative?: boolean;
}

/**
 * Sanitiza y valida inputs numéricos
 *
 * @param value - Valor a sanitizar (string, number, null, undefined)
 * @param defaultValue - Valor por defecto si el input es inválido
 * @param options - Opciones de validación
 * @returns Número sanitizado
 *
 * @example
 * sanitizeNumericInput('42', 0) // 42
 * sanitizeNumericInput('', 0) // 0
 * sanitizeNumericInput('42.5', 0, { integer: true }) // 42
 * sanitizeNumericInput('-5', 0, { min: 0 }) // 0
 */
export const sanitizeNumericInput = (
  value: any,
  defaultValue: number = 0,
  options: NumericSanitizeOptions = {}
): number => {
  const {
    min = 0,
    max,
    integer = false,
    allowNegative = false
  } = options;

  // Manejar valores vacíos o inválidos
  if (value === '' || value === undefined || value === null) {
    return defaultValue;
  }

  // Convertir a número
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

  // Validar que sea un número válido
  if (isNaN(numValue) || !isFinite(numValue)) {
    return defaultValue;
  }

  // Aplicar restricciones
  let sanitized = numValue;

  // Aplicar mínimo
  if (!allowNegative && sanitized < 0) {
    sanitized = 0;
  } else if (min !== undefined) {
    sanitized = Math.max(min, sanitized);
  }

  // Aplicar máximo
  if (max !== undefined) {
    sanitized = Math.min(max, sanitized);
  }

  // Aplicar redondeo si es entero
  if (integer) {
    sanitized = Math.floor(sanitized);
  }

  return sanitized;
};

// ===== GENERACIÓN DE IDs =====

/**
 * Genera un ID único usando crypto.randomUUID (más robusto que Date.now())
 *
 * @param prefix - Prefijo opcional para el ID
 * @returns ID único
 *
 * @example
 * generateUniqueId() // "550e8400-e29b-41d4-a716-446655440000"
 * generateUniqueId('item') // "item_550e8400-e29b-41d4-a716-446655440000"
 */
export const generateUniqueId = (prefix?: string): string => {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
};

/**
 * Genera un ID temporal para operaciones optimistas
 *
 * @param prefix - Prefijo para identificar como temporal
 * @returns ID temporal único
 *
 * @example
 * generateTempId('checklist') // "temp_checklist_550e8400-..."
 */
export const generateTempId = (prefix: string = 'temp'): string => {
  return `temp_${prefix}_${crypto.randomUUID()}`;
};

// ===== VALIDACIÓN DE FORMULARIOS =====

/**
 * Verifica si un objeto tiene todos los campos requeridos
 *
 * @param data - Objeto a validar
 * @param requiredFields - Array de campos requeridos
 * @returns true si todos los campos existen y no están vacíos
 *
 * @example
 * hasRequiredFields({ name: 'John', age: 30 }, ['name', 'age']) // true
 * hasRequiredFields({ name: '', age: 30 }, ['name', 'age']) // false
 */
export const hasRequiredFields = <T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): boolean => {
  return requiredFields.every(field => {
    const value = data[field];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  });
};

/**
 * Limpia valores vacíos de un objeto (null, undefined, strings vacíos)
 *
 * @param data - Objeto a limpiar
 * @returns Objeto sin valores vacíos
 *
 * @example
 * cleanEmptyValues({ name: 'John', age: null, city: '' })
 * // { name: 'John' }
 */
export const cleanEmptyValues = <T extends Record<string, any>>(
  data: T
): Partial<T> => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};

// ===== HELPERS DE ARRAYS =====

/**
 * Mueve un elemento en un array de una posición a otra (inmutable)
 *
 * @param array - Array original
 * @param fromIndex - Índice origen
 * @param toIndex - Índice destino
 * @returns Nuevo array con el elemento movido
 *
 * @example
 * moveArrayItem([1, 2, 3], 0, 2) // [2, 3, 1]
 */
export const moveArrayItem = <T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
};

/**
 * Actualiza un elemento en un array de forma inmutable
 *
 * @param array - Array original
 * @param index - Índice del elemento a actualizar
 * @param updates - Objeto con las propiedades a actualizar
 * @returns Nuevo array con el elemento actualizado
 *
 * @example
 * updateArrayItem(
 *   [{ id: 1, name: 'John' }],
 *   0,
 *   { name: 'Jane' }
 * )
 * // [{ id: 1, name: 'Jane' }]
 */
export const updateArrayItem = <T extends Record<string, any>>(
  array: T[],
  index: number,
  updates: Partial<T>
): T[] => {
  return array.map((item, i) =>
    i === index ? { ...item, ...updates } : item
  );
};
