/**
 * Barrel export para servicios
 * 
 * Centraliza las exportaciones de todos los servicios para facilitar
 * las importaciones y mantener consistencia.
 */

// ===== SERVICIOS PRINCIPALES =====

// Servicios de entidades principales
export * from './projectService';
export * from './clientService';
export * from './paymentService';
export * from './payment/batchPaymentService';
export * from './visitService';
export * from './afterSalesService';

// ===== SERVICIOS DE EVENTOS =====

// Servicios especializados de eventos
export * from './projectEventService';
export * from './calendarEventService';

// ===== SERVICIOS DE SOPORTE =====

// Servicios de sincronización y referencias
// export * from './clientSyncService'; // Temporalmente comentado - funciones consolidadas en clientService
export * from './eventReferenceService';

// ===== RE-EXPORTACIONES COMUNES =====

// Re-exportar las funciones más utilizadas con nombres más descriptivos
export { 
  getProjects as getAllProjects,
  getProjects as fetchProjects 
} from './projectService';

export { 
  getClients as getAllClients,
  getClients as fetchClients 
} from './clientService';

export { 
  getAllPayments as fetchAllPayments,
  getPaymentsForProject as fetchPaymentsByProject 
} from './paymentService';

export { 
  getVisits as getAllVisits,
  getVisits as fetchVisits 
} from './visitService';

export { 
  getAfterSalesForProject as getAllAfterSales,
  getAfterSalesById as fetchAfterSales 
} from './afterSalesService';