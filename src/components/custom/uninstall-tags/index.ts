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
  TagSelectorProps
} from '@/types/tags';

// Re-export colores para uso externo (valores hex directos)
export { TAG_COLORS, AVAILABLE_TAG_COLORS } from './colors';
