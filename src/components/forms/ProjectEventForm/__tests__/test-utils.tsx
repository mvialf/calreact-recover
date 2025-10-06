/**
 * Test utilities para ProjectEventForm compound component
 *
 * Proporciona helpers reutilizables, mock factories y renders especializados
 * para facilitar el testing del compound component.
 */

import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { ProjectEventForm } from '../index';
import type { ContainerProps, ProjectEventFormValues } from '../types';
import { createMockProject, createMockProjectEvent } from '@/__tests__/helpers/test-data-factory';
import type { UseFormReturn } from 'react-hook-form';

// ==================== Mock Factories ====================

/**
 * Factory para valores de formulario en modo lean
 */
export const createMockLeanFormValues = (overrides: Partial<ProjectEventFormValues> = {}): ProjectEventFormValues => ({
  projectId: 'mock-project-id',
  eventDate: new Date('2024-06-15'),
  checklist: [],
  eventNotes: 'Test event notes',
  customDescription: 'Custom description for testing',
  customPhone: '+34 600 000 000',
  customStatus: 'En Progreso',
  ...overrides,
});

/**
 * Factory para valores de formulario en modo full
 */
export const createMockFullFormValues = (overrides: Partial<ProjectEventFormValues> = {}): ProjectEventFormValues => ({
  projectId: 'mock-project-id',
  eventDate: new Date('2024-06-15'),
  checklist: [],
  eventNotes: 'Test event notes',
  description: 'Full description for testing',
  phone: '+34 600 000 000',
  fullAddress: {
    textoCompleto: 'Calle Test 123, Madrid, España',
    placeId: 'ChIJtest123',
    coordenadas: { latitude: 40.4168, longitude: -3.7038 },
  },
  status: 'ingresado',
  windowsCount: 5,
  squareMeters: 100,
  uninstallTags: [],
  ...overrides,
});

/**
 * Factory para checklist items
 */
export const createMockChecklistItem = (overrides: any = {}) => ({
  id: `check-${Date.now()}`,
  description: 'Test checklist item',
  isCompleted: false,
  priority: 'medium',
  category: '',
  notes: '',
  createdAt: new Date(),
  ...overrides,
});

// ==================== Render Helpers ====================

/**
 * Render helper que envuelve el compound en Container con props por defecto
 *
 * @example
 * renderProjectEventForm(
 *   { mode: 'lean', project: mockProject },
 *   <ProjectEventForm.BaseFields />
 * );
 */
export const renderProjectEventForm = (
  props: Partial<ContainerProps> = {},
  children?: React.ReactNode
): RenderResult => {
  const defaultProps: ContainerProps = {
    mode: 'lean',
    project: createMockProject(),
    onSubmit: jest.fn(),
    ...props,
  };

  return render(
    <ProjectEventForm.Container {...defaultProps}>
      {children || <ProjectEventForm.BaseFields />}
    </ProjectEventForm.Container>
  );
};

// ==================== Context Mocks ====================

/**
 * Mock del contexto de formulario para tests unitarios aislados
 */
export const mockFormContext = {
  mode: 'lean' as const,
  project: createMockProject(),
  form: {
    control: {} as any,
    watch: jest.fn().mockReturnValue(null),
    setValue: jest.fn(),
    getValues: jest.fn().mockReturnValue({}),
    handleSubmit: jest.fn((onValid) => (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();
      onValid(createMockLeanFormValues());
    }),
    formState: {
      errors: {},
      isSubmitting: false,
      isDirty: false,
      isValid: true,
    },
  } as unknown as UseFormReturn<ProjectEventFormValues>,
  isSubmitting: false,
  disabled: false,
};

/**
 * Mock del contexto para modo full
 */
export const mockFullFormContext = {
  ...mockFormContext,
  mode: 'full' as const,
  form: {
    ...mockFormContext.form,
    getValues: jest.fn().mockReturnValue(createMockFullFormValues()),
  } as unknown as UseFormReturn<ProjectEventFormValues>,
};

// ==================== Test Data Builders ====================

/**
 * Builder para crear proyecto con eventos
 */
export const createProjectWithEvents = (eventCount = 3) => {
  const project = createMockProject();
  const events = Array.from({ length: eventCount }, (_, index) =>
    createMockProjectEvent({
      projectId: project.id,
      eventDate: new Date(`2024-0${index + 1}-01`),
      eventNotes: `Event ${index + 1} notes`,
    })
  );

  return { project, events };
};

/**
 * Builder para crear checklist completo
 */
export const createMockChecklist = (itemCount = 5, completedCount = 2) => {
  return Array.from({ length: itemCount }, (_, index) =>
    createMockChecklistItem({
      id: `check-${index}`,
      description: `Checklist item ${index + 1}`,
      isCompleted: index < completedCount,
      priority: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'low' : 'medium',
    })
  );
};

// ==================== Assertion Helpers ====================

/**
 * Verifica que el contexto del formulario esté configurado correctamente
 */
export const expectFormContextToBeValid = (mode: 'lean' | 'full') => {
  // Helper para usar en tests que verifican el context
  // Se implementará con matchers específicos según necesidad
};

/**
 * Helpers para esperar cambios en el formulario
 */
export const waitForFormValue = async (fieldName: string, expectedValue: any) => {
  // Se implementará cuando se necesite en tests de integración
};
