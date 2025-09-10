# 🚀 Plan de Migración a Nuevas APIs

## 🎯 Objetivo

Migrar de APIs deprecated a las nuevas APIs recomendadas por Google Maps Platform manteniendo toda la funcionalidad existente.

## 📋 Cambios Requeridos

### 🔄 APIs a Migrar

| API Actual (Deprecated) | Nueva API Recomendada | Status |
|-------------------------|----------------------|--------|
| `google.maps.places.AutocompleteService` | `google.maps.places.AutocompleteSuggestion` | 🔴 Obligatorio |
| `google.maps.places.PlacesService` | `google.maps.places.Place` | 🔴 Obligatorio |

## 🏗️ Cambios en AddressInput Component

### **Archivo:** `src/components/ui/addressInput.tsx`

### 1. **Actualizar Imports y Referencias**

```typescript
// ❌ CÓDIGO ACTUAL - Eliminar
const autocompleteService = React.useRef<google.maps.places.AutocompleteService | null>(null);
const placesService = React.useRef<google.maps.places.PlacesService | null>(null);

// ✅ NUEVO CÓDIGO - Implementar
const [placesLibrary, setPlacesLibrary] = React.useState<google.maps.PlacesLibrary | null>(null);
const [isPlacesLoaded, setIsPlacesLoaded] = React.useState(false);
```

### 2. **Nueva Inicialización de Servicios**

```typescript
// ❌ CÓDIGO ACTUAL - Eliminar
React.useEffect(() => {
  if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
    try {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
    } catch (error) {
      console.warn('Error al inicializar servicios de Google Maps:', error);
    }
  }
}, [isLoaded]);

// ✅ NUEVO CÓDIGO - Implementar
React.useEffect(() => {
  if (isLoaded && window.google) {
    const loadPlacesLibrary = async () => {
      try {
        const library = await window.google.maps.importLibrary('places') as google.maps.PlacesLibrary;
        setPlacesLibrary(library);
        setIsPlacesLoaded(true);
      } catch (error) {
        console.error('Error al cargar biblioteca de Places:', error);
      }
    };
    loadPlacesLibrary();
  }
}, [isLoaded]);
```

### 3. **Nuevo Método de Búsqueda de Direcciones**

```typescript
// ❌ CÓDIGO ACTUAL - Eliminar
const searchAddresses = React.useCallback(async (query: string) => {
  if (!autocompleteService.current || !query.trim()) {
    setSuggestions([]);
    return;
  }

  try {
    const request = {
      input: query.trim(),
      componentRestrictions: { country: 'cl' },
      types: ['address'],
    };

    const results = await new Promise<GooglePlacePrediction[]>((resolve) => {
      autocompleteService.current?.getPlacePredictions(request, (predictions, status) => {
        if (status === window.google?.maps?.places?.PlacesServiceStatus?.OK && predictions) {
          resolve(predictions);
        } else {
          console.warn('Error en búsqueda de direcciones:', status);
          resolve([]);
        }
      });
    });

    setSuggestions(results);
  } catch (error) {
    console.error('Error al buscar direcciones:', error);
    setSuggestions([]);
  }
}, []);

// ✅ NUEVO CÓDIGO - Implementar
const searchAddresses = React.useCallback(async (query: string) => {
  if (!placesLibrary || !isPlacesLoaded || !query.trim()) {
    setSuggestions([]);
    return;
  }

  try {
    const request = {
      input: query.trim(),
      locationRestriction: {
        country: ['cl'] // Restricción a Chile
      },
      includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
      language: 'es',
      region: 'cl'
    };

    const { suggestions } = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
    
    // Convertir nuevas sugerencias a formato compatible
    const compatibleSuggestions = suggestions.map(suggestion => ({
      description: suggestion.placePrediction.text.text,
      place_id: suggestion.placePrediction.placeId,
      structured_formatting: {
        main_text: suggestion.placePrediction.structuredFormat.mainText.text,
        secondary_text: suggestion.placePrediction.structuredFormat.secondaryText?.text || ''
      }
    }));

    setSuggestions(compatibleSuggestions);
  } catch (error) {
    console.error('Error al buscar direcciones con nueva API:', error);
    setSuggestions([]);
  }
}, [placesLibrary, isPlacesLoaded]);
```

### 4. **Nuevo Método de Selección de Lugar**

```typescript
// ❌ CÓDIGO ACTUAL - Eliminar
const handlePlaceSelect = React.useCallback(async (placeId: string) => {
  if (!window.google || !window.google.maps || !window.google.maps.places || !placeId) {
    console.error("Google Maps API no está disponible o placeId inválido");
    return;
  }

  setIsLoading(true);

  try {
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    placesService.getDetails(
      { placeId, fields: ["address_components", "formatted_address", "geometry", "place_id"] },
      (place, status) => {
        setIsLoading(false);
        // ... resto del código
      }
    );
  } catch (error) {
    console.error('Error al obtener detalles del lugar:', error);
  }
}, []);

// ✅ NUEVO CÓDIGO - Implementar
const handlePlaceSelect = React.useCallback(async (placeId: string) => {
  if (!placesLibrary || !isPlacesLoaded || !placeId) {
    console.error("Places library no disponible o placeId inválido");
    return;
  }

  setIsLoading(true);

  try {
    // Crear instancia de Place con nuevo API
    const place = new placesLibrary.Place({
      id: placeId,
      requestedLanguage: 'es'
    });

    // Obtener campos necesarios
    const fields = [
      'displayName',
      'formattedAddress', 
      'location',
      'addressComponents',
      'id'
    ];

    await place.fetchFields({ fields });

    // Extraer datos en formato compatible
    const addressComponents = extractAddressComponents({
      address_components: place.addressComponents,
      formatted_address: place.formattedAddress,
      geometry: {
        location: place.location
      },
      place_id: place.id
    });

    // Crear FormattedAddress object
    const formattedAddress: FormattedAddress = {
      textoCompleto: place.formattedAddress || "",
      coordenadas: {
        latitude: place.location?.lat() || 0,
        longitude: place.location?.lng() || 0,
      },
      placeId: place.id || placeId,
      componentes: {
        calle: addressComponents?.route || '',
        numero: addressComponents?.streetNumber || '',
        comuna: addressComponents?.locality || '',
        ciudad: addressComponents?.locality || '',
        region: addressComponents?.administrativeArea || '',
        pais: addressComponents?.country || 'Chile',
        codigoPostal: addressComponents?.postalCode || '',
      },
      detalle: place.formattedAddress || '',
      comune: addressComponents?.locality || '',
    };

    // Actualizar estado y callbacks
    setSelectedAddress(formattedAddress);
    setInputValue(formattedAddress.textoCompleto);
    setSuggestions([]);
    setIsOpen(false);

    onSelect?.(formattedAddress);
    onPlaceSelected?.(formattedAddress);

  } catch (error) {
    console.error('Error al obtener detalles del lugar con nueva API:', error);
  } finally {
    setIsLoading(false);
  }
}, [placesLibrary, isPlacesLoaded, onSelect, onPlaceSelected]);
```

## 🔧 Actualización de Tipos TypeScript

### **Archivo:** `src/components/ui/addressInput.tsx`

```typescript
// ✅ AGREGAR - Nuevos tipos para compatibilidad
type NewPlacePrediction = {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

// ✅ ACTUALIZAR - Declaración de tipos globales
declare global {
  interface Window {
    google: typeof google & {
      maps: typeof google.maps & {
        importLibrary: (library: string) => Promise<google.maps.PlacesLibrary>;
        PlacesLibrary: google.maps.PlacesLibrary;
      };
    };
  }
}
```

## 🔄 Funciones de Utilidad a Actualizar

### **Archivo:** `src/utils/address-utils.ts`

```typescript
// ✅ ACTUALIZAR - Función compatible con ambas APIs
export const extractAddressComponents = (place: any): AddressComponentsResult => {
  // Esta función ya es compatible, no requiere cambios
  // Funciona tanto con API antigua como nueva
  return {
    route: getComponent(place, 'route'),
    streetNumber: getComponent(place, 'street_number'),
    locality: getComponent(place, 'locality'),
    administrativeArea: getComponent(place, 'administrative_area_level_1'),
    country: getComponent(place, 'country'),
    postalCode: getComponent(place, 'postal_code'),
  };
};
```

## 📊 Implementar Logger Específico

### **Archivo:** `src/lib/logger/address-logger.ts` (Nuevo)

```typescript
interface AddressLogData {
  query?: string;
  results?: number;
  placeId?: string;
  error?: any;
  timestamp?: Date;
}

export const addressLogger = {
  search: (query: string, resultCount: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [ADDRESS-SEARCH] Query: "${query}" - Results: ${resultCount}`);
    }
  },
  
  select: (placeId: string, address: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📍 [ADDRESS-SELECT] PlaceID: ${placeId} - Address: "${address}"`);
    }
  },
  
  extract: (components: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 [ADDRESS-EXTRACT] Components:`, {
        comuna: components.locality,
        region: components.administrativeArea
      });
    }
  },
  
  error: (operation: string, error: any) => {
    console.error(`❌ [ADDRESS-ERROR] ${operation}:`, error);
  }
};
```

## ⏱️ Cronograma de Implementación

### **Fase 1: Preparación** (30 min)
- [ ] Backup del código actual
- [ ] Crear rama `feature/migrate-google-places-api`
- [ ] Instalar dependencias si es necesario

### **Fase 2: Migración** (2-3 horas)
- [ ] Actualizar imports y referencias (30 min)
- [ ] Implementar nueva inicialización (45 min)
- [ ] Migrar método de búsqueda (60 min)
- [ ] Migrar método de selección (45 min)
- [ ] Actualizar tipos TypeScript (15 min)

### **Fase 3: Testing** (1 hora)
- [ ] Verificar compilación sin errores
- [ ] Probar autocomplete manualmente
- [ ] Probar selección de direcciones
- [ ] Verificar persistencia en Firebase

### **Fase 4: Validación** (30 min)
- [ ] No warnings en consola
- [ ] Tests E2E pasando
- [ ] Logger funcionando

## 🔍 Puntos de Verificación

### ✅ Pre-Migración
- [ ] Tests actuales pasando
- [ ] Funcionalidad actual documentada
- [ ] Backup realizado

### ✅ Durante Migración
- [ ] Compilación sin errores TypeScript
- [ ] No warnings de APIs deprecated
- [ ] Autocomplete funcional en desarrollo

### ✅ Post-Migración
- [ ] Todas las funcionalidades operativas
- [ ] Performance similar o mejor
- [ ] Logs implementados

## 🚨 Rollback Plan

Si algo falla durante la migración:

```bash
# 1. Revertir cambios
git checkout HEAD~1 -- src/components/ui/addressInput.tsx

# 2. Verificar funcionalidad
npm run dev
# Probar crear evento de proyecto

# 3. Si necesario, revertir commit completo
git revert HEAD
```

## 🎯 Resultado Esperado

Después de la migración:
- ✅ 0 warnings de APIs deprecated
- ✅ Funcionalidad idéntica al sistema actual
- ✅ Mejor error handling
- ✅ Logging implementado
- ✅ Código preparado para el futuro

## 📝 Notas de Implementación

1. **Compatibilidad:** Mantener interface `FormattedAddress` sin cambios
2. **Error Handling:** Mejorar manejo de casos ZERO_RESULTS
3. **Performance:** Validar que tiempos de respuesta sean similares
4. **Testing:** Usar proyecto 17870 como caso de prueba principal

---

> **💡 Siguiente paso:** Proceder con `03-IMPLEMENTACION-TESTS.md` para crear la suite de tests que valide la migración.