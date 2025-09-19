"use client"

// Imports de contexto y hooks
import { 
  ModalProvider, 
  useModal, 
  useModalState,
  type ModalContextValue,
  type ModalProviderProps 
} from './ModalContext'

// Re-exports de contexto y hooks
export { 
  ModalProvider, 
  useModal, 
  useModalState,
  type ModalContextValue,
  type ModalProviderProps 
}

// Imports de componentes individuales
import { ModalRoot, type ModalRootProps } from './ModalRoot'
import { ModalContent, type ModalContentProps } from './ModalContent'
import { ModalHeader, type ModalHeaderProps } from './ModalHeader'
import { ModalBody, type ModalBodyProps } from './ModalBody'
import { ModalFooter, type ModalFooterProps } from './ModalFooter'
import { ModalActions, ModalAction, type ModalActionsProps, type ModalActionProps } from './ModalActions'
import { FormModal, ConfirmationModal, InfoModal, type FormModalProps } from './FormModal'

// Re-exports de componentes individuales
export { ModalRoot, type ModalRootProps }
export { ModalContent, type ModalContentProps }
export { ModalHeader, type ModalHeaderProps }
export { ModalBody, type ModalBodyProps }
export { ModalFooter, type ModalFooterProps }
export { ModalActions, ModalAction, type ModalActionsProps, type ModalActionProps }
export { FormModal, ConfirmationModal, InfoModal, type FormModalProps }

// Compound Components Pattern - Interface principal
export const Modal = {
  Root: ModalRoot,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Actions: ModalActions,
  Action: ModalAction,
  
  // Alias para compatibilidad
  Provider: ModalProvider,
} as const

// Export default para uso conveniente
export default Modal

// Re-exports útiles del dialog base para casos especiales
export { 
  Dialog, 
  DialogTrigger, 
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

// Tipos helper para TypeScript
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ModalVariant = 'default' | 'destructive' | 'form' | 'info' | 'confirmation'

// Props base que pueden ser útiles para crear variantes especializadas
export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: ModalSize
  formId?: string
}