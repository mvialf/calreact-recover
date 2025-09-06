"use client";

// React imports
import React, { useEffect } from 'react';

// Third-party imports
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Component imports
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AddressInput } from '@/components/ui/addressInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputDate } from '@/components/ui/date-picker';

// Types imports
import type { ProjectStatus, FormattedAddress } from '@/types/project';

// Constants imports
import { PROJECT_STATUS_OPTIONS, UNINSTALL_TYPE_OPTIONS } from '@/constants/project';
import { 
  DEFAULT_WINDOWS_COUNT, 
  DEFAULT_SQUARE_METERS, 
  DEFAULT_PROJECT_STATUS,
  DEFAULT_EVENT_DESCRIPTION,
  DEFAULT_PHONE,
  DEFAULT_UNINSTALL,
  DEFAULT_UNINSTALL_TYPES
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
  uninstallOther?: string;
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
  onSubmit: (data: NewProjectEventFormValues) => void;
  initialData?: Partial<NewProjectEventFormValues>;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export const NewProjectEventForm: React.FC<NewProjectEventFormProps> = ({
  formRef,
  onSubmit,
  initialData,
  isSubmitting = false,
  disabled = false,
}) => {
  const { toast } = useToast();

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
      uninstall: Boolean(initialData?.uninstall) || DEFAULT_UNINSTALL,
      uninstallTypes: Array.isArray(initialData?.uninstallTypes) ? initialData.uninstallTypes : DEFAULT_UNINSTALL_TYPES,
      checklist: Array.isArray(initialData?.checklist) ? initialData.checklist : [],
    },
  });


  // Efecto para actualizar el formulario cuando cambian los datos iniciales
  useEffect(() => {
    if (initialData) {
      const getValidNumber = (value: any, defaultValue: number): number => {
        if (value == null || value === undefined) return defaultValue;
        const numValue = Number(value);
        return isNaN(numValue) || !isFinite(numValue) ? defaultValue : Math.max(0, numValue);
      };

      const windowsCount = getValidNumber(initialData.windowsCount, DEFAULT_WINDOWS_COUNT || 0);
      const squareMeters = getValidNumber(initialData.squareMeters, DEFAULT_SQUARE_METERS || 0);
      
      form.reset({
        projectId: initialData.projectId || "",
        description: initialData.description || DEFAULT_EVENT_DESCRIPTION,
        phone: initialData.phone || DEFAULT_PHONE,
        fullAddress: initialData.fullAddress || undefined,
        status: initialData.status || DEFAULT_PROJECT_STATUS,
        eventDate: initialData.eventDate || undefined,
        windowsCount: Math.floor(windowsCount),
        squareMeters,
        uninstall: Boolean(initialData.uninstall) || DEFAULT_UNINSTALL,
        uninstallTypes: Array.isArray(initialData.uninstallTypes) ? initialData.uninstallTypes : DEFAULT_UNINSTALL_TYPES,
        checklist: Array.isArray(initialData.checklist) ? initialData.checklist : [],
      });
    }
  }, [initialData, form]);

  // Observar cambios en desinstalación
  const watchUninstall = form.watch('uninstall');
  const watchUninstallTypes = form.watch('uninstallTypes') || [];

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
                <InputDate
                  date={field.value}
                  onSelect={field.onChange}
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
          
          {/* Desinstalación */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="uninstall"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Desinstalación</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          
        </div>


          {watchUninstall && (
            <div className="pl-6 space-y-2">
              <Label>Tipos de desinstalación</Label>
              <div className="flex flex-wrap gap-2 align-center">
                {UNINSTALL_TYPE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`uninstall-${option.value}`}
                      checked={watchUninstallTypes.includes(option.value)}
                      disabled={disabled}
                      onCheckedChange={(checked) => {
                        const newTypes = checked 
                          ? [...watchUninstallTypes, option.value] 
                          : watchUninstallTypes.filter((t) => t !== option.value);
                        form.setValue('uninstallTypes', newTypes);
                      }}
                    />
                    <Label htmlFor={`uninstall-${option.value}`} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
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