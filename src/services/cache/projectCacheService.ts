import { onSnapshot, doc, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProjectType } from '@/types/project';
import { getProjectById } from '@/services/projectService';
import { utilityLogger } from '@/lib/logger';

const logger = utilityLogger;

// Configuración del cache
interface CacheConfig {
  ttl: number; // Time To Live en milisegundos
  maxSize: number; // Máximo número de proyectos en cache
  preloadMostUsed: boolean; // Pre-cargar proyectos más usados
}

interface CacheEntry {
  project: ProjectType;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  unsubscribe?: () => void; // Para limpiar listener de Firestore
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

class ProjectCacheService {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 15 * 60 * 1000, // 15 minutos por defecto
      maxSize: 100, // 100 proyectos máximo
      preloadMostUsed: false,
      ...config
    };

    // Iniciar limpieza automática cada 5 minutos
    this.startCleanupTask();
    
    logger.info('ProjectCache inicializado', { config: this.config });
  }

  /**
   * Obtiene un proyecto del cache o lo carga desde Firestore
   */
  async getProject(projectId: string, firestore: Firestore = db): Promise<ProjectType | null> {
    const entry = this.cache.get(projectId);
    const now = Date.now();

    // Cache hit válido
    if (entry && (now - entry.timestamp) < this.config.ttl) {
      entry.accessCount++;
      entry.lastAccess = now;
      this.stats.hits++;
      
      logger.debug('Cache HIT', { projectId, accessCount: entry.accessCount });
      return entry.project;
    }

    // Cache miss - cargar desde Firestore
    try {
      this.stats.misses++;
      logger.debug('Cache MISS - cargando desde Firestore', { projectId });
      
      const project = await getProjectById(projectId);
      
      if (project) {
        // Agregar al cache con listener en tiempo real
        await this.addToCache(projectId, project, firestore);
      }
      
      return project;
    } catch (error) {
      logger.error('Error cargando proyecto', { projectId, error });
      return null;
    }
  }

  /**
   * Obtiene múltiples proyectos de manera eficiente
   */
  async getProjects(projectIds: string[], firestore: Firestore = db): Promise<Map<string, ProjectType>> {
    const results = new Map<string, ProjectType>();
    const missingIds: string[] = [];

    // Verificar cache primero
    for (const projectId of projectIds) {
      const entry = this.cache.get(projectId);
      const now = Date.now();

      if (entry && (now - entry.timestamp) < this.config.ttl) {
        entry.accessCount++;
        entry.lastAccess = now;
        results.set(projectId, entry.project);
        this.stats.hits++;
      } else {
        missingIds.push(projectId);
      }
    }

    // Cargar proyectos faltantes
    if (missingIds.length > 0) {
      logger.debug('Cargando proyectos faltantes', { count: missingIds.length });
      
      const loadPromises = missingIds.map(async (projectId) => {
        try {
          const project = await getProjectById(projectId);
          if (project) {
            await this.addToCache(projectId, project, firestore);
            results.set(projectId, project);
          }
          this.stats.misses++;
        } catch (error) {
          logger.error('Error cargando proyecto individual', { projectId, error });
        }
      });

      await Promise.allSettled(loadPromises);
    }

    return results;
  }

  /**
   * Invalida un proyecto específico del cache
   */
  invalidate(projectId: string): void {
    const entry = this.cache.get(projectId);
    if (entry) {
      // Limpiar listener de Firestore
      if (entry.unsubscribe) {
        entry.unsubscribe();
      }
      
      this.cache.delete(projectId);
      this.stats.size--;
      
      logger.debug('Proyecto invalidado del cache', { projectId });
    }
  }

  /**
   * Invalida múltiples proyectos
   */
  invalidateMultiple(projectIds: string[]): void {
    projectIds.forEach(id => this.invalidate(id));
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    // Limpiar todos los listeners
    this.cache.forEach(entry => {
      if (entry.unsubscribe) {
        entry.unsubscribe();
      }
    });

    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, size: 0 };
    
    logger.info('Cache completamente limpiado');
  }

  /**
   * Pre-carga proyectos específicos
   */
  async preload(projectIds: string[], firestore: Firestore = db): Promise<void> {
    logger.info('Pre-cargando proyectos', { count: projectIds.length });
    
    const loadPromises = projectIds.map(async (projectId) => {
      if (!this.cache.has(projectId)) {
        try {
          const project = await getProjectById(projectId);
          if (project) {
            await this.addToCache(projectId, project, firestore);
          }
        } catch (error) {
          logger.error('Error en pre-carga', { projectId, error });
        }
      }
    });

    await Promise.allSettled(loadPromises);
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): CacheStats & { hitRate: number; avgAccessCount: number } {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    const accessCounts = Array.from(this.cache.values()).map(entry => entry.accessCount);
    const avgAccessCount = accessCounts.length > 0 
      ? accessCounts.reduce((sum, count) => sum + count, 0) / accessCounts.length 
      : 0;

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      avgAccessCount: Math.round(avgAccessCount * 100) / 100
    };
  }

  /**
   * Obtiene proyectos más accedidos para estadísticas
   */
  getMostAccessed(limit: number = 10): Array<{ projectId: string; accessCount: number; project: ProjectType }> {
    return Array.from(this.cache.entries())
      .map(([projectId, entry]) => ({
        projectId,
        accessCount: entry.accessCount,
        project: entry.project
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Destruye el servicio y limpia recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clear();
    logger.info('ProjectCacheService destruido');
  }

  /**
   * Agrega un proyecto al cache con listener en tiempo real
   */
  private async addToCache(projectId: string, project: ProjectType, firestore: Firestore): Promise<void> {
    // Verificar límite de tamaño y hacer eviction si es necesario
    if (this.cache.size >= this.config.maxSize) {
      this.performEviction();
    }

    // Crear listener en tiempo real para sincronización
    const unsubscribe = onSnapshot(
      doc(firestore, 'projects', projectId),
      (snapshot) => {
        if (snapshot.exists()) {
          const updatedProject = { id: snapshot.id, ...snapshot.data() } as ProjectType;
          
          const entry = this.cache.get(projectId);
          if (entry) {
            entry.project = updatedProject;
            entry.timestamp = Date.now();
            
            logger.debug('Proyecto actualizado vía listener', { projectId });
          }
        } else {
          // Proyecto eliminado - invalidar cache
          this.invalidate(projectId);
          logger.debug('Proyecto eliminado - invalidado del cache', { projectId });
        }
      },
      (error) => {
        logger.error('Error en listener de proyecto', { projectId, error });
        // En caso de error, invalidar la entrada para forzar recarga
        this.invalidate(projectId);
      }
    );

    // Crear entrada de cache
    const entry: CacheEntry = {
      project,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      unsubscribe
    };

    this.cache.set(projectId, entry);
    this.stats.size++;
    
    logger.debug('Proyecto agregado al cache', { projectId, cacheSize: this.cache.size });
  }

  /**
   * Realiza eviction (expulsión) de entradas usando LRU
   */
  private performEviction(): void {
    // Encontrar la entrada menos recientemente usada
    let oldestEntry: { projectId: string; entry: CacheEntry } | null = null;
    
    for (const [projectId, entry] of this.cache.entries()) {
      if (!oldestEntry || entry.lastAccess < oldestEntry.entry.lastAccess) {
        oldestEntry = { projectId, entry };
      }
    }

    if (oldestEntry) {
      this.invalidate(oldestEntry.projectId);
      this.stats.evictions++;
      
      logger.debug('Eviction realizada', { 
        evictedProjectId: oldestEntry.projectId,
        totalEvictions: this.stats.evictions 
      });
    }
  }

  /**
   * Inicia tarea de limpieza periódica
   */
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const expired: string[] = [];

      // Identificar entradas expiradas
      for (const [projectId, entry] of this.cache.entries()) {
        if ((now - entry.timestamp) > this.config.ttl) {
          expired.push(projectId);
        }
      }

      // Limpiar entradas expiradas
      if (expired.length > 0) {
        expired.forEach(projectId => this.invalidate(projectId));
        logger.debug('Limpieza automática completada', { 
          expiredCount: expired.length,
          cacheSize: this.cache.size 
        });
      }
    }, 5 * 60 * 1000); // Cada 5 minutos
  }
}

// Instancia singleton del servicio de cache
export const projectCache = new ProjectCacheService({
  ttl: 10 * 60 * 1000, // 10 minutos
  maxSize: 50, // 50 proyectos máximo
  preloadMostUsed: true
});

// Funciones de utilidad exportadas
export const getProjectFromCache = (projectId: string, firestore?: Firestore) => 
  projectCache.getProject(projectId, firestore);

export const getProjectsFromCache = (projectIds: string[], firestore?: Firestore) => 
  projectCache.getProjects(projectIds, firestore);

export const invalidateProjectCache = (projectId: string) => 
  projectCache.invalidate(projectId);

export const preloadProjects = (projectIds: string[], firestore?: Firestore) => 
  projectCache.preload(projectIds, firestore);

export const getCacheStats = () => projectCache.getStats();

// Limpiar cache al cerrar la aplicación
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    projectCache.destroy();
  });
}