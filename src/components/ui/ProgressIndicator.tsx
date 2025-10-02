import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressIndicatorProps {
  /**
   * Progreso actual (0-100)
   */
  value?: number;
  /**
   * Mostrar en modo indeterminado (sin valor específico)
   */
  indeterminate?: boolean;
  /**
   * Tamaño del indicador
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Variante de color
   */
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  /**
   * Texto descriptivo opcional
   */
  label?: string;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value = 0,
  indeterminate = false,
  size = 'md',
  variant = 'default',
  label,
  className,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-destructive',
  };

  return (
    <div className={cn('w-full space-y-1', className)}>
      {label && (
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{label}</span>
          {!indeterminate && <span>{clampedValue}%</span>}
        </div>
      )}

      <div
        className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-label={label || 'Progress indicator'}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out',
            variantClasses[variant],
            indeterminate && 'animate-pulse'
          )}
          style={{
            width: indeterminate ? '100%' : `${clampedValue}%`,
          }}
        />
      </div>
    </div>
  );
};

ProgressIndicator.displayName = 'ProgressIndicator';
