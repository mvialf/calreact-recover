
"use client";

import type { EventType } from '@/types/event';
import { CalendarEventCard } from './CalendarEventCard';
import {
  getDaysInWeek,
  format,
  isToday,
  startOfDay,
  endOfDay
} from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface WeekViewProps {
  currentDate: Date;
  events: EventType[];
  onEventClick: (event: EventType) => void;     // Ver detalles
  onEventEdit?: (event: EventType) => void;     // Editar
  onEventDelete?: (event: EventType) => void;   // Eliminar
  onMoveEvent?: (eventId: string, newDate: Date) => void;
  weekStartsOn?: 0 | 1;
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
  visibleDays?: number[];
}

// Componente auxiliar para cada columna de día
function DayColumn({
  day,
  dayEvents,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onMoveEvent,
  enableDragAndDrop,
  enableResizing,
  handleDragOver,
  handleDragLeave,
  handleDrop,
}: {
  day: Date;
  dayEvents: EventType[];
  onEventClick: (event: EventType) => void;
  onEventEdit?: (event: EventType) => void;
  onEventDelete?: (event: EventType) => void;
  onMoveEvent?: (eventId: string, newDate: Date) => void;
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
  handleDragOver: (e: React.DragEvent, targetId?: string) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetDate: string, onMoveEvent: (itemId: string, targetDate: string) => void) => void;
}) {
  const dayISOString = day.toISOString();

  const handleColumnDrop = (e: React.DragEvent) => {
    if (onMoveEvent) {
      const moveEventWrapper = (itemId: string, targetDate: string) => {
        onMoveEvent(itemId, new Date(targetDate));
      };
      handleDrop(e, dayISOString, moveEventWrapper);
    }
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    handleDragOver(e, dayISOString);
  };

  return (
    <div
      className={cn(
        "border-r border-border last:border-r-0 p-1.5 space-y-1.5 overflow-y-auto min-h-[calc(100vh-220px)] transition-colors relative",
        isToday(day) && "bg-primary/5"
      )}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleColumnDrop}
    >
      {dayEvents.length > 0 ? (
        dayEvents.map(event => (
          <div key={event.id} className="w-full">
            <CalendarEventCard
              event={event}
              onClick={onEventClick}
              onEdit={onEventEdit}
              onDelete={onEventDelete}
              view="week"
              enableDragAndDrop={enableDragAndDrop}
              enableResizing={enableResizing}
            />
          </div>
        ))
      ) : (
        <div className="text-center text-xs text-muted-foreground pt-2">Vacío</div>
      )}

      {/* Área invisible para que todo el espacio sea droppable, no solo donde hay eventos */}
      {enableDragAndDrop && (
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onMoveEvent,
  weekStartsOn = 0,
  enableDragAndDrop,
  enableResizing,
  visibleDays = [1, 2, 3, 4, 5], // Lun-Vie por defecto
}: WeekViewProps) {
  // 🎯 Hook simplificado - solo maneja eventos de DROP
  const { handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop();

  // Obtener todos los días de la semana
  const allDays = getDaysInWeek(currentDate, weekStartsOn);

  // Filtrar para mostrar solo días visibles
  const filteredDays = allDays.filter(day => visibleDays.includes(day.getDay()));

  const getEventsForDay = (day: Date) => {
    const currentViewDayStart = startOfDay(day);
    return events
      .filter(event => {
        const eventStartDay = startOfDay(event.startDate);
        const eventEndDay = startOfDay(event.endDate); // Compare start of day for multi-day events
        return (eventStartDay <= currentViewDayStart && eventEndDay >= currentViewDayStart);
      })
      .sort((a, b) => {
        // Si ambos eventos tienen displayOrder, ordenar por ese campo
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          return a.displayOrder - b.displayOrder;
        }
        // Si solo uno tiene displayOrder, priorizarlo
        if (a.displayOrder !== undefined) return -1;
        if (b.displayOrder !== undefined) return 1;
        // De lo contrario, ordenar por fecha de inicio como fallback
        return a.startDate.getTime() - b.startDate.getTime();
      });
  };

  return (
    <div className="flex flex-col w-full bg-card rounded-lg shadow-md border border-border">
      {/* Header: Day Names */}
      <div
        className="grid border-b border-border sticky top-0 bg-card z-10"
        style={{ gridTemplateColumns: `repeat(${filteredDays.length}, 1fr)` }}
      >
        {filteredDays.map(day => (
          <div
            key={day.toISOString()}
            className={cn(
              "p-2 text-center font-medium text-sm border-r border-border last:border-r-0",
              isToday(day) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div>{format(day, 'EEE')}</div>
            <div className={cn("text-lg font-semibold", isToday(day) ? "text-primary" : "text-foreground")}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Body: Day Columns with Events List */}
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${filteredDays.length}, 1fr)` }}
      >
        {filteredDays.map(day => {
          const dayEvents = getEventsForDay(day);

          return (
            <DayColumn
              key={day.toISOString()}
              day={day}
              dayEvents={dayEvents}
              onEventClick={onEventClick}
              onEventEdit={onEventEdit}
              onEventDelete={onEventDelete}
              onMoveEvent={onMoveEvent}
              enableDragAndDrop={enableDragAndDrop}
              enableResizing={enableResizing}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
            />
          );
        })}
      </div>
    </div>
  );
}