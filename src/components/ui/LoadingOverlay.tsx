import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingOverlayProps {
  /**
   * Mostrar el overlay
   */
  visible: boolean;
  /**
   * Mensaje de carga opcional
   */
  message?: string;
  /**
   * Opacity del backdrop
   */
  opacity?: 'light' | 'medium' | 'dark';
  /**
   * Tamaño del spinner
   */
  spinnerSize?: 'sm' | 'md' | 'lg';
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Cargando...',
  opacity = 'medium',
  spinnerSize = 'md',
  className,
}) => {
  if (!visible) return null;

  const opacityClasses = {
    light: 'bg-background/60',
    medium: 'bg-background/80',
    dark: 'bg-background/90',
  };

  const spinnerSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex flex-col items-center justify-center gap-3',
        opacityClasses[opacity],
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className={cn('animate-spin text-primary', spinnerSizes[spinnerSize])}
      />
      {message && (
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';
