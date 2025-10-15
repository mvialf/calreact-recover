/**
 * Script de migración: Agregar abbreviations a uninstallTags en proyectos y eventos
 *
 * PROBLEMA:
 * Los proyectos y eventos tienen uninstallTags sin el campo "abbreviation",
 * causando que las abreviaturas no se rendericen en el calendario.
 *
 * SOLUCIÓN:
 * 1. Cargar todos los tags de la colección uninstall-tags (con abbreviation)
 * 2. Actualizar proyectos: enriquecer uninstallTags[] con abbreviation
 * 3. Actualizar eventos: enriquecer uninstallTags[] con abbreviation
 *
 * USO:
 * npx tsx scripts/migrate-uninstall-tags-abbreviations.ts
 */

import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../src/lib/firebase/client';

interface TagReference {
  id: string;
  name: string;
  color: string;
  abbreviation?: string;
  createdAt?: any;
}

interface UninstallTagMaster {
  id: string;
  name: string;
  color: string;
  abbreviation: string;
  createdAt?: any;
  updatedAt?: any;
}

// ===== PASO 1: Cargar tags maestros =====
async function loadMasterTags(): Promise<Map<string, UninstallTagMaster>> {
  console.log('📦 Cargando tags maestros de uninstall-tags...');

  const tagsRef = collection(db, 'uninstall-tags');
  const snapshot = await getDocs(tagsRef);

  const tagsMap = new Map<string, UninstallTagMaster>();

  snapshot.docs.forEach(doc => {
    const data = doc.data();
    tagsMap.set(doc.id, {
      id: doc.id,
      name: data.name,
      color: data.color,
      abbreviation: data.abbreviation || data.name.substring(0, 2).toUpperCase(),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  });

  console.log(`✅ Cargados ${tagsMap.size} tags maestros`);
  return tagsMap;
}

// ===== PASO 2: Migrar proyectos =====
async function migrateProjects(tagsMap: Map<string, UninstallTagMaster>) {
  console.log('\n🔧 Migrando proyectos...');

  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('uninstallTags', '!=', []));
  const snapshot = await getDocs(q);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    const uninstallTags = data.uninstallTags as TagReference[] | undefined;

    if (!uninstallTags || uninstallTags.length === 0) {
      skippedCount++;
      continue;
    }

    // Verificar si ya tienen abbreviation
    const hasAbbreviations = uninstallTags.every(tag => tag.abbreviation !== undefined);
    if (hasAbbreviations) {
      skippedCount++;
      continue;
    }

    // Enriquecer tags con abbreviation
    const enrichedTags = uninstallTags.map(tag => {
      const masterTag = tagsMap.get(tag.id);

      if (masterTag) {
        return {
          ...tag,
          abbreviation: masterTag.abbreviation
        };
      }

      // Fallback: generar abbreviation desde nombre
      return {
        ...tag,
        abbreviation: tag.name.substring(0, 2).toUpperCase()
      };
    });

    try {
      // Actualizar proyecto
      await updateDoc(doc(db, 'projects', docSnapshot.id), {
        uninstallTags: enrichedTags
      });

      updatedCount++;
      console.log(`  ✅ Proyecto ${docSnapshot.id} actualizado (${enrichedTags.length} tags)`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error actualizando proyecto ${docSnapshot.id}:`, error);
    }
  }

  console.log(`\n📊 Resumen proyectos:`);
  console.log(`   - Actualizados: ${updatedCount}`);
  console.log(`   - Omitidos (ya tenían abbreviation): ${skippedCount}`);
  console.log(`   - Errores: ${errorCount}`);
}

// ===== PASO 3: Migrar eventos =====
async function migrateProjectEvents(tagsMap: Map<string, UninstallTagMaster>) {
  console.log('\n🔧 Migrando eventos de proyecto...');

  const eventsRef = collection(db, 'projectEvents');
  const q = query(eventsRef, where('uninstallTags', '!=', []));
  const snapshot = await getDocs(q);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    const uninstallTags = data.uninstallTags as TagReference[] | undefined;

    if (!uninstallTags || uninstallTags.length === 0) {
      skippedCount++;
      continue;
    }

    // Verificar si ya tienen abbreviation
    const hasAbbreviations = uninstallTags.every(tag => tag.abbreviation !== undefined);
    if (hasAbbreviations) {
      skippedCount++;
      continue;
    }

    // Enriquecer tags con abbreviation
    const enrichedTags = uninstallTags.map(tag => {
      const masterTag = tagsMap.get(tag.id);

      if (masterTag) {
        return {
          ...tag,
          abbreviation: masterTag.abbreviation
        };
      }

      // Fallback: generar abbreviation desde nombre
      return {
        ...tag,
        abbreviation: tag.name.substring(0, 2).toUpperCase()
      };
    });

    try {
      // Actualizar evento
      await updateDoc(doc(db, 'projectEvents', docSnapshot.id), {
        uninstallTags: enrichedTags
      });

      updatedCount++;
      console.log(`  ✅ Evento ${docSnapshot.id} actualizado (${enrichedTags.length} tags)`);
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error actualizando evento ${docSnapshot.id}:`, error);
    }
  }

  console.log(`\n📊 Resumen eventos:`);
  console.log(`   - Actualizados: ${updatedCount}`);
  console.log(`   - Omitidos (ya tenían abbreviation): ${skippedCount}`);
  console.log(`   - Errores: ${errorCount}`);
}

// ===== EJECUCIÓN PRINCIPAL =====
async function main() {
  console.log('🚀 Iniciando migración de abbreviations en uninstallTags...\n');

  try {
    // Paso 1: Cargar tags maestros
    const tagsMap = await loadMasterTags();

    // Paso 2: Migrar proyectos
    await migrateProjects(tagsMap);

    // Paso 3: Migrar eventos
    await migrateProjectEvents(tagsMap);

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Verificar en Firebase Console que los tags tienen abbreviation');
    console.log('   2. Recargar el calendario en la app');
    console.log('   3. Confirmar que las abreviaturas se muestran correctamente');

  } catch (error) {
    console.error('\n❌ Error fatal en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar
main().then(() => process.exit(0));
