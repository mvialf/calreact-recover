/**
 * Integration Test - ProjectEventForm Lean Mode
 *
 * Verifica flujo completo end-to-end en modo lean:
 * - Rendering de compound component completo
 * - Interacción usuario con todos los campos
 * - Submit flow con validación
 * - Override fields behavior
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectEventForm, FormErrorBoundary } from '../index';
import { createMockProject } from '@/__tests__/helpers/test-data-factory';
import type { ProjectEventFormValues } from '../types';

describe('ProjectEventForm - Lean Mode Integration', () => {
  const mockProject = createMockProject({
    projectNumber: 'PRJ-001',
    clientName: 'Cliente Test',
    status: 'montaje',
    description: 'Proyecto de prueba',
    phone: '+34 666 777 888',
  });

  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete form flow', () => {
    it('debe renderizar formulario completo en modo lean', () => {
      render(
        <ProjectEventForm.Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <ProjectEventForm.ProjectInfo project={mockProject} />
          <ProjectEventForm.BaseFields />
          <ProjectEventForm.OverrideFields />
        </ProjectEventForm.Container>
      );

      // ProjectInfo card debe estar presente
      expect(screen.getByText('PRJ-001')).toBeInTheDocument();
      expect(screen.getByText('Cliente Test')).toBeInTheDocument();

      // BaseFields deben estar presentes
      expect(screen.getByLabelText(/Fecha del Evento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notas del Evento/i)).toBeInTheDocument();

      // OverrideFields deben estar presentes (lean mode)
      expect(screen.getByLabelText(/Descripción Personalizada/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono Personalizado/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Estado Personalizado/i)).toBeInTheDocument();
    });

    it('debe permitir completar y enviar formulario lean', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <ProjectEventForm.BaseFields />
          <ProjectEventForm.OverrideFields />
          <button type="submit" form="event-form">Submit</button>
        </ProjectEventForm.Container>
      );

      // Completar fecha del evento
      const dateInput = screen.getByLabelText(/Fecha del Evento/i);
      await user.clear(dateInput);
      await user.type(dateInput, '2024-07-15');

      // Agregar notas del evento
      const notesInput = screen.getByLabelText(/Notas del Evento/i);
      await user.type(notesInput, 'Notas de integración del evento');

      // Agregar descripción personalizada
      const descInput = screen.getByLabelText(/Descripción Personalizada/i);
      await user.type(descInput, 'Descripción custom lean mode');

      // Agregar teléfono personalizado
      const phoneInput = screen.getByLabelText(/Teléfono Personalizado/i);
      await user.type(phoneInput, '+34 600 111 222');

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
        eventNotes: 'Notas de integración del evento',
        customDescription: 'Descripción custom lean mode',
        customPhone: '+34 600 111 222',
      });
    });
  });

  describe('Override fields - Lean mode specific', () => {
    it('debe usar customStatus en lugar de status full mode', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <ProjectEventForm.OverrideFields />
          <button type="submit" form="event-form">Submit</button>
        </ProjectEventForm.Container>
      );

      // Verificar que existe customStatus select
      const statusSelect = screen.getByLabelText(/Estado Personalizado/i);
      expect(statusSelect).toBeInTheDocument();

      // Submit formulario
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });

      // Verificar que customStatus está en los datos
      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData).toHaveProperty('customStatus');
      expect(submittedData).not.toHaveProperty('status'); // Full mode field
    });

    it('debe permitir seleccionar opción "Usar del Proyecto"', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <ProjectEventForm.OverrideFields />
        </ProjectEventForm.Container>
      );

      // El select debe mostrar la opción del proyecto
      expect(screen.getByText(/Usar del Proyecto:/i)).toBeInTheDocument();
    });
  });

  describe('Validation and error handling', () => {
    it('debe validar fecha requerida', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
        >
          <ProjectEventForm.BaseFields />
          <button type="submit" form="event-form">Submit</button>
        </ProjectEventForm.Container>
      );

      // Limpiar fecha (campo requerido)
      const dateInput = screen.getByLabelText(/Fecha del Evento/i);
      await user.clear(dateInput);

      // Intentar submit
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      await user.click(submitButton);

      // onSubmit NO debe ser llamado por validación fallida
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Disabled state propagation', () => {
    it('debe deshabilitar todos los campos cuando disabled=true', () => {
      render(
        <ProjectEventForm.Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
          disabled={true}
        >
          <ProjectEventForm.BaseFields />
          <ProjectEventForm.OverrideFields />
        </ProjectEventForm.Container>
      );

      // Todos los inputs deben estar disabled
      expect(screen.getByLabelText(/Fecha del Evento/i)).toBeDisabled();
      expect(screen.getByLabelText(/Notas del Evento/i)).toBeDisabled();
      expect(screen.getByLabelText(/Descripción Personalizada/i)).toBeDisabled();
      expect(screen.getByLabelText(/Teléfono Personalizado/i)).toBeDisabled();
      expect(screen.getByLabelText(/Estado Personalizado/i)).toBeDisabled();
    });
  });

  describe('InitialData behavior', () => {
    it('debe inicializar formulario con initialData', () => {
      const initialData: Partial<ProjectEventFormValues> = {
        eventDate: new Date('2024-08-01'),
        eventNotes: 'Notas iniciales',
        customDescription: 'Descripción inicial',
        customPhone: '+34 555 444 333',
        customStatus: 'montaje',
      };

      render(
        <ProjectEventForm.Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        >
          <ProjectEventForm.BaseFields />
          <ProjectEventForm.OverrideFields />
        </ProjectEventForm.Container>
      );

      // Verificar que campos tienen valores iniciales
      expect(screen.getByLabelText(/Notas del Evento/i)).toHaveValue('Notas iniciales');
      expect(screen.getByLabelText(/Descripción Personalizada/i)).toHaveValue('Descripción inicial');
      expect(screen.getByLabelText(/Teléfono Personalizado/i)).toHaveValue('+34 555 444 333');
    });
  });

  describe('Error boundary integration', () => {
    it('debe envolver formulario en ErrorBoundary', () => {
      render(
        <FormErrorBoundary formMode="lean">
          <ProjectEventForm.Container
            mode="lean"
            project={mockProject}
            onSubmit={mockOnSubmit}
          >
            <ProjectEventForm.BaseFields />
          </ProjectEventForm.Container>
        </FormErrorBoundary>
      );

      // Formulario debe renderizar normalmente
      expect(screen.getByLabelText(/Fecha del Evento/i)).toBeInTheDocument();
    });
  });
});
