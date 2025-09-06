// Script para debuggear eventos del calendario
import { db } from '../src/lib/firebase/client';
import { getAllCalendarEvents } from '../src/services/calendarEventService';

async function debugCalendarEvents() {
  console.log('🔍 Debuggeando eventos del calendario...');
  
  try {
    const events = await getAllCalendarEvents(db);
    
    console.log(`📊 Total eventos encontrados: ${events.length}`);
    
    events.forEach((event, index) => {
      console.log(`\n--- Evento ${index + 1} ---`);
      console.log('ID:', event.id);
      console.log('Nombre:', event.name);
      console.log('Tipo:', event.type);
      console.log('Cliente:', event.clientName);
      console.log('FullAddress completo:', JSON.stringify(event.fullAddress, null, 2));
      console.log('FullAddress.comune:', event.fullAddress?.comune);
      console.log('FullAddress.componentes?.comuna:', event.fullAddress?.componentes?.comuna);
      console.log('Location:', event.location);
    });
    
  } catch (error) {
    console.error('❌ Error al debuggear eventos:', error);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  debugCalendarEvents().then(() => {
    console.log('✅ Debug completado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Error en debug:', error);
    process.exit(1);
  });
}

export { debugCalendarEvents };