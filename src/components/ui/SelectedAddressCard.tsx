/**
 * @fileoverview Componente para mostrar dirección seleccionada con acciones
 *
 * Card interactivo que muestra la dirección seleccionada con opciones para:
 * - Ver en mapa
 * - Copiar dirección
 * - Compartir ubicación
 * - Agregar información adicional (depto, block, etc.)
 * - Limpiar selección
 *
 * @version 1.0.0
 * @since Octubre 2025 - Fase 2 Refactoring AddressInput
 */

"use client";

import * as React from "react";
import { X, MoreVertical, Building, Copy, Map, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { GoogleMapsUtils } from "@/lib/google-maps-config";
import { uiLogger } from "@/lib/logger";
import type { FormattedAddress } from "@/types/project";

export interface SelectedAddressCardProps {
  /** Dirección seleccionada a mostrar */
  address: FormattedAddress;
  /** Información adicional (depto, block, etc.) */
  additionalInfo?: string;
  /** Callback cuando se limpia la dirección */
  onClear: () => void;
  /** Callback cuando cambia información adicional */
  onAdditionalInfoChange?: (info: string) => void;
  /** Mostrar acciones (Ver mapa, Copiar, etc.) */
  showActions?: boolean;
  /** Clase CSS adicional para el container */
  className?: string;
}

/**
 * Componente SelectedAddressCard
 *
 * Muestra la dirección seleccionada en un card con acciones interactivas
 *
 * @example
 * ```tsx
 * <SelectedAddressCard
 *   address={formattedAddress}
 *   additionalInfo="Depto 405"
 *   onClear={handleClear}
 *   onAdditionalInfoChange={handleInfoChange}
 * />
 * ```
 */
export function SelectedAddressCard({
  address,
  additionalInfo = "",
  onClear,
  onAdditionalInfoChange,
  showActions = true,
  className,
}: SelectedAddressCardProps) {
  const [showAdditionalInfoInput, setShowAdditionalInfoInput] = React.useState(false);
  const [localAdditionalInfo, setLocalAdditionalInfo] = React.useState(additionalInfo);
  const additionalInfoInputRef = React.useRef<HTMLInputElement>(null);

  // Sincronizar prop con estado local
  React.useEffect(() => {
    setLocalAdditionalInfo(additionalInfo);
  }, [additionalInfo]);

  // Auto-focus cuando se muestra el input
  React.useEffect(() => {
    if (showAdditionalInfoInput && additionalInfoInputRef.current) {
      additionalInfoInputRef.current.focus();
    }
  }, [showAdditionalInfoInput]);

  /**
   * Copiar dirección al portapapeles
   */
  const handleCopyAddress = React.useCallback(() => {
    if (address.textoCompleto) {
      navigator.clipboard.writeText(address.textoCompleto);
      uiLogger.debug('Dirección copiada al portapapeles');
    }
  }, [address.textoCompleto]);

  /**
   * Abrir dirección en Google Maps
   */
  const handleViewOnMap = React.useCallback(() => {
    if (!address.coordenadas) return;

    const mapUrl = GoogleMapsUtils.generateMapsUrl(
      address.coordenadas.latitude,
      address.coordenadas.longitude
    );
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  }, [address.coordenadas]);

  /**
   * Compartir ubicación usando Web Share API o WhatsApp
   */
  const handleShareLocation = React.useCallback(async () => {
    if (!address) return;

    const shareUrl = GoogleMapsUtils.generateShareUrl(
      address.textoCompleto,
      address.coordenadas?.latitude,
      address.coordenadas?.longitude
    );

    try {
      if (navigator.share) {
        const text = address.informacionAdicional
          ? `${address.textoCompleto} (${address.informacionAdicional})`
          : address.textoCompleto;

        await navigator.share({
          title: 'Ubicación',
          text,
          url: shareUrl,
        });
      } else {
        // Fallback para navegadores que no soportan Web Share API
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `${address.textoCompleto}${
            address.informacionAdicional ? `\n${address.informacionAdicional}` : ''
          }\n\nVer en mapa: ${shareUrl}`
        )}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      uiLogger.error('Error al compartir ubicación', err);
    }
  }, [address]);

  /**
   * Mostrar formulario de información adicional
   */
  const handleShowAdditionalInfo = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowAdditionalInfoInput(true);
  }, []);

  /**
   * Guardar información adicional
   */
  const handleSaveAdditionalInfo = React.useCallback((e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAdditionalInfoChange) {
      onAdditionalInfoChange(localAdditionalInfo);
    }

    setShowAdditionalInfoInput(false);
    uiLogger.debug('Información adicional guardada', { info: localAdditionalInfo });
  }, [localAdditionalInfo, onAdditionalInfoChange]);

  /**
   * Manejar cambio en input de información adicional
   */
  const handleAdditionalInfoInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAdditionalInfo(e.target.value);
  }, []);

  return (
    <div
      className={cn(
        "w-full bg-background border rounded-md p-3 relative group",
        className
      )}
      data-testid="selected-address"
    >
      <div className="space-y-1">
        {/* Header: Dirección + Info Adicional + Acciones (todo en una línea) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-medium">
              {address.componentes?.calle} {address.componentes?.numero}
            </span>

            {/* Información adicional inline */}
            {address.informacionAdicional && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{address.informacionAdicional}</span>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          {showActions && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Menú dropdown con acciones */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Más acciones"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Más acciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-2"
                  onInteractOutside={(e) => {
                    // Prevenir cierre cuando se interactúa con el formulario
                    if (showAdditionalInfoInput && e.target instanceof Element) {
                      const isInput = e.target.closest('input, button, form');
                      if (isInput) {
                        e.preventDefault();
                        return;
                      }
                    }
                    setShowAdditionalInfoInput(false);
                  }}
                >
                  <div className="relative">
                    {showAdditionalInfoInput ? (
                      // Formulario para agregar información adicional
                      <form
                        onSubmit={handleSaveAdditionalInfo}
                        className="space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          Información adicional (depto, block, etc.)
                        </div>
                        <div className="flex gap-1">
                          <Input
                            ref={additionalInfoInputRef}
                            type="text"
                            value={localAdditionalInfo}
                            onChange={handleAdditionalInfoInputChange}
                            placeholder="Ej: Depto 405, Block C"
                            className="h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                            data-testid="additional-info-input"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={handleSaveAdditionalInfo}
                          >
                            OK
                          </Button>
                        </div>
                      </form>
                    ) : (
                      // Opción para mostrar formulario
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          handleShowAdditionalInfo(e as unknown as React.MouseEvent);
                        }}
                      >
                        <Building className="mr-2 h-4 w-4" />
                        <span>Agregar información adicional</span>
                        {additionalInfo && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
                      </DropdownMenuItem>
                    )}
                  </div>

                  {/* Acciones de dirección */}
                  <DropdownMenuItem onClick={handleViewOnMap}>
                    <Map className="mr-2 h-4 w-4" />
                    <span>Ver en mapa</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyAddress}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copiar dirección</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      handleShareLocation();
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Compartir ubicación</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Botón limpiar */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onClear}
                aria-label="Limpiar dirección"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Limpiar dirección</span>
              </Button>
            </div>
          )}
        </div>

        {/* Comuna y región */}
        {address.componentes?.comuna && (
          <div className="text-sm text-muted-foreground">
            {address.componentes.comuna}
            {address.componentes.region && `, ${address.componentes.region}`}
          </div>
        )}
      </div>
    </div>
  );
}
