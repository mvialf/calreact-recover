/**
 * Tests para useChecklistManager - Hook de gestión de checklist
 *
 * Verifica:
 * - CRUD operations (add, remove, update)
 * - Move/reorder items
 * - Toggle complete status
 * - Clear completed items
 * - Stats calculation
 */

import { renderHook, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useChecklistManager } from '../useChecklistManager';
import type { ChecklistItem } from '@/schemas/project-event.schemas';

interface FormWithChecklist {
  checklist: ChecklistItem[];
}

// Mock de generateUniqueId para IDs predecibles en tests
jest.mock('@/utils/form-helpers', () => ({
  generateUniqueId: jest.fn((prefix: string) => `${prefix}-${Date.now()}`),
}));

describe('useChecklistManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('debe inicializar con array vacío', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: { checklist: [] },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.items).toEqual([]);
      expect(result.current.stats.total).toBe(0);
    });

    it('debe inicializar con items existentes', () => {
      const initialItems: ChecklistItem[] = [
        {
          id: 'item-1',
          description: 'Item 1',
          isCompleted: false,
          priority: 'high',
          createdAt: new Date(),
        },
        {
          id: 'item-2',
          description: 'Item 2',
          isCompleted: true,
          priority: 'low',
          createdAt: new Date(),
        },
      ];

      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: { checklist: initialItems },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.stats.total).toBe(2);
      expect(result.current.stats.completed).toBe(1);
    });
  });

  describe('Add items', () => {
    it('debe agregar item con valores por defecto', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: { checklist: [] },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      act(() => {
        result.current.addItem();
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({
        description: '',
        isCompleted: false,
        priority: 'medium',
      });
    });

    it('debe agregar item con valores personalizados', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: { checklist: [] },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      act(() => {
        result.current.addItem({
          description: 'Custom task',
          priority: 'high',
          category: 'Work',
        });
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({
        description: 'Custom task',
        priority: 'high',
        category: 'Work',
        isCompleted: false,
      });
    });

    it('debe generar IDs únicos al agregar items', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: { checklist: [] },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      act(() => {
        result.current.addItem({ description: 'Item 1' });
      });

      act(() => {
        result.current.addItem({ description: 'Item 2' });
      });

      expect(result.current.items[0].id).toBeDefined();
      expect(result.current.items[1].id).toBeDefined();
      expect(result.current.items[0].id).not.toBe(result.current.items[1].id);
    });
  });

  describe('Remove items', () => {
    it('debe remover item por índice', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: {
            checklist: [
              {
                id: 'item-1',
                description: 'Item 1',
                isCompleted: false,
                priority: 'medium',
                createdAt: new Date(),
              },
              {
                id: 'item-2',
                description: 'Item 2',
                isCompleted: false,
                priority: 'medium',
                createdAt: new Date(),
              },
            ],
          },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.removeItem(0);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].description).toBe('Item 2');
    });
  });

  describe('Update items', () => {
    it('debe actualizar item existente', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: {
            checklist: [
              {
                id: 'item-1',
                description: 'Original',
                isCompleted: false,
                priority: 'medium',
                createdAt: new Date(),
              },
            ],
          },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      act(() => {
        result.current.updateItem(0, {
          description: 'Updated',
          priority: 'high',
        });
      });

      expect(result.current.items[0].description).toBe('Updated');
      expect(result.current.items[0].priority).toBe('high');
    });

    it('debe preservar campos no actualizados', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: {
            checklist: [
              {
                id: 'item-1',
                description: 'Task',
                isCompleted: false,
                priority: 'medium',
                notes: 'Original notes',
                createdAt: new Date(),
              },
            ],
          },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      act(() => {
        result.current.updateItem(0, { description: 'Updated Task' });
      });

      expect(result.current.items[0].description).toBe('Updated Task');
      expect(result.current.items[0].notes).toBe('Original notes');
      expect(result.current.items[0].priority).toBe('medium');
    });
  });

  describe('Move items', () => {
    it('debe mover item a nueva posición', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: {
            checklist: [
              { id: '1', description: 'First', isCompleted: false, priority: 'medium', createdAt: new Date() },
              { id: '2', description: 'Second', isCompleted: false, priority: 'medium', createdAt: new Date() },
              { id: '3', description: 'Third', isCompleted: false, priority: 'medium', createdAt: new Date() },
            ],
          },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      act(() => {
        result.current.moveItem(0, 2); // Mover "First" al final
      });

      expect(result.current.items[0].description).toBe('Second');
      expect(result.current.items[1].description).toBe('Third');
      expect(result.current.items[2].description).toBe('First');
    });
  });

  describe('Toggle complete', () => {
    it('debe marcar item como completado', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: {
            checklist: [
              {
                id: 'item-1',
                description: 'Task',
                isCompleted: false,
                priority: 'medium',
                createdAt: new Date(),
              },
            ],
          },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.items[0].isCompleted).toBe(false);

      act(() => {
        result.current.toggleComplete(0);
      });

      expect(result.current.items[0].isCompleted).toBe(true);
      expect(result.current.items[0].completedAt).toBeDefined();
    });

    it('debe desmarcar item completado', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: {
            checklist: [
              {
                id: 'item-1',
                description: 'Task',
                isCompleted: true,
                priority: 'medium',
                createdAt: new Date(),
                completedAt: new Date(),
              },
            ],
          },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.items[0].isCompleted).toBe(true);

      act(() => {
        result.current.toggleComplete(0);
      });

      expect(result.current.items[0].isCompleted).toBe(false);
      expect(result.current.items[0].completedAt).toBeUndefined();
    });
  });

  describe('Clear completed', () => {
    it('debe remover todos los items completados', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: {
            checklist: [
              { id: '1', description: 'Pending', isCompleted: false, priority: 'medium', createdAt: new Date() },
              { id: '2', description: 'Done 1', isCompleted: true, priority: 'medium', createdAt: new Date() },
              { id: '3', description: 'Done 2', isCompleted: true, priority: 'medium', createdAt: new Date() },
              { id: '4', description: 'Pending 2', isCompleted: false, priority: 'medium', createdAt: new Date() },
            ],
          },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.items).toHaveLength(4);

      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.items).toHaveLength(2);
      expect(result.current.items.every(item => !item.isCompleted)).toBe(true);
    });
  });

  describe('Stats calculation', () => {
    it('debe calcular estadísticas correctamente', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: {
            checklist: [
              { id: '1', description: 'Task 1', isCompleted: true, priority: 'medium', createdAt: new Date() },
              { id: '2', description: 'Task 2', isCompleted: true, priority: 'medium', createdAt: new Date() },
              { id: '3', description: 'Task 3', isCompleted: false, priority: 'medium', createdAt: new Date() },
              { id: '4', description: 'Task 4', isCompleted: false, priority: 'medium', createdAt: new Date() },
            ],
          },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.stats.total).toBe(4);
      expect(result.current.stats.completed).toBe(2);
      expect(result.current.stats.pending).toBe(2);
      expect(result.current.stats.completionRate).toBe(50);
    });

    it('debe calcular completionRate 0 para lista vacía', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: { checklist: [] },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.stats.completionRate).toBe(0);
    });

    it('debe actualizar stats en tiempo real', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormWithChecklist>({
          defaultValues: { checklist: [] },
        });
        return useChecklistManager({
          control: form.control,
          name: 'checklist',
        });
      });

      expect(result.current.stats.total).toBe(0);

      act(() => {
        result.current.addItem({ description: 'Task 1' });
      });

      expect(result.current.stats.total).toBe(1);
      expect(result.current.stats.pending).toBe(1);

      act(() => {
        result.current.toggleComplete(0);
      });

      expect(result.current.stats.completed).toBe(1);
      expect(result.current.stats.pending).toBe(0);
      expect(result.current.stats.completionRate).toBe(100);
    });
  });
});
