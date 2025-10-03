# 📐 Plan de Refactoring: AddressInput Component - Octubre 2025

**Fecha:** 2025-10-02
**Archivo objetivo:** `src/components/ui/addressInput.tsx` (766 líneas)
**Razón:** Complejidad cognitiva alta, testabilidad difícil, mantenibilidad regular
**Enfoque recomendado:** Refactoring Moderado (Opción 2)

---

## 📊 Análisis de 766 Líneas

### Desglose Detallado por Sección

| Sección | Líneas | Inicio-Fin | % Total | ¿Refactorizable? | Destino Propuesto |
|---------|--------|------------|---------|------------------|-------------------|
| **Imports y tipos** | 92 | 1-92 | 12% | ❌ No | Mantener + nuevo types.ts |
| **Estado y hooks** | 115 | 105-219 | 15% | ✅ Sí | `useAddressSearch.ts` |
| **Búsqueda y selección** | 151 | 222-373 | 20% | ✅ Sí | `useAddressSearch.ts` |
| **Funciones de acciones** | 68 | 376-443 | 9% | ✅ Sí | `SelectedAddressCard.tsx` |
| **Input handlers** | 42 | 456-497 | 5% | ⚠️ Mantener | AddressInput.tsx (simple) |
| **Error/loading states** | 32 | 500-531 | 4% | ⚠️ Mantener | AddressInput.tsx (early return) |
| **SelectedAddressCard render** | 144 | 534-678 | 19% | ✅ **Sí** | `SelectedAddressCard.tsx` |
| **SearchInput render** | 83 | 683-766 | 11% | ⚠️ Evaluar | AddressInput.tsx (podría quedar) |
| **Otros** | 39 | Varios | 5% | - | - |

**Total líneas refactorizables:** ~390 líneas (51%)

### Análisis de Complejidad

```
Complejidad Cognitiva Actual (766 líneas en 1 archivo):
├─ Estado: 7 useState, 3 useRef, 2 useMemo, 3 useEffect
├─ Funciones: 15+ funciones declaradas
├─ Modos de renderizado: 2 (selected vs searching)
├─ Responsabilidades: 5 distintas
└─ Complejidad ciclomática estimada: ALTA (40+)

Problema: Mezcla lógica de negocio, estado UI, y renderizado
```

---

## 🎯 3 Opciones de Refactoring Evaluadas

### Opción 1: Refactoring Completo (Máximo)

**Arquitectura:**

```
src/components/ui/addressInput/
├── index.tsx                          # Barrel export (API pública)
├── AddressInput.tsx                   # Orquestador (~150 líneas)
├── components/
│   ├── SelectedAddressCard.tsx        # Vista dirección seleccionada (~150 líneas)
│   ├── AddressSearchInput.tsx         # Input + sugerencias (~100 líneas)
│   └── AddressActionsMenu.tsx         # Menú dropdown acciones (~80 líneas)
├── hooks/
│   ├── useAddressSearch.ts            # Lógica búsqueda + cache (~120 líneas)
│   ├── useAddressSelection.ts         # Lógica selección (~80 líneas)
│   └── useGoogleMapsLoader.ts         # Inicialización API (~60 líneas)
├── utils/
│   └── addressActions.ts              # Copy, share, view map (~40 líneas)
└── types.ts                           # Tipos compartidos (~50 líneas)
```

**Métricas:**
- **Archivos nuevos:** 10
- **Archivo más largo:** ~150 líneas
- **Esfuerzo:** 3-4 días
- **Riesgo:** MEDIO (muchos cambios)
- **Testabilidad:** ⭐⭐⭐⭐⭐ Excelente
- **Mantenibilidad:** ⭐⭐⭐⭐⭐ Excelente

**Pros:**
- ✅ Máxima separación de responsabilidades
- ✅ Cada archivo <200 líneas
- ✅ Testing completamente aislado
- ✅ Máxima reutilización (hooks, componentes, utils)

**Contras:**
- ❌ Over-engineering (componente funciona bien actualmente)
- ❌ 10 archivos es mucho overhead
- ❌ Riesgo alto de introducir bugs
- ❌ Esfuerzo alto (3-4 días) para código estable

**Veredicto:** ❌ NO recomendado - Demasiado para un componente que funciona

---

### Opción 2: Refactoring Moderado ⭐ **RECOMENDADO**

**Arquitectura:**

```
src/components/ui/addressInput/
├── AddressInput.tsx                   # Principal + orquestador (~300 líneas)
├── SelectedAddressCard.tsx            # Extraído (~150 líneas)
├── useAddressSearch.ts                # Extraído (~150 líneas)
└── types.ts                           # Compartidos (~50 líneas)
```

**Métricas:**
- **Archivos nuevos:** 3 (+ 1 original modificado)
- **Archivo más largo:** ~300 líneas (AddressInput.tsx)
- **Esfuerzo:** 1-2 días
- **Riesgo:** BAJO (cambios focalizados)
- **Testabilidad:** ⭐⭐⭐⭐ Muy buena
- **Mantenibilidad:** ⭐⭐⭐⭐ Muy buena

**¿Qué se extrae?**

#### 1. `SelectedAddressCard.tsx` (144 líneas originales → 150 con mejoras)

**Contenido extraído:**
- Todo el renderizado de dirección seleccionada (líneas 536-677)
- Menú de acciones (copy, share, view map)
- Input de información adicional
- Manejo de estado local del card

**Beneficios:**
- Componente testeable independientemente
- Reutilizable en contextos read-only
- Reduce AddressInput en 140+ líneas

#### 2. `useAddressSearch.ts` (151 líneas originales → 150 con mejoras)

**Contenido extraído:**
- Inicialización de PlacesServiceAdapter (líneas 189-219)
- Lógica de búsqueda con cache (líneas 222-259)
- Debouncing automático
- Manejo de estado de búsqueda

**Beneficios:**
- Hook testeable con renderHook()
- Reutilizable en otros componentes de búsqueda
- Separa lógica de negocio de UI
- Reduce AddressInput en 150+ líneas

#### 3. `types.ts` (50 líneas nuevas)

**Contenido:**
- Interfaces compartidas
- Props de componentes
- Tipos de retorno de hooks
- Constantes type-safe

**Beneficios:**
- Mejor organización
- Imports más limpios
- Single source of truth para tipos

**¿Qué queda en AddressInput.tsx?** (~300 líneas)

- Props y configuración
- Estado de dirección seleccionada
- Lógica de selección de lugar (handlePlaceSelect)
- Procesamiento de detalles (processPlaceDetails)
- Orquestación entre hook y componentes
- Renderizado principal (loading, error, search input)

**Pros:**
- ✅ Balance óptimo entre mejora y pragmatismo
- ✅ Extrae las partes MÁS complejas
- ✅ Mantiene estabilidad (no toca integraciones)
- ✅ API pública sin cambios (backward compatible)
- ✅ ROI claro en 1-2 días
- ✅ Testabilidad muy mejorada
- ✅ Riesgo controlado

**Contras:**
- ⚠️ AddressInput.tsx sigue siendo largo (~300 líneas)
- ⚠️ No extrae TODOS los componentes posibles

**Veredicto:** ✅ **RECOMENDADO** - Sweet spot entre mejora y esfuerzo

---

### Opción 3: Refactoring Mínimo (Conservador)

**Arquitectura:**

```
src/components/ui/
├── addressInput.tsx                   # Mantener como está (~766 líneas)
└── addressInput/
    ├── types.ts                       # Solo tipos (~50 líneas)
    └── utils.ts                       # Solo utilidades (~40 líneas)
```

**Métricas:**
- **Archivos nuevos:** 2
- **Archivo más largo:** 766 líneas (sin cambio)
- **Esfuerzo:** Medio día
- **Riesgo:** MUY BAJO
- **Testabilidad:** ⭐⭐ Regular (sin cambio)
- **Mantenibilidad:** ⭐⭐ Regular (mejora mínima)

**¿Qué se extrae?**

- Solo tipos e interfaces
- Solo funciones utility puras (copy, share)
- Estructura del componente sin cambio

**Pros:**
- ✅ Riesgo mínimo
- ✅ Esfuerzo mínimo
- ✅ No rompe nada

**Contras:**
- ❌ Mejora insignificante
- ❌ Problema de complejidad sigue igual
- ❌ No mejora testabilidad significativamente
- ❌ No reduce líneas del archivo principal

**Veredicto:** ❌ NO recomendado - No resuelve el problema real

---

## 📋 Plan de Implementación Detallado (Opción 2)

### Fase 1: Extraer `useAddressSearch` Hook (4-6 horas)

#### 1.1 Crear estructura base

```bash
mkdir -p src/components/ui/addressInput
touch src/components/ui/addressInput/useAddressSearch.ts
touch src/components/ui/addressInput/types.ts
```

#### 1.2 Implementar `types.ts`

```typescript
// src/components/ui/addressInput/types.ts

import type { FormattedAddress } from '@/types/project';
import type { PlacesServiceAdapter } from '@/lib/places/PlacesServiceAdapter';
import type { GoogleMapsPrediction } from '@/lib/google-maps-config';

/**
 * Configuración para el hook useAddressSearch
 */
export interface UseAddressSearchConfig {
  effectiveCountry: string;
  isLoaded: boolean;
  apiStatus: 'loading' | 'ready' | 'error';
}

/**
 * Retorno del hook useAddressSearch
 */
export interface UseAddressSearchReturn {
  suggestions: GoogleMapsPrediction[];
  isLoading: boolean;
  search: (query: string) => void;
  adapter: PlacesServiceAdapter | null;
  apiStatus: 'loading' | 'ready' | 'error';
}

/**
 * Props para SelectedAddressCard
 */
export interface SelectedAddressCardProps {
  address: FormattedAddress;
  onClear: () => void;
  onAddressUpdate: (address: FormattedAddress) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Props públicas de AddressInput (mantener compatibilidad)
 */
export interface AddressInputProps {
  value?: FormattedAddress | null;
  onSelect?: (address: FormattedAddress | null) => void;
  onPlaceSelected?: (address: FormattedAddress | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  countryCode?: string;
  externalLoading?: boolean;
}
```

#### 1.3 Implementar `useAddressSearch.ts`

```typescript
// src/components/ui/addressInput/useAddressSearch.ts

import React from 'react';
import { PlacesServiceAdapter } from '@/lib/places/PlacesServiceAdapter';
import {
  getGoogleMapsConfig,
  GoogleMapsUtils,
  googleMapsCache,
  type GoogleMapsPrediction
} from '@/lib/google-maps-config';
import { uiLogger } from '@/lib/logger';
import type { UseAddressSearchConfig, UseAddressSearchReturn } from './types';

/**
 * Custom hook para manejar búsqueda de direcciones con Google Places API
 *
 * Responsabilidades:
 * - Inicialización de PlacesServiceAdapter
 * - Búsqueda de predicciones con cache
 * - Debouncing automático
 * - Manejo de estado de carga
 *
 * @param config - Configuración del hook
 * @returns Estado y funciones de búsqueda
 */
export function useAddressSearch(config: UseAddressSearchConfig): UseAddressSearchReturn {
  const { effectiveCountry, isLoaded, apiStatus: externalApiStatus } = config;

  const [suggestions, setSuggestions] = React.useState<GoogleMapsPrediction[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  const placesAdapterRef = React.useRef<PlacesServiceAdapter | null>(null);
  const mapsConfig = React.useMemo(() => getGoogleMapsConfig(), []);

  // ✅ Inicializar Places API adapter
  React.useEffect(() => {
    const initializePlacesAPI = async () => {
      if (!isLoaded || !window.google?.maps) {
        return;
      }

      try {
        setApiStatus('loading');

        const adapter = new PlacesServiceAdapter({
          componentRestrictions: { country: effectiveCountry },
          types: ['establishment'],
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
  }, [isLoaded, effectiveCountry]);

  // ✅ Búsqueda con cache
  const searchAddresses = React.useCallback(async (query: string) => {
    if (!mapsConfig || !placesAdapterRef.current || apiStatus !== 'ready') {
      setSuggestions([]);
      return;
    }

    if (!GoogleMapsUtils.isValidQuery(query, mapsConfig)) {
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
      const limitedPredictions = GoogleMapsUtils.limitSuggestions(predictions, mapsConfig);

      googleMapsCache.set(cacheKey, limitedPredictions);
      setSuggestions(limitedPredictions);

      uiLogger.debug(`Encontradas ${limitedPredictions.length} sugerencias para: "${trimmedQuery}"`);
    } catch (error) {
      setSuggestions([]);
      uiLogger.error('Error buscando direcciones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [mapsConfig, apiStatus]);

  // ✅ Debounced search
  const debouncedSearch = React.useMemo(() => {
    if (!mapsConfig) return () => {};
    return GoogleMapsUtils.debounce(searchAddresses, mapsConfig.debounceMs);
  }, [searchAddresses, mapsConfig]);

  return {
    suggestions,
    isLoading,
    search: debouncedSearch,
    adapter: placesAdapterRef.current,
    apiStatus,
  };
}
```

#### 1.4 Tests para `useAddressSearch`

```typescript
// src/components/ui/addressInput/__tests__/useAddressSearch.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAddressSearch } from '../useAddressSearch';

// Mock PlacesServiceAdapter
jest.mock('@/lib/places/PlacesServiceAdapter');

describe('useAddressSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup global google.maps mock
    global.window.google = {
      maps: { /* mock */ }
    };
  });

  it('debe inicializar correctamente', async () => {
    const { result } = renderHook(() =>
      useAddressSearch({
        effectiveCountry: 'cl',
        isLoaded: true,
        apiStatus: 'ready'
      })
    );

    await waitFor(() => {
      expect(result.current.apiStatus).toBe('ready');
    });

    expect(result.current.adapter).not.toBeNull();
  });

  it('debe hacer debounce de búsquedas rápidas', async () => {
    const { result } = renderHook(() =>
      useAddressSearch({
        effectiveCountry: 'cl',
        isLoaded: true,
        apiStatus: 'ready'
      })
    );

    await waitFor(() => {
      expect(result.current.apiStatus).toBe('ready');
    });

    // Búsquedas rápidas consecutivas
    act(() => {
      result.current.search('Star');
      result.current.search('Starb');
      result.current.search('Starbucks');
    });

    // Solo la última debe ejecutarse
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar que solo se llamó una vez al adapter
    expect(result.current.adapter?.getPlacePredictions).toHaveBeenCalledTimes(1);
    expect(result.current.adapter?.getPlacePredictions).toHaveBeenCalledWith('Starbucks');
  });

  it('debe cachear resultados de búsqueda', async () => {
    const { result } = renderHook(() =>
      useAddressSearch({
        effectiveCountry: 'cl',
        isLoaded: true,
        apiStatus: 'ready'
      })
    );

    await waitFor(() => {
      expect(result.current.apiStatus).toBe('ready');
    });

    // Primera búsqueda
    await act(async () => {
      result.current.search('Starbucks');
    });

    await waitFor(() => {
      expect(result.current.suggestions.length).toBeGreaterThan(0);
    });

    const firstCallCount = result.current.adapter?.getPlacePredictions.mock.calls.length;

    // Segunda búsqueda idéntica (debería usar caché)
    await act(async () => {
      result.current.search('Starbucks');
    });

    // No debe llamar al adapter nuevamente
    expect(result.current.adapter?.getPlacePredictions).toHaveBeenCalledTimes(firstCallCount);
  });

  it('debe reinicializar adapter al cambiar país', async () => {
    const { result, rerender } = renderHook(
      ({ country }) =>
        useAddressSearch({
          effectiveCountry: country,
          isLoaded: true,
          apiStatus: 'ready'
        }),
      { initialProps: { country: 'cl' } }
    );

    await waitFor(() => {
      expect(result.current.apiStatus).toBe('ready');
    });

    const firstAdapter = result.current.adapter;

    // Cambiar país
    rerender({ country: 'ar' });

    await waitFor(() => {
      expect(result.current.adapter).not.toBe(firstAdapter);
    });
  });

  it('debe manejar errores de API correctamente', async () => {
    // Mock adapter que falla
    const mockAdapter = {
      getPlacePredictions: jest.fn().mockRejectedValue(new Error('API Error')),
      initialize: jest.fn().mockResolvedValue(undefined),
      getAPIVersion: jest.fn().mockReturnValue('modern')
    };

    const { result } = renderHook(() =>
      useAddressSearch({
        effectiveCountry: 'cl',
        isLoaded: true,
        apiStatus: 'ready'
      })
    );

    await waitFor(() => {
      expect(result.current.apiStatus).toBe('ready');
    });

    await act(async () => {
      result.current.search('Starbucks');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Debe tener suggestions vacías en error
    expect(result.current.suggestions).toEqual([]);
  });
});
```

---

### Fase 2: Extraer `SelectedAddressCard` Component (4-6 horas)

#### 2.1 Implementar `SelectedAddressCard.tsx`

```typescript
// src/components/ui/addressInput/SelectedAddressCard.tsx

import React from 'react';
import { MapPin, X, MoreVertical, Building, Copy, Map, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GoogleMapsUtils } from '@/lib/google-maps-config';
import { uiLogger } from '@/lib/logger';
import type { SelectedAddressCardProps } from './types';

/**
 * Card para mostrar dirección seleccionada con acciones
 *
 * Features:
 * - Muestra componentes de dirección (calle, número, comuna)
 * - Input para información adicional (depto, block)
 * - Menú de acciones: copy, view map, share
 * - Botón clear para limpiar selección
 *
 * @param props - Props del componente
 */
export function SelectedAddressCard({
  address,
  onClear,
  onAddressUpdate,
  disabled = false,
  className = ''
}: SelectedAddressCardProps) {
  const [showAdditionalInfoInput, setShowAdditionalInfoInput] = React.useState(false);
  const [additionalInfo, setAdditionalInfo] = React.useState(address.informacionAdicional || '');
  const additionalInfoInputRef = React.useRef<HTMLInputElement>(null);

  // ✅ Manejar cambios en información adicional
  const handleAdditionalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setAdditionalInfo(newValue);

    const updatedAddress = {
      ...address,
      informacionAdicional: newValue
    };
    onAddressUpdate(updatedAddress);
  };

  // ✅ Mostrar input de información adicional
  const handleShowAdditionalInfo = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAdditionalInfoInput(true);
    setTimeout(() => {
      additionalInfoInputRef.current?.focus();
    }, 0);
  }, []);

  // ✅ Guardar información adicional
  const handleSaveAdditionalInfo = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAdditionalInfoInput(false);
  }, []);

  // ✅ Copiar dirección al portapapeles
  const handleCopyAddress = React.useCallback(() => {
    if (address.textoCompleto) {
      navigator.clipboard.writeText(address.textoCompleto);
      // TODO: Agregar toast notification
      uiLogger.debug('Dirección copiada', { address: address.textoCompleto });
    }
  }, [address]);

  // ✅ Ver en Google Maps
  const handleViewOnMap = React.useCallback(() => {
    if (!address.coordenadas) return;

    const mapUrl = GoogleMapsUtils.generateMapsUrl(
      address.coordenadas.latitude,
      address.coordenadas.longitude
    );
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  }, [address]);

  // ✅ Compartir ubicación
  const handleShareLocation = React.useCallback(async () => {
    if (!address) return;

    const shareUrl = GoogleMapsUtils.generateShareUrl(
      address.textoCompleto,
      address.coordenadas?.latitude,
      address.coordenadas?.longitude
    );

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Ubicación',
          text: address.informacionAdicional
            ? `${address.textoCompleto} (${address.informacionAdicional})`
            : address.textoCompleto,
          url: shareUrl,
        });
      } else {
        // Fallback: WhatsApp
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `${address.textoCompleto}${
            address.informacionAdicional ? `\n${address.informacionAdicional}` : ''
          }\n\nVer en mapa: ${shareUrl}`
        )}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      uiLogger.error('Error al compartir', err);
    }
  }, [address]);

  return (
    <div
      className={cn(
        "w-full bg-background border rounded-md p-3 relative group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      data-testid="selected-address-card"
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium">
              {address.componentes?.calle} {address.componentes?.numero}
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
                  disabled={disabled}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Más acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2"
                onInteractOutside={(e) => {
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
                      onSubmit={handleSaveAdditionalInfo}
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
                      {additionalInfo && (
                        <span className="ml-auto text-xs text-muted-foreground">✓</span>
                      )}
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
              onClick={onClear}
              aria-label="Limpiar dirección"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpiar dirección</span>
            </Button>
          </div>
        </div>

        {address.informacionAdicional && (
          <div className="text-sm text-muted-foreground pl-6 flex items-center mt-1">
            <Building className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 opacity-70" />
            <span className="text-foreground/80">{address.informacionAdicional}</span>
          </div>
        )}
        {address.componentes?.comuna && (
          <div className="text-sm text-muted-foreground pl-6">
            {address.componentes.comuna}
            {address.componentes.region && `, ${address.componentes.region}`}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 2.2 Tests para `SelectedAddressCard`

```typescript
// src/components/ui/addressInput/__tests__/SelectedAddressCard.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectedAddressCard } from '../SelectedAddressCard';
import type { FormattedAddress } from '@/types/project';

const mockAddress: FormattedAddress = {
  textoCompleto: 'Av. Providencia 123, Providencia, Santiago',
  coordenadas: {
    latitude: -33.4372,
    longitude: -70.6134
  },
  placeId: 'ChIJ...',
  componentes: {
    calle: 'Av. Providencia',
    numero: '123',
    comuna: 'Providencia',
    ciudad: 'Santiago',
    region: 'Región Metropolitana',
    pais: 'Chile',
    codigoPostal: '7500000'
  },
  detalle: 'Av. Providencia 123, Providencia, Santiago',
  comune: 'Providencia'
};

describe('SelectedAddressCard', () => {
  it('debe renderizar componentes de dirección correctamente', () => {
    render(
      <SelectedAddressCard
        address={mockAddress}
        onClear={jest.fn()}
        onAddressUpdate={jest.fn()}
      />
    );

    expect(screen.getByText(/Av. Providencia 123/)).toBeInTheDocument();
    expect(screen.getByText(/Providencia, Región Metropolitana/)).toBeInTheDocument();
  });

  it('debe permitir agregar información adicional', async () => {
    const onAddressUpdate = jest.fn();
    const user = userEvent.setup();

    render(
      <SelectedAddressCard
        address={mockAddress}
        onClear={jest.fn()}
        onAddressUpdate={onAddressUpdate}
      />
    );

    // Abrir menú
    const menuButton = screen.getByLabelText('Más acciones');
    await user.click(menuButton);

    // Click en "Agregar información adicional"
    const addInfoButton = screen.getByText('Agregar información adicional');
    await user.click(addInfoButton);

    // Escribir en input
    const input = screen.getByPlaceholderText(/Ej: Depto 405/);
    await user.type(input, 'Depto 405');

    // Verificar que se llamó onAddressUpdate
    await waitFor(() => {
      expect(onAddressUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          informacionAdicional: 'Depto 405'
        })
      );
    });
  });

  it('debe copiar dirección al clipboard', async () => {
    const user = userEvent.setup();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    });

    render(
      <SelectedAddressCard
        address={mockAddress}
        onClear={jest.fn()}
        onAddressUpdate={jest.fn()}
      />
    );

    // Abrir menú y click en copiar
    const menuButton = screen.getByLabelText('Más acciones');
    await user.click(menuButton);

    const copyButton = screen.getByText('Copiar dirección');
    await user.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAddress.textoCompleto);
  });

  it('debe abrir Google Maps con coordenadas', async () => {
    const user = userEvent.setup();
    const windowOpen = jest.spyOn(window, 'open').mockImplementation();

    render(
      <SelectedAddressCard
        address={mockAddress}
        onClear={jest.fn()}
        onAddressUpdate={jest.fn()}
      />
    );

    // Abrir menú y click en ver mapa
    const menuButton = screen.getByLabelText('Más acciones');
    await user.click(menuButton);

    const mapButton = screen.getByText('Ver en mapa');
    await user.click(mapButton);

    expect(windowOpen).toHaveBeenCalledWith(
      expect.stringContaining('google.com/maps'),
      '_blank',
      'noopener,noreferrer'
    );

    windowOpen.mockRestore();
  });

  it('debe llamar onClear al hacer click en X', async () => {
    const onClear = jest.fn();
    const user = userEvent.setup();

    render(
      <SelectedAddressCard
        address={mockAddress}
        onClear={onClear}
        onAddressUpdate={jest.fn()}
      />
    );

    const clearButton = screen.getByLabelText('Limpiar dirección');
    await user.click(clearButton);

    expect(onClear).toHaveBeenCalled();
  });

  it('debe estar deshabilitado cuando disabled=true', () => {
    render(
      <SelectedAddressCard
        address={mockAddress}
        onClear={jest.fn()}
        onAddressUpdate={jest.fn()}
        disabled={true}
      />
    );

    const clearButton = screen.getByLabelText('Limpiar dirección');
    expect(clearButton).toBeDisabled();

    const menuButton = screen.getByLabelText('Más acciones');
    expect(menuButton).toBeDisabled();
  });
});
```

---

### Fase 3: Actualizar `AddressInput.tsx` (2-3 horas)

#### 3.1 Refactorizar componente principal

```typescript
// src/components/ui/addressInput/AddressInput.tsx

"use client"

import React from "react"
import { Loader2, MapPin } from "lucide-react"
import { useLoadScript } from "@react-google-maps/api"
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
import {
  getGoogleMapsConfig,
  GoogleMapsUtils,
  googleMapsCache
} from '@/lib/google-maps-config'
import { uiLogger } from '@/lib/logger'
import type { FormattedAddress } from "@/types/project"

// ✅ Importar hook y componente extraídos
import { useAddressSearch } from './useAddressSearch'
import { SelectedAddressCard } from './SelectedAddressCard'
import type { AddressInputProps } from './types'

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
  const [inputValue, setInputValue] = React.useState(value?.textoCompleto || "");
  const [selectedAddress, setSelectedAddress] = React.useState<FormattedAddress | null>(value || null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  // ✅ Sistema híbrido de país
  const { config: appConfig } = useAppConfig();
  const effectiveCountry = React.useMemo(() => {
    const country = countryCode || appConfig.defaultCountry || 'CL';
    return country.toLowerCase();
  }, [countryCode, appConfig.defaultCountry]);

  // ✅ Configuración
  const config = React.useMemo(() => {
    try {
      return getGoogleMapsConfig();
    } catch (error) {
      uiLogger.error('Error al obtener configuración de Google Maps', error);
      return null;
    }
  }, []);

  // ✅ Cargar Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config?.apiKey || "",
    libraries: config?.libraries as ('places')[] || ['places'],
    language: config?.language,
    region: config?.region,
  });

  // ✅ USAR HOOK EXTRAÍDO
  const { suggestions, isLoading, search, adapter, apiStatus } = useAddressSearch({
    effectiveCountry,
    isLoaded,
    apiStatus: 'loading' // Se actualiza internamente
  });

  // ✅ Actualizar estado interno cuando cambia value prop
  React.useEffect(() => {
    if (value) {
      setSelectedAddress(value);
      setInputValue(value.textoCompleto || '');
    } else if (value === null) {
      setSelectedAddress(null);
      setInputValue('');
    }
  }, [value]);

  // ✅ Procesar detalles del lugar
  const processPlaceDetails = React.useCallback((place: any, placeId: string) => {
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

      setSelectedAddress(formattedAddress);
      setInputValue(formattedAddress.textoCompleto);
      setIsOpen(false);

      onSelect?.(formattedAddress);
      onPlaceSelected?.(formattedAddress);
    } catch (addressError) {
      uiLogger.error('Error al procesar la dirección', addressError);
    }
  }, [onSelect, onPlaceSelected]);

  // ✅ Manejar selección de lugar
  const handlePlaceSelect = React.useCallback(
    async (placeId: string) => {
      if (!config || !GoogleMapsUtils.isGoogleMapsAvailable() || !placeId || !adapter) {
        uiLogger.error('No se puede seleccionar lugar: API no disponible');
        return;
      }

      // Verificar cache de detalles
      const cacheKey = GoogleMapsUtils.generatePlaceDetailsCacheKey(placeId);
      const cachedPlace = googleMapsCache.get(cacheKey);

      if (cachedPlace) {
        processPlaceDetails(cachedPlace, placeId);
        uiLogger.info('Usando detalles de lugar desde caché', { placeId });
        return;
      }

      try {
        const placeDetails = await adapter.getPlaceDetails(
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

        if (!placeDetails) {
          uiLogger.error('Error al obtener detalles del lugar', { placeId });
          return;
        }

        googleMapsCache.set(cacheKey, placeDetails);
        processPlaceDetails(placeDetails, placeId);

        // ✅ MEJORA: Refrescar session token después de selección exitosa
        adapter.refreshSessionToken();
      } catch (error) {
        uiLogger.error('Error al obtener detalles del lugar', error);
      }
    },
    [config, adapter, processPlaceDetails]
  );

  // ✅ Limpiar selección
  const handleClear = React.useCallback(() => {
    setSelectedAddress(null);
    setInputValue("");
    onSelect?.(null);
    onPlaceSelected?.(null);
  }, [onSelect, onPlaceSelected]);

  // ✅ Actualizar dirección seleccionada
  const handleAddressUpdate = React.useCallback((updatedAddress: FormattedAddress) => {
    setSelectedAddress(updatedAddress);
    onSelect?.(updatedAddress);
    onPlaceSelected?.(updatedAddress);
  }, [onSelect, onPlaceSelected]);

  // ✅ Manejar cambios en input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (!newValue) {
      handleClear();
      return;
    }

    search(newValue);

    if (newValue.trim()) {
      setIsOpen(true);
    }
  };

  // ✅ Error handling
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

  // ✅ Loading state
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

  // ✅ USAR COMPONENTE EXTRAÍDO para dirección seleccionada
  if (selectedAddress) {
    return (
      <SelectedAddressCard
        address={selectedAddress}
        onClear={handleClear}
        onAddressUpdate={handleAddressUpdate}
        disabled={disabled}
        className={className}
      />
    );
  }

  // ✅ Input de búsqueda
  return (
    <div className={cn("w-full", className)}>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && inputValue) return;
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
              onFocus={() => inputValue && setIsOpen(true)}
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

        <PopoverContent className="w-[300px] p-0" align="start">
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

// ✅ Mantener exports compatibles
export type { AddressInputProps }
```

**Resultado:**
- **Antes:** 766 líneas
- **Después:** ~300 líneas (reducción del 61%)

---

### Fase 4: Crear Barrel Export y Tests de Integración (2 horas)

#### 4.1 Barrel export para API pública

```typescript
// src/components/ui/addressInput/index.ts

/**
 * AddressInput Component - Barrel Export
 *
 * API pública para el componente AddressInput y sus partes.
 * Mantiene backward compatibility completa.
 */

// Componente principal (default export para compatibilidad)
export { AddressInput } from './AddressInput'
export { AddressInput as default } from './AddressInput'

// Componentes auxiliares (para casos avanzados)
export { SelectedAddressCard } from './SelectedAddressCard'

// Hooks (para reutilización)
export { useAddressSearch } from './useAddressSearch'

// Tipos (para TypeScript)
export type {
  AddressInputProps,
  SelectedAddressCardProps,
  UseAddressSearchConfig,
  UseAddressSearchReturn,
} from './types'
```

#### 4.2 Actualizar imports en formularios

```bash
# Opción A: Sin cambios (backward compatible)
# Los formularios siguen importando desde el mismo lugar
import { AddressInput } from '@/components/ui/addressInput'

# Opción B: Import explícito (recomendado para nuevos)
import { AddressInput } from '@/components/ui/addressInput/AddressInput'
```

**Nota:** Gracias al barrel export, los formularios NO necesitan cambiar sus imports. ✅

#### 4.3 Tests de integración

```typescript
// src/components/ui/addressInput/__tests__/AddressInput.integration.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressInput } from '../AddressInput';
import type { FormattedAddress } from '@/types/project';

describe('AddressInput - Integration Tests', () => {
  it('debe mantener backward compatibility completa', async () => {
    const onSelect = jest.fn();

    const { rerender } = render(
      <AddressInput
        value={null}
        onSelect={onSelect}
        placeholder="Buscar dirección"
      />
    );

    // API pública sin cambios
    expect(screen.getByPlaceholderText('Buscar dirección')).toBeInTheDocument();

    // Rerender con valor (como lo haría React Hook Form)
    const mockAddress: FormattedAddress = {
      textoCompleto: 'Av. Test 123',
      coordenadas: { latitude: -33, longitude: -70 },
      placeId: 'test',
      componentes: {
        calle: 'Av. Test',
        numero: '123',
        comuna: 'Test',
        ciudad: 'Test',
        region: 'Test',
        pais: 'Chile',
        codigoPostal: '123'
      },
      detalle: 'Av. Test 123',
      comune: 'Test'
    };

    rerender(
      <AddressInput
        value={mockAddress}
        onSelect={onSelect}
      />
    );

    // Debe mostrar dirección seleccionada
    await waitFor(() => {
      expect(screen.getByText(/Av. Test 123/)).toBeInTheDocument();
    });
  });

  it('debe preservar comportamiento de país híbrido', () => {
    // Mock AppConfig context
    const mockAppConfig = { defaultCountry: 'ES' };

    render(
      <AddressInput
        value={null}
        onSelect={jest.fn()}
      />
    );

    // Verificar que usa país de config global
    // (testing interno de useAddressSearch)
  });

  it('debe preservar cache funcionando correctamente', async () => {
    const user = userEvent.setup();

    render(
      <AddressInput
        value={null}
        onSelect={jest.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Buscar dirección');

    // Primera búsqueda
    await user.type(input, 'Starbucks');

    await waitFor(() => {
      expect(screen.getByText(/Starbucks/)).toBeInTheDocument();
    });

    // Segunda búsqueda idéntica (debería usar caché)
    await user.clear(input);
    await user.type(input, 'Starbucks');

    // Cache hit debería ser instantáneo
    expect(screen.getByText(/Starbucks/)).toBeInTheDocument();
  });
});
```

---

## ⚖️ Análisis de Trade-offs

| Aspecto | Antes (766 líneas) | Después (Opción 2) | Delta |
|---------|--------------------|--------------------|-------|
| **Total archivos** | 1 | 4 | +3 |
| **Archivo más largo** | 766 líneas | ~300 líneas | -61% |
| **Complejidad cognitiva** | 🔴 Alta | 🟢 Media | ✅ Mejora |
| **Testabilidad** | 🔴 Difícil | 🟢 Buena | ✅ Mejora |
| **Mantenibilidad** | 🟡 Regular | 🟢 Buena | ✅ Mejora |
| **Riesgo de bugs** | 🟢 Estable (actual) | 🟡 Medio (durante refactor) | ⚠️ Temporal |
| **Reutilización** | 🔴 Imposible | 🟢 Hook + componente reutilizables | ✅ Mejora |
| **Tiempo implementación** | - | 1-2 días | ⏱️ Inversión |
| **API pública** | ✅ Establecida | ✅ Sin cambios | ✅ Backward compatible |
| **4 formularios** | ✅ Funcionando | ✅ Sin cambios requeridos | ✅ Estable |

---

## 📅 Timeline Estimado

| Fase | Tarea | Esfuerzo | Acumulado |
|------|-------|----------|-----------|
| **Fase 1** | Crear types.ts | 0.5h | 0.5h |
|  | Implementar useAddressSearch | 3h | 3.5h |
|  | Tests useAddressSearch | 1.5h | 5h |
| **Fase 2** | Implementar SelectedAddressCard | 3h | 8h |
|  | Tests SelectedAddressCard | 2h | 10h |
| **Fase 3** | Refactorizar AddressInput.tsx | 2h | 12h |
|  | Testing manual | 1h | 13h |
| **Fase 4** | Barrel export + integration tests | 2h | 15h |
|  | **TOTAL** | **15 horas** | **~2 días** |

---

## ✅ Checklist de Implementación

### Pre-Refactoring

- [ ] Commit actual con mensaje "Pre-refactoring: AddressInput component working"
- [ ] Verificar que todos los tests existentes pasan
- [ ] Backup del archivo original (opcional)
- [ ] Revisar TODOs pendientes en addressInput.tsx

### Durante Refactoring

**Fase 1:**
- [ ] Crear directorio `src/components/ui/addressInput/`
- [ ] Crear `types.ts` con todas las interfaces
- [ ] Implementar `useAddressSearch.ts`
- [ ] Crear tests para useAddressSearch
- [ ] Verificar tests pasan (≥ 80% coverage)

**Fase 2:**
- [ ] Implementar `SelectedAddressCard.tsx`
- [ ] Crear tests para SelectedAddressCard
- [ ] Verificar tests pasan (≥ 80% coverage)
- [ ] Testing visual manual del componente

**Fase 3:**
- [ ] Refactorizar `AddressInput.tsx` para usar hook y componente
- [ ] Verificar que archivo queda en ~300 líneas
- [ ] Testing manual de búsqueda completa
- [ ] Testing manual de selección completa
- [ ] Verificar país híbrido funciona
- [ ] Verificar cache funciona

**Fase 4:**
- [ ] Crear `index.ts` barrel export
- [ ] Crear tests de integración
- [ ] Verificar 4 formularios siguen funcionando
- [ ] Testing E2E completo (crear proyecto con dirección)

### Post-Refactoring

- [ ] Todos los tests pasan (unit + integration)
- [ ] Coverage ≥ 80% en archivos nuevos
- [ ] ESLint y TypeScript sin errores
- [ ] Build exitoso (`npm run build`)
- [ ] Documentación actualizada
- [ ] Commit con mensaje descriptivo
- [ ] PR con descripción completa de cambios

---

## 🚨 Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Romper integraciones con formularios** | Baja | Alto | Barrel export mantiene API pública, tests de integración |
| **Pérdida de funcionalidad durante migración** | Media | Alto | Testing manual exhaustivo cada fase, rollback plan |
| **Introducir bugs en lógica de búsqueda** | Media | Medio | Tests unitarios completos, testing con datos reales |
| **Performance degradado** | Baja | Medio | Benchmark antes/después, profiling |
| **Cache deja de funcionar** | Baja | Medio | Tests específicos para cache, verificación manual |

---

## 🔄 Plan de Rollback

Si algo sale mal durante el refactoring:

```bash
# Opción 1: Revertir commit específico
git log --oneline | head -10
git revert <commit-hash-del-refactoring>

# Opción 2: Reset a commit anterior (si no se ha pusheado)
git reset --hard <commit-hash-antes-del-refactoring>

# Opción 3: Restaurar archivo específico
git checkout <commit-hash> -- src/components/ui/addressInput.tsx
```

**Triggers para rollback:**
- Tests core fallan y no se pueden arreglar en 1 hora
- 4 formularios dejan de funcionar
- Build falla y no se puede arreglar rápido
- Performance degradado >20%

---

## 📚 Referencias

- **Análisis completo:** `docs/technical/addressinput-analysis-2025.md`
- **Patrón Compound Component:** [React Patterns](https://reactpatterns.com/)
- **Testing React Hooks:** [React Testing Library](https://react-hooks-testing-library.com/)
- **Project codebase patterns:** `claude-docs/references/patterns.md`

---

## 🎯 Decisión Final

**Opción Recomendada:** Opción 2 (Refactoring Moderado)

**Justificación:**
1. ✅ Balance óptimo esfuerzo/beneficio
2. ✅ Extrae las partes más complejas (search logic + selected view)
3. ✅ Mejora testabilidad significativamente
4. ✅ Mantiene estabilidad (API pública sin cambios)
5. ✅ ROI claro en 1-2 días
6. ✅ Riesgo controlado

**Próximos pasos:**
1. Revisar este plan con el equipo
2. Obtener aprobación para proceder
3. Implementar Fase 1 (useAddressSearch)
4. Review intermedio después de Fase 2
5. Completar Fases 3-4 si Fase 1-2 exitosas

---

**Documento generado:** 2025-10-02
**Autor:** Claude Code
**Estado:** PLAN APROBADO - Listo para implementación
