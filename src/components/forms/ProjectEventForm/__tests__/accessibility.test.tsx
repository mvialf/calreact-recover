/**
 * Suite de tests de accesibilidad para ProjectEventForm
 *
 * Valida ARIA attributes, live regions, focus management y keyboard navigation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectEventForm } from '../index';
import type { ProjectType } from '@/types/project';

// Mock del proyecto de prueba
const mockProject: ProjectType = {
  id: 'project-1',
  projectNumber: 'PROJ-001',
  clientId: 'client-1',
  clientName: 'Cliente Test',
  description: 'Descripción del proyecto',
  date: new Date('2025-01-01'),
  subtotal: 1000,
  taxRate: 19,
  total: 1190,
  balance: 1190,
  phone: '+56912345678',
  fullAddress: {
    textoCompleto: 'Calle Test 123',
    placeId: 'place-test-123',
    coordenadas: {
      latitude: -33.4489,
      longitude: -70.6693,
    },
    componentes: {
      calle: 'Calle Test',
      numero: '123',
      comuna: 'Santiago',
      ciudad: 'Santiago',
      region: 'Metropolitana',
      pais: 'Chile',
    },
  },
  status: 'ingresado',
  windowsCount: 10,
  squareMeters: 100,
  uninstallTags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProjectEventForm - Accessibility', () => {
  describe('ARIA Attributes', () => {
    it('debe tener atributos ARIA correctos en campos requeridos', () => {
      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      const eventDateField = screen.getByLabelText(/fecha del evento/i);
      expect(eventDateField).toHaveAttribute('aria-required', 'true');
      expect(eventDateField).toHaveAttribute('aria-invalid', 'false');
      expect(eventDateField).toHaveAttribute('aria-describedby');
    });

    it('debe actualizar aria-invalid cuando hay errores de validación', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={onSubmit}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      // Intentar submit sin completar campo requerido
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const eventDateField = screen.getByLabelText(/fecha del evento/i);
        expect(eventDateField).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('debe tener aria-describedby enlazando con mensajes de error', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={onSubmit}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const eventDateField = screen.getByLabelText(/fecha del evento/i);
        const describedBy = eventDateField.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();

        // Verificar que el ID existe en el DOM
        const errorElement = document.getElementById(describedBy!.split(' ')[0]);
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('debe tener FormDescription con ID único', () => {
      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      const description = screen.getByText(/seleccione la fecha en la que se realizará el evento/i);
      expect(description).toHaveAttribute('id');
      expect(description.getAttribute('id')).toMatch(/field-eventDate-.*-description/);
    });
  });

  describe('Live Regions', () => {
    it('debe tener live region en Container para anuncios', () => {
      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('debe anunciar cuando se agrega un item al checklist', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      const addButton = screen.getByRole('button', { name: /agregar nuevo item al checklist/i });
      await user.click(addButton);

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Item agregado al checklist');
      });
    });

    it('debe anunciar cuando se elimina un item del checklist', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      // Primero agregar un item
      const addButton = screen.getByRole('button', { name: /agregar nuevo item al checklist/i });
      await user.click(addButton);

      // Esperar a que aparezca el item
      await waitFor(() => {
        expect(screen.getByRole('listitem')).toBeInTheDocument();
      });

      // Eliminar el item
      const deleteButton = screen.getByRole('button', { name: /eliminar item 1/i });
      await user.click(deleteButton);

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Item eliminado del checklist');
      });
    });

    it('debe anunciar cuando se marca/desmarca item como completado', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      // Agregar un item
      const addButton = screen.getByRole('button', { name: /agregar nuevo item al checklist/i });
      await user.click(addButton);

      // Marcar como completado
      const checkbox = await screen.findByRole('checkbox', { name: /marcar item 1 como completado/i });
      await user.click(checkbox);

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Item marcado como completo');
      });
    });

    it('debe anunciar éxito en submit (Container)', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={onSubmit}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      // Completar campo requerido
      const eventDateField = screen.getByLabelText(/fecha del evento/i);
      await user.type(eventDateField, '2025-12-31');

      // Submit
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Evento guardado exitosamente');
      });
    });

    it('debe anunciar error en submit (Container)', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockRejectedValue(new Error('Error de red'));

      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={onSubmit}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      const eventDateField = screen.getByLabelText(/fecha del evento/i);
      await user.type(eventDateField, '2025-12-31');

      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Error al guardar el evento');
      });
    });
  });

  describe('Focus Management', () => {
    it('debe enfocar el primer campo al montar (sin initialData)', async () => {
      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      await waitFor(() => {
        const eventDateField = screen.getByLabelText(/fecha del evento/i);
        expect(eventDateField).toHaveFocus();
      });
    });

    it('NO debe auto-enfocar si hay initialData', async () => {
      const initialData = {
        projectId: mockProject.id,
        eventDate: new Date(),
        eventNotes: 'Notas iniciales',
        checklist: [],
      };

      render(
        <ProjectEventForm.Container
          mode="lean"
          project={mockProject}
          initialData={initialData}
          onSubmit={jest.fn()}
        >
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      await waitFor(() => {
        const eventDateField = screen.getByLabelText(/fecha del evento/i);
        expect(eventDateField).not.toHaveFocus();
      });
    });

    it('debe enfocar primer campo con error después de submit fallido', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={onSubmit}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      // Submit sin completar campos
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const eventDateField = screen.getByLabelText(/fecha del evento/i);
        expect(eventDateField).toHaveFocus();
        expect(eventDateField).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Semantic Structure', () => {
    it('debe tener estructura de lista semántica en ChecklistSection', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      const addButton = screen.getByRole('button', { name: /agregar nuevo item al checklist/i });
      await user.click(addButton);

      await waitFor(() => {
        const list = screen.getByRole('list', { name: /items del checklist/i });
        expect(list).toBeInTheDocument();

        const listItem = screen.getByRole('listitem');
        expect(listItem).toBeInTheDocument();
      });
    });

    it('debe tener role="progressbar" con ARIA attributes en barra de progreso', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      // Agregar un item
      const addButton = screen.getByRole('button', { name: /agregar nuevo item al checklist/i });
      await user.click(addButton);

      await waitFor(() => {
        const progressbar = container.querySelector('[role="progressbar"]');
        expect(progressbar).toBeInTheDocument();
        expect(progressbar).toHaveAttribute('aria-valuemin', '0');
        expect(progressbar).toHaveAttribute('aria-valuemax', '100');
        expect(progressbar).toHaveAttribute('aria-valuenow');
        expect(progressbar).toHaveAttribute('aria-label', 'Progreso del checklist');
      });
    });

    it('debe tener role="alert" en mensajes de error', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();

      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={onSubmit}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('id');
      });
    });

    it('debe tener role="status" en estado vacío del checklist', () => {
      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      const emptyState = screen.getByRole('status');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveTextContent(/no hay items en el checklist/i);
    });
  });

  describe('Keyboard Navigation', () => {
    it('debe permitir navegación por Tab en todos los campos', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.BaseFields />
          <ProjectEventForm.OverrideFields />
        </ProjectEventForm.Container>
      );

      const eventDateField = screen.getByLabelText(/fecha del evento/i);
      eventDateField.focus();

      // Tab a siguiente campo
      await user.tab();
      expect(screen.getByLabelText(/notas del evento/i)).toHaveFocus();

      // Tab a siguiente campo
      await user.tab();
      expect(screen.getByLabelText(/descripción personalizada/i)).toHaveFocus();
    });

    it('debe permitir activar checkbox con Space', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      // Agregar item
      const addButton = screen.getByRole('button', { name: /agregar nuevo item al checklist/i });
      await user.click(addButton);

      // Enfocar checkbox con Tab
      const checkbox = await screen.findByRole('checkbox');
      checkbox.focus();

      // Activar con Space
      await user.keyboard(' ');

      expect(checkbox).toBeChecked();
    });

    it('debe permitir activar botones con Enter', async () => {
      const user = userEvent.setup();

      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      const addButton = screen.getByRole('button', { name: /agregar nuevo item al checklist/i });
      addButton.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('listitem')).toBeInTheDocument();
      });
    });
  });

  describe('Screen Reader Support', () => {
    it('debe tener texto sr-only para "Campo requerido"', () => {
      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.BaseFields />
        </ProjectEventForm.Container>
      );

      const srOnlyText = container.querySelector('.sr-only');
      expect(srOnlyText).toBeInTheDocument();
      expect(srOnlyText).toHaveTextContent('Campo requerido');
    });

    it('debe tener aria-hidden en iconos decorativos', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.ChecklistSection />
        </ProjectEventForm.Container>
      );

      const addButton = screen.getByRole('button', { name: /agregar nuevo item al checklist/i });
      await user.click(addButton);

      await waitFor(() => {
        const decorativeIcons = container.querySelectorAll('[aria-hidden="true"]');
        expect(decorativeIcons.length).toBeGreaterThan(0);
      });
    });

    it('debe tener aria-label descriptivo en Badge "Override"', () => {
      render(
        <ProjectEventForm.Container mode="lean" project={mockProject} onSubmit={jest.fn()}>
          <ProjectEventForm.OverrideFields />
        </ProjectEventForm.Container>
      );

      const overrideBadge = screen.getByLabelText(/campo override/i);
      expect(overrideBadge).toBeInTheDocument();
      expect(overrideBadge).toHaveTextContent('Override');
    });
  });
});
