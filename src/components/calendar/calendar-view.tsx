
"use client";

import type { EventType, ViewOption } from '@/types/event';
import { MonthView } from './month-view';
import { WeekView } from './week-view';
import { DayView } from './day-view';
import { startOfDay } from '@/lib/calendar-utils';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface CalendarViewProps {
  currentDate: Date;
  events: EventType[];
  currentView: ViewOption;
  onEventClick: (event: EventType) => void;     // Ver detalles
  onEventEdit?: (event: EventType) => void;     // Editar
  onEventDelete?: (event: EventType) => void;   // Eliminar
  onEventDrop?: (eventId: string, newStartDate: Date, newEndDate: Date) => void;
  onEventResize?: (eventId: string, newStartDate: Date, newEndDate: Date) => void;
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
  weekStartsOn?: 0 | 1;
  visibleDays?: number[];
}

export function CalendarView({
  currentDate,
  events,
  currentView,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onEventDrop,
  onEventResize,
  enableDragAndDrop = true,
  enableResizing = true,
  weekStartsOn = 0,
  visibleDays = [1, 2, 3, 4, 5], // Lun-Vie por defecto
}: CalendarViewProps) {

  // 🎯 Adapter: convertir onEventDrop (3 params) a onMoveEvent (2 params)
  // Las vistas calculan la duración del evento internamente
  const handleMoveEvent = (eventId: string, newStartDate: Date) => {
    if (onEventDrop) {
      // Buscar el evento para obtener su duración
      const event = events.find(e => e.id === eventId);
      if (event) {
        const duration = event.endDate.getTime() - event.startDate.getTime();
        const newEndDate = new Date(newStartDate.getTime() + duration);
        onEventDrop(eventId, newStartDate, newEndDate);
      }
    }
  };

  return (
    <div className="size-full flex flex-col">
      {currentView === 'month' && (
        <MonthView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
          onEventEdit={onEventEdit}
          onEventDelete={onEventDelete}
          onMoveEvent={handleMoveEvent}
          weekStartsOn={weekStartsOn}
          enableDragAndDrop={enableDragAndDrop}
          enableResizing={enableResizing}
          visibleDays={visibleDays}
        />
      )}
      {currentView === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
          onEventEdit={onEventEdit}
          onEventDelete={onEventDelete}
          onMoveEvent={handleMoveEvent}
          weekStartsOn={weekStartsOn}
          enableDragAndDrop={enableDragAndDrop}
          enableResizing={enableResizing}
          visibleDays={visibleDays}
        />
      )}
      {currentView === 'day' && (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
          onEventEdit={onEventEdit}
          onEventDelete={onEventDelete}
          onMoveEvent={handleMoveEvent}
          enableDragAndDrop={enableDragAndDrop}
          enableResizing={enableResizing}
        />
      )}
    </div>
  );
}
