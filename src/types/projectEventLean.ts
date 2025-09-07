import type { Timestamp } from 'firebase/firestore';
import type { ProjectStatus, FormattedAddress } from '@/types/project';

/**
 * Tipo lean para eventos de proyecto - Solo datos específicos del evento
 * Reemplazará gradualmente a ProjectEventType para reducir duplicación de datos
 */
export interface ProjectEventLean {
  id: string;
  projectId: string; // Referencia al proyecto - ÚNICA FUENTE DE VERDAD
  
  // === DATOS ESPECÍFICOS DEL EVENTO ===
  eventDate: Date; // Fecha específica del evento
  
  // Lista de verificación específica del evento
  checklist: ChecklistItem[];
  
  // === OVERRIDES OPCIONALES (solo si difieren del proyecto) ===
  // Estos campos anulan los del proyecto solo cuando son diferentes
  customDescription?: string; // Descripción específica para este evento
  customPhone?: string; // Teléfono específico para este evento
  customStatus?: ProjectStatus; // Estado específico para este evento (ej: "en_proceso" aunque proyecto esté "pendiente")
  eventNotes?: string; // Notas específicas del evento
  
  // === METADATA ===
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Item de checklist para eventos
 */
export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  priority?: 'low' | 'medium' | 'high'; // Prioridad del item
  category?: string; // Categoría del item (ej: "preparación", "ejecución", "finalización")
  assignedTo?: string; // ID del usuario asignado
  createdAt?: Date;
  completedAt?: Date;
  completedBy?: string; // ID del usuario que completó
  notes?: string; // Notas adicionales del item
}

/**
 * Helper type para documento de evento lean en Firestore
 */
export interface ProjectEventLeanDocument
  extends Omit<ProjectEventLean, 'id' | 'eventDate' | 'createdAt' | 'updatedAt'> {
  eventDate: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Tipo para la creación de nuevos eventos lean
 */
export interface CreateProjectEventLeanData
  extends Omit<ProjectEventLean, 'id' | 'createdAt' | 'updatedAt'> {
  // Todos los campos son requeridos excepto metadata
}

/**
 * Tipo híbrido para compatibilidad durante la migración
 * Permite trabajar con ambos formatos (legacy y lean)
 */
export interface ProjectEventHybrid {
  id: string;
  projectId: string;
  eventDate: Date;
  
  // Formato lean (preferido)
  lean?: {
    checklist: ChecklistItem[];
    customDescription?: string;
    customPhone?: string;
    customStatus?: ProjectStatus;
    eventNotes?: string;
  };
  
  // Formato legacy (para compatibilidad)
  legacy?: {
    description?: string;
    phone?: string;
    fullAddress?: FormattedAddress;
    status: ProjectStatus;
    windowsCount?: number;
    squareMeters?: number;
    uninstall?: boolean;
    uninstallTypes?: string[];
    uninstallOther?: string;
    clientName?: string;
    glosa?: string;
    checklist?: Array<{
      id: string;
      description: string;
      isCompleted: boolean;
      createdAt?: Date;
      completedAt?: Date;
    }>;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Configuración para la composición de eventos lean con datos de proyecto
 */
export interface EventCompositionConfig {
  includeProjectData: boolean; // Si incluir datos del proyecto en la respuesta
  prioritizeEventData: boolean; // Si priorizar datos del evento sobre proyecto
  fallbackToProject: boolean; // Si usar datos del proyecto como fallback
  cacheProjectData: boolean; // Si cachear datos del proyecto
}

/**
 * Resultado de la composición de un evento lean con datos del proyecto
 */
export interface ComposedProjectEvent {
  // === IDENTIFICACIÓN ===
  id: string;
  projectId: string;
  
  // === DATOS DEL EVENTO ===
  eventDate: Date;
  checklist: ChecklistItem[];
  eventNotes?: string;
  
  // === DATOS COMPUESTOS (evento + proyecto) ===
  description: string; // customDescription || project.description
  phone: string; // customPhone || project.phone
  status: ProjectStatus; // customStatus || project.status
  clientName: string; // project.clientName
  fullAddress?: FormattedAddress; // project.fullAddress
  windowsCount: number; // project.windowsCount
  squareMeters: number; // project.squareMeters
  uninstall: boolean; // project.uninstall
  uninstallTypes: string[]; // project.uninstallTypes
  uninstallOther: string; // project.uninstallOther
  glosa?: string; // project.glosa
  
  // === METADATA DE COMPOSICIÓN ===
  composedAt: Date; // Timestamp de composición
  projectLastUpdated?: Date; // Última actualización del proyecto
  dataSource: {
    description: 'event' | 'project';
    phone: 'event' | 'project';
    status: 'event' | 'project';
  };
  
  // === METADATA GENERAL ===
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Estadísticas de uso de eventos lean
 */
export interface EventLeanStats {
  totalEvents: number;
  leanEvents: number; // Eventos usando formato lean
  legacyEvents: number; // Eventos usando formato legacy
  hybridEvents: number; // Eventos con ambos formatos
  compositionHits: number; // Aciertos en composición de datos
  compositionMisses: number; // Fallos en composición de datos
  avgChecklistItems: number; // Promedio de items por checklist
  mostUsedCategories: Array<{ category: string; count: number }>;
}

/**
 * Filtros para consultar eventos lean
 */
export interface EventLeanFilters {
  projectIds?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: ProjectStatus[];
  hasChecklist?: boolean;
  checklistCompleted?: boolean; // Todos los items completados
  categories?: string[];
  assignedTo?: string;
  customFieldsOnly?: boolean; // Solo eventos con campos personalizados
}

/**
 * Opciones para la consulta de eventos lean
 */
export interface EventLeanQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: keyof ProjectEventLean;
    direction: 'asc' | 'desc';
  };
  includeProject?: boolean; // Si incluir datos del proyecto en la respuesta
  enrichWithCache?: boolean; // Si enriquecer con cache de proyecto
}

/**
 * Respuesta paginada de eventos lean
 */
export interface EventLeanQueryResponse {
  events: ComposedProjectEvent[];
  total: number;
  hasNext: boolean;
  nextCursor?: string;
  executionTime: number; // Tiempo de ejecución en ms
  cacheHitRate: number; // Tasa de aciertos del cache
}

/**
 * Template de checklist predefinido
 */
export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string; // ej: "instalación", "mantenimiento", "revisión"
  items: Array<{
    description: string;
    priority: 'low' | 'medium' | 'high';
    category?: string;
    estimatedMinutes?: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuración de migración desde formato legacy a lean
 */
export interface MigrationConfig {
  batchSize: number; // Tamaño del lote para migración
  preserveLegacyData: boolean; // Si mantener datos legacy como backup
  validateAfterMigration: boolean; // Si validar datos después de migrar
  createBackup: boolean; // Si crear backup antes de migrar
  migrationMode: 'test' | 'production'; // Modo de migración
}

/**
 * Resultado de migración de un lote de eventos
 */
export interface MigrationBatchResult {
  batchId: string;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    eventId: string;
    error: string;
  }>;
  startTime: Date;
  endTime: Date;
  duration: number; // En milisegundos
}

// === UTILIDADES DE TIPO ===

/**
 * Type guard para verificar si un evento es lean
 */
export const isProjectEventLean = (event: any): event is ProjectEventLean => {
  return typeof event === 'object' &&
         typeof event.id === 'string' &&
         typeof event.projectId === 'string' &&
         event.eventDate instanceof Date &&
         Array.isArray(event.checklist);
};

/**
 * Type guard para verificar si un evento está compuesto
 */
export const isComposedProjectEvent = (event: any): event is ComposedProjectEvent => {
  return isProjectEventLean(event) &&
         typeof event.clientName === 'string' &&
         typeof event.composedAt !== 'undefined';
};

/**
 * Extrae solo los datos específicos del evento (sin datos del proyecto)
 */
export type EventSpecificData = Pick<
  ProjectEventLean,
  'id' | 'projectId' | 'eventDate' | 'checklist' | 'customDescription' | 
  'customPhone' | 'customStatus' | 'eventNotes' | 'createdAt' | 'updatedAt'
>;

/**
 * Datos de override del evento (solo campos que pueden diferir del proyecto)
 */
export type EventOverrideData = Pick<
  ProjectEventLean,
  'customDescription' | 'customPhone' | 'customStatus' | 'eventNotes'
>;