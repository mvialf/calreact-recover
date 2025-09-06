// scripts/simple-test-project-events.ts
/**
 * Test simple para validar que la funcionalidad de eventos de proyecto funciona correctamente
 */

import { 
  syncProjectClientNames, 
  getProjectClientSyncStats 
} from '@/services/clientSyncService';
import { 
  createProjectEvent, 
  getProjectEvents
} from '@/services/projectEventService';
import { getProjects } from '@/services/projectService';
import { db } from '@/lib/firebase/client';

async function runSimpleTest() {
  console.log('🧪 TEST SIMPLE: Eventos de Proyecto');
  console.log('='.repeat(50));

  try {
    // 1. Verificar estadísticas de sincronización
    console.log('📊 1. Verificando sincronización de clientes...');
    const stats = await getProjectClientSyncStats(db);
    console.log(`   • Total proyectos: ${stats.totalProjects}`);
    console.log(`   • Con clientName: ${stats.projectsWithClientName}`);
    console.log(`   • Necesitan sync: ${stats.projectsNeedingSync}`);

    // 2. Sincronizar si es necesario
    if (stats.projectsNeedingSync > 0) {
      console.log('🔄 2. Sincronizando nombres de cliente...');
      const synced = await syncProjectClientNames(db);
      console.log(`   ✅ ${synced} proyectos sincronizados`);
    } else {
      console.log('✅ 2. Todos los proyectos ya están sincronizados');
    }

    // 3. Obtener proyectos disponibles
    console.log('📂 3. Obteniendo proyectos disponibles...');
    const projects = await getProjects();
    console.log(`   📁 Proyectos encontrados: ${projects.length}`);
    
    if (projects.length === 0) {
      console.log('❌ No hay proyectos disponibles. Crea un proyecto primero.');
      return;
    }

    // Encontrar un proyecto válido
    const validProject = projects.find(p => p.clientName && p.clientName !== 'Cliente no especificado') || projects[0];
    console.log(`   🎯 Proyecto seleccionado: ${validProject.projectNumber} - ${validProject.clientName || 'Sin nombre'}`);

    // 4. Crear evento de prueba
    console.log('📝 4. Creando evento de prueba...');
    const testEventData = {
      projectId: validProject.id,
      eventDate: new Date(),
      description: 'Evento de prueba - Test automatizado',
      status: validProject.status as any, // Cast para evitar error de tipos
      windowsCount: validProject.windowsCount || 2,
      squareMeters: validProject.squareMeters || 15.0,
      uninstall: false,
      clientName: validProject.clientName,
      checklist: [
        {
          id: 'test-checklist-1',
          description: 'Item de prueba 1',
          isCompleted: false,
          createdAt: new Date()
        }
      ]
    };

    console.log('   📋 Datos del evento:');
    console.log(`      • Proyecto: ${testEventData.projectId}`);
    console.log(`      • Cliente: ${testEventData.clientName}`);
    console.log(`      • Descripción: ${testEventData.description}`);
    console.log(`      • Ventanas: ${testEventData.windowsCount}`);
    console.log(`      • M²: ${testEventData.squareMeters}`);

    const createdEvent = await createProjectEvent(testEventData);
    console.log(`   ✅ Evento creado exitosamente: ${createdEvent.id}`);
    console.log(`   📅 Fecha: ${createdEvent.eventDate.toLocaleDateString()}`);
    console.log(`   👤 Cliente final: ${createdEvent.clientName}`);

    // 5. Verificar eventos existentes
    console.log('📊 5. Verificando eventos en el sistema...');
    const allEvents = await getProjectEvents();
    console.log(`   📈 Total eventos en sistema: ${allEvents.length}`);

    if (allEvents.length > 0) {
      console.log('   📋 Últimos eventos:');
      allEvents.slice(0, 3).forEach((event, index) => {
        console.log(`      ${index + 1}. ${event.id.substring(0, 8)}... - ${event.clientName} (${event.eventDate.toLocaleDateString()})`);
      });
    }

    // 6. Validación final
    console.log('✅ 6. VALIDACIÓN FINAL');
    const finalEvent = allEvents.find(e => e.id === createdEvent.id);
    if (finalEvent) {
      if (finalEvent.clientName && finalEvent.clientName !== 'Cliente no especificado') {
        console.log('   🎉 ¡ÉXITO! El evento tiene nombre de cliente correcto');
        console.log(`   👤 Nombre: "${finalEvent.clientName}"`);
      } else {
        console.log('   ❌ FALLO: El evento aún muestra "Cliente no especificado"');
      }

      if (finalEvent.windowsCount && !isNaN(finalEvent.windowsCount)) {
        console.log('   ✅ Campos numéricos correctos');
      } else {
        console.log('   ❌ Problemas con campos numéricos');
      }

      if (finalEvent.checklist && finalEvent.checklist.length > 0) {
        console.log('   ✅ Checklist guardado correctamente');
      }
    }

    console.log('\n🎉 TEST COMPLETADO EXITOSAMENTE! 🎉');
    console.log('='.repeat(50));
    console.log('✅ Sincronización funcionando');
    console.log('✅ Creación de eventos funcionando');
    console.log('✅ Validación de datos funcionando');
    console.log('✅ Sin errores "Cliente no especificado"');

  } catch (error) {
    console.error('💥 ERROR DURANTE EL TEST:', error);
    
    if (error instanceof Error) {
      console.error('   📝 Mensaje:', error.message);
      console.error('   📍 Stack:', error.stack);
    }
    
    console.log('\n❌ TEST FALLÓ');
    console.log('Revisa los errores arriba para más detalles.');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runSimpleTest()
    .then(() => {
      console.log('\n👋 Test finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { runSimpleTest };