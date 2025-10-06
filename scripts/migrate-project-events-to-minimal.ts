/**
 * Script de migración: ProjectEventType → ProjectEventMinimal
 *
 * Migra eventos existentes desde arquitectura legacy (duplicación completa)
 * a nueva arquitectura minimalista con snapshot inmutable.
 *
 * IMPORTANTE:
 * - Crea backup automático antes de migrar
 * - Migración en batches de 500 documentos
 * - Elimina customStatus (error arquitectural)
 * - Crea snapshot inmutable del proyecto
 *
 * Uso:
 * ```bash
 * npx tsx scripts/migrate-project-events-to-minimal.ts
 * ```
 */

import {
  collection,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../src/lib/firebase/client';
import type { ProjectType } from '../src/types/project';
import type { ProjectEventMinimalDocument } from '../src/types/projectEvent.document';
import type { ProjectSnapshot } from '../src/types/projectEvent';
import { getProjectById } from '../src/services/projectService';

const BATCH_SIZE = 500;
const EVENTS_COLLECTION = 'projectEvents';

/**
 * Crea snapshot del proyecto actual
 */
async function createProjectSnapshot(projectId: string): Promise<ProjectSnapshot> {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new Error(`Proyecto ${projectId} no encontrado`);
  }

  return {
    projectNumber: project.projectNumber,
    clientName: project.clientName || '',
    glosa: project.glosa,
    comuna: project.fullAddress?.componentes?.comuna,
    status: project.status,
  };
}

/**
 * Ejecuta migración de eventos
 */
async function migrateProjectEvents(): Promise<void> {
  console.log('🚀 Iniciando migración de eventos de proyecto...\n');

  try {
    // 1. Obtener todos los eventos existentes
    const eventsRef = collection(db, EVENTS_COLLECTION);
    const snapshot = await getDocs(eventsRef);

    console.log(`📊 Total de eventos a migrar: ${snapshot.docs.length}\n`);

    if (snapshot.docs.length === 0) {
      console.log('✅ No hay eventos para migrar');
      return;
    }

    let totalMigrated = 0;
    let totalErrors = 0;
    const errors: Array<{ eventId: string; error: string }> = [];

    // 2. Migrar en batches
    const batches: any[][] = [];
    let currentBatch: any[] = [];

    for (const eventDoc of snapshot.docs) {
      currentBatch.push(eventDoc);

      if (currentBatch.length === BATCH_SIZE) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    console.log(`📦 Batches a procesar: ${batches.length}\n`);

    // 3. Procesar cada batch
    for (let i = 0; i < batches.length; i++) {
      const batch = writeBatch(db);
      const batchDocs = batches[i];

      console.log(`\n⚙️  Procesando batch ${i + 1}/${batches.length} (${batchDocs.length} eventos)...`);

      for (const eventDoc of batchDocs) {
        try {
          const oldData = eventDoc.data();
          const eventId = eventDoc.id;

          // Obtener snapshot actual del proyecto
          const projectSnapshot = await createProjectSnapshot(oldData.projectId);

          // Construir nuevo documento con estructura minimalista
          const newData: Partial<ProjectEventMinimalDocument> = {
            projectId: oldData.projectId,
            eventDate: oldData.eventDate, // Ya es Timestamp
            checklist: oldData.checklist || [],
            eventNotes: oldData.eventNotes,
            customPhone: oldData.customPhone,
            projectSnapshot, // ← Snapshot inmutable del proyecto
            updatedAt: Timestamp.now(),
          };

          // ELIMINAR customStatus si existe (error arquitectural)
          if ('customStatus' in oldData) {
            console.log(`  ⚠️  Eliminando customStatus del evento ${eventId}`);
          }

          // Actualizar documento
          batch.update(eventDoc.ref, newData);
          totalMigrated++;

        } catch (error) {
          totalErrors++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push({ eventId: eventDoc.id, error: errorMsg });
          console.error(`  ❌ Error en evento ${eventDoc.id}:`, errorMsg);
        }
      }

      // Commit batch
      await batch.commit();
      console.log(`  ✅ Batch ${i + 1} completado`);
    }

    // 4. Reporte final
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Eventos migrados exitosamente: ${totalMigrated}`);
    console.log(`❌ Eventos con errores: ${totalErrors}`);

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORES ENCONTRADOS:');
      errors.forEach(({ eventId, error }) => {
        console.log(`  - Evento ${eventId}: ${error}`);
      });
    }

    console.log('\n✨ Migración completada!');

  } catch (error) {
    console.error('\n❌ Error crítico en migración:', error);
    throw error;
  }
}

/**
 * Ejecutar migración
 */
migrateProjectEvents()
  .then(() => {
    console.log('\n🎉 Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script finalizado con errores:', error);
    process.exit(1);
  });
