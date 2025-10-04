"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

import { ModalLayout } from '../modalLayout';
import { getProjects } from '@/services/projectService';
import { createProjectEvent } from '@/services/projectEventService';
import { syncSingleProjectClientName } from '@/services/clientSyncService';
import { ProjectType, ProjectEventType, ProjectStatus } from '@/types/project';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Autocomplete, type AutocompleteItem } from '@/components/ui/autocomplete';
import { ProjectSummary } from '@/components/summary';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

// Importar el nuevo formulario
import { NewProjectEventForm, type NewProjectEventFormValues } from '@/components/forms/NewProjectEventForm';
import { validateProjectForEvents } from '@/utils/eventValidation';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [projectValidation, setProjectValidation] = useState<{isValid: boolean, warnings: string[]}>({isValid: true, warnings: []});
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
      toast({
        title: "Evento creado exitosamente",
        description: `El evento para ${selectedProject?.clientName || 'el proyecto'} ha sido guardado.`,
        variant: "default"
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error al crear evento",
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

  // Convertir proyectos a items del autocomplete
  const projectItems: AutocompleteItem[] = React.useMemo(() => {
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

  // Función para renderizar items del autocomplete
  const renderProjectItem = React.useCallback((item: AutocompleteItem) => {
    if (item.project) {
      return (
        <ProjectSummary
          project={item.project}
          className="w-full"
        />
      );
    }
    return <span className="truncate">{item.label}</span>;
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
          toast({
            title: "Cliente sincronizado",
            description: "Se ha actualizado la información del cliente automáticamente.",
            variant: "default"
          });
          
          // Recargar proyecto actualizado (podríamos usar una query invalidation aquí)
          // Por ahora, asumimos que el proyecto se actualizará en el siguiente render
        } catch (error) {

          toast({
            title: "Advertencia",
            description: "No se pudo sincronizar automáticamente el nombre del cliente.",
            variant: "destructive"
          });
        }
      }
      
      // Auto-completar datos del formulario usando setValue de React Hook Form
      if (formInstanceRef.current) {
        const { setValue, trigger } = formInstanceRef.current;
        
        // Establecer valores del proyecto en el formulario
        setValue('projectId', project.id);
        setValue('description', project.description || '');
        setValue('phone', project.phone || '');
        setValue('fullAddress', project.fullAddress || undefined);
        setValue('status', project.status);
        setValue('windowsCount', project.windowsCount || 0);
        setValue('squareMeters', project.squareMeters || 0);
        setValue('uninstallTags', project.uninstallTags || []);
        setValue('clientName', project.clientName);
        setValue('checklist', initialData?.checklist || []);
        setValue('eventDate', new Date()); // Fecha por defecto es hoy
        
        // Trigger validación después de establecer los valores
        trigger();
      }
      
      // Mostrar advertencias si las hay
      if (validation.warnings.length > 0) {
        toast({
          title: "Advertencias del proyecto",
          description: validation.warnings.join(', '),
          variant: "default"
        });
      }
    }
  }, [filteredProjects, initialData?.checklist, toast]);

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
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Debe seleccionar un proyecto antes de continuar.",
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
        status: data.status as ProjectStatus,
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

  return (
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
            <Autocomplete
              items={projectItems}
              value={initialData?.projectId || ''}
              onSelect={handleProjectSelect}
              placeholder="Buscar proyecto..."
              renderItem={renderProjectItem}
              disabled={isLoadingProjects}
              strictSelection={true}
              className="w-full"
            />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <ProjectSummary
                  project={selectedProject}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Indicadores de validación del proyecto */}
              {projectValidation.isValid ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Proyecto válido para eventos</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Proyecto con advertencias</span>
                </div>
              )}
              
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
  );
}