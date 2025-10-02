/**
 * Tests para useFormAccessibility hook
 */

import { renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useFormAccessibility } from '../useFormAccessibility';

describe('useFormAccessibility', () => {
  // Helper para crear form mock
  const createMockForm = (errors: Record<string, any> = {}) => {
    return {
      formState: { errors },
    } as any;
  };

  describe('ID Generation', () => {
    it('debe generar fieldId único y estable', () => {
      const form = createMockForm();
      const { result, rerender } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      const firstFieldId = result.current.fieldId;
      expect(firstFieldId).toMatch(/^field-email-/);

      // Re-render debe mantener mismo ID
      rerender();
      expect(result.current.fieldId).toBe(firstFieldId);
    });

    it('debe generar errorId basado en fieldId', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      expect(result.current.errorId).toBe(`${result.current.fieldId}-error`);
    });

    it('debe generar descriptionId basado en fieldId', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      expect(result.current.descriptionId).toBe(
        `${result.current.fieldId}-description`
      );
    });

    it('debe usar customDescriptionId cuando se provee', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form, {
          customDescriptionId: 'custom-desc',
        })
      );

      expect(result.current.descriptionId).toBe('custom-desc');
    });

    it('debe generar IDs diferentes para campos diferentes', () => {
      const form = createMockForm();
      const { result: result1 } = renderHook(() =>
        useFormAccessibility('email', form)
      );
      const { result: result2 } = renderHook(() =>
        useFormAccessibility('password', form)
      );

      expect(result1.current.fieldId).not.toBe(result2.current.fieldId);
    });
  });

  describe('ARIA Attributes', () => {
    it('debe retornar aria-invalid false cuando no hay error', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      expect(result.current.ariaAttributes['aria-invalid']).toBe(false);
    });

    it('debe retornar aria-invalid true cuando hay error', () => {
      const form = createMockForm({
        email: { message: 'Email inválido' },
      });
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      expect(result.current.ariaAttributes['aria-invalid']).toBe(true);
    });

    it('debe incluir errorId en aria-describedby cuando hay error', () => {
      const form = createMockForm({
        email: { message: 'Email inválido' },
      });
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      expect(result.current.ariaAttributes['aria-describedby']).toBe(
        result.current.errorId
      );
    });

    it('debe incluir customDescriptionId en aria-describedby', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form, {
          customDescriptionId: 'custom-desc',
        })
      );

      expect(result.current.ariaAttributes['aria-describedby']).toBe(
        'custom-desc'
      );
    });

    it('debe combinar errorId y customDescriptionId en aria-describedby', () => {
      const form = createMockForm({
        email: { message: 'Email inválido' },
      });
      const { result } = renderHook(() =>
        useFormAccessibility('email', form, {
          customDescriptionId: 'custom-desc',
        })
      );

      const describedBy = result.current.ariaAttributes['aria-describedby'];
      expect(describedBy).toContain(result.current.errorId);
      expect(describedBy).toContain('custom-desc');
    });

    it('debe incluir aria-required cuando required es true', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form, { required: true })
      );

      expect(result.current.ariaAttributes['aria-required']).toBe(true);
    });

    it('NO debe incluir aria-required cuando required es false', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form, { required: false })
      );

      expect(result.current.ariaAttributes['aria-required']).toBeUndefined();
    });

    it('debe incluir aria-label cuando se provee', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form, {
          ariaLabel: 'Correo electrónico',
        })
      );

      expect(result.current.ariaAttributes['aria-label']).toBe(
        'Correo electrónico'
      );
    });

    it('NO debe incluir aria-label cuando no se provee', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      expect(result.current.ariaAttributes['aria-label']).toBeUndefined();
    });
  });

  describe('Focus and Scroll', () => {
    beforeEach(() => {
      // Setup DOM
      document.body.innerHTML = '';
    });

    it('focusField debe hacer focus en el elemento correcto', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      // Crear elemento con el fieldId
      const input = document.createElement('input');
      input.id = result.current.fieldId;
      document.body.appendChild(input);

      result.current.focusField();

      expect(document.activeElement).toBe(input);
    });

    it('focusField no debe hacer nada si elemento no existe', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      // No crear elemento
      expect(() => result.current.focusField()).not.toThrow();
    });

    it('scrollToField debe hacer scroll al elemento', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      // Crear elemento
      const input = document.createElement('input');
      input.id = result.current.fieldId;
      input.scrollIntoView = jest.fn();
      document.body.appendChild(input);

      result.current.scrollToField();

      expect(input.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
    });

    it('scrollToField no debe hacer nada si elemento no existe', () => {
      const form = createMockForm();
      const { result } = renderHook(() =>
        useFormAccessibility('email', form)
      );

      // No crear elemento
      expect(() => result.current.scrollToField()).not.toThrow();
    });
  });

  describe('Integration with react-hook-form', () => {
    it('debe funcionar correctamente con useForm real', () => {
      const { result: formResult } = renderHook(() =>
        useForm({
          defaultValues: { email: '' },
        })
      );

      const { result: accessibilityResult } = renderHook(() =>
        useFormAccessibility('email', formResult.current, { required: true })
      );

      expect(accessibilityResult.current.fieldId).toBeDefined();
      expect(accessibilityResult.current.ariaAttributes['aria-required']).toBe(
        true
      );
      expect(
        accessibilityResult.current.ariaAttributes['aria-invalid']
      ).toBe(false);
    });
  });
});
