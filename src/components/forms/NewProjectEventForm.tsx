"use client";

// React imports
import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

// Third-party imports
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Component imports
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DateInput } from '@/components/ui/date-input';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

// Esquemas de validación centralizados
import { optionalString } from '@/utils/validation-schemas';

// ✅ Schema simplificado: SOLO campos del evento
const formSchema = z.object({
  projectId: optionalString,
  eventDate: z.date().optional(),
  eventNotes: optionalString, // Notas específicas del evento
});

// Tipo para los valores del formulario
export type NewProjectEventFormValues = z.infer<typeof formSchema> & {
  clientName?: string;
  checklist?: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    createdAt?: Date;
    completedAt?: Date;
  }>;
};

export interface NewProjectEventFormProps {
  formRef?: React.RefObject<HTMLFormElement>;
  formInstanceRef?: React.MutableRefObject<UseFormReturn<NewProjectEventFormValues> | null>;
  onSubmit: (data: NewProjectEventFormValues) => void;
  initialData?: Partial<NewProjectEventFormValues>;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export const NewProjectEventForm: React.FC<NewProjectEventFormProps> = ({
  formRef,
  formInstanceRef,
  onSubmit,
  initialData,
  isSubmitting = false,
  disabled = false,
}) => {
  // Formulario con campos simplificados
  const form = useForm<NewProjectEventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: initialData?.projectId || "",
      eventDate: initialData?.eventDate || undefined,
      eventNotes: initialData?.eventNotes || "",
      checklist: Array.isArray(initialData?.checklist) ? initialData.checklist : [],
    },
  });

  // Exponer la instancia del formulario al componente padre
  useEffect(() => {
    if (formInstanceRef) {
      formInstanceRef.current = form;
    }
  }, [form, formInstanceRef]);

  // Manejar el envío del formulario
  const handleFormSubmit = (data: NewProjectEventFormValues) => {
    onSubmit(data);
  };

  // Handler para errores de validación
  const handleValidationError = (errors: any) => {
    // Mostrar toast con el primer error encontrado
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(`Error de validación: ${firstError.message}`);
    } else {
      toast.error("Por favor, revisa los campos del formulario");
    }
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(handleFormSubmit, handleValidationError)}
        className="space-y-6"
      >
        {/* Campos del EVENTO */}
        <div className="space-y-4">
          {/* Fecha del Evento */}
          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha del Evento</FormLabel>
                <FormControl>
                  <DateInput
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined
                      field.onChange(date)
                    }}
                    disabled={disabled}
                    placeholder="Seleccionar fecha"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  placeholder="Notas o comentarios específicos de este evento"
                  rows={3}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
