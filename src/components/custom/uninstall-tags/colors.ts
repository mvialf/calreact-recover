/**
 * Configuración de colores para el sistema de etiquetas (Uninstall Tags)
 *
 * Colores especificados con valores hexadecimales directos para renderizado dinámico.
 * No depende de clases Tailwind, permitiendo colores completamente personalizables.
 * Estilo Trello moderno: sin bordes, solo background + text.
 */

import type { TagColor } from "@/types/tags";

// Definición de colores con valores hex directos (sin bordes)
export const TAG_COLORS: Record<TagColor, { bg: string; text: string }> = {
  yellow: {
    bg: '#fef9c3',      // yellow-100
    text: '#713f12'     // yellow-900
  },
  sky: {
    bg: '#bae6fd',      // sky-200
    text: '#082f49'     // sky-950
  },
  orange: {
    bg: '#f97316',      // orange-500
    text: '#ffffff'     // white
  },
  brown: {
    bg: '#431407',      // orange-950
    text: '#ffffff'     // white
  },
  complete: {
    bg: '#4ade80',      // green-400
    text: '#ffffff'     // white
  },
  purple: {
    bg: '#9333ea',      // purple-600
    text: '#ffffff'     // white
  },
  primary: {
    bg: '#3b82f6',      // blue-500
    text: '#ffffff'     // white
  },
  secondary: {
    bg: '#64748b',      // slate-500
    text: '#ffffff'     // white
  },
  destructive: {
    bg: '#ef4444',      // red-500
    text: '#ffffff'     // white
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
