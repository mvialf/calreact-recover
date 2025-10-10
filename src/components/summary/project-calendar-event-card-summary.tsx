'use client';

import { Badge } from '@/components/ui/badge';
import { ProjectSummary } from '@/components/summary';
import { getStatusBadgeVariant } from '@/utils/badge-helpers';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';
import type { EventType } from '@/types/event';
import { cn } from '@/lib/utils';
import { TagBadge } from '@/components/ui/custom/tags';

/**
 * Props para el componente ProjectCalendarEventCardSummary
 */
interface ProjectCalendarEventCardSummaryProps {
  /** Evento de calendario con datos del proyecto */
  event: EventType;

  /** Vista actual del calendario para adaptar nivel de detalle */
  view: 'month' | 'week' | 'day';

  /** Opciones de visualización */
  options?: {
    /** Mostrar número del proyecto */
    showProjectNumber?: boolean;
    /** Mostrar información del cliente */
    showClientName?: boolean;
    /** Mostrar badge de status del proyecto */
    showStatus?: boolean;
    /** Mostrar comuna */
    showComuna?: boolean;
  };

  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente para mostrar información de proyecto en tarjetas de calendario
 * de manera consistente y extensible.
 *
 * @description
 * Renderiza datos de proyecto específicamente para el contexto de calendario:
 * - Número de proyecto y nombre del cliente (via ProjectSummary)
 * - Badge de status del proyecto con colores consistentes
 * - Comuna del proyecto
 * - Extensible para mostrar más información según vista (month/week/day)
 *
 * Este componente separa la lógica de presentación de datos de la lógica
 * de interacción (dropdown de acciones) que permanece en ProjectEventRenderer.
 *
 * @example
 * ```tsx
 * // Uso básico (muestra todo)
 * <ProjectCalendarEventCardSummary
 *   event={event}
 *   view="month"
 * />
 *
 * // Vista compacta (solo número y cliente)
 * <ProjectCalendarEventCardSummary
 *   event={event}
 *   view="month"
 *   options={{ showStatus: false, showComuna: false }}
 * />
 *
 * // Vista detallada (preparado para más elementos)
 * <ProjectCalendarEventCardSummary
 *   event={event}
 *   view="day"
 *   options={{ showStatus: true, showComuna: true }}
 * />
 * ```
 *
 * @param props - Props del componente ProjectCalendarEventCardSummary
 * @returns JSX.Element renderizado
 */
export function ProjectCalendarEventCardSummary({
  event,
  view,
  options = {},
  className
}: ProjectCalendarEventCardSummaryProps) {
  // Extraer label del status desde las opciones configuradas
  const statusOption = PROJECT_STATUS_OPTIONS.find(
    opt => opt.value === event.status
  );

  return (
    <div className={cn("space-y-1", className)}>
      {/* Reutilizar ProjectSummary para número de proyecto + cliente + glosa */}
      {(options.showProjectNumber !== false ||
        options.showClientName !== false) && (
        <ProjectSummary
          project={{
            projectNumber: event.projectNumber,
            clientName: event.clientName,
            glosa: event.glosa
          }}
          showProjectNumber={options.showProjectNumber ?? true}
          showClientInfo={options.showClientName ?? true}
          className="text-xs"
        />
      )}
      <div className= "flex flex-row items-center gap-4">

      {/* Badge de status del proyecto */}
      {options.showStatus !== false && event.status && (
        <Badge
          variant={getStatusBadgeVariant(event.status)}
          className="text-xs"
        >
          {statusOption?.label || event.status}
        </Badge>
      )}

      {/* Comuna del proyecto */}
      {options.showComuna !== false && event.fullAddress?.comune && (
        <p className="text-xs text-muted-foreground truncate">
          {event.fullAddress.comune}
        </p>
      )}

      {/* Fallback: mostrar comuna desde componentes si existe */}
      {options.showComuna !== false &&
       !event.fullAddress?.comune &&
       event.fullAddress?.componentes?.comuna && (
        <p className="text-xs text-muted-foreground truncate">
          {event.fullAddress.componentes.comuna}
        </p>
      )}

      {/* Tags de desinstalación (muestra abbreviation o genera automáticamente) */}
      {event.uninstallTags && event.uninstallTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {event.uninstallTags.map((tag) => (
            <TagBadge
              key={tag.id}
              tag={{
                ...tag,
                abbreviation: tag.abbreviation || tag.name.substring(0, 2).toUpperCase()
              }}
              className="text-[10px]"
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
