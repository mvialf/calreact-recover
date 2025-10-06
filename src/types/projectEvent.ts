/**
 * @fileoverview Tipos para eventos de proyecto con arquitectura de snapshot minimalista
 *
 * Arquitectura implementada: Snapshot Inmutable Pattern
 *
 * Principios:
 * - Eventos NO duplican datos del proyecto
 * - Snapshot mínimo inmutable captura estado del proyecto al crear evento
 * - Overrides solo para variaciones específicas del evento (ej: teléfono alternativo)
 * - Status pertenece al proyecto, NO al evento (no existe customStatus)
 *
 * @version 3.0.0
 * @since Octubre 2025 - Refactorización arquitectura minimalista
 */

import type { ProjectStatus } from './project';

/**
 * Snapshot inmutable del proyecto capturado al momento de crear el evento
 *
 * Contiene SOLO los campos necesarios para mostrar el evento en el calendario
 * sin requerir joins adicionales.
 */
export interface ProjectSnapshot {
  /** Número único del proyecto */
  projectNumber: string;

  /** Nombre del cliente (para mostrar en calendario) */
  clientName: string;

  /** Nota técnica breve (glosa) */
  glosa?: string;

  /** Comuna del proyecto (extraída de fullAddress.componentes.comuna) */
  comuna?: string;

  /** Estado del proyecto AL MOMENTO de crear el evento */
  status: ProjectStatus;
}

/**
 * Item de checklist para eventos de proyecto
 *
 * Checklist específico para tareas del evento, independiente del proyecto.
 */
export interface ChecklistItem {
  /** ID único del item */
  id: string;

  /** Descripción de la tarea */
  description: string;

  /** Estado de completitud */
  isCompleted: boolean;

  /** Prioridad del item (opcional) */
  priority?: 'low' | 'medium' | 'high';

  /** Categoría del item (ej: "preparación", "ejecución", "finalización") */
  category?: string;

  /** ID del usuario asignado (opcional) */
  assignedTo?: string;

  /** Fecha de creación */
  createdAt?: Date;

  /** Fecha de completitud */
  completedAt?: Date;

  /** ID del usuario que completó la tarea */
  completedBy?: string;

  /** Notas adicionales del item */
  notes?: string;
}

/**
 * Evento de proyecto con arquitectura de snapshot minimalista
 *
 * Representa una instancia agendada del proyecto en el calendario.
 * NO duplica datos del proyecto, usa snapshot inmutable para información básica.
 *
 * @example
 * ```typescript
 * const event: ProjectEventMinimal = {
 *   id: 'event-123',
 *   projectId: 'project-456',
 *   eventDate: new Date('2025-02-15'),
 *   checklist: [
 *     { id: '1', description: 'Preparar herramientas', isCompleted: false }
 *   ],
 *   eventNotes: 'Llegada estimada 9:00 AM',
 *   customPhone: '+56912345678', // Contacto alternativo para ese día
 *   projectSnapshot: {
 *     projectNumber: 'P-2025-001',
 *     clientName: 'Juan Pérez',
 *     glosa: 'Instalación ventanas',
 *     comuna: 'Providencia',
 *     status: 'programar'
 *   }
 * };
 * ```
 */
export interface ProjectEventMinimal {
  /** ID único del evento */
  id: string;

  /** Referencia al proyecto padre */
  projectId: string;

  // === DATOS ESPECÍFICOS DEL EVENTO ===

  /** Fecha y hora del evento */
  eventDate: Date;

  /** Checklist de tareas específicas del evento */
  checklist: ChecklistItem[];

  /** Notas específicas de este evento */
  eventNotes?: string;

  // === OVERRIDES VÁLIDOS ===
  // Solo campos que pueden variar del proyecto para este evento específico

  /**
   * Teléfono alternativo para este evento
   *
   * Ejemplo: Llamar a encargado de obra en lugar del cliente
   */
  customPhone?: string;

  // === SNAPSHOT INMUTABLE DEL PROYECTO ===
  // Captura el estado del proyecto AL MOMENTO de crear el evento
  // NO se actualiza si el proyecto cambia después

  /** Snapshot inmutable del proyecto */
  projectSnapshot: ProjectSnapshot;

  // === METADATA ===

  /** Fecha de creación del evento */
  createdAt?: Date;

  /** Fecha de última actualización */
  updatedAt?: Date;
}

/**
 * Tipo para la creación de nuevos eventos (sin id ni metadata)
 */
export type CreateProjectEventData = Omit<
  ProjectEventMinimal,
  'id' | 'projectSnapshot' | 'createdAt' | 'updatedAt'
>;

/**
 * Tipo para actualización de eventos existentes
 */
export type UpdateProjectEventData = Partial<
  Omit<ProjectEventMinimal, 'id' | 'projectId' | 'projectSnapshot' | 'createdAt' | 'updatedAt'>
>;
