import { Ruler, Tag as TagIcon, FileText } from 'lucide-react';
import { TagBadge } from '@/components/ui/tag-badge';
import type { EventType } from '@/types/event';

interface ProjectEventDetailsProps {
  event: EventType;
}

/**
 * Componente para mostrar detalles técnicos de eventos de proyecto
 *
 * Muestra información estructurada del proyecto en el EventViewDialog:
 * - Detalles técnicos: cantidad de ventanas y metros cuadrados
 * - Tags de desinstalación con colores personalizados
 * - Descripción del evento (si existe)
 *
 * @param event - Evento de tipo 'Proyecto' con información técnica
 * @returns null si no es evento de proyecto o no hay datos para mostrar
 *
 * @example
 * ```tsx
 * <ProjectEventDetails event={projectEvent} />
 * ```
 */
export function ProjectEventDetails({ event }: ProjectEventDetailsProps) {
  // Solo renderiza para eventos de tipo Proyecto
  if (event.type !== 'Proyecto') return null;

  const hasTechnicalDetails = event.windowsCount || event.squareMeters;
  const hasUninstallTags = event.uninstallTags && event.uninstallTags.length > 0;

  // Si no hay datos técnicos, tags ni descripción, no renderiza nada
  if (!hasTechnicalDetails && !hasUninstallTags && !event.description) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Detalles Técnicos */}
      {hasTechnicalDetails && (
        <div className="flex items-start gap-3">
          <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Detalles Técnicos</p>
            <div className="text-sm text-muted-foreground space-y-1">
              {event.windowsCount && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Ventanas:</span>
                  <span>{event.windowsCount}</span>
                </div>
              )}
              {event.squareMeters && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Superficie:</span>
                  <span>{event.squareMeters} m²</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tags de Desinstalación */}
      {hasUninstallTags && (
        <div className="flex items-start gap-3">
          <TagIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Tags de Desinstalación</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {event.uninstallTags!.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Descripción */}
      {event.description && (
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Descripción</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
