// src/components/calendar/event-renderers/ProjectEventRenderer.tsx
import type { EventType } from '@/types/event';
import { ProjectCalendarEventCardSummary } from '@/components/summary';
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
 * Maneja la lógica de interacción para eventos de proyecto en el calendario:
 * - Botón de acciones (dropdown) con ver/editar/eliminar
 * - Delega la presentación de datos a ProjectCalendarEventCardSummary
 *
 * Separación de responsabilidades:
 * - Este renderer: Lógica de INTERACCIÓN (dropdown, eventos)
 * - ProjectCalendarEventCardSummary: Lógica de PRESENTACIÓN (datos visuales)
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

      {/* Contenido del evento - Delegar presentación a componente dedicado */}
      <div className="pr-6">
        <ProjectCalendarEventCardSummary
          event={event}
          view={view}
        />
      </div>
    </div>
  );
};