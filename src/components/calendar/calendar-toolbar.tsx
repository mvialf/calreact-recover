"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from '@/lib/calendar-utils';
import type { ViewOption } from '@/types/event';
import { ChevronLeft, ChevronRight, Search, CalendarDays, Columns, SigmaSquare } from 'lucide-react';
import { CalendarDayFilter } from './calendar-day-filter';

interface CalendarToolbarProps {
  currentDate: Date;
  currentView: ViewOption;
  filterTerm: string;
  visibleDays: number[];
  onDateChange: (newDate: Date) => void;
  onViewChange: (newView: ViewOption) => void;
  onFilterChange: (term: string) => void;
  onVisibleDaysChange: (days: number[]) => void;
  onToday: () => void;
}

export function CalendarToolbar({
  currentDate,
  currentView,
  filterTerm,
  visibleDays,
  onDateChange,
  onViewChange,
  onFilterChange,
  onVisibleDaysChange,
  onToday,
}: CalendarToolbarProps) {
  
  const handlePrev = () => {
    let newDate;
    if (currentView === 'month') {
      newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    } else if (currentView === 'week') {
      // Retroceder una semana completa desde el inicio de la semana actual
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      newDate = subWeeks(weekStart, 1);
    } else { // day
      newDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate;
    if (currentView === 'month') {
      newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    } else if (currentView === 'week') {
      // Avanzar una semana completa desde el inicio de la semana actual
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      newDate = addWeeks(weekStart, 1);
    } else { // day
      newDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    onDateChange(newDate);
  };

  const getTitle = () => {
    if (currentView === 'month') {
      return format(currentDate, 'MMMM yyyy');
    }
    if (currentView === 'week') {
      // Obtener el inicio y fin de la semana (lunes a domingo)
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      const start = format(weekStart, 'MMM d');
      const end = format(weekEnd, 'MMM d, yyyy');
      return `${start} - ${end}`;
    }
    return format(currentDate, 'MMMM d, yyyy');
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b  border-border bg-card rounded-lg">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button variant="outline" onClick={onToday}>Hoy</Button>
        <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Periodo anterior">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext} aria-label="Periodo siguiente">
          <ChevronRight className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-foreground ml-2 whitespace-nowrap">
          {getTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
        <div className="relative w-full sm:w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Filtrar eventos..."
            value={filterTerm}
            onChange={(e) => onFilterChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filtro de días (solo visible en week/month view) */}
        {(currentView === 'week' || currentView === 'month') && (
          <CalendarDayFilter
            visibleDays={visibleDays}
            onVisibleDaysChange={onVisibleDaysChange}
          />
        )}

        <Select value={currentView} onValueChange={(value) => onViewChange(value as ViewOption)}>
          <SelectTrigger className="w-full sm:w-[120px]" aria-label="Seleccionar vista de calendario">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month"><CalendarDays className="inline-block mr-2 h-4 w-4"/>Mes</SelectItem>
            <SelectItem value="week"><Columns className="inline-block mr-2 h-4 w-4"/>Semana</SelectItem>
            <SelectItem value="day"><SigmaSquare className="inline-block mr-2 h-4 w-4"/>Día</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
