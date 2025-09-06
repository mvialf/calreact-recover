// src/lib/firebase/firestore.ts
/**
 * ⚠️  ARCHIVO DEPRECATED - JULIO 2025 ⚠️
 * 
 * Este archivo contenía funciones para el sistema general de eventos
 * que fue eliminado durante la refactorización de arquitectura de eventos.
 * 
 * MIGRACIÓN COMPLETADA:
 * - Sistema 'events' eliminado ✅
 * - Reemplazado por arquitectura específica por dominio ✅
 * - ProjectEvents → src/services/projectEventService.ts ✅
 * - CalendarEvents → src/services/calendarEventService.ts ✅
 * 
 * FUNCIONES MIGRADAS:
 * - getEvents() → getAllCalendarEvents() en calendarEventService.ts
 * - addEvent() → Usar APIs específicas por dominio (createProjectEvent, etc.)
 * - updateEvent() → Usar APIs específicas por dominio (updateProjectEvent, etc.) 
 * - deleteEvent() → Usar APIs específicas por dominio (deleteProjectEvent, etc.)
 * 
 * COLECCIONES FIRESTORE:
 * - 'events' (deprecated) → 'projectEvents' (activa)
 * 
 * Para nuevos desarrollos, usar:
 * - ProjectEvents: src/services/projectEventService.ts
 * - Calendario: src/services/calendarEventService.ts
 * - Sincronización: src/services/clientSyncService.ts
 */

// Exportaciones vacías para evitar errores de importación durante la transición
export const getEvents = () => {
  throw new Error('getEvents() deprecated - usar getAllCalendarEvents() de calendarEventService.ts');
};

export const addEvent = () => {
  throw new Error('addEvent() deprecated - usar APIs específicas por dominio (createProjectEvent, etc.)');
};

export const updateEvent = () => {
  throw new Error('updateEvent() deprecated - usar APIs específicas por dominio (updateProjectEvent, etc.)');
};

export const deleteEvent = () => {
  throw new Error('deleteEvent() deprecated - usar APIs específicas por dominio (deleteProjectEvent, etc.)');
};