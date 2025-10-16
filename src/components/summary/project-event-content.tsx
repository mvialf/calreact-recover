import { ProjectSummary } from './project-summary';
import { cn } from '@/lib/utils';
import type { EventType } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeVariant } from '@/utils/badge-helpers';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';
import { TagBadge } from '@/components/custom/uninstall-tags';
import { Grid2x2 } from 'lucide-react';
import type { TagDisplayMode } from '@/types/tags';

interface ProjectEventContentProps {
  event: EventType;
  showProjectNumber?: boolean;
  showComuna?: boolean;
  showTechnicalDetails?: boolean;
  showUninstallTags?: boolean;
  layout?: 'stacked' | 'inline';
  size?: 'sm' | 'base' | 'lg';
  className?: string;
  tagDisplayMode?: TagDisplayMode; // Control de visualización de tags
}

/**
 * Componente reutilizable para renderizar el contenido visual de eventos de proyecto
 *
 * Centraliza la lógica de presentación de:
 * - Información del proyecto (número, cliente, glosa) via ProjectSummary
 * - Comuna con fallback automático (fullAddress.comune → componentes.comuna)
 * - Status del proyecto con badge visual
 * - Detalles técnicos (ventanas, metros cuadrados)
 * - Tags de desinstalación
 *
 * Diseñado para reutilización en múltiples contextos:
 * - CalendarEventCard (vista calendario)
 * - EventViewDialog (modal detalles)
 * - Listas de eventos
 * - Vistas de resumen
 *
 * @param event - Evento de calendario tipo 'Proyecto'
 * @param showProjectNumber - Mostrar número de proyecto (default: true)
 * @param showComuna - Mostrar comuna si está disponible (default: true)
 * @param showTechnicalDetails - Mostrar detalles técnicos (default: false)
 * @param showUninstallTags - Mostrar tags de desinstalación (default: false)
 * @param layout - Layout visual: 'stacked' (default) o 'inline'
 * @param size - Tamaño de fuente: 'sm' (default), 'base', 'lg'
 * @param className - Clases CSS adicionales
 *
 * @example
 * ```tsx
 * // En CalendarEventCard (vista compacta)
 * <ProjectEventContent
 *   event={event}
 *   size="sm"
 *   className="pr-6"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // En EventViewDialog (vista completa)
 * <ProjectEventContent
 *   event={event}
 *   size="base"
 *   layout="stacked"
 *   showTechnicalDetails={true}
 *   showUninstallTags={true}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // En lista compacta sin detalles
 * <ProjectEventContent
 *   event={event}
 *   layout="inline"
 *   showComuna={false}
 * />
 * ```
 */
export function ProjectEventContent({
  event,
  showProjectNumber = true,
  showComuna = true,
  showTechnicalDetails = false,
  showUninstallTags = false,
  layout = 'stacked',
  size = 'sm',
  className,
  tagDisplayMode = 'auto',
}: ProjectEventContentProps) {
  // Solo renderiza para eventos de tipo Proyecto
  if (event.type !== 'Proyecto') return null;

  // Lógica centralizada de comuna con fallback
  const comuna = event.fullAddress?.comune || event.fullAddress?.componentes?.comuna;

  // Extraer status del evento para renderizado
  const status = event.status;

  // Determinar si hay detalles técnicos
  const hasTechnicalDetails = event.windowsCount || event.squareMeters;
  const hasUninstallTags = event.uninstallTags && event.uninstallTags.length > 0;

  /**
   * Transforma un tag según el displayMode configurado
   */
  const transformTagForDisplay = (tag: NonNullable<typeof event.uninstallTags>[number]) => {
    switch (tagDisplayMode) {
      case 'name':
        // Forzar mostrar nombre completo (sin abbreviation)
        return { ...tag, abbreviation: undefined };

      case 'abbreviation':
        // Forzar mostrar abreviatura (generar si no existe)
        return {
          ...tag,
          abbreviation: tag.abbreviation || tag.name.substring(0, 2).toUpperCase()
        };

      case 'auto':
      default:
        // Comportamiento por defecto: abbreviation si existe, sino name
        return tag;
    }
  };

  // Mapeo de tamaños para comuna
  const comunaSizeClasses = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {/* Reutiliza ProjectSummary existente */}
      <ProjectSummary
        project={{
          projectNumber: event.projectNumber,
          clientName: event.clientName,
          glosa: event.glosa,
        }}
        showProjectNumber={showProjectNumber}
        layout={layout}
        size={size}
        className="text-foreground"
      />
      <div className="flex flex-row items-center gap-4">
        {/* Comuna con lógica de fallback centralizada */}
        {showComuna && comuna && (
          <p
            className={cn(comunaSizeClasses[size], 'text-muted-foreground truncate')}
          >
            {comuna}
          </p>
        )}
        {status && (
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(status)}>
              {PROJECT_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
            </Badge>
          </div>
        )}
      </div>

      {/* Detalles técnicos y tags de desinstalación */}
      {(showTechnicalDetails || showUninstallTags) && (hasTechnicalDetails || hasUninstallTags) && (
        <div className="flex flex-row gap-1">
          <Grid2x2 className="h-5 w-5 pt-1" />
          <div className="space-y-2">
            {/* Tags de desinstalación */}
            {showUninstallTags && hasUninstallTags && (
              <div className="flex flex-wrap gap-2">
                {event.uninstallTags!.map((tag) => (
                  <TagBadge key={tag.id} tag={transformTagForDisplay(tag)} />
                ))}
              </div>
            )}

            {/* Detalles técnicos */}
            {showTechnicalDetails && hasTechnicalDetails && (
              <div className="flex flex-wrap gap-2 items-start gap-3">
                <div className="flex flex-row text-sm gap-4">
                  {event.windowsCount && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Elementos:</span>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
