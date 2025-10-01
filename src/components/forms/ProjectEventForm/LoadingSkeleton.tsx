/**
 * LoadingSkeleton - Fallback UI para componentes lazy loaded
 *
 * Skeleton UI genérico para usar como fallback durante lazy loading.
 * Proporciona mejor UX que Input disabled genérico.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-10 bg-muted rounded-md" />
    </div>
  );
};
