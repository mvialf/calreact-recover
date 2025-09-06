/**
 * @fileoverview Componente de imagen con lazy loading optimizado
 * 
 * Implementa lazy loading de imágenes con intersection observer
 * para mejorar el performance de carga de páginas.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/usePerformanceOptimizations';

/**
 * Props para el componente LazyImage
 */
interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  /** URL/path de la imagen a cargar */
  src: string;
  /** Imagen placeholder mientras carga */
  placeholder?: string;
  /** Alt text para accesibilidad */
  alt: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Callback cuando la imagen carga exitosamente */
  onLoad?: () => void;
  /** Callback cuando falla la carga */
  onError?: () => void;
  /** Configuración del intersection observer */
  observerOptions?: IntersectionObserverInit;
  /** Si debe usar blur effect durante la carga */
  useBlurEffect?: boolean;
  /** Imagen de fallback si falla la carga */
  fallbackSrc?: string;
  /** Delay artificial para testing (desarrollo) */
  artificialDelay?: number;
}

/**
 * Estados de carga de la imagen
 */
type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Componente de imagen con lazy loading y efectos de transición
 * 
 * @description
 * Este componente optimiza la carga de imágenes implementando:
 * - Lazy loading con intersection observer
 * - Placeholder durante la carga
 * - Efectos de transición suaves
 * - Manejo de errores con fallback
 * - Soporte para blur effect
 * 
 * @example
 * ```tsx
 * <LazyImage
 *   src="/images/photo.jpg"
 *   alt="Descripción de la foto"
 *   placeholder="/images/placeholder.jpg"
 *   className="w-full h-64 object-cover"
 *   useBlurEffect={true}
 *   fallbackSrc="/images/no-image.jpg"
 *   onLoad={() => { }}  // callback de carga
 * />
 * ```
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la imagen lazy
 */
export function LazyImage({
  src,
  placeholder,
  alt,
  className,
  onLoad,
  onError,
  observerOptions = { threshold: 0.1, rootMargin: '50px' },
  useBlurEffect = false,
  fallbackSrc,
  artificialDelay = 0,
  ...imgProps
}: LazyImageProps) {
  const [loadState, setLoadState] = useState<ImageLoadState>('idle');
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder || '');
  const [imageRef, isIntersecting] = useIntersectionObserver(observerOptions);
  const imgElementRef = useRef<HTMLImageElement>(null);

  // Función para cargar la imagen
  const loadImage = useCallback(async (imageSrc: string) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Artificial delay para testing si está configurado
        if (artificialDelay > 0) {
          setTimeout(resolve, artificialDelay);
        } else {
          resolve();
        }
      };
      
      img.onerror = reject;
      img.src = imageSrc;
    });
  }, [artificialDelay]);

  // Efecto para iniciar la carga cuando la imagen es visible
  useEffect(() => {
    if (!isIntersecting || loadState !== 'idle') return;

    setLoadState('loading');

    loadImage(src)
      .then(() => {
        setCurrentSrc(src);
        setLoadState('loaded');
        onLoad?.();
      })
      .catch(() => {
        // Intentar con fallback si está disponible
        if (fallbackSrc && fallbackSrc !== src) {
          loadImage(fallbackSrc)
            .then(() => {
              setCurrentSrc(fallbackSrc);
              setLoadState('loaded');
              onLoad?.();
            })
            .catch(() => {
              setLoadState('error');
              onError?.();
            });
        } else {
          setLoadState('error');
          onError?.();
        }
      });
  }, [isIntersecting, loadState, src, fallbackSrc, loadImage, onLoad, onError]);

  // Clases CSS dinámicas basadas en el estado
  const imageClasses = cn(
    'transition-all duration-300 ease-in-out',
    {
      'blur-sm': useBlurEffect && loadState === 'loading',
      'blur-none': useBlurEffect && loadState === 'loaded',
      'opacity-50': loadState === 'loading',
      'opacity-100': loadState === 'loaded',
      'opacity-30': loadState === 'error',
    },
    className
  );

  return (
    <div ref={imageRef as React.RefObject<HTMLDivElement>} className="relative overflow-hidden">
      {/* Imagen principal */}
      <img
        ref={imgElementRef}
        src={currentSrc}
        alt={alt}
        className={imageClasses}
        {...imgProps}
      />

      {/* Loading overlay */}
      {loadState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        </div>
      )}

      {/* Error overlay */}
      {loadState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm">Error al cargar imagen</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Props para el componente LazyImageGrid
 */
interface LazyImageGridProps {
  /** Array de imágenes a mostrar */
  images: Array<{
    src: string;
    alt: string;
    id: string | number;
    placeholder?: string;
  }>;
  /** Número de columnas en la grid */
  columns?: number;
  /** Gap entre imágenes */
  gap?: string;
  /** Clases CSS para cada imagen */
  imageClassName?: string;
  /** Callback cuando se hace click en una imagen */
  onImageClick?: (image: any, index: number) => void;
  /** Si debe mostrar loading para toda la grid */
  isLoading?: boolean;
  /** Número de skeletons a mostrar durante loading */
  skeletonCount?: number;
}

/**
 * Componente de grid de imágenes lazy con optimizaciones
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la grid de imágenes
 */
export function LazyImageGrid({
  images,
  columns = 3,
  gap = '1rem',
  imageClassName,
  onImageClick,
  isLoading = false,
  skeletonCount = 6
}: LazyImageGridProps) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap
  };

  if (isLoading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 animate-pulse rounded-lg aspect-square"
          />
        ))}
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {images.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            'cursor-pointer transition-transform hover:scale-105',
            onImageClick && 'hover:shadow-lg'
          )}
          onClick={() => onImageClick?.(image, index)}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            placeholder={image.placeholder}
            className={cn('w-full h-full object-cover rounded-lg', imageClassName)}
            useBlurEffect={true}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Hook para precargar imágenes
 * 
 * @param imageSrcs - Array de URLs de imágenes a precargar
 * @returns Estado de precarga
 */
export function useImagePreloader(imageSrcs: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const preloadImages = useCallback(async () => {
    setIsLoading(true);
    setLoadedImages(new Set());
    setErrors(new Set());

    const preloadPromises = imageSrcs.map(async (src) => {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load ${src}`));
          img.src = src;
        });
        
        setLoadedImages(prev => new Set([...prev, src]));
      } catch (error) {
        setErrors(prev => new Set([...prev, src]));
      }
    });

    await Promise.allSettled(preloadPromises);
    setIsLoading(false);
  }, [imageSrcs]);

  useEffect(() => {
    if (imageSrcs.length > 0) {
      preloadImages();
    }
  }, [imageSrcs, preloadImages]);

  return {
    loadedImages,
    errors,
    isLoading,
    preloadImages,
    loadedCount: loadedImages.size,
    errorCount: errors.size,
    totalCount: imageSrcs.length
  };
}

export default LazyImage;