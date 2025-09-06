/**
 * Utilidad para limpiar las horas de las fechas de visitas en Firestore
 * Puede ejecutarse desde la aplicación web
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { eventLogger } from '@/lib/logger';

export interface CleanupResult {
  success: boolean;
  processedCount: number;
  totalCount: number;
  errors: string[];
}

/**
 * Limpia las horas de todas las fechas de visitas, dejando solo la fecha
 */
export async function cleanVisitTimes(): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: false,
    processedCount: 0,
    totalCount: 0,
    errors: []
  };

  try {
    eventLogger.info('🔄 Iniciando limpieza de horas en fechas de visitas...');
    
    // Obtener todas las visitas
    const visitsRef = collection(db, 'visits');
    const snapshot = await getDocs(visitsRef);
    
    result.totalCount = snapshot.size;
    
    if (snapshot.empty) {
      eventLogger.info('📭 No se encontraron visitas en la base de datos.');
      result.success = true;
      return result;
    }
    
    eventLogger.info(`📊 Encontradas ${snapshot.size} visitas para procesar.`);
    
    const updatePromises: Promise<void>[] = [];
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      if (data.scheduledDate) {
        const updatePromise = (async () => {
          try {
            // Convertir la fecha a solo fecha (sin hora)
            let scheduledDate = data.scheduledDate;
            
            // Si es un Timestamp de Firestore, convertirlo a Date
            if (scheduledDate.toDate) {
              scheduledDate = scheduledDate.toDate();
            } else if (typeof scheduledDate === 'string') {
              scheduledDate = new Date(scheduledDate);
            }
            
            // Crear nueva fecha solo con año, mes y día (hora 00:00:00)
            const cleanDate = new Date(
              scheduledDate.getFullYear(), 
              scheduledDate.getMonth(), 
              scheduledDate.getDate()
            );
            
            // Actualizar el documento
            await updateDoc(doc(db, 'visits', docSnap.id), {
              scheduledDate: cleanDate,
              updatedAt: serverTimestamp()
            });
            
            eventLogger.info(`✅ Actualizada visita: ${data.name || 'Sin nombre'} - ${scheduledDate.toDateString()} -> ${cleanDate.toDateString()}`);
            result.processedCount++;
            
          } catch (error) {
            const errorMsg = `Error actualizando visita ${docSnap.id}: ${error}`;
            eventLogger.error(`❌ ${errorMsg}`);
            result.errors.push(errorMsg);
          }
        })();
        
        updatePromises.push(updatePromise);
      }
    });
    
    // Ejecutar todas las actualizaciones
    await Promise.all(updatePromises);
    
    result.success = result.errors.length === 0;
    
    if (result.success) {
      eventLogger.info(`🎉 ¡Limpieza completada exitosamente! ${result.processedCount} visitas actualizadas.`);
    } else {
      eventLogger.warn(`⚠️ Limpieza completada con errores. ${result.processedCount} visitas actualizadas, ${result.errors.length} errores.`);
    }
    
  } catch (error) {
    const errorMsg = `Error durante la limpieza: ${error}`;
    eventLogger.error(`❌ ${errorMsg}`);
    result.errors.push(errorMsg);
    result.success = false;
  }
  
  return result;
}

/**
 * Función de conveniencia para ejecutar desde la consola del navegador
 * Uso: await window.cleanVisitTimes()
 */
export function exposeCleanupFunction() {
  if (typeof window !== 'undefined') {
    (window as any).cleanVisitTimes = cleanVisitTimes;
    eventLogger.info('🔧 Función cleanVisitTimes() disponible en window. Ejecuta: await window.cleanVisitTimes()');
  }
}
