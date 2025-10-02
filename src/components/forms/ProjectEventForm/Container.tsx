/**
 * Container principal del formulario con Context Pattern
 *
 * Proporciona estado compartido a todos los componentes hijos
 */

'use client';

import React, { createContext, useContext, forwardRef, type ReactNode } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useFormRef, type FormRef } from '@/hooks/useFormRef';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import {
  projectEventLeanSchema,
  projectEventFullSchema,
  type ProjectEventFormValues,
  type ProjectEventLeanFormValues,
  type ProjectEventFullFormValues,
} from '@/schemas/project-event.schemas';
import type { ContainerProps, ProjectEventFormContext } from './types';
import { FormErrorBoundary } from './FormErrorBoundary';

// Context para compartir estado
const FormContext = createContext<ProjectEventFormContext | null>(null);

/**
 * Hook para acceder al context del formulario
 */
export const useProjectEventFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useProjectEventFormContext must be used within ProjectEventForm.Container');
  }
  return context;
};

/**
 * Container principal del formulario
 *
 * @example
 * <ProjectEventForm.Container
 *   mode="lean"
 *   project={project}
 *   onSubmit={handleSubmit}
 * >
 *   <ProjectEventForm.BaseFields />
 *   <ProjectEventForm.ChecklistSection />
 * </ProjectEventForm.Container>
 */
export const Container = forwardRef<FormRef<ProjectEventFormValues>, ContainerProps>(
  function Container(
    {
      mode,
      project,
      initialData,
      onSubmit,
      isSubmitting = false,
      disabled = false,
      className,
      children,
    },
    ref
  ) {
    // Seleccionar schema según modo
    const schema = mode === 'lean' ? projectEventLeanSchema : projectEventFullSchema;

    // Valores por defecto según modo
    const getDefaultValues = () => {
      const base = {
        projectId: project?.id || initialData?.projectId || '',
        eventDate: initialData?.eventDate || new Date(),
        checklist: initialData?.checklist || [],
        eventNotes: initialData?.eventNotes || '',
      };

      if (mode === 'lean') {
        return {
          ...base,
          customDescription: (initialData as ProjectEventLeanFormValues)?.customDescription,
          customPhone: (initialData as ProjectEventLeanFormValues)?.customPhone,
          customStatus: (initialData as ProjectEventLeanFormValues)?.customStatus,
        };
      } else {
        return {
          ...base,
          description: (initialData as ProjectEventFullFormValues)?.description || project?.description || '',
          phone: (initialData as ProjectEventFullFormValues)?.phone || project?.phone || '',
          fullAddress: (initialData as ProjectEventFullFormValues)?.fullAddress || project?.fullAddress,
          status: (initialData as ProjectEventFullFormValues)?.status || project?.status || 'ingresado',
          windowsCount: (initialData as ProjectEventFullFormValues)?.windowsCount || project?.windowsCount || 0,
          squareMeters: (initialData as ProjectEventFullFormValues)?.squareMeters || project?.squareMeters || 0,
          uninstallTags: (initialData as ProjectEventFullFormValues)?.uninstallTags || [],
        };
      }
    };

    const form = useForm<ProjectEventFormValues>({
      resolver: zodResolver(schema),
      defaultValues: getDefaultValues(),
    });

    // ✅ OPTIMIZACIÓN: Optimistic updates con rollback automático
    const { execute: executeOptimistic, isExecuting } = useOptimisticUpdate(
      async (data: ProjectEventFormValues) => {
        await onSubmit(data);
      },
      {
        successMessage: mode === 'lean'
          ? 'Evento guardado exitosamente'
          : 'Evento creado exitosamente',
        errorMessage: 'Error al guardar el evento',
        onSuccess: () => {
          form.reset();
        },
      }
    );

    // Handler con optimistic update
    const handleSubmit = async (data: ProjectEventFormValues) => {
      await executeOptimistic(data);
    };

    // Exponer API mediante ref
    useFormRef(ref, form, handleSubmit);

    // Context value con estado de ejecución combinado
    const contextValue: ProjectEventFormContext = {
      mode,
      project,
      form: form as UseFormReturn<ProjectEventFormValues>,
      isSubmitting: isSubmitting || isExecuting,
      disabled,
    };

    // ✅ OPTIMIZACIÓN: Error Boundary protege todo el formulario
    return (
      <FormErrorBoundary formMode={mode}>
        <FormContext.Provider value={contextValue}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className={className}
            >
              <div className="relative">
                {/* Loading Overlay cuando está enviando */}
                <LoadingOverlay
                  visible={isSubmitting || isExecuting}
                  message={
                    mode === 'lean'
                      ? 'Guardando evento...'
                      : 'Creando evento...'
                  }
                  opacity="medium"
                />

                {/* Contenido del formulario con opacidad reducida cuando está cargando */}
                <div className={isSubmitting || isExecuting ? 'opacity-50 pointer-events-none' : ''}>
                  {children}
                </div>
              </div>
            </form>
          </Form>
        </FormContext.Provider>
      </FormErrorBoundary>
    );
  }
);
