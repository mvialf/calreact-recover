"use client"

import React from 'react'
import { DialogContent } from '@/components/ui/dialog'
import { useModal } from './ModalContext'
import { cn } from '@/lib/utils'

// Mapeo de tamaños a clases CSS
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg', 
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]'
} as const

// Props para ModalContent
export interface ModalContentProps extends 
  React.ComponentPropsWithoutRef<typeof DialogContent> {
  children: React.ReactNode
  
  // Override del tamaño desde el contexto
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  
  // Configuraciones adicionales
  scrollable?: boolean
}

/**
 * ModalContent - Contenedor principal del contenido del modal
 * 
 * Maneja el tamaño, scroll y layout del contenido.
 * Obtiene configuración del contexto pero permite overrides.
 * 
 * Uso:
 * <Modal.Content size="lg" scrollable>
 *   ...contenido
 * </Modal.Content>
 */
export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className,
  size: sizeProp,
  scrollable = false,
  ...props
}) => {
  const { size: contextSize } = useModal()
  
  // Usar tamaño del prop o del contexto
  const finalSize = sizeProp || contextSize || 'md'
  
  // Clases base para el contenido
  const baseClasses = cn(
    // Tamaño del modal
    sizeClasses[finalSize],
    
    // Configuración de scroll
    scrollable && 'max-h-[80vh] overflow-y-auto',
    
    // Clases personalizadas
    className
  )

  return (
    <DialogContent 
      className={baseClasses}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

export default ModalContent