/**
 * @fileoverview Servicio para gestión de visitas en Firestore
 * 
 * Proporciona operaciones CRUD para visitas programadas, incluyendo
 * funcionalidades de conversión de timestamps, validación de datos
 * y manejo de datos de ejemplo para desarrollo.
 * 
 * @version 2.0.0
 * @author CalReact Team
 * @since 1.0.0
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  Firestore,
  Timestamp
} from 'firebase/firestore';
import { Visit, VisitStatus } from '@/types/visit';

// Re-exportar los tipos para compatibilidad
export type { Visit, VisitStatus };

/** Nombre de la colección de visitas en Firestore */
const VISITS_COLLECTION = 'visits';

/**
 * Agrega una nueva visita a Firestore
 */
/**
 * Convierte un Timestamp de Firestore a Date de forma segura
 * @param timestamp - Timestamp de Firestore o undefined
 * @returns Date convertido o undefined
 */
const convertTimestampToDate = (timestamp: any): Date | undefined => {
  if (!timestamp) return undefined;
  return timestamp instanceof Timestamp ? timestamp.toDate() : 
         timestamp.toDate ? timestamp.toDate() : 
         new Date();
};
export const addVisit = async (
  visitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'> & { address?: string; municipality?: string }, 
  firestore: Firestore = db
) => {
  try {
    const docRef = await addDoc(collection(firestore, VISITS_COLLECTION), {
      ...visitData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...visitData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al crear visita: ${errorMessage}`);
  }
};;

/**
 * Obtiene todas las visitas de Firestore
 */
export const getVisits = async (firestore: Firestore = db): Promise<Visit[]> => {
  try {
    const querySnapshot = await getDocs(collection(firestore, VISITS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: convertTimestampToDate(doc.data().scheduledDate),
      createdAt: convertTimestampToDate(doc.data().createdAt),
      updatedAt: convertTimestampToDate(doc.data().updatedAt),
    })) as Visit[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al cargar visitas: ${errorMessage}`);
  }
};;

/**
 * Actualiza una visita existente en Firestore
 */
export const updateVisit = async (
  visitId: string, 
  visitData: Partial<Omit<Visit, 'id' | 'createdAt'>>, 
  firestore: Firestore = db
): Promise<void> => {
  try {
    await updateDoc(doc(firestore, VISITS_COLLECTION, visitId), {
      ...visitData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al actualizar visita ${visitId}: ${errorMessage}`);
  }
};;

/**
 * Elimina una visita de Firestore
 */
export const deleteVisit = async (visitId: string, firestore: Firestore = db): Promise<void> => {
  try {
    await deleteDoc(doc(firestore, VISITS_COLLECTION, visitId));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al eliminar visita ${visitId}: ${errorMessage}`);
  }
};;

/**
 * Agrega visitas de ejemplo a Firestore
 * Solo se debe usar para desarrollo/pruebas
 */
export const seedExampleVisits = async (firestore: Firestore = db) => {
  const exampleVisits: Omit<Visit, 'id'>[] = [
    {
      name: 'Juan Pérez',
      phone: '+56 9 1234 5678',
      address: 'Av. Principal 1234, Santiago',
      municipality: 'Santiago',
      status: 'Agendada',
      scheduledDate: new Date(2025, 5, 20, 10, 30),
      observations: 'Cliente interesado en departamento de 2 dormitorios',
      createdAt: new Date(2025, 5, 15),
      updatedAt: new Date(2025, 5, 15),
    },
    {
      name: 'María González',
      phone: '+56 9 8765 4321',
      address: 'Calle Falsa 123, Providencia',
      municipality: 'Providencia',
      status: 'Ingresada',
      scheduledDate: new Date(2025, 5, 22, 15, 0),
      observations: 'Desea información sobre créditos hipotecarios',
      createdAt: new Date(2025, 5, 16),
      updatedAt: new Date(2025, 5, 16),
    },
    {
      name: 'Carlos Muñoz',
      phone: '+56 9 5555 1234',
      address: 'Los Aromos 456, Ñuñoa',
      municipality: 'Ñuñoa',
      status: 'Completada',
      scheduledDate: new Date(2025, 5, 18, 11, 0),
      observations: 'Visita completada con éxito, interesado en financiamiento',
      createdAt: new Date(2025, 5, 10),
      updatedAt: new Date(2025, 5, 18),
    },
  ];

  try {
    const existingVisits = await getVisits(firestore);
    if (existingVisits.length > 0) {
      return { success: false, message: 'Ya existen visitas en la base de datos' };
    }

    const results = [];
    for (const visit of exampleVisits) {
      const result = await addVisit(visit, firestore);
      results.push(result);
    }

    return { success: true, data: results };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Error al crear visitas de ejemplo: ${errorMessage}` };
  }
};;
