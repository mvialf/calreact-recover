// src/utils/format-utils.ts
// Utilidades para formateo de datos

/**
 * Formatea un monto en pesos chilenos (CLP)
 * @param amount - Monto a formatear
 * @returns String formateado en CLP o 'N/A' si el valor es nulo/undefined
 */
export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
};

/**
 * Formatea una fecha usando el formato largo en español
 * @param date - Fecha a formatear
 * @returns String formateado o 'N/A' si la fecha es nula
 */
export const formatDateLong = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Formatea una fecha usando el formato corto en español
 * @param date - Fecha a formatear
 * @returns String formateado o 'N/A' si la fecha es nula
 */
export const formatDateShort = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};