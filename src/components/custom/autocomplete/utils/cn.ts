import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función de utilidad para combinar clases CSS de Tailwind
 * Evita conflictos y mantiene la especificidad correcta
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
