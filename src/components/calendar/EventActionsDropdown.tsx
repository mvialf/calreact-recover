"use client";

import type { EventType } from '@/types/event';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Eye, Edit, Trash2 } from 'lucide-react';

interface EventActionsDropdownProps {
  event: EventType;
  onView: (event: EventType) => void;
  onEdit: (event: EventType) => void;
  onDelete: (event: EventType) => void;
}

/**
 * Dropdown de acciones para eventos del calendario
 *
 * Muestra un botón con ícono EllipsisVertical que abre un menú con:
 * - Ver detalles (Eye)
 * - Editar (Edit)
 * - Eliminar (Trash2 - destructivo)
 *
 * El componente usa stopPropagation para evitar que el click en el botón
 * trigger el onClick del card padre.
 */
export function EventActionsDropdown({
  event,
  onView,
  onEdit,
  onDelete,
}: EventActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-accent/50 transition-colors"
          onClick={(e) => {
            e.stopPropagation(); // Evitar trigger del card
          }}
          aria-label="Acciones del evento"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onView(event);
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit(event);
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event);
          }}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
