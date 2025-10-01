/**
 * ProjectEventForm - Compound Component
 *
 * Sistema unificado para crear eventos de proyecto en modo 'lean' o 'full'.
 *
 * @example
 * // Modo Lean (referencia + overrides)
 * <ProjectEventForm.Container mode="lean" project={project} onSubmit={handleSubmit}>
 *   <ProjectEventForm.ProjectInfo />
 *   <ProjectEventForm.BaseFields />
 *   <ProjectEventForm.OverrideFields />
 *   <ProjectEventForm.ChecklistSection />
 * </ProjectEventForm.Container>
 *
 * @example
 * // Modo Full (duplicación completa)
 * <ProjectEventForm.Container mode="full" onSubmit={handleSubmit}>
 *   <ProjectEventForm.BaseFields />
 *   <ProjectEventForm.FullFields />
 *   <ProjectEventForm.ChecklistSection />
 * </ProjectEventForm.Container>
 */

import { Container } from './Container';
import { ProjectInfo } from './ProjectInfo';
import { BaseFields } from './BaseFields';
import { FullFields } from './FullFields';
import { OverrideFields } from './OverrideFields';
import { ChecklistSection } from './ChecklistSection';
import { FormErrorBoundary } from './FormErrorBoundary';

export const ProjectEventForm = {
  Container,
  ProjectInfo,
  BaseFields,
  FullFields,
  OverrideFields,
  ChecklistSection,
} as const;

// Export types
export type {
  FormMode,
  ContainerProps,
  ProjectInfoProps,
  BaseFormComponentProps,
  ProjectEventFormContext,
} from './types';

// Export Context hook and utilities
export { useProjectEventFormContext } from './Container';
export { FormErrorBoundary };

// Export default
export default ProjectEventForm;
