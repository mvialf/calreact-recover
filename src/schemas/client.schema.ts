import { z } from 'zod';

/**
 * Schema de validación para formulario de clientes
 * Usado en ClientModal para crear/editar clientes
 */
export const clientSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  email: z.string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .regex(/^\+?\d{8,15}$/, 'Teléfono debe tener entre 8 y 15 dígitos')
    .optional()
    .or(z.literal(''))
});

export type ClientFormValues = z.infer<typeof clientSchema>;
