// jest.setup.ts - Configuración centralizada de Jest
// Configuración de Jest simplificada y compatible

// ✅ CORRECTO: Aquí es donde se carga la librería,
// porque se ejecuta cuando `expect` ya está definido.
import '@testing-library/jest-dom';

// Polyfill para fetch en entorno de testing
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock para fetch
global.fetch = jest.fn();

// Configuración de variables de entorno para testing
Object.assign(process.env, { NODE_ENV: 'test' });

// --- Mocks Globales ---

// Mock para `window.matchMedia` (requerido por muchos componentes de UI)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock para `IntersectionObserver` (usado por componentes con scroll)
(global as any).IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '0px';
  thresholds = [0];

  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock para `ResizeObserver` (usado por componentes responsive)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock para APIs del navegador no disponibles en jsdom
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock para scrollIntoView (requerido por Radix UI Select)
Element.prototype.scrollIntoView = jest.fn();

// Mock para PointerEvent (requerido por Radix UI Popover/Dialog)
// Radix UI usa PointerEvent para interacciones, pero jsdom no lo soporta
// Shimear con MouseEvent para compatibilidad completa
global.PointerEvent = MouseEvent as any;

// Mock para localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.assign(global, { localStorage: localStorageMock });

// Mock para sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.assign(global, { sessionStorage: sessionStorageMock });

// Mock para console methods en tests (evitar spam en output)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }

    // Suprimir warnings de act() que provienen de Radix UI Presence/Portal/Popover
    // y componentes que usan Radix UI internamente (Autocomplete)
    // Estos son problemas conocidos de la biblioteca externa, no de nuestro código
    // Issue: https://github.com/radix-ui/primitives/issues/2619
    if (
      typeof args[0] === 'string' &&
      args[0].includes('An update to') &&
      args[0].includes('inside a test was not wrapped in act')
    ) {
      return;
    }

    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Configuración global para timeouts de tests
// Aumentado a 20s para tests con componentes Radix UI (Popover, Dialog)
// que tienen animaciones y efectos asíncronos
jest.setTimeout(20000);

// Helper global para debugging en tests
(global as any).debug = (element: any) => {
  // eslint-disable-next-line no-console
  console.log(element.innerHTML);
};