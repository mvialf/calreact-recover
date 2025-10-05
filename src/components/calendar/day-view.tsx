
"use client";

import type { EventType } from '@/types/event';
import { CalendarEventCard } from './CalendarEventCard';
import {
  format,
  isToday,
  startOfDay,
  endOfDay
} from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface DayViewProps {
  currentDate: Date;
  events: EventType[];
  onEventClick: (event: EventType) => void;     // Ver detalles
  onEventDelete?: (event: EventType) => void;   // Eliminar
  onMoveEvent?: (eventId: string, newDate: Date) => void;
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  onEventDelete,
  onMoveEvent,
  enableDragAndDrop,
  enableResizing,
}: DayViewProps) {
  // 🎯 Hook simplificado - solo maneja eventos de DROP
  const { handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop();

  const dayEvents = events.filter(event => {
      const eventStartDay = startOfDay(event.startDate);
      const eventEndDay = startOfDay(event.endDate); // Compare start of day for multi-day events
      const currentViewDayStart = startOfDay(currentDate);
      return (eventStartDay <= currentViewDayStart && eventEndDay >= currentViewDayStart);
  }).sort((a,b) => a.startDate.getTime() - b.startDate.getTime());

  const dayISOString = currentDate.toISOString();

  const handleContainerDrop = (e: React.DragEvent) => {
    if (onMoveEvent) {
      const moveEventWrapper = (itemId: string, targetDate: string) => {
        onMoveEvent(itemId, new Date(targetDate));
      };
      handleDrop(e, dayISOString, moveEventWrapper);
    }
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    handleDragOver(e, dayISOString);
  };

  return (
    <div className="flex flex-col w-full bg-card rounded-lg shadow-md border border-border">
      {/* Header: Day Name and Date */}
      <div className="p-2 text-center font-medium text-sm border-b border-border sticky top-0 bg-card z-10">
        <div className={cn(isToday(currentDate) ? "text-primary" : "text-muted-foreground")}>
          {format(currentDate, 'EEEE')}
        </div>
        <div className={cn("text-lg font-semibold", isToday(currentDate) ? "text-primary" : "text-foreground")}>
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
      </div>

      {/* Body: Events List */}
      <div
        className={cn(
          "flex-grow overflow-auto p-2 space-y-2 transition-colors relative"
        )}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleContainerDrop}
      >
        {dayEvents.length > 0 ? (
          dayEvents.map(event => (
            <div key={event.id} className="w-full">
              <CalendarEventCard
                event={event}
                onClick={onEventClick}
                onDelete={onEventDelete}
                view="day"
                enableDragAndDrop={enableDragAndDrop}
                enableResizing={enableResizing}
              />
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground pt-4">No hay tareas para este día.</div>
        )}
      </div>
    </div>
  );
}
