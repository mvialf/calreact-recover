# Guía de Testing para Google Maps JavaScript API

## 🎯 **Propósito de esta Guía**

Esta guía documenta las mejores prácticas para testing de componentes que integran Google Maps JavaScript API, especialmente durante la migración de API legacy a API moderna (Places API v2).

## 📚 **Contexto: Migración Google Places API**

### API Legacy (Deprecated desde Marzo 2025)
- `google.maps.places.AutocompleteService`
- `google.maps.places.PlacesService`
- Callback-based API

### API Moderna (Recomendada 2025+)
- `google.maps.places.AutocompleteSuggestion`
- `google.maps.places.Place`
- Promise-based API

## 🏗️ **Arquitectura de Testing Recomendada**

### Factory Functions Pattern

El patrón Factory Functions garantiza que cada test tenga mocks completamente frescos, evitando contaminación entre tests.

```typescript
// ✅ CORRECTO - Factory Functions
const createMockPlace = () => ({
  fetchFields: jest.fn().mockResolvedValue(undefined),
  id: 'ChIJ123',
  displayName: 'Test Place',
  formattedAddress: '123 Test Street'
});

const createMockAutocompleteSuggestion = () => ({
  fetchAutocompleteSuggestions: jest.fn().mockResolvedValue({ 
    suggestions: [] 
  })
});

const createMockPlacesLib = () => ({
  AutocompleteSuggestion: createMockAutocompleteSuggestion(),
  AutocompleteSessionToken: jest.fn(() => ({ token: 'test-token' })),
  Place: jest.fn().mockImplementation(() => createMockPlace())
});

// ❌ INCORRECTO - Objetos compartidos
const sharedMockPlace = {
  fetchFields: jest.fn().mockResolvedValue(undefined)
};
```

### Setup Global Robusto

```typescript
describe('Google Maps Component Tests', () => {
  let mockImportLibrary: jest.Mock;
  let mockPlacesLib: any;
  let mockLegacyService: any;

  beforeEach(() => {
    // Crear mocks frescos para cada test
    mockPlacesLib = createMockPlacesLib();
    mockLegacyService = createMockLegacyService();
    mockImportLibrary = jest.fn();
    
    // Configurar comportamiento por defecto
    mockImportLibrary.mockImplementation((library: string) => {
      if (library === 'places') {
        return Promise.resolve(mockPlacesLib);
      }
      return Promise.reject(new Error('Library not found'));
    });

    // Setup global completo de Google Maps
    global.google = {
      maps: {
        importLibrary: mockImportLibrary,
        places: {
          PlacesServiceStatus: {
            OK: 'OK',
            ERROR: 'ERROR',
            ZERO_RESULTS: 'ZERO_RESULTS'
          },
          AutocompleteService: jest.fn(() => mockLegacyService),
          PlacesService: jest.fn().mockImplementation(() => ({
            getDetails: jest.fn(),
            findPlaceFromQuery: jest.fn()
          }))
        }
      }
    } as any;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
});
```

## 🔧 **Patrones de Testing por Escenario**

### Testing de Inicialización API

```typescript
describe('API Initialization', () => {
  it('debe inicializar con API moderna cuando esté disponible', async () => {
    const adapter = new PlacesServiceAdapter();
    await adapter.initialize();
    
    expect(mockImportLibrary).toHaveBeenCalledWith('places');
    expect(adapter.getAPIVersion()).toBe('modern');
    expect(adapter.isInitialized()).toBe(true);
  });

  it('debe hacer fallback a legacy cuando moderna no está disponible', async () => {
    mockImportLibrary.mockRejectedValue(new Error('Nueva API no disponible'));
    
    const adapter = new PlacesServiceAdapter();
    await adapter.initialize();
    
    expect(adapter.getAPIVersion()).toBe('legacy');
    expect(adapter.isInitialized()).toBe(true);
  });
});
```

### Testing de AutocompleteSuggestion (API Moderna)

```typescript
describe('AutocompleteSuggestion Tests', () => {
  let localMockPlacesLib: any;
  let adapter: PlacesServiceAdapter;

  beforeEach(async () => {
    localMockPlacesLib = createMockPlacesLib();
    mockImportLibrary.mockResolvedValue(localMockPlacesLib);
    
    adapter = new PlacesServiceAdapter();
    await adapter.initialize();
  });

  it('debe obtener sugerencias usando nueva API', async () => {
    const mockResponse = {
      suggestions: [
        {
          placePrediction: {
            text: { text: 'Test Address' },
            placeId: 'place_123',
            structuredFormat: {
              mainText: { text: 'Test', matches: [] },
              secondaryText: { text: 'Address' }
            },
            types: ['establishment'],
            terms: []
          }
        }
      ]
    };

    localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions
      .mockResolvedValue(mockResponse);

    const result = await adapter.getPlacePredictions('test query');

    expect(localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'test query',
          sessionToken: expect.any(Object),
          includedPrimaryTypes: ['establishment'],
          region: 'es'
        })
      );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      description: 'Test Address',
      place_id: 'place_123'
    });
  });
});
```

### Testing de Place.fetchFields (API Moderna)

```typescript
describe('Place fetchFields Tests', () => {
  let localMockPlace: any;
  let adapter: PlacesServiceAdapter;

  beforeEach(async () => {
    localMockPlace = createMockPlace();
    
    // Asignar propiedades que se "llenan" después de fetchFields
    Object.assign(localMockPlace, {
      id: 'ChIJ123',
      displayName: 'Test Restaurant',
      formattedAddress: '123 Test Street',
      location: { lat: () => -33.4489, lng: () => -70.6693 },
      addressComponents: [],
      types: ['restaurant', 'establishment']
    });

    const localMockPlacesLib = createMockPlacesLib();
    localMockPlacesLib.Place = jest.fn().mockImplementation(() => localMockPlace);
    
    mockImportLibrary.mockResolvedValue(localMockPlacesLib);
    
    adapter = new PlacesServiceAdapter();
    await adapter.initialize();
  });

  it('debe obtener detalles usando nueva API', async () => {
    const result = await adapter.getPlaceDetails('ChIJ123');
    
    expect(localMockPlace.fetchFields).toHaveBeenCalledWith({
      fields: [
        'id',
        'displayName', 
        'formattedAddress',
        'location',
        'addressComponents',
        'types'
      ]
    });
    
    expect(result).toEqual({
      place_id: 'ChIJ123',
      name: 'Test Restaurant',
      formatted_address: '123 Test Street',
      geometry: {
        location: localMockPlace.location,
        viewport: null
      },
      address_components: [],
      types: ['restaurant', 'establishment'],
      vicinity: undefined
    });
  });
});
```

### Testing de Legacy APIs con Callbacks

```typescript
describe('Legacy API Tests', () => {
  beforeEach(async () => {
    // Forzar API legacy
    mockImportLibrary.mockRejectedValue(new Error('Nueva API no disponible'));
    
    adapter = new PlacesServiceAdapter();
    await adapter.initialize();
  });

  it('debe usar AutocompleteService legacy', async () => {
    const mockPredictions = [
      {
        description: 'Test Address',
        place_id: 'place_123',
        structured_formatting: {
          main_text: 'Test',
          secondary_text: 'Address'
        },
        terms: [],
        types: []
      }
    ];

    mockLegacyService.getPlacePredictions.mockImplementation((request, callback) => {
      callback(mockPredictions, 'OK');
    });

    const result = await adapter.getPlacePredictions('test query');

    expect(mockLegacyService.getPlacePredictions).toHaveBeenCalledWith(
      expect.objectContaining({
        input: 'test query',
        componentRestrictions: { country: 'es' },
        types: ['establishment']
      }),
      expect.any(Function)
    );

    expect(result).toEqual(mockPredictions);
  });
});
```

## 🎭 **Mocking de Feature Flags**

```typescript
// Mock de feature flags para testing
jest.mock('@/lib/config/featureFlags', () => ({
  PlacesFeatureFlags: {
    shouldUseNewAPI: jest.fn(() => true),
    isFallbackAllowed: jest.fn(() => true),
    isMonitoringEnabled: jest.fn(() => false),
    isEmergencyMode: jest.fn(() => false)
  }
}));

// Testing de diferentes escenarios
describe('Feature Flags Scenarios', () => {
  it('debe usar legacy cuando nueva API esté deshabilitada', async () => {
    const { PlacesFeatureFlags } = require('@/lib/config/featureFlags');
    PlacesFeatureFlags.shouldUseNewAPI.mockReturnValue(false);

    const adapter = new PlacesServiceAdapter();
    await adapter.initialize();

    expect(adapter.getAPIVersion()).toBe('legacy');
  });

  it('debe fallar si fallback no está permitido', async () => {
    const { PlacesFeatureFlags } = require('@/lib/config/featureFlags');
    PlacesFeatureFlags.isFallbackAllowed.mockReturnValue(false);
    
    mockImportLibrary.mockRejectedValue(new Error('Nueva API falló'));

    const adapter = new PlacesServiceAdapter();

    await expect(adapter.initialize()).rejects.toThrow('Nueva API falló y fallback no permitido');
  });
});
```

## 🔄 **Testing de Session Tokens**

```typescript
describe('Session Token Management', () => {
  it('debe crear session token cuando esté habilitado', async () => {
    const localMockPlacesLib = createMockPlacesLib();
    mockImportLibrary.mockResolvedValue(localMockPlacesLib);
    
    const adapter = new PlacesServiceAdapter({ sessionToken: true });
    await adapter.initialize();
    
    expect(localMockPlacesLib.AutocompleteSessionToken).toHaveBeenCalled();
  });

  it('debe permitir refrescar session token', async () => {
    const localMockPlacesLib = createMockPlacesLib();
    mockImportLibrary.mockResolvedValue(localMockPlacesLib);
    
    const adapter = new PlacesServiceAdapter();
    await adapter.initialize();
    
    const initialCalls = localMockPlacesLib.AutocompleteSessionToken.mock.calls.length;
    adapter.refreshSessionToken();
    
    expect(localMockPlacesLib.AutocompleteSessionToken).toHaveBeenCalledTimes(initialCalls + 1);
  });
});
```

## 📊 **Testing de Conversión de Formatos**

```typescript
describe('Format Conversion Tests', () => {
  it('debe convertir formato moderna API a legacy', async () => {
    const modernResponse = {
      suggestions: [
        {
          placePrediction: {
            text: { text: 'Restaurant Name' },
            placeId: 'place-123',
            structuredFormat: {
              mainText: { 
                text: 'Restaurant Name',
                matches: [{ endOffset: 10 }]
              },
              secondaryText: { text: 'Santiago, Chile' }
            },
            types: ['restaurant', 'establishment'],
            terms: [{ offset: 0, value: 'Restaurant' }]
          }
        }
      ]
    };

    localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions
      .mockResolvedValue(modernResponse);

    const results = await adapter.getPlacePredictions('Restaurant');

    // Verificar que se convierte al formato legacy esperado
    expect(results[0]).toEqual({
      description: 'Restaurant Name',
      matched_substrings: [{ endOffset: 10 }],
      place_id: 'place-123',
      structured_formatting: {
        main_text: 'Restaurant Name',
        main_text_matched_substrings: [{ endOffset: 10 }],
        secondary_text: 'Santiago, Chile'
      },
      terms: [{ offset: 0, value: 'Restaurant' }],
      types: ['restaurant', 'establishment']
    });
  });
});
```

## ⚡ **Optimización de Performance en Tests**

### Evitar Timeouts

```typescript
// ✅ CORRECTO - Configurar mocks ANTES de initialize
beforeEach(async () => {
  localMockPlacesLib = createMockPlacesLib();
  
  // Configurar comportamiento específico ANTES de usar
  localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions
    .mockResolvedValue({ suggestions: [] });
  
  mockImportLibrary.mockResolvedValue(localMockPlacesLib);
  
  adapter = new PlacesServiceAdapter();
  await adapter.initialize();
});

// ❌ INCORRECTO - Mock después de initialize puede causar timeout
beforeEach(async () => {
  adapter = new PlacesServiceAdapter();
  await adapter.initialize(); // Puede colgar esperando respuesta
  
  // Muy tarde para configurar mock
  localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions
    .mockResolvedValue({ suggestions: [] });
});
```

### Isolation de Variables

```typescript
// ✅ CORRECTO - Variables locales por describe
describe('Specific Test Suite', () => {
  let localAdapter: PlacesServiceAdapter;
  let localMockPlacesLib: any;
  
  beforeEach(() => {
    localMockPlacesLib = createMockPlacesLib();
    // Usar variables locales
  });
});

// ❌ INCORRECTO - Variables globales compartidas
let globalAdapter: PlacesServiceAdapter;
let globalMockPlacesLib: any;

describe('Test Suite 1', () => {
  // Usar variables globales causa contaminación
});
```

## 🚨 **Errores Comunes y Soluciones**

### Error: "google.maps.places.PlacesService is not a constructor"

```typescript
// ❌ PROBLEMA
places: {
  PlacesService: jest.fn()  // No es constructor
}

// ✅ SOLUCIÓN
places: {
  PlacesService: jest.fn().mockImplementation(() => ({
    getDetails: jest.fn()
  }))
}
```

### Error: "Cannot find name 'mockPlace'"

```typescript
// ❌ PROBLEMA - Variable fuera de scope
describe('Tests', () => {
  it('test', () => {
    expect(mockPlace.fetchFields).toHaveBeenCalled(); // mockPlace no definido
  });
});

// ✅ SOLUCIÓN - Variable local
describe('Tests', () => {
  let localMockPlace: any;
  
  beforeEach(() => {
    localMockPlace = createMockPlace();
  });
  
  it('test', () => {
    expect(localMockPlace.fetchFields).toHaveBeenCalled();
  });
});
```

### Error: "Timeout of 10000ms exceeded"

```typescript
// ❌ PROBLEMA - Mock no configurado
const result = await adapter.getPlacePredictions('test'); // Cuelga esperando

// ✅ SOLUCIÓN - Mock configurado antes
localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions
  .mockResolvedValue({ suggestions: [] });

const result = await adapter.getPlacePredictions('test'); // Responde inmediatamente
```

## 📋 **Checklist de Testing**

### Pre-Test Setup ✅
- [ ] Factory functions creadas para todos los mocks
- [ ] Variables locales definidas por describe block
- [ ] beforeEach configura mocks frescos
- [ ] afterEach limpia mocks con `clearAllMocks()`

### Durante Testing ✅
- [ ] Mocks configurados ANTES de llamadas asíncronas
- [ ] Promesas correctamente resueltas/rechazadas
- [ ] Referencias a variables locales, no globales
- [ ] Feature flags mockeados según escenario

### Post-Test Validation ✅
- [ ] No timeouts en tests
- [ ] No warnings de React act()
- [ ] No contaminación entre tests
- [ ] Cobertura completa de escenarios

## 🎯 **Métricas de Éxito**

- **100% tests pasando** sin timeouts
- **< 30 segundos** tiempo total de ejecución
- **0 warnings** de Jest o React
- **Cobertura completa** de APIs moderna y legacy
- **Aislamiento perfecto** entre tests

---

Esta guía representa las mejores prácticas aprendidas durante la refactorización de `PlacesServiceAdapter` y debe ser referencia para futuros componentes que integren Google Maps APIs.