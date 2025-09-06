/**
 * Barrel export para todas las utilidades del proyecto
 * 
 * Centraliza las exportaciones de funciones utilitarias para facilitar
 * importaciones y mantener organización.
 */

// ===== HELPERS DE FORMATEO Y DISPLAY =====
export * from './format-helpers';
export * from './badge-helpers';
export * from './tailwind-helpers';

// ===== HELPERS DE FECHA Y CALENDARIO =====
export * from './date-helpers';
export * from './calendar-helpers';

// ===== HELPERS DE DATOS =====
export * from './address-utils';
export * from './search-utils';
export * from './firestore-helpers';

// ===== VALIDACIÓN =====
export * from './validation-schemas';
export * from './eventValidation';

// ===== UTILIDADES ESPECÍFICAS =====
export * from './cleanVisitTimes';
