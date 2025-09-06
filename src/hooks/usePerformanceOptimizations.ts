/**
 * @fileoverview Hook para optimizaciones de performance
 * 
 * Proporciona utilidades de memoización y optimización para componentes
 * que manejan datos complejos o cálculos pesados.
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Hook para memoizar cálculos complejos con dependencias personalizadas
 * 
 * @param factory - Función que realiza el cálculo
 * @param deps - Dependencias para el cálculo
 * @returns Resultado memoizado
 */
export function useComplexMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Hook para memoizar callbacks con dependencias optimizadas
 * 
 * @param callback - Función callback a memoizar
 * @param deps - Dependencias del callback
 * @returns Callback memoizado
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Hook para debounce de valores con limpieza automática
 * 
 * @param value - Valor a hacer debounce
 * @param delay - Retraso en milisegundos
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para throttle de funciones con control de ejecución
 * 
 * @param callback - Función a hacer throttle
 * @param delay - Retraso mínimo entre ejecuciones
 * @returns Función con throttle aplicado
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Hook para lazy initialization de valores pesados
 * 
 * @param initializer - Función que inicializa el valor
 * @returns Valor inicializado de forma lazy
 */
export function useLazyValue<T>(initializer: () => T): T {
  const [value] = React.useState(initializer);
  return value;
}

/**
 * Hook para memoización de objetos complejos
 * Útil para evitar re-renders innecesarios cuando se pasan objetos como props
 * 
 * @param object - Objeto a memoizar
 * @returns Objeto memoizado
 */
export function useStableObject<T extends Record<string, any>>(object: T): T {
  return useMemo(() => object, Object.values(object));
}

/**
 * Hook para detectar cambios en arrays de forma optimizada
 * 
 * @param array - Array a monitorear
 * @param compareFn - Función de comparación personalizada (opcional)
 * @returns Array memoizado
 */
export function useStableArray<T>(
  array: T[],
  compareFn?: (a: T, b: T) => boolean
): T[] {
  return useMemo(() => {
    return array;
  }, [
    array.length,
    ...array.map((item, index) => 
      compareFn ? `${index}-${JSON.stringify(item)}` : item
    )
  ]);
}

/**
 * Hook para batching de actualizaciones de estado
 * Útil cuando necesitas actualizar múltiples estados relacionados
 * 
 * @param initialState - Estado inicial
 * @returns [state, batchUpdate]
 */
export function useBatchedState<T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] {
  const [state, setState] = React.useState<T>(initialState);

  const batchUpdate = useCallback((updates: Partial<T>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  return [state, batchUpdate];
}

/**
 * Hook para memoización de selectores complejos
 * Útil para seleccionar datos específicos de objetos grandes
 * 
 * @param data - Datos fuente
 * @param selector - Función selectora
 * @param deps - Dependencias adicionales
 * @returns Datos seleccionados y memoizados
 */
export function useSelector<TData, TSelected>(
  data: TData,
  selector: (data: TData) => TSelected,
  deps: React.DependencyList = []
): TSelected {
  return useMemo(() => selector(data), [data, ...deps]);
}

/**
 * Hook para lazy loading de componentes con preload
 * 
 * @param importFn - Función de importación dinámica
 * @param shouldPreload - Si debe hacer preload del componente
 * @returns [Component, isLoading, error]
 */
export function useLazyComponent<T = any>(
  importFn: () => Promise<{ default: T }>,
  shouldPreload: boolean = false
): [T | null, boolean, Error | null] {
  const [component, setComponent] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const hasLoaded = useRef(false);

  const loadComponent = useCallback(async () => {
    if (hasLoaded.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { default: Component } = await importFn();
      setComponent(Component);
      hasLoaded.current = true;
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [importFn]);

  useEffect(() => {
    if (shouldPreload) {
      loadComponent();
    }
  }, [shouldPreload, loadComponent]);

  return [component, isLoading, error];
}

/**
 * Hook para intersection observer optimizado
 * Útil para lazy loading de imágenes o componentes
 * 
 * @param options - Opciones del intersection observer
 * @returns [ref, isIntersecting, entry]
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean, IntersectionObserverEntry | null] {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [entry, setEntry] = React.useState<IntersectionObserverEntry | null>(null);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      options
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return [targetRef, isIntersecting, entry];
}