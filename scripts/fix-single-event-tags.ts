/**
 * Script de prueba: Actualizar UN evento con abbreviations
 * Demostración de la solución antes de aplicar a todos los documentos
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin (solo si no está inicializado)
if (getApps().length === 0) {
  // Para desarrollo, usar emulator o credenciales de servicio
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-project-id',
  });
}

const db = getFirestore();

async function fixSingleEvent() {
  const eventId = 'HJixowmpBK6TOif2FRJk';

  console.log(`🔧 Actualizando evento ${eventId}...`);

  try {
    const eventRef = db.collection('projectEvents').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      console.error('❌ Evento no encontrado');
      return;
    }

    const data = eventDoc.data();
    const uninstallTags = data?.uninstallTags || [];

    console.log('📋 Tags actuales:', JSON.stringify(uninstallTags, null, 2));

    // Agregar abbreviations
    const enrichedTags = uninstallTags.map((tag: any) => {
      // Mapeo manual basado en los IDs conocidos
      const abbreviations: Record<string, string> = {
        'Uh8Q4A363QByl1kXOfAZ': 'AL', // Aluminio
        '9WaoIE0pR4iTFPyJnarb': 'MD', // Madera
        'OML9AaUbrPE6bQmF4gW1': 'FE', // Fierro
      };

      return {
        ...tag,
        abbreviation: abbreviations[tag.id] || tag.name.substring(0, 2).toUpperCase()
      };
    });

    console.log('✨ Tags enriquecidos:', JSON.stringify(enrichedTags, null, 2));

    // Actualizar documento
    await eventRef.update({ uninstallTags: enrichedTags });

    console.log('✅ Evento actualizado exitosamente!');
    console.log('\n📝 Próximo paso: Recargar calendario para ver cambios');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixSingleEvent().then(() => process.exit(0));
