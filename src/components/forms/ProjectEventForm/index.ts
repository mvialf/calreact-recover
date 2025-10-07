/**
 * ProjectEventForm - Compound Component
 *
 * Sistema unificado para crear eventos de proyecto en modo Lean.
 * Usa referencias al proyecto padre con overrides opcionales.
 *
 * @example
 * // Modo Lean (referencia + overrides opcionales)
 * <ProjectEventForm.Container mode="lean" project={project} onSubmit={handleSubmit}>
 *   <ProjectEventForm.BaseFields />
 *   <ProjectEventForm.OverrideFields />
 *   <ProjectEventForm.ChecklistSection />
 * </ProjectEventForm.Container>
 */

import { Container } from './Container';
import { BaseFields } from './BaseFields';
import { OverrideFields } from './OverrideFields';
import { ChecklistSection } from './ChecklistSection';
import { FormErrorBoundary } from './FormErrorBoundary';

export const ProjectEventForm = {
  Container,
  BaseFields,
  OverrideFields,
  ChecklistSection,
} as const;

// Export types
export type {
  FormMode,
  ContainerProps,
  BaseFormComponentProps,
  ProjectEventFormContext,
} from './types';

// Export Context hook and utilities
export { useProjectEventFormContext } from './Container';
export { FormErrorBoundary };

// Export default
export default ProjectEventForm;
