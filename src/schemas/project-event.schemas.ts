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
 * NOTA: customStatus fue eliminado - el status pertenece al proyecto, no al evento
 */
export const projectEventLeanSchema = projectEventBaseSchema.extend({
  // Overrides opcionales - solo se usan si difieren del proyecto
  customDescription: optionalString,
  customPhone: phoneSchema,
});

export type ProjectEventLeanFormValues = z.infer<typeof projectEventLeanSchema>;

// ===== MODELO FULL (Duplicación Completa) =====

/**
 * Schema para eventos tipo "Full" - Duplica todos los datos del proyecto
 *
 * Filosofía: Snapshot inmutable del proyecto en el momento del evento
 */
export const projectEventFullSchema = projectEventBaseSchema.extend({
  // Campos completos del proyecto (duplicados)
  description: optionalString,
  phone: phoneSchema,
  fullAddress: fullAddressSchema,
  status: requiredString('El estado'),
  windowsCount: preprocessedInteger('Número de ventanas'),
  squareMeters: preprocessedNumber('Metros cuadrados'),
  uninstallTags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    createdAt: z.date().optional()
  })).optional().default([]),
});

export type ProjectEventFullFormValues = z.infer<typeof projectEventFullSchema>;

// ===== TIPOS DE UTILIDAD =====

/**
 * Union type para soportar ambos modelos
 */
export type ProjectEventFormValues = ProjectEventLeanFormValues | ProjectEventFullFormValues;

/**
 * Type guard para detectar modelo lean
 */
export function isLeanEventData(data: ProjectEventFormValues): data is ProjectEventLeanFormValues {
  return 'customDescription' in data || 'customPhone' in data;
}

/**
 * Type guard para detectar modelo full
 */
export function isFullEventData(data: ProjectEventFormValues): data is ProjectEventFullFormValues {
  return 'description' in data && 'phone' in data && 'fullAddress' in data;
}
