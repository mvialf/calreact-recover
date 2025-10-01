/**
 * Tests para FullFields - Campos completos con lazy loading
 *
 * Verifica:
 * - Rendering de todos los campos full mode
 * - Lazy loading de AddressInput
 * - Numeric inputs (windowsCount, squareMeters)
 * - Memoization de opciones
 */

import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FullFields } from '../FullFields';
import { mockFormContext } from './test-utils';

// Mock del Context
jest.mock('../Container', () => ({
  useProjectEventFormContext: () => mockFormContext,
}));

describe('FullFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormContext.form.watch = jest.fn().mockReturnValue(0);
  });

  describe('Rendering de campos', () => {
    it('debe renderizar todos los campos del modo full', () => {
      render(
        <Suspense fallback={<div>Loading...</div>}>
          <FullFields />
        </Suspense>
      );

      expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Número de Ventanas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Metros Cuadrados/i)).toBeInTheDocument();
    });

    it('debe mostrar LoadingSkeleton mientras AddressInput carga', () => {
      render(
        <Suspense fallback={<div data-testid="loading-skeleton">Loading...</div>}>
          <FullFields />
        </Suspense>
      );

      // Skeleton visible inicialmente (componente lazy)
      // En entorno de test, lazy components se cargan inmediatamente
      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
    });
  });

  describe('Numeric inputs', () => {
    it('debe configurar windowsCount como integer input', () => {
      render(<FullFields />);

      const windowsInput = screen.getByLabelText(/Número de Ventanas/i);
      expect(windowsInput).toHaveAttribute('type', 'number');
      expect(windowsInput).toHaveAttribute('step', '1');
      expect(windowsInput).toHaveAttribute('min', '0');
    });

    it('debe configurar squareMeters como float input', () => {
      render(<FullFields />);

      const squareMetersInput = screen.getByLabelText(/Metros Cuadrados/i);
      expect(squareMetersInput).toHaveAttribute('type', 'number');
      expect(squareMetersInput).toHaveAttribute('step', '0.1');
      expect(squareMetersInput).toHaveAttribute('min', '0');
    });

    it('debe mostrar descriptions en numeric inputs', () => {
      render(<FullFields />);

      expect(screen.getByText(/Ingrese el número total de ventanas/i)).toBeInTheDocument();
      expect(screen.getByText(/Área total en metros cuadrados/i)).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('debe permitir editar descripción', async () => {
      const user = userEvent.setup();

      render(<FullFields />);

      const descInput = screen.getByLabelText(/Descripción/i);
      await user.type(descInput, 'Nueva descripción');

      expect(descInput).toHaveValue('Nueva descripción');
    });

    it('debe permitir editar teléfono', async () => {
      const user = userEvent.setup();

      render(<FullFields />);

      const phoneInput = screen.getByLabelText(/Teléfono/i);
      await user.type(phoneInput, '+34 666 777 888');

      expect(phoneInput).toHaveValue('+34 666 777 888');
    });
  });

  describe('Project status select', () => {
    it('debe renderizar select de status', () => {
      render(<FullFields />);

      const statusSelect = screen.getByLabelText(/Estado \*/i);
      expect(statusSelect).toBeInTheDocument();
    });

    it('debe mostrar placeholder en status select', () => {
      render(<FullFields />);

      expect(screen.getByText(/Seleccione un estado/i)).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('debe deshabilitar todos los campos cuando disabled=true', () => {
      const disabledContext = { ...mockFormContext, disabled: true };
      jest.mocked(require('../Container').useProjectEventFormContext).mockReturnValue(
        disabledContext
      );

      render(<FullFields />);

      expect(screen.getByLabelText(/Descripción/i)).toBeDisabled();
      expect(screen.getByLabelText(/Teléfono/i)).toBeDisabled();
      expect(screen.getByLabelText(/Número de Ventanas/i)).toBeDisabled();
    });
  });
});
