/**
 * @fileoverview Componente de lista virtualizada para mejor performance
 * 
 * Implementa virtualización de listas para manejar eficientemente
 * grandes cantidades de elementos sin degradar el performance.
 */

'use client';

import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props para el componente VirtualizedList
 */
interface VirtualizedListProps<T> {
  /** Array de elementos a renderizar */
  items: T[];
  /** Altura de cada item en píxeles */
  itemHeight: number;
  /** Altura del contenedor en píxeles */
  height: number;
  /** Función para renderizar cada item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Función para obtener key única de cada item */
  getItemKey: (item: T, index: number) => string | number;
  /** Número de items adicionales a renderizar fuera del viewport */
  overscan?: number;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Callback cuando se hace scroll */
  onScroll?: (scrollTop: number) => void;
  /** Placeholder cuando no hay items */
  emptyPlaceholder?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Loading placeholder */
  loadingPlaceholder?: React.ReactNode;
}

/**
 * Componente de lista virtualizada para mejor performance con listas largas
 * 
 * @description
 * Este componente implementa virtualización para renderizar solo los elementos
 * visibles en el viewport, mejorando significativamente el performance con
 * listas de miles de elementos.
 * 
 * Características:
 * - Renderiza solo elementos visibles + overscan
 * - Mantiene posición de scroll correcta
 * - Soporte para items de altura fija
 * - Callbacks de scroll optimizados
 * - Estados de loading y empty
 * 
 * @example
 * ```tsx
 * const items = Array.from({ length: 10000 }, (_, i) => ({ 
 *   id: i, 
 *   name: `Item ${i}` 
 * }));
 * 
 * <VirtualizedList
 *   items={items}
 *   itemHeight={50}
 *   height={400}
 *   renderItem={(item, index) => (
 *     <div className="p-2 border-b">
 *       {item.name}
 *     </div>
 *   )}
 *   getItemKey={(item) => item.id}
 *   overscan={5}
 * />
 * ```
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la lista virtualizada
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  getItemKey,
  overscan = 3,
  className,
  onScroll,
  emptyPlaceholder,
  isLoading = false,
  loadingPlaceholder
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Cálculos memoizados para performance
  const visibleRange = useMemo(() => {
    const visibleHeight = height;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + visibleHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, items.length, overscan]);

  // Items visibles memoizados
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      key: getItemKey(item, startIndex + index)
    }));
  }, [items, visibleRange, getItemKey]);

  // Altura total de la lista
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Offset del primer elemento visible
  const offsetY = useMemo(() => {
    return visibleRange.startIndex * itemHeight;
  }, [visibleRange.startIndex, itemHeight]);

  // Handler de scroll optimizado
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={cn('overflow-hidden', className)}
        style={{ height }}
      >
        {loadingPlaceholder || (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Cargando...</div>
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div 
        className={cn('overflow-hidden', className)}
        style={{ height }}
      >
        {emptyPlaceholder || (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">No hay elementos</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      {/* Contenedor con altura total para mantener scrollbar correcta */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Container de items visibles */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{
                height: itemHeight,
                overflow: 'hidden'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook para usar lista virtualizada con estado interno
 * 
 * @param items - Array de items
 * @param itemHeight - Altura de cada item
 * @returns Propiedades y métodos para controlar la lista
 */
export function useVirtualizedList<T>(items: T[], itemHeight: number) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    setScrollTop(0);
  }, []);

  const scrollToBottom = useCallback(() => {
    const maxScrollTop = Math.max(0, (items.length * itemHeight) - containerHeight);
    setScrollTop(maxScrollTop);
  }, [items.length, itemHeight, containerHeight]);

  return {
    scrollTop,
    containerHeight,
    setContainerHeight,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    onScroll: setScrollTop
  };
}

/**
 * Componente de lista virtualizada con búsqueda integrada
 * 
 * @param props - Props extendidas con funcionalidad de búsqueda
 */
interface SearchableVirtualizedListProps<T> extends VirtualizedListProps<T> {
  /** Función para filtrar items basada en query */
  searchFn: (item: T, query: string) => boolean;
  /** Placeholder para el input de búsqueda */
  searchPlaceholder?: string;
  /** Valor inicial de búsqueda */
  initialSearchQuery?: string;
  /** Callback cuando cambia la búsqueda */
  onSearchChange?: (query: string) => void;
}

export function SearchableVirtualizedList<T>({
  items,
  searchFn,
  searchPlaceholder = 'Buscar...',
  initialSearchQuery = '',
  onSearchChange,
  ...listProps
}: SearchableVirtualizedListProps<T>) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Items filtrados memoizados
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(item => searchFn(item, searchQuery));
  }, [items, searchQuery, searchFn]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setSearchQuery(newQuery);
    onSearchChange?.(newQuery);
  }, [onSearchChange]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Virtualized list */}
      <VirtualizedList
        {...listProps}
        items={filteredItems}
      />

      {/* Search results info */}
      {searchQuery && (
        <div className="text-sm text-muted-foreground">
          {filteredItems.length} de {items.length} elementos
        </div>
      )}
    </div>
  );
}

export default VirtualizedList;