/**
 * @fileoverview Servicio para gestionar eventos de proyecto específicos
 * 
 * Este servicio implementa la arquitectura específica por dominio para eventos de proyecto,
 * proporcionando operaciones CRUD con validación, sanitización y sincronización automática
 * de datos de cliente.
 * 
 * @version 2.0.0
 * @since Enero 2025 - Refactorización arquitectura específica por dominio
 * @author Sistema Cobralon-FB
 */

// src/services/projectEventService.ts
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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { ProjectEventType, ProjectEventDocument, ProjectType } from '@/types/project';
import type {
  ProjectEventMinimal,
  CreateProjectEventData,
  ProjectSnapshot,
} from '@/types/projectEvent';
import type { ProjectEventMinimalDocument } from '@/types/projectEvent.document';
import { checklistItemToDocument } from '@/types/projectEvent.document';
import { createFirestoreFunction } from '@/lib/firebase/di';
import {
  docSnapshotToEntity,
  timestampToDate,
  prepareDataForFirestore,
  dateToTimestamp
} from '@/utils/firestore-helpers';
import { getProjectById } from './projectService';
import { syncSingleProjectClientName } from './clientSyncService';
import { validateProjectEventData, sanitizeProjectEventData } from '@/utils/eventValidation';
import { eventLogger } from '@/lib/logger';

/** Nombre de la colección de eventos de proyecto en Firestore */
const PROJECT_EVENTS_COLLECTION = 'projectEvents';

/**
 * Convierte un documento de Firestore a ProjectEventType
 */
const projectEventFromDoc = (docSnapshot: DocumentSnapshot): ProjectEventType => {
  return docSnapshotToEntity<ProjectEventDocument, ProjectEventType>(
    docSnapshot,
    (data, id) => ({
      eventDate: timestampToDate(data.eventDate),
    })
  );
};

/**
 * Implementación interna de getProjectEvents con inyección de dependencias
 * @param firestore - Instancia de Firestore
 * @param projectId - ID del proyecto para filtrar eventos (opcional)
 * @returns Promesa con el array de eventos de proyecto
 */
const getProjectEventsImpl = async (
  firestore: Firestore, 
  projectId?: string
): Promise<ProjectEventType[]> => {
  const eventsCollectionRef = collection(firestore, PROJECT_EVENTS_COLLECTION);
  let q;
  
  if (projectId) {
    q = query(
      eventsCollectionRef, 
      where('projectId', '==', projectId),
      orderBy('eventDate', 'desc')
    );
  } else {
    q = query(eventsCollectionRef, orderBy('eventDate', 'desc'));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(projectEventFromDoc);
};

/**
 * Obtiene todos los eventos de proyecto, opcionalmente filtrados por proyecto
 * Soporta inyección de dependencias mediante getProjectEvents.withFirestore(firestore, projectId)
 * @param projectId - ID del proyecto para filtrar eventos (opcional)
 * @returns Promesa con el array de eventos de proyecto
 */
export const getProjectEvents = createFirestoreFunction(getProjectEventsImpl);

/**
 * Obtiene un evento de proyecto por su ID
 * @param eventId - ID del evento
 * @returns Promesa con el evento o null si no existe
 */
export const getProjectEventById = async (eventId: string): Promise<ProjectEventType | null> => {
  const eventDocRef = doc(db, PROJECT_EVENTS_COLLECTION, eventId);
  const docSnap = await getDoc(eventDocRef);
  
  if (docSnap.exists()) {
    return projectEventFromDoc(docSnap);
  }
  return null;
};

/**
 * Crea un nuevo evento de proyecto con sincronización automática de cliente
 * 
 * @description
 * Esta función implementa un flujo completo de creación de eventos de proyecto:
 * 1. Valida los datos del evento usando reglas de negocio específicas
 * 2. Obtiene y valida la existencia del proyecto padre
 * 3. Sincroniza automáticamente el nombre del cliente si es necesario
 * 4. Sanitiza y normaliza los datos del evento
 * 5. Guarda el evento en Firestore con timestamps automáticos
 * 
 * @example
 * ```typescript
 * const newEvent = await createProjectEvent({
 *   projectId: 'project-123',
 *   eventDate: new Date('2025-02-15'),
 *   description: 'Instalación programada',
 *   phone: '+56912345678',
 *   fullAddress: {
 *     textoCompleto: 'Av. Providencia 123, Santiago',
 *     coordenadas: { latitude: -33.4489, longitude: -70.6693 },
 *     placeId: 'place-123',
 *     comune: 'Providencia'
 *   },
 *   status: 'cotizado',
 *   windowsCount: 5,
 *   squareMeters: 25.5,
 *   uninstall: false
 * });
 * ```
 * 
 * @param eventData - Datos del evento sin id, createdAt, updatedAt
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promesa que resuelve con el evento creado incluyendo id y timestamps
 * 
 * @throws {Error} Cuando los datos del evento son inválidos
 * @throws {Error} Cuando el proyecto padre no existe
 * @throws {Error} Cuando falla la operación de guardado en Firestore
 * 
 * @since v2.0.0 - Arquitectura específica por dominio
 */
/**
 * Valida los datos de entrada del evento
 * @private
 */
const validateEventInput = (eventData: Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'>): void => {
  const validation = validateProjectEventData(eventData);
  if (!validation.isValid) {
    throw new Error(`Datos del evento inválidos: ${validation.errors.join(', ')}`);
  }
  if (!eventData.projectId) {
    throw new Error('ID del proyecto es requerido');
  }
};

/**
 * Obtiene y valida los datos del proyecto padre
 * @private
 */
const fetchProjectData = async (projectId: string): Promise<ProjectType> => {
  const projectData = await getProjectById(projectId);
  if (!projectData) {
    throw new Error(`Proyecto ${projectId} no encontrado`);
  }
  return projectData;
};

/**
 * Sincroniza el nombre del cliente si es necesario
 * @private
 */
const ensureClientNameSync = async (
  projectData: ProjectType,
  projectId: string,
  firestore: Firestore
): Promise<ProjectType> => {
  if (projectData.clientId && !projectData.clientName) {
    await syncSingleProjectClientName(projectId, firestore);
    const updatedProject = await getProjectById(projectId);
    return updatedProject || projectData;
  }
  return projectData;
};

/**
 * Persiste el evento en Firestore
 * @private
 */
const persistEventToFirestore = async (
  sanitizedData: any,
  firestore: Firestore
): Promise<ProjectEventType> => {
  const baseData = {
    ...sanitizedData,
    eventDate: dateToTimestamp(sanitizedData.eventDate),
  };
  
  const dataToSave = prepareDataForFirestore(baseData);
  const eventsCollectionRef = collection(firestore, PROJECT_EVENTS_COLLECTION);
  const docRef = await addDoc(eventsCollectionRef, dataToSave);
  const newDocSnap = await getDoc(docRef);
  
  return projectEventFromDoc(newDocSnap);
};

/**
 * Crea un nuevo evento de proyecto con validación, sanitización y sincronización automática
 * 
 * @param eventData - Datos del evento a crear (sin id, createdAt, updatedAt)
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promise que resuelve con el evento creado
 * 
 * @throws {Error} Cuando los datos del evento son inválidos
 * @throws {Error} Cuando el proyecto padre no existe
 * @throws {Error} Cuando falla la operación de guardado en Firestore
 * 
 * @since v2.0.0 - Arquitectura específica por dominio
 * @version 2.1.0 - Refactorizado aplicando principios SOLID
 */
export const createProjectEvent = async (
  eventData: Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'>,
  firestore: Firestore = db
): Promise<ProjectEventType> => {
  try {
    eventLogger.debug('Iniciando creación de evento de proyecto', { 
      projectId: eventData.projectId 
    });
    
    // 1. Validar datos de entrada
    validateEventInput(eventData);
    
    // 2. Obtener datos del proyecto padre
    let projectData = await fetchProjectData(eventData.projectId);
    
    // 3. Sincronizar nombre del cliente si es necesario
    projectData = await ensureClientNameSync(projectData, eventData.projectId, firestore);
    
    // 4. Sanitizar y normalizar datos
    const sanitizedData = sanitizeProjectEventData(eventData, projectData);
    
    // 5. Guardar en Firestore
    const createdEvent = await persistEventToFirestore(sanitizedData, firestore);
    
    eventLogger.info('Evento de proyecto creado exitosamente', { 
      eventId: createdEvent.id,
      projectId: eventData.projectId
    });
    
    return createdEvent;
    
  } catch (error) {
    eventLogger.error('Error al crear evento de proyecto', error);
    throw error;
  }
};

// ============================================================================
// NUEVA ARQUITECTURA MINIMALISTA CON SNAPSHOT INMUTABLE
// ============================================================================

/**
 * Crea snapshot inmutable del proyecto para el evento
 * @private
 */
const createProjectSnapshot = (project: ProjectType): ProjectSnapshot => {
  return {
    projectNumber: project.projectNumber,
    clientName: project.clientName || '',
    glosa: project.glosa,
    comuna: project.fullAddress?.componentes?.comuna,
    status: project.status,
  };
};

/**
 * Crea un nuevo evento de proyecto con arquitectura de snapshot minimalista
 *
 * @description
 * Nueva implementación que usa ProjectEventMinimal con snapshot inmutable.
 * El snapshot captura el estado del proyecto AL MOMENTO de crear el evento,
 * garantizando inmutabilidad histórica.
 *
 * Flujo:
 * 1. Valida projectId
 * 2. Obtiene proyecto padre
 * 3. Sincroniza clientName si es necesario
 * 4. Crea snapshot inmutable del proyecto
 * 5. Construye evento con snapshot
 * 6. Guarda en Firestore con timestamps automáticos
 *
 * @example
 * ```typescript
 * const newEvent = await createProjectEventMinimal({
 *   projectId: 'project-123',
 *   eventDate: new Date('2025-02-15'),
 *   checklist: [],
 *   eventNotes: 'Instalación programada 9:00 AM',
 *   customPhone: '+56912345678'
 * });
 * ```
 *
 * @param eventData - Datos del evento (sin id, snapshot, ni metadata)
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promise que resuelve con el evento creado completo
 *
 * @throws {Error} Cuando projectId no existe
 * @throws {Error} Cuando falla la operación de guardado
 *
 * @since v3.0.0 - Arquitectura minimalista con snapshot
 */
export const createProjectEventMinimal = async (
  eventData: CreateProjectEventData,
  firestore: Firestore = db
): Promise<ProjectEventMinimal> => {
  try {
    eventLogger.debug('Creando evento con arquitectura minimalista', {
      projectId: eventData.projectId,
    });

    // 1. Validar projectId
    if (!eventData.projectId) {
      throw new Error('ID del proyecto es requerido');
    }

    // 2. Obtener proyecto padre
    let project = await getProjectById(eventData.projectId);
    if (!project) {
      throw new Error(`Proyecto ${eventData.projectId} no encontrado`);
    }

    // 3. Sincronizar clientName si es necesario
    if (project.clientId && !project.clientName) {
      await syncSingleProjectClientName(eventData.projectId, firestore);
      const updatedProject = await getProjectById(eventData.projectId);
      project = updatedProject || project;
    }

    // 4. Crear snapshot inmutable del proyecto
    const projectSnapshot = createProjectSnapshot(project);

    // 5. Construir evento completo con snapshot
    const eventToSave: Omit<ProjectEventMinimal, 'id'> = {
      projectId: eventData.projectId,
      eventDate: eventData.eventDate,
      checklist: eventData.checklist,
      eventNotes: eventData.eventNotes,
      customPhone: eventData.customPhone,
      projectSnapshot,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 6. Convertir a formato Firestore
    const docData: ProjectEventMinimalDocument = {
      projectId: eventToSave.projectId,
      eventDate: Timestamp.fromDate(eventToSave.eventDate),
      checklist: eventToSave.checklist.map(checklistItemToDocument),
      eventNotes: eventToSave.eventNotes,
      customPhone: eventToSave.customPhone,
      projectSnapshot: eventToSave.projectSnapshot,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    // 7. Guardar en Firestore
    const eventsRef = collection(firestore, PROJECT_EVENTS_COLLECTION);
    const docRef = await addDoc(eventsRef, docData);

    // 8. Obtener documento creado
    const createdDoc = await getDoc(docRef);
    const createdData = createdDoc.data() as ProjectEventMinimalDocument;

    const newEvent: ProjectEventMinimal = {
      id: docRef.id,
      projectId: createdData.projectId,
      eventDate: createdData.eventDate.toDate(),
      checklist: eventToSave.checklist, // Ya están en formato correcto
      eventNotes: createdData.eventNotes,
      customPhone: createdData.customPhone,
      projectSnapshot: createdData.projectSnapshot,
      createdAt: createdData.createdAt?.toDate(),
      updatedAt: createdData.updatedAt?.toDate(),
    };

    eventLogger.info('Evento minimalista creado exitosamente', {
      eventId: newEvent.id,
      projectId: eventData.projectId,
    });

    return newEvent;
  } catch (error) {
    eventLogger.error('Error al crear evento minimalista', error);
    throw error;
  }
};

/**
 * Actualiza un evento de proyecto con validación
 * @param eventId - ID del evento
 * @param eventData - Datos parciales para actualizar
 * @param firestore - Instancia de Firestore (opcional)
 * @returns Promesa que se resuelve cuando se completa la actualización
 */
/**
 * Valida los datos de actualización del evento
 * @private
 */
const validateUpdateData = (
  currentEvent: ProjectEventType, 
  eventData: Partial<Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'>>
): void => {
  const mergedData = { ...currentEvent, ...eventData };
  const validation = validateProjectEventData(mergedData);
  
  if (!validation.isValid) {
    throw new Error(`Datos de actualización inválidos: ${validation.errors.join(', ')}`);
  }
};

/**
 * Prepara los datos para actualización en Firestore
 * @private
 */
const prepareUpdateData = (
  eventData: Partial<Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'>>
): { [key: string]: any } => {
  const dataToUpdate: { [key: string]: any } = { ...eventData };
  
  // Convertir eventDate a Timestamp si es un Date object
  if (dataToUpdate.eventDate && dataToUpdate.eventDate instanceof Date) {
    dataToUpdate.eventDate = dateToTimestamp(dataToUpdate.eventDate);
  }
  
  // Validar campos numéricos
  if (dataToUpdate.windowsCount !== undefined) {
    dataToUpdate.windowsCount = Math.max(0, Math.floor(Number(dataToUpdate.windowsCount) || 0));
  }
  
  if (dataToUpdate.squareMeters !== undefined) {
    dataToUpdate.squareMeters = Math.max(0, Number(dataToUpdate.squareMeters) || 0);
  }
  
  dataToUpdate.updatedAt = serverTimestamp();
  return dataToUpdate;
};

/**
 * Actualiza un evento de proyecto con validación
 * @param eventId - ID del evento
 * @param eventData - Datos parciales para actualizar
 * @param firestore - Instancia de Firestore (opcional)
 * @returns Promesa que se resuelve cuando se completa la actualización
 * @version 2.1.0 - Refactorizado aplicando principios SOLID
 */
export const updateProjectEvent = async (
  eventId: string, 
  eventData: Partial<Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'>>,
  firestore: Firestore = db
): Promise<void> => {
  try {
    // 1. Obtener evento actual
    const currentEvent = await getProjectEventById(eventId);
    if (!currentEvent) {
      throw new Error(`Evento ${eventId} no encontrado`);
    }
    
    // 2. Validar datos de actualización
    validateUpdateData(currentEvent, eventData);
    
    // 3. Preparar datos para actualizar
    const dataToUpdate = prepareUpdateData(eventData);
    
    // 4. Actualizar en Firestore
    const eventDocRef = doc(firestore, PROJECT_EVENTS_COLLECTION, eventId);
    await updateDoc(eventDocRef, dataToUpdate);
    
  } catch (error) {
    throw error;
  }
};

/**
 * Elimina un evento de proyecto
 * @param eventId - ID del evento a eliminar
 * @param firestore - Instancia de Firestore (opcional)
 * @returns Promesa que se resuelve cuando se completa la eliminación
 */
export const deleteProjectEvent = async (
  eventId: string,
  firestore: Firestore = db
): Promise<void> => {
  
  try {
    // Verificar que el evento existe antes de eliminarlo
    const eventExists = await getProjectEventById(eventId);
    if (!eventExists) {
      throw new Error(`Evento ${eventId} no encontrado`);
    }
    
    const eventDocRef = doc(firestore, PROJECT_EVENTS_COLLECTION, eventId);
    await deleteDoc(eventDocRef);
    
    
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene todos los eventos de un proyecto específico con información enriquecida
 * @param projectId - ID del proyecto
 * @param firestore - Instancia de Firestore (opcional)
 * @returns Promesa con el array de eventos del proyecto
 */
export const getProjectEventsByProjectId = async (
  projectId: string,
  firestore: Firestore = db
): Promise<ProjectEventType[]> => {
  
  try {
    const events = await getProjectEvents.withFirestore(firestore, projectId);
    return events;
  } catch (error) {
    throw error;
  }
};

/**
 * Cuenta el número de eventos de un proyecto
 * @param projectId - ID del proyecto
 * @param firestore - Instancia de Firestore (opcional)
 * @returns Promesa con el número de eventos
 */
export const countProjectEvents = async (
  projectId: string,
  firestore: Firestore = db
): Promise<number> => {
  try {
    const events = await getProjectEventsByProjectId(projectId, firestore);
    return events.length;
  } catch (error) {
    return 0;
  }
};