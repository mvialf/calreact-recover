// src/services/clientSyncService.ts
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  Firestore,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { ProjectType } from '@/types/project';
import type { Client } from '@/types/client';

const PROJECTS_COLLECTION = 'projects';
const CLIENTS_COLLECTION = 'clients';

/**
 * Sincroniza el clientName en todos los proyectos basándose en clientId
 * @param firestore - Instancia de Firestore
 * @returns Número de proyectos actualizados
 */
export const syncProjectClientNames = async (firestore: Firestore = db): Promise<number> => {
  
  try {
    // 1. Obtener todos los clientes
    const clientsRef = collection(firestore, CLIENTS_COLLECTION);
    const clientsSnapshot = await getDocs(clientsRef);
    
    const clientsMap = new Map<string, string>();
    clientsSnapshot.docs.forEach(doc => {
      const clientData = doc.data() as Client;
      clientsMap.set(doc.id, clientData.name);
    });
    
    
    // 2. Obtener todos los proyectos
    const projectsRef = collection(firestore, PROJECTS_COLLECTION);
    const projectsSnapshot = await getDocs(projectsRef);
    
    // 3. Identificar proyectos que necesitan sincronización
    const projectsToUpdate: Array<{ id: string, clientName: string, clientId: string }> = [];
    
    projectsSnapshot.docs.forEach(doc => {
      const projectData = doc.data() as ProjectType;
      const currentClientName = projectData.clientName;
      const clientId = projectData.clientId;
      
      if (clientId && clientsMap.has(clientId)) {
        const correctClientName = clientsMap.get(clientId)!;
        
        // Solo actualizar si el nombre no existe o es diferente
        if (!currentClientName || currentClientName !== correctClientName) {
          projectsToUpdate.push({
            id: doc.id,
            clientName: correctClientName,
            clientId: clientId
          });
        }
      }
    });
    
    
    // 4. Actualizar proyectos en batch
    if (projectsToUpdate.length > 0) {
      const batch = writeBatch(firestore);
      
      projectsToUpdate.forEach(({ id, clientName }) => {
        const projectRef = doc(firestore, PROJECTS_COLLECTION, id);
        batch.update(projectRef, { 
          clientName,
          updatedAt: new Date()
        });
      });
      
      await batch.commit();
    }
    
    return projectsToUpdate.length;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el nombre del cliente por su ID, con caché local
 * @param clientId - ID del cliente
 * @param firestore - Instancia de Firestore
 * @returns Nombre del cliente o null si no existe
 */
export const getClientNameById = async (
  clientId: string, 
  firestore: Firestore = db
): Promise<string | null> => {
  try {
    const clientRef = doc(firestore, CLIENTS_COLLECTION, clientId);
    const clientDoc = await getDoc(clientRef);
    
    if (clientDoc.exists()) {
      const clientData = clientDoc.data() as Client;
      return clientData.name;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Sincroniza un proyecto específico con el nombre de su cliente
 * @param projectId - ID del proyecto
 * @param firestore - Instancia de Firestore
 * @returns True si se actualizó, false si no fue necesario
 */
export const syncSingleProjectClientName = async (
  projectId: string,
  firestore: Firestore = db
): Promise<boolean> => {
  try {
    // 1. Obtener el proyecto
    const projectRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      throw new Error(`Proyecto ${projectId} no encontrado`);
    }
    
    const projectData = projectDoc.data() as ProjectType;
    
    // 2. Verificar si necesita sincronización
    if (!projectData.clientId) {
      return false;
    }
    
    // 3. Obtener nombre del cliente
    const clientName = await getClientNameById(projectData.clientId, firestore);
    
    if (!clientName) {
      return false;
    }
    
    // 4. Actualizar si es necesario
    if (projectData.clientName !== clientName) {
      await updateDoc(projectRef, {
        clientName,
        updatedAt: new Date()
      });
      
      return true;
    }
    
    return false;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Valida que un proyecto tenga información de cliente válida
 * @param project - Datos del proyecto
 * @returns Información de validación
 */
export const validateProjectClientData = (project: ProjectType): {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Validar clientId
  if (!project.clientId) {
    issues.push('clientId faltante');
    recommendations.push('Asignar un cliente al proyecto');
  }
  
  // Validar clientName
  if (!project.clientName) {
    issues.push('clientName faltante');
    recommendations.push('Sincronizar nombre del cliente');
  }
  
  // Validar consistencia
  if (project.clientId && project.clientName) {
    // Esta validación requeriría una consulta a la BD, 
    // se puede implementar como función separada si es necesario
    recommendations.push('Verificar consistencia clientId-clientName');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Obtiene estadísticas de sincronización de proyectos
 * @param firestore - Instancia de Firestore
 * @returns Estadísticas de sincronización
 */
export const getProjectClientSyncStats = async (firestore: Firestore = db): Promise<{
  totalProjects: number;
  projectsWithClientId: number;
  projectsWithClientName: number;
  projectsNeedingSync: number;
}> => {
  try {
    const projectsRef = collection(firestore, PROJECTS_COLLECTION);
    const projectsSnapshot = await getDocs(projectsRef);
    
    let projectsWithClientId = 0;
    let projectsWithClientName = 0;
    let projectsNeedingSync = 0;
    
    projectsSnapshot.docs.forEach(doc => {
      const data = doc.data() as ProjectType;
      
      if (data.clientId) projectsWithClientId++;
      if (data.clientName) projectsWithClientName++;
      if (data.clientId && !data.clientName) projectsNeedingSync++;
    });
    
    return {
      totalProjects: projectsSnapshot.docs.length,
      projectsWithClientId,
      projectsWithClientName,
      projectsNeedingSync
    };
  } catch (error) {
    throw error;
  }
};