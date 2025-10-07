/**
 * Tests para FormErrorBoundary - Error handling del formulario
 *
 * Verifica:
 * - Activación del boundary en errores
 * - Rendering del fallback UI
 * - Reset functionality
 * - Logging de errores
 * - Integración con DialogErrorBoundary
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormErrorBoundary } from '../FormErrorBoundary';
import { errorBoundaryLogger } from '@/lib/logger';

// Mock logger
jest.mock('@/lib/logger', () => ({
  errorBoundaryLogger: {
    error: jest.fn(),
  },
}));

// Componente que lanza error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error from component');
  }
  return <div>Content renders successfully</div>;
};

describe('FormErrorBoundary', () => {
  // Suprimir console.error durante tests de error boundary
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering normal', () => {
    it('debe renderizar children cuando no hay errores', () => {
      render(
        <FormErrorBoundary>
          <div>Normal content</div>
        </FormErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('debe capturar errores y mostrar fallback UI', () => {
      render(
        <FormErrorBoundary>
          <ThrowError />
        </FormErrorBoundary>
      );

      // Verificar que el fallback UI se muestra
      expect(screen.getByText(/Error en el Formulario/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Ha ocurrido un error inesperado al cargar el formulario/i)
      ).toBeInTheDocument();
    });

    it('debe mostrar botón de reintentar en fallback', () => {
      render(
        <FormErrorBoundary>
          <ThrowError />
        </FormErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
    });

    it('debe mostrar ícono de advertencia en fallback', () => {
      render(
        <FormErrorBoundary>
          <ThrowError />
        </FormErrorBoundary>
      );

      // Verificar presencia del ícono AlertTriangle
      const icon = screen.getByText(/Error en el Formulario/i).closest('div')?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Error logging', () => {
    it('debe llamar errorBoundaryLogger cuando ocurre error', async () => {
      render(
        <FormErrorBoundary>
          <ThrowError />
        </FormErrorBoundary>
      );

      await waitFor(() => {
        expect(errorBoundaryLogger.error).toHaveBeenCalledWith(
          'ProjectEventForm error',
          expect.objectContaining({
            error: expect.any(Error),
            errorInfo: expect.any(Object),
            formMode: 'lean',
            timestamp: expect.any(String),
          })
        );
      });
    });

    it('debe loggear formMode en metadata', async () => {
      render(
        <FormErrorBoundary formMode="full">
          <ThrowError />
        </FormErrorBoundary>
      );

      await waitFor(() => {
        expect(errorBoundaryLogger.error).toHaveBeenCalledWith(
          'ProjectEventForm error',
          expect.objectContaining({
            formMode: 'full',
          })
        );
      });
    });
  });

  describe('Reset functionality', () => {
    it('debe resetear boundary y renderizar children al hacer click en Reintentar', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <FormErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </FormErrorBoundary>
      );

      // Verificar fallback UI
      expect(screen.getByText(/Error en el Formulario/i)).toBeInTheDocument();

      // Cambiar estado para no lanzar error
      shouldThrow = false;

      // Click en reintentar
      const retryButton = screen.getByRole('button', { name: /Reintentar/i });
      await user.click(retryButton);

      // Forzar re-render con nuevo estado
      rerender(
        <FormErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </FormErrorBoundary>
      );

      // Verificar que el contenido normal se renderiza
      await waitFor(() => {
        expect(screen.getByText('Content renders successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Integration con DialogErrorBoundary', () => {
    it('debe usar DialogErrorBoundary como wrapper', () => {
      render(
        <FormErrorBoundary>
          <ThrowError />
        </FormErrorBoundary>
      );

      // DialogErrorBoundary wrapper proporciona el fallback
      expect(screen.getByText(/Error en el Formulario/i)).toBeInTheDocument();
    });

    it('debe pasar onError handler a DialogErrorBoundary', async () => {
      render(
        <FormErrorBoundary>
          <ThrowError />
        </FormErrorBoundary>
      );

      await waitFor(() => {
        expect(errorBoundaryLogger.error).toHaveBeenCalled();
      });
    });

    it('debe pasar custom fallback a DialogErrorBoundary', () => {
      render(
        <FormErrorBoundary>
          <ThrowError />
        </FormErrorBoundary>
      );

      // Custom FormFallback debe renderizarse
      expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
      expect(screen.getByText(/Error en el Formulario/i)).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('debe manejar errores sin mensaje', async () => {
      const ThrowErrorWithoutMessage: React.FC = () => {
        throw new Error();
      };

      render(
        <FormErrorBoundary>
          <ThrowErrorWithoutMessage />
        </FormErrorBoundary>
      );

      expect(screen.getByText(/Error en el Formulario/i)).toBeInTheDocument();
    });

    it('debe manejar múltiples resets consecutivos', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <FormErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </FormErrorBoundary>
      );

      // Primer reset
      shouldThrow = false;
      await user.click(screen.getByRole('button', { name: /Reintentar/i }));
      rerender(
        <FormErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </FormErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Content renders successfully')).toBeInTheDocument();
      });

      // Segundo error
      shouldThrow = true;
      rerender(
        <FormErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </FormErrorBoundary>
      );

      // Segundo reset
      shouldThrow = false;
      await user.click(screen.getByRole('button', { name: /Reintentar/i }));
      rerender(
        <FormErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </FormErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText('Content renders successfully')).toBeInTheDocument();
      });
    });
  });
});
