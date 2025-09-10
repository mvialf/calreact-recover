# 🏗️ Nueva Arquitectura - Google Places API v2

## 📐 PATRÓN DE IMPLEMENTACIÓN RECOMENDADO

### **Arquitectura Adaptativa con Feature Detection**

```typescript
// src/lib/places/PlacesServiceAdapter.ts
export class PlacesServiceAdapter {
  private apiVersion: 'legacy' | 'modern' = 'legacy';
  private placesLib: google.maps.PlacesLibrary | null = null;
  private sessionToken: google.maps.places.AutocompleteSessionToken | null = null;
  
  constructor() {
    this.initializeAPI();
  }
  
  private async initializeAPI(): Promise<void> {
    try {
      // Intentar cargar nueva API
      this.placesLib = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      if (this.placesLib.AutocompleteSuggestion) {
        this.apiVersion = 'modern';
        this.sessionToken = new this.placesLib.AutocompleteSessionToken();
        uiLogger.info('✅ Usando nueva API: AutocompleteSuggestion');
      } else {
        throw new Error('Nueva API no disponible');
      }
    } catch (error) {
      // Fallback a API antigua si está disponible
      if (window.google?.maps?.places?.AutocompleteService) {
        this.apiVersion = 'legacy';
        uiLogger.warn('⚠️ Usando API legacy: AutocompleteService');
      } else {
        throw new Error('Ninguna API de Places disponible');
      }
    }
  }
  
  public async getPlacePredictions(
    request: google.maps.places.AutocompletionRequest
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    if (this.apiVersion === 'modern') {
      return this.getModernPredictions(request);
    } else {
      return this.getLegacyPredictions(request);
    }
  }
  
  private async getModernPredictions(
    request: google.maps.places.AutocompletionRequest
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.placesLib?.AutocompleteSuggestion) {
      throw new Error('Nueva API no disponible');
    }
    
    try {
      const modernRequest = {
        input: request.input,
        sessionToken: this.sessionToken,
        locationBias: request.location ? {
          center: request.location,
          radius: request.radius || 50000
        } : undefined,
        includedPrimaryTypes: request.types || ['establishment'],
        region: request.componentRestrictions?.country || 'es',
      };
      
      const response = await this.placesLib.AutocompleteSuggestion
        .fetchAutocompleteSuggestions(modernRequest);
      
      // Convertir formato de respuesta para mantener compatibilidad
      return response.suggestions.map(this.convertSuggestionToPrediction);
      
    } catch (error) {
      uiLogger.error('Error en nueva API:', error);
      throw error;
    }
  }
  
  private convertSuggestionToPrediction(
    suggestion: any
  ): google.maps.places.AutocompletePrediction {
    return {
      description: suggestion.placePrediction?.text?.text || '',
      matched_substrings: suggestion.placePrediction?.structuredFormat?.mainText?.matches || [],
      place_id: suggestion.placePrediction?.placeId || '',
      reference: suggestion.placePrediction?.reference || '',
      structured_formatting: {
        main_text: suggestion.placePrediction?.structuredFormat?.mainText?.text || '',
        main_text_matched_substrings: suggestion.placePrediction?.structuredFormat?.mainText?.matches || [],
        secondary_text: suggestion.placePrediction?.structuredFormat?.secondaryText?.text || ''
      },
      terms: suggestion.placePrediction?.terms || [],
      types: suggestion.placePrediction?.types || []
    };
  }
  
  private async getLegacyPredictions(
    request: google.maps.places.AutocompletionRequest
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    return new Promise((resolve, reject) => {
      const service = new google.maps.places.AutocompleteService();
      
      service.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          reject(new Error(`Places service error: ${status}`));
        }
      });
    });
  }
}
```

---

## 🔧 HOOK PERSONALIZADO MEJORADO

### **usePlacesAutocomplete v2**

```typescript
// src/hooks/usePlacesAutocomplete.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { PlacesServiceAdapter } from '@/lib/places/PlacesServiceAdapter';
import { uiLogger } from '@/lib/logging/logger';

interface UsePlacesAutocompleteConfig {
  debounceMs?: number;
  minQueryLength?: number;
  sessionToken?: boolean;
  requestOptions?: Partial<google.maps.places.AutocompletionRequest>;
}

export const usePlacesAutocomplete = (config: UsePlacesAutocompleteConfig = {}) => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    sessionToken = true,
    requestOptions = {}
  } = config;
  
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiVersion, setApiVersion] = useState<'legacy' | 'modern' | 'unknown'>('unknown');
  
  const adapterRef = useRef<PlacesServiceAdapter | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Inicializar adapter
  useEffect(() => {
    const initAdapter = async () => {
      try {
        adapterRef.current = new PlacesServiceAdapter();
        await adapterRef.current.initializeAPI();
        setApiVersion(adapterRef.current.getAPIVersion());
        uiLogger.info(`Places API inicializada: ${adapterRef.current.getAPIVersion()}`);
      } catch (error) {
        setError('Error inicializando Places API');
        uiLogger.error('Error inicializando Places API:', error);
      }
    };
    
    initAdapter();
  }, []);
  
  const getPlaceSuggestions = useCallback(async (query: string) => {
    if (!adapterRef.current) {
      setError('Places API no inicializada');
      return;
    }
    
    if (query.length < minQueryLength) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: 'es' },
        types: ['establishment'],
        ...requestOptions
      };
      
      const predictions = await adapterRef.current.getPlacePredictions(request);
      setSuggestions(predictions);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      setSuggestions([]);
      uiLogger.error('Error obteniendo sugerencias:', error);
      
    } finally {
      setIsLoading(false);
    }
  }, [minQueryLength, requestOptions]);
  
  const debouncedGetSuggestions = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      getPlaceSuggestions(query);
    }, debounceMs);
  }, [getPlaceSuggestions, debounceMs]);
  
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  return {
    suggestions,
    isLoading,
    error,
    apiVersion,
    getPlaceSuggestions: debouncedGetSuggestions,
    clearSuggestions,
    adapter: adapterRef.current
  };
};
```

---

## 💾 GESTIÓN DE SESIONES OPTIMIZADA

### **Session Token Management**

```typescript
// src/lib/places/SessionManager.ts
export class PlacesSessionManager {
  private sessionTokens: Map<string, google.maps.places.AutocompleteSessionToken> = new Map();
  private placesLib: google.maps.PlacesLibrary | null = null;
  
  constructor(placesLib: google.maps.PlacesLibrary) {
    this.placesLib = placesLib;
  }
  
  public getOrCreateSessionToken(userId?: string): google.maps.places.AutocompleteSessionToken {
    const key = userId || 'default';
    
    if (!this.sessionTokens.has(key)) {
      if (!this.placesLib?.AutocompleteSessionToken) {
        throw new Error('AutocompleteSessionToken no disponible');
      }
      
      const token = new this.placesLib.AutocompleteSessionToken();
      this.sessionTokens.set(key, token);
      
      // Auto-cleanup después de 3 minutos (límite de Google)
      setTimeout(() => {
        this.sessionTokens.delete(key);
      }, 3 * 60 * 1000);
    }
    
    return this.sessionTokens.get(key)!;
  }
  
  public invalidateSession(userId?: string): void {
    const key = userId || 'default';
    this.sessionTokens.delete(key);
  }
  
  public getActiveSessionsCount(): number {
    return this.sessionTokens.size;
  }
}
```

---

## 🚀 PATRÓN DE LAZY LOADING

### **Carga Diferida de la API**

```typescript
// src/lib/places/PlacesLoader.ts
class PlacesAPILoader {
  private static instance: PlacesAPILoader;
  private placesLibPromise: Promise<google.maps.PlacesLibrary> | null = null;
  private isLoaded = false;
  
  private constructor() {}
  
  public static getInstance(): PlacesAPILoader {
    if (!PlacesAPILoader.instance) {
      PlacesAPILoader.instance = new PlacesAPILoader();
    }
    return PlacesAPILoader.instance;
  }
  
  public async loadPlacesAPI(): Promise<google.maps.PlacesLibrary> {
    if (this.isLoaded && this.placesLibPromise) {
      return this.placesLibPromise;
    }
    
    this.placesLibPromise = this.initializePlacesAPI();
    return this.placesLibPromise;
  }
  
  private async initializePlacesAPI(): Promise<google.maps.PlacesLibrary> {
    try {
      uiLogger.info('🔄 Cargando Google Places API...');
      
      const placesLib = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      // Verificar disponibilidad de nueva API
      if (!placesLib.AutocompleteSuggestion) {
        throw new Error('Nueva API AutocompleteSuggestion no disponible');
      }
      
      this.isLoaded = true;
      uiLogger.success('✅ Google Places API cargada exitosamente (nueva versión)');
      
      return placesLib;
      
    } catch (error) {
      uiLogger.error('❌ Error cargando Google Places API:', error);
      throw error;
    }
  }
  
  public isAPILoaded(): boolean {
    return this.isLoaded;
  }
}

export const placesAPILoader = PlacesAPILoader.getInstance();
```

---

## 📊 MONITOREO Y MÉTRICAS

### **Performance Tracking**

```typescript
// src/lib/places/PlacesMetrics.ts
interface PlacesMetrics {
  apiVersion: 'legacy' | 'modern';
  requestCount: number;
  avgResponseTime: number;
  errorRate: number;
  sessionTokensUsed: number;
  lastUpdate: Date;
}

export class PlacesMetricsTracker {
  private metrics: PlacesMetrics = {
    apiVersion: 'legacy',
    requestCount: 0,
    avgResponseTime: 0,
    errorRate: 0,
    sessionTokensUsed: 0,
    lastUpdate: new Date()
  };
  
  private responseTimes: number[] = [];
  private errors: number = 0;
  
  public trackRequest(responseTime: number, success: boolean, apiVersion: 'legacy' | 'modern'): void {
    this.metrics.requestCount++;
    this.metrics.apiVersion = apiVersion;
    
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift(); // Mantener solo últimas 100 mediciones
    }
    
    if (!success) {
      this.errors++;
    }
    
    this.updateMetrics();
  }
  
  private updateMetrics(): void {
    this.metrics.avgResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    this.metrics.errorRate = (this.errors / this.metrics.requestCount) * 100;
    this.metrics.lastUpdate = new Date();
  }
  
  public getMetrics(): PlacesMetrics {
    return { ...this.metrics };
  }
  
  public logMetrics(): void {
    uiLogger.info('📊 Places API Métricas:', this.metrics);
  }
}
```

---

## 🔄 PATRÓN DE RETRY CON EXPONENTIAL BACKOFF

### **Manejo Robusto de Errores**

```typescript
// src/lib/places/RetryHandler.ts
export class PlacesRetryHandler {
  private maxRetries = 3;
  private baseDelayMs = 1000;
  
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.maxRetries - 1) {
          uiLogger.error(`❌ ${context} falló después de ${this.maxRetries} intentos:`, lastError);
          throw lastError;
        }
        
        const delay = this.calculateDelay(attempt);
        uiLogger.warn(`⚠️ ${context} falló (intento ${attempt + 1}/${this.maxRetries}). Reintentando en ${delay}ms...`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }
  
  private calculateDelay(attempt: number): number {
    return this.baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 🎯 BENEFICIOS DE LA NUEVA ARQUITECTURA

### **✅ Ventajas Técnicas**

1. **🔄 Compatibilidad Adaptativa**: Funciona con ambas APIs automáticamente
2. **📊 Observabilidad**: Métricas y logging completos
3. **⚡ Performance**: Session tokens y caching optimizado  
4. **🛡️ Robustez**: Retry logic y manejo de errores avanzado
5. **🧩 Modularidad**: Separación clara de responsabilidades
6. **🔧 Mantenibilidad**: Fácil actualización y debugging

### **📈 Mejoras de UX**

- **Respuesta más rápida** con nueva API optimizada
- **Sesiones persistentes** para mejor experiencia
- **Fallback automático** sin interrupciones para el usuario
- **Logging detallado** para debugging en desarrollo

---

## 🔗 INTEGRACIÓN CON PROYECTO ACTUAL

Ver implementación específica en:
- **`08-CODIGO-MIGRACION.md`** - Código antes/después
- **`09-ROLLBACK-STRATEGY.md`** - Estrategia de despliegue

---

*Documento creado: Septiembre 2025 - Estado: Patrón arquitectural definido*