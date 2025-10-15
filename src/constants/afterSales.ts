// src/constants/afterSales.ts
// Constantes centralizadas para módulo de postventas

/**
 * Estados disponibles para postventas
 * Single Source of Truth para todos los estados del sistema
 */
export const AFTERSALES_STATUS = {
  INGRESADA: 'Ingresada',
  AGENDADA: 'Agendada',
  REAGENDAR: 'Reagendar',
  COMPLETADA: 'Completada',
} as const;

/**
 * Tipo TypeScript derivado de las constantes
 * Garantiza type-safety en toda la aplicación
 */
export type AfterSalesStatus = typeof AFTERSALES_STATUS[keyof typeof AFTERSALES_STATUS];

/**
 * Opciones de estado para filtros y selects
 * Formato compatible con componentes Shadcn/ui
 */
export const AFTERSALES_STATUS_OPTIONS = [
  { value: AFTERSALES_STATUS.INGRESADA, label: 'Ingresada' },
  { value: AFTERSALES_STATUS.AGENDADA, label: 'Agendada' },
  { value: AFTERSALES_STATUS.REAGENDAR, label: 'Reagendar' },
  { value: AFTERSALES_STATUS.COMPLETADA, label: 'Completada' },
] as const;

/**
 * Mapeo de estados a variantes de Badge
 * Centraliza la lógica de colores para badges
 */
export const AFTERSALES_STATUS_BADGE_VARIANTS = {
  [AFTERSALES_STATUS.INGRESADA]: 'outline',
  [AFTERSALES_STATUS.AGENDADA]: 'secondary',
  [AFTERSALES_STATUS.REAGENDAR]: 'destructive',
  [AFTERSALES_STATUS.COMPLETADA]: 'complete',
} as const;

/**
 * Obtiene la variante de badge para un estado dado
 * Incluye normalización case-insensitive para robustez
 *
 * @param status - Estado de la postventa
 * @returns Variante de badge correspondiente
 */
export const getAfterSaleStatusBadgeVariant = (status: string): string => {
  // Normalizar a formato correcto (primera letra mayúscula)
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  // Buscar variante en el mapeo
  const variant = AFTERSALES_STATUS_BADGE_VARIANTS[normalized as AfterSalesStatus];

  if (!variant) {
    // Warning para detectar datos corruptos en consola
    console.warn(`[AfterSales] Estado desconocido: "${status}". Usando fallback 'outline'.`);
    return 'outline';
  }

  return variant;
};
