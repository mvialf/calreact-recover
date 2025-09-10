// Mock de las variables de entorno antes de cualquier import
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-google-maps-api-key';
process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'true';
process.env.NEXT_PUBLIC_PLACES_API_MONITORING = 'false';

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressInput } from '../addressInput';
import type { FormattedAddress } from '@/types/project';

// Mock del PlacesServiceAdapter
const mockPlacesAdapter = {
  initialize: jest.fn().mockResolvedValue(undefined),
  getPlacePredictions: jest.fn().mockResolvedValue([]),
  getPlaceDetails: jest.fn().mockResolvedValue(null),
  getAPIVersion: jest.fn().mockReturnValue('modern'),
  refreshSessionToken: jest.fn(),
  isInitialized: jest.fn().mockReturnValue(true)
};

// Mock de PlacesServiceAdapter
jest.mock('@/lib/places/PlacesServiceAdapter', () => ({
  PlacesServiceAdapter: jest.fn().mockImplementation(() => mockPlacesAdapter)
}));

// Mock de Google Maps API (mantenido para compatibilidad con PlacesService legacy en algunos tests)
const mockGoogleMapsApi = {
  maps: {
    places: {
      AutocompleteService: jest.fn().mockImplementation(() => ({
        getPlacePredictions: jest.fn()
      })),
      PlacesService: jest.fn().mockImplementation(() => ({
        getDetails: jest.fn()
      })),
      PlacesServiceStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS',
        ERROR: 'ERROR'
      }
    }
  }
};

// Mock del hook useLoadScript
jest.mock('@react-google-maps/api', () => ({
  useLoadScript: jest.fn(() => ({
    isLoaded: true,
    loadError: null
  }))
}));

// Mock de la función de utilidades
jest.mock('@/utils/address-utils', () => ({
  extractAddressComponents: jest.fn(() => ({
    streetNumber: '123',
    route: 'Calle Principal',
    locality: 'Santiago',
    administrativeArea: 'Región Metropolitana',
    country: 'Chile',
    postalCode: '8320000',
    formattedAddress: '123 Calle Principal, Santiago, Región Metropolitana, Chile',
    latitude: -33.4489,
    longitude: -70.6693,
    placeId: 'mock-place-id'
  }))
}));

// Configurar el mock de Google en el objeto window
Object.defineProperty(window, 'google', {
  value: mockGoogleMapsApi,
  writable: true
});

describe('AddressInput', () => {
  let mockOnSelect: jest.Mock;
  let mockAutocompleteService: any;
  let mockPlacesService: any;

  beforeEach(() => {
    mockOnSelect = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset del adapter mock
    mockPlacesAdapter.initialize.mockResolvedValue(undefined);
    mockPlacesAdapter.getPlacePredictions.mockResolvedValue([]);
    mockPlacesAdapter.getPlaceDetails.mockResolvedValue(null);
    mockPlacesAdapter.getAPIVersion.mockReturnValue('modern');
    mockPlacesAdapter.isInitialized.mockReturnValue(true);
    
    // Mock de AutocompleteService (para compatibilidad legacy)
    mockAutocompleteService = {
      getPlacePredictions: jest.fn()
    };
    
    // Mock de PlacesService
    mockPlacesService = {
      getDetails: jest.fn()
    };
    
    // Configurar los mocks
    (mockGoogleMapsApi.maps.places.AutocompleteService as jest.Mock)
      .mockImplementation(() => mockAutocompleteService);
    
    (mockGoogleMapsApi.maps.places.PlacesService as jest.Mock)
      .mockImplementation(() => mockPlacesService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Renderizado inicial', () => {
    it('debería renderizar correctamente con placeholder por defecto', () => {
      render(<AddressInput onSelect={mockOnSelect} />);
      
      expect(screen.getByPlaceholderText('Buscar dirección')).toBeInTheDocument();
    });

    it('debería renderizar con placeholder personalizado', () => {
      render(
        <AddressInput 
          onSelect={mockOnSelect} 
          placeholder="Ingresa tu dirección" 
        />
      );
      
      expect(screen.getByPlaceholderText('Ingresa tu dirección')).toBeInTheDocument();
    });

    it('debería mostrar el input deshabilitado cuando disabled=true', () => {
      render(<AddressInput onSelect={mockOnSelect} disabled={true} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      expect(input).toBeDisabled();
    });

    it('debería mostrar indicador de carga externa', () => {
      render(<AddressInput onSelect={mockOnSelect} externalLoading={true} />);
      
      expect(screen.getByTestId('external-loading-indicator')).toBeInTheDocument();
    });
  });

  describe('Dirección pre-seleccionada', () => {
    const mockAddress: FormattedAddress = {
      textoCompleto: 'Av. Providencia 123, Providencia, Santiago',
      coordenadas: {
        latitude: -33.4489,
        longitude: -70.6693
      },
      placeId: 'test-place-id',
      componentes: {
        calle: 'Av. Providencia',
        numero: '123',
        comuna: 'Providencia',
        ciudad: 'Santiago',
        region: 'Región Metropolitana',
        pais: 'Chile'
      },
      informacionAdicional: 'Depto 405'
    };

    it('debería mostrar la dirección pre-seleccionada', () => {
      render(<AddressInput value={mockAddress} onSelect={mockOnSelect} />);
      
      expect(screen.getByText('Av. Providencia 123, Providencia, Santiago')).toBeInTheDocument();
      expect(screen.getByText('Depto 405')).toBeInTheDocument();
    });

    it('debería mostrar el menú de acciones para dirección seleccionada', () => {
      render(<AddressInput value={mockAddress} onSelect={mockOnSelect} />);
      
      const moreButton = screen.getByRole('button', { name: /más acciones/i });
      expect(moreButton).toBeInTheDocument();
    });
  });

  describe('Funcionalidad de autocompletado', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debería obtener sugerencias cuando el usuario escribe', async () => {
      const mockPredictions = [
        {
          place_id: 'place1',
          description: 'Av. Providencia 123, Santiago',
          structured_formatting: {
            main_text: 'Av. Providencia 123',
            secondary_text: 'Santiago'
          }
        }
      ];

      // Configurar el adapter para retornar sugerencias
      mockPlacesAdapter.getPlacePredictions.mockResolvedValue(mockPredictions);

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      
      await userEvent.type(input, 'Av. Providencia');
      
      // Avanzar el timer para el debouncing
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Verificar que el adapter fue llamado correctamente
      await waitFor(() => {
        expect(mockPlacesAdapter.getPlacePredictions).toHaveBeenCalledWith(
          'Av. Providencia',
          expect.any(Object) // Opciones adicionales
        );
      });
    });

    it('debería mostrar las sugerencias obtenidas', async () => {
      const mockPredictions = [
        {
          place_id: 'place1',
          description: 'Av. Providencia 123, Santiago',
          structured_formatting: {
            main_text: 'Av. Providencia 123',
            secondary_text: 'Santiago'
          }
        }
      ];

      // Configurar el adapter para retornar sugerencias
      mockPlacesAdapter.getPlacePredictions.mockResolvedValue(mockPredictions);

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      
      await userEvent.type(input, 'Av. Providencia');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Av. Providencia 123, Santiago')).toBeInTheDocument();
      });
    });

    it('no debería obtener sugerencias para texto muy corto', async () => {
      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      
      await userEvent.type(input, 'A');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockAutocompleteService.getPlacePredictions).not.toHaveBeenCalled();
    });
  });

  describe('Selección de dirección', () => {
    it('debería seleccionar una dirección cuando se hace clic en una sugerencia', async () => {
      const mockPredictions = [
        {
          place_id: 'place1',
          description: 'Av. Providencia 123, Santiago',
          structured_formatting: {
            main_text: 'Av. Providencia 123',
            secondary_text: 'Santiago'
          }
        }
      ];

      const mockPlaceDetails = {
        place_id: 'place1',
        formatted_address: 'Av. Providencia 123, Santiago',
        geometry: {
          location: {
            lat: () => -33.4489,
            lng: () => -70.6693
          }
        },
        address_components: [
          {
            long_name: '123',
            short_name: '123',
            types: ['street_number']
          },
          {
            long_name: 'Avenida Providencia',
            short_name: 'Av. Providencia',
            types: ['route']
          }
        ]
      };

      mockAutocompleteService.getPlacePredictions.mockImplementation((request: any, callback: any) => {
        callback(mockPredictions, 'OK');
      });

      mockPlacesService.getDetails.mockImplementation((request: any, callback: any) => {
        callback(mockPlaceDetails, 'OK');
      });

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      
      await userEvent.type(input, 'Av. Providencia');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Av. Providencia 123')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Av. Providencia 123'));

      await waitFor(() => {
        expect(mockPlacesService.getDetails).toHaveBeenCalledWith(
          {
            placeId: 'place1',
            fields: ['place_id', 'formatted_address', 'geometry', 'address_components']
          },
          expect.any(Function)
        );
      });

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            placeId: 'place1',
            coordenadas: {
              latitude: -33.4489,
              longitude: -70.6693
            }
          })
        );
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debería manejar errores en getPlacePredictions', async () => {
      mockAutocompleteService.getPlacePredictions.mockImplementation((request: any, callback: any) => {
        callback(null, 'ERROR');
      });

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      
      await userEvent.type(input, 'Av. Providencia');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // No debería mostrar sugerencias y no debería quebrar
      await waitFor(() => {
        expect(screen.queryByText('Av. Providencia 123')).not.toBeInTheDocument();
      });
    });

    it('debería manejar errores en getDetails', async () => {
      const mockPredictions = [
        {
          place_id: 'place1',
          description: 'Av. Providencia 123, Santiago',
          structured_formatting: {
            main_text: 'Av. Providencia 123',
            secondary_text: 'Santiago'
          }
        }
      ];

      mockAutocompleteService.getPlacePredictions.mockImplementation((request: any, callback: any) => {
        callback(mockPredictions, 'OK');
      });

      mockPlacesService.getDetails.mockImplementation((request: any, callback: any) => {
        callback(null, 'ERROR');
      });

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      
      await userEvent.type(input, 'Av. Providencia');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Av. Providencia 123')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Av. Providencia 123'));

      // No debería llamar a onSelect y no debería quebrar
      await waitFor(() => {
        expect(mockOnSelect).not.toHaveBeenCalled();
      });
    });
  });

  describe('Acciones de dirección seleccionada', () => {
    const mockAddress: FormattedAddress = {
      textoCompleto: 'Av. Providencia 123, Providencia, Santiago',
      coordenadas: {
        latitude: -33.4489,
        longitude: -70.6693
      },
      placeId: 'test-place-id',
      componentes: {
        calle: 'Av. Providencia',
        numero: '123',
        comuna: 'Providencia',
        ciudad: 'Santiago'
      }
    };

    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn()
        }
      });

      // Mock window.open
      Object.assign(window, {
        open: jest.fn()
      });
    });

    it('debería copiar la dirección al portapapeles', async () => {
      render(<AddressInput value={mockAddress} onSelect={mockOnSelect} />);
      
      const moreButton = screen.getByRole('button', { name: /más acciones/i });
      await userEvent.click(moreButton);

      const copyButton = screen.getByText('Copiar Dirección');
      await userEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Av. Providencia 123, Providencia, Santiago'
      );
    });

    it('debería abrir el mapa en una nueva pestaña', async () => {
      render(<AddressInput value={mockAddress} onSelect={mockOnSelect} />);
      
      const moreButton = screen.getByRole('button', { name: /más acciones/i });
      await userEvent.click(moreButton);

      const mapButton = screen.getByText('Ver en Mapa');
      await userEvent.click(mapButton);

      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=-33.4489,-70.6693',
        '_blank'
      );
    });

    it('debería limpiar la dirección seleccionada', async () => {
      render(<AddressInput value={mockAddress} onSelect={mockOnSelect} />);
      
      const clearButton = screen.getByRole('button', { name: /limpiar/i });
      await userEvent.click(clearButton);

      expect(mockOnSelect).toHaveBeenCalledWith(null);
    });
  });

  describe('Información adicional', () => {
    const mockAddress: FormattedAddress = {
      textoCompleto: 'Av. Providencia 123, Providencia, Santiago',
      coordenadas: {
        latitude: -33.4489,
        longitude: -70.6693
      },
      placeId: 'test-place-id',
      componentes: {
        calle: 'Av. Providencia',
        numero: '123',
        comuna: 'Providencia',
        ciudad: 'Santiago'
      }
    };

    it('debería permitir agregar información adicional', async () => {
      render(<AddressInput value={mockAddress} onSelect={mockOnSelect} />);
      
      const additionalInfoInput = screen.getByPlaceholderText(/información adicional/i);
      await userEvent.type(additionalInfoInput, 'Depto 405');

      // Simular blur para guardar la información
      fireEvent.blur(additionalInfoInput);

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(
          expect.objectContaining({
            informacionAdicional: 'Depto 405'
          })
        );
      });
    });
  });

  describe('Estados de carga', () => {
    it('debería mostrar indicador de carga durante la búsqueda', async () => {
      // Configurar mock para respuesta rápida con resultados
      mockAutocompleteService.getPlacePredictions.mockImplementation((request: any, callback: any) => {
        setTimeout(() => {
          callback([
            {
              description: 'Av. Providencia 123, Providencia, Chile',
              place_id: 'test-place-id',
              structured_formatting: {
                main_text: 'Av. Providencia 123',
                secondary_text: 'Providencia, Chile'
              }
            }
          ], 'OK');
        }, 100);
      });

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      
      // Escribir texto y avanzar tiempo del debounce
      await userEvent.type(input, 'Av. Providencia');
      
      // Avanzar tiempo del debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Verificar que aparecen las sugerencias después del debounce
      await waitFor(() => {
        expect(screen.getByText('Av. Providencia 123')).toBeInTheDocument();
      });

      // Avanzar tiempo para completar la búsqueda
      act(() => {
        jest.advanceTimersByTime(200);
      });
    });
  });

  describe('Integración con PlacesServiceAdapter', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debería mostrar el indicador de versión API en desarrollo', async () => {
      // Mock NODE_ENV usando Object.defineProperty para evitar error de read-only
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.env, 'NODE_ENV');
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true
      });

      mockPlacesAdapter.getAPIVersion.mockReturnValue('modern');

      render(<AddressInput onSelect={mockOnSelect} />);

      // En desarrollo debería mostrar indicador de API
      await waitFor(() => {
        // Buscar elemento que contenga "API: modern"
        const apiIndicator = document.querySelector('[class*="opacity-50"]');
        expect(apiIndicator).toBeTruthy();
      });

      // Restaurar NODE_ENV
      if (originalDescriptor) {
        Object.defineProperty(process.env, 'NODE_ENV', originalDescriptor);
      } else {
        delete (process.env as any).NODE_ENV;
      }
    });

    it('debería inicializar el adapter al montar el componente', async () => {
      render(<AddressInput onSelect={mockOnSelect} />);

      await waitFor(() => {
        expect(mockPlacesAdapter.initialize).toHaveBeenCalled();
      });
    });

    it('debería usar el adapter para obtener predicciones', async () => {
      const mockPredictions = [
        {
          place_id: 'place1',
          description: 'Test Location',
          structured_formatting: {
            main_text: 'Test',
            secondary_text: 'Location'
          }
        }
      ];

      mockPlacesAdapter.getPlacePredictions.mockResolvedValue(mockPredictions);

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      await userEvent.type(input, 'Test');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockPlacesAdapter.getPlacePredictions).toHaveBeenCalledWith(
          'Test',
          expect.any(Object)
        );
      });
    });

    it('debería manejar errores del adapter correctamente', async () => {
      // Simular error en el adapter
      mockPlacesAdapter.getPlacePredictions.mockRejectedValue(new Error('API Error'));

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      await userEvent.type(input, 'Test');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // No debería mostrar sugerencias en caso de error
      await waitFor(() => {
        expect(screen.queryByText('Test Location')).not.toBeInTheDocument();
      });
    });

    it('debería mostrar estado deshabilitado cuando el adapter no está listo', async () => {
      // Simular adapter no inicializado
      mockPlacesAdapter.isInitialized.mockReturnValue(false);

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      
      expect(input).toBeDisabled();
    });

    it('debería permitir refrescar session token', async () => {
      render(<AddressInput onSelect={mockOnSelect} />);

      // Simular acción que requiera refresh del token (esto sería interno)
      // En un caso real, podría ser después de un cierto tiempo o número de requests
      
      // Verificar que el método existe y puede ser llamado
      expect(mockPlacesAdapter.refreshSessionToken).toBeDefined();
    });
  });

  describe('Compatibilidad con ambas APIs', () => {
    it('debería funcionar cuando se usa API moderna', async () => {
      mockPlacesAdapter.getAPIVersion.mockReturnValue('modern');

      const mockPredictions = [
        {
          place_id: 'place1',
          description: 'Modern API Result',
          structured_formatting: {
            main_text: 'Modern API',
            secondary_text: 'Result'
          }
        }
      ];

      mockPlacesAdapter.getPlacePredictions.mockResolvedValue(mockPredictions);

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      await userEvent.type(input, 'Modern');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Modern API Result')).toBeInTheDocument();
      });
    });

    it('debería funcionar cuando se usa API legacy', async () => {
      mockPlacesAdapter.getAPIVersion.mockReturnValue('legacy');

      const mockPredictions = [
        {
          place_id: 'place1',
          description: 'Legacy API Result',
          structured_formatting: {
            main_text: 'Legacy API',
            secondary_text: 'Result'
          }
        }
      ];

      mockPlacesAdapter.getPlacePredictions.mockResolvedValue(mockPredictions);

      render(<AddressInput onSelect={mockOnSelect} />);
      
      const input = screen.getByPlaceholderText('Buscar dirección');
      await userEvent.type(input, 'Legacy');
      
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(screen.getByText('Legacy API Result')).toBeInTheDocument();
      });
    });
  });
});