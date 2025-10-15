/**
 * Script para agregar campo abbreviation faltante al tag Aluminio del proyecto 17870
 *
 * Problema: El proyecto tiene tags sin abbreviation, causando que eventos
 * hereden datos incompletos y muestren nombres completos en lugar de abreviaciones.
 *
 * Solución: Agregar abbreviation: "AL" al tag de Aluminio
 */

import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { FIREBASE_CONFIG } from '../src/constants/firebase';

async function fixProject17870Tags() {
  console.log('🔧 Iniciando corrección de tags del proyecto 17870...\n');

  // Inicializar Firebase
  const app = initializeApp(FIREBASE_CONFIG);
  const firestore = getFirestore(app);

  const projectId = 'ch6T7gLoHBHJVESipW2I'; // Proyecto 17870

  try {
    // Actualizar el proyecto con tags completos
    const projectRef = doc(firestore, 'projects', projectId);

    await updateDoc(projectRef, {
      uninstallTags: [
        {
          id: 'Uh8Q4A363QByl1kXOfAZ',
          name: 'Aluminio',
          color: 'sky',
          abbreviation: 'AL', // ✅ AGREGADO
          createdAt: new Date('2025-09-21T10:27:53.934Z')
        },
        {
          id: '9WaoIE0pR4iTFPyJnarb',
          name: 'Madera',
          color: 'yellow',
          abbreviation: 'MD', // ✅ AGREGADO (ya existía pero lo incluimos explícitamente)
          createdAt: new Date('2025-09-21T10:26:36.777Z')
        }
      ]
    });

    console.log('✅ Proyecto 17870 actualizado exitosamente');
    console.log('   - Tag Aluminio: abbreviation "AL" agregado');
    console.log('   - Tag Madera: abbreviation "MD" confirmado');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Eliminar evento de prueba LuiCVpcg90zIR4thVZhx');
    console.log('   2. Crear nuevo evento de prueba');
    console.log('   3. Verificar que muestre "AL" y "MD" en calendario\n');

  } catch (error) {
    console.error('❌ Error al actualizar proyecto:', error);
    throw error;
  }
}

// Ejecutar script
fixProject17870Tags()
  .then(() => {
    console.log('✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
