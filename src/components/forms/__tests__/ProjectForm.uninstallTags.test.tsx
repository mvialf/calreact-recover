// ProjectForm.uninstallTags.test.tsx
// Tests de integración para validar el sistema uninstallTags post-migración

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectForm, type ProjectFormData } from '../ProjectForm';
import {
  mockUninstallTags,
  createMockUseUninstallTags,
  resetUninstallTagsMocks,
  createTestUninstallTags
} from '@/__tests__/helpers/uninstall-tags-helpers';

// Mock del servicio de clientes
jest.mock('@/services/clientService', () => ({
  getClients: jest.fn(() => Promise.resolve([
    { id: '1', name: 'Cliente Test', createdAt: new Date(), updatedAt: new Date() }
  ]))
}));

// Mock de componentes UI complejos para aislar la lógica de tags
jest.mock('@/components/ui/addressInput', () => ({
  AddressInput: ({ value, onSelect, placeholder }: any) => (
    <input
      data-testid="address-input"
      placeholder={placeholder}
      onChange={(e) => onSelect?.({ textoCompleto: e.target.value })}
    />
  )
}));

// DateInput ya no necesita mock - es un input nativo estándar

// Mock para TagSelector - el componente clave para testing
jest.mock('@/components/custom/uninstall-tags', () => ({
  TagSelector: ({ selectedTags, availableTags, onTagsChange, placeholder }: any) => (
    <div data-testid="tag-selector">
      <input
        data-testid="tag-input"
        placeholder={placeholder}
        defaultValue=""
      />
      <div data-testid="selected-tags">
        {selectedTags?.map((tag: any) => (
          <span key={tag.id} data-testid={`selected-tag-${tag.id}`}>
            {tag.name}
            <button
              data-testid={`remove-tag-${tag.id}`}
              onClick={() => {
                const newTags = selectedTags.filter((t: any) => t.id !== tag.id);
                onTagsChange?.(newTags);
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div data-testid="available-tags">
        {availableTags?.map((tag: any) => (
          <button
            key={tag.id}
            data-testid={`add-tag-${tag.id}`}
            onClick={() => {
              const isSelected = selectedTags?.some((t: any) => t.id === tag.id);
              if (!isSelected) {
                onTagsChange?.([...(selectedTags || []), tag]);
              }
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>
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

describe('ProjectForm - UninstallTags Integration', () => {
  let mockOnSubmit: jest.Mock;
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    resetUninstallTagsMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado y estructura', () => {
    it('debe renderizar el TagSelector sin el checkbox de uninstall (migración completada)', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // ✅ Verificar que el TagSelector está visible
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();

      // ✅ CRÍTICO: Verificar que NO existe el checkbox de uninstall (eliminado en migración)
      expect(screen.queryByRole('checkbox', { name: /desinstalación/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/requiere desinstalación/i)).not.toBeInTheDocument();

      // ✅ Verificar que las tags están siempre visibles (sin condicional)
      expect(screen.getByTestId('tag-input')).toBeInTheDocument();
      expect(screen.getByTestId('available-tags')).toBeInTheDocument();
    });

    it('debe mostrar placeholder correcto para uninstall tags', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      const tagInput = screen.getByTestId('tag-input');
      expect(tagInput).toHaveAttribute('placeholder', 'Seleccionar tags de desinstalación...');
    });

    it('debe cargar tags disponibles del hook useUninstallTags', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Verificar que se muestran las tags disponibles del mock
      mockUninstallTags.forEach(tag => {
        expect(screen.getByTestId(`add-tag-${tag.id}`)).toBeInTheDocument();
        expect(screen.getByText(tag.name)).toBeInTheDocument();
      });
    });
  });

  describe('Gestión de tags', () => {
    it('debe permitir agregar tags de desinstalación', async () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Agregar una tag
      const addTagButton = screen.getByTestId('add-tag-tag-1');
      await user.click(addTagButton);

      // Verificar que la tag aparece en seleccionadas
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();
      expect(screen.getByText('Cortina')).toBeInTheDocument();
    });

    it('debe permitir eliminar tags seleccionadas', async () => {
      // Empezar con una tag pre-seleccionada
      const defaultValues = {
        uninstallTags: [mockUninstallTags[0]]
      };

      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} defaultValues={defaultValues} />
      );

      // Verificar que la tag está seleccionada inicialmente
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();

      // Eliminar la tag
      const removeButton = screen.getByTestId('remove-tag-tag-1');
      await user.click(removeButton);

      // Verificar que la tag fue eliminada
      expect(screen.queryByTestId('selected-tag-tag-1')).not.toBeInTheDocument();
    });

    it('debe manejar múltiples tags seleccionadas', async () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Agregar múltiples tags
      await user.click(screen.getByTestId('add-tag-tag-1'));
      await user.click(screen.getByTestId('add-tag-tag-2'));
      await user.click(screen.getByTestId('add-tag-tag-3'));

      // Verificar que todas están seleccionadas
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();
      expect(screen.getByTestId('selected-tag-tag-2')).toBeInTheDocument();
      expect(screen.getByTestId('selected-tag-tag-3')).toBeInTheDocument();
    });
  });

  describe('Envío de formulario con tags', () => {
    it('debe incluir uninstallTags en los datos enviados', async () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Llenar campos mínimos requeridos
      await user.type(screen.getByLabelText(/número.*proyecto/i), '2025-001');
      await user.type(screen.getByLabelText(/glosa/i), 'Proyecto test');

      // Agregar tags
      await user.click(screen.getByTestId('add-tag-tag-1'));
      await user.click(screen.getByTestId('add-tag-tag-2'));

      // Enviar formulario
      const submitButton = screen.getByRole('button', { name: /crear proyecto/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            projectNumber: '2025-001',
            glosa: 'Proyecto test',
            uninstallTags: expect.arrayContaining([
              expect.objectContaining({ id: 'tag-1', name: 'Cortina' }),
              expect.objectContaining({ id: 'tag-2', name: 'Persiana' })
            ])
          })
        );
      });
    });

    it('debe enviar array vacío cuando no hay tags seleccionadas', async () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Llenar campos mínimos sin tags
      await user.type(screen.getByLabelText(/número.*proyecto/i), '2025-002');
      await user.type(screen.getByLabelText(/glosa/i), 'Proyecto sin tags');

      // Enviar formulario
      const submitButton = screen.getByRole('button', { name: /crear proyecto/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            projectNumber: '2025-002',
            glosa: 'Proyecto sin tags',
            uninstallTags: []
          })
        );
      });
    });

    it('debe mantener tags seleccionadas durante validación de errores', async () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Agregar tags pero dejar campos requeridos vacíos
      await user.click(screen.getByTestId('add-tag-tag-1'));

      // Intentar enviar formulario incompleto
      const submitButton = screen.getByRole('button', { name: /crear proyecto/i });
      await user.click(submitButton);

      // Verificar que las tags permanecen seleccionadas después del error
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();
    });
  });

  describe('Modo edición con tags existentes', () => {
    it('debe cargar tags existentes en modo edición', () => {
      const existingProject: Partial<ProjectFormData> = {
        projectNumber: '2025-001',
        glosa: 'Proyecto existente',
        uninstallTags: [mockUninstallTags[0], mockUninstallTags[1]]
      };

      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} defaultValues={existingProject} />
      );

      // Verificar que las tags existentes están cargadas
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();
      expect(screen.getByTestId('selected-tag-tag-2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-001')).toBeInTheDocument();
    });

    it('debe permitir modificar tags en modo edición', async () => {
      const existingProject: Partial<ProjectFormData> = {
        projectNumber: '2025-001',
        glosa: 'Proyecto existente',
        uninstallTags: [mockUninstallTags[0]]
      };

      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} defaultValues={existingProject} />
      );

      // Agregar una nueva tag
      await user.click(screen.getByTestId('add-tag-tag-2'));

      // Eliminar la tag existente
      await user.click(screen.getByTestId('remove-tag-tag-1'));

      // Enviar y verificar cambios
      const submitButton = screen.getByRole('button', { name: /crear proyecto/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            uninstallTags: [
              expect.objectContaining({ id: 'tag-2', name: 'Persiana' })
            ]
          })
        );
      });
    });
  });

  describe('Verificación de migración completa', () => {
    it('NO debe contener referencias a campos obsoletos (uninstall, uninstallTypes)', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Verificar que NO existen campos de la implementación anterior
      expect(screen.queryByLabelText(/uninstall[^T]/i)).not.toBeInTheDocument(); // Campo boolean
      expect(screen.queryByLabelText(/uninstallTypes/i)).not.toBeInTheDocument(); // Campo array string
      expect(screen.queryByText(/tipos.*desinstalación/i)).not.toBeInTheDocument();

      // Solo debe existir uninstallTags
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('debe usar el sistema unificado de uninstallTags', async () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockOnSubmit} />
      );

      // Verificar que el hook useUninstallTags es utilizado
      expect(require('@/hooks/useUninstallTags').useUninstallTags).toHaveBeenCalled();

      // Verificar que las tags tienen la estructura correcta (UninstallTag)
      mockUninstallTags.forEach(tag => {
        expect(tag).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          color: expect.any(String),
          createdAt: expect.any(Date),
        });
      });
    });
  });
});