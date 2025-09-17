# 🔧 Google Places API v2 - Correcciones Pendientes

**Estado**: 🚧 PENDIENTE DE IMPLEMENTACIÓN
**Prioridad**: Alta - Optimización de costos crítica
**Fecha de análisis**: Septiembre 2025
**Impacto estimado**: Reducción 15-30% costos API + Mejora robustez
**Tiempo estimado**: 1-2 semanas

---

## 📋 Resumen Ejecutivo

La implementación actual de Google Places API v2 está **85% correcta** pero requiere correcciones críticas para optimización de costos y robustez. El problema principal es la **no propagación de session tokens** entre autocomplete y place details, resultando en sobrecostos innecesarios.

### 🎯 Objetivos de Corrección
1. **Reducir costos API**: 15-30% ahorro mensual (~90 USD/mes)
2. **Mejorar robustez**: Validación y manejo de errores más específicos
3. **Completar implementación**: Alcanzar 100% cumplimiento con especificación v2
4. **Optimizar UX**: Mejor handling de idiomas y configuraciones

---

## 🚨 Problemas Críticos Identificados

### 1. 🔴 **CRÍTICO: Session Token No Se Propaga**

**Problema**: El session token creado para autocomplete no se reutiliza en place details.

**Impacto Económico**:
- **Sin corrección**: ~20 USD/día (1000 búsquedas)
- **Con corrección**: ~17 USD/día
- **Ahorro**: **90 USD/mes**

**Archivos Afectados**: `src/lib/places/PlacesServiceAdapter.ts`

**Ubicación del Bug**:
```typescript
// ❌ PROBLEMA ACTUAL (líneas 239-291)
public async getPlaceDetails(placeId: string) {
  const place = new Place({
    id: placeId,
    requestedLanguage: this.config.language || 'es'
    // FALTA: sessionToken - Se pierde la optimización
  });
}
```

### 2. ⚠️ **Validación Incompleta de API Moderna**

**Problema**: Solo verifica `AutocompleteSuggestion`, no `Place` class.

**Impacto**: Falsos positivos en detección de API, fallback innecesario.

```typescript
// ❌ ACTUAL
if (this.placesLib.AutocompleteSuggestion) { ... }

// ✅ CORRECCIÓN NECESARIA
if (this.placesLib.AutocompleteSuggestion && this.placesLib.Place) { ... }
```

### 3. ⚠️ **Campo requestedLanguage Faltante**

**Problema**: No se especifica idioma en Place instantiation.

**Impacto**: Respuestas en idioma incorrecto, UX degradada.

### 4. ⚠️ **Manejo de Errores Mejorable**

**Problema**: Errores genéricos, difícil debugging en producción.

**Impacto**: Tiempo de resolución de issues más largo.

---

## 🔧 Implementación Técnica

### Corrección 1: Session Token Propagation

**Archivo**: `src/lib/places/PlacesServiceAdapter.ts`

#### Para API Moderna:
```typescript
// ✅ CORRECCIÓN - getPlaceDetails moderno (líneas ~250-275)
private async getPlaceDetailsModern(placeId: string, fields?: string[]) {
  const place = new Place({
    id: placeId,
    requestedLanguage: this.config.language || 'es',
    // ✅ AGREGAR: Propagar session token
    sessionToken: this.sessionToken
  });

  await place.fetchFields({
    fields: this.mapFieldsToModernAPI(fields),
    // ✅ ALTERNATIVA: Si no funciona en constructor
    sessionToken: this.sessionToken
  });

  return this.convertModernPlaceToLegacy(place);
}
```

#### Para API Legacy:
```typescript
// ✅ CORRECCIÓN - getPlaceDetailsLegacy (líneas ~296-333)
private async getPlaceDetailsLegacy(placeId: string, fields?: string[]) {
  const request: google.maps.places.PlaceDetailsRequest = {
    placeId,
    fields: fields || [...],
    language: this.config.language,
    // ✅ AGREGAR: Propagar session token
    sessionToken: this.sessionToken
  };

  // Resto de implementación...
}
```

### Corrección 2: Validación Completa API

```typescript
// ✅ CORRECCIÓN - initialize() método (líneas ~51-99)
public async initialize(): Promise<void> {
  if (PlacesFeatureFlags.shouldUseNewAPI()) {
    try {
      this.placesLib = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;

      // ✅ VALIDACIÓN COMPLETA
      const hasAutocompleteSuggestion = !!this.placesLib.AutocompleteSuggestion;
      const hasPlace = !!this.placesLib.Place;
      const hasSessionToken = !!this.placesLib.AutocompleteSessionToken;

      if (hasAutocompleteSuggestion && hasPlace && hasSessionToken) {
        this.apiVersion = 'modern';
        if (this.config.sessionToken) {
          this.sessionToken = new this.placesLib.AutocompleteSessionToken();
        }

        uiLogger.info('✅ Places API: Nueva API completamente disponible', {
          AutocompleteSuggestion: hasAutocompleteSuggestion,
          Place: hasPlace,
          SessionToken: hasSessionToken
        });
        this.initialized = true;
        return;
      } else {
        throw new Error(`Nueva API parcialmente disponible: AutocompleteSuggestion(${hasAutocompleteSuggestion}), Place(${hasPlace}), SessionToken(${hasSessionToken})`);
      }
    } catch (error) {
      uiLogger.warn('⚠️ Nueva Places API no completamente disponible:', {
        error: error.message,
        fallbackAllowed: PlacesFeatureFlags.isFallbackAllowed()
      });

      if (PlacesFeatureFlags.isFallbackAllowed()) {
        await this.initializeLegacyAPI();
        return;
      } else {
        throw new Error(`❌ Nueva API falló y fallback no permitido: ${error.message}`);
      }
    }
  } else {
    await this.initializeLegacyAPI();
  }
}
```

### Corrección 3: requestedLanguage Support

```typescript
// ✅ CORRECCIÓN - getPlaceDetails (líneas ~239-291)
public async getPlaceDetails(placeId: string, fields?: string[]) {
  // Para nueva API
  if (this.apiVersion === 'modern') {
    const place = new Place({
      id: placeId,
      // ✅ AGREGAR: Soporte de idioma
      requestedLanguage: this.config.language || 'es',
      requestedRegion: this.config.region || 'ES',
      // ✅ Session token
      sessionToken: this.sessionToken
    });

    // Resto de implementación...
  }
}
```

### Corrección 4: Error Handling Específico

```typescript
// ✅ MEJORAR - Error handling (varias ubicaciones)
private handleAPIError(error: any, context: string): never {
  const errorDetails = {
    context,
    apiVersion: this.apiVersion,
    sessionTokenExists: !!this.sessionToken,
    timestamp: new Date().toISOString(),
    error: error.message || error.toString()
  };

  if (PlacesFeatureFlags.isMonitoringEnabled()) {
    uiLogger.error(`❌ Places API Error [${context}]`, errorDetails);
  }

  // Error específico por contexto
  let userMessage = 'Error en servicio de mapas';
  if (context === 'autocomplete') {
    userMessage = 'Error al buscar direcciones. Por favor, inténtelo nuevamente.';
  } else if (context === 'place_details') {
    userMessage = 'Error al obtener detalles del lugar. Por favor, inténtelo nuevamente.';
  }

  throw new Error(userMessage);
}
```

---

## 📊 Plan de Implementación

### Fase 1: Desarrollo y Testing Interno (Semana 1)

#### Día 1-2: Core Corrections
- [ ] **Implementar session token propagation**
  - Modificar `getPlaceDetails()` para API moderna
  - Modificar `getPlaceDetailsLegacy()` para API legacy
  - Verificar que el token se reutilice correctamente

#### Día 3-4: Robustez Improvements
- [ ] **Mejorar validación de API**
  - Implementar validación completa (AutocompleteSuggestion + Place + SessionToken)
  - Añadir logging detallado para debugging

- [ ] **Agregar requestedLanguage/Region**
  - Implementar soporte de idioma y región en Place initialization
  - Actualizar configuración default

#### Día 5: Error Handling & Testing
- [ ] **Mejorar manejo de errores**
  - Implementar error handling específico por contexto
  - Agregar métricas de error para monitoreo

- [ ] **Actualizar tests unitarios**
  - Test session token propagation
  - Test validación completa de API
  - Test error scenarios específicos

### Fase 2: Integration Testing (Días 6-8)

#### Testing Completo
- [ ] **Test en AddressInput component**
  - Verificar que session tokens funcionan end-to-end
  - Test de fallback API legacy ↔ moderna
  - Test de manejo de errores en UI

- [ ] **Performance Testing**
  - Medir reducción real de requests API
  - Verificar cache behavior con session tokens
  - Test de latency improvements

#### Monitoring Setup
- [ ] **Configurar métricas**
  - Track session token usage rate
  - Monitor API error rates por tipo
  - Track cost optimization metrics

### Fase 3: Staging Validation (Días 9-10)

#### Staging Deployment
- [ ] **Deploy con feature flags**
  - Habilitar correcciones al 10% usuarios staging
  - Monitor performance y errores
  - Validar métricas de costos

#### User Acceptance Testing
- [ ] **Test real user scenarios**
  - Test autocomplete → place selection flow
  - Verificar UX no degradada
  - Test edge cases (API timeouts, network issues)

### Fase 4: Production Rollout (Días 11-14)

#### Gradual Rollout
- [ ] **Rollout gradual con feature flags**
  - 10% usuarios → 25% → 50% → 100%
  - Monitor métricas en cada fase
  - Rollback plan preparado

#### Success Validation
- [ ] **Validar métricas de éxito**
  - Confirmar reducción de costos API
  - Verificar reducción de errores
  - User satisfaction metrics

---

## 📈 Métricas de Éxito

### Métricas Técnicas
```bash
# Pre-implementación
Session Token Usage: 0%
API Errors Rate: ~0.3%
Avg Request/Session: ~2.2
Cost/1000 Sessions: ~20 USD

# Post-implementación (Target)
Session Token Usage: >95%
API Errors Rate: <0.1%
Avg Request/Session: ~1.2
Cost/1000 Sessions: ~15 USD
```

### KPIs de Negocio
- **Reducción de costos**: 15-30% en factura Google Maps API
- **Mejora UX**: Menos errores, respuestas en idioma correcto
- **Tiempo desarrollo**: Debugging más rápido con logs específicos
- **Mantenibilidad**: Código más robusto y verificable

---

## 🧪 Testing Strategy

### Unit Tests Updates
```typescript
// Nuevo test: Session token propagation
describe('PlacesServiceAdapter - Session Tokens', () => {
  it('debe reutilizar session token entre autocomplete y place details', async () => {
    const adapter = new PlacesServiceAdapter();
    await adapter.initialize();

    // Mock session token creation
    const mockToken = 'test-session-token';
    adapter['sessionToken'] = mockToken;

    // Spy on Place constructor
    const placeSpy = jest.spyOn(window.google.maps.places, 'Place');

    await adapter.getPlaceDetails('ChIJ123456');

    expect(placeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionToken: mockToken
      })
    );
  });

  it('debe validar completamente la disponibilidad de nueva API', async () => {
    // Mock partial API availability
    window.google.maps.places = {
      AutocompleteSuggestion: true,
      Place: undefined, // Missing Place class
      AutocompleteSessionToken: true
    };

    const adapter = new PlacesServiceAdapter();

    // Should fallback to legacy API
    await expect(adapter.initialize()).resolves.not.toThrow();
    expect(adapter.getAPIVersion()).toBe('legacy');
  });
});
```

### Integration Tests
```typescript
// Test completo AddressInput con session tokens
describe('AddressInput - Session Token Integration', () => {
  it('debe usar session token en flujo completo autocomplete → details', async () => {
    const onSelect = jest.fn();

    render(
      <AddressInput
        onSelect={onSelect}
        placeholder="Buscar dirección"
      />
    );

    // Type to trigger autocomplete
    await user.type(screen.getByRole('textbox'), 'Santiago Centro');

    // Wait for suggestions
    await waitFor(() => {
      expect(screen.getByText(/santiago/i)).toBeInTheDocument();
    });

    // Click on suggestion (triggers place details)
    await user.click(screen.getByText(/santiago/i));

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          textoCompleto: expect.stringContaining('Santiago'),
          coordenadas: expect.any(Object),
          placeId: expect.any(String)
        })
      );
    });

    // Verify session token was used (check network calls or mocks)
    // This would require more sophisticated mocking of Google Maps API
  });
});
```

---

## 🔍 Monitoring & Observability

### Logs Específicos
```typescript
// Logging mejorado para debugging
uiLogger.info('🎫 Session token creado', {
  sessionId: this.sessionToken,
  apiVersion: this.apiVersion,
  timestamp: Date.now()
});

uiLogger.info('🔄 Reutilizando session token para place details', {
  placeId,
  sessionId: this.sessionToken,
  fieldsRequested: fields?.length || 'default'
});

uiLogger.warn('⚠️ Session token no disponible', {
  context: 'place_details',
  reason: 'Token not created or expired',
  fallbackBehavior: 'individual_request'
});
```

### Métricas para Dashboard
```typescript
// Métricas a trackear en producción
interface PlacesMetrics {
  sessionTokenUsageRate: number; // % requests usando session tokens
  apiErrorsByType: {
    autocomplete: number;
    placeDetails: number;
    initialization: number;
  };
  costOptimizationMetrics: {
    sessionBasedRequests: number;
    individualRequests: number;
    estimatedSavings: number; // USD
  };
  apiVersionUsage: {
    modern: number;
    legacy: number;
    fallbackRate: number;
  };
}
```

---

## ✅ Checklist de Implementación

### Pre-implementación
- [ ] Backup current implementation
- [ ] Review Google Maps API billing current state
- [ ] Set up monitoring for session token metrics
- [ ] Prepare rollback plan

### Core Implementation
- [ ] **Session Token Propagation** (Crítico)
  - [ ] Modern API: Place constructor with sessionToken
  - [ ] Legacy API: PlaceDetailsRequest with sessionToken
  - [ ] Test token reuse works correctly

- [ ] **API Validation Complete** (Alto)
  - [ ] Check AutocompleteSuggestion + Place + SessionToken
  - [ ] Improve error messaging for partial API
  - [ ] Test fallback behavior

- [ ] **Language/Region Support** (Medio)
  - [ ] Add requestedLanguage to Place instantiation
  - [ ] Add requestedRegion configuration
  - [ ] Test with different locales

- [ ] **Error Handling** (Medio)
  - [ ] Context-specific error messages
  - [ ] Structured error logging
  - [ ] User-friendly error states

### Testing & Validation
- [ ] Unit tests pass with 100% coverage on changes
- [ ] Integration tests validate session token flow
- [ ] Performance tests show cost reduction
- [ ] Manual testing in staging environment
- [ ] Load testing with session tokens

### Deployment
- [ ] Feature flags configured for gradual rollout
- [ ] Monitoring dashboards updated
- [ ] Documentation updated
- [ ] Team training on new monitoring metrics

### Post-deployment
- [ ] Monitor session token usage rate (target: >95%)
- [ ] Validate cost reduction in Google Cloud billing
- [ ] Monitor error rates (target: <0.1%)
- [ ] Collect user feedback on any UX changes

---

## 🚨 Rollback Plan

### Triggers para Rollback
- Session token usage rate < 50% after 48h
- API error rate increase > 2x baseline
- User complaints about autocomplete functionality
- Google Maps API costs increase instead of decrease

### Rollback Process
```bash
# Emergency rollback (immediate)
export NEXT_PUBLIC_FORCE_LEGACY_PLACES_API=true

# Gradual rollback via feature flags
# Disable new corrections feature flag
# Falls back to current implementation
```

### Rollback Validation
- [ ] Verify functionality returns to pre-implementation state
- [ ] Confirm API error rates return to baseline
- [ ] Check that costs don't increase further
- [ ] Document lessons learned for next attempt

---

## 📚 Referencias y Documentación

### Google Maps API Documentation
- [Places API v2 Migration Guide](https://developers.google.com/maps/documentation/javascript/place/javascript/places-migration-overview)
- [Session Tokens Best Practices](https://developers.google.com/maps/documentation/javascript/place/javascript/places-autocomplete#session-tokens)
- [AutocompleteSuggestion API Reference](https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data)

### Archivos del Proyecto
- **PlacesServiceAdapter**: `src/lib/places/PlacesServiceAdapter.ts`
- **AddressInput Component**: `src/components/ui/addressInput.tsx`
- **Feature Flags**: `src/lib/config/featureFlags.ts`
- **Tests**: `src/lib/places/__tests__/PlacesServiceAdapter.test.ts`

### Implementación Actual
- **Status**: 85% correcta según especificación oficial
- **Documentation**: `docs/technical/migrations/completed-migrations/google-places-2025.md`
- **Architecture**: Dual API support con fallback automático

---

**Fecha de creación**: Septiembre 2025
**Próxima revisión**: Post-implementación (2 semanas)
**Responsable sugerido**: Equipo Frontend + DevOps (monitoreo)
**Prioridad**: Alta - Impacto directo en costos operacionales

---

## 🎯 Próximos Pasos Inmediatos

1. **Revisar y aprobar** este plan de implementación
2. **Asignar recursos** para las 2 semanas de desarrollo
3. **Configurar métricas** de baseline antes de implementar
4. **Preparar feature flags** para rollout controlado
5. **Iniciar implementación** con la corrección de session tokens (mayor ROI)

**¿Listo para proceder con la implementación?** 🚀