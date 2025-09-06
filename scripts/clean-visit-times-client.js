/**
 * Script para limpiar las horas de las fechas de visitas en Firestore
 * Usa Firebase Client SDK (mismo que la aplicación)
 */

// Este script debe ejecutarse en un entorno Node.js con las variables de entorno configuradas
require('dotenv').config({ path: '../.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase (usando las mismas variables de entorno que la app)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar configuración
const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.error('❌ Faltan variables de entorno:', missingConfig.join(', '));
  console.error('💡 Asegúrate de tener un archivo .env.local con las variables de Firebase');
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanVisitTimes() {
  try {
    console.log('🔄 Iniciando limpieza de horas en fechas de visitas...');
    console.log('🔗 Conectando a proyecto:', firebaseConfig.projectId);
    
    // Obtener todas las visitas
    const visitsRef = collection(db, 'visits');
    const snapshot = await getDocs(visitsRef);
    
    if (snapshot.empty) {
      console.log('📭 No se encontraron visitas en la base de datos.');
      return;
    }
    
    console.log(`📊 Encontradas ${snapshot.size} visitas para procesar.`);
    
    let processedCount = 0;
    const promises = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      if (data.scheduledDate) {
        // Convertir la fecha a solo fecha (sin hora)
        let scheduledDate = data.scheduledDate;
        
        // Si es un Timestamp de Firestore, convertirlo a Date
        if (scheduledDate.toDate) {
          scheduledDate = scheduledDate.toDate();
        } else if (typeof scheduledDate === 'string') {
          scheduledDate = new Date(scheduledDate);
        }
        
        // Crear nueva fecha solo con año, mes y día (hora 00:00:00)
        const cleanDate = new Date(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
        
        // Crear promesa de actualización
        const updatePromise = updateDoc(doc(db, 'visits', docSnap.id), {
          scheduledDate: cleanDate,
          updatedAt: serverTimestamp()
        }).then(() => {
          console.log(`✅ Actualizada visita: ${data.name || 'Sin nombre'} - ${scheduledDate.toDateString()} -> ${cleanDate.toDateString()}`);
        }).catch((error) => {
          console.error(`❌ Error actualizando visita ${docSnap.id}:`, error);
        });
        
        promises.push(updatePromise);
        processedCount++;
      }
    });
    
    if (promises.length > 0) {
      // Ejecutar todas las actualizaciones
      await Promise.all(promises);
      console.log(`🎉 ¡Limpieza completada! ${processedCount} visitas procesadas.`);
    } else {
      console.log('ℹ️  No se encontraron visitas que requieran actualización.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    
    if (error.code === 'permission-denied') {
      console.error('🔒 Error de permisos. Asegúrate de que las reglas de Firestore permitan escritura.');
    } else if (error.code === 'unavailable') {
      console.error('🌐 Error de conexión. Verifica tu conexión a internet.');
    }
  }
}

// Ejecutar el script
console.log('🚀 Iniciando script de limpieza de fechas de visitas...');
cleanVisitTimes()
  .then(() => {
    console.log('✨ Script completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
