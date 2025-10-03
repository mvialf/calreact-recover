'use client';

import { MapPin, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FormattedAddress } from '@/types/project';

/**
 * Props para el componente AddressSummary
 */
interface AddressSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Dirección formateada a mostrar */
  address: FormattedAddress | null | undefined;
  /** Mostrar solo calle y número (modo compacto) */
  compact?: boolean;
  /** Variante de layout */
  layout?: 'stacked' | 'inline';
  /** Mostrar ícono de ubicación */
  showIcon?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente para mostrar un resumen condensado de dirección
 * de manera consistente en toda la aplicación.
 *
 * @description
 * Este componente maneja la visualización de direcciones con la siguiente lógica:
 * - Muestra calle y número como información principal
 * - Incluye información adicional (depto, block) si está disponible
 * - Muestra comuna y región como información secundaria
 * - Soporta modo compacto para espacios reducidos
 * - Layout flexible (stacked para tablas, inline para textos)
 *
 * @example
 * ```tsx
 * // Caso básico completo (para tablas)
 * <AddressSummary address={project.fullAddress} />
 *
 * // Sin ícono
 * <AddressSummary address={visit.fullAddress} showIcon={false} />
 *
 * // Layout inline compacto (para espacios reducidos)
 * <AddressSummary
 *   address={client.address}
 *   layout="inline"
 *   compact={true}
 *   className="text-xs"
 * />
 *
 * // Stacked con información completa (default)
 * <AddressSummary
 *   address={afterSale.address}
 *   layout="stacked"
 *   showIcon={true}
 * />
 * ```
 *
 * @param props - Props del componente AddressSummary
 * @returns JSX.Element renderizado
 */
export function AddressSummary({
  address,
  compact = false,
  layout = 'stacked',
  showIcon = true,
  className,
  ...props
}: AddressSummaryProps) {
  // Manejar caso de dirección nula o indefinida
  if (!address) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)} {...props}>
        Sin dirección
      </div>
    );
  }

  // Construir partes de la dirección
  const calle = address.componentes?.calle || '';
  const numero = address.componentes?.numero || '';
  const direccionPrincipal = `${calle} ${numero}`.trim() || address.textoCompleto;
  const infoAdicional = address.informacionAdicional?.trim();
  const comuna = address.componentes?.comuna;
  const region = address.componentes?.region;

  // Layout inline para espacios reducidos
  if (layout === 'inline') {
    const parts: string[] = [];

    // Dirección principal
    if (direccionPrincipal) {
      parts.push(direccionPrincipal);
    }

    // Info adicional (solo si no es compact)
    if (infoAdicional && !compact) {
      parts.push(infoAdicional);
    }

    // Comuna (siempre, a menos que sea compact)
    if (comuna && !compact) {
      parts.push(comuna);
    }

    const displayText = parts.join(', ');

    return (
      <div
        className={cn('text-sm text-foreground truncate', className)}
        title={address.textoCompleto}
        {...props}
      >
        {showIcon && <MapPin className="inline h-3.5 w-3.5 mr-1.5 text-muted-foreground" />}
        {displayText}
      </div>
    );
  }

  // Layout stacked por defecto (mejor para tablas y listas)
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {/* Línea principal: Dirección + Info adicional */}
      <div className="flex items-center gap-2 text-sm">
        {showIcon && <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-medium truncate">
            {direccionPrincipal}
          </span>

          {/* Información adicional inline (depto, block, etc.) */}
          {infoAdicional && !compact && (
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
              <Building className="h-3.5 w-3.5" />
              <span className="text-sm truncate">{infoAdicional}</span>
            </div>
          )}
        </div>
      </div>

      {/* Línea secundaria: Comuna y región (solo si no es compact) */}
      {!compact && (comuna || region) && (
        <div className={cn(
          'text-sm text-muted-foreground',
          showIcon && 'pl-6'
        )}>
          {comuna}
          {comuna && region && ', '}
          {region}
        </div>
      )}
    </div>
  );
}
