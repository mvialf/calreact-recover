/**
 * Tipos para el sistema de etiquetas estilo Trello
 * Basado en los colores personalizados de globals.css
 */

// Colores disponibles basados en las variables CSS personalizadas
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
  createdAt?: Date;
}

// Props para el componente TagBadge
export interface TagBadgeProps {
  tag: Tag;
  removable?: boolean;
  onRemove?: (tagId: string) => void;
  className?: string;
}

// Props para el componente TagSelector
export interface TagSelectorProps {
  selectedTags: Tag[];
  availableTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag?: (name: string, color: TagColor) => void;
  onEditTag?: (tagId: string, name: string, color: TagColor) => void;
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

// Mapeo de colores a clases Tailwind (usando CSS variables personalizadas)
export const TAG_COLOR_MAP: Record<TagColor, { bg: string; text: string; border: string }> = {
  yellow: {
    bg: 'bg-[hsl(var(--yellow))]',
    text: 'text-[hsl(var(--yellow-foreground))]',
    border: 'border-[hsl(var(--yellow))]'
  },
  sky: {
    bg: 'bg-[hsl(var(--Sky))]',
    text: 'text-[hsl(var(--Sky-foreground))]', 
    border: 'border-[hsl(var(--Sky))]'
  },
  orange: {
    bg: 'bg-[hsl(var(--orange))]',
    text: 'text-[hsl(var(--orange-foreground))]',
    border: 'border-[hsl(var(--orange))]'
  },
  brown: {
    bg: 'bg-[hsl(var(--brown))]',
    text: 'text-[hsl(var(--brown-foreground))]',
    border: 'border-[hsl(var(--brown))]'
  },
  complete: {
    bg: 'bg-[hsl(var(--complete))]',
    text: 'text-[hsl(var(--complete-foreground))]',
    border: 'border-[hsl(var(--complete))]'
  },
  purple: {
    bg: 'bg-[hsl(var(--purple))]',
    text: 'text-[hsl(var(--purple-foreground))]',
    border: 'border-[hsl(var(--purple))]'
  },
  primary: {
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    border: 'border-primary'
  },
  secondary: {
    bg: 'bg-secondary',
    text: 'text-secondary-foreground',
    border: 'border-secondary'
  },
  destructive: {
    bg: 'bg-destructive',
    text: 'text-destructive-foreground',
    border: 'border-destructive'
  }
};

// Colores disponibles para selección con etiquetas en español
export const AVAILABLE_TAG_COLORS: { color: TagColor; label: string }[] = [
  { color: 'yellow', label: 'Amarillo' },
  { color: 'sky', label: 'Azul Cielo' },
  { color: 'orange', label: 'Naranja' },
  { color: 'brown', label: 'Marrón' },
  { color: 'complete', label: 'Verde' },
  { color: 'purple', label: 'Morado' },
  { color: 'primary', label: 'Primario' },
  { color: 'secondary', label: 'Secundario' },
  { color: 'destructive', label: 'Rojo' }
];
