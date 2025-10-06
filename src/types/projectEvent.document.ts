/**
 * @fileoverview Tipos de documento Firestore para eventos de proyecto
 *
 * Convierte entre tipos TypeScript (Date) y tipos Firestore (Timestamp)
 * para almacenamiento en base de datos.
 */

import type { Timestamp } from 'firebase/firestore';
import type { ProjectEventMinimal, ProjectSnapshot, ChecklistItem } from './projectEvent';

/**
 * Snapshot del proyecto en formato Firestore
 * (Mismos campos que ProjectSnapshot, sin conversión de tipos necesaria)
 */
export type ProjectSnapshotDocument = ProjectSnapshot;

/**
 * ChecklistItem en formato Firestore
 *
 * Convierte Date a Timestamp para campos de fecha
 */
export interface ChecklistItemDocument
  extends Omit<ChecklistItem, 'createdAt' | 'completedAt'> {
  createdAt?: Timestamp;
  completedAt?: Timestamp;
}

/**
 * Documento de evento de proyecto en Firestore
 *
 * Convierte todos los campos Date a Timestamp para almacenamiento
 */
export interface ProjectEventMinimalDocument
  extends Omit<
    ProjectEventMinimal,
    'id' | 'eventDate' | 'checklist' | 'createdAt' | 'updatedAt'
  > {
  /** Fecha del evento en formato Timestamp */
  eventDate: Timestamp;

  /** Checklist con fechas en formato Timestamp */
  checklist: ChecklistItemDocument[];

  /** Fecha de creación en formato Timestamp */
  createdAt?: Timestamp;

  /** Fecha de última actualización en formato Timestamp */
  updatedAt?: Timestamp;
}

/**
 * Helper para convertir ChecklistItem a ChecklistItemDocument
 */
export function checklistItemToDocument(item: ChecklistItem): ChecklistItemDocument {
  const doc: Partial<ChecklistItemDocument> = {
    id: item.id,
    description: item.description,
    isCompleted: item.isCompleted,
    priority: item.priority,
    category: item.category,
    assignedTo: item.assignedTo,
    completedBy: item.completedBy,
    notes: item.notes,
  };

  // Convertir Date a Timestamp solo si existen
  if (item.createdAt instanceof Date) {
    doc.createdAt = {
      seconds: Math.floor(item.createdAt.getTime() / 1000),
      nanoseconds: 0,
    } as Timestamp;
  }

  if (item.completedAt instanceof Date) {
    doc.completedAt = {
      seconds: Math.floor(item.completedAt.getTime() / 1000),
      nanoseconds: 0,
    } as Timestamp;
  }

  return doc as ChecklistItemDocument;
}

/**
 * Helper para convertir ChecklistItemDocument a ChecklistItem
 */
export function checklistItemFromDocument(doc: ChecklistItemDocument): ChecklistItem {
  const item: Partial<ChecklistItem> = {
    id: doc.id,
    description: doc.description,
    isCompleted: doc.isCompleted,
    priority: doc.priority,
    category: doc.category,
    assignedTo: doc.assignedTo,
    completedBy: doc.completedBy,
    notes: doc.notes,
  };

  // Convertir Timestamp a Date solo si existen
  if (doc.createdAt) {
    item.createdAt = new Date(doc.createdAt.seconds * 1000);
  }

  if (doc.completedAt) {
    item.completedAt = new Date(doc.completedAt.seconds * 1000);
  }

  return item as ChecklistItem;
}
