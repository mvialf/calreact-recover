"use client";

import React, { useRef } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { ModalLayout } from '../modalLayout';
import { createProjectEvent } from '@/services/projectEventService';
import { updateProject } from '@/services/projectService';
import type { ProjectEventType } from '@/types/project';
import { toast } from 'sonner';

// Importar el formulario completo y autónomo
import { NewProjectEventForm, type NewProjectEventFormValues } from '@/components/forms/NewProjectEventForm';

export interface NewProjectEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NewProjectEventFormValues) => void;
  initialData?: Partial<NewProjectEventFormValues>;
  isSubmitting?: boolean;
  autoSave?: boolean;
}

export function NewProjectEventModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
  autoSave = true,
}: NewProjectEventModalProps) {
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  // Mutación para crear evento de proyecto
  const createEventMutation = useMutation({
    mutationFn: (eventData: Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'>) =>
      createProjectEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Evento creado exitosamente', {
        description: 'El evento ha sido guardado correctamente.',
      });
      onClose();
    },
    onError: (error: Error) => {
      toast.error('Error al crear evento', {
        description: error.message || 'Ocurrió un error inesperado',
      });
    }
  });

  // Mutación para actualizar status del proyecto
  const updateStatusMutation = useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: string }) =>
      updateProject(projectId, { status: status as any }),
    onSuccess: () => {
      toast.success('Status actualizado', {
        description: 'El estado del proyecto se actualizó correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
    onError: (err: Error) => {
      toast.error('Error al actualizar', {
        description: `${err.message}`,
      });
    },
  });

  // Handler para cambiar el status del proyecto
  const handleStatusChange = (projectId: string, newStatus: string) => {
    updateStatusMutation.mutate({ projectId, status: newStatus });
  };

  // Manejar el envío del formulario con guardado automático
  const handleFormSubmit = async (data: NewProjectEventFormValues) => {
    // Validar que tenemos projectId (el formulario ya valida esto)
    if (!data.projectId) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un proyecto antes de continuar.',
      });
      return;
    }

    // Si autoSave está habilitado, guardar directamente usando mutation
    if (autoSave) {
      // Obtener el proyecto completo del cache de React Query
      const projects = queryClient.getQueryData<any[]>(['projects']) || [];
      const selectedProject = projects.find(p => p.id === data.projectId);

      if (!selectedProject) {
        toast.error('Error', {
          description: 'No se encontró el proyecto seleccionado.',
        });
        return;
      }

      // Transformar datos del formulario al formato de entidad para createProjectEvent
      const eventDataForService: Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId: selectedProject.id,

        // Campos específicos del evento (del formulario)
        eventDate: data.eventDate || new Date(),
        checklist: data.checklist || [],

        // Campos del proyecto (fuente única: selectedProject del cache)
        clientName: selectedProject.clientName || 'Cliente pendiente',
        description: selectedProject.description || '',
        phone: selectedProject.phone || '',
        fullAddress: selectedProject.fullAddress,
        windowsCount: selectedProject.windowsCount || 0,
        squareMeters: selectedProject.squareMeters || 0,
        uninstallTags: selectedProject.uninstallTags || [],
        glosa: selectedProject.glosa,
      };

      await createEventMutation.mutateAsync(eventDataForService);
    } else {
      // Si no está en modo autoSave, usar onSubmit externo
      if (typeof onSubmit === 'function') {
        onSubmit(data);
      }
    }
  };

  return (
    <ModalLayout
      isOpen={isOpen}
      title="Crear Evento de Proyecto"
      onClose={onClose}
      onSubmit={() => {
        formRef.current?.requestSubmit();
      }}
      submitButtonText={(isSubmitting || createEventMutation.isPending) ? 'Guardando...' : 'Crear Evento'}
      isSubmitting={isSubmitting || createEventMutation.isPending}
      className="w-full max-w-xl"
    >
      {/* Formulario completamente autónomo con búsqueda de proyecto integrada */}
      <NewProjectEventForm
        formRef={formRef}
        onSubmit={handleFormSubmit}
        initialData={initialData}
        isSubmitting={isSubmitting || createEventMutation.isPending}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={updateStatusMutation.isPending}
      />
    </ModalLayout>
  );
}
