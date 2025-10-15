// src/components/calendar/event-renderers/ProjectEventRenderer.tsx
import type { EventType } from '@/types/event';
import { ProjectEventContent } from '@/components/summary/project-event-content';
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
 * Renderiza:
 * - ProjectEventContent (contenido visual reutilizable)
 * - EventActionsDropdown (acciones en hover)
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

  // Mostrar detalles técnicos y tags solo en vistas con más espacio
  const showDetails = view === 'week' || view === 'day';

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

      {/* Contenido reutilizable extraído */}
      <ProjectEventContent
        event={event}
        size="sm"
        className="pr-6"
        showTechnicalDetails={showDetails}
        showUninstallTags={showDetails}
      />
    </div>
  );
};