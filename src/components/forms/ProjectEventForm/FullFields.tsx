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
// PROJECT_STATUS_OPTIONS import removido - campo status eliminado
import { useProjectEventFormContext } from './Container';
import { useNumericInput } from '@/hooks/useNumericInput';
import { useFormAccessibility } from '@/hooks/useFormAccessibility';
import type { BaseFormComponentProps } from './types';
import { LoadingSkeleton } from './LoadingSkeleton';

// Lazy load componentes pesados
const AddressInput = lazy(() =>
  import('@/components/ui/addressInput').then(mod => ({ default: mod.AddressInput }))
);

export const FullFields: React.FC<BaseFormComponentProps> = ({ className }) => {
  const { form, disabled } = useProjectEventFormContext();

  // Type assertion para acceso seguro a errores específicos de full mode
  const errors = form.formState.errors as any;

  // ✅ ACCESIBILIDAD: Hooks para ARIA attributes
  const descriptionA11y = useFormAccessibility('description', form);
  const phoneA11y = useFormAccessibility('phone', form);
  const fullAddressA11y = useFormAccessibility('fullAddress', form);
  // statusA11y removido - campo status eliminado de schema Full
  const windowsCountA11y = useFormAccessibility('windowsCount', form, {
    ariaLabel: 'Número de ventanas del proyecto',
  });
  const squareMetersA11y = useFormAccessibility('squareMeters', form, {
    ariaLabel: 'Metros cuadrados del proyecto',
  });
  const uninstallTagsA11y = useFormAccessibility('uninstallTags', form);

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

  // statusOptions removido - campo status eliminado de schema Full

  return (
    <div className={className}>
      {/* Descripción */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={descriptionA11y.fieldId}>Descripción</FormLabel>
            <FormControl>
              <Textarea
                id={descriptionA11y.fieldId}
                {...field}
                disabled={disabled}
                placeholder="Descripción del evento..."
                rows={3}
                className="resize-none"
                aria-invalid={descriptionA11y.ariaAttributes['aria-invalid']}
                aria-describedby={descriptionA11y.ariaAttributes['aria-describedby']}
              />
            </FormControl>
            <FormDescription id={descriptionA11y.descriptionId}>
              Proporcione una descripción detallada del evento
            </FormDescription>
            {errors.description && (
              <FormMessage id={descriptionA11y.errorId} role="alert">
                {errors.description.message}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      {/* Teléfono */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={phoneA11y.fieldId}>Teléfono</FormLabel>
            <FormControl>
              <Input
                id={phoneA11y.fieldId}
                {...field}
                disabled={disabled}
                placeholder="+56 9 1234 5678"
                type="tel"
                aria-invalid={phoneA11y.ariaAttributes['aria-invalid']}
                aria-describedby={phoneA11y.ariaAttributes['aria-describedby']}
              />
            </FormControl>
            <FormDescription id={phoneA11y.descriptionId}>
              Número de contacto para el evento
            </FormDescription>
            {errors.phone && (
              <FormMessage id={phoneA11y.errorId} role="alert">
                {errors.phone.message}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      {/* Dirección */}
      <FormField
        control={form.control}
        name="fullAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={fullAddressA11y.fieldId}>Dirección</FormLabel>
            <FormControl>
              <Suspense fallback={<LoadingSkeleton />}>
                <AddressInput
                  value={field.value}
                  onSelect={field.onChange}
                  disabled={disabled}
                  placeholder="Buscar dirección..."
                  aria-invalid={fullAddressA11y.ariaAttributes['aria-invalid']}
                  aria-describedby={fullAddressA11y.ariaAttributes['aria-describedby']}
                />
              </Suspense>
            </FormControl>
            <FormDescription id={fullAddressA11y.descriptionId}>
              Ubicación donde se realizará el evento
            </FormDescription>
            {errors.fullAddress && (
              <FormMessage id={fullAddressA11y.errorId} role="alert">
                {errors.fullAddress.message}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      {/* NOTE: Campo 'status' eliminado - removido de ProjectEventType
          para implementar Single Source of Truth (status solo en ProjectType).
          Ver: docs/technical/eliminar-status-eventos-plan.md */}

      {/* Número de Ventanas */}
      <FormField
        control={form.control}
        name="windowsCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={windowsCountA11y.fieldId}>Número de Ventanas</FormLabel>
            <FormControl>
              <Input
                id={windowsCountA11y.fieldId}
                type="number"
                value={windowsInput.displayValue}
                onChange={(e) => windowsInput.handleChange(e.target.value)}
                onBlur={windowsInput.handleBlur}
                disabled={disabled}
                placeholder="0"
                min="0"
                step="1"
                aria-label={windowsCountA11y.ariaAttributes['aria-label']}
                aria-invalid={windowsCountA11y.ariaAttributes['aria-invalid']}
                aria-describedby={windowsCountA11y.ariaAttributes['aria-describedby']}
              />
            </FormControl>
            <FormDescription id={windowsCountA11y.descriptionId}>
              Ingrese el número total de ventanas
            </FormDescription>
            {errors.windowsCount && (
              <FormMessage id={windowsCountA11y.errorId} role="alert">
                {errors.windowsCount.message}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      {/* Metros Cuadrados */}
      <FormField
        control={form.control}
        name="squareMeters"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={squareMetersA11y.fieldId}>Metros Cuadrados</FormLabel>
            <FormControl>
              <Input
                id={squareMetersA11y.fieldId}
                type="number"
                value={squareMetersInput.displayValue}
                onChange={(e) => squareMetersInput.handleChange(e.target.value)}
                onBlur={squareMetersInput.handleBlur}
                disabled={disabled}
                placeholder="0"
                min="0"
                step="0.1"
                aria-label={squareMetersA11y.ariaAttributes['aria-label']}
                aria-invalid={squareMetersA11y.ariaAttributes['aria-invalid']}
                aria-describedby={squareMetersA11y.ariaAttributes['aria-describedby']}
              />
            </FormControl>
            <FormDescription id={squareMetersA11y.descriptionId}>
              Área total en metros cuadrados
            </FormDescription>
            {errors.squareMeters && (
              <FormMessage id={squareMetersA11y.errorId} role="alert">
                {errors.squareMeters.message}
              </FormMessage>
            )}
          </FormItem>
        )}
      />

      {/* Etiquetas de Desinstalación */}
      <FormField
        control={form.control}
        name="uninstallTags"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor={uninstallTagsA11y.fieldId}>Etiquetas de Desinstalación</FormLabel>
            <FormControl>
              <Input
                id={uninstallTagsA11y.fieldId}
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
                aria-invalid={uninstallTagsA11y.ariaAttributes['aria-invalid']}
                aria-describedby={uninstallTagsA11y.ariaAttributes['aria-describedby']}
              />
            </FormControl>
            <FormDescription id={uninstallTagsA11y.descriptionId}>
              Etiquetas para tracking de desinstalación (separar con comas)
            </FormDescription>
            {errors.uninstallTags && (
              <FormMessage id={uninstallTagsA11y.errorId} role="alert">
                {errors.uninstallTags.message}
              </FormMessage>
            )}
          </FormItem>
        )}
      />
    </div>
  );
};
