
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
  onEventClick: (event: EventType) => void;
  onEventDrop?: (eventId: string, newStartDate: Date, newEndDate: Date) => void;
  onEventResize?: (eventId: string, newStartDate: Date, newEndDate: Date) => void;
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
  weekStartsOn?: 0 | 1; 
}

export function CalendarView({
  currentDate,
  events,
  currentView,
  onEventClick,
  onEventDrop,
  onEventResize,
  enableDragAndDrop = true,
  enableResizing = true,
  weekStartsOn = 0,
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
          onMoveEvent={handleMoveEvent}
          weekStartsOn={weekStartsOn}
          enableDragAndDrop={enableDragAndDrop}
          enableResizing={enableResizing}
        />
      )}
      {currentView === 'week' && (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
          onMoveEvent={handleMoveEvent}
          weekStartsOn={weekStartsOn}
          enableDragAndDrop={enableDragAndDrop}
          enableResizing={enableResizing}
        />
      )}
      {currentView === 'day' && (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
          onMoveEvent={handleMoveEvent}
          enableDragAndDrop={enableDragAndDrop}
          enableResizing={enableResizing}
        />
      )}
    </div>
  );
}
