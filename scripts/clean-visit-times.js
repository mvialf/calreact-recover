/**
 * Script para limpiar las horas de las fechas de visitas en Firestore
 * Convierte todas las fechas de visitas para que solo contengan fecha (sin hora)
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin SDK
// Asegúrate de tener el archivo de credenciales de servicio
const serviceAccount = require('../firebase-service-account.json'); // Ajusta la ruta según tu configuración

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanVisitTimes() {
  try {
    console.log('🔄 Iniciando limpieza de horas en fechas de visitas...');
    
    // Obtener todas las visitas
    const visitsRef = db.collection('visits');
    const snapshot = await visitsRef.get();
    
    if (snapshot.empty) {
      console.log('📭 No se encontraron visitas en la base de datos.');
      return;
    }
    
    console.log(`📊 Encontradas ${snapshot.size} visitas para procesar.`);
    
    const batch = db.batch();
    let processedCount = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      if (data.scheduledDate) {
        // Convertir la fecha a solo fecha (sin hora)
        let scheduledDate = data.scheduledDate;
        
        // Si es un Timestamp de Firestore, convertirlo a Date
        if (scheduledDate.toDate) {
          scheduledDate = scheduledDate.toDate();
        }
        
        // Crear nueva fecha solo con año, mes y día (hora 00:00:00)
        const cleanDate = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
        
        // Actualizar el documento
        batch.update(doc.ref, {
          scheduledDate: admin.firestore.Timestamp.fromDate(cleanDate),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        processedCount++;
        console.log(`✅ Procesando visita: ${data.name || 'Sin nombre'} - Fecha original: ${scheduledDate.toISOString()} -> Nueva fecha: ${cleanDate.toISOString()}`);
      }
    });
    
    if (processedCount > 0) {
      // Ejecutar el batch
      await batch.commit();
      console.log(`🎉 ¡Limpieza completada! ${processedCount} visitas actualizadas.`);
    } else {
      console.log('ℹ️  No se encontraron visitas que requieran actualización.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    // Cerrar la conexión
    admin.app().delete();
  }
}

// Ejecutar el script
cleanVisitTimes();
