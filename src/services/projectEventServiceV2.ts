/**
 * @fileoverview Servicio mejorado para eventos de proyecto con cache inteligente
 * 
 * Versión optimizada que implementa referencias + cache para mejorar consistencia
 * y reducir duplicación de datos, manteniendo retrocompatibilidad con la versión actual.
 * 
 * @version 2.0.0
 * @since Septiembre 2025 - Sistema cache + referencias
 * @author Sistema Cobralon-FB Optimizado
 */

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
  getDoc,
  Firestore,
  DocumentSnapshot,
  writeBatch,
  QuerySnapshot,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { 
  ProjectEventType, 
  ProjectEventDocument, 
  ProjectType,
  ProjectEventLean,
  CreateProjectEventLeanData,
  ComposedProjectEvent,
  EventLeanFilters,
  EventLeanQueryOptions,
  EventLeanQueryResponse
} from '@/types/project';
import { createFirestoreFunction } from '@/lib/firebase/di';
import { 
  docSnapshotToEntity, 
  timestampToDate, 
  prepareDataForFirestore, 
  dateToTimestamp
} from '@/utils/firestore-helpers';
import { getProjectFromCache, invalidateProjectCache } from '@/services/cache/projectCacheService';
import { enrichEvent, enrichEvents, composeSimplifiedEvent } from '@/services/eventEnrichmentService';
import { eventLogger } from '@/lib/logger';

const logger = eventLogger;

/** Nombre de la colección de eventos de proyecto en Firestore */
const PROJECT_EVENTS_COLLECTION = 'projectEvents';

// === FUNCIONES DE CONVERSIÓN Y VALIDACIÓN ===

/**
 * Convierte un documento de Firestore a ProjectEventLean
 */
const projectEventLeanFromDoc = (docSnapshot: DocumentSnapshot): ProjectEventLean => {
  return docSnapshotToEntity<any, ProjectEventLean>(
    docSnapshot,
    (doc, id) => ({
      eventDate: timestampToDate(doc.eventDate),
      createdAt: doc.createdAt ? timestampToDate(doc.createdAt) : undefined,
      updatedAt: doc.updatedAt ? timestampToDate(doc.updatedAt) : undefined,
    })
  );
};
/**
 * Valida los datos de entrada para crear un evento lean
 */
const validateEventLeanInput = (eventData: CreateProjectEventLeanData): void => {
  if (!eventData.projectId) {
    throw new Error('ProjectId es requerido');
  }
  
  if (!eventData.eventDate || !(eventData.eventDate instanceof Date)) {
    throw new Error('EventDate debe ser una fecha válida');
  }
  
  if (!Array.isArray(eventData.checklist)) {
    throw new Error('Checklist debe ser un array válido');
  }
  
  // Validar items del checklist
  eventData.checklist.forEach((item, index) => {
    if (!item.id || !item.description) {
      throw new Error(`Item ${index} del checklist requiere id y description`);
    }
  });
};

/**
 * Sanitiza los datos de entrada para crear un evento lean
 */
const sanitizeEventLeanData = (
  eventData: CreateProjectEventLeanData
): Omit<ProjectEventLean, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    projectId: eventData.projectId.trim(),
    eventDate: eventData.eventDate,
    checklist: eventData.checklist.map(item => ({
      ...item,
      description: item.description.trim(),
      isCompleted: Boolean(item.isCompleted),
      notes: item.notes?.trim() || undefined
    })),
    customDescription: eventData.customDescription?.trim() || undefined,
    customPhone: eventData.customPhone?.trim() || undefined,
    customStatus: eventData.customStatus,
    eventNotes: eventData.eventNotes?.trim() || undefined
  };
};

// === FUNCIONES PRINCIPALES DEL SERVICIO ===

/**
 * Crea un nuevo evento de proyecto usando formato lean
 */
export const createProjectEventLean = async (
  eventData: CreateProjectEventLeanData,
  firestore: Firestore = db
): Promise<ProjectEventLean> => {
  const startTime = Date.now();
  
  try {
    // Validación de entrada
    validateEventLeanInput(eventData);
    logger.info('Creando evento lean', { projectId: eventData.projectId });
    
    // Verificar que el proyecto existe (usando cache)
    const project = await getProjectFromCache(eventData.projectId, firestore);
    if (!project) {
      throw new Error(`Proyecto ${eventData.projectId} no encontrado`);
    }
    
    // Sanitización de datos
    const sanitizedData = sanitizeEventLeanData(eventData);
    
    // Preparar documento para Firestore con timestamps automáticos
    const eventDoc = prepareDataForFirestore({
      ...sanitizedData,
      id: '', // Se asignará automáticamente
    });
    
    // Crear documento
    const docRef = await addDoc(collection(firestore, PROJECT_EVENTS_COLLECTION), eventDoc);
    
    const createdEvent: ProjectEventLean = {
      ...eventDoc,
      id: docRef.id,
      // Convertir Timestamps a Date para compatibilidad con tipo ProjectEventLean
      eventDate: eventDoc.eventDate instanceof Date ? eventDoc.eventDate : (eventDoc.eventDate as any).toDate(),
      createdAt: eventDoc.createdAt instanceof Date ? eventDoc.createdAt : (eventDoc.createdAt as any)?.toDate(),
      updatedAt: eventDoc.updatedAt instanceof Date ? eventDoc.updatedAt : (eventDoc.updatedAt as any)?.toDate(),
    };
    
    logger.info('Evento lean creado exitosamente', {
      eventId: docRef.id,
      projectId: eventData.projectId,
      duration: Date.now() - startTime
    });
    
    return createdEvent;
  } catch (error) {
    logger.error('Error creando evento lean', {
      projectId: eventData.projectId,
      error: error instanceof Error ? error.message : 'Error desconocido',
      duration: Date.now() - startTime
    });
    throw error;
  }
};

/**
 * Obtiene un evento lean por ID y lo compone con datos del proyecto
 */
export const getComposedProjectEvent = async (
  eventId: string,
  firestore: Firestore = db
): Promise<ComposedProjectEvent | null> => {
  const startTime = Date.now();
  
  try {
    logger.debug('Obteniendo evento compuesto', { eventId });
    
    // Obtener evento lean
    const eventDoc = await getDoc(doc(firestore, PROJECT_EVENTS_COLLECTION, eventId));
    if (!eventDoc.exists()) {
      logger.warn('Evento no encontrado', { eventId });
      return null;
    }
    
    const eventLean = projectEventLeanFromDoc(eventDoc);
    
    // Obtener datos del proyecto desde cache
    const project = await getProjectFromCache(eventLean.projectId, firestore);
    if (!project) {
      logger.error('Proyecto no encontrado para evento', {
        eventId,
        projectId: eventLean.projectId
      });
      throw new Error(`Proyecto ${eventLean.projectId} no encontrado`);
    }
    
    // Componer evento con datos del proyecto
    const composedEvent = composeEventWithProject(eventLean, project);
    
    logger.debug('Evento compuesto exitosamente', {
      eventId,
      projectId: eventLean.projectId,
      duration: Date.now() - startTime
    });
    
    return composedEvent;
  } catch (error) {
    logger.error('Error obteniendo evento compuesto', {
      eventId,
      error: error instanceof Error ? error.message : 'Error desconocido',
      duration: Date.now() - startTime
    });
    throw error;
  }
};

/**
 * Obtiene múltiples eventos con filtros y opciones de consulta
 */
export const getProjectEventsLean = async (
  filters: EventLeanFilters = {},
  options: EventLeanQueryOptions = {},
  firestore: Firestore = db
): Promise<EventLeanQueryResponse> => {
  const startTime = Date.now();
  
  try {
    logger.info('Consultando eventos lean', { filters, options });
    
    // Construir query base
    let eventQuery = query(collection(firestore, PROJECT_EVENTS_COLLECTION));
    
    // Aplicar filtros
    if (filters.projectIds && filters.projectIds.length > 0) {
      // Firestore limita "in" a 30 elementos
      if (filters.projectIds.length <= 30) {
        eventQuery = query(eventQuery, where('projectId', 'in', filters.projectIds));
      } else {
        logger.warn('Demasiados projectIds para filtro "in", aplicando solo los primeros 30');
        eventQuery = query(eventQuery, where('projectId', 'in', filters.projectIds.slice(0, 30)));
      }
    }
    
    if (filters.dateRange) {
      eventQuery = query(
        eventQuery,
        where('eventDate', '>=', dateToTimestamp(filters.dateRange.start)),
        where('eventDate', '<=', dateToTimestamp(filters.dateRange.end))
      );
    }
    
    // Aplicar ordenamiento
    const orderField = options.orderBy?.field || 'eventDate';
    const orderDirection = options.orderBy?.direction || 'desc';
    eventQuery = query(eventQuery, orderBy(orderField, orderDirection));
    
    // Aplicar límite
    if (options.limit) {
      eventQuery = query(eventQuery, limit(options.limit));
    }
    
    // Ejecutar consulta
    const querySnapshot = await getDocs(eventQuery);
    const events: ProjectEventLean[] = querySnapshot.docs.map(projectEventLeanFromDoc);
    
    // Enriquecer con datos del proyecto si se solicita
    let composedEvents: ComposedProjectEvent[] = [];
    let cacheHitRate = 0;
    
    if (options.includeProject !== false) {
      const startComposition = Date.now();
      
      // Obtener proyectos únicos
      const uniqueProjectIds = [...new Set(events.map(e => e.projectId))];
      const projects = new Map<string, ProjectType>();
      
      for (const projectId of uniqueProjectIds) {
        const project = await getProjectFromCache(projectId, firestore);
        if (project) {
          projects.set(projectId, project);
        }
      }
      
      // Componer eventos
      composedEvents = events
        .map(event => {
          const project = projects.get(event.projectId);
          return project ? composeEventWithProject(event, project) : null;
        })
        .filter((event): event is ComposedProjectEvent => event !== null);
      
      cacheHitRate = (projects.size / uniqueProjectIds.length) * 100;
      
      logger.debug('Composición completada', {
        eventsCount: events.length,
        composedCount: composedEvents.length,
        compositionTime: Date.now() - startComposition
      });
    }
    
    const executionTime = Date.now() - startTime;
    
    logger.info('Consulta lean completada', {
      eventsCount: events.length,
      composedCount: composedEvents.length,
      cacheHitRate: Math.round(cacheHitRate),
      executionTime
    });
    
    return {
      events: composedEvents,
      total: querySnapshot.size,
      hasNext: querySnapshot.size === (options.limit || 0),
      executionTime,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    };
  } catch (error) {
    logger.error('Error en consulta lean', {
      filters,
      options,
      error: error instanceof Error ? error.message : 'Error desconocido',
      duration: Date.now() - startTime
    });
    throw error;
  }
};

/**
 * Actualiza un evento lean existente
 */
export const updateProjectEventLean = async (
  eventId: string,
  updateData: Partial<Omit<ProjectEventLean, 'id' | 'createdAt' | 'updatedAt'>>,
  firestore: Firestore = db
): Promise<void> => {
  const startTime = Date.now();
  
  try {
    logger.info('Actualizando evento lean', { eventId });
    
    // Sanitizar datos de actualización
    const sanitizedUpdate: any = {};
    
    if (updateData.eventDate) {
      sanitizedUpdate.eventDate = dateToTimestamp(updateData.eventDate);
    }
    
    if (updateData.checklist) {
      sanitizedUpdate.checklist = updateData.checklist.map(item => ({
        ...item,
        description: item.description.trim(),
        isCompleted: Boolean(item.isCompleted)
      }));
    }
    
    if (updateData.customDescription !== undefined) {
      sanitizedUpdate.customDescription = updateData.customDescription?.trim() || null;
    }
    
    if (updateData.customPhone !== undefined) {
      sanitizedUpdate.customPhone = updateData.customPhone?.trim() || null;
    }
    
    if (updateData.customStatus !== undefined) {
      sanitizedUpdate.customStatus = updateData.customStatus;
    }
    
    if (updateData.eventNotes !== undefined) {
      sanitizedUpdate.eventNotes = updateData.eventNotes?.trim() || null;
    }
    
    // Agregar timestamp de actualización
    const finalUpdate = prepareDataForFirestore(sanitizedUpdate, true);
    
    // Actualizar documento
    await updateDoc(doc(firestore, PROJECT_EVENTS_COLLECTION, eventId), finalUpdate);
    
    logger.info('Evento lean actualizado exitosamente', {
      eventId,
      duration: Date.now() - startTime
    });
  } catch (error) {
    logger.error('Error actualizando evento lean', {
      eventId,
      error: error instanceof Error ? error.message : 'Error desconocido',
      duration: Date.now() - startTime
    });
    throw error;
  }
};

/**
 * Elimina un evento lean
 */
export const deleteProjectEventLean = async (
  eventId: string,
  firestore: Firestore = db
): Promise<void> => {
  const startTime = Date.now();
  
  try {
    logger.info('Eliminando evento lean', { eventId });
    
    await deleteDoc(doc(firestore, PROJECT_EVENTS_COLLECTION, eventId));
    
    logger.info('Evento lean eliminado exitosamente', {
      eventId,
      duration: Date.now() - startTime
    });
  } catch (error) {
    logger.error('Error eliminando evento lean', {
      eventId,
      error: error instanceof Error ? error.message : 'Error desconocido',
      duration: Date.now() - startTime
    });
    throw error;
  }
};

// === FUNCIONES DE UTILIDAD ===

/**
 * Compone un evento lean con datos del proyecto
 */
const composeEventWithProject = (
  eventLean: ProjectEventLean,
  project: ProjectType
): ComposedProjectEvent => {
  const now = new Date();
  
  return {
    // Identificación
    id: eventLean.id,
    projectId: eventLean.projectId,
    
    // Datos específicos del evento
    eventDate: eventLean.eventDate,
    checklist: eventLean.checklist,
    eventNotes: eventLean.eventNotes,
    
    // Datos compuestos (evento tiene prioridad)
    description: eventLean.customDescription || project.description || '',
    phone: eventLean.customPhone || project.phone || '',
    status: eventLean.customStatus || project.status,
    clientName: project.clientName || 'Cliente pendiente',
    fullAddress: project.fullAddress,
    windowsCount: project.windowsCount || 0,
    squareMeters: project.squareMeters || 0,
    uninstall: project.uninstall || false,
    uninstallTypes: project.uninstallTypes || [],
    uninstallOther: project.uninstallOther || '',
    glosa: project.glosa,
    
    // Metadata de composición
    composedAt: now,
    projectLastUpdated: project.updatedAt,
    dataSource: {
      description: eventLean.customDescription ? 'event' : 'project',
      phone: eventLean.customPhone ? 'event' : 'project',
      status: eventLean.customStatus ? 'event' : 'project'
    },
    
    // Metadata general
    createdAt: eventLean.createdAt,
    updatedAt: eventLean.updatedAt
  };
};

/**
 * Invalida cache de proyecto relacionado cuando se actualiza un evento
 */
const invalidateRelatedProjectCache = async (
  eventId: string,
  firestore: Firestore = db
): Promise<void> => {
  try {
    const eventDoc = await getDoc(doc(firestore, PROJECT_EVENTS_COLLECTION, eventId));
    if (eventDoc.exists()) {
      const event = projectEventLeanFromDoc(eventDoc);
      invalidateProjectCache(event.projectId);
      
      logger.debug('Cache de proyecto invalidado', {
        eventId,
        projectId: event.projectId
      });
    }
  } catch (error) {
    logger.warn('Error invalidando cache de proyecto', { eventId, error });
  }
};

// === FUNCIONES DE COMPATIBILIDAD ===

/**
 * Convierte un ProjectEventType legacy a ProjectEventLean
 */
export const convertLegacyToLean = (legacyEvent: ProjectEventType): ProjectEventLean => {
  return {
    id: legacyEvent.id,
    projectId: legacyEvent.projectId,
    eventDate: legacyEvent.eventDate,
    checklist: legacyEvent.checklist?.map(item => ({
      id: item.id,
      description: item.description,
      isCompleted: item.isCompleted,
      createdAt: item.createdAt,
      completedAt: item.completedAt
    })) || [],
    customDescription: legacyEvent.description,
    customPhone: legacyEvent.phone,
    customStatus: legacyEvent.status,
    eventNotes: legacyEvent.glosa,
    createdAt: legacyEvent.createdAt,
    updatedAt: legacyEvent.updatedAt
  };
};

// === EXPORTS PARA INTEGRACIÓN CON DI ===

export const createProjectEventLeanImpl = createFirestoreFunction(
  (firestore: Firestore, eventData: CreateProjectEventLeanData) => createProjectEventLean(eventData, firestore)
);
export const getComposedProjectEventImpl = createFirestoreFunction(
  (firestore: Firestore, eventId: string) => getComposedProjectEvent(eventId, firestore)
);
export const getProjectEventsLeanImpl = createFirestoreFunction(
  (firestore: Firestore, filters: EventLeanFilters = {}, options: EventLeanQueryOptions = {}) => getProjectEventsLean(filters, options, firestore)
);
export const updateProjectEventLeanImpl = createFirestoreFunction(
  (firestore: Firestore, eventId: string, updateData: Partial<Omit<ProjectEventLean, "id" | "createdAt" | "updatedAt">>) => updateProjectEventLean(eventId, updateData, firestore)
);
export const deleteProjectEventLeanImpl = createFirestoreFunction(
  (firestore: Firestore, eventId: string) => deleteProjectEventLean(eventId, firestore)
);
