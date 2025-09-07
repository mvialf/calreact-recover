import {
  extractAddressComponents,
  formatAddress,
  isValidAddress,
  createAddressSuggestion,
  type AddressComponents
} from '../address-utils';

describe('address-utils', () => {
  describe('extractAddressComponents', () => {
    const mockGooglePlace = {
      place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      formatted_address: 'Av. Providencia 1234, Providencia, Región Metropolitana, Chile',
      geometry: {
        location: {
          lat: () => -33.4489,
          lng: () => -70.6693
        }
      },
      address_components: [
        {
          long_name: '1234',
          short_name: '1234',
          types: ['street_number']
        },
        {
          long_name: 'Avenida Providencia',
          short_name: 'Av. Providencia',
          types: ['route']
        },
        {
          long_name: 'Providencia',
          short_name: 'Providencia',
          types: ['locality']
        },
        {
          long_name: 'Región Metropolitana',
          short_name: 'RM',
          types: ['administrative_area_level_1']
        },
        {
          long_name: 'Chile',
          short_name: 'CL',
          types: ['country']
        },
        {
          long_name: '7500000',
          short_name: '7500000',
          types: ['postal_code']
        }
      ]
    };

    it('debería extraer correctamente todos los componentes de dirección', () => {
      const result = extractAddressComponents(mockGooglePlace);

      expect(result).toEqual({
        streetNumber: '1234',
        route: 'Avenida Providencia',
        locality: 'Providencia',
        administrativeArea: 'Región Metropolitana',
        country: 'Chile',
        postalCode: '7500000',
        formattedAddress: 'Av. Providencia 1234, Providencia, Región Metropolitana, Chile',
        latitude: -33.4489,
        longitude: -70.6693,
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
      });
    });

    it('debería manejar lugar sin coordenadas', () => {
      const placeWithoutGeometry = {
        ...mockGooglePlace,
        geometry: undefined
      };

      const result = extractAddressComponents(placeWithoutGeometry);

      expect(result.latitude).toBeUndefined();
      expect(result.longitude).toBeUndefined();
      expect(result.streetNumber).toBe('1234');
      expect(result.route).toBe('Avenida Providencia');
    });

    it('debería manejar lugar sin componentes de dirección', () => {
      const placeWithoutComponents = {
        place_id: 'test-place-id',
        formatted_address: 'Dirección básica',
        address_components: []
      };

      const result = extractAddressComponents(placeWithoutComponents);

      expect(result).toEqual({
        formattedAddress: 'Dirección básica',
        placeId: 'test-place-id'
      });
    });

    it('debería manejar lugar con componentes parciales', () => {
      const partialPlace = {
        place_id: 'partial-place-id',
        formatted_address: 'Dirección parcial',
        address_components: [
          {
            long_name: 'Calle Principal',
            short_name: 'Calle Principal',
            types: ['route']
          },
          {
            long_name: 'Santiago',
            short_name: 'Santiago',
            types: ['locality']
          }
        ]
      };

      const result = extractAddressComponents(partialPlace);

      expect(result).toEqual({
        route: 'Calle Principal',
        locality: 'Santiago',
        formattedAddress: 'Dirección parcial',
        placeId: 'partial-place-id'
      });
      expect(result.streetNumber).toBeUndefined();
      expect(result.country).toBeUndefined();
    });

    it('debería manejar diferentes tipos de componentes de dirección', () => {
      const placeWithVariousTypes = {
        place_id: 'various-types-id',
        formatted_address: 'Dirección con varios tipos',
        address_components: [
          {
            long_name: 'Subpremise Value',
            short_name: 'Sub',
            types: ['subpremise'] // Tipo no estándar que debería ser ignorado
          },
          {
            long_name: 'Multiple',
            short_name: 'Mult',
            types: ['route', 'political'] // Múltiples tipos, debería usar el primero
          },
          {
            long_name: 'Calle Test',
            short_name: 'Calle Test',
            types: ['locality'] // Diferente tipo para evitar conflicto
          }
        ]
      };

      const result = extractAddressComponents(placeWithVariousTypes);

      expect(result.route).toBe('Multiple'); // Debería tomar el primer componente de tipo 'route'
      expect(result.locality).toBe('Calle Test');
      expect(result).not.toHaveProperty('subpremise');
    });
  });

  describe('formatAddress', () => {
    it('debería formatear una dirección completa correctamente', () => {
      const components: AddressComponents = {
        streetNumber: '123',
        route: 'Avenida Libertador',
        locality: 'Las Condes',
        administrativeArea: 'Región Metropolitana',
        country: 'Chile',
        postalCode: '7550000'
      };

      const result = formatAddress(components);

      expect(result).toBe('Avenida Libertador 123, Las Condes, Región Metropolitana, Chile, 7550000');
    });

    it('debería formatear dirección sin número de calle', () => {
      const components: AddressComponents = {
        route: 'Calle Principal',
        locality: 'Santiago',
        country: 'Chile'
      };

      const result = formatAddress(components);

      expect(result).toBe('Calle Principal, Santiago, Chile');
    });

    it('debería usar formattedAddress cuando no hay route', () => {
      const components: AddressComponents = {
        formattedAddress: 'Dirección formateada completa',
        locality: 'Santiago',
        country: 'Chile'
      };

      const result = formatAddress(components);

      expect(result).toBe('Dirección formateada completa');
    });

    it('debería formatear dirección parcial', () => {
      const components: AddressComponents = {
        route: 'Calle Básica',
        locality: 'Comuna Test'
      };

      const result = formatAddress(components);

      expect(result).toBe('Calle Básica, Comuna Test');
    });

    it('debería manejar componentes vacíos', () => {
      const components: AddressComponents = {};

      const result = formatAddress(components);

      expect(result).toBe('');
    });

    it('debería priorizar route + streetNumber sobre formattedAddress', () => {
      const components: AddressComponents = {
        streetNumber: '456',
        route: 'Calle Específica',
        formattedAddress: 'Dirección formateada general',
        locality: 'Santiago'
      };

      const result = formatAddress(components);

      expect(result).toBe('Calle Específica 456, Santiago');
    });
  });

  describe('isValidAddress', () => {
    it('debería validar dirección completa como válida', () => {
      const validAddress: AddressComponents = {
        route: 'Avenida Test',
        locality: 'Santiago',
        country: 'Chile'
      };

      expect(isValidAddress(validAddress)).toBe(true);
    });

    it('debería invalidar dirección sin route', () => {
      const invalidAddress: AddressComponents = {
        locality: 'Santiago',
        country: 'Chile'
      };

      expect(isValidAddress(invalidAddress)).toBe(false);
    });

    it('debería invalidar dirección sin locality', () => {
      const invalidAddress: AddressComponents = {
        route: 'Calle Test',
        country: 'Chile'
      };

      expect(isValidAddress(invalidAddress)).toBe(false);
    });

    it('debería invalidar dirección sin country', () => {
      const invalidAddress: AddressComponents = {
        route: 'Calle Test',
        locality: 'Santiago'
      };

      expect(isValidAddress(invalidAddress)).toBe(false);
    });

    it('debería manejar dirección completamente vacía', () => {
      const emptyAddress: AddressComponents = {};

      expect(isValidAddress(emptyAddress)).toBe(false);
    });

    it('debería validar dirección con componentes adicionales', () => {
      const addressWithExtras: AddressComponents = {
        streetNumber: '123',
        route: 'Avenida Principal',
        locality: 'Las Condes',
        administrativeArea: 'RM',
        country: 'Chile',
        postalCode: '7550000'
      };

      expect(isValidAddress(addressWithExtras)).toBe(true);
    });
  });

  describe('createAddressSuggestion', () => {
    const mockGooglePrediction = {
      description: 'Av. Providencia 1234, Providencia, Región Metropolitana, Chile',
      place_id: 'ChIJTest123456',
      structured_formatting: {
        main_text: 'Av. Providencia 1234',
        secondary_text: 'Providencia, Región Metropolitana, Chile'
      },
      terms: [
        { offset: 0, value: 'Av. Providencia 1234' },
        { offset: 22, value: 'Providencia' },
        { offset: 35, value: 'Región Metropolitana' },
        { offset: 57, value: 'Chile' }
      ],
      types: ['street_address', 'geocode']
    };

    it('debería crear sugerencia correctamente desde predicción de Google', () => {
      const result = createAddressSuggestion(mockGooglePrediction);

      expect(result).toEqual({
        id: 'ChIJTest123456',
        description: 'Av. Providencia 1234, Providencia, Región Metropolitana, Chile',
        mainText: 'Av. Providencia 1234',
        secondaryText: 'Providencia, Región Metropolitana, Chile',
        placeId: 'ChIJTest123456',
        structuredFormatting: {
          mainText: 'Av. Providencia 1234',
          secondaryText: 'Providencia, Región Metropolitana, Chile'
        },
        terms: [
          { offset: 0, value: 'Av. Providencia 1234' },
          { offset: 22, value: 'Providencia' },
          { offset: 35, value: 'Región Metropolitana' },
          { offset: 57, value: 'Chile' }
        ],
        types: ['street_address', 'geocode']
      });
    });

    it('debería manejar predicción sin términos', () => {
      const predictionWithoutTerms = {
        ...mockGooglePrediction,
        terms: []
      };

      const result = createAddressSuggestion(predictionWithoutTerms);

      expect(result.mainText).toBe('');
      expect(result.secondaryText).toBe('');
      expect(result.terms).toEqual([]);
    });

    it('debería manejar predicción con un solo término', () => {
      const predictionWithSingleTerm = {
        ...mockGooglePrediction,
        terms: [
          { offset: 0, value: 'Santiago' }
        ]
      };

      const result = createAddressSuggestion(predictionWithSingleTerm);

      expect(result.mainText).toBe('Santiago');
      expect(result.secondaryText).toBe('');
    });

    it('debería manejar predicción sin tipos', () => {
      const predictionWithoutTypes = {
        ...mockGooglePrediction,
        types: undefined
      };

      const result = createAddressSuggestion(predictionWithoutTypes as any);

      expect(result.types).toEqual([]);
    });

    it('debería crear secondary text correctamente con múltiples términos', () => {
      const predictionWithManyTerms = {
        ...mockGooglePrediction,
        terms: [
          { offset: 0, value: 'Calle Principal 123' },
          { offset: 20, value: 'Las Condes' },
          { offset: 32, value: 'Santiago' },
          { offset: 42, value: 'Región Metropolitana' },
          { offset: 64, value: 'Chile' }
        ]
      };

      const result = createAddressSuggestion(predictionWithManyTerms);

      expect(result.mainText).toBe('Calle Principal 123');
      expect(result.secondaryText).toBe('Las Condes, Santiago, Región Metropolitana, Chile');
    });

    it('debería preservar arrays originales sin mutación', () => {
      const originalTerms = [
        { offset: 0, value: 'Test Address' },
        { offset: 13, value: 'Test City' }
      ];
      const originalTypes = ['street_address', 'geocode'];

      const predictionWithArrays = {
        ...mockGooglePrediction,
        terms: originalTerms,
        types: originalTypes
      };

      const result = createAddressSuggestion(predictionWithArrays);

      // Verificar que los arrays originales no fueron modificados
      expect(originalTerms).toEqual([
        { offset: 0, value: 'Test Address' },
        { offset: 13, value: 'Test City' }
      ]);
      expect(originalTypes).toEqual(['street_address', 'geocode']);

      // Verificar que el resultado contiene copias
      expect(result.terms).not.toBe(originalTerms);
      expect(result.types).not.toBe(originalTypes);
      expect(result.terms).toEqual(originalTerms);
      expect(result.types).toEqual(originalTypes);
    });
  });

  describe('Integración entre funciones', () => {
    it('debería procesar flujo completo: Google Place -> componentes -> formato -> validación', () => {
      const mockGooglePlace = {
        place_id: 'integration-test-id',
        formatted_address: 'Calle Test 456, Santiago, Chile',
        geometry: {
          location: {
            lat: () => -33.4372,
            lng: () => -70.6506
          }
        },
        address_components: [
          {
            long_name: '456',
            short_name: '456',
            types: ['street_number']
          },
          {
            long_name: 'Calle Test',
            short_name: 'Calle Test',
            types: ['route']
          },
          {
            long_name: 'Santiago',
            short_name: 'Santiago',
            types: ['locality']
          },
          {
            long_name: 'Chile',
            short_name: 'CL',
            types: ['country']
          }
        ]
      };

      // Extraer componentes
      const components = extractAddressComponents(mockGooglePlace);
      
      // Validar
      const isValid = isValidAddress(components);
      expect(isValid).toBe(true);

      // Formatear
      const formattedAddress = formatAddress(components);
      expect(formattedAddress).toBe('Calle Test 456, Santiago, Chile');

      // Verificar coordenadas
      expect(components.latitude).toBe(-33.4372);
      expect(components.longitude).toBe(-70.6506);
    });

    it('debería manejar flujo con dirección inválida', () => {
      const invalidGooglePlace = {
        place_id: 'invalid-place',
        formatted_address: 'Dirección incompleta',
        address_components: [
          {
            long_name: 'Solo Localidad',
            short_name: 'Solo Localidad',
            types: ['locality']
          }
        ]
      };

      const components = extractAddressComponents(invalidGooglePlace);
      const isValid = isValidAddress(components);
      
      expect(isValid).toBe(false);
      
      // Aún debería poder formatear usando formattedAddress
      const formatted = formatAddress(components);
      expect(formatted).toBe('Dirección incompleta');
    });
  });
});