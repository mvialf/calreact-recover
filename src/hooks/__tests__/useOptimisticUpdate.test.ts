import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticUpdate } from '../useOptimisticUpdate';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/components/ui/use-toast');

describe('useOptimisticUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe ejecutar mutación exitosamente con optimistic update', async () => {
    // Arrange
    const mockMutation = jest.fn().mockResolvedValue(undefined);
    const mockData = { id: '1', name: 'Test Event' };

    const { result } = renderHook(() =>
      useOptimisticUpdate(mockMutation, {
        successMessage: 'Evento creado exitosamente',
      })
    );

    // Act
    await act(async () => {
      await result.current.execute(mockData);
    });

    // Assert
    expect(mockMutation).toHaveBeenCalledWith(mockData);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '✓ Éxito',
        description: 'Evento creado exitosamente',
        variant: 'default',
      })
    );
  });

  it('debe hacer rollback en caso de error', async () => {
    // Arrange
    const mockError = new Error('Network error');
    const mockMutation = jest.fn().mockRejectedValue(mockError);
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useOptimisticUpdate(mockMutation, {
        onError: mockOnError,
        errorMessage: 'Error al crear evento',
      })
    );

    // Act
    await act(async () => {
      try {
        await result.current.execute({ id: '1' });
      } catch (error) {
        // Expected error
      }
    });

    // Assert
    expect(result.current.optimisticData).toBeNull();
    expect(mockOnError).toHaveBeenCalledWith(mockError);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '✗ Error',
        description: 'Network error',
        variant: 'destructive',
      })
    );
  });

  it('debe gestionar estado isExecuting correctamente', async () => {
    // Arrange
    const mockMutation = jest.fn(
      () => new Promise<void>((resolve) => setTimeout(() => resolve(), 100))
    );

    const { result } = renderHook(() => useOptimisticUpdate(mockMutation));

    // Assert - Estado inicial
    expect(result.current.isExecuting).toBe(false);

    // Act - Iniciar ejecución
    act(() => {
      result.current.execute({ id: '1' });
    });

    // Assert - Durante ejecución
    expect(result.current.isExecuting).toBe(true);

    // Assert - Después de completar
    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });
  });

  it('debe actualizar optimisticData durante ejecución', async () => {
    // Arrange
    const mockMutation = jest.fn().mockResolvedValue(undefined);
    const mockData = { id: '1', name: 'Test' };

    const { result } = renderHook(() => useOptimisticUpdate(mockMutation));

    // Assert - Estado inicial
    expect(result.current.optimisticData).toBeNull();

    // Act
    await act(async () => {
      await result.current.execute(mockData);
    });

    // Assert - optimisticData no se limpia después de éxito
    // (queda el último valor ejecutado)
    expect(result.current.optimisticData).toEqual(mockData);
  });

  it('debe llamar callback onSuccess después de mutación exitosa', async () => {
    // Arrange
    const mockMutation = jest.fn().mockResolvedValue(undefined);
    const mockOnSuccess = jest.fn();
    const mockData = { id: '1' };

    const { result } = renderHook(() =>
      useOptimisticUpdate(mockMutation, {
        onSuccess: mockOnSuccess,
      })
    );

    // Act
    await act(async () => {
      await result.current.execute(mockData);
    });

    // Assert
    expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
  });

  it('debe limpiar optimisticData cuando se llama clearOptimistic', () => {
    // Arrange
    const mockMutation = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useOptimisticUpdate(mockMutation));

    // Act - Ejecutar para tener datos optimistas
    act(() => {
      result.current.execute({ id: '1' });
    });

    // Assert - Verificar que hay datos
    expect(result.current.optimisticData).toEqual({ id: '1' });

    // Act - Limpiar
    act(() => {
      result.current.clearOptimistic();
    });

    // Assert - Verificar limpieza
    expect(result.current.optimisticData).toBeNull();
  });

  it('debe usar mensajes por defecto si no se proporcionan', async () => {
    // Arrange
    const mockMutation = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useOptimisticUpdate(mockMutation));

    // Act
    await act(async () => {
      await result.current.execute({ id: '1' });
    });

    // Assert
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Operación exitosa',
      })
    );
  });

  it('debe propagar el error después de rollback', async () => {
    // Arrange
    const mockError = new Error('Test error');
    const mockMutation = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useOptimisticUpdate(mockMutation));

    // Act & Assert
    await expect(
      act(async () => {
        await result.current.execute({ id: '1' });
      })
    ).rejects.toThrow('Test error');
  });
});
