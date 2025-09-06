// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// Configuración personalizada de Jest (limpia y simplificada)
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
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
    '!src/types/**',
    '!src/app/globals.css',
  ],

  // Configuración básica
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  testTimeout: 10000,
  clearMocks: true,
  restoreMocks: true,

  // Ignora archivos sin tests
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
  ],
};

module.exports = createJestConfig(customJestConfig);