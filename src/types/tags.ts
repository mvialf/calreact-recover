/**
 * Tipos para el sistema de etiquetas estilo Trello
 * Sistema portable con valores por defecto Tailwind + override opcional
 */

// Colores disponibles basados en Tailwind CSS estándar
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

// Interface para clases de colores (bg, text, border)
export interface ColorClasses {
  bg: string;
  text: string;
  border: string;
}

// Definición de una etiqueta
export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  abbreviation?: string; // Abreviatura de 2 letras (ej: "AL") - Opcional para backward compatibility con datos existentes
  createdAt?: Date;
}

// Props para el componente TagBadge
export interface TagBadgeProps {
  tag: Tag;
  removable?: boolean;
  onRemove?: (tagId: string) => void;
  className?: string;
  /**
   * Override de colores para este badge específico.
   * Si no se proporciona, usa DEFAULT_TAG_COLORS (Tailwind estándar portable).
   * Para usar variables CSS de globals.css, pasar CSS_VAR_TAG_COLORS[tag.color]
   */
  colorOverride?: ColorClasses;
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

// ============================================================================
// COLORES PORTABLES (DEFAULT) - Tailwind CSS estándar
// ============================================================================
/**
 * Colores por defecto usando clases Tailwind estándar.
 * Estos valores funcionan out-of-the-box en cualquier proyecto con Tailwind.
 * NO requieren configuración de globals.css.
 */
export const DEFAULT_TAG_COLORS: Record<TagColor, ColorClasses> = {
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-900',
    border: 'border-yellow-500'
  },
  sky: {
    bg: 'bg-sky-200',
    text: 'text-sky-950',
    border: 'border-sky-600'
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-white',
    border: 'border-orange-600'
  },
  brown: {
    bg: 'bg-orange-950',
    text: 'text-white',
    border: 'border-orange-900'
  },
  complete: {
    bg: 'bg-green-400',
    text: 'text-white',
    border: 'border-green-500'
  },
  purple: {
    bg: 'bg-purple-600',
    text: 'text-white',
    border: 'border-purple-700'
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

// ============================================================================
// COLORES CON VARIABLES CSS (BACKWARD COMPATIBILITY)
// ============================================================================
/**
 * Colores usando variables CSS de globals.css (comportamiento legacy).
 * Útil para mantener consistencia con design system existente del proyecto.
 * REQUIERE que globals.css tenga definidas las variables CSS correspondientes.
 *
 * @deprecated Usar DEFAULT_TAG_COLORS para portabilidad.
 * Solo usar este mapeo si necesitas integración específica con globals.css.
 */
export const CSS_VAR_TAG_COLORS: Record<TagColor, ColorClasses> = {
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

/**
 * @deprecated Usar DEFAULT_TAG_COLORS en su lugar para portabilidad.
 * TAG_COLOR_MAP se mantiene por compatibilidad pero apunta a CSS_VAR_TAG_COLORS.
 */
export const TAG_COLOR_MAP = CSS_VAR_TAG_COLORS;

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
