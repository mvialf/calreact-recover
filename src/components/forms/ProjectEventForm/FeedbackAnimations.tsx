/**
 * Componente de animaciones para feedback visual
 *
 * Proporciona animaciones de success/error después de submit
 */

'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FeedbackAnimationsProps {
  /**
   * Tipo de feedback
   */
  type: 'success' | 'error' | null;
  /**
   * Mensaje descriptivo
   */
  message?: string;
  /**
   * Duración de la animación en ms
   */
  duration?: number;
  /**
   * Callback cuando termina la animación
   */
  onAnimationEnd?: () => void;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export const FeedbackAnimations: React.FC<FeedbackAnimationsProps> = ({
  type,
  message,
  duration = 2000,
  onAnimationEnd,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!type) {
      setIsVisible(false);
      setIsAnimating(false);
      return;
    }

    // Mostrar feedback
    setIsVisible(true);
    setIsAnimating(true);

    // Ocultar después de duración
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onAnimationEnd?.();
      }, 300); // Delay para fade-out
    }, duration);

    return () => clearTimeout(timer);
  }, [type, duration, onAnimationEnd]);

  if (!isVisible || !type) return null;

  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50',
        'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg',
        'transition-all duration-300',
        isAnimating
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2',
        isSuccess
          ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100'
          : 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={cn(
          'h-5 w-5',
          isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}
      />
      <p className="text-sm font-medium">
        {message || (isSuccess ? 'Operación exitosa' : 'Ocurrió un error')}
      </p>
    </div>
  );
};

FeedbackAnimations.displayName = 'FeedbackAnimations';
