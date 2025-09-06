/**
 * Sistema de Etiquetas CalReact - Exportaciones principales
 * Componentes de etiquetas estilo Trello con colores personalizados
 */

export { TagBadge } from "./tag-badge";
export { TagSelector } from "./tag-selector";

// Re-exportar tipos para conveniencia
export type {
  Tag,
  TagColor,
  TagBadgeProps,
  TagSelectorProps,
  CreateTagData
} from "@/types/tags";

export {
  TAG_COLOR_MAP,
  AVAILABLE_TAG_COLORS
} from "@/types/tags";
