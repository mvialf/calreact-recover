/**
 * @fileoverview Componente de búsqueda y selección de direcciones con Google Places API
 *
 * Refactorizado en Fase 2 para usar hooks pattern:
 * - useAddressSearch: Lógica de búsqueda y estado
 * - SelectedAddressCard: UI de dirección seleccionada
 *
 * @version 2.0.0
 * @since Octubre 2025 - Fase 2 Refactoring
 */

"use client";

import * as React from "react";
import { Loader2, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { GoogleMapsUtils } from "@/lib/google-maps-config";
import { useAddressSearch } from "@/hooks/useAddressSearch";
import { SelectedAddressCard } from "@/components/ui/SelectedAddressCard";
import type { FormattedAddress } from "@/types/project";

/**
 * Props del componente AddressInput
 */
export interface AddressInputProps {
  /** La dirección seleccionada */
  value?: FormattedAddress | null;
  /** Callback que se llama cuando se selecciona una dirección */
  onSelect?: (address: FormattedAddress | null) => void;
  /** Callback que se llama cuando se selecciona una dirección (alias para onSelect) */
  onPlaceSelected?: (address: FormattedAddress | null) => void;
  /** Placeholder del input */
  placeholder?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Clase CSS adicional para el input */
  inputClassName?: string;
  /** Si el input está deshabilitado */
  disabled?: boolean;
  /**
   * Código de país para restringir búsquedas (ISO 3166-1 alpha-2)
   * Si no se proporciona, usa la configuración global del usuario (AppConfig.defaultCountry)
   * @example 'CL', 'ES', 'AR', 'MX'
   */
  countryCode?: string;
  /** Si el input está cargando desde una fuente externa */
  externalLoading?: boolean;
}

/**
 * Componente AddressInput - Búsqueda y selección de direcciones
 *
 * Permite buscar direcciones usando Google Places API y mostrar la dirección
 * seleccionada con acciones adicionales (ver mapa, copiar, compartir, etc.)
 *
 * @example
 * ```tsx
 * <AddressInput
 *   value={address}
 *   onSelect={handleAddressSelect}
 *   countryCode="cl"
 *   placeholder="Buscar dirección"
 * />
 * ```
 */
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
  // Estado UI local
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value?.textoCompleto || "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Configuración de país con prioridad inteligente
  const { config: appConfig } = useAppConfig();
  const effectiveCountryCode = countryCode || appConfig.defaultCountry;

  // Hook de búsqueda de direcciones
  const {
    suggestions,
    selectedAddress,
    isLoading,
    errorState,
    apiStatus,
    isScriptLoaded,
    searchAddresses,
    selectPlace,
    clearAddress,
    retrySearch,
    setAdditionalInfo,
    apiVersion,
  } = useAddressSearch({
    countryCode: effectiveCountryCode,
    onSelect,
    onPlaceSelected,
  });

  // Sincronizar input value cuando cambia la dirección seleccionada
  React.useEffect(() => {
    if (selectedAddress) {
      setInputValue(selectedAddress.textoCompleto || '');
    }
  }, [selectedAddress]);

  // Actualizar dirección cuando cambia value prop
  React.useEffect(() => {
    if (value) {
      setInputValue(value.textoCompleto || '');
    } else if (value === null) {
      // Limpiar si se pasa explícitamente null
      setInputValue('');
    }
  }, [value]);

  /**
   * Debounce para búsqueda (300ms)
   */
  const debouncedSearch = React.useMemo(
    () => GoogleMapsUtils.debounce(searchAddresses, 300),
    [searchAddresses]
  );

  /**
   * Manejar cambio en el input de búsqueda
   */
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (newValue.trim().length >= 3) {
        debouncedSearch(newValue);
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    },
    [debouncedSearch]
  );

  /**
   * Manejar focus en el input
   */
  const handleInputFocus = React.useCallback(() => {
    if (inputValue.trim().length >= 3 && suggestions.length > 0) {
      setIsOpen(true);
    }
  }, [inputValue, suggestions.length]);

  /**
   * Manejar selección de una sugerencia
   */
  const handleSuggestionSelect = React.useCallback(
    async (placeId: string, description: string) => {
      setInputValue(description);
      setIsOpen(false);
      await selectPlace(placeId);
    },
    [selectPlace]
  );

  /**
   * Manejar limpieza de dirección
   */
  const handleClear = React.useCallback(() => {
    setInputValue("");
    setIsOpen(false);
    clearAddress();
  }, [clearAddress]);

  // Si hay dirección seleccionada, mostrar el card
  if (selectedAddress) {
    return (
      <SelectedAddressCard
        address={selectedAddress}
        additionalInfo={selectedAddress.informacionAdicional}
        onClear={handleClear}
        onAdditionalInfoChange={setAdditionalInfo}
        className={className}
      />
    );
  }

  // Estado de carga de API
  const isDisabled = disabled || externalLoading || !isScriptLoaded || apiStatus !== 'ready';

  // Mostrar estado de API en desarrollo
  const showAPIStatus = process.env.NODE_ENV === 'development';

  return (
    <div className={cn("w-full", className)}>
      {/* Status indicator para desarrollo */}
      {showAPIStatus && (
        <div className="absolute -top-6 right-0 text-xs opacity-50">
          API: {apiStatus === 'ready' ? apiVersion : apiStatus}
        </div>
      )}

      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          // No permitir que el popover se cierre al hacer clic fuera si hay texto
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
              disabled={isDisabled}
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
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {/* Estado de carga */}
              {isLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin" data-testid="suggestions-loading" />
                </div>
              )}

              {/* Estado de error */}
              {errorState.type !== 'none' && (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                  <p className="text-sm font-medium">{errorState.message}</p>

                  {errorState.type === 'network' && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={retrySearch}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reintentar
                    </Button>
                  )}
                </div>
              )}

              {/* Sin resultados */}
              {!isLoading && errorState.type === 'none' && suggestions.length === 0 && inputValue.trim().length >= 3 && (
                <CommandEmpty>
                  <div className="flex flex-col items-center py-6 px-4 text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No se encontraron direcciones</p>
                  </div>
                </CommandEmpty>
              )}

              {/* Lista de sugerencias */}
              {!isLoading && errorState.type === 'none' && suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion.place_id}
                    onSelect={() => handleSuggestionSelect(suggestion.place_id, suggestion.description)}
                    className="cursor-pointer"
                    data-testid="address-suggestion"
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {suggestion.structured_formatting?.main_text || suggestion.description}
                      </span>
                      {suggestion.structured_formatting?.secondary_text && (
                        <span className="text-xs text-muted-foreground">
                          {suggestion.structured_formatting.secondary_text}
                        </span>
                      )}
                    </div>
                  </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
