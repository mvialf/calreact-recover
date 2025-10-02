/**
 * Tests para useFocusManagement hook
 */

import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useFocusManagement } from '../useFocusManagement';

describe('useFocusManagement', () => {
  let formRef: React.RefObject<HTMLFormElement>;

  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';

    // Create form ref
    formRef = createRef<HTMLFormElement>();

    // Create form element
    const form = document.createElement('form');
    (formRef as any).current = form;
    document.body.appendChild(form);

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('focusFirstError', () => {
    it('debe hacer focus en el primer elemento con aria-invalid="true"', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      // Crear inputs
      const input1 = document.createElement('input');
      input1.id = 'field-1';
      input1.setAttribute('aria-invalid', 'false');

      const input2 = document.createElement('input');
      input2.id = 'field-2';
      input2.setAttribute('aria-invalid', 'true'); // Este es el primero con error

      const input3 = document.createElement('input');
      input3.id = 'field-3';
      input3.setAttribute('aria-invalid', 'true');

      formRef.current!.appendChild(input1);
      formRef.current!.appendChild(input2);
      formRef.current!.appendChild(input3);

      // Mock setTimeout para ejecutar inmediatamente
      jest.useFakeTimers();
      result.current.focusFirstError();
      jest.runAllTimers();

      expect(document.activeElement).toBe(input2);
      expect(input2.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });

      jest.useRealTimers();
    });

    it('no debe hacer nada si no hay elementos con error', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      const input = document.createElement('input');
      input.setAttribute('aria-invalid', 'false');
      formRef.current!.appendChild(input);

      jest.useFakeTimers();
      result.current.focusFirstError();
      jest.runAllTimers();

      expect(document.activeElement).not.toBe(input);

      jest.useRealTimers();
    });

    it('no debe hacer nada si formRef.current es null', () => {
      const emptyRef = { current: null } as React.RefObject<HTMLFormElement>;
      const { result } = renderHook(() => useFocusManagement(emptyRef));

      expect(() => result.current.focusFirstError()).not.toThrow();
    });
  });

  describe('focusFirstField', () => {
    it('debe hacer focus en el primer input del formulario', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      const input1 = document.createElement('input');
      input1.id = 'first-field';

      const input2 = document.createElement('input');
      input2.id = 'second-field';

      formRef.current!.appendChild(input1);
      formRef.current!.appendChild(input2);

      jest.useFakeTimers();
      result.current.focusFirstField();
      jest.runAllTimers();

      expect(document.activeElement).toBe(input1);
      expect(input1.scrollIntoView).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('debe ignorar inputs hidden', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';

      const visibleInput = document.createElement('input');
      visibleInput.id = 'visible-field';

      formRef.current!.appendChild(hiddenInput);
      formRef.current!.appendChild(visibleInput);

      jest.useFakeTimers();
      result.current.focusFirstField();
      jest.runAllTimers();

      expect(document.activeElement).toBe(visibleInput);

      jest.useRealTimers();
    });

    it('debe funcionar con textarea', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      const textarea = document.createElement('textarea');
      textarea.id = 'textarea-field';

      formRef.current!.appendChild(textarea);

      jest.useFakeTimers();
      result.current.focusFirstField();
      jest.runAllTimers();

      expect(document.activeElement).toBe(textarea);

      jest.useRealTimers();
    });

    it('debe funcionar con select', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      const select = document.createElement('select');
      select.id = 'select-field';

      formRef.current!.appendChild(select);

      jest.useFakeTimers();
      result.current.focusFirstField();
      jest.runAllTimers();

      expect(document.activeElement).toBe(select);

      jest.useRealTimers();
    });
  });

  describe('scrollToField', () => {
    it('debe hacer scroll y focus a campo por ID', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      const input = document.createElement('input');
      input.id = 'specific-field';
      formRef.current!.appendChild(input);

      jest.useFakeTimers();
      result.current.scrollToField('specific-field');
      jest.runAllTimers();

      expect(document.activeElement).toBe(input);
      expect(input.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });

      jest.useRealTimers();
    });

    it('no debe hacer nada si el ID no existe', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      expect(() =>
        result.current.scrollToField('non-existent-id')
      ).not.toThrow();
    });
  });

  describe('scrollToFieldByName', () => {
    it('debe hacer scroll a campo por nombre', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      const input = document.createElement('input');
      input.id = 'field-email-xyz123'; // Pattern: field-{name}-{uniqueId}
      formRef.current!.appendChild(input);

      jest.useFakeTimers();
      result.current.scrollToFieldByName('email');
      jest.runAllTimers();

      expect(document.activeElement).toBe(input);
      expect(input.scrollIntoView).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('debe encontrar el primer campo cuando hay múltiples con mismo nombre', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      const input1 = document.createElement('input');
      input1.id = 'field-email-abc';

      const input2 = document.createElement('input');
      input2.id = 'field-email-def';

      formRef.current!.appendChild(input1);
      formRef.current!.appendChild(input2);

      jest.useFakeTimers();
      result.current.scrollToFieldByName('email');
      jest.runAllTimers();

      expect(document.activeElement).toBe(input1);

      jest.useRealTimers();
    });

    it('no debe hacer nada si el nombre no existe', () => {
      const { result } = renderHook(() => useFocusManagement(formRef));

      expect(() =>
        result.current.scrollToFieldByName('non-existent')
      ).not.toThrow();
    });
  });

  describe('Custom scroll options', () => {
    it('debe usar scrollBehavior personalizado', () => {
      const { result } = renderHook(() =>
        useFocusManagement(formRef, { scrollBehavior: 'auto' })
      );

      const input = document.createElement('input');
      input.id = 'test-field';
      input.setAttribute('aria-invalid', 'true');
      formRef.current!.appendChild(input);

      jest.useFakeTimers();
      result.current.focusFirstError();
      jest.runAllTimers();

      expect(input.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'center',
      });

      jest.useRealTimers();
    });

    it('debe usar scrollBlock personalizado', () => {
      const { result } = renderHook(() =>
        useFocusManagement(formRef, { scrollBlock: 'start' })
      );

      const input = document.createElement('input');
      input.id = 'test-field';
      input.setAttribute('aria-invalid', 'true');
      formRef.current!.appendChild(input);

      jest.useFakeTimers();
      result.current.focusFirstError();
      jest.runAllTimers();

      expect(input.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });

      jest.useRealTimers();
    });
  });
});
