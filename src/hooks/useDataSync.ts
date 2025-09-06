/**
 * Custom hook para sincronización de datos en tiempo real
 * 
 * Proporciona funcionalidades comunes para sincronizar datos entre diferentes
 * colecciones de Firestore y mantener consistencia en la aplicación.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export interface UseDataSyncOptions {
  // Claves de query que deben invalidarse cuando los datos cambien
  relatedQueryKeys: string[][];
  
  // Función para detectar cambios en los datos
  changeDetector?: (currentData: any, previousData: any) => boolean;
  
  // Callback cuando se detecta un cambio
  onDataChange?: (newData: any, previousData: any) => void;
  
  // Configuración de auto-sync
  enableAutoSync?: boolean;
  syncInterval?: number; // en milisegundos
  
  // Configuración de notificaciones
  showNotifications?: boolean;
  notificationMessages?: {
    sync?: string;
    error?: string;
  };
}

export interface UseDataSyncReturn {
  // Estado
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: Error | null;
  
  // Funciones de control
  syncNow: () => Promise<void>;
  startAutoSync: () => void;
  stopAutoSync: () => void;
  clearSyncError: () => void;
  
  // Utilidades
  invalidateRelatedData: () => void;
  getSyncStatus: () => 'idle' | 'syncing' | 'error';
}

export const useDataSync = ({
  relatedQueryKeys,
  changeDetector,
  onDataChange,
  enableAutoSync = false,
  syncInterval = 30000, // 30 segundos por defecto
  showNotifications = false,
  notificationMessages = {
    sync: 'Datos sincronizados exitosamente',
    error: 'Error al sincronizar datos'
  }
}: UseDataSyncOptions): UseDataSyncReturn => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<any>(null);

  // Invalidar datos relacionados
  const invalidateRelatedData = useCallback(() => {
    relatedQueryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryClient, relatedQueryKeys]);

  // Función principal de sincronización
  const syncNow = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Invalidar todas las queries relacionadas para forzar refetch
      invalidateRelatedData();
      
      // Esperar a que se completen las queries
      await Promise.all(
        relatedQueryKeys.map(queryKey => 
          queryClient.ensureQueryData({ queryKey })
        )
      );

      setLastSyncTime(new Date());
      
      if (showNotifications && notificationMessages.sync) {
        toast({
          title: 'Sincronización',
          description: notificationMessages.sync,
        });
      }
    } catch (error) {
      const syncError = error instanceof Error ? error : new Error('Error de sincronización');
      setSyncError(syncError);
      
      if (showNotifications && notificationMessages.error) {
        toast({
          title: 'Error de sincronización',
          description: notificationMessages.error,
          variant: 'destructive',
        });
      }
      
      throw syncError;
    } finally {
      setIsSyncing(false);
    }
  }, [
    isSyncing, 
    invalidateRelatedData, 
    queryClient, 
    relatedQueryKeys, 
    showNotifications, 
    notificationMessages, 
    toast
  ]);

  // Iniciar auto-sync
  const startAutoSync = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      syncNow().catch(error => {
        console.error('Auto-sync error:', error);
      });
    }, syncInterval);
  }, [syncNow, syncInterval]);

  // Detener auto-sync
  const stopAutoSync = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Limpiar error de sincronización
  const clearSyncError = useCallback(() => {
    setSyncError(null);
  }, []);

  // Obtener estado de sincronización
  const getSyncStatus = useCallback((): 'idle' | 'syncing' | 'error' => {
    if (isSyncing) return 'syncing';
    if (syncError) return 'error';
    return 'idle';
  }, [isSyncing, syncError]);

  // Detectar cambios en los datos si se proporciona un detector
  useEffect(() => {
    if (!changeDetector || !onDataChange) return;

    const checkForChanges = () => {
      const currentData = relatedQueryKeys.map(queryKey => 
        queryClient.getQueryData(queryKey)
      );

      if (previousDataRef.current && changeDetector(currentData, previousDataRef.current)) {
        onDataChange(currentData, previousDataRef.current);
      }

      previousDataRef.current = currentData;
    };

    // Verificar cambios inmediatamente
    checkForChanges();

    // Configurar listener para cambios en el query client
    const unsubscribe = queryClient.getQueryCache().subscribe(checkForChanges);

    return unsubscribe;
  }, [queryClient, relatedQueryKeys, changeDetector, onDataChange]);

  // Manejar auto-sync
  useEffect(() => {
    if (enableAutoSync) {
      startAutoSync();
    } else {
      stopAutoSync();
    }

    return stopAutoSync;
  }, [enableAutoSync, startAutoSync, stopAutoSync]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopAutoSync();
    };
  }, [stopAutoSync]);

  return {
    // Estado
    isSyncing,
    lastSyncTime,
    syncError,
    
    // Funciones de control
    syncNow,
    startAutoSync,
    stopAutoSync,
    clearSyncError,
    
    // Utilidades
    invalidateRelatedData,
    getSyncStatus,
  };
};