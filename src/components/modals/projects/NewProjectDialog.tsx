'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ProjectForm, ProjectFormData as ProjectFormValues } from '@/components/forms/ProjectForm';
import { createProject } from '@/services/projectService';
import { addClient } from '@/services/clientService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ProjectType, ProjectStatus } from '@/types/project';
import { projectLogger } from '@/lib/logger';

export function NewProjectDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
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
      // IMPORTANTE: Cerrar dialog ANTES de invalidar queries para evitar race condition
      // que deja pointer-events: none en el body (bug conocido de Radix UI Dialog)
      // Referencias: https://github.com/radix-ui/primitives/issues/1241
      setIsOpen(false);

      // Workaround: Esperar a que Radix UI complete el cleanup del dialog
      setTimeout(() => {
        document.body.style.removeProperty('pointer-events');

        queryClient.invalidateQueries({ queryKey: ['projects'] });

        toast.success('Proyecto creado', {
          description: `El proyecto "${newProject.projectNumber}" ha sido creado exitosamente.`,
        });

        router.refresh(); // Refrescar la página para mostrar el nuevo proyecto
      }, 100);
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
          <DialogHeader>
            <DialogTitle>Nuevo Proyecto</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para crear un nuevo proyecto
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <ProjectForm
              formId="new-project-form"
              onSubmit={handleFormSubmit}
              submitButtonText="Crear Proyecto"
              showDefaultButtons={false}
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createProjectMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="new-project-form"
              disabled={createProjectMutation.isPending}
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando
                </>
              ) : (
                'Crear Proyecto'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
