/**
 * ChecklistSection - Gestión de checklist del evento
 *
 * Componente completo para manejar checklist con:
 * - Agregado/eliminación de items
 * - Reordenamiento drag & drop
 * - Toggle de completado
 * - Prioridades y categorías
 * - Estadísticas de progreso
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  Circle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChecklistManager } from '@/hooks/useChecklistManager';
import { useProjectEventFormContext } from './Container';
import type { BaseFormComponentProps } from './types';

// Opciones de prioridad
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', variant: 'secondary' as const, icon: ArrowDown },
  { value: 'medium', label: 'Media', variant: 'default' as const, icon: Circle },
  { value: 'high', label: 'Alta', variant: 'destructive' as const, icon: ArrowUp },
];

export const ChecklistSection: React.FC<BaseFormComponentProps> = ({ className }) => {
  const { form, disabled } = useProjectEventFormContext();

  // Hook optimizado para manejo de checklist
  const checklist = useChecklistManager({
    control: form.control,
    name: 'checklist',
  });

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_OPTIONS.find((opt) => opt.value === priority) || PRIORITY_OPTIONS[1];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Checklist del Evento
          </CardTitle>

          {/* Estadísticas */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              {checklist.stats.completed}/{checklist.stats.total}
            </Badge>
            {checklist.stats.total > 0 && (
              <span className="text-xs">
                {Math.round(checklist.stats.completionRate)}%
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Lista de Items */}
        {checklist.items.length > 0 ? (
          <div className="space-y-2">
            {checklist.items.map((item, index) => {
              const priorityConfig = getPriorityConfig(item.priority || 'medium');
              const PriorityIcon = priorityConfig.icon;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'group relative flex items-start gap-3 rounded-lg border p-3',
                    'transition-colors hover:bg-muted/50',
                    item.isCompleted && 'bg-muted/30 opacity-75'
                  )}
                >
                  {/* Drag Handle */}
                  <button
                    type="button"
                    className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={disabled}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {/* Checkbox de Completado */}
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={() => checklist.toggleComplete(index)}
                    disabled={disabled}
                    className="mt-1"
                  />

                  {/* Contenido del Item */}
                  <div className="flex-1 space-y-2">
                    {/* Descripción */}
                    <Input
                      id={`checklist-${item.id}`}
                      value={item.description}
                      onChange={(e) =>
                        checklist.updateItem(index, { description: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="Descripción del item..."
                      className={cn(
                        'h-8 text-sm',
                        item.isCompleted && 'line-through'
                      )}
                    />

                    {/* Categoría (opcional) */}
                    {item.category && (
                      <Input
                        value={item.category}
                        onChange={(e) =>
                          checklist.updateItem(index, { category: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="Categoría..."
                        className="h-7 text-xs"
                      />
                    )}

                    {/* Notas (opcional) */}
                    {item.notes && (
                      <Textarea
                        value={item.notes}
                        onChange={(e) =>
                          checklist.updateItem(index, { notes: e.target.value })
                        }
                        disabled={disabled}
                        placeholder="Notas adicionales..."
                        rows={2}
                        className="text-xs resize-none"
                      />
                    )}
                  </div>

                  {/* Prioridad */}
                  <Select
                    value={item.priority || 'medium'}
                    onValueChange={(value) =>
                      checklist.updateItem(index, { priority: value as any })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <div className="flex items-center gap-1">
                        <PriorityIcon className="h-3 w-3" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-3 w-3" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Botón Eliminar */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => checklist.removeItem(index)}
                    disabled={disabled}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay items en el checklist</p>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => checklist.addItem()}
            disabled={disabled}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Item
          </Button>

          {checklist.stats.completed > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={checklist.clearCompleted}
              disabled={disabled}
              className="text-muted-foreground"
            >
              Limpiar Completados
            </Button>
          )}
        </div>

        {/* Barra de Progreso */}
        {checklist.stats.total > 0 && (
          <div className="pt-2">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${checklist.stats.completionRate}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
