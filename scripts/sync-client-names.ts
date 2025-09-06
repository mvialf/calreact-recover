// scripts/sync-client-names.ts
import { syncProjectClientNames, getProjectClientSyncStats } from '@/services/clientSyncService';
import { db } from '@/lib/firebase/client';

/**
 * Script para sincronizar nombres de cliente en proyectos
 * Ejecutar con: npx tsx scripts/sync-client-names.ts
 */
async function runClientNameSync() {
  console.log('🚀 Iniciando script de sincronización de nombres de cliente...\n');

  try {
    // 1. Obtener estadísticas antes de la sincronización
    console.log('📊 Obteniendo estadísticas pre-sincronización...');
    const statsBefore = await getProjectClientSyncStats(db);
    
    console.log('📋 Estadísticas actuales:');
    console.log(`   • Total de proyectos: ${statsBefore.totalProjects}`);
    console.log(`   • Proyectos con clientId: ${statsBefore.projectsWithClientId}`);
    console.log(`   • Proyectos con clientName: ${statsBefore.projectsWithClientName}`);
    console.log(`   • Proyectos que necesitan sync: ${statsBefore.projectsNeedingSync}\n`);

    // 2. Ejecutar sincronización
    if (statsBefore.projectsNeedingSync > 0) {
      console.log('🔄 Ejecutando sincronización...');
      const updatedProjects = await syncProjectClientNames(db);
      console.log(`✅ ${updatedProjects} proyectos actualizados\n`);

      // 3. Obtener estadísticas después de la sincronización
      console.log('📊 Obteniendo estadísticas post-sincronización...');
      const statsAfter = await getProjectClientSyncStats(db);
      
      console.log('📋 Estadísticas después de la sincronización:');
      console.log(`   • Total de proyectos: ${statsAfter.totalProjects}`);
      console.log(`   • Proyectos con clientId: ${statsAfter.projectsWithClientId}`);
      console.log(`   • Proyectos con clientName: ${statsAfter.projectsWithClientName}`);  
      console.log(`   • Proyectos que necesitan sync: ${statsAfter.projectsNeedingSync}\n`);

      console.log('🎉 Sincronización completada exitosamente!');
    } else {
      console.log('ℹ️ No hay proyectos que requieran sincronización.');
    }

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runClientNameSync()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { runClientNameSync };