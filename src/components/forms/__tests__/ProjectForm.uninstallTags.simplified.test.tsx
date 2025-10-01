// ProjectForm.uninstallTags.simplified.test.tsx
// Tests simplificados para validar estructura del sistema uninstallTags

import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectForm } from '../ProjectForm';
import {
  mockUninstallTags,
  createMockUseUninstallTags
} from '@/__tests__/helpers/uninstall-tags-helpers';

// Mock del servicio de clientes
jest.mock('@/services/clientService', () => ({
  getClients: jest.fn(() => Promise.resolve([
    { id: '1', name: 'Cliente Test', createdAt: new Date(), updatedAt: new Date() }
  ]))
}));

// Mock simplificado de AddressInput
jest.mock('@/components/ui/addressInput', () => ({
  AddressInput: () => <div data-testid="address-input" />
}));

// DateInput ya no necesita mock - es un input nativo estándar

// Mock simplificado de TagSelector
jest.mock('@/components/ui/tags', () => ({
  TagSelector: ({ placeholder, label }: any) => (
    <div data-testid="tag-selector">
      <div data-testid="tag-label">{label}</div>
      <input data-testid="tag-input" placeholder={placeholder} />
    </div>
  )
}));

// Mock del hook useUninstallTags
const mockUseUninstallTags = createMockUseUninstallTags();
jest.mock('@/hooks/useUninstallTags', () => ({
  useUninstallTags: jest.fn(() => mockUseUninstallTags),
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactNode) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ProjectForm - UninstallTags Structure Validation', () => {
  let mockOnSubmit: jest.Mock;

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    jest.clearAllMocks();
  });

  describe('Verificación de migración completa', () => {
    it('debe renderizar TagSelector sin checkbox de uninstall', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // ✅ Verificar que TagSelector está presente
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();

      // ✅ CRÍTICO: Verificar que NO existe checkbox de uninstall
      expect(screen.queryByRole('checkbox', { name: /desinstalación/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/requiere desinstalación/i)).not.toBeInTheDocument();
    });

    it('debe mostrar label y placeholder correctos para tags', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      expect(screen.getByTestId('tag-label')).toHaveTextContent('Tags de Desinstalación');

      const tagInput = screen.getByTestId('tag-input');
      expect(tagInput).toHaveAttribute('placeholder', 'Seleccionar tags de desinstalación...');
    });

    it('debe usar el hook useUninstallTags', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Verificar que el hook fue llamado
      expect(require('@/hooks/useUninstallTags').useUninstallTags).toHaveBeenCalled();
    });

    it('NO debe contener elementos del sistema anterior', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Verificar ausencia de elementos obsoletos
      expect(screen.queryByLabelText(/uninstall[^T]/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/uninstallTypes/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/tipos.*desinstalación/i)).not.toBeInTheDocument();
    });

    it('debe tener la estructura correcta del formulario', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Verificar campos principales del formulario
      expect(screen.getByLabelText(/número.*proyecto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/glosa/i)).toBeInTheDocument();
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();

      // Verificar que el formulario está bien estructurado
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Integración con sistema de tags', () => {
    it('debe cargar datos iniciales con uninstallTags si se proporcionan', () => {
      const defaultValues = {
        projectNumber: '2025-001',
        uninstallTags: mockUninstallTags.slice(0, 2)
      };

      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />
      );

      // Verificar que el formulario carga con valores iniciales
      expect(screen.getByDisplayValue('2025-001')).toBeInTheDocument();
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('debe manejar array vacío de uninstallTags', () => {
      const defaultValues = {
        projectNumber: '2025-002',
        uninstallTags: []
      };

      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />
      );

      // Debe renderizar sin errores
      expect(screen.getByDisplayValue('2025-002')).toBeInTheDocument();
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('debe funcionar sin uninstallTags definidas', () => {
      const defaultValues = {
        projectNumber: '2025-003'
        // uninstallTags no definidas
      };

      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />
      );

      // Debe funcionar normalmente
      expect(screen.getByDisplayValue('2025-003')).toBeInTheDocument();
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });
  });
});