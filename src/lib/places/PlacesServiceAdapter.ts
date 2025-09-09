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

// Configuración del adaptador
export interface PlacesAdapterConfig {
  componentRestrictions?: google.maps.places.ComponentRestrictions;
  types?: string[];
  sessionToken?: boolean;
  region?: string;
  language?: string;
}

// Configuración por defecto
const DEFAULT_CONFIG: Required<PlacesAdapterConfig> = {
  componentRestrictions: { country: 'es' },
  types: ['establishment'],
  sessionToken: true,
  region: 'es',
  language: 'es'
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
   * Obtiene detalles de un lugar (mantiene compatibilidad con implementación actual)
   */
  public async getPlaceDetails(
    placeId: string, 
    fields?: string[]
  ): Promise<google.maps.places.PlaceResult | null> {
    // Para esta versión inicial, mantenemos el comportamiento legacy
    // En futuras versiones se puede migrar a la nueva Place API
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: fields || ['place_id', 'formatted_address', 'geometry.location', 'address_components']
      };

      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`Place details error: ${status}`));
        }
      });
    });
  }
}