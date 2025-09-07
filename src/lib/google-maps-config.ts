/**
 * Configuración centralizada para Google Maps API
 * Incluye gestión de sesiones, optimización de campos y cache
 */

// Tipos para la configuración
export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
  language: string;
  region: string;
  sessionToken?: string;
  fieldsForPlaceDetails: string[];
  fieldsForAutocomplete: string[];
  debounceMs: number;
  minQueryLength: number;
  maxSuggestions: number;
  cacheExpirationMs: number;
}

// Configuración por defecto optimizada para Chile
export const defaultGoogleMapsConfig: Omit<GoogleMapsConfig, 'apiKey'> = {
  libraries: ['places'],
  language: 'es',
  region: 'cl',
  // Campos mínimos necesarios para Places Details API (optimiza costos)
  fieldsForPlaceDetails: [
    'place_id',
    'formatted_address', 
    'geometry.location',
    'address_components'
  ],
  // Campos para Autocomplete (básicos)
  fieldsForAutocomplete: [
    'place_id',
    'description',
    'structured_formatting'
  ],
  debounceMs: 300,
  minQueryLength: 3,
  maxSuggestions: 5,
  cacheExpirationMs: 10 * 60 * 1000 // 10 minutos
};

// Cache para sugerencias recientes
interface CacheEntry {
  data: any;
  timestamp: number;
}

class GoogleMapsCache {
  private cache = new Map<string, CacheEntry>();
  private readonly expirationMs: number;

  constructor(expirationMs: number = defaultGoogleMapsConfig.cacheExpirationMs) {
    this.expirationMs = expirationMs;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar si la entrada ha expirado
    if (Date.now() - entry.timestamp > this.expirationMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Limpiar entradas expiradas cada 100 inserciones
    if (this.cache.size % 100 === 0) {
      this.cleanExpiredEntries();
    }
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.expirationMs) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Instancia global del cache
export const googleMapsCache = new GoogleMapsCache();

// Gestión de tokens de sesión para agrupar requests relacionados
class SessionTokenManager {
  private currentToken: string | null = null;
  private tokenCreationTime: number = 0;
  private readonly tokenExpirationMs = 3 * 60 * 1000; // 3 minutos

  generateNewToken(): string {
    // Generar un token único simple
    this.currentToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.tokenCreationTime = Date.now();
    return this.currentToken;
  }

  getCurrentToken(): string {
    // Si no hay token o ha expirado, generar uno nuevo
    if (!this.currentToken || this.isTokenExpired()) {
      return this.generateNewToken();
    }
    return this.currentToken;
  }

  private isTokenExpired(): boolean {
    return Date.now() - this.tokenCreationTime > this.tokenExpirationMs;
  }

  clearToken(): void {
    this.currentToken = null;
    this.tokenCreationTime = 0;
  }
}

export const sessionTokenManager = new SessionTokenManager();

// Configuración completa para el proyecto
export function getGoogleMapsConfig(): GoogleMapsConfig {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está configurada en las variables de entorno'
    );
  }

  return {
    ...defaultGoogleMapsConfig,
    apiKey,
    sessionToken: sessionTokenManager.getCurrentToken()
  };
}

// Utilidades para optimizar requests
export const GoogleMapsUtils = {
  /**
   * Genera una clave para el cache basada en la query y parámetros
   */
  generateCacheKey: (query: string, options?: Record<string, any>): string => {
    const optionsStr = options ? JSON.stringify(options) : '';
    return `autocomplete_${query.toLowerCase().trim()}_${optionsStr}`;
  },

  /**
   * Genera clave de cache para Place Details
   */
  generatePlaceDetailsCacheKey: (placeId: string): string => {
    return `place_details_${placeId}`;
  },

  /**
   * Valida si una query es válida para enviar a la API
   */
  isValidQuery: (query: string, config: GoogleMapsConfig): boolean => {
    return query.trim().length >= config.minQueryLength;
  },

  /**
   * Construye las opciones para AutocompleteService.getPlacePredictions
   */
  buildAutocompleteRequest: (
    query: string, 
    config: GoogleMapsConfig
  ): google.maps.places.AutocompletionRequest => ({
    input: query,
    componentRestrictions: { country: config.region },
    language: config.language,
    sessionToken: new google.maps.places.AutocompleteSessionToken(),
    types: ['address'] // Restringir solo a direcciones
  }),

  /**
   * Construye las opciones para PlacesService.getDetails
   */
  buildPlaceDetailsRequest: (
    placeId: string,
    config: GoogleMapsConfig
  ): google.maps.places.PlaceDetailsRequest => ({
    placeId,
    fields: config.fieldsForPlaceDetails,
    language: config.language,
    sessionToken: new google.maps.places.AutocompleteSessionToken()
  }),

  /**
   * Función de debounce para optimizar llamadas a la API
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  },

  /**
   * Limita el número de sugerencias según la configuración
   */
  limitSuggestions: <T>(
    suggestions: T[], 
    config: GoogleMapsConfig
  ): T[] => {
    return suggestions.slice(0, config.maxSuggestions);
  },

  /**
   * Verifica si Google Maps está disponible
   */
  isGoogleMapsAvailable: (): boolean => {
    return !!(window.google && window.google.maps && window.google.maps.places);
  },

  /**
   * Genera URL para abrir ubicación en Google Maps
   */
  generateMapsUrl: (lat: number, lng: number): string => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  },

  /**
   * Genera URL para compartir ubicación
   */
  generateShareUrl: (address: string, lat?: number, lng?: number): string => {
    if (lat && lng) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
};

// Configuración específica para testing
export const testGoogleMapsConfig: GoogleMapsConfig = {
  ...defaultGoogleMapsConfig,
  apiKey: 'TEST_API_KEY',
  debounceMs: 0, // Sin debounce en tests
  cacheExpirationMs: 1000, // Cache corto para tests
  minQueryLength: 1 // Permitir queries más cortas en tests
};

// Tipos exportados para uso en componentes

export type GoogleMapsPrediction = google.maps.places.AutocompletePrediction;
export type GoogleMapsPlace = google.maps.places.PlaceResult;
export type GoogleMapsStatus = google.maps.places.PlacesServiceStatus;