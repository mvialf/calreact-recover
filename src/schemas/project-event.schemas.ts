/**
 * Schemas de validación para eventos de proyecto
 *
 * Arquitectura modular con composición de schemas base
 * Soporta dos modelos de datos:
 * - Full: Duplicación completa de datos del proyecto
 * - Lean: Referencias con overrides opcionales
 */

import { z } from 'zod';
import {
  requiredString,
  optionalString,
  phoneSchema,
  fullAddressSchema,
  preprocessedInteger,
  preprocessedNumber,
  requiredDate,
  dynamicEnum,
} from '@/utils/validation-schemas';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';

// ===== ESQUEMAS PARA CHECKLIST =====

/**
 * Schema para item individual de checklist con prioridades
 */
export const checklistItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida'),
  isCompleted: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;

/**
 * Array de checklist con validación
 */
export const checklistArraySchema = z.array(checklistItemSchema).default([]);

// ===== ESQUEMA BASE (Común para ambos modelos) =====

/**
 * Campos compartidos entre todos los tipos de eventos de proyecto
 */
export const projectEventBaseSchema = z.object({
  projectId: requiredString('Proyecto'),
  eventDate: z.date({
    required_error: 'Fecha del evento requerida',
    invalid_type_error: 'Fecha inválida'
  }),
  eventNotes: optionalString,
  checklist: checklistArraySchema,
});

// ===== MODELO LEAN (Referencia + Override) =====

/**
 * Schema para eventos tipo "Lean" - Solo almacena referencias y overrides
 *
 * Filosofía: Hereda del proyecto, solo guarda diferencias
 */
export const projectEventLeanSchema = projectEventBaseSchema.extend({
  // Overrides opcionales - solo se usan si difieren del proyecto
  customDescription: optionalString,
  customPhone: phoneSchema,
  customStatus: dynamicEnum(
    PROJECT_STATUS_OPTIONS.map(opt => opt.value),
    'un estado'
  ).optional(),
});

export type ProjectEventLeanFormValues = z.infer<typeof projectEventLeanSchema>;

// ===== TIPOS DE UTILIDAD =====

/**
 * Type alias para compatibilidad (solo modo Lean disponible)
 */
export type ProjectEventFormValues = ProjectEventLeanFormValues;
