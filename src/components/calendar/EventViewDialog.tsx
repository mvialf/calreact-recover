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
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from '@/lib/calendar-utils';
import { Calendar, FileText, Phone } from 'lucide-react';
import { ProjectSummary, ProjectEventDetails, AddressSummary } from '@/components/summary';
import { getStatusBadgeVariant } from '@/utils/badge-helpers';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';

interface EventViewDialogProps {
  event: EventType | null;
  isOpen: boolean;
  onClose: () => void;
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
 * Footer con botón: "Cerrar"
 */
export function EventViewDialog({
  event,
  isOpen,
  onClose,
}: EventViewDialogProps) {
  if (!event) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md bg-card border-l-[16px]"
        style={{ borderLeftColor: getEventColor() }}
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {event.type === 'Proyecto' ? (
                <DialogTitle>
                  <div className="flex items-center justify-between gap-4">
                    <ProjectSummary
                      project={{
                        projectNumber: event.projectNumber,
                        clientName: event.clientName,
                        glosa: event.glosa,
                      }}
                      showProjectNumber={true}
                      layout="stacked"
                      size="sm"
                    />
                    <div className="flex flex-col gap-2 text-sm text-base font-normal">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange()}</span>
                      </div>
                    </div>
                  </div>
                </DialogTitle>
              ) : (
                <>
                  <DialogTitle className="text-sm">{event.name}</DialogTitle>
                  <DialogDescription className="mt-1">
                    Detalles del evento
                  </DialogDescription>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 py-4">
          
          {/* Detalles del Proyecto */}
          <ProjectEventDetails event={event} />

          {/* Descripción para eventos no-proyecto (Visita, Postventa) */}
          {event.type !== 'Proyecto' && event.description && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Descripción</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
