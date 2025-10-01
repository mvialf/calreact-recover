/**
 * Tests para useFormRef - Hook de ref forwarding para formularios
 *
 * Verifica:
 * - Exposición de API de formulario vía ref
 * - Submit programático
 * - Reset con/sin valores
 * - Gestión de errores
 * - Estado del formulario (isValid, isDirty)
 */

import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useFormRef, type FormRef } from '../useFormRef';
import { createRef } from 'react';

interface TestFormValues {
  name: string;
  email: string;
  age: number;
}

describe('useFormRef', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('API exposure via ref', () => {
    it('debe exponer API completa de formulario', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      renderHook(() => {
        const form = useForm<TestFormValues>();
        useFormRef(ref, form, mockOnSubmit);
      });

      expect(ref.current).toBeDefined();
      expect(ref.current).toHaveProperty('submit');
      expect(ref.current).toHaveProperty('reset');
      expect(ref.current).toHaveProperty('getValues');
      expect(ref.current).toHaveProperty('setError');
      expect(ref.current).toHaveProperty('clearErrors');
      expect(ref.current).toHaveProperty('isValid');
      expect(ref.current).toHaveProperty('isDirty');
    });

    it('debe permitir submit programático', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      renderHook(() => {
        const form = useForm<TestFormValues>({
          defaultValues: {
            name: 'Test User',
            email: 'test@example.com',
            age: 25,
          },
        });
        useFormRef(ref, form, mockOnSubmit);
      });

      // Llamar submit vía ref
      ref.current?.submit();

      expect(mockOnSubmit).toHaveBeenCalledWith(
        {
          name: 'Test User',
          email: 'test@example.com',
          age: 25,
        },
        expect.anything()
      );
    });
  });

  describe('Reset functionality', () => {
    it('debe resetear formulario a valores por defecto', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      const { result } = renderHook(() => {
        const form = useForm<TestFormValues>({
          defaultValues: {
            name: 'Original',
            email: 'original@example.com',
            age: 30,
          },
        });
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      // Modificar valores
      result.current.setValue('name', 'Modified');
      expect(result.current.getValues('name')).toBe('Modified');

      // Reset via ref
      ref.current?.reset();

      // Debe volver a valores por defecto
      expect(result.current.getValues('name')).toBe('Original');
    });

    it('debe resetear formulario con valores específicos', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      const { result } = renderHook(() => {
        const form = useForm<TestFormValues>({
          defaultValues: {
            name: 'Original',
            email: 'original@example.com',
            age: 30,
          },
        });
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      // Reset con valores nuevos via ref
      ref.current?.reset({
        name: 'New Name',
        email: 'new@example.com',
      });

      expect(result.current.getValues('name')).toBe('New Name');
      expect(result.current.getValues('email')).toBe('new@example.com');
    });
  });

  describe('Get values', () => {
    it('debe retornar valores actuales del formulario', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      const { result } = renderHook(() => {
        const form = useForm<TestFormValues>({
          defaultValues: {
            name: 'Test',
            email: 'test@example.com',
            age: 25,
          },
        });
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      const values = ref.current?.getValues();

      expect(values).toEqual({
        name: 'Test',
        email: 'test@example.com',
        age: 25,
      });
    });
  });

  describe('Error management', () => {
    it('debe setear error en campo específico', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      const { result } = renderHook(() => {
        const form = useForm<TestFormValues>();
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      // Setear error via ref
      ref.current?.setError('email', 'Email inválido');

      expect(result.current.formState.errors.email).toBeDefined();
      expect(result.current.formState.errors.email?.message).toBe('Email inválido');
    });

    it('debe limpiar errores específicos', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      const { result } = renderHook(() => {
        const form = useForm<TestFormValues>();
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      // Setear errores
      result.current.setError('email', { message: 'Email error' });
      result.current.setError('name', { message: 'Name error' });

      // Limpiar error de email via ref
      ref.current?.clearErrors('email');

      expect(result.current.formState.errors.email).toBeUndefined();
      expect(result.current.formState.errors.name).toBeDefined();
    });

    it('debe limpiar todos los errores', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      const { result } = renderHook(() => {
        const form = useForm<TestFormValues>();
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      // Setear errores
      result.current.setError('email', { message: 'Email error' });
      result.current.setError('name', { message: 'Name error' });

      // Limpiar todos los errores via ref
      ref.current?.clearErrors();

      expect(result.current.formState.errors.email).toBeUndefined();
      expect(result.current.formState.errors.name).toBeUndefined();
    });
  });

  describe('Form state', () => {
    it('debe reportar estado de validez del formulario', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      renderHook(() => {
        const form = useForm<TestFormValues>({
          mode: 'onChange',
          defaultValues: {
            name: '',
            email: '',
            age: 0,
          },
        });
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      // Formulario inválido por defecto (asumiendo validaciones)
      const isValid = ref.current?.isValid();
      expect(typeof isValid).toBe('boolean');
    });

    it('debe reportar estado dirty del formulario', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      const { result } = renderHook(() => {
        const form = useForm<TestFormValues>({
          defaultValues: {
            name: 'Original',
            email: 'original@example.com',
            age: 30,
          },
        });
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      // Formulario no dirty inicialmente
      expect(ref.current?.isDirty()).toBe(false);

      // Modificar valor
      result.current.setValue('name', 'Modified', { shouldDirty: true });

      // Formulario ahora dirty
      expect(ref.current?.isDirty()).toBe(true);
    });
  });

  describe('Integration with React Hook Form', () => {
    it('debe sincronizar con cambios de formulario', () => {
      const ref = createRef<FormRef<TestFormValues>>();

      const { result } = renderHook(() => {
        const form = useForm<TestFormValues>({
          defaultValues: {
            name: 'Test',
            email: 'test@example.com',
            age: 25,
          },
        });
        useFormRef(ref, form, mockOnSubmit);
        return form;
      });

      // Modificar valor en form
      result.current.setValue('name', 'Updated');

      // Ref debe reflejar cambio
      expect(ref.current?.getValues().name).toBe('Updated');
    });

    it('debe actualizar onSubmit cuando cambia', () => {
      const ref = createRef<FormRef<TestFormValues>>();
      const mockOnSubmit1 = jest.fn();
      const mockOnSubmit2 = jest.fn();

      const { rerender } = renderHook(
        ({ onSubmit }) => {
          const form = useForm<TestFormValues>({
            defaultValues: {
              name: 'Test',
              email: 'test@example.com',
              age: 25,
            },
          });
          useFormRef(ref, form, onSubmit);
          return form;
        },
        { initialProps: { onSubmit: mockOnSubmit1 } }
      );

      // Submit con onSubmit1
      ref.current?.submit();
      expect(mockOnSubmit1).toHaveBeenCalled();

      // Cambiar onSubmit
      rerender({ onSubmit: mockOnSubmit2 });

      // Submit con onSubmit2
      ref.current?.submit();
      expect(mockOnSubmit2).toHaveBeenCalled();
    });
  });
});
