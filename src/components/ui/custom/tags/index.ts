/**
 * Sistema de Etiquetas CalReact - Punto de entrada principal
 * Componentes de etiquetas estilo Trello con colores personalizados
 */

// Componentes core
export { TagBadge } from './core/TagBadge';
export { TagSelector } from './core/TagSelector';

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
