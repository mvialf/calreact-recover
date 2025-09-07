"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ModalLayout } from '../modalLayout';
import { getProjects } from '@/services/projectService';
import { createProjectEventLean } from '@/services/projectEventServiceV2';
import { getProjectFromCache, preloadProjects } from '@/services/cache/projectCacheService';
import { ProjectType, CreateProjectEventLeanData, ProjectStatus, ChecklistItem } from '@/types/project';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Autocomplete, type AutocompleteItem } from '@/components/ui/autocomplete';
import { ProjectClientDisplay } from '@/components/client-display';
import { X, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { createLogger } from '@/lib/logger';

// Nuevo formulario optimizado para eventos lean
import { NewProjectEventLeanForm, type NewProjectEventLeanFormValues } from '@/components/forms/NewProjectEventLeanForm';
import { validateProjectForEvents } from '@/utils/eventValidation';

const logger = createLogger('NewProjectEventModalV2');

export interface NewProjectEventModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: NewProjectEventLeanFormValues) => void;
  initialData?: Partial<NewProjectEventLeanFormValues>;
  isSubmitting?: boolean;
  autoSave?: boolean;
  onEventCreated?: () => void;
  useCache?: boolean; // Nueva prop para habilitar/deshabilitar cache
}

export function NewProjectEventModalV2({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
  autoSave = true,
  onEventCreated,
  useCache = true, // Cache habilitado por defecto
}: NewProjectEventModalV2Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [formData, setFormData] = useState<Partial<NewProjectEventLeanFormValues>>(initialData || {});
  const [isInternalSubmitting, setIsInternalSubmitting] = useState(false);
  const [projectValidation, setProjectValidation] = useState<{isValid: boolean, warnings: string[]}>({isValid: true, warnings: []});
  const [cacheStats, setCacheStats] = useState<{hits: number, misses: number}>({hits: 0, misses: 0});
  const formRef = useRef<HTMLFormElement>(null);

  // Obtener la lista de proyectos
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    enabled: isOpen,
    staleTime: 2 * 60 * 1000, // 2 minutos - reducido gracias al cache
    onSuccess: useCallback((projectsData: ProjectType[]) => {
      // Pre-cargar proyectos frecuentes en cache cuando se abra el modal
      if (useCache && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        preloadProjects(projectIds).catch(error => 
          logger.warn('Error pre-cargando proyectos en cache', { error })
        );
      }
    }, [useCache]),
  });

  // Filtrar proyectos: excluir completados y pagados
  const filteredProjects = useMemo(() => {
    return projects.filter(project => 
      project.status !== 'completado' && project.isPaid !== true
    );
  }, [projects]);

  // Preparar opciones para el autocomplete
  const autocompleteOptions: AutocompleteItem[] = useMemo(() => 
    filteredProjects.map((project) => ({
      value: project.id,
      label: `${project.projectNumber} - ${project.clientName || 'Sin cliente'}`,
      description: project.description || 'Sin descripción',
      project: project, // Datos completos para uso posterior
    }))
  , [filteredProjects]);

  // Optimización: Función de selección de proyecto con cache
  const handleProjectSelect = useCallback(async (projectId: string) => {
    const startTime = Date.now();
    logger.debug('Seleccionando proyecto', { projectId, useCache });

    try {
      let project: ProjectType | null = null;
      let cacheUsed = false;

      if (useCache) {
        // Intentar obtener desde cache primero
        project = await getProjectFromCache(projectId);
        cacheUsed = Boolean(project);
        
        if (project) {
          setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
          logger.debug('Proyecto obtenido desde cache', { projectId, duration: Date.now() - startTime });
        } else {
          setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
        }
      }

      // Fallback a la lista en memoria si cache falla
      if (!project) {
        project = filteredProjects.find(p => p.id === projectId) || null;
        logger.debug('Proyecto obtenido desde lista en memoria', { projectId });
      }

      if (!project) {
        throw new Error('Proyecto no encontrado');
      }

      setSelectedProject(project);

      // Validar el proyecto para eventos
      const validation = validateProjectForEvents(project);
      setProjectValidation(validation);

      // Auto-completar datos del formulario con composición inteligente
      const updatedFormData: Partial<NewProjectEventLeanFormValues> = {
        projectId: project.id,
        eventDate: new Date(),
        checklist: initialData?.checklist || [],
        // Campos opcionales solo si queremos override del proyecto
        customDescription: initialData?.customDescription || undefined,
        customPhone: initialData?.customPhone || undefined,
        customStatus: initialData?.customStatus || undefined,
        eventNotes: initialData?.eventNotes || '',
      };
      
      setFormData(updatedFormData);

      // Mostrar información de cache si está habilitado
      if (useCache) {
        toast({
          title: cacheUsed ? "Proyecto cargado (Cache)" : "Proyecto cargado (Firestore)",
          description: `${project.clientName || 'Sin cliente'} - ${cacheUsed ? 'Respuesta instantánea' : 'Cargado desde servidor'}`,
          variant: "default"
        });
      }

      // Mostrar advertencias si las hay
      if (validation.warnings.length > 0) {
        toast({
          title: "Advertencias del proyecto",
          description: validation.warnings.join(', '),
          variant: "default"
        });
      }

      logger.info('Proyecto seleccionado exitosamente', {
        projectId,
        cacheUsed,
        duration: Date.now() - startTime,
        clientName: project.clientName
      });

    } catch (error) {
      logger.error('Error seleccionando proyecto', { projectId, error });
      toast({
        title: "Error",
        description: "No se pudo cargar el proyecto seleccionado.",
        variant: "destructive"
      });
    }
  }, [filteredProjects, initialData, useCache, toast]);

  // Función para limpiar la selección
  const handleClearSelection = useCallback(() => {
    setSelectedProject(null);
    setFormData(initialData || {});
    setProjectValidation({isValid: true, warnings: []});
    logger.debug('Selección de proyecto limpiada');
  }, [initialData]);

  // Función de envío optimizada
  const handleSubmit = useCallback(async (data: NewProjectEventLeanFormValues) => {
    const startTime = Date.now();
    logger.info('Iniciando creación de evento lean', { projectId: data.projectId });

    if (isSubmitting || isInternalSubmitting) {
      logger.warn('Envío ignorado - ya está en proceso');
      return;
    }

    // Usar onSubmit externo si se proporciona
    if (onSubmit && !autoSave) {
      onSubmit(data);
      return;
    }

    setIsInternalSubmitting(true);

    try {
      // Validar que tenemos un proyecto válido
      if (!projectValidation.isValid) {
        throw new Error('El proyecto seleccionado no es válido para crear eventos');
      }

      // Preparar datos para el servicio lean
      const eventLeanData: CreateProjectEventLeanData = {
        projectId: data.projectId,
        eventDate: data.eventDate,
        checklist: data.checklist.map(item => ({
          id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          description: item.description,
          isCompleted: item.isCompleted || false,
          priority: item.priority || 'medium',
          category: item.category,
          notes: item.notes
        })),
        customDescription: data.customDescription?.trim() || undefined,
        customPhone: data.customPhone?.trim() || undefined,
        customStatus: data.customStatus || undefined,
        eventNotes: data.eventNotes?.trim() || undefined,
      };

      // Crear el evento usando el nuevo servicio lean
      const createdEvent = await createProjectEventLean(eventLeanData);

      logger.info('Evento lean creado exitosamente', {
        eventId: createdEvent.id,
        projectId: data.projectId,
        duration: Date.now() - startTime
      });

      // Invalidar queries relacionadas para actualizar UI
      queryClient.invalidateQueries({ queryKey: ['projectEvents'] });
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });

      toast({
        title: "Evento creado",
        description: `Evento programado para ${createdEvent.eventDate.toLocaleDateString()}`,
        variant: "default"
      });

      // Callback de éxito
      if (onEventCreated) {
        onEventCreated();
      }

      // Cerrar modal
      onClose();

    } catch (error) {
      logger.error('Error creando evento lean', {
        projectId: data.projectId,
        error: error instanceof Error ? error.message : 'Error desconocido',
        duration: Date.now() - startTime
      });

      toast({
        title: "Error al crear evento",
        description: error instanceof Error ? error.message : 'Error inesperado',
        variant: "destructive"
      });
    } finally {
      setIsInternalSubmitting(false);
    }
  }, [isSubmitting, isInternalSubmitting, onSubmit, autoSave, projectValidation.isValid, queryClient, toast, onEventCreated, onClose]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      handleClearSelection();
    }
  }, [isOpen, handleClearSelection]);

  // Función para mostrar estadísticas de cache (solo en desarrollo)
  const showCacheStats = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && useCache) {
      console.log('Cache Stats:', cacheStats);
      toast({
        title: "Estadísticas de Cache",
        description: `Aciertos: ${cacheStats.hits}, Fallos: ${cacheStats.misses}`,
        variant: "default"
      });
    }
  }, [cacheStats, useCache, toast]);

  return (
    <ModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Evento de Proyecto"
      description="Crear un evento programado para un proyecto específico (Versión Optimizada)"
    >
      <div className="space-y-6">
        {/* Header con indicador de cache */}
        {useCache && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Cache inteligente habilitado - Respuesta más rápida
              </span>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={showCacheStats}
                className="text-xs"
              >
                Stats: {cacheStats.hits}h/{cacheStats.misses}m
              </Button>
            )}
          </div>
        )}

        {/* Selección de Proyecto */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Proyecto</Label>
            {selectedProject && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {!selectedProject ? (
            <Autocomplete
              options={autocompleteOptions}
              onSelectionChange={(selection) => {
                if (selection) {
                  handleProjectSelect(selection.value);
                }
              }}
              placeholder="Buscar proyecto por número o cliente..."
              emptyMessage="No se encontraron proyectos"
              isLoading={isLoadingProjects}
              className="w-full"
            />
          ) : (
            <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {selectedProject.projectNumber}
                    </p>
                    <ProjectClientDisplay 
                      clientName={selectedProject.clientName} 
                      className="text-sm text-green-700 dark:text-green-300"
                    />
                  </div>
                </div>
              </div>

              {/* Mostrar advertencias si las hay */}
              {projectValidation.warnings.length > 0 && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      {projectValidation.warnings.map((warning, index) => (
                        <div key={index}>• {warning}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formulario de Evento Lean */}
        {selectedProject && (
          <NewProjectEventLeanForm
            ref={formRef}
            onSubmit={handleSubmit}
            initialData={formData}
            isSubmitting={isSubmitting || isInternalSubmitting}
            project={selectedProject} // Proporcionar datos del proyecto para referencia
          />
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || isInternalSubmitting}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={!selectedProject || !projectValidation.isValid || isSubmitting || isInternalSubmitting}
            className="min-w-[120px]"
          >
            {(isSubmitting || isInternalSubmitting) ? 'Creando...' : 'Crear Evento'}
          </Button>
        </div>
      </div>
    </ModalLayout>
  );
}