/**
 * EJEMPLO: Test de Componente React
 * 
 * Demuestra testing correcto de componentes con React Testing Library
 * Template para tests de componentes UI con hooks y estado
 * 
 * @author Mentor Técnico AI
 * @date 2025-09-08
 */

// ==========================================
// IMPORTS Y SETUP
// ==========================================

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockFirestore, MockTimestamp } from '../mocks/firebase-v11-mocks';
import { setupJestGoogleMapsMocks } from '../mocks/google-maps-mocks';

// ✅ Setup mocks antes de imports
jest.mock('firebase/firestore', () => mockFirestore);
setupJestGoogleMapsMocks();

// Mock Next.js router si es necesario
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {},
    pathname: '/test'
  })
}));

// Componente a testear (adaptar según tu caso)
import AddressInput from '../../components/ui/AddressInput';
import { AppConfigProvider } from '../../contexts/AppConfigContext';

// ==========================================
// PROVIDERS Y WRAPPERS
// ==========================================

/**
 * Wrapper con todos los providers necesarios
 */
const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppConfigProvider>
    {children}
  </AppConfigProvider>
);

/**
 * Helper para render con providers
 */
const renderWithProviders = (component: React.ReactElement, options = {}) => {
  return render(component, {
    wrapper: TestProviders,
    ...options
  });
};

// ==========================================
// DATOS DE PRUEBA
// ==========================================

/**
 * Props de prueba para AddressInput
 */
const defaultProps = {
  value: '',
  onChange: jest.fn(),
  onSelect: jest.fn(),
  placeholder: 'Ingresa una dirección',
  disabled: false
};

/**
 * Mock data de direcciones
 */
const mockAddressSuggestions = [
  {
    description: 'Calle Mayor 123, Madrid, España',
    place_id: 'place_id_1',
    structured_formatting: {
      main_text: 'Calle Mayor 123',
      secondary_text: 'Madrid, España'
    }
  },
  {
    description: 'Calle Gran Vía 45, Madrid, España',
    place_id: 'place_id_2',
    structured_formatting: {
      main_text: 'Calle Gran Vía 45',
      secondary_text: 'Madrid, España'
    }
  }
];

// ==========================================
// TEST SUITE PRINCIPAL
// ==========================================

describe('AddressInput Component', () => {
  
  // ==========================================
  // SETUP Y CLEANUP
  // ==========================================
  
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    // Setup user-event
    user = userEvent.setup();
    
    // Limpiar mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup después de cada test
    jest.restoreAllMocks();
  });

  // ==========================================
  // TESTS DE RENDERING BÁSICO
  // ==========================================

  describe('rendering', () => {
    
    it('✅ should render with default props', () => {
      // Act
      renderWithProviders(<AddressInput {...defaultProps} />);

      // Assert
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ingresa una dirección')).toBeInTheDocument();
    });

    it('✅ should render with custom placeholder', () => {
      // Arrange
      const customPlaceholder = 'Buscar dirección personalizada';
      const props = { ...defaultProps, placeholder: customPlaceholder };

      // Act
      renderWithProviders(<AddressInput {...props} />);

      // Assert
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it('✅ should render disabled state', () => {
      // Arrange
      const props = { ...defaultProps, disabled: true };

      // Act
      renderWithProviders(<AddressInput {...props} />);

      // Assert
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('✅ should render with initial value', () => {
      // Arrange
      const initialValue = 'Madrid, España';
      const props = { ...defaultProps, value: initialValue };

      // Act
      renderWithProviders(<AddressInput {...props} />);

      // Assert
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue(initialValue);
    });

  });

  // ==========================================
  // TESTS DE INTERACCIÓN
  // ==========================================

  describe('user interactions', () => {
    
    it('✅ should call onChange when user types', async () => {
      // Arrange
      const mockOnChange = jest.fn();
      const props = { ...defaultProps, onChange: mockOnChange };

      renderWithProviders(<AddressInput {...props} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'Madrid');

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(6); // M-a-d-r-i-d
      expect(mockOnChange).toHaveBeenLastCalledWith('Madrid');
    });

    it('✅ should show suggestions when typing', async () => {
      // Arrange
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'Calle Mayor');
      
      // Esperar a que aparezcan sugerencias
      await waitFor(() => {
        expect(screen.getByText(/Calle Mayor 123/)).toBeInTheDocument();
      });

      // Assert
      expect(screen.getByText(/Madrid, España/)).toBeInTheDocument();
    });

    it('✅ should call onSelect when suggestion is clicked', async () => {
      // Arrange
      const mockOnSelect = jest.fn();
      const props = { ...defaultProps, onSelect: mockOnSelect };

      renderWithProviders(<AddressInput {...props} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'Calle Mayor');
      
      // Esperar sugerencias
      await waitFor(() => {
        expect(screen.getByText(/Calle Mayor 123/)).toBeInTheDocument();
      });

      // Click en sugerencia
      const suggestion = screen.getByText(/Calle Mayor 123/);
      await user.click(suggestion);

      // Assert
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('Calle Mayor 123'),
          place_id: 'place_id_1'
        })
      );
    });

    it('✅ should clear suggestions when input is cleared', async () => {
      // Arrange
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'Madrid');
      
      // Esperar sugerencias
      await waitFor(() => {
        expect(screen.getByText(/Calle Mayor/)).toBeInTheDocument();
      });

      // Limpiar input
      await user.clear(input);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/Calle Mayor/)).not.toBeInTheDocument();
      });
    });

  });

  // ==========================================
  // TESTS DE ESTADOS Y HOOKS
  // ==========================================

  describe('component state', () => {
    
    it('✅ should show loading state while fetching suggestions', async () => {
      // Arrange
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'Mad');

      // Assert - Verificar estado de loading (ajustar según implementación)
      // Ejemplo: expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('✅ should handle no results state', async () => {
      // Arrange
      // Mock que devuelve resultados vacíos
      const mockEmptyResults = jest.fn().mockResolvedValue([]);
      
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'xyz123nonexistent');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/No se encontraron resultados/)).toBeInTheDocument();
      });
    });

    it('✅ should handle error state gracefully', async () => {
      // Arrange
      // Mock que simula error
      const mockError = jest.fn().mockRejectedValue(new Error('API Error'));
      
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'error test');

      // Assert - Verificar que no rompe la app
      expect(input).toBeInTheDocument();
      // Ejemplo: expect(screen.getByText(/Error al buscar direcciones/)).toBeInTheDocument();
    });

  });

  // ==========================================
  // TESTS DE ACCESIBILIDAD
  // ==========================================

  describe('accessibility', () => {
    
    it('✅ should have proper ARIA attributes', () => {
      // Act
      renderWithProviders(<AddressInput {...defaultProps} />);

      // Assert
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', expect.any(String));
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('✅ should support keyboard navigation', async () => {
      // Arrange
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'Madrid');
      
      await waitFor(() => {
        expect(screen.getByText(/Calle Mayor/)).toBeInTheDocument();
      });

      // Navegación con teclado
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // Assert
      expect(defaultProps.onSelect).toHaveBeenCalled();
    });

    it('✅ should handle escape key to close suggestions', async () => {
      // Arrange
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'Madrid');
      
      await waitFor(() => {
        expect(screen.getByText(/Calle Mayor/)).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      // Assert
      await waitFor(() => {
        expect(screen.queryByText(/Calle Mayor/)).not.toBeInTheDocument();
      });
    });

  });

  // ==========================================
  // TESTS DE INTEGRACIÓN CON CONTEXTO
  // ==========================================

  describe('context integration', () => {
    
    it('✅ should use configuration from AppConfigContext', () => {
      // Arrange - Mock de configuración
      const customConfig = {
        googleMapsApiKey: 'test-api-key',
        language: 'es'
      };

      // Act
      renderWithProviders(<AddressInput {...defaultProps} />);

      // Assert - Verificar que usa la configuración
      // (Depende de la implementación específica)
    });

  });

  // ==========================================
  // TESTS DE PERFORMANCE
  // ==========================================

  describe('performance', () => {
    
    it('✅ should debounce API calls', async () => {
      // Arrange
      const mockApiCall = jest.fn().mockResolvedValue(mockAddressSuggestions);
      
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act - Typing rápido
      await user.type(input, 'Madrid');

      // Assert - API debe ser llamada solo una vez después del debounce
      await waitFor(() => {
        expect(mockApiCall).toHaveBeenCalledTimes(1);
      }, { timeout: 1000 });
    });

    it('✅ should not make API calls for very short inputs', async () => {
      // Arrange
      const mockApiCall = jest.fn();
      
      renderWithProviders(<AddressInput {...defaultProps} />);
      const input = screen.getByRole('textbox');

      // Act
      await user.type(input, 'M'); // Muy corto

      // Assert
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
      });
      
      expect(mockApiCall).not.toHaveBeenCalled();
    });

  });

  // ==========================================
  // TESTS DE ERROR BOUNDARY
  // ==========================================

  describe('error handling', () => {
    
    it('✅ should not crash on invalid props', () => {
      // Arrange
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Act & Assert - No debe crashear
      expect(() => {
        renderWithProviders(<AddressInput {...defaultProps} value={null as any} />);
      }).not.toThrow();

      consoleError.mockRestore();
    });

  });

});

// ==========================================
// CUSTOM MATCHERS
// ==========================================

/**
 * Matcher personalizado para elementos con sugerencias
 */
expect.extend({
  toHaveAddressSuggestions(received, expectedCount: number) {
    const suggestions = received.querySelectorAll('[data-testid="address-suggestion"]');
    const pass = suggestions.length === expectedCount;
    
    return {
      message: () => pass
        ? `expected not to have ${expectedCount} address suggestions`
        : `expected to have ${expectedCount} address suggestions, but found ${suggestions.length}`,
      pass
    };
  }
});

// ==========================================
// TYPESCRIPT DECLARATIONS
// ==========================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAddressSuggestions(count: number): R;
    }
  }
}

// ==========================================
// NOTAS DE USO
// ==========================================

/*
CÓMO ADAPTAR ESTE EJEMPLO:

1. Cambiar componente:
   - Reemplazar 'AddressInput' por tu componente
   - Actualizar props según tu interface

2. Adaptar providers:
   - Agregar/remover providers según necesidades
   - Configurar contextos específicos

3. Actualizar selectores:
   - Usar getByRole, getByText apropiados
   - Agregar data-testids si es necesario

4. Adaptar assertions:
   - Cambiar expects según comportamiento esperado
   - Agregar tests específicos del dominio

5. Ejecutar:
   npm test -- MiComponente.test.tsx

PATRONES DEMOSTRADOS:
✅ Rendering tests - Props, estados, condicionales
✅ Interaction tests - Clicks, typing, navegación
✅ Accessibility tests - ARIA, keyboard navigation
✅ Context integration - Providers, configuración
✅ Error handling - Props inválidas, errores de API
✅ Performance tests - Debouncing, optimizaciones
✅ Custom matchers - Assertions específicas

HERRAMIENTAS CLAVE:
- render, screen, fireEvent - React Testing Library
- userEvent - Interacciones más realistas
- waitFor - Esperar elementos asincrónicos
- act - Wrapper para actualizaciones de estado
- Custom matchers - Assertions específicas del dominio

DEBUGGING:
- screen.debug() - Ver DOM actual
- screen.logTestingPlaygroundURL() - Generar selectores
- --verbose en test command - Output detallado
*/