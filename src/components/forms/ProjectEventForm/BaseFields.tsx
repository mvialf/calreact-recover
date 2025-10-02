/**
 * BaseFields - Campos compartidos entre lean y full mode
 *
 * Renderiza los campos comunes a ambos modos del formulario:
 * - eventDate (fecha del evento)
 * - eventNotes (notas opcionales)
 */

import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DateInput } from '@/components/ui/date-input';
import { useProjectEventFormContext } from './Container';
import { useFormAccessibility } from '@/hooks/useFormAccessibility';
import type { BaseFormComponentProps } from './types';

// ✅ OPTIMIZACIÓN: React.memo simple
// Props estables (solo className), context no cambia frecuentemente
export const BaseFields = React.memo<BaseFormComponentProps>(({ className }) => {
  const { form, disabled } = useProjectEventFormContext();

  // ✅ ACCESIBILIDAD: Hooks para ARIA attributes
  const eventDateA11y = useFormAccessibility('eventDate', form, {
    required: true,
  });

  const eventNotesA11y = useFormAccessibility('eventNotes', form);

  return (
    <div className={className}>
      {/* Fecha del Evento */}
      <FormField
        control={form.control}
        name="eventDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={eventDateA11y.fieldId}>
              Fecha del Evento
              <span className="sr-only">Campo requerido</span>
            </FormLabel>
            <FormControl>
              <DateInput
                id={eventDateA11y.fieldId}
                value={
                  field.value instanceof Date
                    ? field.value.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => field.onChange(new Date(e.target.value))}
                disabled={disabled}
                placeholder="Seleccione la fecha del evento"
                aria-required={eventDateA11y.ariaAttributes['aria-required']}
                aria-invalid={eventDateA11y.ariaAttributes['aria-invalid']}
                aria-describedby={eventDateA11y.ariaAttributes['aria-describedby']}
              />
            </FormControl>
            <FormDescription id={eventDateA11y.descriptionId}>
              Seleccione la fecha en la que se realizará el evento
            </FormDescription>
            {form.formState.errors.eventDate && (
              <FormMessage id={eventDateA11y.errorId} role="alert">
                {form.formState.errors.eventDate.message}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      {/* Notas del Evento */}
      <FormField
        control={form.control}
        name="eventNotes"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={eventNotesA11y.fieldId}>Notas del Evento</FormLabel>
            <FormControl>
              <Textarea
                id={eventNotesA11y.fieldId}
                {...field}
                disabled={disabled}
                placeholder="Añadir notas opcionales sobre el evento..."
                rows={3}
                className="resize-none"
                aria-invalid={eventNotesA11y.ariaAttributes['aria-invalid']}
                aria-describedby={eventNotesA11y.ariaAttributes['aria-describedby']}
              />
            </FormControl>
            <FormDescription id={eventNotesA11y.descriptionId}>
              Agregue información adicional relevante para el evento
            </FormDescription>
            {form.formState.errors.eventNotes && (
              <FormMessage id={eventNotesA11y.errorId} role="alert">
                {form.formState.errors.eventNotes.message}
              </FormMessage>
            )}
          </FormItem>
        )}
      />
    </div>
  );
});
