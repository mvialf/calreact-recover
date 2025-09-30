// src/components/calendar/event-renderers/index.ts
import type { EventType } from '@/types/event';
import { ProjectEventRenderer } from './ProjectEventRenderer';
import { DefaultEventRenderer } from './DefaultEventRenderer';
import type { EventRendererProps } from './ProjectEventRenderer';

/**
 * Tipo para componentes renderer de eventos
 */
export type EventRenderer = React.FC<EventRendererProps>;

/**
 * Registry de renderers por tipo de evento
 *
 * Este es el corazón del Registry Pattern. Mapea cada tipo de evento
 * (string del campo 'type' en EventType) a su componente renderer específico.
 *
 * IMPORTANTE: Para agregar nuevo tipo de evento, seguir estos pasos:
 * 1. Crear NuevoTipoRenderer.tsx en este directorio
 * 2. Importar el renderer arriba
 * 3. Agregar entrada al objeto EVENT_RENDERERS
 * 4. Listo - CalendarEventCard lo seleccionará automáticamente
 *
 * NO es necesario modificar CalendarEventCard ni ningún otro archivo.
 * Esto es el principio Open/Closed: abierto a extensión, cerrado a modificación.
 *
 * @example
 * // Para agregar eventos de Visita:
 * import { VisitEventRenderer } from './VisitEventRenderer';
 * export const EVENT_RENDERERS = {
 *   'Proyecto': ProjectEventRenderer,
 *   'Visita': VisitEventRenderer,  // ← Solo agregar esta línea
 * };
 */
export const EVENT_RENDERERS: Record<string, EventRenderer> = {
  'Proyecto': ProjectEventRenderer,
  // FUTURO: Descomentar cuando se implementen los servicios correspondientes
  // 'Visita': VisitEventRenderer,
  // 'Postventa': AfterSalesEventRenderer,
} as const;

/**
 * Exportar tipos y componentes para uso externo
 */
export type { EventRendererProps };
export { ProjectEventRenderer } from './ProjectEventRenderer';
export { DefaultEventRenderer } from './DefaultEventRenderer';