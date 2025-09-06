// src/types/project.ts
import type { Timestamp } from 'firebase/firestore';
import type { ProjectStatusConstant } from '@/constants/project';

// Tipo para las coordenadas geográficas
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// Tipo para los componentes de dirección
export interface AddressComponents {
  calle?: string;
  numero?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  codigoPostal?: string;
}

// Tipo para la dirección formateada completa
export interface FormattedAddress {
  textoCompleto: string;
  coordenadas: GeoCoordinates;
  placeId: string;
  componentes?: AddressComponents;
  detalle?: string;
  informacionAdicional?: string; // Para información adicional como número de departamento, block, etc.
  comune?: string; // Campo directo para acceso rápido a la comuna
}

export type ProjectStatus = ProjectStatusConstant;

export interface ProjectType {
  id: string;
  projectNumber: string;
  clientId: string; // ID of the related client document in the 'clients' collection
  clientName?: string; // Added dynamically for display purposes
  description?: string;
  date: Date; // Start date of the project
  eventDate?: Date; // Specific date for calendar scheduling
  subtotal: number;
  taxRate: number;
  total?: number; // Calculated: subtotal * (1 + taxRate / 100)
  balance?: number; // Initially same as total, decreases with payments
  createdAt?: Date;
  updatedAt?: Date;
  status: ProjectStatus;
  phone?: string; // Contact phone for the project, might differ from client
  fullAddress?: FormattedAddress; // Dirección completa estructurada
  address?: string; // Project site address (legacy, para compatibilidad)
  commune?: string; // Legado, para compatibilidad
  region?: string; // Legado, para compatibilidad
  windowsCount?: number;
  squareMeters?: number;
  uninstall?: boolean;
  uninstallTypes?: string[];
  uninstallOther?: string;
  glosa?: string; // Short note or summary, similar to description but often more technical or brief
  isHidden?: boolean; // For soft deletes or hiding projects from lists
  isPaid?: boolean; // New field for the interactive paid switch
  collect?: boolean; // Indica si el proyecto está marcado para cobrar
}

// Helper type for Firestore document structure
export interface ProjectDocument
  extends Omit<ProjectType, 'id' | 'date' | 'eventDate' | 'createdAt' | 'updatedAt'> {
  date: Timestamp;
  eventDate?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Interface for data used when importing projects
export interface EnrichedProject extends ProjectType {
  totalPayments: number;
  totalPaymentPercentage: number;
  balance: number;
}

// Interface for data used when importing projects
export interface ProjectImportData
  extends Partial<Omit<ProjectType, 'total' | 'balance' | 'updatedAt' | 'date' | 'createdAt'>> {
  id?: string; // If provided, this ID will be used for the document.
  projectNumber: string;
  clientId: string;
  date: string | Date; // Can be string from JSON or Date object
  subtotal: number;
  taxRate: number;
  status: ProjectStatus;
  isPaid?: boolean; // Added for import
  createdAt?: string | Date; // Can be string from JSON or Date object
}

// Tipo para evento de proyecto (colección separada)
export interface ProjectEventType {
  id: string;
  projectId: string; // Referencia al proyecto relacionado
  eventDate: Date; // Fecha específica del evento
  description?: string;
  phone?: string;
  fullAddress?: FormattedAddress;
  status: ProjectStatus;
  windowsCount?: number;
  squareMeters?: number;
  uninstall?: boolean;
  uninstallTypes?: string[];
  uninstallOther?: string;
  clientName?: string; // Copiado del proyecto para facilitar consultas
  glosa?: string; // Short note or summary, similar to description but often more technical or brief
  checklist?: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    createdAt?: Date;
    completedAt?: Date;
  }>; // Lista de verificación específica del evento
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper type para documento de evento de proyecto en Firestore
export interface ProjectEventDocument
  extends Omit<ProjectEventType, 'id' | 'eventDate' | 'createdAt' | 'updatedAt'> {
  eventDate: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
