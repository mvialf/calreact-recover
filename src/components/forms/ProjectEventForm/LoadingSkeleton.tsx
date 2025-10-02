/**
 * LoadingSkeleton - Fallback UI para componentes lazy loaded
 *
 * Skeleton UI genérico para usar como fallback durante lazy loading.
 * Proporciona mejor UX que Input disabled genérico.
 *
 * @example
 * <Suspense fallback={<LoadingSkeleton variant="button" />}>
 *   <HeavyComponent />
 * </Suspense>
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'button' | 'card';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'default',
}) => {
  const baseClasses = 'animate-pulse bg-muted rounded-md';

  const variantClasses = {
    default: 'h-10',
    button: 'h-10 w-24',
    card: 'h-32',
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} />
  );
};
