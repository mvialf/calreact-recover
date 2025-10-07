/**
 * Integration Test - ProjectEventForm Full Mode
 *
 * Verifica flujo completo end-to-end en modo full:
 * - Rendering de todos los campos full mode
 * - Lazy loading de AddressInput
 * - Numeric inputs (windowsCount, squareMeters)
 * - ChecklistSection CRUD operations
 * - Submit con datos completos
 */

import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectEventForm } from '../index';
import { createMockProject } from '@/__tests__/helpers/test-data-factory';
import type { ProjectEventFormValues } from '../types';

describe('ProjectEventForm - Full Mode Integration', () => {
  const mockProject = createMockProject({
    projectNumber: 'PRJ-002',
    clientName: 'Cliente Full',
    status: 'fabricación',
    description: 'Proyecto full mode',
    phone: '+34 700 800 900',
  });

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete form flow - Full mode', () => {
    it('debe renderizar formulario completo en modo full', () => {
      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <ProjectEventForm.BaseFields />
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectEventForm.FullFields />
          </Suspense>
        </ProjectEventForm.Container>
      );

      // BaseFields deben estar presentes
      expect(screen.getByLabelText(/Fecha del Evento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notas del Evento/i)).toBeInTheDocument();

      // FullFields deben estar presentes
      expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Estado \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Número de Ventanas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Metros Cuadrados/i)).toBeInTheDocument();
    });

    it('debe permitir completar y enviar formulario full', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <ProjectEventForm.BaseFields />
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectEventForm.FullFields />
          </Suspense>
          <button type="submit" form="event-form">Submit</button>
        </ProjectEventForm.Container>
      );

      // Completar fecha del evento
      const dateInput = screen.getByLabelText(/Fecha del Evento/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2024-08-20');

      // Completar descripción
      const descInput = screen.getByLabelText(/Descripción/i);
      await user.type(descInput, 'Descripción completa full mode');

      // Completar teléfono
      const phoneInput = screen.getByLabelText(/Teléfono/i);
      await user.type(phoneInput, '+34 600 222 333');

      // Completar windowsCount (integer)
      const windowsInput = screen.getByLabelText(/Número de Ventanas/i);
      await user.clear(windowsInput);
      await user.type(windowsInput, '8');

      // Completar squareMeters (float)
      const squareMetersInput = screen.getByLabelText(/Metros Cuadrados/i);
      await user.clear(squareMetersInput);
      await user.type(squareMetersInput, '125.5');

      // Submit formulario
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // Verificar que onSubmit fue llamado
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Verificar estructura de datos enviados
      const submittedData = mockOnSubmit.mock.calls[0][0] as ProjectEventFormValues;
      expect(submittedData).toMatchObject({
        projectId: mockProject.id,
        description: 'Descripción completa full mode',
        phone: '+34 600 222 333',
        windowsCount: 8,
        squareMeters: 125.5,
      });
    });
  });

  describe('Numeric inputs - Full mode specific', () => {
    it('debe manejar windowsCount como integer', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectEventForm.FullFields />
          </Suspense>
          <button type="submit" form="event-form">Submit</button>
        </ProjectEventForm.Container>
      );

      const windowsInput = screen.getByLabelText(/Número de Ventanas/i);

      // Intentar ingresar decimal
      await user.clear(windowsInput);
      await user.type(windowsInput, '5.7');

      // Blur para sanitizar
      await user.tab();

      // Valor debe ser sanitizado a integer
      expect(windowsInput).toHaveValue(5); // Truncado a integer
    });

    it('debe manejar squareMeters como float', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectEventForm.FullFields />
          </Suspense>
          <button type="submit" form="event-form">Submit</button>
        </ProjectEventForm.Container>
      );

      const squareMetersInput = screen.getByLabelText(/Metros Cuadrados/i);

      // Ingresar valor decimal
      await user.clear(squareMetersInput);
      await user.type(squareMetersInput, '85.75');

      // Submit formulario
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // squareMeters debe preservar decimales
      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.squareMeters).toBe(85.75);
    });

    it('debe validar min=0 en numeric inputs', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectEventForm.FullFields />
          </Suspense>
        </ProjectEventForm.Container>
      );

      const windowsInput = screen.getByLabelText(/Número de Ventanas/i);

      // Intentar ingresar valor negativo
      await user.clear(windowsInput);
      await user.type(windowsInput, '-5');

      // Blur para sanitizar
      await user.tab();

      // Valor debe ser clamped a min=0
      expect(windowsInput).toHaveValue(0);
    });
  });

  describe('ChecklistSection integration', () => {
    it('debe permitir agregar items al checklist', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectEventForm.ChecklistSection />
          </Suspense>
        </ProjectEventForm.Container>
      );

      // Verificar botón de agregar item
      const addButton = screen.getByRole('button', { name: /Añadir Item/i });
      expect(addButton).toBeInTheDocument();

      // Agregar item
      await user.click(addButton);

      // Debe aparecer nuevo item en el checklist
      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });
    });

    it('debe incluir checklist en datos de submit', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectEventForm.ChecklistSection />
          </Suspense>
          <button type="submit" form="event-form">Submit</button>
        </ProjectEventForm.Container>
      );

      // Agregar item al checklist
      const addButton = screen.getByRole('button', { name: /Añadir Item/i });
      await user.click(addButton);

      // Submit formulario
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Datos deben incluir checklist
      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData).toHaveProperty('checklist');
      expect(Array.isArray(submittedData.checklist)).toBe(true);
      expect(submittedData.checklist.length).toBeGreaterThan(0);
    });
  });

  describe('Lazy loading behavior', () => {
    it('debe mostrar Suspense fallback mientras carga AddressInput', () => {
      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <Suspense fallback={<div data-testid="loading-address">Loading Address...</div>}>
            <ProjectEventForm.FullFields />
          </Suspense>
        </ProjectEventForm.Container>
      );

      // En entorno de test, componentes lazy cargan inmediatamente
      // Verificar que no hay skeleton visible (componente ya cargado)
      expect(screen.queryByTestId('loading-address')).not.toBeInTheDocument();
    });
  });

  describe('Full mode vs Lean mode fields', () => {
    it('NO debe renderizar OverrideFields en modo full', () => {
      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <ProjectEventForm.FullFields />
        </ProjectEventForm.Container>
      );

      // OverrideFields (lean mode) NO deben estar presentes
      expect(screen.queryByLabelText(/Descripción Personalizada/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Teléfono Personalizado/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Estado Personalizado/i)).not.toBeInTheDocument();

      // FullFields deben estar presentes
      expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    });

    // NOTE: Test de campo 'status' eliminado - campo removido de ProjectEventType
    // para implementar Single Source of Truth (status solo en ProjectType).
    // Ver: docs/technical/eliminar-status-eventos-plan.md
  });

  describe('isSubmitting state', () => {
    it('debe deshabilitar campos cuando isSubmitting=true', () => {
      render(
        <ProjectEventForm.Container
          mode="full"
          project={mockProject}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        >
          <ProjectEventForm.BaseFields />
          <Suspense fallback={<div>Loading...</div>}>
            <ProjectEventForm.FullFields />
          </Suspense>
        </ProjectEventForm.Container>
      );

      // Todos los inputs deben estar disabled
      expect(screen.getByLabelText(/Fecha del Evento/i)).toBeDisabled();
      expect(screen.getByLabelText(/Descripción/i)).toBeDisabled();
      expect(screen.getByLabelText(/Teléfono/i)).toBeDisabled();
      expect(screen.getByLabelText(/Número de Ventanas/i)).toBeDisabled();
    });
  });
});
