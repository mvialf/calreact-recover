// src/services/calendarEventService.ts
/**
 * Servicio para integrar eventos específicos de dominio (projectEvents, etc.) 
 * con el sistema de calendario que espera EventType[]
 */

// Firebase imports
import { Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

// Types imports
import type { EventType } from '@/types/event';
import type { ProjectEventType } from '@/types/project';

// Services imports
import { getProjectEvents } from './projectEventService';

// Utils imports
import { generateEventDisplayName } from '@/utils/eventValidation';

// Logger import
import { eventLogger } from '@/lib/logger';

/**
 * Convierte un ProjectEventType a EventType para compatibilidad con el calendario
 */
function convertProjectEventToCalendarEvent(projectEvent: ProjectEventType): EventType {
  // Generar nombre usando la misma lógica que ProjectSummary en calendar-event.tsx
  const getEventName = (): string => {
    // Usar clientName o glosa como fallback
    return projectEvent.clientName?.trim() || projectEvent.glosa?.trim() || 'Cliente no especificado';
  };
  
  // Todos los proyectos usan el mismo color azul (según calendar-event.tsx)
  const getProjectColor = (): string => {
    return 'hsl(221, 83%, 53%)'; // Azul uniforme para todos los proyectos
  };

  return {
    id: projectEvent.id,
    name: getEventName(),
    startDate: projectEvent.eventDate,
    endDate: projectEvent.eventDate, // Eventos de proyecto son de un día
    description: projectEvent.description || '',
    color: getProjectColor(),
    type: 'Proyecto',
    referenceId: projectEvent.projectId,
    location: projectEvent.fullAddress?.textoCompleto,
    projectNumber: undefined, // Se obtendrá del proyecto relacionado en getAllCalendarEvents
    clientName: projectEvent.clientName,
    phone: projectEvent.phone,
    fullAddress: projectEvent.fullAddress, // Incluir fullAddress completo para acceso en el calendario
    glosa: projectEvent.glosa, // Incluir glosa del proyecto
    // Campos específicos del proyecto para acceso posterior
    windowsCount: projectEvent.windowsCount,
    squareMeters: projectEvent.squareMeters,
    uninstallTags: projectEvent.uninstallTags,
    checklist: projectEvent.checklist,
  } as EventType & {
    windowsCount?: number;
    squareMeters?: number;
    uninstallTags?: any[];
    checklist?: any[];
    glosa?: string;
  };
}

/**
 * Obtiene todos los eventos del calendario combinando diferentes fuentes
 * @param firestore - Instancia de Firestore
 * @param userId - ID del usuario (para futura implementación de filtros por usuario)
 * @returns Array de eventos formateados para el calendario
 */
/**
 * Enriquece eventos de calendario con projectNumber obtenido del proyecto relacionado
 * @param events - Array de eventos de calendario a enriquecer
 * @param firestore - Instancia de Firestore
 * @returns Array de eventos enriquecidos con projectNumber
 */
async function enrichEventsWithProjectNumber(
  events: EventType[],
  firestore: Firestore
): Promise<EventType[]> {
  // Importar getProjectById aquí para evitar dependencias circulares
  const { getProjectById } = await import('./projectService');
  
  const enrichedEvents = await Promise.all(
    events.map(async (event) => {
      // Solo procesar eventos que tengan referenceId (projectId) y no tengan ya projectNumber
      if (event.referenceId && !event.projectNumber) {
        try {
          // Obtener datos del proyecto relacionado
          const project = await getProjectById(event.referenceId);
          if (project?.projectNumber) {
            return {
              ...event,
              projectNumber: project.projectNumber
            };
          }
        } catch (error) {
          // Si falla la obtención del proyecto, continuar sin projectNumber
          eventLogger.warn(`No se pudo obtener projectNumber para evento ${event.id}`, error);
        }
      }
      
      return event;
    })
  );

  return enrichedEvents;
}

export async function getAllCalendarEvents(
  firestore: Firestore = db,
  userId?: string
): Promise<EventType[]> {
  
  try {
    const allEvents: EventType[] = [];

    // 1. Obtener eventos de proyecto
    const projectEvents = await getProjectEvents.withFirestore(firestore);
    
    // Convertir project events a calendar events
    const calendarProjectEvents = projectEvents.map(convertProjectEventToCalendarEvent);
    
    // Enriquecer con projectNumber del proyecto relacionado
    const enrichedProjectEvents = await enrichEventsWithProjectNumber(calendarProjectEvents, firestore);
    allEvents.push(...enrichedProjectEvents);

    // 2. Preparado para eventos de postventa (arquitectura específica por dominio)
    // Cuando se implemente afterSalesEventService.ts:
    // const afterSalesEvents = await getAfterSalesEvents.withFirestore(firestore);
    // const enrichedAfterSalesEvents = await enrichEventsWithProjectNumber(
    //   afterSalesEvents.map(convertAfterSalesEventToCalendarEvent), 
    //   firestore
    // );
    // allEvents.push(...enrichedAfterSalesEvents);

    // 3. Preparado para eventos de visita (arquitectura específica por dominio)  
    // Cuando se implemente visitEventService.ts:
    // const visitEvents = await getVisitEvents.withFirestore(firestore);
    // const enrichedVisitEvents = await enrichEventsWithProjectNumber(
    //   visitEvents.map(convertVisitEventToCalendarEvent),
    //   firestore
    // );
    // allEvents.push(...enrichedVisitEvents);

    // 4. Ordenar eventos por fecha
    allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    return allEvents;

  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene eventos del calendario para un rango de fechas específico
 * @param startDate - Fecha de inicio del rango
 * @param endDate - Fecha de fin del rango  
 * @param firestore - Instancia de Firestore
 * @param userId - ID del usuario
 * @returns Array de eventos en el rango especificado
 */
export async function getCalendarEventsInRange(
  startDate: Date,
  endDate: Date,
  firestore: Firestore = db,
  userId?: string
): Promise<EventType[]> {
  
  const allEvents = await getAllCalendarEvents(firestore, userId);
  
  // Filtrar eventos en el rango especificado
  const eventsInRange = allEvents.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // El evento está en el rango si:
    // - Comienza dentro del rango, O
    // - Termina dentro del rango, O  
    // - Abarca todo el rango
    return (eventStart >= startDate && eventStart <= endDate) ||
           (eventEnd >= startDate && eventEnd <= endDate) ||
           (eventStart <= startDate && eventEnd >= endDate);
  });

  return eventsInRange;
}

/**
 * Busca eventos por término de búsqueda
 * @param searchTerm - Término de búsqueda
 * @param firestore - Instancia de Firestore
 * @param userId - ID del usuario
 * @returns Array de eventos que coinciden con la búsqueda
 */
export async function searchCalendarEvents(
  searchTerm: string,
  firestore: Firestore = db,
  userId?: string
): Promise<EventType[]> {
  if (!searchTerm.trim()) {
    return getAllCalendarEvents(firestore, userId);
  }

  
  const allEvents = await getAllCalendarEvents(firestore, userId);
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  const filteredEvents = allEvents.filter(event => {
    return event.name.toLowerCase().includes(lowerSearchTerm) ||
           event.description?.toLowerCase().includes(lowerSearchTerm) ||
           event.clientName?.toLowerCase().includes(lowerSearchTerm) ||
           event.location?.toLowerCase().includes(lowerSearchTerm);
  });

  return filteredEvents;
}

/**
 * Obtiene estadísticas de eventos del calendario
 * @param firestore - Instancia de Firestore
 * @param userId - ID del usuario
 * @returns Estadísticas de eventos
 */
export async function getCalendarEventStats(
  firestore: Firestore = db,
  userId?: string
): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByStatus: Record<string, number>;
  upcomingEvents: number;
  overdueEvents: number;
}> {
  const allEvents = await getAllCalendarEvents(firestore, userId);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const stats = {
    totalEvents: allEvents.length,
    eventsByType: {} as Record<string, number>,
    eventsByStatus: {} as Record<string, number>,
    upcomingEvents: 0,
    overdueEvents: 0
  };

  allEvents.forEach(event => {
    // Por tipo
    stats.eventsByType[event.type] = (stats.eventsByType[event.type] || 0) + 1;
    
    // Por estado
    if (event.status) {
      stats.eventsByStatus[event.status] = (stats.eventsByStatus[event.status] || 0) + 1;
    }
    
    // Por temporalidad
    const eventDate = new Date(event.startDate);
    if (eventDate >= today) {
      stats.upcomingEvents++;
    } else {
      stats.overdueEvents++;
    }
  });

  return stats;
}