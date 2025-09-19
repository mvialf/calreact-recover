"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

// Tipos para el contexto del modal
export interface ModalContextValue {
  // Estado básico del modal
  isOpen: boolean
  onClose: () => void
  
  // Para integración con formularios
  formId?: string
  isSubmitting?: boolean
  
  // Configuración avanzada
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  
  // Métodos para gestión interna
  setIsSubmitting: (submitting: boolean) => void
  setTitle: (title: string) => void
}

// Props para el provider
export interface ModalProviderProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  formId?: string
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

// Crear el contexto
const ModalContext = createContext<ModalContextValue | null>(null)

// Provider del contexto
export const ModalProvider: React.FC<ModalProviderProps> = ({
  children,
  isOpen,
  onClose,
  formId,
  title: initialTitle,
  size = 'md'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState(initialTitle || '')

  // Función optimizada para cerrar modal con cleanup
  const handleClose = useCallback(() => {
    setIsSubmitting(false)
    onClose()
  }, [onClose])

  const value: ModalContextValue = {
    isOpen,
    onClose: handleClose,
    formId,
    isSubmitting,
    title,
    size,
    setIsSubmitting,
    setTitle
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  )
}

// Hook para usar el contexto con validación
export const useModal = (): ModalContextValue => {
  const context = useContext(ModalContext)
  
  if (!context) {
    throw new Error(
      'useModal debe ser usado dentro de un ModalProvider. ' +
      'Asegúrate de envolver tu componente con <Modal.Root> o <ModalProvider>.'
    )
  }
  
  return context
}

// Hook para el estado del modal (para componentes padre)
export const useModalState = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState)
  
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])
  
  return { 
    isOpen, 
    open, 
    close, 
    toggle,
    // Para compatibilidad con patrones existentes
    setIsOpen 
  }
}

export default ModalContext