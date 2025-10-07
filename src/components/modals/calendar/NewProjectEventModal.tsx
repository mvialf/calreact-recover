"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { ModalLayout } from '../modalLayout';
import { getProjects } from '@/services/projectService';
import { createProjectEvent } from '@/services/projectEventService';
import { syncSingleProjectClientName } from '@/services/clientSyncService';
import { ProjectType, ProjectEventType, ProjectStatus } from '@/types/project';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox, type ComboboxItem } from '@/components/ui/combobox';
import { ProjectSummary } from '@/components/summary';
import { ProjectEventDetails } from '@/components/summary/project-event-details';
import { CheckCircle, AlertCircle, Edit, X } from 'lucide-react';

// Importar el nuevo formulario
import { NewProjectEventForm, type NewProjectEventFormValues } from '@/components/forms/NewProjectEventForm';
import { validateProjectForEvents } from '@/utils/eventValidation';

// ← NUEVO: Importar EditProjectDialog para modal anidado
import { EditProjectDialog } from '@/components/modals/projects/EditProjectDialog';
import type { EventType } from '@/types/event';

export interface NewProjectEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NewProjectEventFormValues) => void; // Ahora opcional, maneja internamente por defecto
  initialData?: Partial<NewProjectEventFormValues>;
  isSubmitting?: boolean;
  autoSave?: boolean; // Si true, guarda automáticamente sin onSubmit externo
}

export function NewProjectEventModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
  autoSave = true, // Por defecto guarda automáticamente
}: NewProjectEventModalProps) {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [projectValidation, setProjectValidation] = useState<{isValid: boolean, warnings: string[]}>({isValid: true, warnings: []});
  const [isEditingProject, setIsEditingProject] = useState(false); // ← NUEVO: Estado para modal anidado
  const formRef = useRef<HTMLFormElement>(null);
  const formInstanceRef = useRef<UseFormReturn<NewProjectEventFormValues> | null>(null);

  // Obtener la lista de proyectos
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    enabled: isOpen,
  });

  // Mutación para crear evento de proyecto
  const createEventMutation = useMutation({
    mutationFn: (eventData: Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'>) =>
      createProjectEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Evento creado exitosamente', {
        description: `El evento para ${selectedProject?.clientName || 'el proyecto'} ha sido guardado.`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast.error('Error al crear evento', {
        description: error.message || 'Ocurrió un error inesperado',
      });
    }
  });

  // Filtrar proyectos: excluir completados y pagados
  const filteredProjects = React.useMemo(() => {
    return projects.filter(project => 
      project.status !== 'completado' && project.isPaid !== true
    );
  }, [projects]);

  // Convertir proyectos a items del combobox
  const projectItems: ComboboxItem[] = React.useMemo(() => {
    return filteredProjects.map(project => ({
      value: project.id,
      label: `${project.projectNumber} - ${project.clientName || 'Cliente no especificado'}`,
      project // Guardamos el proyecto completo para acceso posterior
    }));
  }, [filteredProjects]);

  // Efecto para establecer el proyecto seleccionado si hay projectId inicial
  React.useEffect(() => {
    if (initialData?.projectId && projects.length > 0 && !selectedProject) {
      const project = projects.find(p => p.id === initialData.projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projects, initialData?.projectId, selectedProject]);

  // Efecto para resetear cuando se cierra la modal
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedProject(null);
    }
  }, [isOpen]);

  // Función para renderizar items del combobox
  const renderProjectItem = React.useCallback((item: ComboboxItem, isSelected: boolean) => {
    if (item.project) {
      return (
        <div className="flex items-center gap-2 w-full">
          <div className={`w-4 h-4 flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
            <CheckCircle className="h-4 w-4" />
          </div>
          <ProjectSummary
            project={item.project}
            className="flex-1"
          />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 w-full">
        <div className={`w-4 h-4 flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
          <CheckCircle className="h-4 w-4" />
        </div>
        <span className="truncate">{item.label}</span>
      </div>
    );
  }, []);

  // Manejar selección de proyecto con validación
  const handleProjectSelect = React.useCallback(async (projectId: string) => {
    const project = filteredProjects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    
    if (project) {
      // Validar proyecto para eventos
      const validation = validateProjectForEvents(project);
      setProjectValidation(validation);
      
      // Sincronizar clientName si es necesario
      let updatedProject = project;
      if (project.clientId && !project.clientName) {
        try {

          await syncSingleProjectClientName(project.id);
          
          // Mostrar mensaje de éxito
          toast.success('Cliente sincronizado', {
            description: 'Se ha actualizado la información del cliente automáticamente.',
          });
          
          // Recargar proyecto actualizado (podríamos usar una query invalidation aquí)
          // Por ahora, asumimos que el proyecto se actualizará en el siguiente render
        } catch (error) {

          toast.error('Advertencia', {
            description: 'No se pudo sincronizar automáticamente el nombre del cliente.',
          });
        }
      }
      
      // ✅ Auto-completar SOLO campos del evento en el formulario
      if (formInstanceRef.current) {
        const { setValue, trigger } = formInstanceRef.current;

        // Establecer valores del EVENTO (fuente única de verdad)
        setValue('projectId', project.id);
        setValue('eventDate', new Date()); // Fecha por defecto es hoy
        setValue('checklist', initialData?.checklist || []);

        // Trigger validación después de establecer los valores
        trigger();
      }
      
      // Mostrar advertencias si las hay
      if (validation.warnings.length > 0) {
        toast('Advertencias del proyecto', {
          description: validation.warnings.join(', '),
        });
      }
    }
  }, [filteredProjects, initialData?.checklist]);

  // Función para limpiar la selección
  const handleClearSelection = React.useCallback(() => {
    setSelectedProject(null);
    // Reset del formulario se maneja directamente por React Hook Form
    if (formInstanceRef.current) {
      formInstanceRef.current.reset(initialData || {});
    }
  }, [initialData]);

  // Manejar el envío del formulario con guardado automático
  const handleFormSubmit = (data: NewProjectEventFormValues) => {
    // Validar que hay un proyecto seleccionado
    if (!selectedProject) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un proyecto antes de continuar.',
      });
      return;
    }

    // Si autoSave está habilitado, guardar directamente usando mutation
    if (autoSave) {
      // Transformar datos del formulario al formato de entidad para createProjectEvent
      const eventDataForService: Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId: selectedProject.id,

        // Campos específicos del evento (del formulario)
        eventDate: data.eventDate || new Date(),
        checklist: data.checklist || [],

        // Campos del proyecto (fuente única: selectedProject)
        clientName: selectedProject.clientName || 'Cliente pendiente',
        description: selectedProject.description || '',
        phone: selectedProject.phone || '',
        fullAddress: selectedProject.fullAddress,
        windowsCount: selectedProject.windowsCount || 0,
        squareMeters: selectedProject.squareMeters || 0,
        uninstallTags: selectedProject.uninstallTags || [],
        glosa: selectedProject.glosa,
      };

      createEventMutation.mutate(eventDataForService);
    } else {
      // Si no está en modo autoSave, usar onSubmit externo
      if (typeof onSubmit === 'function') {
        const completeFormData: NewProjectEventFormValues = {
          ...data,
          projectId: selectedProject.id,
          eventDate: data.eventDate || new Date(),
          clientName: selectedProject.clientName || data.clientName || 'Cliente pendiente',
        };
        onSubmit(completeFormData);
      }
    }
  };

  // ====== NUEVO: Handlers para modal de edición de proyecto ======

  // Handler para abrir modal de edición de proyecto
  const handleEditProjectClick = React.useCallback(() => {
    setIsEditingProject(true);
  }, []);

  // Handler para cuando se actualiza el proyecto exitosamente
  const handleProjectUpdated = React.useCallback(() => {
    // Cache se invalida automáticamente en EditProjectDialog
    // Solo necesitamos cerrar el modal secundario
    setIsEditingProject(false);

    toast.success('Proyecto actualizado', {
      description: 'Los datos del proyecto se han actualizado correctamente'
    });

    // Re-fetch del proyecto actualizado para actualizar el formulario
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  }, [queryClient]);

  // Handler para cerrar modal de edición sin guardar
  const handleEditProjectClose = React.useCallback(() => {
    setIsEditingProject(false);
  }, []);

  // Transformar ProjectType a EventType para ProjectEventDetails
  const transformProjectToEvent = React.useCallback((project: ProjectType): EventType => {
    return {
      id: project.id,
      name: project.clientName || 'Cliente pendiente',
      startDate: new Date(),
      endDate: new Date(),
      type: 'Proyecto',
      color: '#3b82f6',
      referenceId: project.id,
      description: project.description,
      phone: project.phone,
      status: project.status,
      fullAddress: project.fullAddress ? {
        textoCompleto: project.fullAddress.textoCompleto,
        comune: project.fullAddress.comune,
        coordenadas: project.fullAddress.coordenadas,
        componentes: project.fullAddress.componentes as Record<string, string> | undefined,
        informacionAdicional: project.fullAddress.informacionAdicional,
      } : undefined,
      windowsCount: project.windowsCount,
      squareMeters: project.squareMeters,
      uninstallTags: project.uninstallTags,
    };
  }, []);

  return (
    <>
      {/* Modal principal: Crear evento */}
      <ModalLayout
        isOpen={isOpen}
        title="Crear Evento de Proyecto"
        onClose={onClose}
        onSubmit={() => {
          formRef.current?.requestSubmit();
        }}
        submitButtonText={(isSubmitting || createEventMutation.isPending) ? 'Guardando...' : 'Crear Evento'}
        isSubmitting={isSubmitting || isLoadingProjects || createEventMutation.isPending}
        className="w-full max-w-xl"
      >
        <div className="space-y-4">
          {/* Autocomplete de Proyectos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Proyecto</Label>
            {!selectedProject ? (
              <Combobox
                items={projectItems}
                value={initialData?.projectId || ''}
                onSelect={handleProjectSelect}
                placeholder="Buscar proyecto..."
                searchPlaceholder="Buscar por número o cliente..."
                renderItem={renderProjectItem}
                disabled={isLoadingProjects}
                isLoading={isLoadingProjects}
                emptyText="No se encontraron proyectos"
                className="w-full"
              />
            ) : (
              <div className="space-y-3">
                {/* ✅ Resumen del proyecto con botones de acción */}
                <div className="flex items-center gap-2">
                  <ProjectSummary
                    project={selectedProject}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEditProjectClick}
                    aria-label="Editar proyecto"
                    className="shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    aria-label="Limpiar selección de proyecto"
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Detalles del proyecto seleccionado */}
                <div>
                  <ProjectEventDetails event={transformProjectToEvent(selectedProject)} />
                </div>

                {/* Mostrar advertencias si las hay */}
                {projectValidation.warnings.length > 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
                    <ul className="list-disc list-inside space-y-1">
                      {projectValidation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulario */}
          <NewProjectEventForm
            formRef={formRef}
            formInstanceRef={formInstanceRef}
            onSubmit={handleFormSubmit}
            initialData={initialData}
            isSubmitting={isSubmitting}
            //disabled={!!selectedProject}  Deshabilitar campos cuando hay proyecto seleccionado
          />
        </div>
      </ModalLayout>

      {/* Modal anidado: Editar proyecto (renderizado condicionalmente) */}
      {isEditingProject && selectedProject && (
        <EditProjectDialog
          project={selectedProject}
          isOpenControlled={true}
          onCloseControlled={handleEditProjectClose}
          onSuccess={handleProjectUpdated}
        />
      )}
    </>
  );
}