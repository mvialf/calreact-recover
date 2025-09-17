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

import { PlacesServiceAdapter } from '../../PlacesServiceAdapter';

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

// Factory functions para crear mocks frescos en cada test
const createMockPlace = () => ({
  fetchFields: jest.fn().mockResolvedValue(undefined)
});

const createMockAutocompleteSuggestion = () => ({
  fetchAutocompleteSuggestions: jest.fn().mockResolvedValue({ suggestions: [] })
});

const createMockLegacyService = () => ({
  getPlacePredictions: jest.fn()
});

const createMockPlacesLib = () => ({
  AutocompleteSuggestion: createMockAutocompleteSuggestion(),
  AutocompleteSessionToken: jest.fn(() => ({ token: 'test-token' })),
  Place: jest.fn().mockImplementation(() => createMockPlace())
});

describe('PlacesServiceAdapter', () => {
  // Variables locales para cada suite de tests
  let mockImportLibrary: jest.Mock;
  let mockPlacesLib: any;
  let mockLegacyService: any;

  // Setup global limpio antes de cada test
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

    // Setup global Google Maps mock
    global.google = {
      maps: {
        importLibrary: mockImportLibrary,
        places: {
          PlacesServiceStatus: {
            OK: 'OK'
          },
          // Mock API legacy disponible para fallback
          AutocompleteService: jest.fn(() => mockLegacyService),
          PlacesService: jest.fn().mockImplementation(() => ({
            getDetails: jest.fn()
          }))
        }
      }
    } as any;
  });
  
  // Limpieza completa después de cada test
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
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
    let localMockPlacesLib: any;

    beforeEach(async () => {
      // Crear mocks locales frescos para este describe
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

      // Configurar el mock específico para este test
      localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      const result = await adapter.getPlacePredictions('test query');

      expect(localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
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
      localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions.mockRejectedValue(
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
      mockLegacyService.getPlacePredictions.mockImplementation(
        (request: any, callback: (predictions: any, status: string) => void) => {
          callback(mockPredictions, 'OK');
        }
      );

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
      mockLegacyService.getPlacePredictions.mockImplementation(
        (request: any, callback: (predictions: any, status: string) => void) => {
          callback(null, 'ERROR');
        }
      );

      await expect(adapter.getPlacePredictions('test query')).rejects.toThrow('Places service error: ERROR');
    });
  });

  describe('Session Token Management', () => {
    it('debe crear session token cuando esté habilitado', async () => {
      // Usar un mock específico para este test
      const localMockPlacesLib = createMockPlacesLib();
      mockImportLibrary.mockResolvedValue(localMockPlacesLib);
      
      const adapter = new PlacesServiceAdapter({ sessionToken: true });
      await adapter.initialize();
      
      expect(localMockPlacesLib.AutocompleteSessionToken).toHaveBeenCalled();
    });

    it('debe permitir refrescar session token', async () => {
      // Usar un mock específico para este test
      const localMockPlacesLib = createMockPlacesLib();
      mockImportLibrary.mockResolvedValue(localMockPlacesLib);
      
      const adapter = new PlacesServiceAdapter();
      await adapter.initialize();
      
      const initialCalls = localMockPlacesLib.AutocompleteSessionToken.mock.calls.length;
      adapter.refreshSessionToken();
      
      expect(localMockPlacesLib.AutocompleteSessionToken).toHaveBeenCalledTimes(initialCalls + 1);
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

      mockLegacyService.getPlacePredictions.mockImplementation(
        (request: any, callback: (predictions: any, status: string) => void) => {
          callback(mockPredictions, 'OK');
        }
      );

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

  describe('getPlaceDetails - Nueva Implementación Completa', () => {
    describe('API Moderna', () => {
      let adapter: PlacesServiceAdapter;
      let localMockPlace: any;
      const mockModernPlace = {
        id: 'ChIJN5Nz71W3j4ARhx5bwpTQEGg',
        displayName: 'Restaurant Modern',
        formattedAddress: 'Calle Moderna 123, Santiago, Chile',
        location: { lat: () => -33.4489, lng: () => -70.6693 },
        addressComponents: [
          { long_name: 'Calle Moderna 123', types: ['street_number', 'route'] }
        ],
        types: ['restaurant', 'establishment'],
        shortFormattedAddress: 'Santiago, Chile',
        websiteURI: 'https://restaurant-modern.cl',
        nationalPhoneNumber: '+56 2 1234 5678',
        internationalPhoneNumber: '+56 2 1234 5678',
        rating: 4.5,
        userRatingCount: 120,
        businessStatus: 'OPERATIONAL'
      };

      beforeEach(async () => {
        // Crear un mock local fresco para este describe
        localMockPlace = createMockPlace();
        Object.assign(localMockPlace, mockModernPlace);
        
        // Crear un mock de PlacesLib específico para este describe
        const localMockPlacesLib = createMockPlacesLib();
        localMockPlacesLib.Place = jest.fn().mockImplementation(() => localMockPlace);
        
        mockImportLibrary.mockResolvedValue(localMockPlacesLib);
        
        adapter = new PlacesServiceAdapter();
        await adapter.initialize();
      });

      it('debe usar nueva API cuando está disponible', async () => {
        const result = await adapter.getPlaceDetails('ChIJN5Nz71W3j4ARhx5bwpTQEGg');
        
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
          place_id: 'ChIJN5Nz71W3j4ARhx5bwpTQEGg',
          name: 'Restaurant Modern',
          formatted_address: 'Calle Moderna 123, Santiago, Chile',
          geometry: {
            location: mockModernPlace.location,
            viewport: null
          },
          address_components: mockModernPlace.addressComponents,
          types: ['restaurant', 'establishment'],
          vicinity: 'Santiago, Chile',
          website: 'https://restaurant-modern.cl',
          formatted_phone_number: '+56 2 1234 5678',
          international_phone_number: '+56 2 1234 5678',
          rating: 4.5,
          user_ratings_total: 120,
          business_status: 'OPERATIONAL',
          plus_code: undefined,
          photos: undefined,
          reviews: undefined,
          opening_hours: undefined
        });
      });

      it('debe mapear campos legacy a moderna API correctamente', async () => {
        await adapter.getPlaceDetails('test_id', [
          'place_id',
          'name', 
          'formatted_address',
          'geometry.location',
          'address_components',
          'website',
          'formatted_phone_number',
          'rating'
        ]);
        
        expect(localMockPlace.fetchFields).toHaveBeenCalledWith({
          fields: [
            'id',
            'displayName',
            'formattedAddress', 
            'location',
            'addressComponents',
            'websiteURI',
            'nationalPhoneNumber',
            'rating'
          ]
        });
      });

      it('debe hacer fallback a legacy si nueva API falla', async () => {
        localMockPlace.fetchFields.mockRejectedValue(new Error('Nueva API falló'));
        
        const mockPlacesService = {
          getDetails: jest.fn((request, callback) => {
            callback({
              place_id: 'test_id',
              name: 'Legacy Restaurant',
              formatted_address: 'Legacy Address'
            }, 'OK');
          })
        };

        global.google.maps.places.PlacesService = jest.fn(() => mockPlacesService) as any;

        const result = await adapter.getPlaceDetails('test_id');

        expect(mockPlacesService.getDetails).toHaveBeenCalled();
        expect(result?.name).toBe('Legacy Restaurant');
      });

      it('debe convertir photos correctamente', async () => {
        const mockPlaceWithPhotos = {
          ...localMockPlace,
          photos: [
            {
              getURI: jest.fn((options) => `https://photo.url?maxHeight=${options?.maxHeight || 400}`),
              heightPx: 1200,
              widthPx: 1600,
              authorAttributions: [{ displayName: 'Photographer Name' }]
            }
          ]
        };

        Object.assign(localMockPlace, mockPlaceWithPhotos);

        const result = await adapter.getPlaceDetails('test_id', ['photos']);

        expect(result?.photos).toHaveLength(1);
        expect(result?.photos![0]).toEqual({
          getUrl: expect.any(Function),
          height: 1200,
          width: 1600,
          html_attributions: ['Photographer Name']
        });
      });

      it('debe convertir reviews correctamente', async () => {
        const mockPlaceWithReviews = {
          ...localMockPlace,
          reviews: [
            {
              rating: 5,
              text: 'Great restaurant!',
              publishTime: '2023-09-01T12:00:00Z',
              authorAttribution: {
                displayName: 'John Doe',
                uri: 'https://maps.google.com/user123',
                photoURI: 'https://photo.url/user123.jpg'
              }
            }
          ]
        };

        Object.assign(localMockPlace, mockPlaceWithReviews);

        const result = await adapter.getPlaceDetails('test_id', ['reviews']);

        expect(result?.reviews).toHaveLength(1);
        expect(result?.reviews![0]).toEqual({
          rating: 5,
          text: 'Great restaurant!',
          time: expect.any(Number),
          author_name: 'John Doe',
          author_url: 'https://maps.google.com/user123',
          profile_photo_url: 'https://photo.url/user123.jpg'
        });
      });
    });

    describe('API Legacy (fallback)', () => {
      let adapter: PlacesServiceAdapter;

      beforeEach(async () => {
        // Forzar API legacy
        mockImportLibrary.mockRejectedValue(new Error('Nueva API no disponible'));
        
        adapter = new PlacesServiceAdapter();
        await adapter.initialize();
      });

      it('debe usar API legacy cuando moderna no está disponible', async () => {
        const mockPlace = {
          place_id: 'test_place_id',
          name: 'Legacy Restaurant', 
          formatted_address: 'Legacy Address 123',
          geometry: { location: { lat: () => 1, lng: () => 2 } },
          address_components: [],
          types: ['restaurant']
        };

        const mockPlacesService = {
          getDetails: jest.fn((request, callback) => {
            callback(mockPlace, 'OK');
          })
        };

        global.google.maps.places.PlacesService = jest.fn(() => mockPlacesService) as any;

        const result = await adapter.getPlaceDetails('test_place_id');

        expect(mockPlacesService.getDetails).toHaveBeenCalledWith(
          expect.objectContaining({
            placeId: 'test_place_id',
            fields: expect.arrayContaining([
              'place_id',
              'formatted_address',
              'geometry',
              'address_components',
              'name',
              'types'
            ])
          }),
          expect.any(Function)
        );

        expect(result).toEqual(mockPlace);
      });

      it('debe manejar errores de API legacy', async () => {
        const mockPlacesService = {
          getDetails: jest.fn((request, callback) => {
            callback(null, 'ZERO_RESULTS');
          })
        };

        global.google.maps.places.PlacesService = jest.fn(() => mockPlacesService) as any;

        await expect(adapter.getPlaceDetails('invalid_id')).rejects.toThrow('Place details error: ZERO_RESULTS');
      });
    });

    describe('Manejo de errores y feature flags', () => {
      it('debe fallar si nueva API falla y fallback no está permitido', async () => {
        const { PlacesFeatureFlags } = require('@/lib/config/featureFlags');
        PlacesFeatureFlags.isFallbackAllowed.mockReturnValue(false);

        const mockPlacesLibWithFailingPlace = {
          ...mockPlacesLib,
          Place: jest.fn(() => ({
            fetchFields: jest.fn().mockRejectedValue(new Error('Nueva API falló'))
          }))
        };

        mockImportLibrary.mockResolvedValue(mockPlacesLibWithFailingPlace);
        
        const adapter = new PlacesServiceAdapter();
        await adapter.initialize();

        await expect(adapter.getPlaceDetails('test_id')).rejects.toThrow('Nueva API falló y fallback no permitido');
      });

      it('debe usar campos por defecto cuando no se especifican', async () => {
        const mockPlace = {
          fetchFields: jest.fn().mockResolvedValue(undefined)
        };

        const mockPlacesLibWithPlace = {
          ...mockPlacesLib,
          Place: jest.fn(() => mockPlace)
        };

        mockImportLibrary.mockResolvedValue(mockPlacesLibWithPlace);
        
        const adapter = new PlacesServiceAdapter();
        await adapter.initialize();

        await adapter.getPlaceDetails('test_id');

        expect(mockPlace.fetchFields).toHaveBeenCalledWith({
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location', 
            'addressComponents',
            'types'
          ]
        });
      });
    });
  });

  describe('Conversión de formatos API', () => {
    let adapter: PlacesServiceAdapter;
    let localMockPlacesLib: any;

    beforeEach(async () => {
      localMockPlacesLib = createMockPlacesLib();
      mockImportLibrary.mockResolvedValue(localMockPlacesLib);
      
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

      localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

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

      localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

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
    let localMockPlacesLib: any;

    beforeEach(async () => {
      localMockPlacesLib = createMockPlacesLib();
      mockImportLibrary.mockResolvedValue(localMockPlacesLib);
      
      adapter = new PlacesServiceAdapter();
      await adapter.initialize();
    });

    it('debe usar locationBias cuando se proporciona location', async () => {
      const mockResponse = { suggestions: [] };
      localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      await adapter.getPlacePredictions('test', { 
        location: { lat: () => -33.4489, lng: () => -70.6693 } as any,
        radius: 5000
      });

      expect(localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
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
      localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      await customAdapter.getPlacePredictions('pizza');

      expect(localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
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
      const localMockPlacesLib = createMockPlacesLib();
      mockImportLibrary.mockResolvedValue(localMockPlacesLib);
      
      const adapterSinToken = new PlacesServiceAdapter({ sessionToken: false });
      await adapterSinToken.initialize();

      const mockResponse = { suggestions: [] };
      localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions.mockResolvedValue(mockResponse);

      await adapterSinToken.getPlacePredictions('test');

      expect(localMockPlacesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionToken: undefined
        })
      );
    });
  });
});