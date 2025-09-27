/**
 * Constantes para estilos de UI
 * Centraliza valores de dimensiones y clases Tailwind reutilizables
 * ACTUALIZADO: Ahora usa CSS variables desde globals.css como fuente única de verdad
 */

// Anchos de columnas para tablas
export const TABLE_WIDTHS = {
  actions: 'w-[var(--table-col-actions)]',
  small: 'w-[var(--table-col-small)]',
  medium: 'w-[var(--table-col-medium)]',
  large: 'w-[var(--table-col-large)]',
  extraLarge: 'w-[var(--table-col-xl)]',
  minimal: 'w-[var(--table-col-minimal)]',
} as const;

// Anchos máximos para contenido truncado
export const MAX_WIDTHS = {
  truncateSmall: 'max-w-[var(--container-truncate-sm)]',
  truncateMedium: 'max-w-[var(--container-truncate-md)]',
  truncateLarge: 'max-w-[var(--container-truncate-lg)]',
  containerSmall: 'max-w-[var(--container-sm)]',
  containerMedium: 'max-w-[var(--container-md)]',
  containerLarge: 'max-w-[var(--container-lg)]',
} as const;

// Alturas estándar
export const HEIGHTS = {
  button: 'h-10',
  input: 'h-10',
  skeleton: 'h-10',
  card: 'h-32',
  modal: 'h-96',
} as const;

// Clases de espaciado consistentes
export const SPACING = {
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  cardPadding: 'p-4 sm:p-6',
  sectionMargin: 'mx-6 py-6',
  buttonSpacing: 'space-x-2',
  formSpacing: 'space-y-4',
} as const;

// Clases responsive estándar
export const RESPONSIVE = {
  hideOnMobile: 'hidden sm:block',
  showOnMobile: 'block sm:hidden',
  fullOnMobile: 'w-full sm:w-auto',
  responsiveText: 'text-sm sm:text-base',
  responsiveGrid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
} as const;