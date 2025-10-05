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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { AddressInput } from '@/components/ui/addressInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DateInput } from '@/components/ui/date-input';
import { format } from 'date-fns';
import { TagSelector, type Tag } from '@/components/ui/tags';

// Types imports
import type { ProjectStatus, FormattedAddress } from '@/types/project';

// Hooks imports
import { useUninstallTags } from '@/hooks/useUninstallTags';

// Helper para convertir UninstallTag a Tag
const convertUninstallTagToTag = (uninstallTag: any): Tag => ({
  ...uninstallTag,
  color: uninstallTag.color as Tag['color'] // Cast string to TagColor
});

// Constants imports
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';
import {
  DEFAULT_WINDOWS_COUNT,
  DEFAULT_SQUARE_METERS,
  DEFAULT_PROJECT_STATUS,
  DEFAULT_EVENT_DESCRIPTION,
  DEFAULT_PHONE
} from '@/constants/defaults';

// Esquemas de validación centralizados
import { 
  optionalString,
  phoneSchema,
  fullAddressSchema,
  requiredString,
  commonProjectFields
} from '@/utils/validation-schemas';


// Esquema de validación para el formulario de evento de proyecto
const formSchema = z.object({
  projectId: optionalString,
  status: requiredString("El estado"),
  eventDate: z.date().optional(),
  ...commonProjectFields,
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
  // Formulario
  const form = useForm<NewProjectEventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: initialData?.projectId || "",
      description: initialData?.description || DEFAULT_EVENT_DESCRIPTION,
      phone: initialData?.phone || DEFAULT_PHONE,
      fullAddress: initialData?.fullAddress || undefined,
      status: initialData?.status || DEFAULT_PROJECT_STATUS,
      eventDate: initialData?.eventDate || undefined,
      windowsCount: (() => {
        const value = initialData?.windowsCount;
        if (value == null || value === undefined) return DEFAULT_WINDOWS_COUNT || 0;
        const numValue = Number(value);
        return isNaN(numValue) || !isFinite(numValue) ? 0 : Math.max(0, Math.floor(numValue));
      })(),
      squareMeters: (() => {
        const value = initialData?.squareMeters;
        if (value == null || value === undefined) return DEFAULT_SQUARE_METERS || 0;
        const numValue = Number(value);
        return isNaN(numValue) || !isFinite(numValue) ? 0 : Math.max(0, numValue);
      })(),
      uninstallTags: Array.isArray(initialData?.uninstallTags) ? initialData.uninstallTags : [],
      checklist: Array.isArray(initialData?.checklist) ? initialData.checklist : [],
    },
  });

  // Exponer la instancia del formulario al componente padre
  useEffect(() => {
    if (formInstanceRef) {
      formInstanceRef.current = form;
    }
  }, [form, formInstanceRef]);

  // Hook para uninstall tags con Firebase
  const {
    availableTags: uninstallTags,
    createTag: createUninstallTag,
    editTag: editUninstallTag,
    deleteTag: deleteUninstallTag,
  } = useUninstallTags();

  // Manejar el envío del formulario
  const handleFormSubmit = (data: NewProjectEventFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form 
        ref={formRef} 
        onSubmit={form.handleSubmit(handleFormSubmit)} 
        className="space-y-6"
      >




      <div className="grid grid-cols-3 gap-4">
        {/* Teléfono */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <PhoneInput
                  {...field}
                  onChange={(value) => field.onChange(value)}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Estado */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Dirección */}
        <FormField
          control={form.control}
          name="fullAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <AddressInput
                  value={field.value}
                  onSelect={field.onChange}
                  placeholder="Ingrese la dirección del proyecto"
                  disabled={disabled}
                  countryCode={initialData?.fullAddress?.componentes?.pais}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        {/* Ventanas y Metros Cuadrados */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="windowsCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° de Ventanas</FormLabel>
                <FormControl>
                  <Input
                    value={field.value?.toString() || '0'}
                    type="number"
                    min="0"
                    disabled={disabled}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      field.onChange(Math.max(0, value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="squareMeters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>M2</FormLabel>
                <FormControl>
                  <Input
                    value={field.value?.toString() || '0'}
                    type="number"
                    min="0"
                    step="0.1"
                    disabled={disabled}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(Math.max(0, value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags de Desinstalación */}
        <div className="space-y-4">

            <FormField
              control={form.control}
              name="uninstallTags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags de Desinstalación</FormLabel>
                  <FormControl>
                    <TagSelector
                      selectedTags={(field.value || []).map(convertUninstallTagToTag)}
                      availableTags={uninstallTags.map(convertUninstallTagToTag)}
                      onTagsChange={field.onChange}
                      onCreateTag={createUninstallTag}
                      onEditTag={editUninstallTag}
                      onDeleteTag={deleteUninstallTag}
                      placeholder="Seleccionar tags de desinstalación..."
                      label="Tags de Desinstalación"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descripción detallada del proyecto"
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