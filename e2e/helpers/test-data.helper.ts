/**
 * Helper para datos de prueba - E2E Testing
 * Proporciona datos mock consistentes para tests
 */

import type { ProjectFormData, ClientFormData } from '../types/forms';

/**
 * Datos de proyectos para testing
 */
export const TEST_PROJECTS = {
  basic: {
    clientName: 'Cliente Test E2E',
    clientPhone: '123456789',
    clientEmail: 'cliente@test.com',
    address: 'Calle Test 123, Madrid',
    coordinates: { lat: 40.4168, lng: -3.7038 },
    area: 100,
    floors: 2,
    rooms: 4,
    bathrooms: 2,
    budget: 50000,
    startDate: '2024-02-01',
    expectedEndDate: '2024-08-01',
    description: 'Proyecto de prueba E2E para testing automatizado',
    projectType: 'obra_nueva' as const,
    status: 'planificacion' as const
  },
  
  complex: {
    clientName: 'Cliente Complejo E2E',
    clientPhone: '987654321', 
    clientEmail: 'complejo@test.com',
    address: 'Avenida Compleja 456, Barcelona',
    coordinates: { lat: 41.3851, lng: 2.1734 },
    area: 250,
    floors: 3,
    rooms: 8,
    bathrooms: 4,
    budget: 150000,
    startDate: '2024-03-01',
    expectedEndDate: '2024-12-01',
    description: 'Proyecto complejo con múltiples características para testing avanzado',
    projectType: 'reforma_integral' as const,
    status: 'planificacion' as const
  }
} as const;

/**
 * Datos de usuarios para testing  
 */
export const TEST_USERS = {
  admin: {
    email: 'admin@cobralon.com',
    password: 'admin123',
    name: 'Admin Test'
  },
  user: {
    email: 'user@cobralon.com', 
    password: 'user123',
    name: 'Usuario Test'
  }
} as const;

/**
 * Datos de clientes para testing
 */
export const TEST_CLIENTS = {
  individual: {
    name: 'Juan Pérez Test',
    phone: '600123456',
    email: 'juan@test.com',
    address: 'Calle Individual 789, Valencia',
    type: 'individual' as const,
    notes: 'Cliente individual para tests E2E'
  },
  
  company: {
    name: 'Empresa Test S.L.',
    phone: '900987654',
    email: 'empresa@test.com', 
    address: 'Polígono Industrial 321, Sevilla',
    type: 'company' as const,
    cif: 'B12345678',
    notes: 'Empresa de prueba para tests E2E'
  }
} as const;

/**
 * Datos de pagos para testing
 */
export const TEST_PAYMENTS = {
  initial: {
    amount: 10000,
    concept: 'Pago inicial - Test E2E',
    paymentMethod: 'transferencia' as const,
    date: '2024-01-15'
  },
  
  progress: {
    amount: 15000,
    concept: 'Pago por avance - Test E2E', 
    paymentMethod: 'efectivo' as const,
    date: '2024-03-15'
  },
  
  final: {
    amount: 25000,
    concept: 'Pago final - Test E2E',
    paymentMethod: 'cheque' as const,
    date: '2024-06-15'
  }
} as const;

/**
 * Datos de visitas para testing
 */
export const TEST_VISITS = {
  initial: {
    date: '2024-01-20',
    time: '10:00',
    type: 'evaluacion_inicial' as const,
    notes: 'Primera visita de evaluación - Test E2E'
  },
  
  progress: {
    date: '2024-03-20',
    time: '14:30', 
    type: 'seguimiento' as const,
    notes: 'Visita de seguimiento del progreso - Test E2E'
  },
  
  final: {
    date: '2024-06-20',
    time: '11:00',
    type: 'entrega_final' as const,
    notes: 'Visita final de entrega - Test E2E'
  }
} as const;

/**
 * Genera un timestamp único para tests
 */
export const generateTestTimestamp = (): string => {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
};

/**
 * Genera datos únicos de proyecto para evitar colisiones
 */
export const generateUniqueProject = (base = TEST_PROJECTS.basic) => {
  const timestamp = generateTestTimestamp();
  
  return {
    ...base,
    clientName: `${base.clientName} ${timestamp}`,
    clientEmail: `test-${timestamp}@test.com`,
    description: `${base.description} - ${timestamp}`
  };
};

/**
 * Genera datos únicos de cliente para evitar colisiones  
 */
export const generateUniqueClient = (base = TEST_CLIENTS.individual) => {
  const timestamp = generateTestTimestamp();
  
  return {
    ...base,
    name: `${base.name} ${timestamp}`,
    email: `client-${timestamp}@test.com`
  };
};

/**
 * Selectors comunes para elementos de UI
 */
export const SELECTORS = {
  // Formularios
  forms: {
    project: '[data-testid="project-form"]',
    client: '[data-testid="client-form"]',
    payment: '[data-testid="payment-form"]'
  },
  
  // Botones comunes
  buttons: {
    save: 'button[type="submit"]',
    cancel: '[data-testid="cancel-button"]', 
    delete: '[data-testid="delete-button"]',
    edit: '[data-testid="edit-button"]'
  },
  
  // Navegación
  navigation: {
    dashboard: '[href="/dashboard"]',
    projects: '[href="/projects"]', 
    clients: '[href="/clients"]',
    payments: '[href="/payments"]'
  },
  
  // Estados
  loading: '[data-testid="loading-spinner"]',
  success: '.toast-success, [data-testid="success-message"]',
  error: '.toast-error, [data-testid="error-message"]'
} as const;

/**
 * Configuraciones de espera para diferentes operaciones
 */
export const WAIT_TIMES = {
  navigation: 2000,
  api: 5000,
  animation: 1000,
  form_validation: 500,
  page_load: 3000
} as const;