import { FileText, Phone, Grid2x2 } from 'lucide-react';
import { TagBadge } from '@/components/ui/tag-badge';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeVariant } from '@/utils/badge-helpers';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';
import { AddressSummary } from '@/components/summary/address-summary';
import type { EventType } from '@/types/event';

interface ProjectEventDetailsProps {
  event: EventType;
  status?: string; // Status del proyecto (opcional, computado)
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
export function ProjectEventDetails({ event, status }: ProjectEventDetailsProps) {
  // Solo renderiza para eventos de tipo Proyecto
  if (event.type !== 'Proyecto') return null;

  const hasTechnicalDetails = event.windowsCount || event.squareMeters;
  const hasUninstallTags = event.uninstallTags && event.uninstallTags.length > 0;

  // Si no hay datos para mostrar, no renderiza nada
  if (!hasTechnicalDetails && !hasUninstallTags && !event.description && !event.phone && !status && !event.fullAddress) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Teléfono y Estado */}
      {(event.phone || status) && (
        <div className="flex flex-row gap-4 text-sm">
          {event.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{event.phone}</span>
            </div>
          )}
          {status && (
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(status)}>
                {PROJECT_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Dirección */}
      {event.fullAddress && (
        <AddressSummary
          address={{
            placeId: '',
            textoCompleto: event.fullAddress.textoCompleto || '',
            coordenadas: event.fullAddress.coordenadas || { latitude: 0, longitude: 0 },
            componentes: event.fullAddress.componentes,
            informacionAdicional: event.fullAddress.informacionAdicional,
            comune: event.fullAddress.comune
          }}
        />
      )}

      <div className='flex flex-row gap-1      '>
         <Grid2x2 className="h-5 w-5 pt-1" />
         <div className='space-y-2'>
        {hasUninstallTags && event.uninstallTags && event.uninstallTags.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm">Desinstalación</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {event.uninstallTags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Detalles Técnicos */}
        {hasTechnicalDetails && (
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
      {/* Descripción */}
      {event.description && event.description.trim() && (
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
