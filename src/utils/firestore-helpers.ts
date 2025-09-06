import { 
  Timestamp, 
  DocumentSnapshot, 
  QueryDocumentSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Utilidades reutilizables para operaciones Firestore
 * Elimina duplicación de código entre servicios
 */

// Tipo base para documentos con timestamps
export interface BaseFirestoreDocument {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Tipo base para entidades con timestamps convertidos
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Convierte Timestamp de Firestore a Date, con fallback seguro
 */
export const timestampToDate = (timestamp: unknown): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date();
};

/**
 * Convierte múltiples campos Timestamp a Date en un objeto
 */
export const convertTimestamps = <T extends Record<string, unknown>>(
  data: T,
  timestampFields: (keyof T)[] = ['createdAt', 'updatedAt']
): T => {
  const converted = { ...data };
  
  timestampFields.forEach(field => {
    if (converted[field]) {
      converted[field] = timestampToDate(converted[field]) as T[keyof T];
    }
  });
  
  return converted;
};

/**
 * Mapea DocumentSnapshot a entidad tipada con conversión automática de timestamps
 */
export const docSnapshotToEntity = <
  TDocument extends BaseFirestoreDocument,
  TEntity extends BaseEntity
>(
  snapshot: DocumentSnapshot | QueryDocumentSnapshot,
  transformFn?: (data: TDocument, id: string) => Partial<TEntity>
): TEntity => {
  if (!snapshot.exists()) {
    throw new Error(`Document with ID ${snapshot.id} does not exist`);
  }
  
  const data = snapshot.data() as TDocument;
  
  // Conversión básica de timestamps
  const baseEntity = {
    id: snapshot.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
  
  // Aplicar transformación adicional si se proporciona
  if (transformFn) {
    const transformed = transformFn(data, snapshot.id);
    return { ...baseEntity, ...transformed } as unknown as TEntity;
  }
  
  return baseEntity as unknown as TEntity;
};

/**
 * Mapea array de DocumentSnapshots a entidades
 */
export const docSnapshotsToEntities = <
  TDocument extends BaseFirestoreDocument,
  TEntity extends BaseEntity
>(
  snapshots: (DocumentSnapshot | QueryDocumentSnapshot)[],
  transformFn?: (data: TDocument, id: string) => Partial<TEntity>
): TEntity[] => {
  return snapshots
    .filter(snapshot => snapshot.exists())
    .map(snapshot => docSnapshotToEntity<TDocument, TEntity>(snapshot, transformFn));
};

/**
 * Prepara datos para guardar en Firestore agregando timestamps
 */
export const prepareDataForFirestore = <T extends Record<string, unknown>>(
  data: T,
  isUpdate = false
): T & { createdAt?: Timestamp; updatedAt: Timestamp } => {
  const prepared = {
    ...data,
    updatedAt: serverTimestamp() as Timestamp,
  };
  
  if (!isUpdate) {
    (prepared as any).createdAt = serverTimestamp() as Timestamp;
  }
  
  return prepared;
};

/**
 * Convierte Date a Timestamp para operaciones de fecha específicas
 */
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

/**
 * Helper para operaciones CRUD comunes
 */
export const firestoreHelpers = {
  timestampToDate,
  convertTimestamps,
  docSnapshotToEntity,
  docSnapshotsToEntities,
  prepareDataForFirestore,
  dateToTimestamp,
} as const;