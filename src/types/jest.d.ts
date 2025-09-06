// Tipos Jest simplificados - Next.js ya maneja la mayoría de configuración TypeScript
// Solo agregamos lo esencial que no está incluido por defecto

import '@testing-library/jest-dom';

// Tipos útiles para testing
export type MockedFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;
export type TestComponent<P = {}> = React.ComponentType<P>;