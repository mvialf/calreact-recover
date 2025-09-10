/**
 * Firebase v11 Mocks - Compatible with instanceof checks
 * 
 * Soluciona errores "Right-hand side of 'instanceof' is not callable"
 * Compatible con: Firebase 11.9.1, TypeScript, Jest
 * 
 * @author Mentor Técnico AI
 * @date 2025-09-08
 */

// ==========================================
// TIMESTAMP MOCK - Solución Principal
// ==========================================

/**
 * Mock funcional de Firebase Timestamp que soporta instanceof
 */
class MockTimestamp {
  public seconds: number;
  public nanoseconds: number;

  constructor(seconds: number, nanoseconds: number = 0) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  /**
   * Convierte timestamp a Date JavaScript
   */
  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }

  /**
   * Crea timestamp del momento actual
   */
  static now(): MockTimestamp {
    return new MockTimestamp(Date.now() / 1000, 0);
  }

  /**
   * Convierte Date JavaScript a timestamp
   */
  static fromDate(date: Date): MockTimestamp {
    return new MockTimestamp(date.getTime() / 1000, 0);
  }

  /**
   * Compara dos timestamps
   */
  isEqual(other: MockTimestamp): boolean {
    return this.seconds === other.seconds && this.nanoseconds === other.nanoseconds;
  }

  /**
   * Para debugging
   */
  toString(): string {
    return `MockTimestamp(${this.seconds}.${this.nanoseconds})`;
  }
}

// ==========================================
// FIRESTORE DOCUMENT MOCKS
// ==========================================

/**
 * Mock de DocumentReference
 */
const createMockDocumentReference = (id: string = 'mock-doc-id') => ({
  id,
  path: `mock-collection/${id}`,
  get: jest.fn().mockResolvedValue({
    id,
    exists: () => true,
    data: () => ({
      id,
      createdAt: MockTimestamp.now(),
      updatedAt: MockTimestamp.now(),
      mockField: 'mock-value'
    })
  }),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  onSnapshot: jest.fn()
});

/**
 * Mock de QuerySnapshot
 */
const createMockQuerySnapshot = (docs: any[] = []) => ({
  empty: docs.length === 0,
  size: docs.length,
  docs: docs.map((doc, index) => ({
    id: doc.id || `mock-doc-${index}`,
    data: () => ({
      ...doc,
      createdAt: doc.createdAt || MockTimestamp.now(),
      updatedAt: doc.updatedAt || MockTimestamp.now()
    }),
    exists: () => true
  })),
  forEach: (callback: Function) => {
    docs.forEach((doc, index) => callback({
      id: doc.id || `mock-doc-${index}`,
      data: () => doc
    }));
  }
});

/**
 * Mock de CollectionReference  
 */
const createMockCollectionReference = (collectionId: string = 'mock-collection') => ({
  id: collectionId,
  path: collectionId,
  doc: jest.fn((id?: string) => createMockDocumentReference(id || 'auto-generated-id')),
  add: jest.fn().mockResolvedValue(createMockDocumentReference()),
  get: jest.fn().mockResolvedValue(createMockQuerySnapshot()),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  onSnapshot: jest.fn()
});

// ==========================================
// FIRESTORE MAIN MOCK
// ==========================================

/**
 * Mock principal de Firestore
 */
const mockFirestore = {
  // Timestamp class (la clave para solucionar instanceof)
  Timestamp: MockTimestamp,
  
  // Firestore instance methods
  collection: jest.fn((collectionId: string) => createMockCollectionReference(collectionId)),
  doc: jest.fn((path: string) => createMockDocumentReference(path.split('/').pop())),
  
  // Firestore initialization
  getFirestore: jest.fn().mockReturnValue({
    collection: jest.fn((collectionId: string) => createMockCollectionReference(collectionId)),
    doc: jest.fn((path: string) => createMockDocumentReference(path.split('/').pop()))
  }),
  
  // Firestore utilities
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn().mockResolvedValue(createMockQuerySnapshot()),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      createdAt: MockTimestamp.now(),
      updatedAt: MockTimestamp.now()
    })
  }),
  
  // Transaction and batch
  runTransaction: jest.fn().mockResolvedValue(undefined),
  writeBatch: jest.fn().mockReturnValue({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined)
  }),
  
  // Field utilities
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  serverTimestamp: jest.fn(() => MockTimestamp.now()),
  increment: jest.fn(),
  
  // Error types
  FirestoreError: class MockFirestoreError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'FirestoreError';
    }
  }
};

// ==========================================
// FIREBASE AUTH MOCKS
// ==========================================

/**
 * Mock básico de Firebase Auth (opcional)
 */
const mockAuth = {
  getAuth: jest.fn().mockReturnValue({
    currentUser: {
      uid: 'mock-user-id',
      email: 'mock@test.com',
      displayName: 'Mock User'
    },
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: { uid: 'mock-user-id' }
    }),
    signOut: jest.fn().mockResolvedValue(undefined),
    onAuthStateChanged: jest.fn()
  }),
  
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Crea documento mock con timestamps correctos
 */
export const createMockDocument = (data: any = {}) => ({
  id: data.id || `mock-doc-${Date.now()}`,
  ...data,
  createdAt: data.createdAt || MockTimestamp.now(),
  updatedAt: data.updatedAt || MockTimestamp.now()
});

/**
 * Crea AfterSales mock específico
 */
export const createMockAfterSalesDoc = (overrides: any = {}) => createMockDocument({
  projectId: 'mock-project-id',
  description: 'Mock after sales service',
  status: 'pending',
  entryDate: MockTimestamp.fromDate(new Date('2025-01-15')),
  resolutionDate: null,
  ...overrides
});

/**
 * Crea Visit mock específico
 */
export const createMockVisitDoc = (overrides: any = {}) => createMockDocument({
  projectId: 'mock-project-id',
  date: MockTimestamp.fromDate(new Date('2025-01-20')),
  status: 'completed',
  notes: 'Mock visit notes',
  ...overrides
});

/**
 * Crea Project mock específico
 */
export const createMockProjectDoc = (overrides: any = {}) => createMockDocument({
  name: 'Mock Project',
  clientId: 'mock-client-id',
  status: 'active',
  date: MockTimestamp.fromDate(new Date('2025-01-01')),
  ...overrides
});

// ==========================================
// EXPORTS
// ==========================================

/**
 * Mock completo de Firebase para jest.mock()
 */
export const mockFirebaseFirestore = {
  'firebase/firestore': mockFirestore
};

/**
 * Mock completo de Firebase Auth para jest.mock()
 */
export const mockFirebaseAuth = {
  'firebase/auth': mockAuth
};

/**
 * Exports principales
 */
export {
  mockFirestore,
  mockAuth,
  MockTimestamp,
  createMockDocumentReference,
  createMockCollectionReference,
  createMockQuerySnapshot
};

/**
 * Export por defecto para uso directo
 */
export default mockFirestore;

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*
// En tu archivo de test:

import { mockFirestore, MockTimestamp, createMockAfterSalesDoc } from '../mocks/firebase-v11-mocks';

// Aplicar mock
jest.mock('firebase/firestore', () => mockFirestore);

// Usar en tests
describe('afterSalesService', () => {
  it('should handle timestamps correctly', () => {
    const doc = createMockAfterSalesDoc();
    
    // ✅ Esto ahora funciona
    expect(doc.entryDate instanceof MockTimestamp).toBe(true);
    expect(doc.entryDate.toDate()).toBeInstanceOf(Date);
  });
  
  it('should create after sales record', async () => {
    const mockCollection = mockFirestore.collection('afterSales');
    const result = await mockCollection.add({
      description: 'Test service'
    });
    
    expect(mockCollection.add).toHaveBeenCalledWith({
      description: 'Test service'
    });
  });
});
*/