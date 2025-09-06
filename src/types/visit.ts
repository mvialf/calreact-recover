export type VisitStatus = 'Ingresada' | 'Agendada' | 'Reagendada' | 'Completada' | 'Cancelada';

export const DEFAULT_VISIT_STATUS: VisitStatus = 'Ingresada';

export const VISIT_STATUS_OPTIONS: VisitStatus[] = [
  'Ingresada',
  'Agendada',
  'Reagendada',
  'Completada',
  'Cancelada',
];

export interface Visit {
  id: string;
  name: string;
  phone?: string;
  status: VisitStatus;
  address?: string;
  municipality?: string;
  observations?: string;
  scheduledDate: Date | string;
  placeId?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  fullAddress?: {
    textoCompleto?: string;
    placeId?: string;
    coordenadas?: {
      latitude: number;
      longitude: number;
    };
    componentes?: {
      calle?: string;
      numero?: string;
      comuna?: string;
      ciudad?: string;
      region?: string;
      pais?: string;
      codigoPostal?: string;
    };
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
