"use client"

import { useState, useCallback, useRef } from 'react'

// Tipo para configuración de modales
export interface ModalConfig {
  id: string
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  persistent?: boolean // No se cierra con Escape o click fuera
}

// Estado de un modal individual
export interface ModalState extends ModalConfig {
  isOpen: boolean
  data?: any
}

/**
 * useModalManager - Hook para gestionar múltiples modales
 * 
 * Útil para aplicaciones que necesitan manejar varios modales
 * simultáneamente o con lógica compleja de apertura/cierre.
 * 
 * Uso:
 * const { openModal, closeModal, isModalOpen, getModalData } = useModalManager()
 * 
 * openModal('project-modal', { title: 'Nuevo Proyecto', data: project })
 * closeModal('project-modal')
 */
export const useModalManager = () => {
  const [modals, setModals] = useState<Map<string, ModalState>>(new Map())
  const modalsRef = useRef<Map<string, ModalState>>(new Map())

  // Sincronizar ref con estado para acceso en callbacks
  modalsRef.current = modals

  // Abrir modal con configuración
  const openModal = useCallback((
    id: string, 
    config: Partial<ModalConfig> & { data?: any } = {}
  ) => {
    setModals(prev => {
      const newModals = new Map(prev)
      newModals.set(id, {
        id,
        isOpen: true,
        title: config.title,
        size: config.size || 'md',
        persistent: config.persistent || false,
        data: config.data
      })
      return newModals
    })
  }, [])

  // Cerrar modal específico
  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const newModals = new Map(prev)
      const modal = newModals.get(id)
      if (modal) {
        newModals.set(id, { ...modal, isOpen: false })
      }
      return newModals
    })
  }, [])

  // Cerrar todos los modales
  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const newModals = new Map()
      prev.forEach((modal, id) => {
        newModals.set(id, { ...modal, isOpen: false })
      })
      return newModals
    })
  }, [])

  // Verificar si un modal está abierto
  const isModalOpen = useCallback((id: string): boolean => {
    return modalsRef.current.get(id)?.isOpen || false
  }, [])

  // Obtener datos de un modal
  const getModalData = useCallback(<T = any>(id: string): T | undefined => {
    return modalsRef.current.get(id)?.data
  }, [])

  // Obtener configuración completa de un modal
  const getModal = useCallback((id: string): ModalState | undefined => {
    return modalsRef.current.get(id)
  }, [])

  // Toggle modal
  const toggleModal = useCallback((id: string, config?: Partial<ModalConfig> & { data?: any }) => {
    if (isModalOpen(id)) {
      closeModal(id)
    } else {
      openModal(id, config)
    }
  }, [isModalOpen, closeModal, openModal])

  // Limpiar modal (eliminar completamente del state)
  const removeModal = useCallback((id: string) => {
    setModals(prev => {
      const newModals = new Map(prev)
      newModals.delete(id)
      return newModals
    })
  }, [])

  // Obtener lista de modales abiertos
  const getOpenModals = useCallback((): ModalState[] => {
    return Array.from(modalsRef.current.values()).filter(modal => modal.isOpen)
  }, [])

  return {
    // Métodos principales
    openModal,
    closeModal,
    closeAllModals,
    toggleModal,
    removeModal,
    
    // Queries
    isModalOpen,
    getModalData,
    getModal,
    getOpenModals,
    
    // Estado completo (para debugging)
    modals: Array.from(modals.values())
  }
}

/**
 * useFormModal - Hook especializado para modales con formularios
 * 
 * Simplifica el patrón común de abrir modal -> llenar formulario -> enviar -> cerrar
 */
export const useFormModal = <T = any>(
  modalId: string,
  onSubmit?: (data: T) => Promise<void> | void
) => {
  const { openModal, closeModal, isModalOpen, getModalData } = useModalManager()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Abrir modal con datos opcionales
  const open = useCallback((data?: Partial<T>) => {
    openModal(modalId, { data })
  }, [openModal, modalId])

  // Cerrar modal con limpieza
  const close = useCallback(() => {
    setIsSubmitting(false)
    closeModal(modalId)
  }, [closeModal, modalId])

  // Submit con manejo de estado
  const submit = useCallback(async (data: T) => {
    if (!onSubmit) return

    setIsSubmitting(true)
    try {
      await onSubmit(data)
      close()
    } catch (error) {
      console.error(`Error en modal ${modalId}:`, error)
      throw error // Re-throw para que el componente lo maneje
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, close, modalId])

  return {
    isOpen: isModalOpen(modalId),
    isSubmitting,
    data: getModalData<T>(modalId),
    open,
    close,
    submit
  }
}

export default useModalManager