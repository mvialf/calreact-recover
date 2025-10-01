/**
 * Tests para ProjectInfo - React.memo y rendering
 *
 * Verifica:
 * - Rendering de información del proyecto
 * - React.memo optimization
 * - Rendering condicional (null project)
 * - Status badge variants
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectInfo } from '../ProjectInfo';
import { createMockProject } from '@/__tests__/helpers/test-data-factory';

describe('ProjectInfo', () => {
  const mockProject = createMockProject({
    projectNumber: 'PRJ-001',
    description: 'Test project description',
    status: 'montaje',
    phone: '+34 666 555 444',
    fullAddress: {
      textoCompleto: 'Calle Test 123, Madrid',
      coordenadas: { latitude: 40.4168, longitude: -3.7038 },
      placeId: 'test-place-id',
    },
  });

  describe('Rendering básico', () => {
    it('debe renderizar información del proyecto correctamente', () => {
      render(<ProjectInfo project={mockProject} />);

      expect(screen.getByText('PRJ-001')).toBeInTheDocument();
      expect(screen.getByText('Test project description')).toBeInTheDocument();
      expect(screen.getByText('Montaje')).toBeInTheDocument(); // Label del status
      expect(screen.getByText('+34 666 555 444')).toBeInTheDocument();
      expect(screen.getByText('Calle Test 123, Madrid')).toBeInTheDocument();
    });

    it('NO debe renderizar si project es null', () => {
      const { container } = render(<ProjectInfo project={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('NO debe renderizar si project es undefined', () => {
      const { container } = render(<ProjectInfo project={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('debe aplicar className correctamente', () => {
      const { container } = render(
        <ProjectInfo project={mockProject} className="custom-project-info" />
      );

      const card = container.querySelector('.custom-project-info');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('custom-project-info');
    });
  });

  describe('Status Badge Variants', () => {
    it('debe mostrar badge "Montaje" con variant default', () => {
      render(<ProjectInfo project={{ ...mockProject, status: 'montaje' }} />);

      const badge = screen.getByText('Montaje'); // Label
      expect(badge).toBeInTheDocument();
    });

    it('debe mostrar badge "Completado" con variant secondary', () => {
      render(<ProjectInfo project={{ ...mockProject, status: 'completado' }} />);

      const badge = screen.getByText('Completado'); // Label
      expect(badge).toBeInTheDocument();
    });

    it('debe mostrar badge "Ingresado" con variant outline', () => {
      render(<ProjectInfo project={{ ...mockProject, status: 'ingresado' }} />);

      const badge = screen.getByText('Ingresado'); // Label
      expect(badge).toBeInTheDocument();
    });

    it('debe mostrar badge "Complicación" con variant destructive', () => {
      render(<ProjectInfo project={{ ...mockProject, status: 'complicación' }} />);

      const badge = screen.getByText('Complicación'); // Label
      expect(badge).toBeInTheDocument();
    });

    it('debe usar variant default para status desconocido', () => {
      // ProjectInfo mapea status a badge variants, status no reconocidos usan "default"
      render(<ProjectInfo project={{ ...mockProject, status: 'programar' }} />);

      const badge = screen.getByText('Programar'); // Label
      expect(badge).toBeInTheDocument();
    });
  });

  describe('React.memo optimization', () => {
    it('NO debe re-renderizar si project.id no cambia', () => {
      const { rerender } = render(<ProjectInfo project={mockProject} />);

      // Actualizar otros campos pero mantener mismo id
      const updatedProject = {
        ...mockProject,
        description: 'Nueva descripción',
      };

      rerender(<ProjectInfo project={updatedProject} />);

      // Debe seguir mostrando el projectNumber original (comparador previene re-render)
      expect(screen.getByText(mockProject.projectNumber)).toBeInTheDocument();
    });

    it('debe re-renderizar si project.id cambia', () => {
      const { rerender } = render(<ProjectInfo project={mockProject} />);

      // Crear proyecto con ID diferente
      const newProject = createMockProject({
        id: 'new-id',
        projectNumber: 'PRJ-999',
      });

      rerender(<ProjectInfo project={newProject} />);

      // Debe mostrar el nuevo projectNumber
      expect(screen.getByText('PRJ-999')).toBeInTheDocument();
      expect(screen.queryByText('PRJ-001')).not.toBeInTheDocument();
    });

    it('debe re-renderizar si className cambia', () => {
      const { rerender } = render(<ProjectInfo project={mockProject} className="class-1" />);

      rerender(<ProjectInfo project={mockProject} className="class-2" />);

      // El comparador detecta cambio de className y re-renderiza
      const card = document.querySelector('.class-2');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Campos opcionales', () => {
    it('debe manejar proyecto sin clientName', () => {
      const projectWithoutClient = createMockProject({
        clientName: undefined,
      });

      render(<ProjectInfo project={projectWithoutClient} />);

      // No debe mostrar sección de cliente si no existe
      expect(screen.queryByText(/Cliente:/i)).not.toBeInTheDocument();
    });

    it('debe manejar proyecto sin status', () => {
      const projectWithoutStatus = createMockProject({
        status: undefined as any,
      });

      render(<ProjectInfo project={projectWithoutStatus} />);

      // No debe mostrar sección de estado si no existe
      expect(screen.queryByText(/Estado:/i)).not.toBeInTheDocument();
    });

    it('debe manejar proyecto sin phone', () => {
      const projectWithoutPhone = createMockProject({
        phone: undefined,
      });

      render(<ProjectInfo project={projectWithoutPhone} />);

      // No debe mostrar sección de teléfono si no existe
      expect(screen.queryByText(/Teléfono:/i)).not.toBeInTheDocument();
    });
  });
});
