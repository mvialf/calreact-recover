/**
 * Tipos específicos para formularios en tests E2E
 */

// Tipo para datos de formulario de proyecto
export interface ProjectFormData {
  name: string;
  description: string;
  clientId: string;
  location: string;
  budget: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// Tipo para datos de formulario de cliente
export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  notes?: string;
}

// Helper para validar errores de Firebase
export function isFirebaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as any).code === 'string' &&
    typeof (error as any).message === 'string'
  );
}