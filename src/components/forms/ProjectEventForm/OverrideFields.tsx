/**
 * OverrideFields - Campos de sobreescritura para modo lean
 *
 * Permite sobrescribir campos específicos del proyecto
 * sin duplicar toda la información (arquitectura lean).
 */

import React, { useMemo } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';
import { useProjectEventFormContext } from './Container';
import type { BaseFormComponentProps } from './types';

export const OverrideFields: React.FC<BaseFormComponentProps> = ({ className }) => {
  const { form, project, disabled } = useProjectEventFormContext();

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
      {/* Custom Description (Override) */}
      <FormField
        control={form.control}
        name="customDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Descripción Personalizada
              {project?.description && (
                <Badge variant="outline" className="ml-2 font-normal">
                  Override
                </Badge>
              )}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                disabled={disabled}
                placeholder={
                  project?.description
                    ? `Por defecto: ${project.description.slice(0, 50)}...`
                    : 'Descripción personalizada...'
                }
                rows={3}
                className="resize-none"
              />
            </FormControl>
            <FormDescription>
              {project?.description
                ? 'Deje vacío para usar la descripción del proyecto'
                : 'Descripción específica para este evento'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Custom Phone (Override) */}
      <FormField
        control={form.control}
        name="customPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Teléfono Personalizado
              {project?.phone && (
                <Badge variant="outline" className="ml-2 font-normal">
                  Override
                </Badge>
              )}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={disabled}
                placeholder={
                  project?.phone
                    ? `Por defecto: ${project.phone}`
                    : '+56 9 1234 5678'
                }
                type="tel"
              />
            </FormControl>
            <FormDescription>
              {project?.phone
                ? 'Deje vacío para usar el teléfono del proyecto'
                : 'Teléfono específico para este evento'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Custom Status (Override) */}
      <FormField
        control={form.control}
        name="customStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Estado Personalizado
              {project?.status && (
                <Badge variant="outline" className="ml-2 font-normal">
                  Override
                </Badge>
              )}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      project?.status
                        ? `Por defecto: ${project.status}`
                        : 'Seleccione un estado'
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">
                  <em className="text-muted-foreground">
                    {project?.status
                      ? `Usar estado del proyecto (${project.status})`
                      : 'Sin estado'}
                  </em>
                </SelectItem>
                {statusOptions}
              </SelectContent>
            </Select>
            <FormDescription>
              {project?.status
                ? 'Seleccione solo si necesita un estado diferente para este evento'
                : 'Estado específico para este evento'}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
