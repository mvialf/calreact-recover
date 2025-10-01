"use client";

import { useMemo } from 'react';
import type { EventType } from '@/types/event';
import { isSameDay } from '@/lib/calendar-utils';
import { isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import type React from 'react';
import { eventLogger } from '@/lib/logger';
import { EVENT_RENDERERS, DefaultEventRenderer} from './event-renderers';

interface CalendarEventCardProps {
  event: EventType;
  onClick: (event: EventType) => void;
  view: 'month' | 'week' | 'day';
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
}

// Función para validar y normalizar las fechas del evento
const useValidatedEvent = (event: EventType) => {
  return useMemo(() => {
    try {
      // Crear nuevas instancias de fecha para evitar mutaciones
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      // Validar que las fechas sean válidas
      if (!isValid(startDate) || !isValid(endDate)) {
        eventLogger.error('Fechas de evento inválidas', { startDate, endDate });
        return null;
      }

      return {
        ...event,
        startDate,
        endDate
      };
    } catch (error) {
      eventLogger.error('Error al procesar fechas del evento', error);
      return null;
    }
  }, [event]);
};

export function CalendarEventCard({
  event: originalEvent,
  onClick,
  view,
  enableDragAndDrop
}: CalendarEventCardProps) {
  // 🔥 TODOS LOS HOOKS AL INICIO - ANTES DE CUALQUIER EARLY RETURN

  // Hook para validar evento
  const event = useValidatedEvent(originalEvent);

  // Hook para verificar si es multi-día
  const isMultiDay = useMemo(() => {
    if (!event) return false;
    try {
      return !isSameDay(event.startDate, event.endDate);
    } catch (error) {
      eventLogger.error('Error al verificar si es evento de varios días', error);
      return false;
    }
  }, [event]);

  // 🔥 AHORA SÍ SE PUEDEN HACER EARLY RETURNS

  // Si el evento no es válido, no renderizar nada
  if (!event) {
    eventLogger.warn('Evento inválido, no se renderizará', { originalEvent });
    return null;
  }

  /**
   * Handler de drag start - AUTO-CONTENIDO
   * Configura dataTransfer con el ID del evento (HTML5 nativo)
   */
  const handleDragStart = (e: React.DragEvent) => {
    // 🔥 CRÍTICO: Configurar dataTransfer (requisito HTML5 API)
    e.dataTransfer.setData("text/plain", event.id);
    e.dataTransfer.effectAllowed = "move";

    // Agregar clase visual para feedback
    const target = e.target as HTMLElement;
    target.classList.add("dragging");

    eventLogger.debug('Drag started', { eventId: event.id, eventName: event.name });
  };

  /**
   * Handler de drag end - AUTO-CONTENIDO
   * Limpia el estado visual después del drag
   */
  const handleDragEnd = (e: React.DragEvent) => {
    // Remover clase visual
    const target = e.target as HTMLElement;
    target.classList.remove("dragging");

    eventLogger.debug('Drag ended', { eventId: event.id });
  };

  // Determinar el color según el tipo de evento
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

  // Estilos para el evento
  const style = {
    borderLeftColor: getEventColor(),
    cursor: enableDragAndDrop ? 'grab' : 'pointer',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(event);
  };

  // Formatear la fecha en formato local
  const formatLocalDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTooltipText = () => {
    let text = event.name;

    if (isMultiDay) {
      text += `\nDel ${formatLocalDate(event.startDate)} al ${formatLocalDate(event.endDate)}`;
    } else {
      text += `\n${formatLocalDate(event.startDate)}`;
    }

    if (event.description) {
      text += `\n\n${event.description}`;
    }

    return text;
  };

  // Registry Pattern: Selección dinámica de renderer según tipo de evento
  const Renderer = EVENT_RENDERERS[event.type as keyof typeof EVENT_RENDERERS] || DefaultEventRenderer;

  return (
    <div
      draggable={enableDragAndDrop && !!event}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={style}
      className={cn(
        "bg-card dark:bg-[hsl(240,5%,12%)] text-card-foreground",
        "border border-border/60",
        "border-l-4",
        "p-1.5 rounded-md text-xs overflow-hidden shadow-sm hover:shadow-md relative",
        enableDragAndDrop && "cursor-grab active:cursor-grabbing"
      )}
      onClick={handleClick}
      title={getTooltipText()}
      data-calendar-event="true" // CRÍTICO: Para detección de clicks en componente padre
    >
      {/* 🎯 REGISTRY PATTERN PRESERVADO 100% */}
      <Renderer event={event} view={view} />
    </div>
  );
}