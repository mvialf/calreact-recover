
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
  onEventClick: (event: EventType) => void;     // Ver detalles
  onEventDelete?: (event: EventType) => void;   // Eliminar
  onMoveEvent?: (eventId: string, newDate: Date) => void;
  weekStartsOn?: 0 | 1;
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
  visibleDays?: number[];
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onEventDelete,
  onMoveEvent,
  weekStartsOn = 0, // Default to Sunday
  enableDragAndDrop,
  enableResizing,
  visibleDays = [1, 2, 3, 4, 5], // Lun-Vie por defecto
}: MonthViewProps) {
  // 🎯 Hook simplificado - solo maneja eventos de DROP
  const { handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop();

  const weeks = getDaysInMonth(currentDate, weekStartsOn);

  // Day names in Spanish, considering weekStartsOn
  let allDayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  if (weekStartsOn === 1) { // Monday start
    allDayNames.push(allDayNames.shift()!);
  }

  // Filtrar nombres de días para mostrar solo días visibles
  // Mapeo de nombres a números de día (0=Dom, 1=Lun, etc.)
  const dayNameToNumber = weekStartsOn === 1
    ? [1, 2, 3, 4, 5, 6, 0] // Lun-Dom cuando empieza en lunes
    : [0, 1, 2, 3, 4, 5, 6]; // Dom-Sáb cuando empieza en domingo

  const visibleDayNames = allDayNames.filter((_, index) =>
    visibleDays.includes(dayNameToNumber[index])
  );

  const visibleDayNumbers = dayNameToNumber.filter(dayNum => visibleDays.includes(dayNum));


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
  const DayCell = ({ day, dayEvents, cellIndex, visibleCols }: {
    day: Date;
    dayEvents: EventType[];
    cellIndex: number;
    visibleCols: number;
  }) => {
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
        className={cn(
          "border-r border-b border-border p-1.5 flex flex-col bg-card relative cursor-pointer transition-colors duration-150 min-h-0 w-full",
          !isSameMonth(day, currentDate) && "bg-muted/30 text-muted-foreground/60",
          isToday(day) && "bg-primary/10",
          (cellIndex + 1) % visibleCols === 0 && "border-r-0" // No right border for last visible column
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
              onDelete={onEventDelete}
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

  // Filtrar todos los días del mes para mostrar solo los días visibles
  const allDays = weeks.flat();
  const filteredDays = allDays.filter(day => visibleDayNumbers.includes(day.getDay()));

  return (
    <div className="flex flex-col size-full">
      {/* Header con nombres de días filtrados */}
      <div
        className="grid w-full border-b border-border"
        style={{ gridTemplateColumns: `repeat(${visibleDayNames.length}, 1fr)` }}
      >
        {visibleDayNames.map(dayName => (
          <div key={dayName} className="p-2 text-center font-medium text-sm text-muted-foreground">
            {dayName}
          </div>
        ))}
      </div>

      {/* Grid de días filtrados */}
      <div
        className="grid flex-1 w-full"
        style={{ gridTemplateColumns: `repeat(${visibleDayNames.length}, 1fr)` }}
      >
        {filteredDays.map((day, cellIndex) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            dayEvents={getEventsForDay(day)}
            cellIndex={cellIndex}
            visibleCols={visibleDayNames.length}
          />
        ))}
      </div>
    </div>
  );
}
