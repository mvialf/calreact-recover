// Archivo de definición para tipos relacionados con testing
// NOTA: Los tipos de Jest se han movido a src/types/jest.d.ts para evitar duplicaciones

// Re-exportar tipos útiles para testing
export type { MockedFunction, MockedClass, MockedObject, TestComponent, TestProps } from './jest';

// Tipos específicos para utilidades de testing del proyecto
export interface TestDataFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
  createWithRelations(relations: Record<string, any>): T;
}

export interface TestPageHelpers {
  getByTestId: (testId: string) => HTMLElement;
  queryByTestId: (testId: string) => HTMLElement | null;
  getSearchInput: () => HTMLElement;
  getTable: () => HTMLElement;
  getTableRows: () => HTMLElement[];
  getTableHeaders: () => HTMLElement[];
  clickActionButton: (text: string) => Promise<void>;
  typeInSearch: (text: string) => Promise<void>;
}

export interface MockServiceHelpers {
  resetAllMocks: () => void;
  setupSuccessResponse: <T>(service: string, method: string, data: T) => void;
  setupErrorResponse: (service: string, method: string, error: Error) => void;
  setupLoadingResponse: (service: string, method: string) => void;
}
