'use client';

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectForm, ProjectFormData as ProjectFormValues } from '@/components/forms/ProjectForm';
import { ModalLayout } from '@/components/modals/modalLayout';
import { toast } from 'sonner';
import { updateProject } from '@/services/projectService';
import type { ProjectType, ProjectStatus } from '@/types/project';
import { DialogErrorBoundary } from '@/components/error-boundary/DialogErrorBoundary';
import { DEFAULT_TAX_RATE } from '@/constants/defaults';
import { projectLogger } from '@/lib/logger';

interface EditProjectDialogProps {
  project: ProjectType;
  children?: React.ReactNode; // ← Ahora opcional

  // NUEVO: Soporte para control externo
  isOpenControlled?: boolean;
  onCloseControlled?: () => void;
  onSuccess?: () => void;
}

export function EditProjectDialog({
  project,
  children,
  isOpenControlled,
  onCloseControlled,
  onSuccess
}: EditProjectDialogProps) {
  // 🔥 TODOS LOS HOOKS AL INICIO - ANTES DE CUALQUIER EARLY RETURN

  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement | null>(null);

  // Determinar si está controlado externamente o internamente
  const isControlled = isOpenControlled !== undefined;
  const isOpen = isControlled ? isOpenControlled : isOpenInternal;

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
        toast.success('Proyecto actualizado correctamente.');

        // NUEVO: Callback onSuccess externo
        if (onSuccess) {
          onSuccess();
        }

        // Cerrar modal (modo controlado o interno)
        if (isControlled && onCloseControlled) {
          onCloseControlled();
        } else {
          setIsOpenInternal(false);
        }
      } catch (error) {
        projectLogger.error('Error en onSuccess', error);
      }
    },
    onError: (error) => {
      projectLogger.error('Error en mutación updateProject', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al actualizar proyecto', {
        description: `Hubo un problema al actualizar el proyecto: ${errorMessage}`,
      });
    },
  });

  const handleSubmit = React.useCallback((data: ProjectFormValues) => {
    try {
      mutate(data);
    } catch (error) {
      projectLogger.error('Error en handleSubmit', error);
      toast.error('Error inesperado al procesar el formulario');
    }
  }, [mutate]);

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
        uninstallTags: Array.isArray(project.uninstallTags)
          ? project.uninstallTags.map(tag => ({
              ...tag,
              createdAt: tag.createdAt instanceof Date
                ? tag.createdAt
                : (tag.createdAt as any)?.toDate?.() || new Date()
            }))
          : [],
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
        uninstallTags: [],
      };
    }
  }, [project]);

  const handleClose = React.useCallback(() => {
    try {
      if (isControlled && onCloseControlled) {
        onCloseControlled(); // Modo controlado
      } else {
        setIsOpenInternal(false); // Modo interno
      }
    } catch (error) {
      projectLogger.error('Error al cerrar modal', error);
    }
  }, [isControlled, onCloseControlled]);

  const handleOpen = React.useCallback(() => {
    try {
      // Solo aplicable en modo trigger-based (cuando hay children)
      if (!isControlled) {
        setIsOpenInternal(true);
      }
    } catch (error) {
      projectLogger.error('Error al abrir modal', error);
    }
  }, [isControlled]);

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
        toast.error('Error inesperado', {
          description: 'Ha ocurrido un error al cargar el diálogo. Por favor, recarga la página.',
        });
      }}
    >
      {/* Trigger solo si hay children (modo trigger-based) */}
      {children && (
        <div onClick={handleOpen}>
          {children}
        </div>
      )}

      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title="Editar Proyecto"
        className="w-full max-w-xl"
        showDefaultButtons={true}
        onSubmit={() => {
          if (formRef.current) {
            formRef.current.requestSubmit();
          } else {
            // Fallback: intentar buscar por ID
            const formById = document.getElementById('edit-project-form') as HTMLFormElement;
            if (formById) {
              formById.requestSubmit();
            } else {
              toast.error('Error', {
                description: 'No se pudo encontrar el formulario.',
              });
            }
          }
        }}
        isSubmitting={isPending}
        submitButtonText={isPending ? "Actualizando..." : "Actualizar Proyecto"}
      >
        <div ref={(el) => {
          if (el) {
            const form = el.querySelector('form');
            if (form) {
              formRef.current = form;
            }
          }
        }}>
          <ProjectForm
            onSubmit={handleSubmit}
            defaultValues={initialData}
            showDefaultButtons={false}
            variant="modal"
            formId="edit-project-form"
          />
        </div>
      </ModalLayout>
    </DialogErrorBoundary>
  );
}