"use client"

import * as React from "react"
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import { Calendar } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

// Opciones de días de la semana (lunes primero)
// Solo Sábado y Domingo son configurables (Lun-Vie siempre visibles)
const WEEKDAY_OPTIONS = [
  { label: 'Sáb', value: '6' },
  { label: 'Dom', value: '0' },
] as const;

interface CalendarDayFilterProps {
  visibleDays?: number[];
  onVisibleDaysChange: (days: number[]) => void;
}

/**
 * Componente de filtro para mostrar/ocultar días de la semana en el calendario
 * Por defecto muestra Lun-Vie, permite agregar Sáb y Dom
 * Menú simple sin búsqueda para selección rápida
 */
export function CalendarDayFilter({
  visibleDays = [1, 2, 3, 4, 5], // Lun-Vie por defecto
  onVisibleDaysChange,
}: CalendarDayFilterProps) {
  const selectedValues = new Set(visibleDays.map(String));

  const handleToggleDay = (value: string) => {
    const newSelectedValues = new Set(selectedValues);
    if (newSelectedValues.has(value)) {
      newSelectedValues.delete(value);
    } else {
      newSelectedValues.add(value);
    }
    // Siempre incluir Lun-Vie (1-5) + Sáb/Dom opcionales
    const filterValues = Array.from(newSelectedValues).map(Number);
    const finalValues = [1, 2, 3, 4, 5, ...filterValues.filter(d => d === 6 || d === 0)];
    onVisibleDaysChange(finalValues);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          Días
          {/* Mostrar badge solo si hay días adicionales (Sáb o Dom) */}
          {(selectedValues.has('6') || selectedValues.has('0')) && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="flex space-x-1">
                {selectedValues.has('6') && (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    Sáb
                  </Badge>
                )}
                {selectedValues.has('0') && (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    Dom
                  </Badge>
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-2" align="start">
        <div className="space-y-1">
          {WEEKDAY_OPTIONS.map((option) => {
            const isSelected = selectedValues.has(option.value);
            return (
              <div
                key={option.value}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                  isSelected && "bg-accent"
                )}
                onClick={() => handleToggleDay(option.value)}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "opacity-50 [&_svg]:invisible"
                  )}
                >
                  <CheckIcon className="h-4 w-4" />
                </div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{option.label}</span>
              </div>
            );
          })}
        </div>

        {/* Botón para remover Sáb/Dom (volver a Lun-Vie) */}
        {(selectedValues.has('6') || selectedValues.has('0')) && (
          <>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={() => onVisibleDaysChange([1, 2, 3, 4, 5])}
            >
              Solo días laborales
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
