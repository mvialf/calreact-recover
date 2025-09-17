// google-maps-mocks.ts - Mocks centralizados para Google Maps API
// Mocks completos para Google Maps JavaScript API y Places API

// Mock para Google Maps Places API
export const mockPlacesService = {
  getPlacePredictions: jest.fn(),
  getDetails: jest.fn(),
  getQueryPredictions: jest.fn(),
  textSearch: jest.fn(),
};

// Mock para AutocompleteSessionToken
export const mockAutocompleteSessionToken = jest.fn(() => ({
  toString: () => 'mock-session-token'
}));

// Mock para Google Maps API global
export const setupGoogleMapsMocks = () => {
  // Mock global google object
  global.google = {
    maps: {
      places: {
        PlacesService: jest.fn(() => mockPlacesService),
        AutocompleteSessionToken: mockAutocompleteSessionToken,
        PlacesServiceStatus: {
          OK: 'OK',
          ZERO_RESULTS: 'ZERO_RESULTS',
          OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
          REQUEST_DENIED: 'REQUEST_DENIED',
          INVALID_REQUEST: 'INVALID_REQUEST',
          NOT_FOUND: 'NOT_FOUND',
        },
        PlaceDetailsRequest: {},
        AutocompletePrediction: {},
        QueryAutocompletePrediction: {},
      },
      Geocoder: jest.fn(() => ({
        geocode: jest.fn(),
      })),
      GeocoderStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
        REQUEST_DENIED: 'REQUEST_DENIED',
        INVALID_REQUEST: 'INVALID_REQUEST',
      },
      Map: jest.fn(() => ({
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        getCenter: jest.fn(),
        getZoom: jest.fn(),
      })),
      LatLng: jest.fn((lat, lng) => ({ lat: () => lat, lng: () => lng })),
      LatLngBounds: jest.fn(() => ({
        extend: jest.fn(),
        contains: jest.fn(),
        getNorthEast: jest.fn(),
        getSouthWest: jest.fn(),
      })),
    },
  } as any;
};

// Mock responses para Places API
export const mockPlacesPredictions = [
  {
    description: 'Madrid, España',
    place_id: 'ChIJgTwKgJcpQg0RaSKMYcHeNsQ',
    reference: 'mock-reference-1',
    structured_formatting: {
      main_text: 'Madrid',
      secondary_text: 'España',
    },
    terms: [
      { offset: 0, value: 'Madrid' },
      { offset: 8, value: 'España' },
    ],
    types: ['locality', 'political'],
  },
  {
    description: 'Barcelona, España',
    place_id: 'ChIJ5TCOcRaYpBIRCmZHTz37sEQ',
    reference: 'mock-reference-2',
    structured_formatting: {
      main_text: 'Barcelona',
      secondary_text: 'España',
    },
    terms: [
      { offset: 0, value: 'Barcelona' },
      { offset: 11, value: 'España' },
    ],
    types: ['locality', 'political'],
  },
];

export const mockPlaceDetails = {
  place_id: 'ChIJgTwKgJcpQg0RaSKMYcHeNsQ',
  name: 'Madrid',
  formatted_address: 'Madrid, España',
  geometry: {
    location: {
      lat: () => 40.4167754,
      lng: () => -3.7037902,
    },
    bounds: {
      northeast: { lat: () => 40.5148, lng: () => -3.5155 },
      southwest: { lat: () => 40.3119, lng: () => -3.8472 },
    },
  },
  address_components: [
    {
      long_name: 'Madrid',
      short_name: 'Madrid',
      types: ['locality', 'political'],
    },
    {
      long_name: 'Comunidad de Madrid',
      short_name: 'MD',
      types: ['administrative_area_level_1', 'political'],
    },
    {
      long_name: 'España',
      short_name: 'ES',
      types: ['country', 'political'],
    },
  ],
  types: ['locality', 'political'],
};

// Helper para configurar respuestas mock de Places API
export const setupPlacesResponse = {
  predictions: (predictions = mockPlacesPredictions) => {
    mockPlacesService.getPlacePredictions.mockImplementationOnce(
      (request, callback) => {
        callback(predictions, global.google.maps.places.PlacesServiceStatus.OK);
      }
    );
  },

  details: (details = mockPlaceDetails) => {
    mockPlacesService.getDetails.mockImplementationOnce(
      (request, callback) => {
        callback(details, global.google.maps.places.PlacesServiceStatus.OK);
      }
    );
  },

  error: (status = 'REQUEST_DENIED') => {
    mockPlacesService.getPlacePredictions.mockImplementationOnce(
      (request, callback) => {
        callback(null, status);
      }
    );
  },

  noResults: () => {
    mockPlacesService.getPlacePredictions.mockImplementationOnce(
      (request, callback) => {
        callback([], global.google.maps.places.PlacesServiceStatus.ZERO_RESULTS);
      }
    );
  },
};

// Helper para resetear todos los mocks de Google Maps
export const resetGoogleMapsMocks = () => {
  Object.values(mockPlacesService).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  if (jest.isMockFunction(mockAutocompleteSessionToken)) {
    mockAutocompleteSessionToken.mockClear();
  }
};

// Configurar mocks automáticamente
setupGoogleMapsMocks();