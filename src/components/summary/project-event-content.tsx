import { ProjectSummary } from './project-summary';
import { cn } from '@/lib/utils';
import type { EventType } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeVariant } from '@/utils/badge-helpers';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';

interface ProjectEventContentProps {
  event: EventType;
  showProjectNumber?: boolean;
  showComuna?: boolean;
  layout?: 'stacked' | 'inline';
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

/**
 * Componente reutilizable para renderizar el contenido visual de eventos de proyecto
 *
 * Centraliza la lógica de presentación de:
 * - Información del proyecto (número, cliente, glosa) via ProjectSummary
 * - Comuna con fallback automático (fullAddress.comune → componentes.comuna)
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
 * @param layout - Layout visual: 'stacked' (default) o 'inline'
 * @param size - Tamaño de fuente: 'sm' (default), 'base', 'lg'
 * @param className - Clases CSS adicionales
 *
 * @example
 * ```tsx
 * // En CalendarEventCard (uso actual)
 * <ProjectEventContent
 *   event={event}
 *   size="sm"
 *   className="pr-6"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // En EventViewDialog (futuro uso)
 * <ProjectEventContent
 *   event={event}
 *   size="base"
 *   layout="stacked"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // En lista compacta
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
  layout = 'stacked',
  size = 'sm',
  className,
}: ProjectEventContentProps) {
  // Solo renderiza para eventos de tipo Proyecto
  if (event.type !== 'Proyecto') return null;

  // Lógica centralizada de comuna con fallback
  const comuna = event.fullAddress?.comune || event.fullAddress?.componentes?.comuna;

  // Extraer status del evento para renderizado
  const status = event.status;

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
      <div className= "flex flex-row gap-4">
        
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
    </div>
  );
}
