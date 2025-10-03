/**
 * @fileoverview Hook personalizado para búsqueda de direcciones con Google Places API
 *
 * Encapsula la lógica de búsqueda, selección y gestión de estado de direcciones
 * usando PlacesServiceAdapter (Modern API). Incluye cache, manejo de errores y
 * session token management.
 *
 * @version 1.0.0
 * @since Octubre 2025 - Fase 2 Refactoring AddressInput
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { PlacesServiceAdapter } from '@/lib/places/PlacesServiceAdapter';
import {
  getGoogleMapsConfig,
  GoogleMapsUtils,
  googleMapsCache,
  type GoogleMapsPrediction
} from '@/lib/google-maps-config';
import { extractAddressComponents } from '@/utils/address-utils';
import { normalizeCountryCode } from '@/utils/country-utils';
import { uiLogger } from '@/lib/logger';
import type { FormattedAddress } from '@/types/project';

/**
 * Tipo de error de búsqueda categorizado
 */
export type SearchErrorType = 'none' | 'network' | 'api' | 'rate_limit';

/**
 * Estado de error de búsqueda
 */
export interface SearchErrorState {
  type: SearchErrorType;
  message?: string;
}

/**
 * Opciones de configuración del hook
 */
export interface UseAddressSearchOptions {
  /** Código de país ISO (ej: 'cl', 'ar') - se normaliza automáticamente */
  countryCode?: string;
  /** Callback cuando se selecciona una dirección */
  onSelect?: (address: FormattedAddress | null) => void;
  /** Callback legacy para compatibilidad */
  onPlaceSelected?: (address: FormattedAddress | null) => void;
}

/**
 * Valor de retorno del hook
 */
export interface UseAddressSearchReturn {
  // Estado
  suggestions: google.maps.places.AutocompletePrediction[];
  selectedAddress: FormattedAddress | null;
  isLoading: boolean;
  errorState: SearchErrorState;
  apiStatus: 'idle' | 'loading' | 'ready' | 'error';
  isScriptLoaded: boolean;

  // Acciones
  searchAddresses: (query: string) => Promise<void>;
  selectPlace: (placeId: string) => Promise<void>;
  clearAddress: () => void;
  retrySearch: () => void;
  setAdditionalInfo: (info: string) => void;

  // Info
  effectiveCountry: string;
  apiVersion: 'legacy' | 'modern' | null;
}

/**
 * Hook personalizado para búsqueda y selección de direcciones con Google Places API
 *
 * @param options - Opciones de configuración del hook
 * @returns Estado y funciones para gestionar búsqueda de direcciones
 *
 * @example
 * ```typescript
 * const {
 *   suggestions,
 *   selectedAddress,
 *   isLoading,
 *   searchAddresses,
 *   selectPlace
 * } = useAddressSearch({
 *   countryCode: 'cl',
 *   onSelect: handleAddressSelect
 * });
 * ```
 */
export function useAddressSearch(options: UseAddressSearchOptions = {}): UseAddressSearchReturn {
  const { countryCode, onSelect, onPlaceSelected } = options;

  // Estados
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<FormattedAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<SearchErrorState>({ type: 'none' });
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [lastQuery, setLastQuery] = useState<string>('');

  // Referencias
  const placesAdapterRef = useRef<PlacesServiceAdapter | null>(null);

  // Normalizar código de país
  const effectiveCountry = normalizeCountryCode(countryCode);

  // Obtener configuración
  const config = useRef(getGoogleMapsConfig());

  // Cargar script de Google Maps
  const { isLoaded: isScriptLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.current?.apiKey || "",
    libraries: config.current?.libraries as ('places')[] || ['places'],
    language: config.current?.language,
    region: config.current?.region,
  });

  // Inicializar PlacesServiceAdapter
  useEffect(() => {
    const initializePlacesAPI = async () => {
      if (!isScriptLoaded || !window.google?.maps) {
        return;
      }

      try {
        setApiStatus('loading');

        const adapter = new PlacesServiceAdapter({
          componentRestrictions: { country: effectiveCountry },
          sessionToken: true,
          region: effectiveCountry,
        });

        await adapter.initialize();
        placesAdapterRef.current = adapter;
        setApiStatus('ready');

        uiLogger.info(`Places API inicializada: ${adapter.getAPIVersion()} (país: ${effectiveCountry.toUpperCase()})`);

      } catch (error) {
        setApiStatus('error');
        uiLogger.error('Error al inicializar Places API:', error);
      }
    };

    initializePlacesAPI();
  }, [isScriptLoaded, effectiveCountry]);

  /**
   * Procesa detalles de un lugar y crea FormattedAddress
   */
  const processPlaceDetails = useCallback((placeDetails: google.maps.places.PlaceResult, placeId: string) => {
    try {
      const addressComponents = extractAddressComponents(placeDetails);

      const formattedAddress: FormattedAddress = {
        textoCompleto: placeDetails.formatted_address || '',
        coordenadas: {
          latitude: placeDetails.geometry?.location?.lat() || 0,
          longitude: placeDetails.geometry?.location?.lng() || 0,
        },
        placeId: placeDetails.place_id || placeId,
        componentes: {
          calle: addressComponents?.route || '',
          numero: addressComponents?.streetNumber || '',
          comuna: addressComponents?.locality || '',
          ciudad: addressComponents?.locality || '',
          region: addressComponents?.administrativeArea || '',
          pais: addressComponents?.country || '',
          codigoPostal: addressComponents?.postalCode || '',
        },
        detalle: placeDetails.formatted_address || '',
        comune: addressComponents?.locality || '',
      };

      setSelectedAddress(formattedAddress);

      // Llamar callbacks
      onSelect?.(formattedAddress);
      onPlaceSelected?.(formattedAddress);

      uiLogger.debug('Dirección procesada y seleccionada', {
        placeId,
        address: formattedAddress.textoCompleto
      });

    } catch (error) {
      uiLogger.error('Error al procesar detalles del lugar', error);
    }
  }, [onSelect, onPlaceSelected]);

  /**
   * Busca direcciones basado en query
   */
  const searchAddresses = useCallback(async (query: string) => {
    if (!config.current || !placesAdapterRef.current || apiStatus !== 'ready') {
      setSuggestions([]);
      return;
    }

    if (!GoogleMapsUtils.isValidQuery(query, config.current)) {
      setSuggestions([]);
      return;
    }

    const trimmedQuery = query.trim();
    setLastQuery(trimmedQuery);
    const cacheKey = GoogleMapsUtils.generateCacheKey(trimmedQuery);

    // Verificar caché primero
    const cachedResults = googleMapsCache.get(cacheKey);
    if (cachedResults) {
      setSuggestions(cachedResults);
      uiLogger.info('Usando resultados desde caché', { query: trimmedQuery });
      return;
    }

    setIsLoading(true);
    setErrorState({ type: 'none' });

    try {
      const predictions = await placesAdapterRef.current.getPlacePredictions(trimmedQuery);

      // Limitar número de sugerencias según configuración
      const limitedPredictions = GoogleMapsUtils.limitSuggestions(predictions, config.current);

      // Guardar en caché
      googleMapsCache.set(cacheKey, limitedPredictions);
      setSuggestions(limitedPredictions);

      uiLogger.debug(`Encontradas ${limitedPredictions.length} sugerencias para: "${trimmedQuery}"`);

    } catch (error: any) {
      setSuggestions([]);

      // Categorizar error específicamente
      let errorType: SearchErrorType = 'network';
      let errorMessage = 'Error de conexión. Intenta nuevamente.';

      if (error.message?.includes('API key')) {
        errorType = 'api';
        errorMessage = 'Error de configuración API';
      } else if (error.message?.includes('OVER_QUERY_LIMIT')) {
        errorType = 'rate_limit';
        errorMessage = 'Límite de búsquedas excedido. Espera un momento.';
      }

      setErrorState({ type: errorType, message: errorMessage });
      uiLogger.error('Error buscando direcciones:', { error, errorType });
    } finally {
      setIsLoading(false);
    }
  }, [apiStatus]);

  /**
   * Selecciona un lugar por placeId y obtiene detalles
   */
  const selectPlace = useCallback(async (placeId: string) => {
    if (!config.current || !GoogleMapsUtils.isGoogleMapsAvailable() || !placeId) {
      uiLogger.error('Google Maps API no está disponible o placeId inválido');
      return;
    }

    // Verificar caché primero
    const cacheKey = GoogleMapsUtils.generatePlaceDetailsCacheKey(placeId);
    const cachedPlace = googleMapsCache.get(cacheKey);

    if (cachedPlace) {
      processPlaceDetails(cachedPlace, placeId);
      uiLogger.info('Usando detalles de lugar desde caché', { placeId });
      return;
    }

    setIsLoading(true);

    try {
      const placeDetails = await placesAdapterRef.current!.getPlaceDetails(
        placeId,
        [
          'place_id',
          'formatted_address',
          'geometry',
          'address_components',
          'name',
          'types',
          'website',
          'formatted_phone_number',
          'rating'
        ]
      );

      setIsLoading(false);

      if (!placeDetails) {
        uiLogger.error('Error al obtener detalles del lugar', { placeId });
        return;
      }

      // Guardar en caché
      googleMapsCache.set(cacheKey, placeDetails);
      processPlaceDetails(placeDetails, placeId);

      // Refrescar session token
      if (placesAdapterRef.current) {
        placesAdapterRef.current.refreshSessionToken();
        uiLogger.debug('Session token refreshed after place selection');
      }

    } catch (error) {
      uiLogger.error('Error al obtener detalles del lugar', error);
      setIsLoading(false);
    }
  }, [processPlaceDetails]);

  /**
   * Limpia dirección seleccionada
   */
  const clearAddress = useCallback(() => {
    setSelectedAddress(null);
    setSuggestions([]);

    // Notificar a componentes padres
    onSelect?.(null);
    onPlaceSelected?.(null);

    uiLogger.debug('Dirección limpiada');
  }, [onSelect, onPlaceSelected]);

  /**
   * Reintenta última búsqueda (útil para errores de red)
   */
  const retrySearch = useCallback(() => {
    if (lastQuery) {
      searchAddresses(lastQuery);
    }
  }, [lastQuery, searchAddresses]);

  /**
   * Actualiza información adicional de la dirección seleccionada
   */
  const setAdditionalInfo = useCallback((info: string) => {
    if (selectedAddress) {
      const updatedAddress = {
        ...selectedAddress,
        informacionAdicional: info
      };

      setSelectedAddress(updatedAddress);
      onSelect?.(updatedAddress);
      onPlaceSelected?.(updatedAddress);
    }
  }, [selectedAddress, onSelect, onPlaceSelected]);

  return {
    // Estado
    suggestions,
    selectedAddress,
    isLoading,
    errorState,
    apiStatus,
    isScriptLoaded,

    // Acciones
    searchAddresses,
    selectPlace,
    clearAddress,
    retrySearch,
    setAdditionalInfo,

    // Info
    effectiveCountry,
    apiVersion: placesAdapterRef.current?.getAPIVersion() || null,
  };
}
