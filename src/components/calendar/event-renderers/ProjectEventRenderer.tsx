// src/components/calendar/event-renderers/ProjectEventRenderer.tsx
import type { EventType } from '@/types/event';
import { ProjectSummary } from '@/components/summary';

/**
 * Props para todos los event renderers
 */
export interface EventRendererProps {
  event: EventType;
  view: 'month' | 'week' | 'day';
}

/**
 * Renderer específico para eventos de tipo 'Proyecto'
 *
 * Extrae la lógica de renderizado específica de proyectos que antes
 * estaba hardcodeada en calendar-event.tsx (líneas 201-222).
 *
 * Renderiza:
 * - ProjectSummary con número, cliente y glosa
 * - Comuna del proyecto (fullAddress.comune o componentes.comuna como fallback)
 *
 * @param event - Evento de calendario con campos específicos de proyecto
 * @param view - Vista actual del calendario (month/week/day) - no usado actualmente
 */
export const ProjectEventRenderer: React.FC<EventRendererProps> = ({ event }) => {
  return (
    <div className="space-y-1">
      {/* Componente reutilizable de ProjectSummary */}
      <ProjectSummary
        project={{
          projectNumber: event.projectNumber,
          clientName: event.clientName,
          glosa: event.glosa
        }}
        className="text-foreground text-xs"
      />

      {/* Mostrar comuna si está disponible */}
      {event.fullAddress?.comune && (
        <p className="text-xs text-muted-foreground truncate">
          {event.fullAddress.comune}
        </p>
      )}

      {/* Fallback: mostrar desde componentes si existe */}
      {!event.fullAddress?.comune && event.fullAddress?.componentes?.comuna && (
        <p className="text-xs text-muted-foreground truncate">
          {event.fullAddress.componentes.comuna}
        </p>
      )}
    </div>
  );
};