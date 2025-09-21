/**
 * TIPOS PARA CALENDARIO - ARQUITECTURA ESPECÍFICA POR DOMINIO
 * 
 * EventType es usado por el sistema de calendario para mostrar eventos
 * de diferentes dominios (ProjectEvents, etc.) de manera unificada.
 * 
 * Nota: Este tipo no representa una colección Firestore directa,
 * sino una abstracción para la visualización en calendario.
 */
export interface EventType {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  color?: string; // e.g., '#FF0000' or 'blue' or a Tailwind color class
  displayOrder?: number; // Orden visual para eventos dentro del mismo día
  type: 'Proyecto' | 'Postventa' | 'Visita'; // Tipo de evento obligatorio
  referenceId: string; // ID del proyecto, postventa o visita relacionada
  status?: string; // Estado actual del evento (obtenido del registro referenciado)
  location?: string; // Ubicación del evento
  
  // Campos específicos para eventos de tipo Proyecto (extendidos desde ProjectEvents)
  projectNumber?: string; // Número del proyecto
  clientName?: string; // Nombre del cliente
  glosa?: string; // Información adicional del cliente
  phone?: string; // Teléfono de contacto
  windowsCount?: number; // Cantidad de ventanas
  squareMeters?: number; // Metros cuadrados
  uninstall?: boolean; // Desinstalación
  fullAddress?: {
    textoCompleto?: string; // Dirección completa
    comune?: string; // Comuna
    coordenadas?: {
      latitude: number;
      longitude: number;
    };
    componentes?: Record<string, string>; // Componentes de la dirección
    informacionAdicional?: string; // Información adicional de la dirección
  };
  eventNotes?: string; // Notas específicas del evento
}

export type ViewOption = 'month' | 'week' | 'day';
