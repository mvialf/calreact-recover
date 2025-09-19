'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

// Types and constants
import type { ProjectStatus } from '@/types/project';
import { PROJECT_STATUS_OPTIONS, UNINSTALL_TYPE_OPTIONS } from '@/constants/project';
import {
  DEFAULT_TAX_RATE,
  DEFAULT_SUBTOTAL,
  DEFAULT_WINDOWS_COUNT,
  DEFAULT_SQUARE_METERS
} from '@/constants/defaults';

// Services
import { getClients } from '@/services/clientService';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Autocomplete, type AutocompleteItem } from '@/components/ui/autocomplete';
import { Checkbox } from '@/components/ui/checkbox';
import { InputDate } from '@/components/ui/date-picker';
import { AddressInput } from '@/components/ui/addressInput';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';


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

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  isSubmitting?: boolean;
  showDefaultButtons?: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  showDefaultButtons = true,
  submitButtonText = 'Crear Proyecto',
  onCancel,
}) => {
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

  // Convertir clientes a items del autocomplete
  const clientItems: AutocompleteItem[] = React.useMemo(() => {
    return clients.map(client => ({
      value: client.id,
      label: client.name
    }));
  }, [clients]);

  // Form setup
  const form = useForm<ProjectFormData>({
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

  const watchUninstall = form.watch('uninstall');
  const watchSubtotal = form.watch('subtotal');
  const watchTaxRate = form.watch('taxRate');

  // Calculate total whenever subtotal or taxRate changes
  const total = React.useMemo(() => {
    const subtotal = watchSubtotal || 0;
    const taxRate = watchTaxRate || 0;
    return subtotal * (1 + taxRate / 100);
  }, [watchSubtotal, watchTaxRate]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información Básica</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Selection */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <Autocomplete
                        items={clientItems}
                        value={field.value}
                        onSelect={field.onChange}
                        placeholder={isLoadingClients ? "Cargando clientes..." : "Buscar cliente..."}
                        emptyText="No se encontraron clientes."
                        disabled={isSubmitting || isLoadingClients}
                        isLoading={isLoadingClients}
                        strictSelection={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Project Number */}
            <div>
              <FormField
                control={form.control}
                name="projectNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Proyecto *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ej: PR-2025-001"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Descripción del proyecto"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha del Proyecto *</FormLabel>
                <FormControl>
                  <InputDate
                    date={field.value}
                    onSelect={field.onChange}
                    placeholder="Seleccionar fecha"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Información de Contacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Información de Contacto</h3>

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej: +56 9 1234 5678"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Detalles del Servicio */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Detalles del Servicio</h3>

          {/* Financial Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="subtotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtotal *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa de Impuesto (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="19.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total (read-only) */}
            <div className="space-y-2">
              <Label>Total</Label>
              <Input
                value={total.toFixed(2)}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Service Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="windowsCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Ventanas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      placeholder="0"
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
                  <FormLabel>Metros Cuadrados</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado del Proyecto</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROJECT_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Uninstall */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="uninstall"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Requiere Desinstalación</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {watchUninstall && (
              <div className="ml-6 space-y-4">
                <FormField
                  control={form.control}
                  name="uninstallTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipos de Desinstalación</FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uninstallOther"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Otro (especificar)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Especificar otro tipo"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Glosa */}
          <FormField
            control={form.control}
            name="glosa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Glosa</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Notas adicionales"
                    rows={2}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        {showDefaultButtons && (
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
        )}
      </form>
    </Form>
  );
};