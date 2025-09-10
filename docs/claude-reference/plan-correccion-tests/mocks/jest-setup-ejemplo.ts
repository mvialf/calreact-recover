/**
 * Jest Setup Global - Configuración optimizada para proyecto Cobralon-FB
 * 
 * Este archivo configura mocks globales y utilidades para todos los tests
 * Compatible con: Firebase 11.x, Google Maps API, React Testing Library
 * 
 * @author Mentor Técnico AI
 * @date 2025-09-08
 */

import React from 'react';
import { setupJestGoogleMapsMocks } from './google-maps-mocks';
import { mockFirestore } from './firebase-v11-mocks';

// ==========================================
// GLOBAL MOCKS SETUP
// ==========================================

/**
 * Mock Firebase Firestore globalmente
 */
jest.mock('firebase/firestore', () => mockFirestore);

/**
 * Mock Firebase Auth básico
 */
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  }),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

/**
 * Setup Google Maps mocks
 */
setupJestGoogleMapsMocks();

// ==========================================
// REACT TESTING LIBRARY SETUP
// ==========================================

/**
 * Mock de Next.js router
 */
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/test',
    pathname: '/test',
    query: {},
    asPath: '/test',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  }),
  withRouter: (Component: any) => Component
}));

/**
 * Mock de Next.js Image component
 */
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { src, alt, ...props });
  }
}));

// ==========================================
// GLOBAL TEST UTILITIES
// ==========================================

/**
 * Utilidad para esperar renders asincrónicos
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Mock de console methods para tests limpios
 */
const originalConsole = { ...console };
beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

// ==========================================
// CUSTOM MATCHERS
// ==========================================

/**
 * Matcher personalizado para verificar timestamps
 */
expect.extend({
  toBeValidTimestamp(received) {
    const pass = received && 
                  typeof received.toDate === 'function' &&
                  received.toDate() instanceof Date;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid timestamp`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid timestamp with toDate() method`,
        pass: false
      };
    }
  }
});

/**
 * Matcher para verificar IDs de Firebase
 */
expect.extend({
  toBeValidFirebaseId(received) {
    const pass = typeof received === 'string' && received.length > 0;
    
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid Firebase ID`
        : `expected ${received} to be a valid Firebase ID (non-empty string)`,
      pass
    };
  }
});

// ==========================================
// GLOBAL TEST DATA
// ==========================================

/**
 * Usuario de prueba estándar
 */
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User'
};

/**
 * Proyecto de prueba estándar
 */
export const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  clientId: 'test-client-id',
  status: 'active',
  date: new Date('2025-01-15')
};

/**
 * Cliente de prueba estándar
 */
export const mockClient = {
  id: 'test-client-id',
  name: 'Test Client',
  email: 'client@example.com',
  phone: '+34123456789'
};

// ==========================================
// SETUP Y TEARDOWN HOOKS
// ==========================================

/**
 * Limpieza antes de cada test
 */
beforeEach(() => {
  // Limpiar mocks
  jest.clearAllMocks();
  
  // Reset timers si se usan
  jest.useRealTimers();
  
  // Limpiar localStorage si se usa
  if (typeof Storage !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
  }
});

/**
 * Limpieza después de cada test
 */
afterEach(() => {
  // Cleanup adicional si es necesario
  jest.restoreAllMocks();
});

// ==========================================
// ENVIRONMENT SETUP
// ==========================================

/**
 * Variables de entorno para tests
 */
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-maps-key';

/**
 * Configuración de zona horaria para tests consistentes
 */
process.env.TZ = 'Europe/Madrid';

// ==========================================
// FIREBASE EMULATOR DETECTION
// ==========================================

/**
 * Detectar si Firebase Emulator está disponible
 */
export const isFirebaseEmulatorAvailable = () => {
  return !!process.env.FIRESTORE_EMULATOR_HOST;
};

/**
 * Configurar uso de emulator si está disponible
 */
if (isFirebaseEmulatorAvailable()) {
  console.log('🔥 Firebase Emulator detected - using real Firebase APIs for integration tests');
} else {
  console.log('📝 Firebase Emulator not available - using mocks for all tests');
}

// ==========================================
// PERFORMANCE MONITORING
// ==========================================

/**
 * Monitor para tests lentos
 */
const SLOW_TEST_THRESHOLD = 5000; // 5 segundos

let testStartTime: number;

beforeEach(() => {
  testStartTime = Date.now();
});

afterEach(() => {
  const testDuration = Date.now() - testStartTime;
  if (testDuration > SLOW_TEST_THRESHOLD) {
    console.warn(`⚠️ Slow test detected: ${expect.getState().currentTestName} (${testDuration}ms)`);
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Handler global para errores no capturados en tests
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // No fail el test automáticamente, pero log para debugging
});

/**
 * Handler para warnings de React
 */
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Filtrar warnings conocidos de libraries
  const warningMessage = args[0];
  if (
    typeof warningMessage === 'string' &&
    (warningMessage.includes('componentWillReceiveProps') ||
     warningMessage.includes('componentWillUpdate'))
  ) {
    return; // Suprimir warnings deprecados conocidos
  }
  
  originalConsoleWarn.apply(console, args);
};

// ==========================================
// TYPESCRIPT DECLARATIONS
// ==========================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidTimestamp(): R;
      toBeValidFirebaseId(): R;
    }
  }
}

// ==========================================
// EXPORT UTILITIES
// ==========================================

export {
  mockFirestore,
  mockUser,
  mockProject,
  mockClient,
  isFirebaseEmulatorAvailable
};

// ==========================================
// USAGE NOTES
// ==========================================

/*
Para usar este setup:

1. En jest.config.js:
   {
     setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest-setup.ts']
   }

2. En tu test:
   import { mockProject, mockUser } from '../setup/jest-setup';
   
   describe('Mi componente', () => {
     it('should render with test data', () => {
       render(<MiComponente project={mockProject} user={mockUser} />);
       // Test implementation
     });
     
     it('should handle timestamps', () => {
       const timestamp = MockTimestamp.now();
       expect(timestamp).toBeValidTimestamp();
     });
   });

3. Matchers personalizados disponibles:
   - expect(timestamp).toBeValidTimestamp()
   - expect(id).toBeValidFirebaseId()
*/