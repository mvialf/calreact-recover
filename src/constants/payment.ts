// src/constants/payment.ts
// Constantes de métodos y tipos de pago
// NOTA: Los tipos e interfaces relacionados están en @/types/payment.ts

/**
 * Métodos de pago disponibles en el sistema
 * Para el tipo TypeScript derivado, importar PaymentMethod de @/types/payment
 */
export const PAYMENT_METHODS = ['transferencia', 'tarjeta de crédito', 'cheque', 'tarjeta de débito', 'efectivo', 'otro'] as const;

/**
 * Tipos de pago disponibles en el sistema
 * Para el tipo TypeScript derivado, importar PaymentTypeOption de @/types/payment
 */
export const PAYMENT_TYPES = ['proyecto', 'cliente', 'otro'] as const;
