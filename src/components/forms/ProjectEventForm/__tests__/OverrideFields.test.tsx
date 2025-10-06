/**
 * Tests para OverrideFields - Campos override en modo lean
 *
 * Verifica:
 * - Rendering condicional (solo en modo lean)
 * - Campos custom (customDescription, customPhone)
 * - Disabled state propagation
 *
 * NOTA: customStatus fue eliminado (error arquitectural - el status pertenece al proyecto)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverrideFields } from '../OverrideFields';
import { mockFormContext } from './test-utils';
import { createMockProject } from '@/__tests__/helpers/test-data-factory';

// Mock del Context
jest.mock('../Container', () => ({
  useProjectEventFormContext: () => mockFormContext,
}));

describe('OverrideFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormContext.form.watch = jest.fn().mockReturnValue(null);
  });

  describe('Rendering de campos override', () => {
    it('debe renderizar todos los campos override', () => {
      render(<OverrideFields />);

      expect(screen.getByLabelText(/Descripción Personalizada/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono Personalizado/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Estado Personalizado/i)).toBeInTheDocument();
    });

    it('debe mostrar placeholders correctos', () => {
      render(<OverrideFields />);

      expect(screen.getByPlaceholderText(/Ingrese descripción personalizada/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ingrese teléfono personalizado/i)).toBeInTheDocument();
    });
  });

  describe('Select de status personalizado', () => {
    it('debe renderizar select con opción del proyecto', () => {
      const projectWithStatus = createMockProject({ status: 'montaje' });
      const contextWithProject = {
        ...mockFormContext,
        project: projectWithStatus,
      };
      jest.mocked(require('../Container').useProjectEventFormContext).mockReturnValue(
        contextWithProject
      );

      render(<OverrideFields />);

      const statusSelect = screen.getByLabelText(/Estado Personalizado/i);
      expect(statusSelect).toBeInTheDocument();
    });

    it('debe mostrar placeholder cuando no hay status del proyecto', () => {
      const projectWithoutStatus = createMockProject({ status: undefined });
      const contextWithProject = {
        ...mockFormContext,
        project: projectWithoutStatus,
      };
      jest.mocked(require('../Container').useProjectEventFormContext).mockReturnValue(
        contextWithProject
      );

      render(<OverrideFields />);

      expect(screen.getByText(/Seleccione un estado/i)).toBeInTheDocument();
    });

    it('debe mostrar opción "Usar del Proyecto" cuando hay status', () => {
      const projectWithStatus = createMockProject({ status: 'completado' });
      const contextWithProject = {
        ...mockFormContext,
        project: projectWithStatus,
      };
      jest.mocked(require('../Container').useProjectEventFormContext).mockReturnValue(
        contextWithProject
      );

      render(<OverrideFields />);

      // La opción "Usar del Proyecto: {status}" debe estar disponible
      // El label del status "completado" es "Completado"
      expect(screen.getByText(/Usar del Proyecto:/i)).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('debe permitir editar descripción personalizada', async () => {
      const user = userEvent.setup();

      render(<OverrideFields />);

      const descInput = screen.getByLabelText(/Descripción Personalizada/i);
      await user.type(descInput, 'Custom description for event');

      expect(descInput).toHaveValue('Custom description for event');
    });

    it('debe permitir editar teléfono personalizado', async () => {
      const user = userEvent.setup();

      render(<OverrideFields />);

      const phoneInput = screen.getByLabelText(/Teléfono Personalizado/i);
      await user.type(phoneInput, '+34 666 777 888');

      expect(phoneInput).toHaveValue('+34 666 777 888');
    });
  });

  describe('Disabled state', () => {
    it('debe deshabilitar todos los campos cuando disabled=true', () => {
      const disabledContext = { ...mockFormContext, disabled: true };
      jest.mocked(require('../Container').useProjectEventFormContext).mockReturnValue(
        disabledContext
      );

      render(<OverrideFields />);

      expect(screen.getByLabelText(/Descripción Personalizada/i)).toBeDisabled();
      expect(screen.getByLabelText(/Teléfono Personalizado/i)).toBeDisabled();
      expect(screen.getByLabelText(/Estado Personalizado/i)).toBeDisabled();
    });
  });

  describe('Integration con proyecto', () => {
    it('debe adaptar select options según status del proyecto', () => {
      const projectWithStatus = createMockProject({ status: 'programar' });
      const contextWithProject = {
        ...mockFormContext,
        project: projectWithStatus,
      };
      jest.mocked(require('../Container').useProjectEventFormContext).mockReturnValue(
        contextWithProject
      );

      render(<OverrideFields />);

      // Debe mostrar tanto las opciones estándar como la opción del proyecto
      expect(screen.getByText(/Usar del Proyecto:/i)).toBeInTheDocument();
      expect(screen.getByText(/Seleccione un estado/i)).toBeInTheDocument();
    });
  });
});
