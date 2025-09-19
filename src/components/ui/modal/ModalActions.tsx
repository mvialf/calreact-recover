"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useModal } from './ModalContext'
import { cn } from '@/lib/utils'

// Props para acciones individuales
export interface ModalActionProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  form?: string
}

// Props para el contenedor de acciones
export interface ModalActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  
  // Configuración de botones predefinidos
  showCancel?: boolean
  showSubmit?: boolean
  cancelText?: string
  submitText?: string
  
  // Configuración del botón de submit
  submitVariant?: ModalActionProps['variant']
  submitDisabled?: boolean
  onCancel?: () => void
  onSubmit?: () => void
  
  // Layout
  spacing?: 'sm' | 'md' | 'lg'
  reverse?: boolean
}

/**
 * ModalAction - Botón individual para acciones del modal
 * 
 * Wrapper inteligente sobre Button que integra con el contexto del modal
 * para funcionalidades como loading state y form submission.
 */
export const ModalAction: React.FC<ModalActionProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled,
  loading,
  type = 'button',
  form,
  ...props
}) => {
  const { isSubmitting, formId } = useModal()
  
  // Auto-conectar con formulario si type=submit y hay formId en contexto
  const finalForm = form || (type === 'submit' ? formId : undefined)
  const finalDisabled = disabled || (type === 'submit' && isSubmitting)
  const finalLoading = loading || (type === 'submit' && isSubmitting)

  return (
    <Button
      variant={variant}
      size={size}
      disabled={finalDisabled}
      onClick={onClick}
      type={type}
      form={finalForm}
      {...props}
    >
      {finalLoading ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}

/**
 * ModalActions - Contenedor de acciones estándar del modal
 * 
 * Proporciona botones predefinidos (Cancelar/Guardar) o contenido personalizado.
 * Maneja automáticamente la conexión con formularios y estados de loading.
 * 
 * Uso estándar:
 * <Modal.Actions 
 *   showCancel 
 *   showSubmit 
 *   submitText="Crear Proyecto"
 *   onCancel={handleClose}
 * />
 * 
 * Uso personalizado:
 * <Modal.Actions>
 *   <Modal.Action variant="ghost" onClick={handleCancel}>
 *     Cancelar
 *   </Modal.Action>
 *   <Modal.Action type="submit" variant="default">
 *     Guardar
 *   </Modal.Action>
 * </Modal.Actions>
 */
export const ModalActions: React.FC<ModalActionsProps> = ({
  children,
  className,
  showCancel = false,
  showSubmit = false,
  cancelText = 'Cancelar',
  submitText = 'Guardar',
  submitVariant = 'default',
  submitDisabled = false,
  onCancel,
  onSubmit,
  spacing = 'md',
  reverse = false,
  ...props
}) => {
  const { onClose } = useModal()

  // Mapeo de spacing
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4'
  }

  // Clases base
  const baseClasses = cn(
    'flex',
    spacingClasses[spacing],
    reverse && 'flex-row-reverse',
    className
  )

  // Handler para cancelar
  const handleCancel = () => {
    onCancel?.()
    onClose()
  }

  // Si hay children personalizados, usarlos
  if (children) {
    return (
      <div className={baseClasses} {...props}>
        {children}
      </div>
    )
  }

  // Renderizar botones estándar
  return (
    <div className={baseClasses} {...props}>
      {showCancel && (
        <ModalAction
          variant="outline"
          onClick={handleCancel}
        >
          {cancelText}
        </ModalAction>
      )}
      
      {showSubmit && (
        <ModalAction
          type="submit"
          variant={submitVariant}
          disabled={submitDisabled}
          onClick={onSubmit}
        >
          {submitText}
        </ModalAction>
      )}
    </div>
  )
}

export default ModalActions