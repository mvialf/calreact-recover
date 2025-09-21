'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { phoneSchema } from '@/utils/validation-schemas';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/format-helpers';
import { TagSelector, type Tag } from '@/components/ui/tags';
import { useUninstallTags } from '@/hooks/useUninstallTags';

// Types and constants
import type { ProjectStatus } from '@/types/project';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';
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
import { PhoneInput } from '@/components/ui/phone-input';
import { PercentageInput } from '@/components/ui/percentage-input';
import { MoneyInput } from '@/components/ui/money-input';
import { DateInput } from '@/components/ui/date-input';
import { AddressInput } from '@/components/ui/addressInput';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormContainer, FormGrid } from '@/components/ui/form-container';


// Validation schema
const projectFormSchema = z.object({
  projectNumber: z.string().min(1, 'Número de proyecto es requerido'),
  clientId: z.string().min(1, 'Cliente es requerido'),
  description: z.string().optional(),
  date: z.date(),
  subtotal: z.number().min(0, 'Subtotal debe ser mayor a 0'),
  taxRate: z.number().min(0).max(100, 'Tasa de impuesto debe estar entre 0 y 100'),
  status: z.enum(PROJECT_STATUS_OPTIONS.map(option => option.value) as [string, ...string[]]),
  phone: phoneSchema,
  fullAddress: z.any().optional(),
  windowsCount: z.number().min(0).optional(),
  squareMeters: z.number().min(0).optional(),
  uninstallTags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.enum(['yellow', 'sky', 'orange', 'brown', 'complete', 'purple', 'primary', 'secondary', 'destructive']),
    createdAt: z.date().optional()
  })).optional(),
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
  
  // Nueva prop para variantes de uso
  variant?: 'standalone' | 'modal' | 'inline';
  formId?: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  variant = 'standalone',
  formId = 'project-form',
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

  // Hook para uninstall tags con Firebase
  const {
    availableTags: uninstallTags,
    createTag: createUninstallTag,
    editTag: editUninstallTag,
    deleteTag: deleteUninstallTag,
  } = useUninstallTags();

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
      uninstallTags: [],
      glosa: '',
      ...defaultValues,
    },
  });

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
      <FormContainer>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">

        {/* Fila 1: Cliente + Número de Proyecto */}
        <FormGrid columns="3-1">
          {/* Cliente - 3/4 del ancho */}
          <div>
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

          {/* Número de Proyecto - 1/4 del ancho */}
          <div>
            <FormField
              control={form.control}
              name="projectNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proyecto *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                     
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormGrid>

        {/* Fila 2: Glosa + Teléfono */}
        <FormGrid columns="2-1">
          {/* Glosa - 2/3 del ancho */}
          <div>
            <FormField
              control={form.control}
              name="glosa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glosa</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Teléfono - 1/3 del ancho */}
          <div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      excludeCountryCode={false}
                      
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormGrid>

        {/* Fila 3: Fecha + Estado */}
        <FormGrid columns={2}>
          {/* Estado - 1/2 del ancho */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
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

          {/* Fecha - 1/2 del ancho */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Ingreso *</FormLabel>
                <FormControl>
                  <DateInput
                    date={field.value}
                    onSelect={field.onChange}
                    
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          
        </FormGrid>

        {/* Fila 4: Dirección completa */}
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

        {/* Fila 5: Subtotal + Tasa Impuesto + Total */}
        <FormGrid columns={3}>
          <FormField
            control={form.control}
            name="subtotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtotal *</FormLabel>
                <FormControl>
                  <MoneyInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(value || 0)}
                    placeholder="Ingrese el subtotal"
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
                <FormLabel>Impuesto</FormLabel>
                <FormControl>
                  <PercentageInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(value || 0)}
                    placeholder="19.0"
                    decimalScale={1}
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
              value={formatCurrency(total)}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </FormGrid>

        {/* Fila 6: Ventanas + Metros Cuadrados */}
        <FormGrid columns={2}>
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
        </FormGrid>

        {/* Fila 7: Tags de Desinstalación */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="uninstallTags"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TagSelector
                    selectedTags={field.value || []}
                    availableTags={uninstallTags}
                    onTagsChange={field.onChange}
                    onCreateTag={createUninstallTag}
                    onEditTag={editUninstallTag}
                    onDeleteTag={deleteUninstallTag}
                    placeholder="Seleccionar tags de desinstalación..."
                    label="Desinstalación"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fila 8: Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                              
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions - Solo mostrar si es standalone o showDefaultButtons está explícito */}
        {(variant === 'standalone' || showDefaultButtons) && (
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
      </FormContainer>
    </Form>
  );
};