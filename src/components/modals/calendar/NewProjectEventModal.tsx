"use client";

import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

import { createProjectEvent } from '@/services/projectEventService';
import { updateProject } from '@/services/projectService';
import type { ProjectEventType } from '@/types/project';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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

  // Mutación para crear evento de proyecto
  const createEventMutation = useMutation({
    mutationFn: (eventData: Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'>) =>
      createProjectEvent(eventData),
    onSuccess: () => {
      // IMPORTANTE: Cerrar dialog ANTES de invalidar queries para evitar race condition
      // que deja pointer-events: none en el body (bug conocido de Radix UI Dialog)
      // Referencias: https://github.com/radix-ui/primitives/issues/1241
      onClose();

      // Workaround: Esperar a que Radix UI complete el cleanup del dialog
      // Luego limpiar manualmente pointer-events y ejecutar invalidaciones
      setTimeout(() => {
        // Limpiar style inline que Radix UI no limpia correctamente durante race condition
        document.body.style.removeProperty('pointer-events');

        // Invalidar queries para refrescar datos
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });

        // Notificar al usuario
        toast.success('Evento creado exitosamente', {
          description: 'El evento ha sido guardado correctamente.',
        });
      }, 100);
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
      // IMPORTANTE: Workaround para race condition con Radix UI Dialog
      // No cerramos el modal aquí porque la actualización de status es una acción secundaria
      // que ocurre mientras el modal está abierto (dropdown dentro del formulario)
      setTimeout(() => {
        document.body.style.removeProperty('pointer-events');

        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['calendar-events'] });

        toast.success('Status actualizado', {
          description: 'El estado del proyecto se actualizó correctamente.',
        });
      }, 100);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
        <DialogHeader>
          <DialogTitle>Crear Evento de Proyecto</DialogTitle>
          <DialogDescription className="sr-only">
            Formulario para crear un nuevo evento de proyecto
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Formulario completamente autónomo con búsqueda de proyecto integrada */}
          <NewProjectEventForm
            formId="new-project-event-form"
            onSubmit={handleFormSubmit}
            initialData={initialData}
            isSubmitting={isSubmitting || createEventMutation.isPending}
            onStatusChange={handleStatusChange}
            isUpdatingStatus={updateStatusMutation.isPending}
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || createEventMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-project-event-form"
            disabled={isSubmitting || createEventMutation.isPending}
          >
            {(isSubmitting || createEventMutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando
              </>
            ) : (
              'Crear Evento'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
