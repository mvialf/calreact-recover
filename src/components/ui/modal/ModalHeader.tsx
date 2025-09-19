"use client"

import React from 'react'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useModal } from './ModalContext'
import { cn } from '@/lib/utils'

// Props para ModalHeader
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  
  // Props específicas del header
  title?: string
  description?: string
  
  // Layout options
  align?: 'left' | 'center' | 'right'
  showDivider?: boolean
}

/**
 * ModalHeader - Encabezado del modal con soporte para título y descripción
 * 
 * Puede usar el título del contexto o uno específico via props.
 * Maneja la alineación y estilos del encabezado.
 * 
 * Uso:
 * <Modal.Header title="Mi Modal" description="Descripción opcional" />
 * 
 * O con children personalizados:
 * <Modal.Header>
 *   <h2>Título personalizado</h2>
 *   <p>Contenido personalizado</p>
 * </Modal.Header>
 */
export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className,
  title: titleProp,
  description,
  align = 'left',
  showDivider = false,
  ...props
}) => {
  const { title: contextTitle } = useModal()
  
  // Usar título del prop o del contexto
  const finalTitle = titleProp || contextTitle

  // Clases para alineación
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  // Si hay children, renderizar contenido personalizado
  if (children) {
    return (
      <DialogHeader 
        className={cn(
          alignClasses[align],
          showDivider && 'border-b border-border pb-4',
          className
        )}
        {...props}
      >
        {children}
      </DialogHeader>
    )
  }

  // Renderizado estándar con título y descripción
  return (
    <DialogHeader 
      className={cn(
        alignClasses[align],
        showDivider && 'border-b border-border pb-4',
        className
      )}
      {...props}
    >
      {finalTitle && (
        <DialogTitle className="text-lg font-semibold">
          {finalTitle}
        </DialogTitle>
      )}
      {description && (
        <DialogDescription className="text-sm text-muted-foreground mt-1">
          {description}
        </DialogDescription>
      )}
    </DialogHeader>
  )
}

export default ModalHeader