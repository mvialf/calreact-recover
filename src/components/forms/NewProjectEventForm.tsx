"use client";

// React imports
import React, { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';

// Third-party imports
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

// UI Component imports
import { toast } from 'sonner';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DateInput } from '@/components/ui/date-input';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { ProjectStatusDropdown } from '@/components/summary/project-status-dropdown';
import { Autocomplete, type AutocompleteItem } from '@/components/custom/autocomplete';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectSummary } from '@/components/summary';
import { ProjectEventDetails } from '@/components/summary/project-event-details';
import { X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Services
import { getProjects } from '@/services/projectService';
import { syncSingleProjectClientName } from '@/services/clientSyncService';

// Types
import type { ProjectType } from '@/types/project';
import type { EventType } from '@/types/event';

// Utils
import { validateProjectForEvents } from '@/utils/eventValidation';

// Esquemas de validación centralizados
import { requiredSelection, optionalString } from '@/utils/validation-schemas';

// Hooks personalizados
import { useTeamTags } from '@/hooks/useTeamTags';

// Componentes de tags
import { TagSelector } from '@/components/custom/uninstall-tags/TagSelector';

// ✅ Schema actualizado: incluye projectId como REQUERIDO
const formSchema = z.object({
  projectId: requiredSelection("un proyecto"),
  eventDate: z.date().optional(),
  eventNotes: optionalString,
  teamTags: z.array(z.any()).optional(), // Tags de equipo/participantes
});

// Tipo para los valores del formulario
export type NewProjectEventFormValues = z.infer<typeof formSchema> & {
  clientName?: string;
  checklist?: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    createdAt?: Date;
    completedAt?: Date;
  }>;
};

export interface NewProjectEventFormProps {
  formRef?: React.RefObject<HTMLFormElement>;
  formId?: string;
  formInstanceRef?: React.MutableRefObject<UseFormReturn<NewProjectEventFormValues> | null>;
  onSubmit: (data: NewProjectEventFormValues) => void;
  initialData?: Partial<NewProjectEventFormValues>;
  isSubmitting?: boolean;
  disabled?: boolean;
  // Props para dropdown de status (ahora internos, manejados por el formulario)
  onStatusChange?: (projectId: string, newStatus: string) => void;
  isUpdatingStatus?: boolean;
}

export const NewProjectEventForm: React.FC<NewProjectEventFormProps> = ({
  formRef,
  formId,
  formInstanceRef,
  onSubmit,
  initialData,
  isSubmitting = false,
  disabled = false,
  onStatusChange,
  isUpdatingStatus = false,
}) => {
  // Obtener proyectos para el autocomplete
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  // Estado para el proyecto seleccionado
  const [selectedProject, setSelectedProject] = React.useState<ProjectType | null>(null);
  const [projectValidation, setProjectValidation] = React.useState<{isValid: boolean, warnings: string[]}>({
    isValid: true,
    warnings: []
  });

  // Hook para gestionar tags de equipo/participantes
  const {
    availableTags: teamTags,
    createTag: createTeamTag,
    editTag: editTeamTag,
    deleteTag: deleteTeamTag,
  } = useTeamTags();

  // Formulario con campos actualizados
  const form = useForm<NewProjectEventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: initialData?.projectId || "",
      eventDate: initialData?.eventDate || new Date(),
      eventNotes: initialData?.eventNotes || "",
      teamTags: initialData?.teamTags || [],
      checklist: Array.isArray(initialData?.checklist) ? initialData.checklist : [],
    },
  });

  // Exponer la instancia del formulario al componente padre
  useEffect(() => {
    if (formInstanceRef) {
      formInstanceRef.current = form;
    }
  }, [form, formInstanceRef]);

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

  // Función para renderizar items del autocomplete
  const renderProjectItem = React.useCallback((item: AutocompleteItem) => {
    if (item.project) {
      return (
        <ProjectSummary
          project={item.project}
          className="flex-1"
        />
      );
    }
    return <span className="truncate">{item.label}</span>;
  }, []);

  // Manejar selección de proyecto con validación
  const handleProjectSelect = React.useCallback(async (projectId: string) => {
    const project = filteredProjects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    form.setValue('projectId', projectId);

    if (project) {
      // Validar proyecto para eventos
      const validation = validateProjectForEvents(project);
      setProjectValidation(validation);

      // Sincronizar clientName si es necesario
      if (project.clientId && !project.clientName) {
        try {
          await syncSingleProjectClientName(project.id);

          toast.success('Cliente sincronizado', {
            description: 'Se ha actualizado la información del cliente automáticamente.',
          });
        } catch (error) {
          toast.error('Advertencia', {
            description: 'No se pudo sincronizar automáticamente el nombre del cliente.',
          });
        }
      }

      // Auto-completar fecha del evento si no está establecida
      if (!form.getValues('eventDate')) {
        form.setValue('eventDate', new Date());
      }

      // Trigger validación
      form.trigger();

      // Mostrar advertencias si las hay
      if (validation.warnings.length > 0) {
        toast('Advertencias del proyecto', {
          description: validation.warnings.join(', '),
        });
      }
    }
  }, [filteredProjects, form]);

  // Función para limpiar la selección
  const handleClearSelection = React.useCallback(() => {
    setSelectedProject(null);
    form.setValue('projectId', '');
    setProjectValidation({isValid: true, warnings: []});
  }, [form]);

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

  // Manejar el envío del formulario
  const handleFormSubmit = (data: NewProjectEventFormValues) => {
    // Validar que hay un proyecto seleccionado
    if (!selectedProject) {
      toast.error('Error de validación', {
        description: 'Debe seleccionar un proyecto antes de continuar.',
      });
      return;
    }

    onSubmit(data);
  };

  // Handler para errores de validación
  const handleValidationError = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(`Error de validación: ${firstError.message}`);
    } else {
      toast.error("Por favor, revisa los campos del formulario");
    }
  };

  // Efecto para establecer el proyecto seleccionado si hay projectId inicial
  React.useEffect(() => {
    if (initialData?.projectId && projects.length > 0 && !selectedProject) {
      const project = projects.find(p => p.id === initialData.projectId);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [projects, initialData?.projectId, selectedProject]);

  // Loading skeleton
  if (isLoadingProjects) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        id={formId}
        onSubmit={form.handleSubmit(handleFormSubmit, handleValidationError)}
        className="space-y-6"
      >
        {/* Campo de Proyecto */}
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proyecto *</FormLabel>
              {!selectedProject ? (
                <FormControl>
                  <Autocomplete
                    items={projectItems}
                    value={field.value}
                    onSelect={handleProjectSelect}
                    placeholder="Buscar proyecto..."
                    emptyText="No se encontraron proyectos."
                    disabled={disabled || isLoadingProjects}
                    isLoading={isLoadingProjects}
                    renderItem={renderProjectItem}
                    strictSelection={true}
                  />
                </FormControl>
              ) : (
                <div className="space-y-3">
                  {/* Resumen del proyecto con botón de limpieza */}
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <ProjectSummary
                          project={selectedProject}
                          className="text-foreground flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelection}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          aria-label="Cambiar proyecto"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detalles del proyecto seleccionado */}
                  <ProjectEventDetails
                    event={transformProjectToEvent(selectedProject)}
                    status={selectedProject.status}
                  />

                  {/* Mostrar advertencias si las hay */}
                  {projectValidation.warnings.length > 0 && (
                    <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-900">
                      <ul className="list-disc list-inside space-y-1">
                        {projectValidation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campos del EVENTO (solo si hay proyecto seleccionado) */}
        {selectedProject && (
          <div className="space-y-4">
            {/* Fecha del Evento y Status */}
            <div className="grid grid-cols-2 gap-4">
              {/* Fecha del Evento */}
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha del Evento</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined
                          field.onChange(date)
                        }}
                        disabled={disabled}
                        placeholder="Seleccionar fecha"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dropdown de Status */}
              {onStatusChange && (
                <div className="flex items-center">
                  <div className="scale-[1.5] origin-left">
                    <ProjectStatusDropdown
                      projectId={selectedProject.id}
                      currentStatus={selectedProject.status}
                      onStatusChange={onStatusChange}
                      isPending={isUpdatingStatus}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notas del Evento */}
            <FormField
              control={form.control}
              name="eventNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas del Evento</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Notas o comentarios específicos de este evento"
                      rows={3}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Participantes del Evento (Team Tags) */}
            <FormField
              control={form.control}
              name="teamTags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TagSelector
                      selectedTags={field.value || []}
                      availableTags={teamTags}
                      onTagsChange={field.onChange}
                      onCreateTag={createTeamTag}
                      onEditTag={editTeamTag}
                      onDeleteTag={deleteTeamTag}
                      placeholder="Seleccionar participantes..."
                      label="Equipo/Participantes"
                      displayMode="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </form>
    </Form>
  );
}

// Componente de carga esquelético
function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
