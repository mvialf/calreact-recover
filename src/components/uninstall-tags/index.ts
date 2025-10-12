// Barrel exports para uninstall tags system
export { TagSelector } from './TagSelector';
export { CreateTagModal } from './CreateTagModal';
export { EditTagModal } from './EditTagModal';
export { TagBadge } from './TagBadge';

// Re-export tipos desde @/types/tags para conveniencia
export type {
  Tag,
  TagColor,
  CreateTagData,
  TagSelectorProps,
  ColorClasses,
  TagBadgeProps
} from '@/types/tags';

// Re-export constantes de colores para personalización avanzada
export { DEFAULT_TAG_COLORS, AVAILABLE_TAG_COLORS } from '@/types/tags';
