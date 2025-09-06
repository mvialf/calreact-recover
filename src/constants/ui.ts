/**
 * Constantes para estilos de UI
 * Centraliza valores de dimensiones y clases Tailwind reutilizables
 */

// Anchos de columnas para tablas
export const TABLE_WIDTHS = {
  actions: 'w-[100px]',
  small: 'w-[150px]',
  medium: 'w-[200px]',
  large: 'w-[250px]',
  extraLarge: 'w-[300px]',
  minimal: 'w-[50px]',
} as const;

// Anchos máximos para contenido truncado
export const MAX_WIDTHS = {
  truncateSmall: 'max-w-[200px]',
  truncateMedium: 'max-w-[300px]',
  truncateLarge: 'max-w-[400px]',
  containerSmall: 'max-w-[33rem]',
  containerMedium: 'max-w-[48rem]',
  containerLarge: 'max-w-[64rem]',
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