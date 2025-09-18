# 🔄 Estrategia de Rollback - Google Places API v2

## 🚨 PLAN DE CONTINGENCIA COMPLETO

### **Situaciones que Requieren Rollback**

1. **🔴 CRÍTICO - Rollback Inmediato**
   - Nueva API completamente no funcional
   - Errores masivos (>10% de requests fallando)
   - Pérdida total de funcionalidad de autocompletado
   - Performance degradada >500% vs baseline

2. **🟡 ADVERTENCIA - Rollback Considerado**
   - Errores intermitentes (5-10% de requests)
   - Performance degradada 200-500% vs baseline  
   - Experiencia de usuario comprometida significativamente
   - Session tokens no funcionando correctamente

3. **🟢 MONITOREO - Sin Rollback**
   - Errores menores (<5% de requests)
   - Performance ligeramente degradada (<200% vs baseline)
   - Logging excesivo pero funcionalidad intacta

---

## ⚡ ROLLBACK INMEDIATO (0-15 minutos)

### **Opción 1: Feature Flag Rollback**

```bash
# ✅ ROLLBACK INSTANTÁNEO via variables de entorno
# Cambiar en Vercel/hosting provider

NEXT_PUBLIC_USE_NEW_PLACES_API=false
NEXT_PUBLIC_PLACES_API_FALLBACK=true
NEXT_PUBLIC_PLACES_API_MONITORING=false
```

**Proceso:**
1. ⏱️ **0-2 min**: Cambiar variables de entorno
2. ⏱️ **2-5 min**: Desplegar cambios (auto-deploy)
3. ⏱️ **5-10 min**: Verificar rollback exitoso
4. ⏱️ **10-15 min**: Confirmar funcionalidad legacy

### **Opción 2: Código de Emergencia (Hot Fix)**

```typescript
// ✅ PARCHE DE EMERGENCIA: src/components/ui/addressInput.tsx
// Línea a cambiar en caso crítico

export const AddressInput: React.FC<AddressInputProps> = (props) => {
  // 🚨 EMERGENCY ROLLBACK - Forzar uso de API legacy
  const FORCE_LEGACY_API = true; // ❌ Cambiar a true para rollback de emergencia
  
  React.useEffect(() => {
    const initializePlacesAPI = async () => {
      if (!isLoaded || !window.google?.maps) return;
      
      // 🚨 Bypass nueva API si está habilitado rollback de emergencia
      if (FORCE_LEGACY_API || !window.google.maps.places) {
        return initializeLegacyAPI();
      }
      
      try {
        // Código de nueva API...
      } catch (error) {
        // Fallback automático a legacy
        return initializeLegacyAPI();
      }
    };
    
    // 🔄 Función de fallback legacy
    const initializeLegacyAPI = () => {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        setApiStatus('ready-legacy');
        uiLogger.warn('🚨 EMERGENCY ROLLBACK: Usando API legacy');
      } catch (error) {
        setApiStatus('error');
        uiLogger.error('Error crítico en rollback:', error);
      }
    };
    
    initializePlacesAPI();
  }, [isLoaded]);
  
  // ... resto del código
};
```

---

## 🔧 ROLLBACK PLANIFICADO (1-4 horas)

### **Situación: Performance o Compatibilidad**

#### **Paso 1: Análisis de Impacto (15-30 min)**
```bash
# Recopilar métricas críticas
npm run analyze:performance
npm run test:places-api
npm run lint:critical-paths
```

#### **Paso 2: Preparar Rollback (30-60 min)**
```bash
# Crear branch de rollback
git checkout main
git pull origin main
git checkout -b rollback/places-api-v2-emergency

# Revertir cambios específicos manteniendo mejoras
git revert [commit-hash-nueva-api] --no-commit
git add src/components/ui/addressInput.tsx
git commit -m "🚨 Rollback: Revertir a Places API legacy por [razón específica]"
```

#### **Paso 3: Aplicar Parches Selectivos (60-90 min)**
```typescript
// ✅ ROLLBACK SELECTIVO: Mantener mejoras, revertir solo API

// Mantener estas mejoras de la migración:
// ✅ Logging mejorado
// ✅ Mejor manejo de errores  
// ✅ Validaciones defensivas
// ✅ Performance optimizations (no relacionadas con API)

// Revertir solo:
// ❌ PlacesServiceAdapter
// ❌ Nueva inicialización de API
// ❌ Session tokens
// ❌ Dynamic imports

export const AddressInput: React.FC<AddressInputProps> = (props) => {
  // ✅ MANTENER: Estados y validaciones mejoradas
  const [suggestions, setSuggestions] = React.useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  
  // ❌ REVERTIR: Volver a refs legacy
  const autocompleteService = React.useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = React.useRef<google.maps.places.PlacesService | null>(null);
  
  // ❌ REVERTIR: Inicialización legacy (con logging mejorado)
  React.useEffect(() => {
    if (isLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        setApiStatus('ready');
        uiLogger.info('✅ Places API legacy inicializada exitosamente'); // ✅ MEJORADO
      } catch (error) {
        setApiStatus('error');
        uiLogger.error('❌ Error inicializando Places API legacy:', error); // ✅ MEJORADO
      }
    }
  }, [isLoaded]);
  
  // ❌ REVERTIR: Búsqueda legacy (con mejoras de error handling)
  const searchAddresses = React.useCallback(async (query: string) => {
    if (!config || !autocompleteService.current || !GoogleMapsUtils.isValidQuery(query, config)) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    
    // ✅ MANTENER: Try-catch mejorado
    try {
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: 'es' },
        types: ['establishment'],
        location: config.location,
        radius: config.radius
      };
      
      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        try {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            uiLogger.debug(`Encontradas ${predictions.length} sugerencias para: "${query}"`); // ✅ MEJORADO
          } else {
            setSuggestions([]);
            uiLogger.warn(`Places API status: ${status}`); // ✅ MEJORADO
          }
        } catch (error) {
          setSuggestions([]);
          uiLogger.error('Error procesando sugerencias:', error); // ✅ MEJORADO
        } finally {
          setIsLoading(false);
        }
      });
    } catch (error) {
      setSuggestions([]);
      setIsLoading(false);
      uiLogger.error('Error en búsqueda de direcciones:', error); // ✅ MEJORADO
    }
  }, [config]);
  
  // ✅ MANTENER: Resto del componente con mejoras de UX
  // ...
};
```

#### **Paso 4: Testing y Validación (30-60 min)**
```bash
# Test suite completa
npm run test:unit
npm run test:e2e:places
npm run test:integration

# Build verification
npm run build
npm run start

# Manual testing checklist
# ✅ Autocompletado funciona
# ✅ Selección de direcciones
# ✅ Manejo de errores
# ✅ Performance aceptable
```

#### **Paso 5: Deploy de Rollback (30-45 min)**
```bash
# Deploy staged rollback
git push origin rollback/places-api-v2-emergency

# Create emergency PR
gh pr create \
  --title "🚨 EMERGENCY: Rollback Places API v2" \
  --body "Rollback crítico debido a [razón]. Mantiene mejoras de logging y UX." \
  --label "emergency,rollback,places-api"

# Merge and deploy immediately
gh pr merge --squash --delete-branch
```

---

## 📊 MONITOREO POST-ROLLBACK

### **Métricas a Verificar (15-30 min post-rollback)**

```bash
# 1. Funcionalidad básica
curl -I https://tu-app.com/api/health

# 2. JavaScript errors en consola
# Abrir DevTools > Console
# Verificar: Sin errores de Places API

# 3. Performance baseline
# Lighthouse audit
# Core Web Vitals
# Time to Interactive
```

### **Dashboard de Monitoreo**
```typescript
// ✅ MÉTRICAS POST-ROLLBACK
const rollbackMetrics = {
  functionalityStatus: 'operational', // operational | degraded | down
  errorRate: 0.02, // 2% (aceptable)
  avgResponseTime: 180, // ms (baseline: ~300ms legacy)
  userImpact: 'minimal', // minimal | moderate | severe
  rollbackSuccess: true
};
```

---

## 🔄 ESCENARIOS ESPECÍFICOS DE ROLLBACK

### **Escenario 1: Nueva API Retorna Errors 500**
```typescript
// ✅ DETECCIÓN Y ROLLBACK AUTOMÁTICO
const healthCheck = async () => {
  try {
    const testRequest = {
      input: "test query",
      sessionToken: sessionToken
    };
    
    await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(testRequest);
    return { healthy: true, api: 'modern' };
    
  } catch (error) {
    if (error.status >= 500 || error.message.includes('OVER_QUERY_LIMIT')) {
      uiLogger.error('🚨 Nueva API falló, activando rollback automático');
      return { healthy: false, api: 'modern', rollback: true };
    }
    throw error;
  }
};
```

### **Escenario 2: Session Tokens No Funcionan**
```typescript
// ✅ FALLBACK A REQUESTS SIN SESSION
const adaptiveRequest = async (input: string, attempt: number = 1) => {
  if (attempt === 1) {
    // Intentar con session token
    try {
      return await fetchWithSessionToken(input);
    } catch (error) {
      if (error.message.includes('INVALID_REQUEST')) {
        return adaptiveRequest(input, 2); // Retry sin session
      }
      throw error;
    }
  } else {
    // Fallback: Request sin session token
    return await fetchWithoutSessionToken(input);
  }
};
```

### **Escenario 3: Performance Degradada**
```typescript
// ✅ ROLLBACK BASADO EN PERFORMANCE
const performanceGuard = {
  maxResponseTime: 1000, // ms
  maxConsecutiveSlowRequests: 3,
  
  evaluate: (responseTime: number): 'continue' | 'rollback' => {
    if (responseTime > this.maxResponseTime) {
      this.slowRequestCount++;
      
      if (this.slowRequestCount >= this.maxConsecutiveSlowRequests) {
        uiLogger.warn('🚨 Performance degradada detectada, iniciando rollback');
        return 'rollback';
      }
    } else {
      this.slowRequestCount = 0; // Reset counter on fast request
    }
    
    return 'continue';
  }
};
```

---

## 📝 COMUNICACIÓN DE ROLLBACK

### **Template de Incident Report**

```markdown
## 🚨 INCIDENT REPORT: Places API v2 Rollback

**Fecha/Hora**: [timestamp]
**Duración**: [X] minutos
**Impacto**: [descripción del impacto en usuarios]

### Razón del Rollback
- [ ] Nueva API completamente no funcional
- [ ] Performance inaceptable (>500% baseline)
- [ ] Errores masivos (>10% requests)
- [ ] Incompatibilidad crítica
- [ ] Otro: [especificar]

### Acciones Tomadas
1. **[timestamp]** - Problema detectado
2. **[timestamp]** - Rollback iniciado
3. **[timestamp]** - Servicio restaurado
4. **[timestamp]** - Verificación completa

### Métricas Post-Rollback
- Error rate: [X]%
- Avg response time: [X]ms
- User reports: [X] incident tickets

### Próximos Pasos
- [ ] Root cause analysis
- [ ] Fix identificado
- [ ] Testing plan actualizado
- [ ] Re-deployment planificado para [fecha]
```

---

## 🎯 PREVENCIÓN DE FUTUROS ROLLBACKS

### **Checklist de Deployment Robusto**

```typescript
// ✅ DEPLOYMENT SAFEGUARDS
const deploymentChecklist = {
  preDeployment: [
    '✅ Feature flags configurados',
    '✅ Rollback plan documentado',
    '✅ Monitoring alertas configuradas',
    '✅ Tests E2E passing',
    '✅ Performance benchmarks ok'
  ],
  
  deployment: [
    '✅ Gradual rollout (10% -> 50% -> 100%)',
    '✅ Real-time monitoring activo',
    '✅ Team on-call disponible',
    '✅ Rollback procedure validado'
  ],
  
  postDeployment: [
    '✅ Functional verification',
    '✅ Performance validation',
    '✅ Error rate monitoring',
    '✅ User feedback tracking'
  ]
};
```

### **Automated Rollback Triggers**
```typescript
// ✅ TRIGGER AUTOMÁTICO DE ROLLBACK
const rollbackTriggers = {
  errorRateThreshold: 10, // % 
  responseTimeThreshold: 2000, // ms
  consecutiveFailures: 5,
  
  shouldTriggerRollback: (metrics: Metrics): boolean => {
    return metrics.errorRate > this.errorRateThreshold ||
           metrics.avgResponseTime > this.responseTimeThreshold ||
           metrics.consecutiveFailures >= this.consecutiveFailures;
  }
};
```

---

## 📚 DOCUMENTACIÓN DE REFERENCIA

### **Enlaces Críticos**
- **Rollback Procedure**: Este documento
- **Feature Flag Config**: `src/lib/config/featureFlags.ts`
- **Monitoring Dashboard**: [URL del dashboard]
- **Emergency Contacts**: [Lista de contactos]

### **Comandos de Emergencia**
```bash
# Rollback inmediato via environment vars
NEXT_PUBLIC_USE_NEW_PLACES_API=false

# Rollback via código (emergency commit)
git checkout main && git revert [commit-hash] --no-edit && git push

# Health check
curl -f https://tu-app.com/api/places/health || echo "SERVICE DOWN"
```

---

*Documento creado: Septiembre 2025 - Estado: Plan de contingencia completo*

**🚨 IMPORTANTE**: En caso de emergencia crítica, contactar inmediatamente al equipo de desarrollo y ejecutar rollback según este procedimiento.