/**
 * @fileoverview Utilidades para normalización de códigos de país
 *
 * Proporciona funciones para convertir entre nombres de países y códigos ISO 3166-1 alpha-2.
 * Resuelve inconsistencias en el manejo de países entre componentes y APIs externas.
 *
 * @version 1.0.0
 * @since Octubre 2025 - Fase 1.5 Country Code Normalization
 */

/**
 * Mapeo de nombres de países (español/inglés) a códigos ISO 3166-1 alpha-2
 *
 * Incluye variaciones comunes para máxima compatibilidad con datos existentes en Firestore
 */
export const COUNTRY_CODE_MAP: Record<string, string> = {
  // América del Sur
  'chile': 'cl',
  'argentina': 'ar',
  'perú': 'pe',
  'peru': 'pe',
  'bolivia': 'bo',
  'paraguay': 'py',
  'uruguay': 'uy',
  'brasil': 'br',
  'brazil': 'br',
  'colombia': 'co',
  'ecuador': 'ec',
  'venezuela': 've',

  // América del Norte
  'méxico': 'mx',
  'mexico': 'mx',
  'estados unidos': 'us',
  'united states': 'us',
  'usa': 'us',
  'canadá': 'ca',
  'canada': 'ca',

  // Europa
  'españa': 'es',
  'spain': 'es',
  'francia': 'fr',
  'france': 'fr',
  'alemania': 'de',
  'germany': 'de',
  'italia': 'it',
  'italy': 'it',
  'reino unido': 'gb',
  'united kingdom': 'gb',
  'uk': 'gb',
  'portugal': 'pt',

  // Otros
  'china': 'cn',
  'japón': 'jp',
  'japan': 'jp',
  'corea del sur': 'kr',
  'south korea': 'kr',
  'australia': 'au',
  'nueva zelanda': 'nz',
  'new zealand': 'nz',
} as const;

/**
 * Mapeo inverso de códigos ISO a nombres de países (español)
 */
export const ISO_TO_COUNTRY_NAME: Record<string, string> = {
  'cl': 'Chile',
  'ar': 'Argentina',
  'pe': 'Perú',
  'bo': 'Bolivia',
  'py': 'Paraguay',
  'uy': 'Uruguay',
  'br': 'Brasil',
  'co': 'Colombia',
  'ec': 'Ecuador',
  've': 'Venezuela',
  'mx': 'México',
  'us': 'Estados Unidos',
  'ca': 'Canadá',
  'es': 'España',
  'fr': 'Francia',
  'de': 'Alemania',
  'it': 'Italia',
  'gb': 'Reino Unido',
  'pt': 'Portugal',
  'cn': 'China',
  'jp': 'Japón',
  'kr': 'Corea del Sur',
  'au': 'Australia',
  'nz': 'Nueva Zelanda',
} as const;

/**
 * Normaliza un código o nombre de país a formato ISO 3166-1 alpha-2 (2 letras minúsculas)
 *
 * @param country - Código ISO o nombre del país (puede ser undefined)
 * @returns Código ISO normalizado en minúsculas (ejemplo: 'cl', 'ar', 'us')
 *
 * @example
 * ```typescript
 * normalizeCountryCode('Chile')     // 'cl'
 * normalizeCountryCode('CL')        // 'cl'
 * normalizeCountryCode('chile')     // 'cl'
 * normalizeCountryCode('argentina') // 'ar'
 * normalizeCountryCode(undefined)   // 'cl' (default)
 * normalizeCountryCode('')          // 'cl' (default)
 * ```
 */
export const normalizeCountryCode = (country: string | undefined): string => {
  // Default a Chile si no se proporciona valor
  if (!country) {
    return 'cl';
  }

  // Normalizar: trim + lowercase
  const normalized = country.toLowerCase().trim();

  // Si ya es un código ISO válido (2 letras), devolverlo
  if (normalized.length === 2) {
    return normalized;
  }

  // Buscar en el mapeo de nombres a códigos
  const isoCode = COUNTRY_CODE_MAP[normalized];

  // Si se encuentra en el mapeo, devolver código ISO
  if (isoCode) {
    return isoCode;
  }

  // Fallback a Chile si el país no está en el mapeo
  return 'cl';
};

/**
 * Obtiene el nombre en español de un país a partir de su código ISO
 *
 * @param isoCode - Código ISO 3166-1 alpha-2 (2 letras)
 * @returns Nombre del país en español o el código original si no se encuentra
 *
 * @example
 * ```typescript
 * getCountryName('cl') // 'Chile'
 * getCountryName('ar') // 'Argentina'
 * getCountryName('xx') // 'xx' (código desconocido)
 * ```
 */
export const getCountryName = (isoCode: string): string => {
  const normalized = isoCode.toLowerCase().trim();
  return ISO_TO_COUNTRY_NAME[normalized] || isoCode;
};

/**
 * Valida si un string es un código ISO 3166-1 alpha-2 válido
 *
 * @param code - String a validar
 * @returns true si es un código ISO válido de 2 letras
 *
 * @example
 * ```typescript
 * isValidISOCode('cl')    // true
 * isValidISOCode('CL')    // true
 * isValidISOCode('chile') // false
 * isValidISOCode('x')     // false
 * ```
 */
export const isValidISOCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  const normalized = code.toLowerCase().trim();
  return normalized.length === 2 && /^[a-z]{2}$/.test(normalized);
};
