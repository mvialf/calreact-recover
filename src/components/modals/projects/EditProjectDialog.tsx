'use client';

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectForm, ProjectFormData as ProjectFormValues } from '@/components/forms/ProjectForm';
import { Button } from '@/components/ui/button';
import { ModalLayout } from '@/components/modals/modalLayout';
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
  // 🔥 TODOS LOS HOOKS AL INICIO - ANTES DE CUALQUIER EARLY RETURN
  
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Hook useMutation siempre debe ejecutarse
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      if (!project?.id) {
        throw new Error('ID de proyecto requerido para actualización');
      }
      
      try {
        // Cast del status al tipo correcto
        const projectData = {
          ...data,
          status: data.status as ProjectStatus
        };
        return await updateProject(project.id, projectData);
      } catch (error) {
        projectLogger.error('Error en mutationFn', error);
        throw error;
      }
    },
    onSuccess: () => {
      try {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast({ 
          title: 'Éxito', 
          description: 'Proyecto actualizado correctamente.',
          variant: 'default'
        });
        setIsOpen(false);
      } catch (error) {
        projectLogger.error('Error en onSuccess', error);
      }
    },
    onError: (error) => {
      projectLogger.error('Error en mutación updateProject', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({ 
        title: 'Error al actualizar proyecto', 
        description: `Hubo un problema al actualizar el proyecto: ${errorMessage}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = React.useCallback((data: ProjectFormValues) => {
    try {
      mutate(data);
    } catch (error) {
      projectLogger.error('Error en handleSubmit', error);
      toast({ 
        title: 'Error', 
        description: 'Error inesperado al procesar el formulario',
        variant: 'destructive',
      });
    }
  }, [mutate, toast]);

  // Mapeo defensivo para asegurar que ningún campo controlado reciba null o undefined.
  const initialData: Partial<ProjectFormValues> = React.useMemo(() => {
    try {
      if (!project) {
        return {
          clientId: '',
          projectNumber: '',
          glosa: '',
          date: new Date(),
          status: 'ingresado' as const,
          subtotal: 0,
          taxRate: DEFAULT_TAX_RATE,
          windowsCount: 0,
          squareMeters: 0,
          phone: '',
          fullAddress: {
            textoCompleto: '',
            placeId: '',
            coordenadas: { latitude: 0, longitude: 0 }
          },
          description: '',
          uninstall: false,
          uninstallTypes: [],
        };
      }
      
      return {
        clientId: project.clientId || '', // Validación adicional
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
          coordenadas: {
            latitude: 0,
            longitude: 0
          }
        },
        description: project.description ?? '',
        uninstallTypes: Array.isArray(project.uninstallTypes) ? project.uninstallTypes : [],
      };
    } catch (error) {
      projectLogger.error('Error al mapear datos iniciales', error);
      // Retornar datos por defecto seguros
      return {
        clientId: '',
        projectNumber: '',
        glosa: '',
        date: new Date(),
        status: 'ingresado' as const,
        subtotal: 0,
        taxRate: DEFAULT_TAX_RATE,
        windowsCount: 0,
        squareMeters: 0,
        phone: '',
        fullAddress: {
          textoCompleto: '',
          placeId: '',
          coordenadas: { latitude: 0, longitude: 0 }
        },
        description: '',
        uninstall: false,
        uninstallTypes: [],
      };
    }
  }, [project]);

  const handleClose = React.useCallback(() => {
    try {
      setIsOpen(false);
    } catch (error) {
      projectLogger.error('Error al cerrar modal', error);
    }
  }, []);

  const handleOpen = React.useCallback(() => {
    try {
      setIsOpen(true);
    } catch (error) {
      projectLogger.error('Error al abrir modal', error);
    }
  }, []);

  // 🔥 AHORA SÍ SE PUEDEN HACER EARLY RETURNS
  
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
      <div onClick={handleOpen}>
        {children}
      </div>

      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title="Editar Proyecto"
        className="w-full max-w-xl"
        showDefaultButtons={true}
        formRef={formRef}
        isSubmitting={isPending}
        submitButtonText={isPending ? "Actualizando..." : "Actualizar Proyecto"}
      >
        <ProjectForm
          onSubmit={handleSubmit}
          defaultValues={initialData}
          showDefaultButtons={false}
        />
      </ModalLayout>
    </DialogErrorBoundary>
  );
}