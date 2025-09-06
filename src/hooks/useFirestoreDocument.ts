/**
 * Custom hook genérico para manejo de documentos Firestore
 * 
 * Proporciona funcionalidades comunes para operaciones CRUD con documentos
 * de Firestore usando React Query para caching y state management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import type { Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UseFirestoreDocumentOptions<T> {
  queryKey: string[];
  fetchFn: (firestore: Firestore, id?: string) => Promise<T[]>;
  addFn?: (firestore: Firestore, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
  updateFn?: (firestore: Firestore, id: string, data: Partial<T>) => Promise<T>;
  deleteFn?: (firestore: Firestore, id: string) => Promise<void>;
  onSuccess?: (operation: 'add' | 'update' | 'delete', data?: T) => void;
  onError?: (operation: 'add' | 'update' | 'delete', error: Error) => void;
  successMessages?: {
    add?: string;
    update?: string;
    delete?: string;
  };
  errorMessages?: {
    add?: string;
    update?: string;
    delete?: string;
  };
}

export interface UseFirestoreDocumentReturn<T> {
  // Datos
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Operaciones CRUD
  addItem: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, data: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Utilidades
  refetch: () => void;
  invalidate: () => void;
  
  // Estado de mutaciones
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isAnyMutating: boolean;
}

export const useFirestoreDocument = <T extends { id: string }>({
  queryKey,
  fetchFn,
  addFn,
  updateFn,
  deleteFn,
  onSuccess,
  onError,
  successMessages = {
    add: 'Elemento agregado exitosamente',
    update: 'Elemento actualizado exitosamente', 
    delete: 'Elemento eliminado exitosamente'
  },
  errorMessages = {
    add: 'Error al agregar elemento',
    update: 'Error al actualizar elemento',
    delete: 'Error al eliminar elemento'
  }
}: UseFirestoreDocumentOptions<T>): UseFirestoreDocumentReturn<T> => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const firestore = db;

  // Query para obtener datos
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<T[], Error>({
    queryKey,
    queryFn: () => fetchFn(firestore),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Función para invalidar caché
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  // Mutación para agregar
  const addMutation = useMutation({
    mutationFn: async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!addFn) throw new Error('Add function not provided');
      return addFn(firestore, data);
    },
    onSuccess: (data) => {
      toast({
        title: 'Éxito',
        description: successMessages.add,
      });
      invalidate();
      onSuccess?.('add', data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: errorMessages.add,
        variant: 'destructive',
      });
      onError?.('add', error);
    },
  });

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      if (!updateFn) throw new Error('Update function not provided');
      return updateFn(firestore, id, data);
    },
    onSuccess: (data) => {
      toast({
        title: 'Éxito',
        description: successMessages.update,
      });
      invalidate();
      onSuccess?.('update', data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: errorMessages.update,
        variant: 'destructive',
      });
      onError?.('update', error);
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!deleteFn) throw new Error('Delete function not provided');
      return deleteFn(firestore, id);
    },
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: successMessages.delete,
      });
      invalidate();
      onSuccess?.('delete');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: errorMessages.delete,
        variant: 'destructive',
      });
      onError?.('delete', error);
    },
  });

  // Funciones wrapper para las mutaciones
  const addItem = async (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addMutation.mutateAsync(data);
  };

  const updateItem = async (id: string, data: Partial<T>) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const deleteItem = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    // Datos
    data,
    isLoading,
    isError,
    error,
    
    // Operaciones CRUD
    addItem,
    updateItem,
    deleteItem,
    
    // Utilidades
    refetch,
    invalidate,
    
    // Estado de mutaciones
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAnyMutating: addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
};