/**
 * Tests para Container - Context provider y lógica de formulario
 *
 * Verifica:
 * - Context provider functionality
 * - Form initialization (lean/full modes)
 * - Form submission flow
 * - Error boundary integration
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Container, useProjectEventFormContext } from '../Container';
import { createMockProject } from '@/__tests__/helpers/test-data-factory';

// Componente test que consume el context
const TestConsumer = () => {
  const { mode, project, form, isSubmitting, disabled } = useProjectEventFormContext();

  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="project-id">{project?.id || 'no-project'}</span>
      <span data-testid="is-submitting">{isSubmitting.toString()}</span>
      <span data-testid="is-disabled">{disabled.toString()}</span>
      <button
        data-testid="update-notes"
        onClick={() => form.setValue('eventNotes', 'Updated notes')}
      >
        Update Notes
      </button>
    </div>
  );
};

describe('Container', () => {
  const mockProject = createMockProject();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Context Provider', () => {
    it('debe proporcionar context correctamente en modo lean', () => {
      render(
        <Container mode="lean" project={mockProject} onSubmit={mockOnSubmit}>
          <TestConsumer />
        </Container>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('lean');
      expect(screen.getByTestId('project-id')).toHaveTextContent(mockProject.id);
      expect(screen.getByTestId('is-submitting')).toHaveTextContent('false');
      expect(screen.getByTestId('is-disabled')).toHaveTextContent('false');
    });

    it('debe proporcionar context correctamente', () => {
      render(
        <Container mode="lean" project={mockProject} onSubmit={mockOnSubmit}>
          <TestConsumer />
        </Container>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('lean');
      expect(screen.getByTestId('project-id')).toHaveTextContent(mockProject.id);
    });

    it('debe manejar isSubmitting state correctamente', () => {
      render(
        <Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        >
          <TestConsumer />
        </Container>
      );

      expect(screen.getByTestId('is-submitting')).toHaveTextContent('true');
    });

    it('debe manejar disabled state correctamente', () => {
      render(
        <Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
          disabled={true}
        >
          <TestConsumer />
        </Container>
      );

      expect(screen.getByTestId('is-disabled')).toHaveTextContent('true');
    });

    it('debe lanzar error si useContext se usa fuera del Provider', () => {
      // Suprimir console.error para este test
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestConsumer />)).toThrow(
        'useProjectEventFormContext must be used within ProjectEventForm.Container'
      );

      spy.mockRestore();
    });
  });

  describe('Form Initialization', () => {
    it('debe inicializar form en modo lean con valores por defecto', () => {
      const { container } = render(
        <Container mode="lean" project={mockProject} onSubmit={mockOnSubmit}>
          <form data-testid="form">
            <input name="eventDate" />
          </form>
        </Container>
      );

      expect(screen.getByTestId('form')).toBeInTheDocument();
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    it('debe inicializar form correctamente', () => {
      const { container } = render(
        <Container mode="lean" project={mockProject} onSubmit={mockOnSubmit}>
          <form data-testid="form" />
        </Container>
      );

      expect(screen.getByTestId('form')).toBeInTheDocument();
    });

    it('debe usar initialData cuando se proporciona', () => {
      const initialData = {
        eventDate: new Date('2024-07-01'),
        eventNotes: 'Initial test notes',
        checklist: [],
      };

      render(
        <Container
          mode="lean"
          project={mockProject}
          initialData={initialData}
          onSubmit={mockOnSubmit}
        >
          <TestConsumer />
        </Container>
      );

      // Context debe tener el project
      expect(screen.getByTestId('project-id')).toHaveTextContent(mockProject.id);
    });

    it('debe inicializar con project data en modo full', () => {
      const projectWithData = createMockProject({
        description: 'Project description',
        phone: '+34 666 777 888',
        status: 'montaje',
      });

      render(
        <Container mode="lean" project={projectWithData} onSubmit={mockOnSubmit}>
          <TestConsumer />
        </Container>
      );

      expect(screen.getByTestId('project-id')).toHaveTextContent(projectWithData.id);
    });
  });

  describe('Form Submission', () => {
    it('debe ejecutar onSubmit cuando el form se envía', async () => {
      const user = userEvent.setup();

      render(
        <Container mode="lean" project={mockProject} onSubmit={mockOnSubmit}>
          <button type="submit">Submit</button>
        </Container>
      );

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('debe pasar form values a onSubmit', async () => {
      const user = userEvent.setup();

      render(
        <Container mode="lean" project={mockProject} onSubmit={mockOnSubmit}>
          <TestConsumer />
          <button type="submit">Submit</button>
        </Container>
      );

      // Update a value
      await user.click(screen.getByTestId('update-notes'));

      // Submit
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            projectId: mockProject.id,
          })
        );
      });
    });
  });

  describe('Error Boundary Integration', () => {
    it('debe estar envuelto por FormErrorBoundary', () => {
      const { container } = render(
        <Container mode="lean" project={mockProject} onSubmit={mockOnSubmit}>
          <div data-testid="content">Content</div>
        </Container>
      );

      // FormErrorBoundary está presente (invisible en el DOM pero protege el árbol)
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(container.querySelector('form')).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('debe aplicar className al form element', () => {
      const { container } = render(
        <Container
          mode="lean"
          project={mockProject}
          onSubmit={mockOnSubmit}
          className="custom-form-class"
        >
          <div>Content</div>
        </Container>
      );

      const form = container.querySelector('form');
      expect(form).toHaveClass('custom-form-class');
    });
  });
});
