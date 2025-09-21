/**
 * Tipos para el sistema de tags de desinstalación
 * Extiende el sistema base de tags para persistencia en Firebase
 */

import type { Tag } from './tags';
import type { BaseFirestoreDocument, BaseEntity } from '@/utils/firestore-helpers';

// Documento Firebase para uninstall tags
export interface UninstallTagDocument extends BaseFirestoreDocument {
  name: string;
  color: string; // TagColor as string for Firebase
}

// Entidad uninstall tag que combina Tag con BaseEntity para timestamps
export interface UninstallTag extends Omit<Tag, 'id' | 'createdAt'>, BaseEntity {
  // Hereda: id, createdAt, updatedAt de BaseEntity
  // Hereda: name, color de Tag
}