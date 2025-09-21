import { ProjectType, ProjectEventType, FormattedAddress, ProjectStatus } from '@/types/project';
import { getProjectById } from '@/services/projectService';
import { eventLogger } from '@/lib/logger';

const logger = eventLogger;

// Tipo para evento enriquecido con datos del proyecto
export interface EnrichedProjectEvent extends ProjectEventType {
  projectData: ProjectType;
  isProjectDataStale?: boolean; // Indica si los datos del proyecto podrían estar desactualizados
  enrichmentTimestamp: number; // Timestamp de cuando se enriqueció
}

// Configuración para el enriquecimiento
interface EnrichmentConfig {
  fallbackToEventData: boolean; // Si usar datos del evento cuando el proyecto no esté disponible
  includeProjectMetadata: boolean; // Si incluir metadatos completos del proyecto
  markStaleAfter: number; // Milisegundos después de los cuales los datos se consideran stale
}

// Estadísticas del servicio de enriquecimiento
interface EnrichmentStats {
  successful: number;
  failed: number;
  cacheHits: number;
  cacheMisses: number;
  fallbacksUsed: number;
}

class EventEnrichmentService {
  private config: EnrichmentConfig;
  private stats: EnrichmentStats = {
    successful: 0,
    failed: 0,
    cacheHits: 0,
    cacheMisses: 0,
    fallbacksUsed: 0
  };

  constructor(config: Partial<EnrichmentConfig> = {}) {
    this.config = {
      fallbackToEventData: true,
      includeProjectMetadata: true,
      markStaleAfter: 5 * 60 * 1000, // 5 minutos
      ...config
    };

    logger.info('EventEnrichmentService inicializado', { config: this.config });
  }

  /**
   * Enriquece un evento con datos del proyecto desde cache
   */
  async enrichEvent(
    event: ProjectEventType
  ): Promise<EnrichedProjectEvent | null> {
    try {
      const startTime = Date.now();
      
      // Obtener proyecto directamente desde Firestore
      const project = await getProjectById(event.projectId);
      
      if (project) {
        this.stats.successful++;
        
        const enrichedEvent = this.composeEnrichedEvent(event, project);
        
        logger.debug('Evento enriquecido exitosamente', {
          eventId: event.id,
          projectId: event.projectId,
          duration: Date.now() - startTime
        });
        
        return enrichedEvent;
      } else {
        // Proyecto no encontrado - usar fallback si está habilitado
        if (this.config.fallbackToEventData) {
          this.stats.fallbacksUsed++;
          
          logger.warn('Proyecto no encontrado - usando fallback', {
            eventId: event.id,
            projectId: event.projectId
          });
          
          return this.createFallbackEnrichedEvent(event);
        } else {
          this.stats.failed++;
          logger.error('Proyecto no encontrado y fallback deshabilitado', {
            eventId: event.id,
            projectId: event.projectId
          });
          
          return null;
        }
      }
    } catch (error) {
      this.stats.failed++;
      logger.error('Error enriqueciendo evento', {
        eventId: event.id,
        projectId: event.projectId,
        error
      });
      
      // Intentar fallback en caso de error
      if (this.config.fallbackToEventData) {
        this.stats.fallbacksUsed++;
        return this.createFallbackEnrichedEvent(event);
      }
      
      return null;
    }
  }

  /**
   * Enriquece múltiples eventos de manera eficiente
   */
  async enrichEvents(
    events: ProjectEventType[]
  ): Promise<EnrichedProjectEvent[]> {
    if (events.length === 0) return [];

    const startTime = Date.now();
    logger.info('Enriqueciendo múltiples eventos', { count: events.length });

    // Procesar eventos en paralelo
    const enrichmentPromises = events.map(event => this.enrichEvent(event));
    const results = await Promise.allSettled(enrichmentPromises);
    
    // Filtrar resultados exitosos
    const enrichedEvents: EnrichedProjectEvent[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        enrichedEvents.push(result.value);
      } else {
        logger.warn('Fallo enriqueciendo evento individual', {
          eventIndex: index,
          eventId: events[index]?.id
        });
      }
    });

    logger.info('Enriquecimiento masivo completado', {
      total: events.length,
      successful: enrichedEvents.length,
      failed: events.length - enrichedEvents.length,
      duration: Date.now() - startTime
    });

    return enrichedEvents;
  }

  /**
   * Crea un evento simplificado que mantiene la estructura de ProjectEventType
   * pero con datos optimizados del proyecto
   */
  composeSimplifiedEvent(
    event: ProjectEventType, 
    project: ProjectType
  ): ProjectEventType {
    return {
      // Datos específicos del evento (prioridad)
      id: event.id,
      projectId: event.projectId,
      eventDate: event.eventDate,
      checklist: event.checklist || [],
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      
      // Composición inteligente: evento tiene prioridad sobre proyecto
      description: event.description || project.description || '',
      phone: event.phone || project.phone || '',
      fullAddress: event.fullAddress || project.fullAddress,
      status: event.status || project.status,
      windowsCount: event.windowsCount ?? project.windowsCount ?? 0,
      squareMeters: event.squareMeters ?? project.squareMeters ?? 0,
      uninstall: event.uninstall ?? project.uninstall ?? false,
      uninstallTypes: event.uninstallTypes || project.uninstallTypes || [],
      uninstallOther: event.uninstallOther || project.uninstallOther || '',
      clientName: event.clientName || project.clientName || 'Cliente pendiente',
      glosa: event.glosa || project.glosa || ''
    };
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats(): EnrichmentStats & { successRate: number } {
    const total = this.stats.successful + this.stats.failed;
    const successRate = total > 0 ? (this.stats.successful / total) * 100 : 0;
    
    return {
      ...this.stats,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  /**
   * Reinicia las estadísticas
   */
  resetStats(): void {
    this.stats = {
      successful: 0,
      failed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      fallbacksUsed: 0
    };
    logger.info('Estadísticas reiniciadas');
  }

  /**
   * Compone un evento enriquecido con todos los datos
   */
  private composeEnrichedEvent(
    event: ProjectEventType, 
    project: ProjectType
  ): EnrichedProjectEvent {
    const now = Date.now();
    
    // Verificar si los datos del proyecto podrían estar stale
    const projectTimestamp = project.updatedAt?.getTime() || 0;
    const isProjectDataStale = (now - projectTimestamp) > this.config.markStaleAfter;
    
    return {
      // Datos del evento con composición inteligente
      ...this.composeSimplifiedEvent(event, project),
      
      // Metadata de enriquecimiento
      projectData: project,
      isProjectDataStale,
      enrichmentTimestamp: now
    };
  }

  /**
   * Crea un evento de fallback cuando no se puede obtener el proyecto
   */
  private createFallbackEnrichedEvent(event: ProjectEventType): EnrichedProjectEvent {
    // Crear un proyecto "phantom" con los datos disponibles en el evento
    const fallbackProject: ProjectType = {
      id: event.projectId,
      projectNumber: `CACHED-${event.projectId}`,
      clientId: 'unknown',
      clientName: event.clientName || 'Cliente desconocido',
      description: event.description || '',
      date: new Date(),
      subtotal: 0,
      taxRate: 0,
      total: 0,
      balance: 0,
      status: event.status,
      phone: event.phone || '',
      fullAddress: event.fullAddress,
      windowsCount: event.windowsCount || 0,
      squareMeters: event.squareMeters || 0,
      uninstall: event.uninstall || false,
      uninstallTypes: event.uninstallTypes || [],
      uninstallOther: event.uninstallOther || '',
      glosa: event.glosa || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return {
      ...event,
      projectData: fallbackProject,
      isProjectDataStale: true,
      enrichmentTimestamp: Date.now()
    };
  }
}

// Instancia singleton del servicio
export const eventEnrichmentService = new EventEnrichmentService({
  fallbackToEventData: true,
  includeProjectMetadata: true,
  markStaleAfter: 10 * 60 * 1000 // 10 minutos
});

// Funciones de utilidad exportadas
export const enrichEvent = (event: ProjectEventType) =>
  eventEnrichmentService.enrichEvent(event);

export const enrichEvents = (events: ProjectEventType[]) =>
  eventEnrichmentService.enrichEvents(events);

export const composeSimplifiedEvent = (event: ProjectEventType, project: ProjectType) =>
  eventEnrichmentService.composeSimplifiedEvent(event, project);

export const getEnrichmentStats = () => eventEnrichmentService.getStats();

// Utilidades adicionales para trabajar con eventos enriquecidos
export const isEventDataStale = (enrichedEvent: EnrichedProjectEvent): boolean => {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  return enrichedEvent.enrichmentTimestamp < fiveMinutesAgo || 
         Boolean(enrichedEvent.isProjectDataStale);
};

export const extractEventSpecificData = (event: ProjectEventType) => ({
  id: event.id,
  projectId: event.projectId,
  eventDate: event.eventDate,
  checklist: event.checklist || [],
  createdAt: event.createdAt,
  updatedAt: event.updatedAt
});

export const extractProjectSpecificData = (project: ProjectType) => ({
  projectNumber: project.projectNumber,
  clientId: project.clientId,
  clientName: project.clientName,
  description: project.description,
  phone: project.phone,
  fullAddress: project.fullAddress,
  status: project.status,
  windowsCount: project.windowsCount,
  squareMeters: project.squareMeters,
  uninstall: project.uninstall,
  uninstallTypes: project.uninstallTypes,
  uninstallOther: project.uninstallOther,
  glosa: project.glosa
});