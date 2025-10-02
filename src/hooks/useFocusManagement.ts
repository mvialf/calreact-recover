/**
 * useFocusManagement - Hook para gestión de focus en formularios
 *
 * Proporciona utilidades para manejar focus programático, scroll a errores,
 * y navegación inteligente en formularios accesibles.
 *
 * @example
 * const formRef = useRef<HTMLFormElement>(null);
 * const { focusFirstError, focusFirstField } = useFocusManagement(formRef);
 *
 * // Después de submit fallido
 * if (hasErrors) {
 *   focusFirstError();
 * }
 */

import { useCallback, type RefObject } from 'react';

export interface FocusManagementOptions {
  /**
   * Scroll behavior
   * @default 'smooth'
   */
  scrollBehavior?: ScrollBehavior;
  /**
   * Scroll block position
   * @default 'center'
   */
  scrollBlock?: ScrollLogicalPosition;
}

export interface FocusManagementReturn {
  /**
   * Hace focus en el primer campo con error (aria-invalid="true")
   */
  focusFirstError: () => void;
  /**
   * Hace focus en el primer campo input/textarea/select del formulario
   */
  focusFirstField: () => void;
  /**
   * Hace scroll y focus a un campo específico por ID
   */
  scrollToField: (fieldId: string) => void;
  /**
   * Hace scroll y focus a un campo específico por nombre
   */
  scrollToFieldByName: (fieldName: string) => void;
}

/**
 * Hook de gestión de focus para formularios
 *
 * @param formRef - Referencia al elemento form
 * @param options - Opciones de configuración
 */
export const useFocusManagement = (
  formRef: RefObject<HTMLFormElement>,
  options: FocusManagementOptions = {}
): FocusManagementReturn => {
  const {
    scrollBehavior = 'smooth',
    scrollBlock = 'center',
  } = options;

  /**
   * Scrollea y hace focus en un elemento
   */
  const scrollAndFocus = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;

      // Scroll al elemento
      element.scrollIntoView({
        behavior: scrollBehavior,
        block: scrollBlock,
      });

      // Focus con pequeño delay para asegurar scroll completo
      setTimeout(() => {
        element.focus();

        // Si el elemento no es focusable naturalmente, intentar focusable parent
        if (document.activeElement !== element) {
          const focusable = element.querySelector<HTMLElement>(
            'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
          );
          focusable?.focus();
        }
      }, 100);
    },
    [scrollBehavior, scrollBlock]
  );

  /**
   * Hace focus en el primer campo con error
   */
  const focusFirstError = useCallback(() => {
    if (!formRef.current) return;

    // Buscar primer elemento con aria-invalid="true"
    const firstErrorElement = formRef.current.querySelector<HTMLElement>(
      '[aria-invalid="true"]'
    );

    if (firstErrorElement) {
      scrollAndFocus(firstErrorElement);
    }
  }, [formRef, scrollAndFocus]);

  /**
   * Hace focus en el primer campo del formulario
   */
  const focusFirstField = useCallback(() => {
    if (!formRef.current) return;

    // Buscar primer input/textarea/select
    const firstField = formRef.current.querySelector<HTMLElement>(
      'input:not([type="hidden"]), textarea, select'
    );

    if (firstField) {
      scrollAndFocus(firstField);
    }
  }, [formRef, scrollAndFocus]);

  /**
   * Scroll a campo específico por ID
   */
  const scrollToField = useCallback(
    (fieldId: string) => {
      const element = document.getElementById(fieldId);
      if (element) {
        scrollAndFocus(element as HTMLElement);
      }
    },
    [scrollAndFocus]
  );

  /**
   * Scroll a campo específico por nombre
   * Busca elemento con pattern: field-{fieldName}-*
   */
  const scrollToFieldByName = useCallback(
    (fieldName: string) => {
      if (!formRef.current) return;

      // Buscar elemento con ID que contenga el nombre del campo
      const element = formRef.current.querySelector<HTMLElement>(
        `[id^="field-${fieldName}-"]`
      );

      if (element) {
        scrollAndFocus(element);
      }
    },
    [formRef, scrollAndFocus]
  );

  return {
    focusFirstError,
    focusFirstField,
    scrollToField,
    scrollToFieldByName,
  };
};
