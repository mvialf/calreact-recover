// NewProjectEventForm.uninstallTags.simplified.test.tsx
// Tests simplificados para validar sistema uninstallTags en formulario de eventos

import React from 'react';
import { render, screen } from '@testing-library/react';
import { NewProjectEventForm, type NewProjectEventFormValues } from '../NewProjectEventForm';
import {
  mockUninstallTags,
  createMockUseUninstallTags,
  convertUninstallTagToTag,
} from '@/__tests__/helpers/uninstall-tags-helpers';

// Mocks simplificados de componentes UI
jest.mock('@/components/ui/addressInput', () => ({
  AddressInput: () => <div data-testid="address-input" />
}));

jest.mock('@/components/ui/phone-input', () => ({
  PhoneInput: () => <div data-testid="phone-input" />
}));

// DateInput ya no necesita mock - es un input nativo estándar

jest.mock('@/components/ui/tags', () => ({
  TagSelector: ({ label, placeholder }: any) => (
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

describe('NewProjectEventForm - UninstallTags Structure Validation', () => {
  let mockOnSubmit: jest.Mock;
  let mockFormRef: React.RefObject<HTMLFormElement>;
  let mockFormInstanceRef: React.MutableRefObject<any>;

  beforeEach(() => {
    mockOnSubmit = jest.fn();
    mockFormRef = { current: null };
    mockFormInstanceRef = { current: null };
    jest.clearAllMocks();
  });

  describe('Renderizado y estructura', () => {
    it('debe renderizar TagSelector siempre visible', () => {
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
    });

    it('debe mostrar placeholder correcto', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      const tagInput = screen.getByTestId('tag-input');
      expect(tagInput).toHaveAttribute('placeholder', 'Seleccionar tags de desinstalación...');
    });

    it('debe usar el hook useUninstallTags', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // Verificar que el hook es llamado
      expect(require('@/hooks/useUninstallTags').useUninstallTags).toHaveBeenCalled();
    });
  });

  describe('Datos iniciales y herencia', () => {
    it('debe manejar initialData con uninstallTags', () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        projectId: 'project-1',
        uninstallTags: mockUninstallTags.slice(0, 2)
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      // Debe renderizar sin errores
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('debe manejar initialData sin uninstallTags', () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        projectId: 'project-1',
        description: 'Evento sin tags'
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      // Debe funcionar normalmente
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('debe manejar array vacío de uninstallTags', () => {
      const initialData: Partial<NewProjectEventFormValues> = {
        projectId: 'project-1',
        uninstallTags: []
      };

      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          initialData={initialData}
        />
      );

      // Debe renderizar correctamente
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });
  });

  describe('Conversión de tipos', () => {
    it('debe convertir UninstallTag a Tag correctamente', () => {
      const uninstallTag = mockUninstallTags[0];
      const convertedTag = convertUninstallTagToTag(uninstallTag);

      // ✅ Verificar estructura de conversión
      expect(convertedTag).toMatchObject({
        id: uninstallTag.id,
        name: uninstallTag.name,
        color: uninstallTag.color,
        createdAt: uninstallTag.createdAt,
      });
    });

    it('debe manejar tags con diferentes colores', () => {
      mockUninstallTags.forEach(uninstallTag => {
        const convertedTag = convertUninstallTagToTag(uninstallTag);

        expect(convertedTag.color).toBe(uninstallTag.color);
        expect(typeof convertedTag.color).toBe('string');
      });
    });
  });

  describe('Verificación de migración', () => {
    it('NO debe contener elementos del sistema anterior', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // ✅ Verificar ausencia de elementos obsoletos
      expect(screen.queryByLabelText(/uninstall[^T]/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/uninstallTypes/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('checkbox', { name: /desinstalación/i })).not.toBeInTheDocument();
    });

    it('debe usar solo el sistema unificado', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // ✅ Solo debe existir el TagSelector
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();

      // ✅ Verificar que no hay campos obsoletos
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // Buscar cualquier input de tipo checkbox (no debe haber para uninstall)
      const checkboxes = screen.queryAllByRole('checkbox');
      const uninstallCheckbox = checkboxes.find(checkbox =>
        checkbox.getAttribute('name')?.includes('uninstall') &&
        !checkbox.getAttribute('name')?.includes('uninstallTags')
      );
      expect(uninstallCheckbox).toBeUndefined();
    });

    it('debe tener estructura de formulario correcta', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
        />
      );

      // Verificar campos principales
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Status selector
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /descripción/i })).toBeInTheDocument();
    });
  });

  describe('Estados del formulario', () => {
    it('debe manejar estado disabled', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          disabled={true}
        />
      );

      // El TagSelector debe estar presente incluso cuando disabled
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });

    it('debe manejar estado isSubmitting', () => {
      render(
        <NewProjectEventForm
          formRef={mockFormRef}
          formInstanceRef={mockFormInstanceRef}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />
      );

      // El formulario debe seguir siendo funcional
      expect(screen.getByTestId('tag-selector')).toBeInTheDocument();
    });
  });
});