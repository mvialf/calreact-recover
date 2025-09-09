/**
 * Tests para PlacesServiceAdapter - Migración Google Places API v2
 * 
 * Prueba la funcionalidad del adaptador que maneja tanto APIs legacy como modernas
 * de forma transparente basándose en disponibilidad y feature flags.
 * 
 * Basado en la documentación oficial de Google Maps JavaScript API.
 * 
 * @version 2.0.0
 * @since Septiembre 2025
 */

// Mock de las variables de entorno
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'true';
process.env.NEXT_PUBLIC_PLACES_API_MONITORING = 'false';
process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'false';

import { PlacesServiceAdapter } from '../PlacesServiceAdapter';

// Mock del logger
jest.mock('@/lib/logger', () => ({
  uiLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    success: jest.fn()
  }
}));

// Mock de feature flags
jest.mock('@/lib/config/featureFlags', () => ({
  PlacesFeatureFlags: {
    shouldUseNewAPI: jest.fn(() => true),
    isFallbackAllowed: jest.fn(() => true),
    isMonitoringEnabled: jest.fn(() => false),
    isEmergencyMode: jest.fn(() => false)
  }
}));

// Mocks para Google Maps APIs
const mockAutocompleteSuggestion = {
  fetchAutocompleteSuggestions: jest.fn()
};

const mockPlacesLib = {
  AutocompleteSuggestion: mockAutocompleteSuggestion,
  AutocompleteSessionToken: jest.fn(() => ({ token: 'test-token' }))
};

const mockLegacyService = {
  getPlacePredictions: jest.fn()
};

// Mock dinámico que simula detección de API
const mockImportLibrary = jest.fn((library: string) => {
  if (library === 'places') {
    return Promise.resolve(mockPlacesLib);
  }
  return Promise.reject(new Error('Library not found'));
});

// Setup global mocks
beforeEach(() => {
  global.google = {
    maps: {
      importLibrary: mockImportLibrary,
      places: {
        PlacesServiceStatus: {
          OK: 'OK'
        },
        // Mock API legacy disponible para fallback
        AutocompleteService: jest.fn(() => mockLegacyService)
      }
    }
  } as any;
  
  jest.clearAllMocks();
});

describe('PlacesServiceAdapter', () => {
  const mockPredictions = [
    {
      description: 'Test Address 1',
      place_id: 'place_1',
      structured_formatting: {
        main_text: 'Test Address',
        secondary_text: 'Test City'
      },
      matched_substrings: [],
      terms: [],
      types: []
    }
  ];

  describe('Inicialización', () => {
    it('debe inicializar con API moderna cuando esté disponible', async () => {
      const adapter = new PlacesServiceAdapter();
      await adapter.initialize();
      
      expect(mockImportLibrary).toHaveBeenCalledWith('places');
      expect(adapter.getAPIVersion()).toBe('modern');
      expect(adapter.isInitialized()).toBe(true);
    });

    it('debe usar API legacy en modo de emergencia', async () => {
      // Mock para simular modo de emergencia
      const { PlacesFeatureFlags } = require('@/lib/config/featureFlags');
      PlacesFeatureFlags.isEmergencyMode.mockReturnValue(true);

      const adapter = new PlacesServiceAdapter();
      await adapter.initialize();

      expect(adapter.getAPIVersion()).toBe('legacy');
      expect(mockImportLibrary).not.toHaveBeenCalled(); // No debe intentar cargar nueva API
    });

    it('debe respetar feature flags para usar nueva API', async () => {
      const { PlacesFeatureFlags } = require('@/lib/config/featureFlags');
      PlacesFeatureFlags.shouldUseNewAPI.mockReturnValue(false);

      const adapter = new PlacesServiceAdapter();
      await adapter.initialize();

      expect(adapter.getAPIVersion()).toBe('legacy');
    });

    it('debe hacer fallback a API legacy cuando nueva API no esté disponible', async () => {
      // Simular nueva API no disponible
      mockImportLibrary.mockRejectedValue(new Error('Nueva API no disponible'));
      
      const adapter = new PlacesServiceAdapter();
      await adapter.initialize();
      
      expect(adapter.getAPIVersion()).toBe('legacy');
      expect(adapter.isInitialized()).toBe(true);
    });

    it('debe fallar si ninguna API está disponible', async () => {
      mockImportLibrary.mockRejectedValue(new Error('Nueva API no disponible'));
      
      // Simular API legacy tampoco disponible
      global.google = {
        maps: {
          importLibrary: mockImportLibrary,
          places: undefined
        }
      } as any;
      
      const adapter = new PlacesServiceAdapter();
      
      await expect(adapter.initialize()).rejects.toThrow('Ninguna API de Places disponible');
    });
  });

  describe('getPlacePredictions - API Moderna', () => {
    let adapter: PlacesServiceAdapter;

    beforeEach(async () => {
      // Asegurar que nueva API esté disponible
      mockImportLibrary.mockResolvedValue(mockPlacesLib);
      adapter = new PlacesServiceAdapter();
      await adapter.initialize();
    });

    it('debe obtener sugerencias usando nueva API', async () => {
      const mockResponse = {
        suggestions: [
          {
            placePrediction: {
              text: { text: 'Test Address 1' },
              placeId: 'place_1',
              structuredFormat: {
                mainText: { text: 'Test Address', matches: [] },
                secondaryText: { text: 'Test City' }
              },
              terms: [],
              types: []
            }
          }
        ]
      };

      mockAutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      const result = await adapter.getPlacePredictions('test query');

      expect(mockAutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'test query',
          sessionToken: expect.any(Object),
          includedPrimaryTypes: ['establishment'],
          region: 'es'
        })
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        description: 'Test Address 1',
        place_id: 'place_1'
      });
    });

    it('debe manejar errores de nueva API', async () => {
      mockAutocompleteSuggestion.fetchAutocompleteSuggestions.mockRejectedValue(
        new Error('API Error')
      );

      await expect(adapter.getPlacePredictions('test query')).rejects.toThrow('API Error');
    });
  });

  describe('getPlacePredictions - API Legacy', () => {
    let adapter: PlacesServiceAdapter;

    beforeEach(async () => {
      // Forzar uso de API legacy
      mockImportLibrary.mockRejectedValue(new Error('Nueva API no disponible'));
      
      adapter = new PlacesServiceAdapter();
      await adapter.initialize();
    });

    it('debe obtener sugerencias usando API legacy', async () => {
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

    it('debe manejar errores de API legacy', async () => {
      mockLegacyService.getPlacePredictions.mockImplementation((request, callback) => {
        callback(null, 'ERROR');
      });

      await expect(adapter.getPlacePredictions('test query')).rejects.toThrow('Places service error: ERROR');
    });
  });

  describe('Session Token Management', () => {
    beforeEach(() => {
      // Resetear mocks para tests de session tokens
      mockImportLibrary.mockResolvedValue(mockPlacesLib);
    });

    it('debe crear session token cuando esté habilitado', async () => {
      const adapter = new PlacesServiceAdapter({ sessionToken: true });
      await adapter.initialize();
      
      expect(mockPlacesLib.AutocompleteSessionToken).toHaveBeenCalled();
    });

    it('debe permitir refrescar session token', async () => {
      const adapter = new PlacesServiceAdapter();
      await adapter.initialize();
      
      const initialCalls = mockPlacesLib.AutocompleteSessionToken.mock.calls.length;
      adapter.refreshSessionToken();
      
      expect(mockPlacesLib.AutocompleteSessionToken).toHaveBeenCalledTimes(initialCalls + 1);
    });
  });

  describe('Configuración personalizada', () => {
    it('debe usar configuración personalizada', async () => {
      const customConfig = {
        componentRestrictions: { country: 'cl' },
        types: ['geocode'],
        sessionToken: false
      };

      const adapter = new PlacesServiceAdapter(customConfig);
      
      // Forzar legacy para probar configuración
      mockImportLibrary.mockRejectedValue(new Error('Nueva API no disponible'));
      await adapter.initialize();

      mockLegacyService.getPlacePredictions.mockImplementation((request, callback) => {
        callback(mockPredictions, 'OK');
      });

      await adapter.getPlacePredictions('test');

      expect(mockLegacyService.getPlacePredictions).toHaveBeenCalledWith(
        expect.objectContaining({
          componentRestrictions: { country: 'cl' },
          types: ['geocode']
        }),
        expect.any(Function)
      );
    });
  });

  describe('getPlaceDetails', () => {
    it('debe obtener detalles de lugar usando PlacesService', async () => {
      const adapter = new PlacesServiceAdapter();
      await adapter.initialize();

      const mockPlace = {
        place_id: 'test_place_id',
        formatted_address: 'Test Address',
        geometry: { location: { lat: () => 1, lng: () => 2 } }
      };

      const mockPlacesService = {
        getDetails: jest.fn((request, callback) => {
          callback(mockPlace, 'OK');
        }),
        findPlaceFromPhoneNumber: jest.fn(),
        findPlaceFromQuery: jest.fn(),
        nearbySearch: jest.fn(),
        textSearch: jest.fn()
      };

      global.google.maps.places.PlacesService = jest.fn(() => mockPlacesService) as any;

      const result = await adapter.getPlaceDetails('test_place_id');

      expect(mockPlacesService.getDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          placeId: 'test_place_id',
          fields: expect.any(Array)
        }),
        expect.any(Function)
      );

      expect(result).toEqual(mockPlace);
    });

    it('debe manejar errores en getPlaceDetails', async () => {
      const adapter = new PlacesServiceAdapter();
      await adapter.initialize();

      const mockPlacesService = {
        getDetails: jest.fn((request, callback) => {
          callback(null, 'ERROR');
        }),
        findPlaceFromPhoneNumber: jest.fn(),
        findPlaceFromQuery: jest.fn(),
        nearbySearch: jest.fn(),
        textSearch: jest.fn()
      };

      global.google.maps.places.PlacesService = jest.fn(() => mockPlacesService) as any;

      await expect(adapter.getPlaceDetails('test_place_id')).rejects.toThrow('Place details error: ERROR');
    });
  });

  describe('Conversión de formatos API', () => {
    let adapter: PlacesServiceAdapter;

    beforeEach(async () => {
      adapter = new PlacesServiceAdapter();
      await adapter.initialize();
    });

    it('debe convertir correctamente el formato de nueva API a legacy', async () => {
      const mockResponse = {
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

      mockAutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      const results = await adapter.getPlacePredictions('Restaurant');

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

    it('debe manejar respuestas incompletas de nueva API', async () => {
      const mockResponse = {
        suggestions: [
          {
            placePrediction: {
              // Solo datos mínimos disponibles
              placeId: 'place-123'
            }
          }
        ]
      };

      mockAutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      const results = await adapter.getPlacePredictions('test');

      expect(results[0]).toEqual({
        description: '',
        matched_substrings: [],
        place_id: 'place-123',
        structured_formatting: {
          main_text: '',
          main_text_matched_substrings: [],
          secondary_text: ''
        },
        terms: [],
        types: []
      });
    });
  });

  describe('Funcionalidades específicas de nueva API', () => {
    let adapter: PlacesServiceAdapter;

    beforeEach(async () => {
      adapter = new PlacesServiceAdapter();
      await adapter.initialize();
    });

    it('debe usar locationBias cuando se proporciona location', async () => {
      const mockResponse = { suggestions: [] };
      mockAutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      await adapter.getPlacePredictions('test', { 
        location: { lat: () => -33.4489, lng: () => -70.6693 } as any,
        radius: 5000
      });

      expect(mockAutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          locationBias: {
            center: { lat: -33.4489, lng: -70.6693 },
            radius: 5000
          }
        })
      );
    });

    it('debe usar includedPrimaryTypes configurado', async () => {
      const customAdapter = new PlacesServiceAdapter({ types: ['restaurant', 'food'] });
      await customAdapter.initialize();

      const mockResponse = { suggestions: [] };
      mockAutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      await customAdapter.getPlacePredictions('pizza');

      expect(mockAutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          includedPrimaryTypes: ['restaurant', 'food']
        })
      );
    });
  });

  describe('Manejo robusto de errores', () => {
    it('debe manejar timeout de inicialización', async () => {
      // Simular timeout en importLibrary
      mockImportLibrary.mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );

      const adapter = new PlacesServiceAdapter();
      
      await expect(adapter.initialize()).rejects.toThrow('Timeout');
    });

    it('debe mantener estado consistente después de errores', async () => {
      const adapter = new PlacesServiceAdapter();
      
      // Primera inicialización falla
      mockImportLibrary.mockRejectedValueOnce(new Error('Fallo temporal'));
      
      try {
        await adapter.initialize();
      } catch (e) {
        // Se espera que falle
      }

      expect(adapter.isInitialized()).toBe(false);
      
      // Segunda inicialización exitosa
      mockImportLibrary.mockResolvedValue(mockPlacesLib);
      await adapter.initialize();
      
      expect(adapter.isInitialized()).toBe(true);
    });
  });

  describe('Performance y optimizaciones', () => {
    it('no debe inicializar múltiples veces', async () => {
      const adapter = new PlacesServiceAdapter();

      await adapter.initialize();
      await adapter.initialize(); // Segunda llamada
      await adapter.initialize(); // Tercera llamada

      expect(mockImportLibrary).toHaveBeenCalledTimes(1);
      expect(adapter.isInitialized()).toBe(true);
    });

    it('debe crear session token solo cuando esté habilitado', async () => {
      const adapterSinToken = new PlacesServiceAdapter({ sessionToken: false });
      await adapterSinToken.initialize();

      const mockResponse = { suggestions: [] };
      mockAutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      await adapterSinToken.getPlacePredictions('test');

      expect(mockAutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionToken: undefined
        })
      );
    });
  });
});