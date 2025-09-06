'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

// Types and constants
import type { ProjectStatus, FormattedAddress } from '@/types/project';
import { PROJECT_STATUS_OPTIONS, UNINSTALL_TYPE_OPTIONS } from '@/constants/project';
import { 
  DEFAULT_TAX_RATE, 
  DEFAULT_SUBTOTAL, 
  DEFAULT_WINDOWS_COUNT, 
  DEFAULT_SQUARE_METERS, 
  DEFAULT_COUNTRY 
} from '@/constants/defaults';

// Services
import { getClients } from '@/services/clientService';

// UI Components
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { InputDate } from '@/components/ui/date-picker';
import { AddressInput } from '@/components/ui/addressInput';

// Validation schema
const projectFormSchema = z.object({
  projectNumber: z.string().min(1, 'Número de proyecto es requerido'),
  clientId: z.string().min(1, 'Cliente es requerido'),
  description: z.string().optional(),
  date: z.date(),
  subtotal: z.number().min(0, 'Subtotal debe ser mayor a 0'),
  taxRate: z.number().min(0).max(100, 'Tasa de impuesto debe estar entre 0 y 100'),
  status: z.enum(PROJECT_STATUS_OPTIONS.map(option => option.value) as [string, ...string[]]),
  phone: z.string().optional(),
  fullAddress: z.any().optional(),
  windowsCount: z.number().min(0).optional(),
  squareMeters: z.number().min(0).optional(),
  uninstall: z.boolean().optional(),
  uninstallTypes: z.array(z.string()).optional(),
  uninstallOther: z.string().optional(),
  glosa: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectFormSchema>;

// Client type for local use
interface LocalClient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  rut?: string;
  businessName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Context for form state
interface ProjectFormContextType {
  formMethods: ReturnType<typeof useForm<ProjectFormData>>;
  clients: LocalClient[];
  isLoadingClients: boolean;
  onSubmit: SubmitHandler<ProjectFormData>;
  isSubmitting: boolean;
  showDefaultButtons: boolean;
  submitButtonText: string;
  onCancel?: () => void;
}

const ProjectFormContext = createContext<ProjectFormContextType | null>(null);

export function useProjectForm() {
  const context = useContext(ProjectFormContext);
  if (!context) {
    throw new Error('useProjectForm debe ser usado dentro de ProjectForm');
  }
  return context;
}

// Main compound component
interface ProjectFormProps {
  children: React.ReactNode;
  defaultValues?: Partial<ProjectFormData>;
  onSubmit: SubmitHandler<ProjectFormData>;
  isSubmitting?: boolean;
  showDefaultButtons?: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

export function ProjectForm({
  children,
  defaultValues,
  onSubmit,
  isSubmitting = false,
  showDefaultButtons = true,
  submitButtonText = 'Crear Proyecto',
  onCancel,
}: ProjectFormProps) {
  const { toast } = useToast();

  // Fetch clients
  const { data: clients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const fetchedClients = await getClients();
      return fetchedClients.map((client) => ({
        id: client.id,
        name: client.name,
        phone: client.phone || '',
        email: client.email || '',
        address: '',
        rut: '',
        businessName: '',
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      }));
    },
  });

  // Form setup
  const formMethods = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectNumber: '',
      clientId: '',
      description: '',
      date: new Date(),
      subtotal: DEFAULT_SUBTOTAL,
      taxRate: DEFAULT_TAX_RATE,
      status: 'ingresado',
      phone: '',
      fullAddress: null,
      windowsCount: DEFAULT_WINDOWS_COUNT,
      squareMeters: DEFAULT_SQUARE_METERS,
      uninstall: false,
      uninstallTypes: [],
      uninstallOther: '',
      glosa: '',
      ...defaultValues,
    },
  });

  const contextValue: ProjectFormContextType = {
    formMethods,
    clients,
    isLoadingClients,
    onSubmit,
    isSubmitting,
    showDefaultButtons,
    submitButtonText,
    onCancel,
  };

  return (
    <ProjectFormContext.Provider value={contextValue}>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
          {children}
        </form>
      </FormProvider>
    </ProjectFormContext.Provider>
  );
}

// Basic Info Section
export function ProjectFormBasicInfo() {
  const { formMethods, clients, isLoadingClients } = useProjectForm();
  const { register, control, formState: { errors } } = formMethods;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Información Básica</h3>
      
      {/* Project Number */}
      <div className="space-y-2">
        <Label htmlFor="projectNumber">Número de Proyecto *</Label>
        <Input
          id="projectNumber"
          {...register('projectNumber')}
          placeholder="Ej: PR-2025-001"
        />
        {errors.projectNumber && (
          <p className="text-sm text-red-600">{errors.projectNumber.message}</p>
        )}
      </div>

      {/* Client Selection */}
      <div className="space-y-2">
        <Label htmlFor="clientId">Cliente *</Label>
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingClients ? "Cargando clientes..." : "Seleccionar cliente"} />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.clientId && (
          <p className="text-sm text-red-600">{errors.clientId.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descripción del proyecto"
          rows={3}
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>Fecha del Proyecto *</Label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <InputDate
              date={field.value}
              onSelect={field.onChange}
              placeholder="Seleccionar fecha"
            />
          )}
        />
        {errors.date && (
          <p className="text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>
    </div>
  );
}

// Contact Info Section
export function ProjectFormContactInfo() {
  const { formMethods } = useProjectForm();
  const { register, control } = formMethods;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Información de Contacto</h3>
      
      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="Ej: +56 9 1234 5678"
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label>Dirección</Label>
        <Controller
          name="fullAddress"
          control={control}
          render={({ field }) => (
            <AddressInput
              value={field.value}
              onSelect={field.onChange}
              placeholder="Ingrese la dirección del proyecto"
            />
          )}
        />
      </div>
    </div>
  );
}

// Service Details Section
export function ProjectFormServiceDetails() {
  const { formMethods } = useProjectForm();
  const { register, control, watch, setValue, formState: { errors } } = formMethods;
  
  const watchUninstall = watch('uninstall');
  const watchSubtotal = watch('subtotal');
  const watchTaxRate = watch('taxRate');

  // Calculate total whenever subtotal or taxRate changes
  const total = React.useMemo(() => {
    const subtotal = watchSubtotal || 0;
    const taxRate = watchTaxRate || 0;
    return subtotal * (1 + taxRate / 100);
  }, [watchSubtotal, watchTaxRate]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Detalles del Servicio</h3>
      
      {/* Financial Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subtotal">Subtotal *</Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            min="0"
            {...register('subtotal', { valueAsNumber: true })}
            placeholder="0.00"
          />
          {errors.subtotal && (
            <p className="text-sm text-red-600">{errors.subtotal.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
          <Input
            id="taxRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register('taxRate', { valueAsNumber: true })}
            placeholder="19.00"
          />
          {errors.taxRate && (
            <p className="text-sm text-red-600">{errors.taxRate.message}</p>
          )}
        </div>
      </div>

      {/* Total (read-only) */}
      <div className="space-y-2">
        <Label>Total</Label>
        <Input
          value={total.toFixed(2)}
          readOnly
          className="bg-gray-50"
        />
      </div>

      {/* Service Specifications */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="windowsCount">Número de Ventanas</Label>
          <Input
            id="windowsCount"
            type="number"
            min="0"
            {...register('windowsCount', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="squareMeters">Metros Cuadrados</Label>
          <Input
            id="squareMeters"
            type="number"
            step="0.01"
            min="0"
            {...register('squareMeters', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Estado del Proyecto</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
          )}
        />
      </div>

      {/* Uninstall */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Controller
            name="uninstall"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="uninstall"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="uninstall">Requiere Desinstalación</Label>
        </div>

        {watchUninstall && (
          <div className="ml-6 space-y-2">
            <Label>Tipos de Desinstalación</Label>
            <Controller
              name="uninstallTypes"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {UNINSTALL_TYPE_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={field.value?.includes(option.value) || false}
                        onCheckedChange={(checked) => {
                          const current = field.value || [];
                          if (checked) {
                            field.onChange([...current, option.value]);
                          } else {
                            field.onChange(current.filter(v => v !== option.value));
                          }
                        }}
                      />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="uninstallOther">Otro (especificar)</Label>
              <Input
                id="uninstallOther"
                {...register('uninstallOther')}
                placeholder="Especificar otro tipo"
              />
            </div>
          </div>
        )}
      </div>

      {/* Glosa */}
      <div className="space-y-2">
        <Label htmlFor="glosa">Glosa</Label>
        <Textarea
          id="glosa"
          {...register('glosa')}
          placeholder="Notas adicionales"
          rows={2}
        />
      </div>
    </div>
  );
}

// Actions Section
export function ProjectFormActions() {
  const { isSubmitting, showDefaultButtons, submitButtonText, onCancel } = useProjectForm();

  if (!showDefaultButtons) return null;

  return (
    <div className="flex justify-end space-x-2 pt-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : submitButtonText}
      </Button>
    </div>
  );
}

// Compound object for easier usage
ProjectForm.BasicInfo = ProjectFormBasicInfo;
ProjectForm.ContactInfo = ProjectFormContactInfo;
ProjectForm.ServiceDetails = ProjectFormServiceDetails;
ProjectForm.Actions = ProjectFormActions;