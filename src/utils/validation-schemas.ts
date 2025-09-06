/**
 * Esquemas de validación centralizados para el proyecto Cobralon-FB
 * 
 * Este archivo centraliza todos los esquemas Zod reutilizables para evitar
 * duplicación de código y mantener consistencia en las validaciones.
 */

import { z } from 'zod';

// ===== ESQUEMAS BÁSICOS REUTILIZABLES =====

/**
 * Validación básica para campos de texto requeridos
 */
export const requiredString = (fieldName: string, minLength: number = 1) =>
  z.string().min(minLength, `${fieldName} es requerido`);

/**
 * Validación para campos de texto opcionales
 */
export const optionalString = z.string().optional();

/**
 * Validación para números enteros positivos
 */
export const positiveInteger = (fieldName: string) =>
  z.number().int().min(0, `${fieldName} debe ser un número positivo`);

/**
 * Validación para números decimales positivos
 */
export const positiveNumber = (fieldName: string) =>
  z.number().min(0, `${fieldName} debe ser un número positivo`);

/**
 * Validación para fechas requeridas
 */
export const requiredDate = (fieldName: string) =>
  z.date({
    required_error: `${fieldName} es requerida`,
  });

/**
 * Validación para IDs de selección (dropdowns, etc.)
 */
export const requiredSelection = (fieldName: string) =>
  z.string().min(1, `Debe seleccionar ${fieldName}`);

// ===== ESQUEMAS DE DOMINIO ESPECÍFICOS =====

/**
 * Esquema para validación de teléfonos chilenos
 */
export const phoneSchema = z.string().optional().refine(value => {
  if (!value || value.trim() === '') return true; // Permitir vacío
  
  const cleanValue = value.replace(/[^+\d]/g, '');
  
  // Formatos válidos: +56912345678 o 912345678 (o formato E.164 genérico)
  const e164Format = /^\+[1-9]\d{1,14}$/.test(cleanValue);
  const localChileanFormat = /^[89]\d{8}$/.test(cleanValue); // 9 dígitos empezando con 8 o 9
  
  return e164Format || localChileanFormat;
}, 'Número de teléfono inválido. Use formato +56912345678 o 912345678.');

/**
 * Esquema para coordenadas geográficas
 */
export const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

/**
 * Esquema para componentes de dirección
 */
export const addressComponentsSchema = z.object({
  calle: optionalString,
  numero: optionalString,
  comuna: optionalString,
  ciudad: optionalString,
  region: optionalString,
  pais: optionalString,
  codigoPostal: optionalString,
}).optional();

/**
 * Esquema completo para direcciones con Google Places
 */
export const fullAddressSchema = z.object({
  textoCompleto: z.string().min(1, 'La dirección es requerida'),
  placeId: z.string().min(1, 'Place ID es requerido'),
  coordenadas: coordinatesSchema,
  componentes: addressComponentsSchema,
  detalle: optionalString,
  informacionAdicional: optionalString,
  comune: optionalString,
}).optional();

/**
 * Esquema simplificado para direcciones de solo texto
 */
export const simpleAddressSchema = z.union([
  z.object({
    textoCompleto: z.string(),
    placeId: z.string().min(1, 'Place ID es requerido'),
    coordenadas: coordinatesSchema,
    componentes: addressComponentsSchema,
  }),
  z.null()
]).optional();

/**
 * Esquema para descripciones con longitud mínima
 */
export const descriptionSchema = (minLength: number = 10) =>
  z.string().min(minLength, `La descripción debe tener al menos ${minLength} caracteres`);

/**
 * Esquema para tareas de checklist
 */
export const taskSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "La tarea no puede estar vacía"),
  isCompleted: z.boolean().default(false),
  completedAt: z.date().optional(),
  createdAt: z.date().optional(),
});

/**
 * Esquema para listas de tareas
 */
export const tasksArraySchema = z.array(taskSchema).default([]);

// ===== ESQUEMAS DE CAMPOS NUMÉRICOS CON PREPROCESSOR =====

/**
 * Procesador para campos numéricos que pueden venir como string vacío
 */
const numericPreprocessor = (defaultValue: number = 0) => (val: any) => {
  if (val === '' || val === undefined || val === null) return defaultValue;
  return typeof val === 'string' ? parseFloat(val) || defaultValue : val;
};

/**
 * Procesador para enteros que pueden venir como string vacío
 */
const integerPreprocessor = (defaultValue: number = 0) => (val: any) => {
  if (val === '' || val === undefined || val === null) return defaultValue;
  return typeof val === 'string' ? parseInt(val, 10) || defaultValue : val;
};

/**
 * Campo numérico con preprocessor (para inputs que envían strings)
 */
export const preprocessedNumber = (fieldName: string, defaultValue: number = 0) =>
  z.preprocess(
    numericPreprocessor(defaultValue),
    z.number().min(0, `${fieldName} debe ser positivo`).default(defaultValue)
  );

/**
 * Campo entero con preprocessor (para inputs que envían strings)
 */
export const preprocessedInteger = (fieldName: string, defaultValue: number = 0) =>
  z.preprocess(
    integerPreprocessor(defaultValue),
    z.number().int().min(0, `${fieldName} debe ser un entero positivo`).default(defaultValue)
  );

// ===== ESQUEMAS DE FORMULARIOS ESPECÍFICOS =====

/**
 * Campos comunes para proyectos y eventos de proyecto
 */
export const commonProjectFields = {
  description: optionalString,
  phone: phoneSchema,
  fullAddress: fullAddressSchema,
  windowsCount: preprocessedInteger("Número de ventanas"),
  squareMeters: preprocessedNumber("Metros cuadrados"),
  uninstall: z.boolean().default(false),
  uninstallTypes: z.array(z.string()).optional().default([]),
};

/**
 * Campos comunes para formularios con fecha
 */
export const commonDateFields = {
  date: requiredDate("La fecha"),
  eventDate: z.date().optional(),
  scheduledDate: requiredDate("La fecha programada"),
};

/**
 * Campos comunes para formularios con proyecto
 */
export const commonProjectIdFields = {
  projectId: requiredSelection("un proyecto"),
};

// ===== UTILIDADES DE VALIDACIÓN =====

/**
 * Validador personalizado para arrays no vacíos
 */
export const nonEmptyArray = <T>(schema: z.ZodSchema<T>, fieldName: string) =>
  z.array(schema).min(1, `Debe agregar al menos un ${fieldName}`);

/**
 * Validador condicional - campo requerido si otra condición se cumple
 */
export const conditionalRequired = (
  baseSchema: z.ZodSchema<any>,
  condition: (data: any) => boolean,
  errorMessage: string
) => baseSchema.refine(condition, { message: errorMessage });

/**
 * Esquema para validar enum con opciones dinámicas
 */
export const dynamicEnum = (options: readonly string[], fieldName: string) =>
  z.enum(options as [string, ...string[]], {
    required_error: `Debe seleccionar ${fieldName}`,
  });