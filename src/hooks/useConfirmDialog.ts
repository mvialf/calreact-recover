/**
 * Custom hook para manejar diálogos de confirmación
 * 
 * Proporciona una interfaz consistente para mostrar diálogos de confirmación
 * reutilizables en toda la aplicación.
 */

import { useState, useCallback } from 'react';

export interface ConfirmDialogConfig {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
}

export interface UseConfirmDialogReturn {
  // Estado del diálogo
  isOpen: boolean;
  config: ConfirmDialogConfig;
  isLoading: boolean;
  
  // Funciones de control
  showConfirm: (config: ConfirmDialogConfig) => void;
  hideConfirm: () => void;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
  
  // Helpers para casos comunes
  confirmDelete: (itemName?: string, onConfirm?: () => Promise<void> | void) => void;
  confirmSave: (onConfirm?: () => Promise<void> | void) => void;
  confirmDiscard: (onConfirm?: () => Promise<void> | void) => void;
}

const DEFAULT_CONFIG: Required<ConfirmDialogConfig> = {
  title: 'Confirmar acción',
  description: '¿Está seguro de que desea continuar?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'default',
  onConfirm: () => {},
  onCancel: () => {},
};

export const useConfirmDialog = (): UseConfirmDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmDialogConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);

  // Mostrar diálogo de confirmación
  const showConfirm = useCallback((newConfig: ConfirmDialogConfig) => {
    setConfig({ ...DEFAULT_CONFIG, ...newConfig });
    setIsOpen(true);
  }, []);

  // Ocultar diálogo de confirmación
  const hideConfirm = useCallback(() => {
    setIsOpen(false);
    setIsLoading(false);
    setConfig(DEFAULT_CONFIG);
  }, []);

  // Manejar confirmación
  const handleConfirm = useCallback(async () => {
    if (!config.onConfirm) {
      hideConfirm();
      return;
    }

    setIsLoading(true);
    
    try {
      await config.onConfirm();
      hideConfirm();
    } catch (error) {
      setIsLoading(false);
      // Error será manejado por el componente que usa el hook
      throw error;
    }
  }, [config.onConfirm, hideConfirm]);

  // Manejar cancelación
  const handleCancel = useCallback(() => {
    config.onCancel?.();
    hideConfirm();
  }, [config.onCancel, hideConfirm]);

  // Helper para confirmación de eliminación
  const confirmDelete = useCallback((
    itemName?: string,
    onConfirm?: () => Promise<void> | void
  ) => {
    showConfirm({
      title: 'Confirmar eliminación',
      description: itemName 
        ? `¿Está seguro de que desea eliminar "${itemName}"? Esta acción no se puede deshacer.`
        : '¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'destructive',
      onConfirm,
    });
  }, [showConfirm]);

  // Helper para confirmación de guardado
  const confirmSave = useCallback((onConfirm?: () => Promise<void> | void) => {
    showConfirm({
      title: 'Guardar cambios',
      description: '¿Desea guardar los cambios realizados?',
      confirmText: 'Guardar',
      cancelText: 'Cancelar',
      variant: 'default',
      onConfirm,
    });
  }, [showConfirm]);

  // Helper para confirmación de descarte
  const confirmDiscard = useCallback((onConfirm?: () => Promise<void> | void) => {
    showConfirm({
      title: 'Descartar cambios',
      description: 'Hay cambios sin guardar. ¿Está seguro de que desea descartarlos?',
      confirmText: 'Descartar',
      cancelText: 'Cancelar',  
      variant: 'destructive',
      onConfirm,
    });
  }, [showConfirm]);

  return {
    // Estado del diálogo
    isOpen,
    config,
    isLoading,
    
    // Funciones de control
    showConfirm,
    hideConfirm,
    handleConfirm,
    handleCancel,
    
    // Helpers para casos comunes
    confirmDelete,
    confirmSave,
    confirmDiscard,
  };
};