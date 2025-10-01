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
import { useFormRef, type FormRef } from '@/hooks/useFormRef';
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

    // Exponer API mediante ref
    useFormRef(ref, form, onSubmit);

    // Context value
    const contextValue: ProjectEventFormContext = {
      mode,
      project,
      form: form as UseFormReturn<ProjectEventFormValues>,
      isSubmitting,
      disabled,
    };

    // ✅ OPTIMIZACIÓN: Error Boundary protege todo el formulario
    return (
      <FormErrorBoundary formMode={mode}>
        <FormContext.Provider value={contextValue}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className={className}
            >
              {children}
            </form>
          </Form>
        </FormContext.Provider>
      </FormErrorBoundary>
    );
  }
);
