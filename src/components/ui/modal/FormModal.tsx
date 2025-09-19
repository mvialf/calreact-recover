"use client"

import React, { useCallback } from 'react'
import { Modal, type BaseModalProps } from './index'
import { useToast } from '@/components/ui/use-toast'

// Props para FormModal
export interface FormModalProps<T = any> extends BaseModalProps {
  children: React.ReactNode
  
  // Configuración del formulario
  onSubmit?: (data: T) => Promise<void> | void
  
  // Configuración de botones
  submitText?: string
  cancelText?: string
  showCancel?: boolean
  
  // Configuración visual
  description?: string
  scrollable?: boolean
  
  // Callbacks adicionales
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  
  // Configuración avanzada
  preventCloseOnSubmit?: boolean
  resetOnClose?: boolean
}

/**
 * FormModal - Modal especializado para formularios
 * 
 * Componente pre-configurado que combina un modal con funcionalidad
 * de formulario. Maneja automáticamente el estado de envío, errores,
 * y cierre del modal tras éxito.
 * 
 * Uso básico:
 * <FormModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Crear Proyecto"
 *   formId="project-form"
 *   onSubmit={handleCreateProject}
 *   submitText="Crear"
 * >
 *   <ProjectForm variant="modal" />
 * </FormModal>
 */
export function FormModal<T = any>({
  children,
  isOpen,
  onClose,
  title,
  size = 'md',
  formId = 'form-modal',
  onSubmit,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  showCancel = true,
  description,
  scrollable = false,
  onSuccess,
  onError,
  preventCloseOnSubmit = false,
  resetOnClose = false,
  ...props
}: FormModalProps<T>) {
  const { toast } = useToast()

  // Handler mejorado para el envío del formulario
  const handleSubmit = useCallback(async (data: T) => {
    if (!onSubmit) return

    try {
      await onSubmit(data)
      
      // Callback de éxito
      onSuccess?.(data)
      
      // Cerrar modal solo si no está prevenido
      if (!preventCloseOnSubmit) {
        onClose()
      }
      
      // Toast de éxito opcional
      toast({
        title: "Éxito",
        description: "Los datos se guardaron correctamente.",
      })
      
    } catch (error) {
      console.error('Error en FormModal:', error)
      
      // Callback de error
      onError?.(error as Error)
      
      // Toast de error
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error inesperado al guardar.",
        variant: "destructive",
      })
    }
  }, [onSubmit, onSuccess, onError, onClose, preventCloseOnSubmit, toast])

  // Handler para cerrar con limpieza opcional
  const handleClose = useCallback(() => {
    if (resetOnClose) {
      // Si el formulario tiene un método reset, llamarlo
      const form = document.getElementById(formId) as HTMLFormElement
      if (form && typeof form.reset === 'function') {
        form.reset()
      }
    }
    onClose()
  }, [onClose, resetOnClose, formId])

  return (
    <Modal.Root
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size={size}
      formId={formId}
      {...props}
    >
      <Modal.Content size={size} scrollable={scrollable}>
        <Modal.Header title={title} description={description} />
        
        <Modal.Body padding="lg" scrollable={scrollable}>
          {children}
        </Modal.Body>
        
        <Modal.Footer>
          <Modal.Actions
            showCancel={showCancel}
            showSubmit={true}
            cancelText={cancelText}
            submitText={submitText}
            onCancel={handleClose}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// Variantes pre-configuradas para casos comunes
export const ConfirmationModal = ({
  title = "¿Estás seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  ...props
}: Omit<FormModalProps, 'children' | 'formId'> & {
  confirmText?: string
  onConfirm?: () => void
  children: React.ReactNode
}) => (
  <FormModal
    title={title}
    size="sm"
    submitText={confirmText}
    cancelText={cancelText}
    onSubmit={onConfirm}
    formId="confirmation-modal"
    {...props}
  />
)

export const InfoModal = ({
  title = "Información",
  closeText = "Cerrar",
  ...props
}: Omit<FormModalProps, 'children' | 'formId' | 'onSubmit'> & {
  closeText?: string
  children: React.ReactNode
}) => (
  <FormModal
    title={title}
    size="md"
    showCancel={false}
    submitText={closeText}
    formId="info-modal"
    {...props}
  />
)

export default FormModal