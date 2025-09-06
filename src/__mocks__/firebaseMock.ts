// Mock para Firebase
// Esto permite probar componentes que dependen de Firebase sin conectarse a servicios reales

export const mockFirebaseUser = {
  uid: 'usuario-test-123',
  email: 'usuario-test@ejemplo.com',
  displayName: 'Usuario Test',
  photoURL: null,
  emailVerified: true,
};

// Mock para documentos Firestore
export const createMockDoc = (id: string, data: any) => ({
  id,
  data: () => data,
  exists: true,
  ref: {
    id,
    path: `collection/${id}`,
  },
});

// Mock para snapshot de consulta
export const createMockQuerySnapshot = (docs: any[]) => ({
  docs: docs.map(doc => createMockDoc(doc.id, doc)),
  empty: docs.length === 0,
  size: docs.length,
  forEach: jest.fn((callback) => {
    docs.forEach((doc, index) => callback(createMockDoc(doc.id, doc)));
  }),
});

// Mock para Firestore con datos dinámicos
export const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({
    docs: [],
    empty: true,
    forEach: jest.fn(),
  }),
  onSnapshot: jest.fn((callback) => {
    callback({
      docs: [],
      empty: true,
      forEach: jest.fn(),
    });
    return jest.fn(); // Función de desuscripción
  }),
  set: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue(true),
  delete: jest.fn().mockResolvedValue(true),
  add: jest.fn().mockResolvedValue({ id: 'doc-test-123' }),
};

// Mock para Authentication
export const mockAuth = {
  currentUser: mockFirebaseUser,
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockFirebaseUser);
    return jest.fn(); // Función de desuscripción
  }),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockFirebaseUser }),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockFirebaseUser }),
  signOut: jest.fn().mockResolvedValue(true),
};

// Mocks específicos para servicios de la aplicación
export const mockServices = {
  // Mock para projectService
  projectService: {
    getProjects: jest.fn().mockResolvedValue([]),
    getProject: jest.fn().mockResolvedValue(null),
    createProject: jest.fn().mockResolvedValue('new-project-id'),
    updateProject: jest.fn().mockResolvedValue(true),
    deleteProject: jest.fn().mockResolvedValue(true),
  },

  // Mock para paymentService  
  paymentService: {
    getAllPayments: jest.fn().mockResolvedValue([]),
    getPaymentsByProject: jest.fn().mockResolvedValue([]),
    addPayment: jest.fn().mockResolvedValue('new-payment-id'),
    updatePayment: jest.fn().mockResolvedValue(true),
    deletePayment: jest.fn().mockResolvedValue(true),
  },

  // Mock para clientService
  clientService: {
    getClients: jest.fn().mockResolvedValue([]),
    getClient: jest.fn().mockResolvedValue(null),
    addClient: jest.fn().mockResolvedValue('new-client-id'),
    updateClient: jest.fn().mockResolvedValue(true),
    deleteClient: jest.fn().mockResolvedValue(true),
  },

  // Mock para visitService
  visitService: {
    getVisits: jest.fn().mockResolvedValue([]),
    getVisit: jest.fn().mockResolvedValue(null),
    createVisit: jest.fn().mockResolvedValue('new-visit-id'),
    updateVisit: jest.fn().mockResolvedValue(true),
    deleteVisit: jest.fn().mockResolvedValue(true),
  },

  // Mock para afterSalesService
  afterSalesService: {
    getAfterSalesForProject: jest.fn().mockResolvedValue([]),
    createAfterSales: jest.fn().mockResolvedValue('new-aftersale-id'),
    updateAfterSales: jest.fn().mockResolvedValue(true),
    deleteAfterSales: jest.fn().mockResolvedValue(true),
  },
};

// Helper para configurar mocks con datos específicos
export const setupFirebaseMocks = (collectionName: string, data: any[]) => {
  const mockQuerySnapshot = createMockQuerySnapshot(data);
  
  mockFirestore.collection.mockImplementation((name: string) => {
    if (name === collectionName) {
      return {
        ...mockFirestore,
        get: jest.fn().mockResolvedValue(mockQuerySnapshot),
        onSnapshot: jest.fn((callback) => {
          callback(mockQuerySnapshot);
          return jest.fn(); // unsubscribe function
        }),
      };
    }
    return mockFirestore;
  });

  return mockQuerySnapshot;
};

// Helper para resetear todos los mocks
export const resetFirebaseMocks = () => {
  Object.values(mockServices).forEach(service => {
    Object.values(service).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockReset();
      }
    });
  });
  
  jest.clearAllMocks();
};
