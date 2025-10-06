// test-data-factory.ts - Factory para generar datos de prueba
// Centraliza la creación de datos mock para tests

import type { ProjectType as Project, ProjectEventType as ProjectEvent, Client } from '@/types';

// Factory para proyectos
export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'mock-project-id',
  projectNumber: 'PRJ-001',
  clientId: 'mock-client-id',
  description: 'Descripción de prueba',
  date: new Date('2024-01-01'),
  subtotal: 50000,
  taxRate: 19,
  total: 59500,
  balance: 59500,
  status: 'ingresado',
  address: 'Calle Test 123, Madrid',
  windowsCount: 5,
  squareMeters: 100,
  glosa: 'Proyecto de prueba',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Factory para eventos de proyecto
export const createMockProjectEvent = (overrides: Partial<ProjectEvent> = {}): ProjectEvent => ({
  id: 'mock-event-id',
  projectId: 'mock-project-id',
  eventDate: new Date('2024-06-15'),
  status: 'ingresado', // Campo obligatorio
  checklist: [
    {
      id: 'check-1',
      description: 'Verificar material',
      isCompleted: false,
      createdAt: new Date('2024-01-01'),
    }
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Factory para clientes
export const createMockClient = (overrides: Partial<Client> = {}): Client => ({
  id: 'mock-client-id',
  name: 'Cliente Test',
  email: 'cliente@test.com',
  phone: '+34 600 000 000',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Factory para direcciones
export const createMockAddress = (overrides: any = {}) => ({
  description: 'Madrid, España',
  place_id: 'ChIJgTwKgJcpQg0RaSKMYcHeNsQ',
  structured_formatting: {
    main_text: 'Madrid',
    secondary_text: 'España',
  },
  types: ['locality', 'political'],
  ...overrides,
});

// Factory para respuestas de Google Places
export const createMockPlacesResponse = (overrides: any = {}) => ({
  predictions: [
    createMockAddress(),
    createMockAddress({
      description: 'Barcelona, España',
      place_id: 'ChIJ5TCOcRaYpBIRCmZHTz37sEQ',
      structured_formatting: {
        main_text: 'Barcelona',
        secondary_text: 'España',
      },
    }),
  ],
  status: 'OK',
  ...overrides,
});

// Factory para formularios
export const createMockFormData = (overrides: any = {}) => ({
  projectName: 'Proyecto Test',
  clientName: 'Cliente Test',
  address: 'Calle Test 123',
  budget: '50000',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  description: 'Descripción de prueba',
  ...overrides,
});

// Helper para crear arrays de datos mock
export const createMockArray = <T>(
  factory: (overrides?: any) => T,
  count: number,
  customizer?: (index: number) => Partial<T>
): T[] => {
  return Array.from({ length: count }, (_, index) => {
    const customData = customizer ? customizer(index) : {};
    return factory({
      id: `mock-id-${index}`,
      name: `Mock Item ${index + 1}`,
      ...customData,
    });
  });
};

// Factories específicos para casos de uso comunes
export const mockFactories = {
  project: createMockProject,
  projectEvent: createMockProjectEvent,
  client: createMockClient,
  address: createMockAddress,
  placesResponse: createMockPlacesResponse,
  formData: createMockFormData,

  // Helpers para casos específicos
  projectWithEvents: (eventCount = 3) => {
    const project = createMockProject();
    const events = createMockArray(createMockProjectEvent, eventCount, (index) => ({
      projectId: project.id,
      title: `Evento ${index + 1}`,
    }));

    return { project, events };
  },

  clientWithProjects: (projectCount = 2) => {
    const client = createMockClient();
    const projects = createMockArray(createMockProject, projectCount, (index) => ({
      clientId: client.id,
      name: `Proyecto ${index + 1}`,
    }));

    return { client, projects };
  },
};