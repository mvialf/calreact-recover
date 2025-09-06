/**
 * @fileoverview Servicio para gestión de clientes
 * 
 * Este servicio implementa operaciones CRUD para clientes con optimizaciones
 * de rendimiento y mantenimiento de integridad referencial.
 * 
 * @version 1.1.0 - Optimizaciones Sprint 1.2
 * @since Enero 2025 - Fase 1 Core Services Refactoring
 * @author Sistema Cobralon-FB
 */

// src/services/clientService.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
  setDoc,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Client, ClientDocument } from '@/types/client';
import { getProjects, deleteProject } from './projectService';
import { docSnapshotToEntity } from '@/utils/firestore-helpers';

const CLIENTS_COLLECTION = 'clients';

// Interface for data used when importing or programmatically adding clients
export interface ClientImportData {
  id?: string; // If provided, this ID will be used for the document.
  name: string; // Name is required.
  phone?: string | null;
  email?: string | null;
  createdAt?: string | Date; // Can be a date string (from JSON) or a Date object.
}

const clientFromDoc = (docSnapshot: DocumentSnapshot): Client => {
  return docSnapshotToEntity<ClientDocument, Client>(
    docSnapshot,
    (data) => ({
      name: data.name,
      phone: data.phone === null ? undefined : (data.phone || undefined),
      email: data.email === null ? undefined : (data.email || undefined),
    })
  );
};


export const getClientById = async (clientId: string): Promise<Client | null> => {
  const clientDocRef = doc(db, CLIENTS_COLLECTION, clientId);
  const docSnap = await getDoc(clientDocRef);
  if (docSnap.exists()) {
    return clientFromDoc(docSnap);
  }
  return null;
};
/**
 * Obtiene solo el nombre del cliente por ID (optimizado para sincronización)
 * Reutiliza getClientById para eliminar duplicación de código con clientSyncService
 * @param clientId - ID del cliente
 * @returns Nombre del cliente o null si no existe
 */
export const getClientNameById = async (clientId: string): Promise<string | null> => {
  try {
    const client = await getClientById(clientId);
    return client?.name || null;
  } catch (error) {
    return null;
  }
};

export const getClients = async (): Promise<Client[]> => {
  const clientsCollectionRef = collection(db, CLIENTS_COLLECTION);
  const q = query(clientsCollectionRef, orderBy('name', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(clientFromDoc);
};

export const addClient = async (clientData: ClientImportData): Promise<Client> => {
  let createdAtTimestamp: Timestamp;
  if (clientData.createdAt) {
    try {
      const date = typeof clientData.createdAt === 'string' ? new Date(clientData.createdAt) : clientData.createdAt;
      if (isNaN(date.getTime())) {
        createdAtTimestamp = serverTimestamp() as Timestamp;
      } else {
        createdAtTimestamp = Timestamp.fromDate(date);
      }
    } catch (e) {
      createdAtTimestamp = serverTimestamp() as Timestamp;
    }
  } else {
    createdAtTimestamp = serverTimestamp() as Timestamp;
  }

  const dataToSave: Omit<ClientDocument, 'id'> = {
    name: clientData.name,
    // Firestore stores null as null, undefined means field is omitted
    phone: clientData.hasOwnProperty('phone') ? (clientData.phone === null ? undefined : clientData.phone) : undefined,
    email: clientData.hasOwnProperty('email') ? (clientData.email === null ? undefined : clientData.email) : undefined,
    createdAt: createdAtTimestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  let docRef;
  if (clientData.id) {
    // Use the provided ID
    docRef = doc(db, CLIENTS_COLLECTION, clientData.id);
    await setDoc(docRef, dataToSave);
  } else {
    // Let Firestore auto-generate an ID
    docRef = await addDoc(collection(db, CLIENTS_COLLECTION), dataToSave);
  }
  const newDocSnap = await getDoc(docRef);
  return clientFromDoc(newDocSnap);
};

export const updateClient = async (clientId: string, clientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const clientDocRef = doc(db, CLIENTS_COLLECTION, clientId);
  
  const dataToUpdate: Partial<ClientDocument> = {};

  if (clientData.hasOwnProperty('name')) {
    dataToUpdate.name = clientData.name;
  }
  // For phone and email, allow setting to null or a new string value
  if (clientData.hasOwnProperty('phone')) {
    dataToUpdate.phone = clientData.phone;
  }
  if (clientData.hasOwnProperty('email')) {
    dataToUpdate.email = clientData.email;
  }

  dataToUpdate.updatedAt = serverTimestamp() as Timestamp;

  await updateDoc(clientDocRef, dataToUpdate);
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const projectsToDelete = await getProjects(clientId);
  const deletePromises = projectsToDelete.map(project => deleteProject(project.id));
  await Promise.all(deletePromises);

  const clientDocRef = doc(db, CLIENTS_COLLECTION, clientId);
  await deleteDoc(clientDocRef);
};
