/**
 * Hook personalizado para gestionar Google Places API
 * Incluye caché, debouncing y gestión de sesiones
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { 
  getGoogleMapsConfig, 
  GoogleMapsUtils, 
  googleMapsCache,
  sessionTokenManager,
  type GoogleMapsPrediction,
  type GoogleMapsPlace 
} from '@/lib/google-maps-config';
import { extractAddressComponents } from '@/utils/address-utils';
import { uiLogger } from '@/lib/logger';
import type { FormattedAddress } from '@/types/project';

export interface UseGooglePlacesOptions {
  onPlaceSelect?: (address: FormattedAddress | null) => void;
  minQueryLength?: number;
  debounceMs?: number;
  maxSuggestions?: number;
}

export interface UseGooglePlacesReturn {
  // Estado
  isLoaded: boolean;
  loadError: any;
  isLoading: boolean;
  suggestions: GoogleMapsPrediction[];
  
  // Funciones
  searchPlaces: (query: string) => void;
  selectPlace: (placeId: string) => Promise<void>;
  clearSuggestions: () => void;
  
  // Utilidades
  generateMapsUrl: (lat: number, lng: number) => string;
  generateShareUrl: (address: string, lat?: number, lng?: number) => string;
  
  // Configuración
  config: ReturnType<typeof getGoogleMapsConfig> | null;
}

export function useGooglePlaces(options: UseGooglePlacesOptions = {}): UseGooglePlacesReturn {
  const {
    onPlaceSelect,
    minQueryLength = 3,
    debounceMs = 300,
    maxSuggestions = 5
  } = options;

  // Estado interno
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GoogleMapsPrediction[]>([]);
  
  // Referencias para servicios
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Obtener configuración
  const config = useMemo(() => {
    try {
      const baseConfig = getGoogleMapsConfig();
      return {
        ...baseConfig,
        minQueryLength,
        debounceMs,
        maxSuggestions
      };
    } catch (error) {
      uiLogger.error('Error al obtener configuración de Google Maps', error);
      return null;
    }
  }, [minQueryLength, debounceMs, maxSuggestions]);

  // Cargar script de Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config?.apiKey || "",
    libraries: config?.libraries as ('places')[] || ['places'],
    language: config?.language,
    region: config?.region,
  });

  // Inicializar servicios cuando Google Maps esté cargado
  const initializeServices = useCallback(() => {
    if (isLoaded && GoogleMapsUtils.isGoogleMapsAvailable()) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        uiLogger.info('Servicios de Google Maps inicializados correctamente');
      } catch (error) {
        uiLogger.error('Error al inicializar servicios de Google Maps', error);
      }
    }
  }, [isLoaded]);

  // Llamar a la inicialización cuando esté listo
  useMemo(() => {
    initializeServices();
  }, [initializeServices]);

  // Función de búsqueda de lugares
  const searchPlacesInternal = useCallback(async (query: string) => {
    if (!config || !autocompleteService.current || !GoogleMapsUtils.isValidQuery(query, config)) {
      setSuggestions([]);
      return;
    }

    const trimmedQuery = query.trim();
    const cacheKey = GoogleMapsUtils.generateCacheKey(trimmedQuery, {
      region: config.region,
      language: config.language
    });

    // Verificar caché primero
    const cachedResults = googleMapsCache.get(cacheKey);
    if (cachedResults) {
      setSuggestions(cachedResults);
      uiLogger.info('Resultados obtenidos desde caché', { query: trimmedQuery });
      return;
    }

    setIsLoading(true);

    try {
      const request = GoogleMapsUtils.buildAutocompleteRequest(trimmedQuery, config);

      const results = await new Promise<GoogleMapsPrediction[]>((resolve) => {
        autocompleteService.current?.getPlacePredictions(request, (predictions, status) => {
          if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
            const limitedPredictions = GoogleMapsUtils.limitSuggestions(predictions, config);
            resolve(limitedPredictions);
          } else {
            uiLogger.warn('Error en búsqueda de direcciones', { status, query: trimmedQuery });
            resolve([]);
          }
        });
      });

      // Guardar en caché
      googleMapsCache.set(cacheKey, results);
      setSuggestions(results);
      
      uiLogger.info('Búsqueda completada', { 
        query: trimmedQuery, 
        resultCount: results.length,
        fromCache: false 
      });
    } catch (error) {
      uiLogger.error('Error al buscar direcciones', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Función con debounce
  const searchPlaces = useMemo(() => {
    if (!config) return () => {};
    return GoogleMapsUtils.debounce(searchPlacesInternal, config.debounceMs);
  }, [searchPlacesInternal, config]);

  // Función auxiliar para procesar detalles del lugar
  const processPlaceDetails = useCallback((place: GoogleMapsPlace, placeId: string) => {
    try {
      const addressComponents = extractAddressComponents(place);

      const formattedAddress: FormattedAddress = {
        textoCompleto: place.formatted_address || "",
        coordenadas: {
          latitude: place.geometry?.location?.lat() || 0,
          longitude: place.geometry?.location?.lng() || 0,
        },
        placeId: place.place_id || placeId,
        componentes: {
          calle: addressComponents?.route || '',
          numero: addressComponents?.streetNumber || '',
          comuna: addressComponents?.locality || '',
          ciudad: addressComponents?.locality || '',
          region: addressComponents?.administrativeArea || '',
          pais: addressComponents?.country || 'Chile',
          codigoPostal: addressComponents?.postalCode || '',
        },
        detalle: place.formatted_address || '',
        comune: addressComponents?.locality || '',
      };

      onPlaceSelect?.(formattedAddress);
      uiLogger.info('Lugar procesado y seleccionado', { 
        placeId, 
        address: formattedAddress.textoCompleto 
      });
    } catch (error) {
      uiLogger.error('Error al procesar detalles del lugar', error);
    }
  }, [onPlaceSelect]);

  // Función para seleccionar un lugar
  const selectPlace = useCallback(async (placeId: string) => {
    if (!config || !GoogleMapsUtils.isGoogleMapsAvailable() || !placeId) {
      uiLogger.error('Google Maps API no disponible o placeId inválido');
      return;
    }

    // Verificar caché de detalles
    const cacheKey = GoogleMapsUtils.generatePlaceDetailsCacheKey(placeId);
    const cachedPlace = googleMapsCache.get(cacheKey);
    
    if (cachedPlace) {
      processPlaceDetails(cachedPlace, placeId);
      uiLogger.info('Detalles de lugar obtenidos desde caché', { placeId });
      return;
    }

    setIsLoading(true);

    try {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      const request = GoogleMapsUtils.buildPlaceDetailsRequest(placeId, config);

      service.getDetails(request, (place, status) => {
        setIsLoading(false);
        
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) {
          uiLogger.error('Error al obtener detalles del lugar', { status, placeId });
          return;
        }

        // Guardar en caché
        googleMapsCache.set(cacheKey, place);
        processPlaceDetails(place, placeId);
        
        uiLogger.info('Detalles de lugar obtenidos', { placeId, fromCache: false });
      });
    } catch (error) {
      uiLogger.error('Error al obtener detalles del lugar', error);
      setIsLoading(false);
    }
  }, [config, processPlaceDetails]);

  // Función para limpiar sugerencias
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  // Función para generar URL de Maps
  const generateMapsUrl = useCallback((lat: number, lng: number) => {
    return GoogleMapsUtils.generateMapsUrl(lat, lng);
  }, []);

  // Función para generar URL de compartir
  const generateShareUrl = useCallback((address: string, lat?: number, lng?: number) => {
    return GoogleMapsUtils.generateShareUrl(address, lat, lng);
  }, []);

  return {
    // Estado
    isLoaded,
    loadError,
    isLoading,
    suggestions,
    
    // Funciones
    searchPlaces,
    selectPlace,
    clearSuggestions,
    
    // Utilidades
    generateMapsUrl,
    generateShareUrl,
    
    // Configuración
    config
  };
}

// Hook adicional para métricas y monitoreo
export function useGooglePlacesMetrics() {
  const [metrics, setMetrics] = useState({
    cacheHits: 0,
    cacheMisses: 0,
    searchCount: 0,
    selectCount: 0,
    errorCount: 0,
    avgResponseTime: 0
  });

  const recordCacheHit = useCallback(() => {
    setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
  }, []);

  const recordCacheMiss = useCallback(() => {
    setMetrics(prev => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
  }, []);

  const recordSearch = useCallback((responseTime?: number) => {
    setMetrics(prev => ({
      ...prev,
      searchCount: prev.searchCount + 1,
      avgResponseTime: responseTime 
        ? (prev.avgResponseTime + responseTime) / 2 
        : prev.avgResponseTime
    }));
  }, []);

  const recordSelect = useCallback(() => {
    setMetrics(prev => ({ ...prev, selectCount: prev.selectCount + 1 }));
  }, []);

  const recordError = useCallback(() => {
    setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      size: googleMapsCache.size(),
      hitRate: metrics.cacheHits > 0 ? metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) : 0
    };
  }, [metrics]);

  const resetMetrics = useCallback(() => {
    setMetrics({
      cacheHits: 0,
      cacheMisses: 0,
      searchCount: 0,
      selectCount: 0,
      errorCount: 0,
      avgResponseTime: 0
    });
  }, []);

  return {
    metrics,
    recordCacheHit,
    recordCacheMiss,
    recordSearch,
    recordSelect,
    recordError,
    getCacheStats,
    resetMetrics
  };
}