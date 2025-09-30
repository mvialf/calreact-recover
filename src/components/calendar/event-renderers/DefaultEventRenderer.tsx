// src/components/calendar/event-renderers/DefaultEventRenderer.tsx
import { isSameDay } from 'date-fns';
import type { EventRendererProps } from './ProjectEventRenderer';

/**
 * Formatea fecha local en formato legible para español-Chile
 */
const formatLocalDate = (date: Date): string => {
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short'
  });
};

/**
 * Renderer por defecto para eventos sin renderer específico
 *
 * Extrae la lógica de renderizado genérica que antes estaba en el
 * else de calendar-event.tsx (líneas 224-236).
 *
 * Renderiza:
 * - Nombre del evento (siempre visible)
 * - Rango de fechas (solo si es multi-día)
 * - Descripción (solo para eventos de un día en vistas week/day)
 *
 * Este renderer se usa como fallback cuando no hay renderer específico
 * para un tipo de evento (ej: Visita, Postventa antes de implementarlos).
 *
 * @param event - Evento de calendario genérico
 * @param view - Vista actual del calendario (month/week/day)
 */
export const DefaultEventRenderer: React.FC<EventRendererProps> = ({ event, view }) => {
  // Determinar si el evento abarca múltiples días
  const isMultiDay = !isSameDay(event.startDate, event.endDate);

  return (
    <>
      {/* Nombre del evento siempre visible */}
      <div className="font-semibold truncate">{event.name}</div>

      {/* Mostrar rango de fechas solo para eventos multi-día */}
      {isMultiDay && (
        <div className="text-xs opacity-80 truncate">
          {formatLocalDate(event.startDate)} - {formatLocalDate(event.endDate)}
        </div>
      )}

      {/* Mostrar descripción para eventos de un día en vistas week/day */}
      {!isMultiDay && view !== 'month' && event.description && (
        <p className="text-xs truncate opacity-75 mt-0.5">
          {event.description}
        </p>
      )}
    </>
  );
};