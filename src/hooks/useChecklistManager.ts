/**
 * Hook para gestionar checklist con useFieldArray
 *
 * Proporciona API simplificada para operaciones CRUD en checklist
 * Optimizado con React Hook Form's useFieldArray
 */

import { useCallback } from 'react';
import { useFieldArray, type Control, type FieldValues, type Path } from 'react-hook-form';
import { generateUniqueId } from '@/utils/form-helpers';
import type { ChecklistItem } from '@/schemas/project-event.schemas';

export interface UseChecklistManagerOptions<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export interface UseChecklistManagerReturn {
  items: ChecklistItem[];
  addItem: (item?: Partial<ChecklistItem>) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, updates: Partial<ChecklistItem>) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  toggleComplete: (index: number) => void;
  clearCompleted: () => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
}

/**
 * Hook para gestionar checklist de forma optimizada
 *
 * @param options - Configuración del hook
 * @returns API para gestionar checklist
 *
 * @example
 * const { items, addItem, updateItem, removeItem, stats } = useChecklistManager({
 *   control: form.control,
 *   name: 'checklist'
 * });
 *
 * <Button onClick={() => addItem()}>Agregar Item</Button>
 * {items.map((item, i) => (
 *   <Input
 *     value={item.description}
 *     onChange={(e) => updateItem(i, { description: e.target.value })}
 *   />
 * ))}
 */
export const useChecklistManager = <T extends FieldValues>({
  control,
  name,
}: UseChecklistManagerOptions<T>): UseChecklistManagerReturn => {
  const { fields, append, remove, update, move } = useFieldArray({
    control,
    name: name as any, // Type cast necesario por limitación de React Hook Form con ArrayPath
  });

  // Castear fields a ChecklistItem[] para type-safety
  const items = fields as unknown as ChecklistItem[];

  /**
   * Agregar nuevo item al checklist
   */
  const addItem = useCallback((item: Partial<ChecklistItem> = {}) => {
    const newItem: ChecklistItem = {
      id: generateUniqueId('checklist'),
      description: item.description || '',
      isCompleted: item.isCompleted ?? false,
      priority: item.priority || 'medium',
      category: item.category,
      notes: item.notes,
      createdAt: new Date(),
    };

    append(newItem as any);

    // Auto-focus en el nuevo item después de un frame
    setTimeout(() => {
      const element = document.getElementById(`checklist-${newItem.id}`);
      element?.focus();
    }, 100);
  }, [append]);

  /**
   * Remover item del checklist
   */
  const removeItem = useCallback((index: number) => {
    remove(index);
  }, [remove]);

  /**
   * Actualizar item existente (inmutable)
   */
  const updateItem = useCallback((index: number, updates: Partial<ChecklistItem>) => {
    const currentItem = items[index];
    if (!currentItem) return;

    update(index, {
      ...currentItem,
      ...updates,
    } as any);
  }, [items, update]);

  /**
   * Mover item de una posición a otra
   */
  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
  }, [move]);

  /**
   * Toggle estado de completado de un item
   */
  const toggleComplete = useCallback((index: number) => {
    const currentItem = items[index];
    if (!currentItem) return;

    const isCompleted = !currentItem.isCompleted;
    update(index, {
      ...currentItem,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    } as any);
  }, [items, update]);

  /**
   * Limpiar todos los items completados
   */
  const clearCompleted = useCallback(() => {
    // Recorrer de atrás hacia adelante para evitar problemas de índices
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].isCompleted) {
        remove(i);
      }
    }
  }, [items, remove]);

  /**
   * Estadísticas del checklist
   */
  const stats = {
    total: items.length,
    completed: items.filter(item => item.isCompleted).length,
    pending: items.filter(item => !item.isCompleted).length,
    completionRate: items.length > 0
      ? (items.filter(item => item.isCompleted).length / items.length) * 100
      : 0,
  };

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    moveItem,
    toggleComplete,
    clearCompleted,
    stats,
  };
};
