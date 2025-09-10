/**
 * Google Maps API Mocks - Evita timeouts y dependencias externas
 * 
 * Soluciona timeouts en PlacesServiceAdapter tests
 * Compatible con: Google Maps JavaScript API, @googlemaps/js-api-loader
 * 
 * @author Mentor Técnico AI
 * @date 2025-09-08
 */

// ==========================================
// PLACES API MOCK DATA
// ==========================================

/**
 * Datos de prueba para Places API
 */
const mockPlacesData = {
  predictions: [
    {
      description: 'Madrid, España',
      matched_substrings: [{ offset: 0, length: 6 }],
      place_id: 'ChIJgTwKgJcpQg0RaSKMYcHeNsQ',
      reference: 'mock-reference-madrid',
      structured_formatting: {
        main_text: 'Madrid',
        main_text_matched_substrings: [{ offset: 0, length: 6 }],
        secondary_text: 'España'
      },
      terms: [
        { offset: 0, value: 'Madrid' },
        { offset: 8, value: 'España' }
      ],
      types: ['locality', 'political', 'geocode']
    },
    {
      description: 'Barcelona, España',
      matched_substrings: [{ offset: 0, length: 9 }],
      place_id: 'ChIJ5TCOcRaYpBIRCmZHTz37sEQ',
      reference: 'mock-reference-barcelona',
      structured_formatting: {
        main_text: 'Barcelona',
        main_text_matched_substrings: [{ offset: 0, length: 9 }],
        secondary_text: 'España'
      },
      terms: [
        { offset: 0, value: 'Barcelona' },
        { offset: 11, value: 'España' }
      ],
      types: ['locality', 'political', 'geocode']
    },
    {
      description: 'Valencia, España',
      matched_substrings: [{ offset: 0, length: 8 }],
      place_id: 'ChIJ5TCOcRaYpBIRCmZHTz37sEQ',
      reference: 'mock-reference-valencia',
      structured_formatting: {
        main_text: 'Valencia',
        main_text_matched_substrings: [{ offset: 0, length: 8 }],
        secondary_text: 'España'
      },
      terms: [
        { offset: 0, value: 'Valencia' },
        { offset: 10, value: 'España' }
      ],
      types: ['locality', 'political', 'geocode']
    }
  ],
  
  placeDetails: {
    'ChIJgTwKgJcpQg0RaSKMYcHeNsQ': {
      place_id: 'ChIJgTwKgJcpQg0RaSKMYcHeNsQ',
      formatted_address: 'Madrid, España',
      name: 'Madrid',
      geometry: {
        location: { lat: 40.4168, lng: -3.7038 },
        viewport: {
          northeast: { lat: 40.4181, lng: -3.7025 },
          southwest: { lat: 40.4155, lng: -3.7051 }
        }
      },
      address_components: [
        {
          long_name: 'Madrid',
          short_name: 'Madrid',
          types: ['locality', 'political']
        },
        {
          long_name: 'España',
          short_name: 'ES',
          types: ['country', 'political']
        }
      ],
      types: ['locality', 'political']
    }
  }
};

// ==========================================
// AUTOCOMPLETE SERVICE MOCK
// ==========================================

/**
 * Mock de AutocompleteService que responde inmediatamente
 */
class MockAutocompleteService {
  private callbacks: Map<string, Function> = new Map();

  /**
   * Mock de getPlacePredictions con callback pattern
   */
  getPlacePredictions(request: any, callback: Function) {
    // Simular delay mínimo pero no timeout
    setTimeout(() => {
      const filteredPredictions = mockPlacesData.predictions.filter(prediction => 
        prediction.description.toLowerCase().includes(request.input?.toLowerCase() || '')
      );

      callback(filteredPredictions, 'OK');
    }, 50); // 50ms delay - rápido pero realista
  }

  /**
   * Mock de getQueryPredictions
   */
  getQueryPredictions(request: any, callback: Function) {
    this.getPlacePredictions(request, callback);
  }
}

/**
 * Mock de AutocompleteSessionToken
 */
class MockAutocompleteSessionToken {
  private token: string;

  constructor() {
    this.token = `mock-session-token-${Date.now()}`;
  }

  toString(): string {
    return this.token;
  }
}

// ==========================================
// PLACES SERVICE MOCK
// ==========================================

/**
 * Mock de PlacesService
 */
class MockPlacesService {
  constructor(private map?: any) {}

  /**
   * Mock de getDetails
   */
  getDetails(request: any, callback: Function) {
    const placeDetails = mockPlacesData.placeDetails[request.placeId];
    
    setTimeout(() => {
      if (placeDetails) {
        callback(placeDetails, 'OK');
      } else {
        callback(null, 'NOT_FOUND');
      }
    }, 50);
  }

  /**
   * Mock de findPlaceFromQuery
   */
  findPlaceFromQuery(request: any, callback: Function) {
    const mockResults = mockPlacesData.predictions.filter(prediction =>
      prediction.description.toLowerCase().includes(request.query?.toLowerCase() || '')
    );

    setTimeout(() => {
      callback(mockResults, 'OK');
    }, 50);
  }
}

// ==========================================
// GOOGLE MAPS LOADER MOCK
// ==========================================

/**
 * Mock de @googlemaps/js-api-loader
 */
class MockLoader {
  private options: any;

  constructor(options: any) {
    this.options = options;
  }

  /**
   * Mock de importLibrary - La función clave que causa timeouts
   */
  async importLibrary(library: string): Promise<any> {
    // Simular carga rápida sin timeout
    await new Promise(resolve => setTimeout(resolve, 100));

    switch (library) {
      case 'places':
        return {
          AutocompleteService: MockAutocompleteService,
          AutocompleteSessionToken: MockAutocompleteSessionToken,
          PlacesService: MockPlacesService,
          PlacesServiceStatus: {
            OK: 'OK',
            NOT_FOUND: 'NOT_FOUND',
            ZERO_RESULTS: 'ZERO_RESULTS'
          }
        };
      
      case 'maps':
        return {
          Map: jest.fn(),
          InfoWindow: jest.fn(),
          Marker: jest.fn()
        };
      
      case 'geometry':
        return {
          spherical: {
            computeDistanceBetween: jest.fn().mockReturnValue(1000)
          }
        };
      
      default:
        return {};
    }
  }

  /**
   * Mock de load method
   */
  async load(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return window.google || {};
  }
}

// ==========================================
// GLOBAL GOOGLE MOCK
// ==========================================

/**
 * Mock del objeto global google
 */
const mockGoogleGlobal = {
  maps: {
    places: {
      AutocompleteService: MockAutocompleteService,
      AutocompleteSessionToken: MockAutocompleteSessionToken,
      PlacesService: MockPlacesService
    },
    Map: jest.fn(),
    Marker: jest.fn(),
    InfoWindow: jest.fn(),
    LatLng: jest.fn((lat: number, lng: number) => ({ lat, lng })),
    geometry: {
      spherical: {
        computeDistanceBetween: jest.fn().mockReturnValue(1000)
      }
    }
  }
};

// ==========================================
// HOOK MOCKS (para React)
// ==========================================

/**
 * Mock para useLoadScript hook
 */
export const mockUseLoadScript = {
  isLoaded: true,
  loadError: null
};

/**
 * Mock para usePlacesAutocomplete hook (si se usa)
 */
export const mockUsePlacesAutocomplete = {
  ready: true,
  value: '',
  setValue: jest.fn(),
  suggestions: {
    status: 'OK',
    data: mockPlacesData.predictions
  },
  clearSuggestions: jest.fn()
};

// ==========================================
// MAIN EXPORTS
// ==========================================

/**
 * Mock principal de Google Maps Loader
 */
export const mockGoogleMapsLoader = {
  Loader: MockLoader
};

/**
 * Mock para @googlemaps/js-api-loader
 */
export const mockGoogleMaps = {
  Loader: MockLoader
};

/**
 * Mock de Places Library específico
 */
export const mockPlacesLib = {
  AutocompleteService: MockAutocompleteService,
  AutocompleteSessionToken: MockAutocompleteSessionToken,
  PlacesService: MockPlacesService
};

/**
 * Instancias mockeadas ya inicializadas
 */
export const mockAutocompleteService = new MockAutocompleteService();
export const mockPlacesService = new MockPlacesService();

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Configura mock global de Google Maps
 */
export const setupGoogleMapsMocks = () => {
  (global as any).google = mockGoogleGlobal;
  (global as any).window = { ...global.window, google: mockGoogleGlobal };
};

/**
 * Crea predicciones custom para tests específicos
 */
export const createMockPredictions = (customData: any[] = []) => {
  return customData.length > 0 ? customData : mockPlacesData.predictions;
};

/**
 * Crea respuesta de error para tests negativos
 */
export const createMockError = (status: string = 'ERROR') => ({
  predictions: [],
  status
});

/**
 * Mock de importLibrary directo (para casos simples)
 */
export const mockImportLibrary = jest.fn().mockImplementation(async (library: string) => {
  switch (library) {
    case 'places':
      return mockPlacesLib;
    default:
      return {};
  }
});

// ==========================================
// JEST SETUP HELPERS
// ==========================================

/**
 * Setup completo para Jest
 */
export const setupJestGoogleMapsMocks = () => {
  // Mock del loader
  jest.mock('@googlemaps/js-api-loader', () => mockGoogleMaps);
  
  // Mock de hooks React (si se usan)
  jest.mock('@react-google-maps/api', () => ({
    useLoadScript: jest.fn().mockReturnValue(mockUseLoadScript),
    GoogleMap: jest.fn(),
    Marker: jest.fn()
  }));
  
  // Setup global
  setupGoogleMapsMocks();
  
  return {
    mockAutocompleteService,
    mockPlacesService,
    mockImportLibrary
  };
};

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*
// En tu archivo de test:

import { 
  mockGoogleMaps, 
  mockPlacesLib, 
  setupJestGoogleMapsMocks,
  createMockPredictions 
} from '../mocks/google-maps-mocks';

// Setup al inicio del test file
setupJestGoogleMapsMocks();

// O aplicar mock específico
jest.mock('@googlemaps/js-api-loader', () => mockGoogleMaps);

describe('PlacesServiceAdapter', () => {
  let adapter: PlacesServiceAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new PlacesServiceAdapter();
  });

  it('should initialize without timeout', async () => {
    // ✅ No timeout, respuesta inmediata
    await adapter.initialize();
    expect(adapter.isInitialized()).toBe(true);
  });

  it('should get place predictions', async () => {
    await adapter.initialize();
    
    const results = await adapter.getPlacePredictions('Madrid');
    
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].description).toContain('Madrid');
  });

  it('should handle custom predictions', async () => {
    // Mock custom data for specific test
    const customPredictions = createMockPredictions([
      {
        description: 'Custom Place',
        place_id: 'custom-place-id',
        structured_formatting: {
          main_text: 'Custom',
          secondary_text: 'Place'
        }
      }
    ]);

    // Use custom data in test...
  });
});
*/