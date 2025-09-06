/**
 * Exportaciones centralizadas de todos los custom hooks
 * 
 * Este archivo centraliza todas las exportaciones de hooks para facilitar
 * las importaciones y mantener consistencia en el proyecto.
 */

// Hooks de datos específicos del dominio
export { useProjectsData } from './useProjectsData';
export { usePaymentsData, type EnrichedPayment } from './usePaymentsData';
export { useTags, type UseTagsOptions, type UseTagsReturn } from './useTags';

// Hooks genéricos reutilizables
export { 
  useFirestoreDocument, 
  type UseFirestoreDocumentOptions, 
  type UseFirestoreDocumentReturn 
} from './useFirestoreDocument';

export { 
  useFormValidation, 
  type UseFormValidationOptions, 
  type UseFormValidationReturn 
} from './useFormValidation';

export { 
  useConfirmDialog, 
  type ConfirmDialogConfig, 
  type UseConfirmDialogReturn 
} from './useConfirmDialog';

export { 
  useDataSync, 
  type UseDataSyncOptions, 
  type UseDataSyncReturn 
} from './useDataSync';

// Re-exportar hooks específicos con nombres alternativos para compatibilidad
export { useProjectsData as useProjects } from './useProjectsData';
export { usePaymentsData as usePayments } from './usePaymentsData';