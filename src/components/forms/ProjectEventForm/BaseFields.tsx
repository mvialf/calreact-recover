/**
 * BaseFields - Campos compartidos entre lean y full mode
 *
 * Renderiza los campos comunes a ambos modos del formulario:
 * - eventDate (fecha del evento)
 * - eventNotes (notas opcionales)
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DateInput } from '@/components/ui/date-input';
import { useProjectEventFormContext } from './Container';
import type { BaseFormComponentProps } from './types';

// ✅ OPTIMIZACIÓN: React.memo simple
// Props estables (solo className), context no cambia frecuentemente
export const BaseFields = React.memo<BaseFormComponentProps>(({ className }) => {
  const { form, disabled } = useProjectEventFormContext();

  return (
    <div className={className}>
      {/* Fecha del Evento */}
      <FormField
        control={form.control}
        name="eventDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha del Evento *</FormLabel>
            <FormControl>
              <DateInput
                value={
                  field.value instanceof Date
                    ? field.value.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => field.onChange(new Date(e.target.value))}
                disabled={disabled}
                placeholder="Seleccione la fecha del evento"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notas del Evento */}
      <FormField
        control={form.control}
        name="eventNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas del Evento</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                disabled={disabled}
                placeholder="Añadir notas opcionales sobre el evento..."
                rows={3}
                className="resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
});
