'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProjectForm, ProjectFormData as ProjectFormValues } from '@/components/forms/ProjectForm';
import { createProject } from '@/services/projectService';
import { addClient } from '@/services/clientService';
import { toast } from 'sonner';
import { ModalLayout } from '@/components/modals/modalLayout';
import type { ProjectType, ProjectStatus } from '@/types/project';
import { projectLogger } from '@/lib/logger';

export function NewProjectDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);

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
      toast.success('Cliente agregado', {
        description: 'El cliente ha sido agregado exitosamente.',
      });
    },
    onError: (error: Error) => {
      toast.error('Error al agregar cliente', {
        description: error.message || 'Ocurrió un error al agregar el cliente.',
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
      toast.success('Proyecto creado', {
        description: `El proyecto "${newProject.projectNumber}" ha sido creado exitosamente.`,
      });
      setIsOpen(false); // Cerrar el diálogo después de crear el proyecto
      router.refresh(); // Refrescar la página para mostrar el nuevo proyecto
    },
    onError: (error: Error) => {
      toast.error('Error al crear proyecto', {
        description: error.message || 'No se pudo crear el proyecto.',
      });
    },
  });

  // Manejador de envío del formulario
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
        uninstallTags: formData.uninstallTags || [],
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

      // Crear el proyecto
      await createProjectMutation.mutateAsync(projectData);
    } catch (error) {
      projectLogger.error('Error al crear el proyecto', error);
    }
  };

  return (
    <>
      <Button 
        variant="default" 
        size="sm" 
        className="h-8 gap-1"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Nuevo Proyecto
        </span>
      </Button>

      <ModalLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nuevo Proyecto"
        className="w-full max-w-xl"
        showDefaultButtons={true}
        formRef={formRef}
        isSubmitting={createProjectMutation.isPending}
        submitButtonText="Crear Proyecto"

      >
        <div className="space-y-4 py-2">
          <ProjectForm
            onSubmit={handleFormSubmit}
            submitButtonText="Crear Proyecto"
            showDefaultButtons={false}
          />
        </div>
      </ModalLayout>
    </>
  );
}
