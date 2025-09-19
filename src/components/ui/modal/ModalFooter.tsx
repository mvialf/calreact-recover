"use client"

import React from 'react'
import { DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Props para ModalFooter
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  
  // Layout options
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  direction?: 'row' | 'row-reverse' | 'column'
  showDivider?: boolean
  sticky?: boolean
}

/**
 * ModalFooter - Pie del modal para acciones y botones
 * 
 * Proporciona layout flexible para botones y acciones del modal.
 * Puede ser sticky para mantenerse visible en modales con scroll.
 * 
 * Uso:
 * <Modal.Footer justify="end" showDivider>
 *   <Button variant="ghost">Cancelar</Button>
 *   <Button>Guardar</Button>
 * </Modal.Footer>
 */
export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
  justify = 'end',
  direction = 'row',
  showDivider = true,
  sticky = false,
  ...props
}) => {
  // Mapeo de justificación
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center', 
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }

  // Mapeo de dirección
  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    column: 'flex-col'
  }

  // Clases base
  const baseClasses = cn(
    // Layout flex
    'flex gap-2',
    justifyClasses[justify],
    directionClasses[direction],
    
    // Espaciado y bordes
    showDivider && 'border-t border-border pt-4',
    
    // Sticky positioning
    sticky && 'sticky bottom-0 bg-background',
    
    // Clases personalizadas
    className
  )

  return (
    <DialogFooter 
      className={baseClasses}
      {...props}
    >
      {children}
    </DialogFooter>
  )
}

export default ModalFooter