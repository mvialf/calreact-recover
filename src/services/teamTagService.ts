/**
 * Servicio para gestión de tags de equipo/participantes en Firebase
 * Sigue patrones establecidos del proyecto y reutiliza utilidades centralizadas
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
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { TagColor, Tag } from '@/types/tags';
import {
  docSnapshotToEntity,
  docSnapshotsToEntities,
  prepareDataForFirestore
} from '@/utils/firestore-helpers';

const TEAM_TAGS_COLLECTION = 'team-tags';

/**
 * Estructura de documento en Firestore
 */
interface TeamTagDocument {
  name: string;
  color: TagColor;
  abbreviation?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Conversión de documento Firebase a entidad Tag
 * Sigue patrón establecido en otros servicios del proyecto
 */
const convertTeamTagDocument = (data: TeamTagDocument, id: string): Partial<Tag> => {
  return {
    name: data.name,
    color: data.color as TagColor,
    abbreviation: data.abbreviation,
  };
};

/**
 * Obtiene todas las tags de equipo ordenadas por fecha de creación
 */
export const getTeamTags = async (): Promise<Tag[]> => {
  const q = query(
    collection(db, TEAM_TAGS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return docSnapshotsToEntities<TeamTagDocument, Tag>(snapshot.docs, convertTeamTagDocument);
};

/**
 * Crea una nueva tag de equipo
 * Auto-genera abbreviation si no se proporciona
 */
export const createTeamTag = async (
  name: string,
  color: TagColor,
  abbreviation?: string
): Promise<string> => {
  const trimmedName = name.trim();
  const tagData: Omit<TeamTagDocument, 'createdAt' | 'updatedAt'> = {
    name: trimmedName,
    color,
    abbreviation: abbreviation?.trim().toUpperCase() || trimmedName.substring(0, 2).toUpperCase(),
  };

  const docRef = await addDoc(
    collection(db, TEAM_TAGS_COLLECTION),
    prepareDataForFirestore(tagData, false) // false = crear (incluir createdAt)
  );

  return docRef.id;
};

/**
 * Actualiza una tag de equipo existente
 */
export const updateTeamTag = async (
  tagId: string,
  updates: Partial<Pick<Tag, 'name' | 'color' | 'abbreviation'>>
): Promise<void> => {
  const docRef = doc(db, TEAM_TAGS_COLLECTION, tagId);

  // Normalizar abbreviation si se proporciona
  const normalizedUpdates = {
    ...updates,
    ...(updates.abbreviation !== undefined && {
      abbreviation: updates.abbreviation.trim().toUpperCase()
    })
  };

  await updateDoc(
    docRef,
    prepareDataForFirestore(normalizedUpdates, true) // true = actualizar (solo updatedAt)
  );
};

/**
 * Elimina una tag de equipo
 */
export const deleteTeamTag = async (tagId: string): Promise<void> => {
  const docRef = doc(db, TEAM_TAGS_COLLECTION, tagId);
  await deleteDoc(docRef);
};
