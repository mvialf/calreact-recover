#!/usr/bin/env npx tsx

/**
 * Script de migración: ProjectEventType Legacy → ProjectEventLean
 * 
 * Este script migra eventos existentes del formato legacy con duplicación masiva
 * al nuevo formato lean que usa referencias + cache inteligente.
 * 
 * @version 1.0.0
 * @since Septiembre 2025
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  limit,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { ProjectEventType, ProjectEventLean, ChecklistItem, MigrationBatchResult } from '@/types/project';

// Configuración Firebase (usar variables de entorno)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === CONFIGURACIÓN DE MIGRACIÓN ===

interface MigrationConfig {
  batchSize: number;
  dryRun: boolean; // Si true, no hace cambios reales
  preserveOriginal: boolean; // Si mantener documentos originales
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  targetCollection: string; // Nueva colección para eventos lean
  sourceCollection: string; // Colección original
}

const defaultConfig: MigrationConfig = {
  batchSize: 50,
  dryRun: true, // SIEMPRE iniciar en modo dry-run
  preserveOriginal: true,
  logLevel: 'info',
  targetCollection: 'projectEventsLean', // Nueva colección
  sourceCollection: 'projectEvents' // Colección original
};

// === UTILIDADES DE LOGGING ===

class MigrationLogger {
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.config.logLevel);
  }

  error(message: string, meta?: any) {
    if (this.shouldLog('error')) {
      console.error(`❌ [ERROR] ${message}`, meta || '');
    }
  }

  warn(message: string, meta?: any) {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️  [WARN]  ${message}`, meta || '');
    }
  }

  info(message: string, meta?: any) {
    if (this.shouldLog('info')) {
      console.info(`ℹ️  [INFO]  ${message}`, meta || '');
    }
  }

  debug(message: string, meta?: any) {
    if (this.shouldLog('debug')) {
      console.log(`🔍 [DEBUG] ${message}`, meta || '');
    }
  }
}

// === FUNCIONES DE CONVERSIÓN ===

/**
 * Convierte un checklist legacy a formato lean
 */
function convertLegacyChecklist(legacyChecklist?: Array<{
  id: string;
  description: string;
  isCompleted: boolean;
  createdAt?: Date;
  completedAt?: Date;
}>): ChecklistItem[] {
  if (!Array.isArray(legacyChecklist)) return [];

  return legacyChecklist.map(item => ({
    id: item.id,
    description: item.description,
    isCompleted: item.isCompleted,
    priority: 'medium' as const, // Valor por defecto
    category: 'general', // Valor por defecto
    createdAt: item.createdAt,
    completedAt: item.completedAt,
    // Campos nuevos del formato lean
    assignedTo: undefined,
    notes: undefined
  }));
}

/**
 * Convierte un ProjectEventType legacy a ProjectEventLean
 */
function convertLegacyToLean(legacyEvent: ProjectEventType): ProjectEventLean {
  // Determinar qué campos son diferentes del proyecto (esto requeriría lógica adicional)
  // Por simplicidad, tratamos todos los campos como potenciales overrides
  
  const leanEvent: ProjectEventLean = {
    id: legacyEvent.id,
    projectId: legacyEvent.projectId,
    eventDate: legacyEvent.eventDate,
    checklist: convertLegacyChecklist(legacyEvent.checklist),
    
    // Solo incluir overrides si son diferentes de undefined/null/empty
    customDescription: legacyEvent.description?.trim() || undefined,
    customPhone: legacyEvent.phone?.trim() || undefined,
    customStatus: legacyEvent.status || undefined,
    eventNotes: legacyEvent.glosa?.trim() || undefined,
    
    createdAt: legacyEvent.createdAt,
    updatedAt: legacyEvent.updatedAt
  };

  return leanEvent;
}

/**
 * Valida un evento lean antes de la migración
 */
function validateLeanEvent(event: ProjectEventLean): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!event.id) errors.push('ID requerido');
  if (!event.projectId) errors.push('ProjectID requerido');
  if (!event.eventDate || !(event.eventDate instanceof Date)) errors.push('EventDate debe ser una fecha válida');
  if (!Array.isArray(event.checklist)) errors.push('Checklist debe ser un array');

  // Validar items del checklist
  event.checklist.forEach((item, index) => {
    if (!item.id) errors.push(`Checklist item ${index}: ID requerido`);
    if (!item.description?.trim()) errors.push(`Checklist item ${index}: Descripción requerida`);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// === CLASE PRINCIPAL DE MIGRACIÓN ===

class EventMigrationService {
  private config: MigrationConfig;
  private logger: MigrationLogger;
  private stats = {
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    startTime: new Date(),
    endTime: null as Date | null
  };

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.logger = new MigrationLogger(this.config);
  }

  /**
   * Ejecuta la migración completa
   */
  async migrate(): Promise<void> {
    this.logger.info('🚀 Iniciando migración de eventos', {
      config: this.config,
      isDryRun: this.config.dryRun
    });

    if (this.config.dryRun) {
      this.logger.warn('MODO DRY-RUN ACTIVO - No se realizarán cambios reales');
    }

    try {
      // Obtener total de documentos para progreso
      const totalQuery = query(collection(db, this.config.sourceCollection));
      const totalSnapshot = await getDocs(totalQuery);
      const totalEvents = totalSnapshot.size;

      this.logger.info(`📊 Total de eventos a migrar: ${totalEvents}`);

      // Procesar en lotes
      let processed = 0;
      let lastDoc = null;

      while (processed < totalEvents) {
        const batchResult = await this.migrateBatch(lastDoc);
        
        processed += batchResult.processed;
        this.stats.processed += batchResult.processed;
        this.stats.successful += batchResult.successful;
        this.stats.failed += batchResult.failed;

        this.logger.info(`📈 Progreso: ${processed}/${totalEvents} (${Math.round((processed/totalEvents)*100)}%)`);

        // Si el lote no procesó nada, salir del loop
        if (batchResult.processed === 0) {
          break;
        }
      }

      this.stats.endTime = new Date();
      this.logFinalStats();

    } catch (error) {
      this.logger.error('💥 Error crítico en migración', error);
      throw error;
    }
  }

  /**
   * Migra un lote de eventos
   */
  private async migrateBatch(lastDoc: any): Promise<MigrationBatchResult> {
    const batchId = `batch_${Date.now()}`;
    const startTime = new Date();

    this.logger.debug(`🔄 Procesando lote: ${batchId}`);

    try {
      // Construir query para el lote
      let batchQuery = query(
        collection(db, this.config.sourceCollection),
        orderBy('createdAt', 'asc'),
        limit(this.config.batchSize)
      );

      if (lastDoc) {
        // TODO: Implementar paginación con startAfter
        // batchQuery = query(batchQuery, startAfter(lastDoc));
      }

      // Obtener documentos
      const snapshot = await getDocs(batchQuery);
      const events: ProjectEventType[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        events.push({
          id: doc.id,
          ...data,
          // Convertir timestamps a Date
          eventDate: data.eventDate?.toDate?.() || new Date(data.eventDate),
          createdAt: data.createdAt?.toDate?.() || undefined,
          updatedAt: data.updatedAt?.toDate?.() || undefined,
        } as ProjectEventType);
      });

      // Procesar cada evento
      const results: { successful: number; failed: number; errors: Array<{eventId: string; error: string}> } = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const event of events) {
        try {
          // Convertir a formato lean
          const leanEvent = convertLegacyToLean(event);

          // Validar evento lean
          const validation = validateLeanEvent(leanEvent);
          if (!validation.isValid) {
            throw new Error(`Validación falló: ${validation.errors.join(', ')}`);
          }

          // Guardar evento lean (solo si no es dry-run)
          if (!this.config.dryRun) {
            await this.saveLeanEvent(leanEvent);
          }

          results.successful++;
          this.logger.debug(`✅ Evento migrado: ${event.id} → Lean`);

        } catch (error) {
          results.failed++;
          results.errors.push({
            eventId: event.id,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
          this.logger.error(`❌ Error migrando evento ${event.id}`, error);
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const batchResult: MigrationBatchResult = {
        batchId,
        processed: events.length,
        successful: results.successful,
        failed: results.failed,
        errors: results.errors,
        startTime,
        endTime,
        duration
      };

      this.logger.info(`📦 Lote completado: ${batchId}`, {
        processed: batchResult.processed,
        successful: batchResult.successful,
        failed: batchResult.failed,
        duration: `${duration}ms`
      });

      return batchResult;

    } catch (error) {
      this.logger.error(`💥 Error en lote ${batchId}`, error);
      return {
        batchId,
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [{ eventId: 'batch', error: error instanceof Error ? error.message : 'Error desconocido' }],
        startTime,
        endTime: new Date(),
        duration: 0
      };
    }
  }

  /**
   * Guarda un evento lean en Firestore
   */
  private async saveLeanEvent(leanEvent: ProjectEventLean): Promise<void> {
    // Preparar datos para Firestore (convertir Dates a Timestamps)
    const firestoreData = {
      ...leanEvent,
      eventDate: Timestamp.fromDate(leanEvent.eventDate),
      createdAt: leanEvent.createdAt ? Timestamp.fromDate(leanEvent.createdAt) : undefined,
      updatedAt: leanEvent.updatedAt ? Timestamp.fromDate(leanEvent.updatedAt) : undefined,
      // Agregar metadata de migración
      migratedAt: Timestamp.now(),
      migrationVersion: '1.0.0'
    };

    // Crear documento en nueva colección
    const docRef = doc(db, this.config.targetCollection, leanEvent.id);
    await setDoc(docRef, firestoreData);
  }

  /**
   * Muestra estadísticas finales
   */
  private logFinalStats(): void {
    const duration = this.stats.endTime 
      ? this.stats.endTime.getTime() - this.stats.startTime.getTime()
      : 0;

    this.logger.info('🏁 Migración completada', {
      stats: {
        processed: this.stats.processed,
        successful: this.stats.successful,
        failed: this.stats.failed,
        skipped: this.stats.skipped,
        successRate: `${Math.round((this.stats.successful / this.stats.processed) * 100)}%`,
        duration: `${Math.round(duration / 1000)}s`,
        eventsPerSecond: Math.round(this.stats.processed / (duration / 1000))
      }
    });
  }
}

// === EJECUCIÓN DEL SCRIPT ===

async function main() {
  console.log('🔄 Script de Migración: Eventos Legacy → Lean');
  console.log('================================================');

  // Parsear argumentos de línea de comandos
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '50');
  const logLevel = (args.find(arg => arg.startsWith('--log='))?.split('=')[1] || 'info') as any;

  // Configuración de migración
  const config: Partial<MigrationConfig> = {
    dryRun: isDryRun,
    batchSize,
    logLevel,
    preserveOriginal: true, // Siempre preservar originales por seguridad
  };

  console.log('Configuración:');
  console.log(`- Dry Run: ${isDryRun ? 'SÍ (usar --execute para ejecutar)' : 'NO'}`);
  console.log(`- Batch Size: ${batchSize}`);
  console.log(`- Log Level: ${logLevel}`);
  console.log('');

  try {
    const migrationService = new EventMigrationService(config);
    await migrationService.migrate();
    
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migración falló:', error);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

export { EventMigrationService, convertLegacyToLean, validateLeanEvent };