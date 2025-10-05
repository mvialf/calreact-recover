/**
 * Tipos compartidos para ProjectEventForm compound component
 */

import type { Control, FieldErrors, UseFormReturn } from 'react-hook-form';
import type { ProjectType } from '@/types/project';
import type {
  ProjectEventLeanFormValues,
  ProjectEventFullFormValues,
  ProjectEventFormValues,
} from '@/schemas/project-event.schemas';

// Re-export para tests
export type { ProjectEventFormValues };

/**
 * Modo de operación del formulario
 */
export type FormMode = 'lean' | 'full';

/**
 * Props base compartidas por todos los componentes
 * (Los campos del formulario se acceden vía Context)
 */
export interface BaseFormComponentProps {
  className?: string;
}

/**
 * Props del Container principal
 */
export interface ContainerProps {
  mode: FormMode;
  project?: ProjectType;
  initialData?: Partial<ProjectEventFormValues>;
  onSubmit: (data: ProjectEventFormValues) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Props de ProjectInfo (Card de información del proyecto)
 */
export interface ProjectInfoProps {
  project?: ProjectType;
  className?: string;
  onEditProject?: () => void; // ← Callback para editar proyecto
}

/**
 * Context para compartir estado entre componentes
 */
export interface ProjectEventFormContext {
  mode: FormMode;
  project?: ProjectType;
  form: UseFormReturn<ProjectEventFormValues>;
  isSubmitting: boolean;
  disabled: boolean;
}
