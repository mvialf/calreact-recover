"use client";

import type { EventType } from '@/types/event';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, isSameDay } from '@/lib/calendar-utils';
import { Calendar, MapPin, FileText, Edit } from 'lucide-react';
import { ProjectSummary } from '@/components/summary/project-summary';

interface EventViewDialogProps {
  event: EventType | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: EventType) => void;
}

/**
 * Modal de vista rápida para eventos del calendario
 *
 * Muestra información del evento en modo solo lectura con:
 * - Nombre y tipo del evento
 * - Fechas (inicio y fin, o rango)
 * - Descripción
 * - Dirección (si aplica)
 * - Información específica según tipo (número de proyecto, cliente, etc.)
 *
 * Footer con botones: "Cerrar" y "Editar" (que cambia a modal de edición)
 */
export function EventViewDialog({
  event,
  isOpen,
  onClose,
  onEdit,
}: EventViewDialogProps) {
  if (!event) return null;

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  const formatDateRange = () => {
    if (isSameDay(event.startDate, event.endDate)) {
      return format(event.startDate, 'dd/MM/yyyy');
    }
    return `${format(event.startDate, 'dd/MM/yyyy')} - ${format(event.endDate, 'dd/MM/yyyy')}`;
  };

  const getEventColor = () => {
    // Si el evento tiene un color personalizado, usar ese primero
    if (event.color) return event.color;

    // Si no, asignar un color según el tipo
    switch(event.type) {
      case 'Proyecto':
        return 'hsl(221, 83%, 53%)'; // Azul
      case 'Postventa':
        return 'hsl(142, 71%, 45%)'; // Verde
      case 'Visita':
        return 'hsl(31, 90%, 50%)';  // Naranja
      default:
        return 'hsl(var(--primary))';
    }
  };

  const handleEdit = () => {
    onEdit(event);
    onClose(); // Cerrar modal de vista al abrir modal de edición
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl bg-card border-l-[16px]"
        style={{ borderLeftColor: getEventColor() }}
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl">{event.name}</DialogTitle>
              {event.type === 'Proyecto' && (
                <div className="mt-2">
                  <ProjectSummary
                    project={{
                      projectNumber: event.projectNumber,
                      clientName: event.clientName,
                      glosa: event.glosa,
                    }}
                    showProjectNumber={true}
                    layout="stacked"
                  />
                </div>
              )}
              {event.type !== 'Proyecto' && (
                <DialogDescription className="mt-1">
                  Detalles del evento
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Fecha */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Fecha</p>
              <p className="text-sm text-muted-foreground">
                {formatDateRange()}
              </p>
            </div>
          </div>

          {/* Dirección */}
          {event.fullAddress && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">
                    {event.fullAddress.textoCompleto ||
                     event.fullAddress.comune ||
                     event.fullAddress.componentes?.comuna ||
                     'Dirección no disponible'}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Descripción */}
          {event.description && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Descripción</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
