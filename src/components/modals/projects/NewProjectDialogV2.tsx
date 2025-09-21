'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormModal, useModalState } from '@/components/ui/modal';
import { ProjectForm, ProjectFormData as ProjectFormValues } from '@/components/forms/ProjectForm';
import { createProject } from '@/services/projectService';
import { addClient } from '@/services/clientService';
import { useToast } from '@/components/ui/use-toast';
import type { ProjectType, ProjectStatus } from '@/types/project';
import { projectLogger } from '@/lib/logger';

export function NewProjectDialogV2() {
  const { isOpen, open, close } = useModalState();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutación para crear un nuevo cliente
  const addClientMutation = useMutation({
    mutationFn: (clientData: { name: string; email?: string; phone?: string }) => {
      const clientToAdd = {
        name: clientData.name,
        email: clientData.email || '',
        phone: clientData.phone || ''
      };
      return addClient(clientToAdd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Cliente Agregado',
        description: 'El cliente ha sido agregado exitosamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al Agregar Cliente',
        description: error.message || 'Ocurrió un error al agregar el cliente.',
        variant: 'destructive',
      });
    },
  });

  // Función para manejar la adición de un nuevo cliente
  const handleAddClient = async (client: { name: string; email?: string; phone?: string }) => {
    try {
      await addClientMutation.mutateAsync(client);
    } catch (error) {
      projectLogger.error('Error al agregar cliente', error);
      throw error;
    }
  };

  // Mutación para crear un nuevo proyecto
  const createProjectMutation = useMutation({
    mutationFn: (
      projectData: Omit<ProjectType, 'id' | 'createdAt' | 'updatedAt' | 'total' | 'balance'>
    ) => createProject(projectData),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Proyecto Creado',
        description: `El proyecto "${newProject.projectNumber}" ha sido creado exitosamente.`,
      });
      close(); // Cerrar el modal después de crear el proyecto
      router.refresh(); // Refrescar la página para mostrar el nuevo proyecto
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al Crear Proyecto',
        description: error.message || 'No se pudo crear el proyecto.',
        variant: 'destructive',
      });
    },
  });

  // Manejador de envío del formulario optimizado
  const handleFormSubmit = async (formData: ProjectFormValues) => {
    try {
      // Calcular total y balance
      const subtotal = Number(formData.subtotal) || 0;
      const taxRate = Number(formData.taxRate) || 0;
      const total = subtotal * (1 + taxRate / 100);

      // Preparar los datos para la creación
      const projectData: Omit<ProjectType, 'id' | 'createdAt' | 'updatedAt' | 'total' | 'balance'> = {
        ...formData,
        status: formData.status as ProjectStatus,
        subtotal,
        taxRate,
        uninstallTypes: formData.uninstallTypes || [],
        ...(formData.fullAddress && {
          fullAddress: {
            textoCompleto: formData.fullAddress.textoCompleto || '',
            coordenadas: formData.fullAddress.coordenadas || { latitude: 0, longitude: 0 },
            placeId: formData.fullAddress.placeId || '',
            ...(formData.fullAddress.componentes && {
              componentes: {
                calle: formData.fullAddress.componentes.calle || undefined,
                numero: formData.fullAddress.componentes.numero || undefined,
                comuna: formData.fullAddress.componentes.comuna || undefined,
                ciudad: formData.fullAddress.componentes.ciudad || undefined,
                region: formData.fullAddress.componentes.region || undefined,
                pais: formData.fullAddress.componentes.pais || undefined,
                codigoPostal: formData.fullAddress.componentes.codigoPostal || undefined,
              }
            }),
            detalle: formData.fullAddress.detalle || undefined
          },
          address: formData.fullAddress.textoCompleto || '',
          commune: formData.fullAddress.componentes?.comuna || '',
          region: formData.fullAddress.componentes?.region || '',
        }),
      };

      // Crear el proyecto usando la mutación
      await createProjectMutation.mutateAsync(projectData);
    } catch (error) {
      projectLogger.error('Error al crear el proyecto', error);
      throw error; // Re-throw para que FormModal maneje el error
    }
  };

  // Callback de éxito personalizado
  const handleSuccess = (data: ProjectFormValues) => {
    projectLogger.info('Proyecto creado exitosamente', { projectNumber: data.projectNumber });
  };

  // Callback de error personalizado
  const handleError = (error: Error) => {
    projectLogger.error('Error en NewProjectDialog', error);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button 
        variant="default" 
        size="sm" 
        className="h-8 gap-1"
        onClick={open}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Nuevo Proyecto
        </span>
      </Button>

      {/* Modal con nuevo sistema */}
      <FormModal
        isOpen={isOpen}
        onClose={close}
        title="Nuevo Proyecto"
        size="xl"
        formId="new-project-form"
        onSubmit={handleFormSubmit}
        submitText="Crear Proyecto"
        cancelText="Cancelar"
        showCancel={true}
        description="Complete la información para crear un nuevo proyecto"
        scrollable={true}
        onSuccess={handleSuccess}
        onError={handleError}
        preventCloseOnSubmit={false}
        resetOnClose={true}
      >
        {/* Formulario con variante modal */}
        <ProjectForm
          variant="modal"
          formId="new-project-form"
          onSubmit={handleFormSubmit}
          isSubmitting={createProjectMutation.isPending}
          showDefaultButtons={false} // Los botones los maneja FormModal
        />
      </FormModal>
    </>
  );
}