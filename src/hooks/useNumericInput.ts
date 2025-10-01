/**
 * Hook para inputs numéricos con debounce y validación
 *
 * Optimiza re-renders al debounce de cambios y sanitizar valores automáticamente
 */

import { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { sanitizeNumericInput, type NumericSanitizeOptions } from '@/utils/form-helpers';

export interface UseNumericInputOptions extends NumericSanitizeOptions {
  defaultValue?: number;
  debounceMs?: number;
  onChange?: (value: number) => void;
}

export interface UseNumericInputReturn {
  value: number;
  displayValue: string;
  handleChange: (input: string) => void;
  handleBlur: () => void;
  reset: () => void;
}

/**
 * Hook para manejar inputs numéricos con debounce y validación
 *
 * @param options - Opciones de configuración
 * @returns Objeto con value, displayValue y handlers
 *
 * @example
 * const { value, displayValue, handleChange } = useNumericInput({
 *   defaultValue: 0,
 *   min: 0,
 *   max: 100,
 *   integer: true,
 *   debounceMs: 300,
 *   onChange: (val) => form.setValue('count', val)
 * });
 *
 * <Input value={displayValue} onChange={(e) => handleChange(e.target.value)} />
 */
export const useNumericInput = (
  options: UseNumericInputOptions = {}
): UseNumericInputReturn => {
  const {
    defaultValue = 0,
    debounceMs = 300,
    onChange,
    ...sanitizeOptions
  } = options;

  const [value, setValue] = useState(defaultValue);
  const [displayValue, setDisplayValue] = useState(defaultValue.toString());

  // Debounced onChange para evitar re-renders excesivos
  const debouncedOnChange = useDebouncedCallback(
    (sanitized: number) => {
      setValue(sanitized);
      onChange?.(sanitized);
    },
    debounceMs
  );

  const handleChange = useCallback((input: string) => {
    // Actualizar display inmediatamente para feedback visual
    setDisplayValue(input);

    // Sanitizar y propagar cambio con debounce
    const sanitized = sanitizeNumericInput(input, defaultValue, sanitizeOptions);
    debouncedOnChange(sanitized);
  }, [defaultValue, sanitizeOptions, debouncedOnChange]);

  const handleBlur = useCallback(() => {
    // Al perder foco, asegurar que el display muestra el valor sanitizado
    setDisplayValue(value.toString());
  }, [value]);

  const reset = useCallback(() => {
    setValue(defaultValue);
    setDisplayValue(defaultValue.toString());
  }, [defaultValue]);

  return {
    value,
    displayValue,
    handleChange,
    handleBlur,
    reset,
  };
};
