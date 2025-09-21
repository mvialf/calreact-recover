'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectForm, ProjectFormData as ProjectFormValues } from '@/components/forms/ProjectForm';
import { FormModal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/use-toast';
import { updateProject } from '@/services/projectService';
import type { ProjectType, ProjectStatus } from '@/types/project';
import { DialogErrorBoundary } from '@/components/error-boundary/DialogErrorBoundary';
import { DEFAULT_TAX_RATE } from '@/constants/defaults';
import { projectLogger } from '@/lib/logger';

interface EditProjectDialogProps {
  project: ProjectType;
  children: React.ReactNode;
}

export function EditProjectDialog({ project, children }: EditProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutación simplificada para actualizar proyecto
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      if (!project?.id) {
        throw new Error('ID de proyecto requerido para actualización');
      }

      const projectData = {
        ...data,
        status: data.status as ProjectStatus
      };
      return await updateProject(project.id, projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsOpen(false);
    },
    onError: (error) => {
      projectLogger.error('Error en mutación updateProject', error);
      throw error; // Re-throw para que FormModal maneje el error
    },
  });

  // Manejador simplificado para envío del formulario
  const handleFormSubmit = async (data: ProjectFormValues) => {
    try {
      await mutate(data);
    } catch (error) {
      projectLogger.error('Error en handleFormSubmit', error);
      throw error; // Re-throw para FormModal
    }
  };

  // Mapeo simplificado de datos iniciales para el formulario
  const initialData: Partial<ProjectFormValues> = React.useMemo(() => {
    if (!project) return {};

    return {
      clientId: project.clientId || '',
      projectNumber: project.projectNumber ?? '',
      glosa: project.glosa ?? '',
      date: project.date ? new Date(project.date) : new Date(),
      status: project.status ?? 'ingresado',
      subtotal: Number(project.subtotal) || 0,
      taxRate: Number(project.taxRate) || DEFAULT_TAX_RATE,
      windowsCount: Number(project.windowsCount) || 0,
      squareMeters: Number(project.squareMeters) || 0,
      phone: project.phone ?? '',
      fullAddress: project.fullAddress ? {
        ...project.fullAddress,
        placeId: project.fullAddress.placeId || '',
        textoCompleto: project.fullAddress.textoCompleto || '',
        coordenadas: {
          latitude: Number(project.fullAddress.coordenadas?.latitude) || 0,
          longitude: Number(project.fullAddress.coordenadas?.longitude) || 0
        }
      } : {
        textoCompleto: '',
        placeId: '',
        coordenadas: { latitude: 0, longitude: 0 }
      },
      description: project.description ?? '',
      uninstallTags: Array.isArray(project.uninstallTags) ? project.uninstallTags : [],
    };
  }, [project]);

  // Callbacks para manejo del modal
  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  // Callbacks para FormModal
  const handleSuccess = (data: ProjectFormValues) => {
    projectLogger.info('Proyecto actualizado exitosamente', {
      projectId: project.id,
      projectNumber: data.projectNumber
    });
  };

  const handleError = (error: Error) => {
    projectLogger.error('Error en EditProjectDialog', error);
  };

  // Validación defensiva del proyecto
  if (!project || !project.id) {
    projectLogger.error('EditProjectDialog: proyecto inválido o sin ID', { project });
    return null;
  }

  return (
    <DialogErrorBoundary
      onError={(error, errorInfo) => {
        projectLogger.error('Error en EditProjectDialog', { error, errorInfo });
        toast({
          title: 'Error inesperado',
          description: 'Ha ocurrido un error al cargar el diálogo. Por favor, recarga la página.',
          variant: 'destructive',
        });
      }}
    >
      {/* Trigger Button */}
      <div onClick={handleOpen}>
        {children}
      </div>

      {/* Modal con nuevo sistema FormModal */}
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Editar Proyecto"
        size="xl"
        formId="edit-project-form"
        onSubmit={handleFormSubmit}
        submitText={isPending ? "Actualizando..." : "Actualizar Proyecto"}
        cancelText="Cancelar"
        showCancel={true}
        description="Modifique la información del proyecto"
        scrollable={true}
        onSuccess={handleSuccess}
        onError={handleError}
        preventCloseOnSubmit={false}
        resetOnClose={false}
      >
        {/* Formulario con variante modal y datos iniciales */}
        <ProjectForm
          variant="modal"
          formId="edit-project-form"
          onSubmit={handleFormSubmit}
          defaultValues={initialData}
          isSubmitting={isPending}
          showDefaultButtons={false} // Los botones los maneja FormModal
        />
      </FormModal>
    </DialogErrorBoundary>
  );
}