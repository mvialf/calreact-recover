"use client"

import React from "react"
import { Loader2, MapPin, X, MoreVertical, Building, Copy, Map, Share2, MapPinOff } from "lucide-react" // TODO: Implementar estados de error geolocalización con MapPinOff
import { useLoadScript } from "@react-google-maps/api"
import { Country } from "react-phone-number-input"
import { extractAddressComponents } from "@/utils/address-utils"
import { cn } from "@/lib/utils"
import { useAppConfig } from "@/contexts/AppConfigContext"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Importar tipos necesarios
import type { FormattedAddress } from "@/types/project"
import { uiLogger } from '@/lib/logger';

// Importar configuración optimizada
import { 
  getGoogleMapsConfig, 
  GoogleMapsUtils, 
  googleMapsCache,
  type GoogleMapsPrediction,
  type GoogleMapsPlace 
} from '@/lib/google-maps-config'; // sessionTokenManager removido - manejado por PlacesServiceAdapter

// Importar nuevo adaptador
import { PlacesServiceAdapter } from '@/lib/places/PlacesServiceAdapter';

// Extender la interfaz global de Window para incluir google
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface AddressInputProps {
  /**
   * La dirección seleccionada
   */
  value?: FormattedAddress | null;
  /**
   * Callback que se llama cuando se selecciona una dirección
   */
  onSelect?: (address: FormattedAddress | null) => void;
  /**
   * Callback que se llama cuando se selecciona una dirección (alias para onSelect)
   */
  onPlaceSelected?: (address: FormattedAddress | null) => void;
  /**
   * Placeholder del input
   */
  placeholder?: string;
  /**
   * Clase CSS adicional
   */
  className?: string;
  /**
   * Clase CSS adicional para el input
   */
  inputClassName?: string;
  /**
   * Si el input está deshabilitado
   */
  disabled?: boolean;
  /**
   * Código de país para restringir búsquedas (ISO 3166-1 alpha-2)
   * Si no se proporciona, usa la configuración global del usuario (AppConfig.defaultCountry)
   * @example 'CL', 'ES', 'AR', 'MX'
   */
  countryCode?: string;
  /**
   * Si el input está cargando desde una fuente externa
   */
  externalLoading?: boolean;
}

export function AddressInput({
  value,
  onSelect,
  onPlaceSelected,
  placeholder = "Buscar dirección",
  className = "",
  inputClassName = "",
  disabled = false,
  externalLoading = false,
  countryCode,
}: AddressInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value?.textoCompleto || "");
  const [suggestions, setSuggestions] = React.useState<GoogleMapsPrediction[]>([]);
  const [selectedAddress, setSelectedAddress] = React.useState<FormattedAddress | null>(value || null);
  const [additionalInfo, setAdditionalInfo] = React.useState(value?.informacionAdicional || "");
  const [apiStatus, setApiStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  // ✅ ARQUITECTURA HÍBRIDA: Configuración de país con prioridad inteligente
  const { config: appConfig } = useAppConfig();

  // Calcular país efectivo con orden de prioridad:
  // 1. countryCode prop (override explícito)
  // 2. appConfig.defaultCountry (configuración usuario desde GeneralSettings)
  // 3. 'CL' (fallback)
  const effectiveCountry = React.useMemo(() => {
    const country = countryCode || appConfig.defaultCountry || 'CL';
    return country.toLowerCase(); // Google Maps API usa lowercase
  }, [countryCode, appConfig.defaultCountry]);

  // Obtener configuración optimizada
  const config = React.useMemo(() => {
    try {
      return getGoogleMapsConfig();
    } catch (error) {
      uiLogger.error('Error al obtener configuración de Google Maps', error);
      return null;
    }
  }, []);

  // ✅ SOLUCIÓN: Usar configuración centralizada
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config?.apiKey || "",
    libraries: config?.libraries as ('places')[] || ['places'],
    language: config?.language,
    region: config?.region,
  });

  // Manejar cuando el input se borra
  const handleInputClear = React.useCallback(() => {
    setInputValue("");
    setAdditionalInfo("");
    if (onPlaceSelected) {
      onPlaceSelected(null);
    } else if (onSelect) {
      onSelect(null);
    }
  }, [onPlaceSelected, onSelect]);
  
  // Manejar cambios en la información adicional
  const handleAdditionalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAdditionalInfo(newValue);
    
    // Actualizar la dirección seleccionada con la información adicional
    if (selectedAddress) {
      const updatedAddress = {
        ...selectedAddress,
        informacionAdicional: newValue
      };
      setSelectedAddress(updatedAddress);
      onSelect?.(updatedAddress);
      onPlaceSelected?.(updatedAddress);
    }
  };
  
  // Actualizar el estado interno cuando cambia el valor
  React.useEffect(() => {
    if (value) {
      setSelectedAddress(value);
      setInputValue(value.textoCompleto || '');
    } else if (value === null) {
      // Solo limpiar si se pasa explícitamente null
      setSelectedAddress(null);
      setInputValue('');
      setAdditionalInfo('');
    }
    // No hacer nada si value es undefined (carga inicial)
  }, [value]);

  // ✅ MIGRACIÓN: Reemplazar refs de servicios con adapter
  const placesAdapterRef = React.useRef<PlacesServiceAdapter | null>(null);

  // ✅ MIGRACIÓN: Inicializar nuevo adaptador
  React.useEffect(() => {
    const initializePlacesAPI = async () => {
      if (!isLoaded || !window.google?.maps) {
        return;
      }
      
      try {
        setApiStatus('loading');

        // ✅ Usar país efectivo desde configuración híbrida
        const adapter = new PlacesServiceAdapter({
          componentRestrictions: { country: effectiveCountry },
          types: ['establishment'],
          sessionToken: true,
          region: effectiveCountry, // Sesgo de resultados hacia la región configurada
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
  }, [isLoaded, effectiveCountry]);

  // ✅ MIGRACIÓN: Buscar sugerencias con nuevo adaptador
  const searchAddresses = React.useCallback(async (query: string) => {
    if (!config || !placesAdapterRef.current || apiStatus !== 'ready' || !GoogleMapsUtils.isValidQuery(query, config)) {
      setSuggestions([]);
      return;
    }

    const trimmedQuery = query.trim();
    const cacheKey = GoogleMapsUtils.generateCacheKey(trimmedQuery);

    // Verificar caché primero
    const cachedResults = googleMapsCache.get(cacheKey);
    if (cachedResults) {
      setSuggestions(cachedResults);
      uiLogger.info('Usando resultados desde caché', { query: trimmedQuery });
      return;
    }

    setIsLoading(true);

    try {
      const predictions = await placesAdapterRef.current.getPlacePredictions(trimmedQuery);

      // Limitar número de sugerencias según configuración
      const limitedPredictions = GoogleMapsUtils.limitSuggestions(predictions, config);
      
      // Guardar en caché
      googleMapsCache.set(cacheKey, limitedPredictions);
      setSuggestions(limitedPredictions);
      
      uiLogger.debug(`Encontradas ${limitedPredictions.length} sugerencias para: "${trimmedQuery}"`);
      
    } catch (error) {
      setSuggestions([]);
      uiLogger.error('Error buscando direcciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [config, apiStatus]);

  // Función auxiliar para procesar detalles del lugar
  const processPlaceDetails = React.useCallback((place: GoogleMapsPlace, placeId: string) => {
    try {
      // Extraer componentes de la dirección con validación
      const addressComponents = extractAddressComponents(place);

      // Formatear la dirección completa según el tipo FormattedAddress
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
        comune: addressComponents?.locality || '', // Campo directo para acceso rápido
      };

      // Actualizar el estado
      setSelectedAddress(formattedAddress);
      setInputValue(formattedAddress.textoCompleto);
      setSuggestions([]);
      setIsOpen(false);

      // Llamar a los callbacks
      onSelect?.(formattedAddress);
      onPlaceSelected?.(formattedAddress);
    } catch (addressError) {
      uiLogger.error('Error al procesar la dirección', addressError);
    }
  }, [onSelect, onPlaceSelected]);

  // ✅ MIGRACIÓN: Manejo optimizado de selección de lugar con caché
  const handlePlaceSelect = React.useCallback(
    async (placeId: string) => {
      if (!config || !GoogleMapsUtils.isGoogleMapsAvailable() || !placeId) {
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
        // ✅ USAR EL ADAPTADOR en lugar de PlacesService directo
        const placeDetails = await placesAdapterRef.current!.getPlaceDetails(
          placeId,
          [
            'place_id',
            'formatted_address', 
            'geometry',
            'address_components',
            'name',
            'types',
            'vicinity',
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
        
      } catch (error) {
        uiLogger.error('Error al obtener detalles del lugar', error);
        setIsLoading(false);
      }
    },
    [config, processPlaceDetails]
  );

  const handleClear = React.useCallback(() => {
    setSelectedAddress(null);
    setInputValue("");
    setSuggestions([]);
    setAdditionalInfo(""); // Limpiar también la información adicional
    
    // Notificar a los componentes padres que la dirección se ha limpiado
    if (onSelect) {
      onSelect(null);
    }
    
    if (onPlaceSelected) {
      onPlaceSelected(null);
    }
  }, [onSelect, onPlaceSelected]);

  // Manejar la acción de copiar la dirección al portapapeles
  const handleCopyAddress = React.useCallback(() => {
    if (selectedAddress?.textoCompleto) {
      navigator.clipboard.writeText(selectedAddress.textoCompleto);
      // Aquí podrías agregar una notificación de éxito si lo deseas
    }
  }, [selectedAddress]);

  // ✅ MIGRACIÓN: Usar utilidades optimizadas para URLs
  const handleViewOnMap = React.useCallback(() => {
    if (!selectedAddress?.coordenadas) return;
    
    const mapUrl = GoogleMapsUtils.generateMapsUrl(
      selectedAddress.coordenadas.latitude,
      selectedAddress.coordenadas.longitude
    );
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  }, [selectedAddress]);
  
  // ✅ MIGRACIÓN: Función mejorada para compartir ubicación
  const handleShareLocation = React.useCallback(async (name?: string) => {
    if (!selectedAddress) return;
    
    const shareUrl = GoogleMapsUtils.generateShareUrl(
      selectedAddress.textoCompleto,
      selectedAddress.coordenadas?.latitude,
      selectedAddress.coordenadas?.longitude
    );
    
    try {
      if (navigator.share) {
        const title = name || 'Ubicación';
        const text = selectedAddress.informacionAdicional 
          ? `${selectedAddress.textoCompleto} (${selectedAddress.informacionAdicional})`
          : selectedAddress.textoCompleto;
        
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } else {
        // Fallback para navegadores que no soportan Web Share API
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `${name ? `${name}\n` : ''}${selectedAddress.textoCompleto}${
            selectedAddress.informacionAdicional ? `\n${selectedAddress.informacionAdicional}` : ''
          }\n\nVer en mapa: ${shareUrl}`
        )}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      uiLogger.error('Error al compartir', err);
    }
  }, [selectedAddress]);

  // Estado para controlar la visibilidad del input de información adicional
  const [showAdditionalInfoInput, setShowAdditionalInfoInput] = React.useState(false);
  const additionalInfoInputRef = React.useRef<HTMLInputElement>(null);

  // Manejar la acción de mostrar/ocultar el input de información adicional
  const handleShowAdditionalInfo = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAdditionalInfoInput(true);
    // Enfocar el input después de que se monte
    setTimeout(() => {
      additionalInfoInputRef.current?.focus();
    }, 0);
  }, []);

  // Manejar el guardado de la información adicional
  const handleSaveAdditionalInfo = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAdditionalInfoInput(false);
  }, []);

  // Referencia al input para mantener el foco
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ✅ MIGRACIÓN: Debounced search function
  const debouncedSearchAddresses = React.useMemo(() => {
    if (!config) return () => {};
    return GoogleMapsUtils.debounce(searchAddresses, config.debounceMs);
  }, [searchAddresses, config]);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Si el campo está vacío, limpiamos todo
    if (!newValue) {
      handleInputClear();
      return;
    }
    
    // ✅ MIGRACIÓN: Usar búsqueda con debounce optimizada
    debouncedSearchAddresses(newValue);
    
    // Mantener el foco en el input
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Solo abrir el popover si hay texto
    if (newValue.trim()) {
      setIsOpen(true);
    }
  };

  // Manejar el foco en el input
  const handleInputFocus = () => {
    // Mostrar sugerencias solo si hay texto
    if (inputValue) {
      setIsOpen(true);
    }
    
    // Mantener el foco en el input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // ✅ SOLUCIÓN: Manejo de errores DESPUÉS de todos los hooks
  if (loadError) {
    uiLogger.error('Error al cargar Google Maps', loadError);
    return (
      <div className={cn("w-full", className)}>
        <Input
          type="text"
          placeholder={placeholder}
          className={cn("w-full", inputClassName)}
          disabled={true}
          value="Error: No se pudo cargar Google Maps"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Verifica tu conexión a internet y la configuración de la API de Google Maps
        </p>
      </div>
    );
  }

  // Mostrar loading mientras se carga Google Maps
  if (!isLoaded) {
    return (
      <div className={cn("w-full", className)}>
        <Input
          type="text"
          placeholder="Cargando Google Maps..."
          className={cn("w-full", inputClassName)}
          disabled={true}
          value={inputValue}
        />
      </div>
    );
  }

  // Renderizar el componente de búsqueda de direcciones
  if (selectedAddress) {
    return (
      <div className={cn("w-full bg-background border rounded-md p-3 relative group", className)} data-testid="selected-address">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">
                {selectedAddress.componentes?.calle} {selectedAddress.componentes?.numero}
              </span>
            </div>
            
            {/* Menú de acciones */}
            <div className="flex items-center gap-1">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Más acciones"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Más acciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 p-2"
                  onInteractOutside={(e) => {
                    // Prevenir que el menú se cierre cuando se interactúa con el formulario
                    if (showAdditionalInfoInput && e.target instanceof Element) {
                      const isInput = e.target.closest('input, button, form');
                      if (isInput) {
                        e.preventDefault();
                        return;
                      }
                    }
                    setShowAdditionalInfoInput(false);
                  }}
                >
                  <div className="relative">
                    {showAdditionalInfoInput ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveAdditionalInfo(e);
                        }} 
                        className="space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Información adicional (depto, block, etc.)
                        </div>
                        <div className="flex gap-1">
                          <Input
                            ref={additionalInfoInputRef}
                            type="text"
                            value={additionalInfo}
                            onChange={handleAdditionalInfoChange}
                            placeholder="Ej: Depto 405, Block C"
                            className="h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                            data-testid="additional-info-input"
                          />
                          <Button 
                            type="submit" 
                            size="sm" 
                            variant="outline"
                            className="h-8"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSaveAdditionalInfo(e);
                            }}
                          >
                            OK
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <DropdownMenuItem 
                        onSelect={(e) => {
                          e.preventDefault();
                          handleShowAdditionalInfo(e as unknown as React.MouseEvent);
                        }}
                      >
                        <Building className="mr-2 h-4 w-4" />
                        <span>Agregar información adicional</span>
                        {additionalInfo && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                      </DropdownMenuItem>
                    )}
                  </div>
                  <DropdownMenuItem onClick={handleViewOnMap}>
                    <Map className="mr-2 h-4 w-4" />
                    <span>Ver en mapa</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyAddress}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copiar dirección</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      handleShareLocation();
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Compartir ubicación</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleClear}
                aria-label="Limpiar dirección"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpiar dirección</span>
              </Button>
            </div>
          </div>
          
          {selectedAddress.informacionAdicional && (
            <div className="text-sm text-muted-foreground pl-6 flex items-center mt-1">
              <Building className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 opacity-70" />
              <span className="text-foreground/80">{selectedAddress.informacionAdicional}</span>
            </div>
          )}
          {selectedAddress.componentes?.comuna && (
            <div className="text-sm text-muted-foreground pl-6">
              {selectedAddress.componentes.comuna}
              {selectedAddress.componentes.region && `, ${selectedAddress.componentes.region}`}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ Mostrar estado de API en desarrollo
  const showAPIStatus = process.env.NODE_ENV === 'development';

  return (
    <div className={cn("w-full", className)}>
      {/* Status indicator para desarrollo */}
      {showAPIStatus && (
        <div className="absolute -top-6 right-0 text-xs opacity-50">
          API: {apiStatus === 'ready' ? placesAdapterRef.current?.getAPIVersion() : apiStatus}
        </div>
      )}
      
      <Popover 
        open={isOpen} 
        onOpenChange={(open) => {
          // No permitir que el popover se cierre al hacer clic fuera
          // si hay texto en el input
          if (!open && inputValue) {
            return;
          }
          setIsOpen(open);
        }}
      >
        <PopoverAnchor asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={(e) => {
                // Prevenir que el popover se cierre si hay texto
                if (inputValue) {
                  e.preventDefault();
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }
              }}
              disabled={disabled || externalLoading || !isLoaded || apiStatus !== 'ready'}
              className={cn("w-full pr-10", inputClassName)}
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              {isLoading || externalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" data-testid="search-loading-indicator" />
              ) : (
                <MapPin className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </PopoverAnchor>

        <PopoverContent
          className="w-[300px] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandList>
              {isLoading || externalLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin" data-testid="suggestions-loading" />
                </div>
              ) : suggestions.length === 0 ? (
                <CommandEmpty>No se encontraron direcciones</CommandEmpty>
              ) : (
                suggestions.map((prediction) => (
                  <CommandItem
                    key={prediction.place_id}
                    value={prediction.description}
                    onSelect={() => handlePlaceSelect(prediction.place_id)}
                    className="cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{prediction.description}</span>
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}