/**
 * Tipos para el sistema de etiquetas (Uninstall Tags)
 *
 * Tipos centralizados sin implementación concreta de colores.
 * Colores definidos en: src/components/custom/uninstall-tags/colors.ts
 */

// Colores disponibles para etiquetas
export type TagColor =
  | 'yellow'
  | 'sky'
  | 'orange'
  | 'brown'
  | 'complete'
  | 'purple'
  | 'primary'
  | 'secondary'
  | 'destructive';

// Definición de una etiqueta
export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  abbreviation?: string; // Abreviatura de 2 letras (ej: "AL") - Opcional para backward compatibility
  createdAt?: Date;
}

// Props para el componente TagSelector
export interface TagSelectorProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag?: (name: string, color: TagColor, abbreviation: string) => void;
  onEditTag?: (tagId: string, name: string, color: TagColor, abbreviation: string) => void;
  onDeleteTag?: (tagId: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

// Props para crear una nueva etiqueta
export interface CreateTagData {
  name: string;
  color: TagColor;
}
