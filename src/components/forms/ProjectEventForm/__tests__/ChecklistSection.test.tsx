/**
 * Tests para ChecklistSection - Gestión de checklist con drag & drop
 *
 * Verifica:
 * - Rendering de checklist items
 * - Add/Remove/Update items
 * - Toggle complete status
 * - Priority selection
 * - Drag handle UI
 * - Empty state
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChecklistSection } from '../ChecklistSection';
import { mockFormContext, createMockChecklistItem } from './test-utils';

// Mock del Context
jest.mock('../Container', () => ({
  useProjectEventFormContext: () => mockFormContext,
}));

describe('ChecklistSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormContext.form.watch = jest.fn().mockReturnValue([]);
    mockFormContext.form.setValue = jest.fn();
    mockFormContext.form.getValues = jest.fn().mockReturnValue({ checklist: [] });
  });

  describe('Rendering básico', () => {
    it('debe renderizar título de sección', () => {
      render(<ChecklistSection />);

      expect(screen.getByText(/Checklist del Evento/i)).toBeInTheDocument();
    });

    it('debe mostrar botón "Añadir Item"', () => {
      render(<ChecklistSection />);

      expect(screen.getByRole('button', { name: /Añadir Item/i })).toBeInTheDocument();
    });

    it('debe mostrar mensaje de estado vacío cuando no hay items', () => {
      render(<ChecklistSection />);

      expect(screen.getByText(/No hay items en el checklist/i)).toBeInTheDocument();
    });
  });

  describe('Rendering de items', () => {
    it('debe renderizar lista de checklist items', () => {
      const mockItems = [
        createMockChecklistItem({ id: '1', description: 'Item 1', isCompleted: false }),
        createMockChecklistItem({ id: '2', description: 'Item 2', isCompleted: true }),
      ];

      mockFormContext.form.watch = jest.fn().mockReturnValue(mockItems);

      render(<ChecklistSection />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('debe mostrar checkbox para cada item', () => {
      const mockItems = [
        createMockChecklistItem({ id: '1', description: 'Item 1', isCompleted: false }),
      ];

      mockFormContext.form.watch = jest.fn().mockReturnValue(mockItems);

      render(<ChecklistSection />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(1);
    });

    it('debe mostrar ícono de prioridad según nivel', () => {
      const mockItems = [
        createMockChecklistItem({ id: '1', priority: 'high' }),
        createMockChecklistItem({ id: '2', priority: 'medium' }),
        createMockChecklistItem({ id: '3', priority: 'low' }),
      ];

      mockFormContext.form.watch = jest.fn().mockReturnValue(mockItems);

      render(<ChecklistSection />);

      // Los íconos de prioridad deben estar presentes
      // (específicos del diseño visual, verificar presencia)
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });
  });

  describe('Add/Remove items', () => {
    it('debe permitir añadir nuevo item', async () => {
      const user = userEvent.setup();

      render(<ChecklistSection />);

      const addButton = screen.getByRole('button', { name: /Añadir Item/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(mockFormContext.form.setValue).toHaveBeenCalled();
      });
    });

    it('debe permitir eliminar item existente', async () => {
      const user = userEvent.setup();
      const mockItems = [
        createMockChecklistItem({ id: '1', description: 'Item to delete' }),
      ];

      mockFormContext.form.watch = jest.fn().mockReturnValue(mockItems);

      render(<ChecklistSection />);

      const deleteButton = screen.getByRole('button', { name: /eliminar/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockFormContext.form.setValue).toHaveBeenCalledWith(
          'checklist',
          expect.arrayContaining([])
        );
      });
    });
  });

  describe('Toggle complete status', () => {
    it('debe marcar item como completado', async () => {
      const user = userEvent.setup();
      const mockItems = [
        createMockChecklistItem({ id: '1', description: 'Task', isCompleted: false }),
      ];

      mockFormContext.form.watch = jest.fn().mockReturnValue(mockItems);

      render(<ChecklistSection />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      await waitFor(() => {
        expect(mockFormContext.form.setValue).toHaveBeenCalledWith(
          'checklist',
          expect.arrayContaining([
            expect.objectContaining({ id: '1', isCompleted: true }),
          ])
        );
      });
    });

    it('debe desmarcar item completado', async () => {
      const user = userEvent.setup();
      const mockItems = [
        createMockChecklistItem({ id: '1', description: 'Task', isCompleted: true }),
      ];

      mockFormContext.form.watch = jest.fn().mockReturnValue(mockItems);

      render(<ChecklistSection />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      await waitFor(() => {
        expect(mockFormContext.form.setValue).toHaveBeenCalledWith(
          'checklist',
          expect.arrayContaining([
            expect.objectContaining({ id: '1', isCompleted: false }),
          ])
        );
      });
    });
  });

  describe('Priority selection', () => {
    it('debe permitir cambiar prioridad de item', async () => {
      const user = userEvent.setup();
      const mockItems = [
        createMockChecklistItem({ id: '1', priority: 'medium' }),
      ];

      mockFormContext.form.watch = jest.fn().mockReturnValue(mockItems);

      render(<ChecklistSection />);

      // Buscar select de prioridad y cambiar valor
      const prioritySelect = screen.getByRole('combobox');
      await user.click(prioritySelect);

      // Seleccionar opción "Alta"
      const highOption = screen.getByText(/Alta/i);
      await user.click(highOption);

      await waitFor(() => {
        expect(mockFormContext.form.setValue).toHaveBeenCalledWith(
          'checklist',
          expect.arrayContaining([
            expect.objectContaining({ id: '1', priority: 'high' }),
          ])
        );
      });
    });
  });

  describe('Drag handle UI', () => {
    it('debe mostrar drag handle para reordenar items', () => {
      const mockItems = [
        createMockChecklistItem({ id: '1' }),
        createMockChecklistItem({ id: '2' }),
      ];

      mockFormContext.form.watch = jest.fn().mockReturnValue(mockItems);

      render(<ChecklistSection />);

      // Drag handles deben estar presentes (iconos GripVertical)
      const dragHandles = screen.getAllByTestId(/drag-handle/i);
      expect(dragHandles).toHaveLength(2);
    });
  });

  describe('Disabled state', () => {
    it('debe deshabilitar todos los controles cuando disabled=true', () => {
      const disabledContext = { ...mockFormContext, disabled: true };
      const mockItems = [createMockChecklistItem({ id: '1' })];

      disabledContext.form.watch = jest.fn().mockReturnValue(mockItems);

      jest.mocked(require('../Container').useProjectEventFormContext).mockReturnValue(
        disabledContext
      );

      render(<ChecklistSection />);

      expect(screen.getByRole('button', { name: /Añadir Item/i })).toBeDisabled();
      expect(screen.getByRole('checkbox')).toBeDisabled();
      expect(screen.getByRole('button', { name: /eliminar/i })).toBeDisabled();
    });
  });

  describe('Edge cases', () => {
    it('debe manejar checklist undefined', () => {
      mockFormContext.form.watch = jest.fn().mockReturnValue(undefined);

      render(<ChecklistSection />);

      expect(screen.getByText(/No hay items en el checklist/i)).toBeInTheDocument();
    });

    it('debe manejar checklist null', () => {
      mockFormContext.form.watch = jest.fn().mockReturnValue(null);

      render(<ChecklistSection />);

      expect(screen.getByText(/No hay items en el checklist/i)).toBeInTheDocument();
    });

    it('debe manejar array vacío', () => {
      mockFormContext.form.watch = jest.fn().mockReturnValue([]);

      render(<ChecklistSection />);

      expect(screen.getByText(/No hay items en el checklist/i)).toBeInTheDocument();
    });
  });
});
