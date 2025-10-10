/**
 * Sistema de Etiquetas CalReact - Re-export desde /custom/tags/
 * @deprecated Importar desde @/components/ui/custom/tags directamente
 * Este archivo mantiene compatibilidad temporal pero se recomienda migrar
 */

export { TagBadge, TagSelector } from './custom/tags';

// Re-exportar tipos para conveniencia
export type {
  Tag,
  TagColor,
  TagBadgeProps,
  TagSelectorProps,
  CreateTagData
} from '@/types/tags';

export {
  TAG_COLOR_MAP,
  AVAILABLE_TAG_COLORS
} from '@/types/tags';
