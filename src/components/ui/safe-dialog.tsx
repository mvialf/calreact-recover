'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';

// Componente wrapper para DialogContent que automáticamente agrega DialogDescription si no existe
const SafeDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent> & {
    autoDescription?: string;
  }
>(({ children, autoDescription = 'Diálogo de la aplicación', ...props }, ref) => {
  // Verificar si ya existe un DialogDescription en los children
  const hasDescription = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child)) {
      // Verificar si es un DialogDescription directo
      if (child.type === DialogDescription) {
        return true;
      }
      
      // Verificar si es un DialogHeader que contiene DialogDescription
      if (child.type === DialogHeader) {
        const headerChildren = React.Children.toArray(child.props.children);
        return headerChildren.some((headerChild) => {
          return React.isValidElement(headerChild) && headerChild.type === DialogDescription;
        });
      }
    }
    return false;
  });

  return (
    <DialogContent ref={ref} {...props}>
      {!hasDescription && (
        <DialogDescription className="sr-only">
          {autoDescription}
        </DialogDescription>
      )}
      {children}
    </DialogContent>
  );
});

SafeDialogContent.displayName = 'SafeDialogContent';

// Hook para usar con diálogos seguros
export const useSafeDialog = (description?: string) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const openDialog = React.useCallback(() => setIsOpen(true), []);
  const closeDialog = React.useCallback(() => setIsOpen(false), []);
  
  const DialogWrapper = React.useCallback(({ children, ...props }: React.ComponentProps<typeof Dialog>) => (
    <Dialog open={isOpen} onOpenChange={setIsOpen} {...props}>
      {children}
    </Dialog>
  ), [isOpen]);
  
  const SafeContent = React.useCallback(({ children, ...props }: React.ComponentProps<typeof SafeDialogContent>) => (
    <SafeDialogContent autoDescription={description} {...props}>
      {children}
    </SafeDialogContent>
  ), [description]);
  
  return {
    isOpen,
    openDialog,
    closeDialog,
    DialogWrapper,
    SafeContent,
  };
};

// Exportar todos los componentes originales más el SafeDialogContent
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  SafeDialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

// Componente de conveniencia para diálogos simples
export const SimpleDialog = React.forwardRef<
  HTMLDivElement,
  {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
  }
>(({ isOpen, onClose, title, description, children, className }, ref) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <SafeDialogContent className={className} ref={ref} autoDescription={description || `Diálogo: ${title}`}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && (
          <DialogDescription>{description}</DialogDescription>
        )}
      </DialogHeader>
      {children}
    </SafeDialogContent>
  </Dialog>
));

SimpleDialog.displayName = 'SimpleDialog';
