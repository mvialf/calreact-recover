// src/components/calendar/event-renderers/ProjectEventRenderer.tsx
import type { EventType } from '@/types/event';
import { ProjectSummary } from '@/components/summary';
import { EventActionsDropdown } from '../EventActionsDropdown';

/**
 * Props para todos los event renderers
 */
export interface EventRendererProps {
  event: EventType;
  view: 'month' | 'week' | 'day';
  onClick?: (event: EventType) => void;   // Ver detalles
  onEdit?: (event: EventType) => void;    // Editar
  onDelete?: (event: EventType) => void;  // Eliminar
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
 * - Botón de acciones (dropdown) en esquina superior derecha
 *
 * @param event - Evento de calendario con campos específicos de proyecto
 * @param view - Vista actual del calendario (month/week/day)
 * @param onClick - Handler para ver detalles (opcional)
 * @param onEdit - Handler para editar (opcional)
 * @param onDelete - Handler para eliminar (opcional)
 */
export const ProjectEventRenderer: React.FC<EventRendererProps> = ({
  event,
  view,
  onClick,
  onEdit,
  onDelete,
}) => {
  // Mostrar dropdown solo si hay al menos un handler disponible
  const showDropdown = onClick || onEdit || onDelete;

  return (
    <div className="relative group">
      {/* Botón de acciones (visible en hover en desktop, siempre en mobile) */}
      {showDropdown && (
        <div className="absolute top-0 right-0 z-10 opacity-0 sm:group-hover:opacity-100 sm:opacity-0 opacity-100 transition-opacity">
          <EventActionsDropdown
            event={event}
            onView={onClick || (() => {})}
            onEdit={onEdit || (() => {})}
            onDelete={onDelete || (() => {})}
          />
        </div>
      )}

      {/* Contenido del evento */}
      <div className="space-y-1 pr-6">
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
    </div>
  );
};