"use client"

import React from 'react'
import { cn } from '@/lib/utils'

// Props para ModalBody
export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  
  // Layout options
  padding?: 'none' | 'sm' | 'md' | 'lg'
  scrollable?: boolean
  maxHeight?: string
}

/**
 * ModalBody - Contenedor principal del contenido del modal
 * 
 * Maneja el padding, scroll y layout del contenido principal.
 * Es el área donde va el contenido principal del modal (formularios, texto, etc.)
 * 
 * Uso:
 * <Modal.Body padding="lg" scrollable>
 *   <form>...</form>
 * </Modal.Body>
 */
export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  padding = 'md',
  scrollable = false,
  maxHeight,
  style,
  ...props
}) => {
  // Mapeo de padding
  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4', 
    lg: 'p-6'
  }

  // Clases base
  const baseClasses = cn(
    // Padding
    paddingClasses[padding],
    
    // Configuración de scroll
    scrollable && 'overflow-y-auto',
    
    // Flex para layout
    'flex-1',
    
    // Clases personalizadas
    className
  )

  // Estilos dinámicos
  const dynamicStyles = {
    ...style,
    ...(maxHeight && { maxHeight }),
    ...(scrollable && !maxHeight && { maxHeight: '60vh' })
  }

  return (
    <div 
      className={baseClasses}
      style={dynamicStyles}
      {...props}
    >
      {children}
    </div>
  )
}

export default ModalBody