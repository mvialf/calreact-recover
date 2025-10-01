/**
 * FullFields - Campos específicos del modo full
 *
 * Renderiza todos los campos cuando el formulario duplica
 * completamente los datos del proyecto en el evento.
 */

import React, { lazy, Suspense, useMemo } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';
import { useProjectEventFormContext } from './Container';
import { useNumericInput } from '@/hooks/useNumericInput';
import type { BaseFormComponentProps } from './types';

// Lazy load componentes pesados
const AddressInput = lazy(() =>
  import('@/components/ui/addressInput').then(mod => ({ default: mod.AddressInput }))
);
const TagSelector = lazy(() =>
  import('@/components/ui/tag-selector').then(mod => ({ default: mod.TagSelector }))
);

export const FullFields: React.FC<BaseFormComponentProps> = ({ className }) => {
  const { form, disabled } = useProjectEventFormContext();

  // ✅ OPTIMIZACIÓN: Extraer watch y memoizar para prevenir re-creación de hooks
  const windowsCount = form.watch('windowsCount');
  const squareMeters = form.watch('squareMeters');

  // Hook optimizado para inputs numéricos con valores memoizados
  const windowsInput = useNumericInput({
    defaultValue: useMemo(() => windowsCount || 0, [windowsCount]),
    integer: true,
    onChange: (value) => form.setValue('windowsCount', value),
  });

  const squareMetersInput = useNumericInput({
    defaultValue: useMemo(() => squareMeters || 0, [squareMeters]),
    onChange: (value) => form.setValue('squareMeters', value),
  });

  // ✅ OPTIMIZACIÓN: Memoizar opciones de status (se calcula una sola vez)
  const statusOptions = useMemo(
    () =>
      PROJECT_STATUS_OPTIONS.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      )),
    []
  );

  return (
    <div className={className}>
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
                disabled={disabled}
                placeholder="Descripción del evento..."
                rows={3}
                className="resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Teléfono */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Teléfono</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={disabled}
                placeholder="+56 9 1234 5678"
                type="tel"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Dirección */}
      <FormField
        control={form.control}
        name="fullAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección</FormLabel>
            <FormControl>
              <Suspense fallback={<Input placeholder="Cargando..." disabled />}>
                <AddressInput
                  value={field.value}
                  onSelect={field.onChange}
                  disabled={disabled}
                  placeholder="Buscar dirección..."
                />
              </Suspense>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Estado del Proyecto */}
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado *</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {statusOptions}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Número de Ventanas */}
      <FormField
        control={form.control}
        name="windowsCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Ventanas</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={windowsInput.displayValue}
                onChange={(e) => windowsInput.handleChange(e.target.value)}
                onBlur={windowsInput.handleBlur}
                disabled={disabled}
                placeholder="0"
                min="0"
                step="1"
              />
            </FormControl>
            <FormDescription>
              Ingrese el número total de ventanas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Metros Cuadrados */}
      <FormField
        control={form.control}
        name="squareMeters"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Metros Cuadrados</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={squareMetersInput.displayValue}
                onChange={(e) => squareMetersInput.handleChange(e.target.value)}
                onBlur={squareMetersInput.handleBlur}
                disabled={disabled}
                placeholder="0"
                min="0"
                step="0.1"
              />
            </FormControl>
            <FormDescription>
              Área total en metros cuadrados
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Etiquetas de Desinstalación */}
      <FormField
        control={form.control}
        name="uninstallTags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Etiquetas de Desinstalación</FormLabel>
            <FormControl>
              <Input
                value={(field.value || []).map((tag: any) => tag.name).join(', ')}
                onChange={(e) => {
                  const tagNames = e.target.value.split(',').map(name => name.trim());
                  field.onChange(
                    tagNames
                      .filter(name => name.length > 0)
                      .map((name, index) => ({
                        id: `temp-${index}`,
                        name,
                        color: 'blue' as const,
                      }))
                  );
                }}
                disabled={disabled}
                placeholder="Etiquetas separadas por comas..."
              />
            </FormControl>
            <FormDescription>
              Etiquetas para tracking de desinstalación (separar con comas)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
