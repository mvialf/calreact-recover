"use client"

import React from 'react'
import { ModalProvider, type ModalProviderProps } from './ModalContext'
import { Dialog } from '@/components/ui/dialog'

// Props para el ModalRoot que extiende ModalProvider
export interface ModalRootProps extends Omit<ModalProviderProps, 'children'> {
  children: React.ReactNode
  
  // Props adicionales para el Dialog de Radix
  modal?: boolean
  defaultOpen?: boolean
  
  // Callback adicionales
  onOpenChange?: (open: boolean) => void
}

/**
 * ModalRoot - Componente raíz del sistema de modales compound
 * 
 * Combina el Dialog de Radix UI con nuestro ModalProvider para
 * proporcionar un contexto completo para todos los sub-componentes
 * 
 * Uso:
 * <Modal.Root isOpen={isOpen} onClose={handleClose}>
 *   <Modal.Content>
 *     ...contenido del modal
 *   </Modal.Content>
 * </Modal.Root>
 */
export const ModalRoot: React.FC<ModalRootProps> = ({
  children,
  isOpen,
  onClose,
  formId,
  title,
  size = 'md',
  modal = true,
  defaultOpen,
  onOpenChange,
  ...props
}) => {
  // Manejar cambios de estado del Dialog de Radix
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
    onOpenChange?.(open)
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleOpenChange}
      modal={modal}
      defaultOpen={defaultOpen}
      {...props}
    >
      <ModalProvider
        isOpen={isOpen}
        onClose={onClose}
        formId={formId}
        title={title}
        size={size}
      >
        {children}
      </ModalProvider>
    </Dialog>
  )
}

export default ModalRoot