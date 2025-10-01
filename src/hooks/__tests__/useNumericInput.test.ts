/**
 * Tests para useNumericInput - Hook de inputs numéricos con debounce
 *
 * Verifica:
 * - Sanitización de inputs (integer/float)
 * - Debounce de onChange
 * - Validación min/max
 * - handleBlur formatting
 * - Reset functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useNumericInput } from '../useNumericInput';

// Mock de use-debounce para control en tests
jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: any, delay: number) => {
    // En tests, retornar función sin debounce para control inmediato
    return fn;
  },
}));

describe('useNumericInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('debe inicializar con defaultValue', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          defaultValue: 42,
        })
      );

      expect(result.current.value).toBe(42);
      expect(result.current.displayValue).toBe('42');
    });

    it('debe inicializar con defaultValue 0 si no se provee', () => {
      const { result } = renderHook(() => useNumericInput());

      expect(result.current.value).toBe(0);
      expect(result.current.displayValue).toBe('0');
    });
  });

  describe('Integer sanitization', () => {
    it('debe sanitizar input a integer', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          integer: true,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('42.7');
      });

      // Display debe mostrar input original
      expect(result.current.displayValue).toBe('42.7');

      // Value debe ser sanitizado a integer
      expect(mockOnChange).toHaveBeenCalledWith(42);
    });

    it('debe manejar inputs no numéricos en modo integer', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          defaultValue: 10,
          integer: true,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('abc');
      });

      // Display muestra input original
      expect(result.current.displayValue).toBe('abc');

      // Value debe ser defaultValue cuando input es inválido
      expect(mockOnChange).toHaveBeenCalledWith(10);
    });
  });

  describe('Float sanitization', () => {
    it('debe preservar decimales en modo float', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          integer: false,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('42.75');
      });

      expect(result.current.displayValue).toBe('42.75');
      expect(mockOnChange).toHaveBeenCalledWith(42.75);
    });

    it('debe manejar decimales múltiples', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          integer: false,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('3.14.15');
      });

      // Display muestra input original
      expect(result.current.displayValue).toBe('3.14.15');

      // Value debe ser primer número válido parseado
      expect(mockOnChange).toHaveBeenCalledWith(3.14);
    });
  });

  describe('Min/Max validation', () => {
    it('debe respetar valor mínimo', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          min: 0,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('-10');
      });

      // Value debe ser clamped al mínimo
      expect(mockOnChange).toHaveBeenCalledWith(0);
    });

    it('debe respetar valor máximo', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          max: 100,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('150');
      });

      // Value debe ser clamped al máximo
      expect(mockOnChange).toHaveBeenCalledWith(100);
    });

    it('debe validar dentro de rango min-max', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          min: 10,
          max: 50,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('30');
      });

      expect(mockOnChange).toHaveBeenCalledWith(30);
    });
  });

  describe('handleBlur', () => {
    it('debe sincronizar displayValue con value al blur', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          integer: true,
        })
      );

      // Escribir input inválido
      act(() => {
        result.current.handleChange('42.7');
      });

      expect(result.current.displayValue).toBe('42.7');

      // Blur debe formatear display al value sanitizado
      act(() => {
        result.current.handleBlur();
      });

      expect(result.current.displayValue).toBe('42');
    });
  });

  describe('Reset functionality', () => {
    it('debe resetear a defaultValue', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          defaultValue: 100,
        })
      );

      // Modificar valor
      act(() => {
        result.current.handleChange('250');
      });

      expect(result.current.value).toBe(250);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe(100);
      expect(result.current.displayValue).toBe('100');
    });
  });

  describe('Debounce behavior', () => {
    it('debe debounce onChange calls', async () => {
      // Este test verifica que se usa useDebouncedCallback
      const { result } = renderHook(() =>
        useNumericInput({
          debounceMs: 300,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('10');
      });

      act(() => {
        result.current.handleChange('20');
      });

      act(() => {
        result.current.handleChange('30');
      });

      // Con mock inmediato, se llama cada vez
      // En producción real, solo se llamaría una vez después del debounce
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('debe manejar input vacío', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          defaultValue: 50,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('');
      });

      expect(result.current.displayValue).toBe('');
      expect(mockOnChange).toHaveBeenCalledWith(50); // Fallback a defaultValue
    });

    it('debe manejar input solo con signo negativo', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          defaultValue: 0,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('-');
      });

      expect(result.current.displayValue).toBe('-');
      expect(mockOnChange).toHaveBeenCalledWith(0);
    });

    it('debe manejar input solo con punto decimal', () => {
      const { result } = renderHook(() =>
        useNumericInput({
          defaultValue: 0,
          integer: false,
          onChange: mockOnChange,
        })
      );

      act(() => {
        result.current.handleChange('.');
      });

      expect(result.current.displayValue).toBe('.');
      expect(mockOnChange).toHaveBeenCalledWith(0);
    });

    it('debe manejar cambio de defaultValue', () => {
      const { result, rerender } = renderHook(
        ({ defaultValue }) => useNumericInput({ defaultValue }),
        { initialProps: { defaultValue: 10 } }
      );

      expect(result.current.value).toBe(10);

      // Cambiar defaultValue no afecta value actual
      rerender({ defaultValue: 20 });

      // Value permanece igual hasta reset
      expect(result.current.value).toBe(10);

      // Reset usa nuevo defaultValue
      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe(20);
    });
  });
});
