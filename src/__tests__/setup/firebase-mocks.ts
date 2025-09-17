// firebase-mocks.ts - Mocks centralizados para Firebase v11
// Mocks completos para Firebase v11 con breaking changes implementados

import type { Firestore, Timestamp } from 'firebase/firestore';

// Mock para Timestamp de Firebase v11
export const mockTimestamp = {
  now: jest.fn(() => ({
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0,
    toDate: jest.fn(() => new Date()),
    toMillis: jest.fn(() => Date.now()),
  })),
  fromDate: jest.fn((date: Date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: jest.fn(() => date),
    toMillis: jest.fn(() => date.getTime()),
  })),
  fromMillis: jest.fn((millis: number) => ({
    seconds: Math.floor(millis / 1000),
    nanoseconds: 0,
    toDate: jest.fn(() => new Date(millis)),
    toMillis: jest.fn(() => millis),
  })),
};

// Mock para Firestore v11
export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  endBefore: jest.fn(),
};

// Mock completo para firebase/firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => mockFirestore),
  collection: jest.fn((db, path) => ({ path, _type: 'collection' })),
  doc: jest.fn((collection, id) => ({
    id,
    collection,
    _type: 'document',
    path: `${collection.path}/${id}`
  })),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({}),
    id: 'mock-id',
    ref: { path: 'mock-path' }
  })),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [],
    size: 0,
    empty: true,
    forEach: jest.fn()
  })),
  addDoc: jest.fn(() => Promise.resolve({
    id: 'mock-new-id',
    path: 'mock-path/mock-new-id'
  })),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn((collection, ...constraints) => ({
    _type: 'query',
    collection,
    constraints
  })),
  where: jest.fn((field, operator, value) => ({
    _type: 'where',
    field,
    operator,
    value
  })),
  orderBy: jest.fn((field, direction) => ({
    _type: 'orderBy',
    field,
    direction
  })),
  limit: jest.fn(count => ({
    _type: 'limit',
    count
  })),
  Timestamp: mockTimestamp,
  serverTimestamp: jest.fn(() => ({
    _type: 'serverTimestamp'
  })),
  arrayUnion: jest.fn((...elements) => ({
    _type: 'arrayUnion',
    elements
  })),
  arrayRemove: jest.fn((...elements) => ({
    _type: 'arrayRemove',
    elements
  })),
  increment: jest.fn(value => ({
    _type: 'increment',
    value
  }))
}));

// Helper para resetear todos los mocks de Firebase
export const resetFirebaseMocks = () => {
  Object.values(mockFirestore).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockTimestamp).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};

// Helper para configurar respuestas mock
export const setupFirestoreResponse = {
  success: (data: any) => {
    mockFirestore.getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => data,
      id: 'mock-id',
      ref: { path: 'mock-path' }
    });
  },

  notFound: () => {
    mockFirestore.getDoc.mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
      id: 'mock-id',
      ref: { path: 'mock-path' }
    });
  },

  error: (error: Error) => {
    mockFirestore.getDoc.mockRejectedValueOnce(error);
  },

  collection: (docs: any[]) => {
    mockFirestore.getDocs.mockResolvedValueOnce({
      docs: docs.map((data, index) => ({
        exists: () => true,
        data: () => data,
        id: `mock-id-${index}`,
        ref: { path: `mock-path/mock-id-${index}` }
      })),
      size: docs.length,
      empty: docs.length === 0,
      forEach: jest.fn()
    });
  }
};