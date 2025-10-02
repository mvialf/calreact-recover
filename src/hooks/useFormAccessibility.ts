/**
 * useFormAccessibility - Hook para generar ARIA attributes automáticamente
 *
 * Genera IDs únicos y calcula ARIA attributes basado en el estado del formulario,
 * eliminando la necesidad de hardcodear IDs y mejorando accesibilidad.
 *
 * @example
 * const { fieldId, ariaAttributes, errorId } = useFormAccessibility('email', form);
 *
 * <Input
 *   id={fieldId}
 *   {...ariaAttributes}
 * />
 * {error && <FormMessage id={errorId} role="alert" />}
 */

import { useId, useCallback } from 'react';
import type { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';

export interface FormAccessibilityOptions {
  /**
   * Si el campo es requerido
   * @default false
   */
  required?: boolean;
  /**
   * ID de descripción personalizado (si ya existe en el DOM)
   */
  customDescriptionId?: string;
  /**
   * Label para screen readers (si el label visual no es suficiente)
   */
  ariaLabel?: string;
}

export interface FormAccessibilityReturn {
  /**
   * ID único generado para el campo
   */
  fieldId: string;
  /**
   * ID generado para el mensaje de error
   */
  errorId: string;
  /**
   * ID generado para la descripción del campo
   */
  descriptionId: string;
  /**
   * ARIA attributes calculados basado en estado del formulario
   */
  ariaAttributes: {
    'aria-invalid': boolean;
    'aria-describedby'?: string;
    'aria-required'?: boolean;
    'aria-label'?: string;
  };
  /**
   * Función para hacer focus programático en el campo
   */
  focusField: () => void;
  /**
   * Función para hacer scroll al campo
   */
  scrollToField: () => void;
}

/**
 * Hook de accesibilidad para formularios
 *
 * @param fieldName - Nombre del campo en el formulario
 * @param form - Instancia de react-hook-form
 * @param options - Opciones de configuración
 */
export const useFormAccessibility = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  fieldName: TFieldName,
  form: UseFormReturn<TFieldValues>,
  options: FormAccessibilityOptions = {}
): FormAccessibilityReturn => {
  const {
    required = false,
    customDescriptionId,
    ariaLabel,
  } = options;

  // Generar IDs únicos y estables
  const uniqueId = useId();
  const fieldId = `field-${String(fieldName)}-${uniqueId}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = customDescriptionId || `${fieldId}-description`;

  // Obtener error del campo
  const error = form.formState.errors[fieldName];
  const hasError = !!error;

  // Calcular aria-describedby basado en presencia de error y descripción
  const getAriaDescribedBy = (): string | undefined => {
    const ids: string[] = [];

    if (hasError) {
      ids.push(errorId);
    }

    if (customDescriptionId) {
      ids.push(customDescriptionId);
    }

    return ids.length > 0 ? ids.join(' ') : undefined;
  };

  // ARIA attributes calculados
  const ariaAttributes = {
    'aria-invalid': hasError,
    'aria-describedby': getAriaDescribedBy(),
    ...(required && { 'aria-required': true }),
    ...(ariaLabel && { 'aria-label': ariaLabel }),
  };

  // Focus programático
  const focusField = useCallback(() => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.focus();
    }
  }, [fieldId]);

  // Scroll al campo
  const scrollToField = useCallback(() => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [fieldId]);

  return {
    fieldId,
    errorId,
    descriptionId,
    ariaAttributes,
    focusField,
    scrollToField,
  };
};
