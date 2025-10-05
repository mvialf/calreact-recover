import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface UseOptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  rollbackDelay?: number;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook para optimistic UI updates con rollback automático
 *
 * @example
 * const { execute, isExecuting } = useOptimisticUpdate(
 *   (data) => createEvent(firestore, data),
 *   {
 *     successMessage: 'Evento creado',
 *     onSuccess: () => closeModal(),
 *   }
 * );
 */
export const useOptimisticUpdate = <T,>(
  mutationFn: (data: T) => Promise<void>,
  options: UseOptimisticUpdateOptions<T> = {}
) => {
  const {
    onSuccess,
    onError,
    rollbackDelay = 3000,
    successMessage = 'Operación exitosa',
    errorMessage = 'Error en la operación',
  } = options;

  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const execute = useCallback(
    async (data: T) => {
      setIsExecuting(true);
      setOptimisticData(data);

      try {
        await mutationFn(data);

        toast.success(successMessage);

        onSuccess?.(data);
      } catch (error) {
        // Rollback optimistic update
        setOptimisticData(null);

        toast.error(error instanceof Error ? error.message : errorMessage);

        onError?.(error as Error);
        throw error;
      } finally {
        setIsExecuting(false);
      }
    },
    [mutationFn, onSuccess, onError, successMessage, errorMessage]
  );

  return {
    execute,
    optimisticData,
    isExecuting,
    clearOptimistic: () => setOptimisticData(null),
  };
};
