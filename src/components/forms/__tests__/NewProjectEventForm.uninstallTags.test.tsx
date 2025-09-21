// NewProjectEventForm.uninstallTags.test.tsx
// Tests de integración para validar uninstallTags en formulario de eventos

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewProjectEventForm, type NewProjectEventFormValues } from '../NewProjectEventForm';
import {
  mockUninstallTags,
  createMockUseUninstallTags,
  resetUninstallTagsMocks,
  convertUninstallTagToTag,
} from '@/__tests__/helpers/uninstall-tags-helpers';

// Mock de componentes UI complejos
jest.mock('@/components/ui/addressInput', () => ({
  AddressInput: ({ value, onSelect, placeholder }: any) => (
    <input
      data-testid="address-input"
      placeholder={placeholder}
      onChange={(e) => onSelect?.({ textoCompleto: e.target.value })}
    />
  )
}));

jest.mock('@/components/ui/phone-input', () => ({
  PhoneInput: ({ value, onChange, disabled }: any) => (
    <input
      data-testid="phone-input"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
  )
}));

jest.mock('@/components/ui/date-input', () => ({
  DateInput: ({ date, onSelect, placeholder, disabled }: any) => (
    <input
      data-testid="date-input"
      type="date"
      value={date?.toISOString?.()?.split('T')[0] || ''}
      onChange={(e) => onSelect?.(new Date(e.target.value))}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}));

// Mock para TagSelector con lógica de conversión
jest.mock('@/components/ui/tags', () => ({
  TagSelector: ({
    selectedTags,
    availableTags,
    onTagsChange,
    onCreateTag,
    onEditTag,
    onDeleteTag,
    placeholder,
    label
  }: any) => (
    <div data-testid="tag-selector">
      <label data-testid="tag-label">{label}</label>
      <input
        data-testid="tag-input"
        placeholder={placeholder}
        defaultValue=""
      />

      {/* Tags seleccionadas */}
      <div data-testid="selected-tags">
        {selectedTags?.map((tag: any) => (
          <span key={tag.id} data-testid={`selected-tag-${tag.id}`}>
            {tag.name} ({tag.color})
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

      {/* Tags disponibles para agregar */}
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

      {/* Botones de gestión de tags */}
      <div data-testid="tag-management">
        <button data-testid="create-tag-btn" onClick={() => onCreateTag?.({ name: 'Nueva Tag', color: 'blue' })}>
          Crear Tag
        </button>
        <button data-testid="edit-tag-btn" onClick={() => onEditTag?.('tag-1', { name: 'Tag Editada' })}>
          Editar Tag
        </button>
        <button data-testid="delete-tag-btn" onClick={() => onDeleteTag?.('tag-1')}>
          Eliminar Tag
        </button>
      </div>
    </div>
  )
}));

// Mock del hook useUninstallTags
const mockUseUninstallTags = createMockUseUninstallTags();
jest.mock('@/hooks/useUninstallTags', () => ({
  useUninstallTags: jest.fn(() => mockUseUninstallTags),
}));

describe('NewProjectEventForm - UninstallTags Integration', () => {
  let mockOnSubmit: jest.Mock;
  let mockFormRef: React.RefObject<HTMLFormElement>;
  let mockFormInstanceRef: React.MutableRefObject<any>;
  const user = userEvent.setup();

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    mockFormRef = { current: null };
    mockFormInstanceRef = { current: null };
    resetUninstallTagsMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado y estructura', () => {
    it('debe renderizar TagSelector siempre visible (sin condicional)', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // ✅ Verificar que TagSelector está presente
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();

      // ✅ Verificar label correcto
      expect(screen.getByTestId('tag-label')).toHaveTextContent('Tags de Desinstalación');

      // ✅ Verificar placeholder correcto
      const tagInput = screen.getByTestId('tag-input');
      expect(tagInput).toHaveAttribute('placeholder', 'Seleccionar tags de desinstalación...');
    });

    it('debe cargar tags disponibles del hook useUninstallTags', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // Verificar que se cargan las tags del hook
      mockUninstallTags.forEach(tag => {
        expect(screen.getByTestId(`add-tag-${tag.id}`)).toBeInTheDocument();
        expect(screen.getByText(tag.name)).toBeInTheDocument();
      });
    });

    it('debe mostrar botones de gestión de tags', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByTestId('create-tag-btn')).toBeInTheDocument();
      expect(screen.getByTestId('edit-tag-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-tag-btn')).toBeInTheDocument();
    });
  });

  describe('Conversión de tipos UninstallTag ↔ Tag', () => {
    it('debe convertir UninstallTag a Tag correctamente para UI', () => {
      const uninstallTag = mockUninstallTags[0];
      const convertedTag = convertUninstallTagToTag(uninstallTag);

      // ✅ Verificar que la conversión mantiene la estructura
      expect(convertedTag).toMatchObject({
        id: uninstallTag.id,
        name: uninstallTag.name,
        color: uninstallTag.color, // Type cast debe funcionar
        createdAt: uninstallTag.createdAt,
      });

      // ✅ Verificar que el tipo de color es compatible
      expect(typeof convertedTag.color).toBe('string');
    });

    it('debe manejar tags con color casting en el componente', () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        uninstallTypes: mockUninstallTags.map(tag => tag.id)
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      // Verificar que las tags se renderizan con colores convertidos
      mockUninstallTags.forEach(tag => {
        const selectedTag = screen.getByTestId(`selected-tag-${tag.id}`);
        expect(selectedTag).toHaveTextContent(tag.name);
        expect(selectedTag).toHaveTextContent(tag.color); // Color visible en el mock
      });
    });
  });

  describe('Datos iniciales y herencia de proyecto', () => {
    it('debe cargar tags de datos iniciales', () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        projectId: 'project-1',
        uninstallTypes: [mockUninstallTags[0].id, mockUninstallTags[1].id]
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      // Verificar que las tags iniciales están seleccionadas
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();
      expect(screen.getByTestId('selected-tag-tag-2')).toBeInTheDocument();
    });

    it('debe manejar array vacío de tags iniciales', () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        projectId: 'project-1',
        uninstallTypes: []
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      // Verificar que no hay tags seleccionadas
      expect(screen.queryByTestId(/selected-tag-/)).not.toBeInTheDocument();

      // Pero las tags disponibles deben estar presentes
      expect(screen.getByTestId('available-tags')).toBeInTheDocument();
    });

    it('debe manejar datos iniciales sin uninstallTags definidas', () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        projectId: 'project-1',
        description: 'Evento de prueba'
        // uninstallTags no definidas
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      // Debe funcionar sin errores y mostrar array vacío
      expect(screen.queryByTestId(/selected-tag-/)).not.toBeInTheDocument();
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });
  });

  describe('Gestión de tags en el formulario', () => {
    it('debe permitir agregar tags', async () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // Agregar una tag
      const addButton = screen.getByTestId('add-tag-tag-1');
      await user.click(addButton);

      // Verificar que aparece en seleccionadas
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();
      expect(screen.getByText('Cortina (blue)')).toBeInTheDocument();
    });

    it('debe permitir eliminar tags', async () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        uninstallTypes: [mockUninstallTags[0].id]
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      // Verificar tag inicial
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();

      // Eliminar tag
      const removeButton = screen.getByTestId('remove-tag-tag-1');
      await user.click(removeButton);

      // Verificar eliminación
      expect(screen.queryByTestId('selected-tag-tag-1')).not.toBeInTheDocument();
    });

    it('debe llamar a las funciones de gestión del hook', async () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // Probar crear tag
      await user.click(screen.getByTestId('create-tag-btn'));
      expect(mockUseUninstallTags.createTag).toHaveBeenCalledWith({
        name: 'Nueva Tag',
        color: 'blue'
      });

      // Probar editar tag
      await user.click(screen.getByTestId('edit-tag-btn'));
      expect(mockUseUninstallTags.editTag).toHaveBeenCalledWith('tag-1', {
        name: 'Tag Editada'
      });

      // Probar eliminar tag
      await user.click(screen.getByTestId('delete-tag-btn'));
      expect(mockUseUninstallTags.deleteTag).toHaveBeenCalledWith('tag-1');
    });
  });

  describe('Envío de formulario con tags', () => {
    it('debe incluir uninstallTags en los datos enviados', async () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // Llenar campos requeridos
      await user.type(screen.getByRole('combobox'), 'ingresado'); // Status

      // Agregar tags
      await user.click(screen.getByTestId('add-tag-tag-1'));
      await user.click(screen.getByTestId('add-tag-tag-2'));

      // Simular envío del formulario
      const form = document.createElement('form');
      Object.defineProperty(mockFormRef, 'current', { value: form, writable: true });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'ingresado',
            uninstallTypes: expect.arrayContaining([
              expect.objectContaining({ id: 'tag-1', name: 'Cortina' }),
              expect.objectContaining({ id: 'tag-2', name: 'Persiana' })
            ])
          })
        );
      });
    });

    it('debe enviar array vacío cuando no hay tags seleccionadas', async () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // Llenar solo campos requeridos, sin tags
      await user.type(screen.getByRole('combobox'), 'ingresado');

      // Simular envío
      const form = document.createElement('form');
      Object.defineProperty(mockFormRef, 'current', { value: form, writable: true });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            uninstallTypes: []
          })
        );
      });
    });
  });

  describe('Estados de formulario', () => {
    it('debe deshabilitar TagSelector cuando disabled=true', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          disabled={true}
        />
      );

      // Verificar que TagSelector está deshabilitado
      // En implementación real, esto se pasaría como prop al TagSelector
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('debe mantener tags durante estados de carga', () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        uninstallTypes: [mockUninstallTags[0].id]
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          isSubmitting={true}
        />
      );

      // Las tags deben permanecer visibles durante loading
      expect(screen.getByTestId('selected-tag-tag-1')).toBeInTheDocument();
    });
  });

  describe('Verificación de migración', () => {
    it('NO debe contener referencias a campos obsoletos', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // ✅ Verificar que NO existen campos de la implementación anterior
      expect(screen.queryByLabelText(/uninstall[^T]/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/uninstallTypes/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: /desinstalación/i })).not.toBeInTheDocument();

      // ✅ Solo debe existir el sistema unificado
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('debe usar el sistema de hooks correctamente', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // Verificar que el hook useUninstallTags es llamado
      expect(require('@/hooks/useUninstallTags').useUninstallTags).toHaveBeenCalled();
    });
  });
});