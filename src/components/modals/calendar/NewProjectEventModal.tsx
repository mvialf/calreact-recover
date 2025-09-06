"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ModalLayout } from '../modalLayout';
import { getProjects } from '@/services/projectService';
import { createProjectEvent } from '@/services/projectEventService';
import { syncSingleProjectClientName } from '@/services/clientSyncService';
import { ProjectType, ProjectEventType, ProjectStatus } from '@/types/project';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Autocomplete, type AutocompleteItem } from '@/components/ui/autocomplete';
import { ProjectClientDisplay } from '@/components/client-display';
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
  onEventCreated?: () => void; // Callback para cuando se crea un evento exitosamente
}

export function NewProjectEventModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
  autoSave = true, // Por defecto guarda automáticamente
  onEventCreated,
}: NewProjectEventModalProps) {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [formData, setFormData] = useState<Partial<NewProjectEventFormValues>>(initialData || {});
  const [isInternalSubmitting, setIsInternalSubmitting] = useState(false);
  const [projectValidation, setProjectValidation] = useState<{isValid: boolean, warnings: string[]}>({isValid: true, warnings: []});
  const formRef = useRef<HTMLFormElement>(null);

  // Obtener la lista de proyectos
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    enabled: isOpen,
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
    if (formData.projectId && projects.length > 0 && !selectedProject) {
      const project = projects.find(p => p.id === formData.projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projects, formData.projectId, selectedProject]);

  // Efecto para resetear cuando se cierra la modal
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedProject(null);
      setFormData(initialData || {});
    }
  }, [isOpen, initialData]);

  // Función para renderizar items del autocomplete
  const renderProjectItem = React.useCallback((item: AutocompleteItem) => {
    if (item.project) {
      return (
        <ProjectClientDisplay 
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
      
      // Auto-completar datos del formulario con datos del proyecto
      const updatedFormData: Partial<NewProjectEventFormValues> = {
        projectId: project.id,
        description: project.description || '',
        phone: project.phone || '',
        fullAddress: project.fullAddress || undefined,
        status: project.status,
        windowsCount: project.windowsCount || 0,
        squareMeters: project.squareMeters || 0,
        uninstall: project.uninstall || false,
        uninstallTypes: project.uninstallTypes,
        uninstallOther: project.uninstallOther || '',
        clientName: project.clientName,
        checklist: initialData?.checklist || [],
        eventDate: new Date(), // Fecha por defecto es hoy
      };
      setFormData(updatedFormData);
      
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
    setFormData(initialData || {});
  }, [initialData]);

  // Manejar el envío del formulario con guardado automático
  const handleFormSubmit = async (data: NewProjectEventFormValues) => {
    // Debug: Log de datos antes de enviar

    
    // Validar que hay un proyecto seleccionado
    if (!selectedProject) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Debe seleccionar un proyecto antes de continuar.",
      });
      return;
    }
    
    // Datos del formulario con información adicional del proyecto
    const formDataWithProject: NewProjectEventFormValues = {
      ...data,
      projectId: selectedProject.id,
      eventDate: data.eventDate || new Date(),
      clientName: selectedProject.clientName || data.clientName || 'Cliente pendiente',
      checklist: data.checklist || [],
      // Asegurar valores por defecto para campos requeridos
      windowsCount: data.windowsCount ?? 0,
      squareMeters: data.squareMeters ?? 0,
      uninstall: data.uninstall ?? false,
      uninstallTypes: data.uninstallTypes ?? [],
    };
    

    
    try {
      // Si autoSave está habilitado, guardar directamente
      if (autoSave) {
        setIsInternalSubmitting(true);
        
        // Transformar datos del formulario al formato de entidad para createProjectEvent
        const eventDataForService: Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'> = {
          projectId: selectedProject.id,
          eventDate: formDataWithProject.eventDate || new Date(),
          status: formDataWithProject.status as ProjectStatus,
          clientName: selectedProject.clientName || formDataWithProject.clientName || 'Cliente pendiente',
          description: formDataWithProject.description,
          phone: formDataWithProject.phone,
          fullAddress: formDataWithProject.fullAddress ? {
            textoCompleto: formDataWithProject.fullAddress.textoCompleto,
            placeId: formDataWithProject.fullAddress.placeId,
            coordenadas: formDataWithProject.fullAddress.coordenadas,
            componentes: formDataWithProject.fullAddress.componentes,
            detalle: formDataWithProject.fullAddress.detalle,
            informacionAdicional: formDataWithProject.fullAddress.informacionAdicional,
            comune: formDataWithProject.fullAddress.comune
          } : undefined,
          windowsCount: formDataWithProject.windowsCount || 0,
          squareMeters: formDataWithProject.squareMeters || 0,
          uninstall: formDataWithProject.uninstall || false,
          uninstallTypes: formDataWithProject.uninstallTypes || [],
          uninstallOther: formDataWithProject.uninstallOther,
          glosa: selectedProject.glosa,
          checklist: formDataWithProject.checklist || [],
        };
        

        const createdEvent = await createProjectEvent(eventDataForService);
        
        toast({
          title: "Evento creado exitosamente",
          description: `El evento para ${selectedProject.clientName || 'el proyecto'} ha sido guardado.`,
          variant: "default"
        });
        

        
        // Callback para refrescar calendario si se proporciona
        if (onEventCreated) {
          onEventCreated();
        }
        
        // Cerrar modal después del guardado exitoso
        onClose();
        
      } else {
        // Si no está en modo autoSave, usar onSubmit externo
        if (typeof onSubmit === 'function') {
          onSubmit(formDataWithProject);
        } else {
          throw new Error('No se proporcionó función onSubmit y autoSave está deshabilitado');
        }
      }
      
    } catch (error) {

      toast({
        variant: "destructive",
        title: "Error al crear evento",
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
      });
    } finally {
      setIsInternalSubmitting(false);
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
      submitButtonText={(isSubmitting || isInternalSubmitting) ? 'Guardando...' : 'Crear Evento'}
      isSubmitting={isSubmitting || isLoadingProjects || isInternalSubmitting}
      className="w-full max-w-xl"
    >
      <div className="space-y-4">
        {/* Autocomplete de Proyectos */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Proyecto</Label>
          {!selectedProject ? (
            <Autocomplete
              items={projectItems}
              value={formData.projectId || ''}
              onSelect={handleProjectSelect}
              placeholder="Buscar proyecto..."
              renderItem={renderProjectItem}
              disabled={isLoadingProjects}
              className="w-full"
            />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <ProjectClientDisplay 
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
          onSubmit={handleFormSubmit}
          initialData={formData}
          isSubmitting={isSubmitting}
          //disabled={!!selectedProject}  Deshabilitar campos cuando hay proyecto seleccionado
        />
      </div>
    </ModalLayout>
  );
}