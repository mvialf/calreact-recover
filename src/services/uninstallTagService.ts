/**
 * Servicio para gestión de tags de desinstalación en Firebase
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
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { TagColor } from '@/types/tags';
import type { UninstallTag, UninstallTagDocument } from '@/types/uninstall-tags';
import {
  docSnapshotToEntity,
  docSnapshotsToEntities,
  prepareDataForFirestore
} from '@/utils/firestore-helpers';

const UNINSTALL_TAGS_COLLECTION = 'uninstall-tags';

/**
 * Conversión de documento Firebase a entidad UninstallTag
 * Sigue patrón establecido en otros servicios del proyecto
 */
const convertUninstallTagDocument = (data: UninstallTagDocument, id: string): Partial<UninstallTag> => {
  return {
    name: data.name,
    color: data.color as TagColor,
  };
};

/**
 * Obtiene todas las tags de desinstalación ordenadas por fecha de creación
 */
export const getUninstallTags = async (): Promise<UninstallTag[]> => {
  const q = query(
    collection(db, UNINSTALL_TAGS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return docSnapshotsToEntities<UninstallTagDocument, UninstallTag>(snapshot.docs, convertUninstallTagDocument);
};

/**
 * Crea una nueva tag de desinstalación
 */
export const createUninstallTag = async (
  name: string,
  color: TagColor
): Promise<string> => {
  const tagData: Omit<UninstallTagDocument, 'createdAt' | 'updatedAt'> = {
    name: name.trim(),
    color,
  };

  const docRef = await addDoc(
    collection(db, UNINSTALL_TAGS_COLLECTION),
    prepareDataForFirestore(tagData, false) // false = crear (incluir createdAt)
  );

  return docRef.id;
};

/**
 * Actualiza una tag de desinstalación existente
 */
export const updateUninstallTag = async (
  tagId: string,
  updates: Partial<Pick<UninstallTag, 'name' | 'color'>>
): Promise<void> => {
  const docRef = doc(db, UNINSTALL_TAGS_COLLECTION, tagId);
  await updateDoc(
    docRef,
    prepareDataForFirestore(updates, true) // true = actualizar (solo updatedAt)
  );
};

/**
 * Elimina una tag de desinstalación
 */
export const deleteUninstallTag = async (tagId: string): Promise<void> => {
  const docRef = doc(db, UNINSTALL_TAGS_COLLECTION, tagId);
  await deleteDoc(docRef);
};