/**
 * @fileoverview Adaptador para Google Places API - Migración v2
 * 
 * Proporciona compatibilidad adaptativa entre:
 * - API Legacy: AutocompleteService, PlacesService
 * - Nueva API: AutocompleteSuggestion, Place
 * 
 * @version 1.0.0
 * @since Septiembre 2025 - Migración Google Places API
 */

import { uiLogger } from '@/lib/logger';
import { PlacesFeatureFlags } from '@/lib/config/featureFlags';
import { getGoogleMapsConfig, GoogleMapsUtils } from '@/lib/google-maps-config';

// Configuración del adaptador
export interface PlacesAdapterConfig {
  componentRestrictions?: google.maps.places.ComponentRestrictions;
  types?: string[];
  sessionToken?: boolean;
  region?: string;
  language?: string;
}

// Configuración por defecto (alineada con AppConfigContext.defaultCountry)
const DEFAULT_CONFIG: Required<PlacesAdapterConfig> = {
  componentRestrictions: { country: 'cl' }, // Chile por defecto, consistente con AppConfig
  types: ['establishment'],
  sessionToken: true,
  region: 'cl',
  language: 'es' // Mantener español como idioma
};

export class PlacesServiceAdapter {
  private apiVersion: 'legacy' | 'modern' = 'legacy';
  private placesLib: google.maps.PlacesLibrary | null = null;
  private sessionToken: google.maps.places.AutocompleteSessionToken | null = null;
  private config: Required<PlacesAdapterConfig>;
  private initialized = false;
  
  constructor(config: PlacesAdapterConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }
  
  /**
   * Inicializa el adaptador detectando qué API está disponible
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // ✅ Verificar si está en modo de emergencia
    if (PlacesFeatureFlags.isEmergencyMode()) {
      await this.initializeLegacyAPI();
      return;
    }

    // ✅ Solo intentar nueva API si está habilitada
    if (PlacesFeatureFlags.shouldUseNewAPI()) {
      try {
        // Intentar cargar nueva API primero
        this.placesLib = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
        
        if (this.placesLib.AutocompleteSuggestion && this.placesLib.AutocompleteSessionToken) {
          this.apiVersion = 'modern';
          if (this.config.sessionToken) {
            this.sessionToken = new this.placesLib.AutocompleteSessionToken();
          }
          
          if (PlacesFeatureFlags.isMonitoringEnabled()) {
            uiLogger.info('✅ Places API: Usando nueva API (AutocompleteSuggestion)');
          }
          this.initialized = true;
          return;
        } else {
          throw new Error('Nueva API no completamente disponible');
        }
      } catch (error) {
        if (PlacesFeatureFlags.isMonitoringEnabled()) {
          uiLogger.warn('⚠️ Nueva Places API no disponible:', error);
        }
        
        // Solo hacer fallback si está permitido
        if (PlacesFeatureFlags.isFallbackAllowed()) {
          await this.initializeLegacyAPI();
          return;
        } else {
          throw new Error('❌ Nueva API falló y fallback no está permitido');
        }
      }
    } else {
      // Usuario prefiere API legacy directamente
      await this.initializeLegacyAPI();
    }
  }

  /**
   * Inicializa la API legacy
   */
  private async initializeLegacyAPI(): Promise<void> {
    if (window.google?.maps?.places?.AutocompleteService) {
      this.apiVersion = 'legacy';
      if (PlacesFeatureFlags.isMonitoringEnabled()) {
        uiLogger.warn('⚠️ Places API: Usando API legacy (AutocompleteService)');
      }
      this.initialized = true;
    } else {
      throw new Error('❌ Ninguna API de Places disponible');
    }
  }
  
  /**
   * Obtiene sugerencias de lugares
   */
  public async getPlacePredictions(
    input: string,
    additionalOptions: Partial<google.maps.places.AutocompletionRequest> = {}
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.apiVersion === 'modern') {
      return this.getModernPredictions(input, additionalOptions);
    } else {
      return this.getLegacyPredictions(input, additionalOptions);
    }
  }
  
  /**
   * Implementación con nueva API (AutocompleteSuggestion)
   */
  private async getModernPredictions(
    input: string,
    additionalOptions: Partial<google.maps.places.AutocompletionRequest>
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.placesLib?.AutocompleteSuggestion) {
      throw new Error('AutocompleteSuggestion no disponible');
    }
    
    const request = {
      input,
      sessionToken: this.sessionToken || undefined,
      locationBias: additionalOptions.location ? {
        center: additionalOptions.location,
        radius: additionalOptions.radius || 50000
      } : undefined,
      includedPrimaryTypes: additionalOptions.types || this.config.types,
      region: this.config.region,
    };
    
    try {
      const response = await this.placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      // Convertir formato de respuesta para mantener compatibilidad
      return response.suggestions.map((suggestion: any) => this.convertSuggestionToPrediction(suggestion));
    } catch (error) {
      uiLogger.error('Error en AutocompleteSuggestion:', error);
      throw error;
    }
  }
  
  /**
   * Implementación con API legacy (AutocompleteService)
   */
  private async getLegacyPredictions(
    input: string,
    additionalOptions: Partial<google.maps.places.AutocompletionRequest>
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.AutocompleteService();
      const request: google.maps.places.AutocompletionRequest = {
        input,
        componentRestrictions: this.config.componentRestrictions,
        types: this.config.types,
        ...additionalOptions
      };
      
      service.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          reject(new Error(`Places service error: ${status}`));
        }
      });
    });
  }
  
  /**
   * Convierte formato de nueva API al formato legacy para compatibilidad
   */
  private convertSuggestionToPrediction(suggestion: any): google.maps.places.AutocompletePrediction {
    const placePrediction = suggestion.placePrediction;
    
    return {
      description: placePrediction?.text?.text || '',
      matched_substrings: placePrediction?.structuredFormat?.mainText?.matches || [],
      place_id: placePrediction?.placeId || '',
      structured_formatting: {
        main_text: placePrediction?.structuredFormat?.mainText?.text || '',
        main_text_matched_substrings: placePrediction?.structuredFormat?.mainText?.matches || [],
        secondary_text: placePrediction?.structuredFormat?.secondaryText?.text || ''
      },
      terms: placePrediction?.terms || [],
      types: placePrediction?.types || []
    };
  }
  
  /**
   * Retorna la versión de API actualmente en uso
   */
  public getAPIVersion(): 'legacy' | 'modern' {
    return this.apiVersion;
  }
  
  /**
   * Refresca el session token (útil para sesiones largas)
   */
  public refreshSessionToken(): void {
    if (this.apiVersion === 'modern' && this.placesLib?.AutocompleteSessionToken) {
      this.sessionToken = new this.placesLib.AutocompleteSessionToken();
    }
  }

  /**
   * Verifica si el adaptador está inicializado
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Obtiene detalles de un lugar usando la nueva API cuando está disponible
   */
  public async getPlaceDetails(
    placeId: string, 
    fields?: string[]
  ): Promise<google.maps.places.PlaceResult | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Usar nueva API si está disponible
    if (this.placesLib && this.apiVersion === 'modern') {
      try {
        // Importar Place class desde la documentación oficial
        const { Place } = this.placesLib;
        
        // Crear instancia de Place según documentación
        // Nota: sessionToken es requerido por Google API para evitar facturación duplicada
        // pero las definiciones TypeScript están desactualizadas
        const place = new Place({
          id: placeId,
          requestedLanguage: this.config.language || 'es',
          sessionToken: this.sessionToken
        } as any);
        
        // Mapear campos legacy a moderna API según documentación oficial
        const modernFields = this.mapFieldsToModernAPI(fields);
        
        // Usar fetchFields() según documentación oficial
        // El sessionToken ya se pasó en el constructor, no es necesario aquí
        await place.fetchFields({
          fields: modernFields
        });
        
        // Convertir respuesta moderna a formato legacy para compatibilidad
        const legacyResult = this.convertModernPlaceToLegacy(place);
        
        if (PlacesFeatureFlags.isMonitoringEnabled()) {
          uiLogger.info('✅ Place details obtenidos con nueva API', { placeId, fields: modernFields });
        }
        
        return legacyResult;
      } catch (error) {
        if (PlacesFeatureFlags.isMonitoringEnabled()) {
          uiLogger.warn('⚠️ Error con nueva API, usando fallback', { error, placeId });
        }
        
        // Solo hacer fallback si está permitido
        if (PlacesFeatureFlags.isFallbackAllowed()) {
          return this.getPlaceDetailsLegacy(placeId, fields);
        } else {
          throw new Error(`Nueva API falló y fallback no permitido: ${error}`);
        }
      }
    }
    
    // Usar implementación legacy si no hay moderna disponible
    return this.getPlaceDetailsLegacy(placeId, fields);
  }

  /**
   * Implementación legacy separada para mayor claridad
   */
  private async getPlaceDetailsLegacy(
    placeId: string,
    fields?: string[]
  ): Promise<google.maps.places.PlaceResult | null> {
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: fields || [
          'place_id',
          'formatted_address', 
          'geometry',
          'address_components',
          'name',
          'types',
          'vicinity',
          'website',
          'formatted_phone_number',
          'international_phone_number',
          'rating',
          'user_ratings_total'
        ]
      };

      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          if (PlacesFeatureFlags.isMonitoringEnabled()) {
            uiLogger.info('✅ Place details obtenidos con API legacy', { placeId, fields });
          }
          resolve(place);
        } else {
          const errorMsg = `Place details error: ${status}`;
          uiLogger.error(errorMsg, { placeId, status });
          reject(new Error(errorMsg));
        }
      });
    });
  }

  /**
   * Mapea campos legacy a moderna API según documentación oficial de Google
   */
  private mapFieldsToModernAPI(legacyFields?: string[]): string[] {
    // Mapeo según documentación oficial: snake_case -> camelCase
    const fieldMapping: Record<string, string> = {
      'place_id': 'id',
      'formatted_address': 'formattedAddress',
      'geometry': 'location',
      'geometry.location': 'location',
      'geometry.viewport': 'viewport', 
      'address_components': 'addressComponents',
      'name': 'displayName',
      'types': 'types',
      'vicinity': 'shortFormattedAddress',
      'website': 'websiteURI',
      'formatted_phone_number': 'nationalPhoneNumber',
      'international_phone_number': 'internationalPhoneNumber',
      'rating': 'rating',
      'user_ratings_total': 'userRatingCount',
      'price_level': 'priceLevel',
      'opening_hours': 'regularOpeningHours',
      'photos': 'photos',
      'reviews': 'reviews',
      'plus_code': 'plusCode',
      'business_status': 'businessStatus'
    };
    
    // Campos por defecto según documentación
    const defaultFields = [
      'id',
      'displayName', 
      'formattedAddress',
      'location',
      'addressComponents',
      'types'
    ];
    
    if (!legacyFields || legacyFields.length === 0) {
      return defaultFields;
    }
    
    // Mapear campos o usar original si no existe mapeo
    return legacyFields.map(field => fieldMapping[field] || field);
  }

  /**
   * Convierte respuesta de nueva API a formato legacy según documentación oficial
   */
  private convertModernPlaceToLegacy(modernPlace: any): google.maps.places.PlaceResult {
    return {
      place_id: modernPlace.id || '',
      name: modernPlace.displayName || '',
      formatted_address: modernPlace.formattedAddress || '',
      geometry: {
        location: modernPlace.location || null,
        viewport: modernPlace.viewport || null
      },
      address_components: modernPlace.addressComponents || [],
      types: modernPlace.types || [],
      vicinity: modernPlace.shortFormattedAddress || '',
      website: modernPlace.websiteURI || undefined,
      formatted_phone_number: modernPlace.nationalPhoneNumber || undefined,
      international_phone_number: modernPlace.internationalPhoneNumber || undefined,
      rating: modernPlace.rating || undefined,
      user_ratings_total: modernPlace.userRatingCount || undefined,
      price_level: modernPlace.priceLevel || undefined,
      plus_code: modernPlace.plusCode || undefined,
      business_status: modernPlace.businessStatus || undefined,
      photos: modernPlace.photos ? modernPlace.photos.map((photo: any) => ({
        getUrl: (options?: any) => photo.getURI(options),
        height: photo.heightPx || 0,
        width: photo.widthPx || 0,
        html_attributions: [photo.authorAttributions?.[0]?.displayName || '']
      })) : undefined,
      reviews: modernPlace.reviews ? modernPlace.reviews.map((review: any) => ({
        rating: review.rating || 0,
        text: review.text || '',
        time: review.publishTime ? new Date(review.publishTime).getTime() / 1000 : 0,
        author_name: review.authorAttribution?.displayName || '',
        author_url: review.authorAttribution?.uri || '',
        profile_photo_url: review.authorAttribution?.photoURI || ''
      })) : undefined,
      opening_hours: modernPlace.regularOpeningHours ? {
        open_now: modernPlace.regularOpeningHours.openNow || false,
        weekday_text: modernPlace.regularOpeningHours.weekdayDescriptions || [],
        isOpen: () => modernPlace.regularOpeningHours.openNow || false
      } : undefined
    };
  }
}