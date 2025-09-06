/**
 * Constantes de valores por defecto
 * Elimina valores mágicos en formularios y componentes
 */

// Valores por defecto para ProjectEvents
export const DEFAULT_PROJECT_STATUS = 'ingresado' as const;
export const DEFAULT_EVENT_DESCRIPTION = '';
export const DEFAULT_WINDOWS_COUNT = 0;
export const DEFAULT_SQUARE_METERS = 0;
export const DEFAULT_UNINSTALL = false;
export const DEFAULT_UNINSTALL_TYPES: string[] = [];

// Valores por defecto para el calendario
export const DEFAULT_CALENDAR_VIEW = 'week' as const;
export const DEFAULT_EVENT_COLOR = 'hsl(var(--primary))';
export const DEFAULT_EVENT_DURATION_HOURS = 1;

// Valores por defecto para formularios
export const DEFAULT_PHONE = '';
export const DEFAULT_CLIENT_NAME = 'Cliente no especificado';
export const DEFAULT_GLOSA = '';

// Valores por defecto para validación
export const MIN_WINDOWS_COUNT = 0;
export const MIN_SQUARE_METERS = 0;
export const MAX_WINDOWS_COUNT = 9999;
export const MAX_SQUARE_METERS = 99999;

// Valores por defecto para paginación
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_NUMBER = 1;

// Valores por defecto para proyectos
export const DEFAULT_SUBTOTAL = 0;
export const DEFAULT_TAX_RATE = 0.19; // 19% IVA Chile
export const DEFAULT_COUNTRY = 'Chile';
export const DEFAULT_REGION = 'Región Metropolitana';