"use client"

import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar, type CalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface InputDateProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
  calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;
  placeholder?: string;
  disabled?: boolean;
}

export function InputDate({ 
  date, 
  onSelect, 
  className, 
  calendarProps,
  placeholder = "dd/mm/aaaa",
  disabled = false
}: InputDateProps) {
  const [open, setOpen] = React.useState(false)
  const [day, setDay] = React.useState("")
  const [month, setMonth] = React.useState("")
  const [year, setYear] = React.useState("")
  const [activeSegment, setActiveSegment] = React.useState<'day' | 'month' | 'year' | null>(null)
  
  const dayRef = React.useRef<HTMLInputElement>(null)
  const monthRef = React.useRef<HTMLInputElement>(null)
  const yearRef = React.useRef<HTMLInputElement>(null)

  // Sincronizar con la fecha externa (solo cuando cambia externamente)
  React.useEffect(() => {
    if (date) {
      const newDay = format(date, "dd")
      const newMonth = format(date, "MM")
      const newYear = format(date, "yyyy")
      
      // Solo actualizar si los valores son diferentes (evitar bucle)
      if (day !== newDay || month !== newMonth || year !== newYear) {
        setDay(newDay)
        setMonth(newMonth)
        setYear(newYear)
      }
    } else if (day || month || year) {
      // Solo limpiar si hay valores (evitar bucle)
      setDay("")
      setMonth("")
      setYear("")
    }
  }, [date]) // Removido day, month, year de dependencias

  // Construir y validar fecha cuando cambian los segmentos
  React.useEffect(() => {
    if (day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
      const dateString = `${day}/${month}/${year}`
      const parsedDate = parse(dateString, "dd/MM/yyyy", new Date())
      if (isValid(parsedDate)) {
        // Solo llamar onSelect si la fecha es diferente
        if (!date || parsedDate.getTime() !== date.getTime()) {
          onSelect(parsedDate)
        }
      }
    } else if (!day && !month && !year && date) {
      // Solo limpiar si hay una fecha actual
      onSelect(undefined)
    }
  }, [day, month, year]) // Removido onSelect y date de dependencias

  // Manejar cambios en segmentos
  const handleSegmentChange = (segment: 'day' | 'month' | 'year', value: string) => {
    // Solo permitir números
    const numericValue = value.replace(/\D/g, '')
    
    switch (segment) {
      case 'day':
        const dayValue = numericValue.slice(0, 2)
        setDay(dayValue)
        // Auto-avance: si completa 2 dígitos, ir al mes
        if (dayValue.length === 2) {
          monthRef.current?.focus()
          monthRef.current?.select()
        }
        break
      case 'month':
        const monthValue = numericValue.slice(0, 2)
        setMonth(monthValue)
        // Auto-avance: si completa 2 dígitos, ir al año
        if (monthValue.length === 2) {
          yearRef.current?.focus()
          yearRef.current?.select()
        }
        break
      case 'year':
        const yearValue = numericValue.slice(0, 4)
        setYear(yearValue)
        break
    }
  }

  // Manejar click en segmento
  const handleSegmentClick = (segment: 'day' | 'month' | 'year') => {
    setActiveSegment(segment)
    const ref = segment === 'day' ? dayRef : segment === 'month' ? monthRef : yearRef
    ref.current?.focus()
    ref.current?.select()
  }

  // Manejar teclas especiales
  const handleKeyDown = (segment: 'day' | 'month' | 'year', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (date) {
        setDay(format(date, "dd"))
        setMonth(format(date, "MM"))
        setYear(format(date, "yyyy"))
      } else {
        setDay("")
        setMonth("")
        setYear("")
      }
      e.currentTarget.blur()
    } else if (e.key === 'Backspace' && e.currentTarget.selectionStart === 0) {
      // Si está al inicio y presiona backspace, ir al segmento anterior
      e.preventDefault()
      if (segment === 'month' && day) {
        dayRef.current?.focus()
        dayRef.current?.setSelectionRange(day.length, day.length)
      } else if (segment === 'year' && month) {
        monthRef.current?.focus()
        monthRef.current?.setSelectionRange(month.length, month.length)
      }
    }
  }

  // Manejar selección desde el calendario
  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate)
    setOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center w-max gap-1">
          {/* Contenedor del input */}
          <div className="relative flex-1">
            {/* Input segmentado */}
            <div className={cn(
              "flex h-10 w-max rounded-md border border-input bg-background text-sm ring-offset-background",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              disabled && "cursor-not-allowed opacity-50"
            )}>
              {/* Día */}
              <input
                ref={dayRef}
                type="text"
                value={day}
                onChange={(e) => handleSegmentChange('day', e.target.value)}
                onClick={() => handleSegmentClick('day')}
                onKeyDown={(e) => handleKeyDown('day', e)}
                onFocus={() => setActiveSegment('day')}
                onBlur={() => setActiveSegment(null)}
                placeholder="dd"
                disabled={disabled}
                className={cn(
                  "w-10 bg-transparent px-2 py-1 text-center outline-none",
                  "placeholder:text-muted-foreground",
                  activeSegment === 'day' && "bg-accent/50 rounded-sm"
                )}
                maxLength={2}
              />
              <span className="flex items-center text-muted-foreground">/</span>
              
              {/* Mes */}
              <input
                ref={monthRef}
                type="text"
                value={month}
                onChange={(e) => handleSegmentChange('month', e.target.value)}
                onClick={() => handleSegmentClick('month')}
                onKeyDown={(e) => handleKeyDown('month', e)}
                onFocus={() => setActiveSegment('month')}
                onBlur={() => setActiveSegment(null)}
                placeholder="mm"
                disabled={disabled}
                className={cn(
                  "w-10 bg-transparent px-2 py-1 text-center outline-none",
                  "placeholder:text-muted-foreground",
                  activeSegment === 'month' && "bg-accent/50 rounded-sm"
                )}
                maxLength={2}
              />
              <span className="flex items-center text-muted-foreground">/</span>
              
              {/* Año */}
              <input
                ref={yearRef}
                type="text"
                value={year}
                onChange={(e) => handleSegmentChange('year', e.target.value)}
                onClick={() => handleSegmentClick('year')}
                onKeyDown={(e) => handleKeyDown('year', e)}
                onFocus={() => setActiveSegment('year')}
                onBlur={() => setActiveSegment(null)}
                placeholder="aaaa"
                disabled={disabled}
                className={cn(
                  "w-14 bg-transparent px-2 py-1 text-center outline-none",
                  "placeholder:text-muted-foreground",
                  activeSegment === 'year' && "bg-accent/50 rounded-sm"
                )}
                maxLength={4}
              />
            </div>
          </div>
          
          {/* Botón del calendario separado */}
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "h-10 w-10 flex items-center justify-center",
                "hover:text-primary transition-colors",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </PopoverTrigger>
        </div>
        
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleCalendarSelect}
            initialFocus
            locale={es}
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
