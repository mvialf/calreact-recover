"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface ModalLayoutProps {
  /**
   * Indica si la modal está abierta o cerrada
   */
  isOpen: boolean;
  /**
   * Título que se mostrará en la cabecera de la modal
   */
  title: string;
  /**
   * Contenido que se renderizará en el cuerpo de la modal
   */
  children: React.ReactNode;
  /**
   * Función que se ejecutará al cerrar la modal
   */
  onClose: () => void;
  /**
   * Función opcional que se ejecutará al hacer clic en el botón de submit
   * Si no se proporciona, se espera que el formulario maneje su propio submit
   */
  onSubmit?: () => void;
  /**
   * Indica si la acción de guardar está en curso
   */
  isSubmitting?: boolean;
  /**
   * Texto personalizado para el botón de acción principal (por defecto: 'Crear')
   */
  submitButtonText?: string;
  /**
   * Clase CSS adicional para el contenedor principal
   */
  className?: string;
  /**
   * Deshabilitar el botón de guardar
   */
  disabled?: boolean;
  /**
   * Si es true, muestra los botones por defecto (Cancelar y Guardar)
   * Si es false, permite que el contenido de la modal maneje sus propios botones
   */
  showDefaultButtons?: boolean;
  /**
   * Si es true, oculta completamente el footer
   */
  hideFooter?: boolean;
  /**
   * Referencia al formulario para trigger de submit
   */
  formRef?: React.RefObject<HTMLFormElement>;
}

/**
 * Componente de ventana modal base para todos los eventos.
 * Proporciona una estructura consistente con cabecera, cuerpo scrollable y pie con botones de acción.
 * Implementa Dialog de shadcn/ui para el comportamiento modal completo.
 */
export function ModalLayout({
  isOpen,
  title,
  children,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Crear",
  className,
  disabled = false,
  showDefaultButtons = true,
  hideFooter = false,
  formRef,
}: ModalLayoutProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("p-0 gap-0 w-full", className)}>
        <DialogHeader className="bg-background px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Formulario modal para {title.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        
        {/* Contenido con scroll */}
        <div className="bg-card max-h-[75vh] overflow-y-auto px-6 py-2">
          {children}
        </div>
        
        {!hideFooter && showDefaultButtons && (
          <DialogFooter className="bg-card flex justify-end space-x-2 py-4 px-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (formRef?.current) {
                  formRef.current.requestSubmit();
                } else if (onSubmit) {
                  onSubmit();
                }
              }}
              disabled={disabled || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}