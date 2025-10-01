
"use client";

import type { EventType } from '@/types/event';
import { CalendarEventCard } from './CalendarEventCard';
import {
  getDaysInMonth,
  isSameMonth,
  isToday,
  format,
  startOfDay,
  endOfDay
} from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface MonthViewProps {
  currentDate: Date;
  events: EventType[];
  onEventClick: (event: EventType) => void;
  onMoveEvent?: (eventId: string, newDate: Date) => void;
  weekStartsOn?: 0 | 1;
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onMoveEvent,
  weekStartsOn = 0, // Default to Sunday
  enableDragAndDrop,
  enableResizing,
}: MonthViewProps) {
  // 🎯 Hook simplificado - solo maneja eventos de DROP
  const { handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop();

  const weeks = getDaysInMonth(currentDate, weekStartsOn);

  // Day names in Spanish, considering weekStartsOn
  let dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  if (weekStartsOn === 1) { // Monday start
    dayNames.push(dayNames.shift()!);
  }


  const getEventsForDay = (day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return events
      .filter(event => {
        const eventStart = startOfDay(event.startDate); // Compare date parts only for month view span
        const eventEnd = startOfDay(event.endDate);
        return (eventStart <= dayEnd && eventEnd >= dayStart);
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  };

  // Componente para cada celda de día con soporte para soltar
  const DayCell = ({ day, dayEvents, index }: { day: Date; dayEvents: EventType[]; index: number }) => {
    const dayISOString = day.toISOString();

    const handleCellDrop = (e: React.DragEvent) => {
      if (onMoveEvent) {
        // Convertir el itemId a una función que espera (itemId, targetDate)
        const moveEventWrapper = (itemId: string, targetDate: string) => {
          onMoveEvent(itemId, new Date(targetDate));
        };
        handleDrop(e, dayISOString, moveEventWrapper);
      }
    };

    const handleCellDragOver = (e: React.DragEvent) => {
      handleDragOver(e, dayISOString);
    };

    return (
      <div
        key={index}
        className={cn(
          "border-r border-b border-border p-1.5 flex flex-col bg-card relative cursor-pointer transition-colors duration-150 min-h-0 w-full",
          !isSameMonth(day, currentDate) && "bg-muted/30 text-muted-foreground/60",
          isToday(day) && "bg-primary/10",
          (index + 1) % 7 === 0 && "border-r-0" // No right border for last column
        )}
        onDragOver={handleCellDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleCellDrop}
      >
        <span
          className={cn(
            "self-start mb-1 text-xs font-medium p-1 rounded-full h-6 w-6 flex items-center justify-center",
            isToday(day) ? "bg-primary text-primary-foreground" : "text-foreground"
          )}
        >
          {format(day, 'd')}
        </span>
        <div className="flex-grow space-y-0.5">
          {dayEvents.slice(0, 3).map(event => (
            <CalendarEventCard
              key={event.id}
              event={event}
              onClick={onEventClick}
              view="month"
              enableDragAndDrop={enableDragAndDrop}
              enableResizing={enableResizing}
            />
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-muted-foreground p-1 text-center">
              +{dayEvents.length - 3} más
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col size-full">
      <div className="grid grid-cols-7 w-full border-b border-border">
        {dayNames.map(dayName => (
          <div key={dayName} className="p-2 text-center font-medium text-sm text-muted-foreground">
            {dayName}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 w-full">
        {weeks.flat().map((day, index) => (
          <DayCell 
            key={index} 
            day={day} 
            dayEvents={getEventsForDay(day)} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
}
