/**
 * @fileoverview Servicio para gestión de postventa en Firestore
 * 
 * Proporciona operaciones CRUD para registros de servicio postventa asociados a proyectos.
 * Incluye funcionalidades de gestión de tareas, validación de datos y transformación 
 * de documentos Firestore.
 * 
 * @version 2.0.0
 * @author CalReact Team
 * @since 1.0.0
 */
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
  writeBatch,
  Firestore
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { AfterSales, AfterSalesDocument, TaskItem } from '@/types/afterSales';

/** Nombre de la colección de postventa en Firestore */
const AFTERSALES_COLLECTION = 'afterSales';

/**
 * Convierte un taskItem de documento Firestore a objeto TaskItem
 * @param taskDoc - Documento de tarea desde Firestore
 * @returns TaskItem con tipos y fechas convertidas
 */
const taskItemFromDoc = (taskDoc: any): TaskItem => ({
  ...taskDoc,
  id: taskDoc.id || crypto.randomUUID(),
  createdAt: taskDoc.createdAt instanceof Timestamp ? taskDoc.createdAt.toDate() : new Date(),
  completedAt: taskDoc.completedAt instanceof Timestamp ? taskDoc.completedAt.toDate() : undefined,
});

/**
 * Convierte un objeto TaskItem a formato para documento Firestore
 * @param task - TaskItem a convertir
 * @returns Objeto preparado para guardar en Firestore
 */
const taskItemToDoc = (task: TaskItem): Omit<TaskItem, 'createdAt' | 'completedAt'> & { 
  id: string;
  description: string;
  isCompleted: boolean;
  createdAt?: Timestamp; 
  completedAt?: Timestamp;
} => {
  const doc: any = {
    id: task.id || crypto.randomUUID(),
    description: task.description,
    isCompleted: task.isCompleted || false
  };
  
  if (task.createdAt) {
    doc.createdAt = Timestamp.fromDate(task.createdAt);
  }
  
  if (task.completedAt) {
    doc.completedAt = Timestamp.fromDate(task.completedAt);
  }
  
  return doc;
};

/**
 * Convierte un documento de Firestore a objeto AfterSales
 * @param docSnapshot - Snapshot del documento de Firestore
 * @returns Objeto AfterSales con tipos y fechas convertidas
 */
const afterSalesFromDoc = (docSnapshot: any): AfterSales => {
  const data = docSnapshot.data() as AfterSalesDocument;
  return {
    id: docSnapshot.id,
    ...data,
    entryDate: data.entryDate instanceof Timestamp ? data.entryDate.toDate() : new Date(),
    resolutionDate: data.resolutionDate instanceof Timestamp ? data.resolutionDate.toDate() : undefined,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    tasks: data.tasks?.map(taskItemFromDoc) || [],
  } as AfterSales;
};

/**
 * Prepara los datos de postventa para guardar en Firestore
 * Aplica valores por defecto y convierte tipos según sea necesario
 * @param afterSalesData - Datos originales de postventa
 * @returns Datos preparados para Firestore
 */
const prepareAfterSalesData = (afterSalesData: Omit<AfterSales, 'id' | 'createdAt' | 'updatedAt'>): Partial<AfterSalesDocument> => {
  const now = Timestamp.now();
  const entryDate = afterSalesData.entryDate ? Timestamp.fromDate(
    afterSalesData.entryDate instanceof Date ? afterSalesData.entryDate : new Date(afterSalesData.entryDate)
  ) : now;
  
  const dataToSave: Partial<AfterSalesDocument> = {
    projectId: afterSalesData.projectId,
    description: afterSalesData.description || '',
    afterSalesStatus: afterSalesData.afterSalesStatus || 'Ingresada',
    entryDate,
    createdAt: now,
    updatedAt: now,
    tasks: transformTasksForFirestore(afterSalesData.tasks || [])
  };

  // Agregar campos opcionales solo si están definidos
  if (afterSalesData.resolutionDate) {
    dataToSave.resolutionDate = Timestamp.fromDate(
      afterSalesData.resolutionDate instanceof Date ? afterSalesData.resolutionDate : new Date(afterSalesData.resolutionDate)
    );
  }

  ['assignedTo', 'notes', 'phone', 'address'].forEach(field => {
    if (afterSalesData[field as keyof typeof afterSalesData]) {
      (dataToSave as any)[field] = afterSalesData[field as keyof typeof afterSalesData];
    }
  });

  return dataToSave;
};

/**
 * Valida que los datos de postventa tengan los campos requeridos
 * @param data - Datos preparados para validar
 * @throws Error si faltan campos obligatorios
 */
const validateAfterSalesData = (data: Partial<AfterSalesDocument>): void => {
  if (!data.projectId) {
    throw new Error('projectId es requerido para crear postventa');
  }
  
  if (!data.description?.trim()) {
    throw new Error('description es requerida para crear postventa');
  }
};

/**
 * Transforma array de tareas para formato Firestore
 * @param tasks - Array de tareas originales
 * @returns Array de tareas transformadas para Firestore
 */
const transformTasksForFirestore = (tasks: TaskItem[]): any[] => {
  return tasks.map(task => ({
    id: task.id || crypto.randomUUID(),
    description: task.description,
    isCompleted: task.isCompleted || false,
    ...(task.createdAt && { 
      createdAt: task.createdAt instanceof Date ? Timestamp.fromDate(task.createdAt) : Timestamp.now() 
    }),
    ...(task.completedAt && {
      completedAt: task.completedAt instanceof Date ? Timestamp.fromDate(task.completedAt) : undefined
    })
  }));
};

/**
 * Guarda los datos de postventa en Firestore y retorna el documento creado
 * @param preparedData - Datos preparados para Firestore
 * @param firestore - Instancia de Firestore
 * @returns Promise con el objeto AfterSales creado
 */
const saveAfterSalesToFirestore = async (
  preparedData: Partial<AfterSalesDocument>, 
  firestore: Firestore
): Promise<AfterSales> => {
  const afterSalesCollectionRef = collection(firestore, AFTERSALES_COLLECTION);
  const docRef = await addDoc(afterSalesCollectionRef, preparedData);
  const newDocSnap = await getDoc(docRef);
  
  if (!newDocSnap.exists()) {
    throw new Error('No se pudo crear el documento de postventa');
  }
  
  return afterSalesFromDoc(newDocSnap);
};

/**
 * Prepara los datos para actualización en Firestore
 * @param afterSalesData - Datos parciales para actualizar
 * @returns Datos transformados para Firestore
 */
const prepareUpdateData = (afterSalesData: Partial<Omit<AfterSales, 'id' | 'createdAt' | 'updatedAt'>>): Partial<AfterSalesDocument> => {
  const dataToUpdate: Partial<AfterSalesDocument> = { ...afterSalesData } as Partial<AfterSalesDocument>;
  delete (dataToUpdate as any).id;
  
  dataToUpdate.updatedAt = serverTimestamp() as Timestamp;

  // Convertir fechas a Timestamp
  if (afterSalesData.hasOwnProperty('entryDate')) {
    dataToUpdate.entryDate = afterSalesData.entryDate ? Timestamp.fromDate(afterSalesData.entryDate) : undefined;
  }
  if (afterSalesData.hasOwnProperty('resolutionDate')) {
    dataToUpdate.resolutionDate = afterSalesData.resolutionDate ? Timestamp.fromDate(afterSalesData.resolutionDate) : undefined;
  }
  
  // Transformar tareas si están presentes
  if (afterSalesData.tasks) {
    dataToUpdate.tasks = afterSalesData.tasks.map(taskItemToDoc);
  } else if (afterSalesData.hasOwnProperty('tasks') && afterSalesData.tasks === null) {
    dataToUpdate.tasks = [];
  }

  return dataToUpdate;
};

// ===============================
// FUNCIONES PÚBLICAS EXPORTADAS
// ===============================

/**
 * Obtiene todos los registros de postventa para un proyecto específico
 * @param projectId - ID del proyecto
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promise con array de objetos AfterSales ordenados por fecha de entrada
 */
export const getAfterSalesForProject = async (projectId: string, firestore: Firestore = db): Promise<AfterSales[]> => {
  const afterSalesCollectionRef = collection(firestore, AFTERSALES_COLLECTION);
  const q = query(afterSalesCollectionRef, where('projectId', '==', projectId), orderBy('entryDate', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(afterSalesFromDoc);
};

/**
 * Obtiene un registro de postventa por su ID
 * @param afterSalesId - ID del registro de postventa
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promise con el objeto AfterSales o null si no existe
 */
export const getAfterSalesById = async (afterSalesId: string, firestore: Firestore = db): Promise<AfterSales | null> => {
  const afterSalesDocRef = doc(firestore, AFTERSALES_COLLECTION, afterSalesId);
  const docSnap = await getDoc(afterSalesDocRef);
  return docSnap.exists() ? afterSalesFromDoc(docSnap) : null;
};

/**
 * Crea un nuevo registro de postventa en Firestore
 * @param afterSalesData - Datos del servicio postventa (sin id, createdAt, updatedAt)
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promise con el objeto AfterSales creado
 */
export const addAfterSales = async (
  afterSalesData: Omit<AfterSales, 'id' | 'createdAt' | 'updatedAt'>,
  firestore: Firestore = db
): Promise<AfterSales> => {
  try {
    const preparedData = prepareAfterSalesData(afterSalesData);
    validateAfterSalesData(preparedData);
    return await saveAfterSalesToFirestore(preparedData, firestore);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al crear registro de postventa: ${errorMessage}`);
  }
};;

/**
 * Actualiza un registro de postventa existente en Firestore
 * @param afterSalesId - ID del registro de postventa a actualizar
 * @param afterSalesData - Datos parciales para actualizar
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promise<void>
 */
export const updateAfterSales = async (
  afterSalesId: string, 
  afterSalesData: Partial<Omit<AfterSales, 'id' | 'createdAt' | 'updatedAt'>>,
  firestore: Firestore = db
): Promise<void> => {
  try {
    const afterSalesDocRef = doc(firestore, AFTERSALES_COLLECTION, afterSalesId);
    const dataToUpdate = prepareUpdateData(afterSalesData);
    await updateDoc(afterSalesDocRef, dataToUpdate);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al actualizar postventa ${afterSalesId}: ${errorMessage}`);
  }
};;

/**
 * Elimina un registro de postventa por su ID
 * @param afterSalesId - ID del registro de postventa a eliminar
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promise<void>
 */
export const deleteAfterSales = async (afterSalesId: string, firestore: Firestore = db): Promise<void> => {
  try {
    const afterSalesDocRef = doc(firestore, AFTERSALES_COLLECTION, afterSalesId);
    await deleteDoc(afterSalesDocRef);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al eliminar postventa ${afterSalesId}: ${errorMessage}`);
  }
};;

/**
 * Elimina todos los registros de postventa asociados a un proyecto
 * @param projectId - ID del proyecto
 * @param firestore - Instancia de Firestore (opcional, usa db por defecto)
 * @returns Promise<void>
 */
export const deleteAfterSalesForProject = async (projectId: string, firestore: Firestore = db): Promise<void> => {
  try {
    const afterSalesCollectionRef = collection(firestore, AFTERSALES_COLLECTION);
    const q = query(afterSalesCollectionRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const batch = writeBatch(firestore);
    querySnapshot.docs.forEach(docSnapshot => {
      batch.delete(docSnapshot.ref);
    });
    await batch.commit();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al eliminar postventas del proyecto ${projectId}: ${errorMessage}`);
  }
};;