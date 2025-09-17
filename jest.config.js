// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Configuración personalizada de Jest (limpia y simplificada)
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',

  // Mapeo de módulos - Next.js ya maneja TypeScript
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Cobertura de código actualizada
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/__tests__/**',
    '!src/types/**',
    '!src/app/globals.css',
  ],

  // Configuración básica
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,

  // Ignora archivos sin tests y tests E2E de Playwright
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/e2e/',
    '<rootDir>/playwright-tests/',
  ],
};

module.exports = createJestConfig(customJestConfig);