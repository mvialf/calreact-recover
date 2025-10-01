/**
 * useDragAndDrop - Hook simplificado para HTML5 Drag & Drop
 *
 * Arquitectura basada en HTML5 nativo (no React state management):
 * - dataTransfer del navegador ES el estado compartido
 * - Componentes draggable: auto-contenidos, manejan sus propios eventos
 * - Drop targets: solo manejan eventos de drop
 *
 * Inspirado en: Pragmatic Drag and Drop (Atlassian)
 * Documentación: https://github.com/atlassian/pragmatic-drag-and-drop
 */

import { useCallback } from 'react';

export interface DragState {
  isDragging: boolean;
  draggedItem: string | null;
  dragOverTarget: string | null;
}

/**
 * Hook simplificado que solo maneja eventos de DROP (no drag)
 * Los eventos de drag son manejados directamente por los componentes draggable
 */
export function useDragAndDrop() {
  /**
   * Handler para onDragOver - SOLO para drop targets
   * Debe llamar preventDefault() para permitir el drop
   */
  const handleDragOver = useCallback((e: React.DragEvent, targetId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Configurar visual feedback
    e.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Handler para onDragLeave - SOLO para drop targets
   * Limpia el visual feedback cuando el drag sale del target
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    // Limpiar cualquier visual feedback
  }, []);

  /**
   * Handler para onDrop - SOLO para drop targets
   * Lee el itemId del dataTransfer y ejecuta el callback
   */
  const handleDrop = useCallback((
    e: React.DragEvent,
    targetDate: string,
    onMoveEvent: (itemId: string, targetDate: string) => void
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Leer el itemId del dataTransfer (configurado por el draggable)
    const itemId = e.dataTransfer.getData('text/plain');

    if (itemId && onMoveEvent) {
      onMoveEvent(itemId, targetDate);
    }
  }, []);

  return {
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}