"use client";

import type { EventType } from '@/types/event';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';

interface EventDeleteDialogProps {
  event: EventType | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (event: EventType) => void;
}

/**
 * Dialog de confirmación para eliminación de eventos
 *
 * Usa AlertDialog para indicar que la acción es destructiva e irreversible.
 * Muestra el nombre del evento que se va a eliminar y requiere confirmación
 * explícita del usuario.
 *
 * Estado de loading (isDeleting) desactiva botones durante la operación.
 */
export function EventDeleteDialog({
  event,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: EventDeleteDialogProps) {
  if (!event) return null;

  const handleConfirm = () => {
    onConfirm(event);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el evento:{' '}
            <span className="font-semibold text-foreground">
              {event.name}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
