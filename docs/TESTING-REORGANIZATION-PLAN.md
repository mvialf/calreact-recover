# 📋 Plan de Reorganización de Testing - CalReact

**Fecha:** Septiembre 2025
**Estado:** 🔄 Pendiente de implementación
**Prioridad:** Alta
**Impacto:** Mejora significativa en mantenibilidad y discoverabilidad de tests

## 📊 Contexto del Problema

### Situación Actual
- **8 archivos de test unitarios** dispersos en 6 directorios diferentes
- **2 archivos de test E2E** en estructura separada
- **3 archivos de definición TypeScript duplicados** para testing
- **Documentación duplicada** entre `claude-docs/workflow/testing.md` y `docs/technical/testing/`
- **Dificultad para ubicar y mantener** todos los archivos relacionados con testing

### Archivos de Test Actuales
```
src/
├── components/
│   ├── ui/__tests__/addressInput.test.tsx
│   └── forms/__tests__/ProjectFormCompound.test.tsx
├── services/__tests__/
│   ├── projectService.test.ts
│   ├── afterSalesService.test.ts
│   └── visitService.test.ts
├── lib/
│   ├── config/__tests__/featureFlags.test.ts
│   └── places/__tests__/PlacesServiceAdapter.test.ts
└── utils/__tests__/address-utils.test.ts

e2e/tests/
├── smoke.spec.ts
└── address-selection.spec.ts
```

### Problemas Identificados
1. **Dispersión:** Tests distribuidos sin convención clara
2. **Duplicación:** 3 archivos jest.d.ts en diferentes ubicaciones
3. **Documentación fragmentada:** Múltiples fuentes de verdad
4. **Mantenibilidad:** Difícil actualizar configuración global

## ✅ Estructura Propuesta

### Organización Objetivo
```
src/
├── __tests__/                     # 🆕 NUEVO: Setup global centralizado
│   ├── setup/
│   │   ├── jest.setup.ts         # Configuración Jest unificada
│   │   ├── firebase-mocks.ts     # Mocks Firebase v11 centralizados
│   │   └── google-maps-mocks.ts  # Mocks Google Maps/Places
│   ├── helpers/
│   │   ├── test-data-factory.ts  # Factory para datos de prueba
│   │   └── assertion-helpers.ts  # Assertions personalizadas
│   └── types/
│       └── testing.d.ts          # Tipos TypeScript consolidados
│
├── components/
│   ├── ui/
│   │   ├── AddressInput.tsx
│   │   └── __tests__/
│   │       └── AddressInput.test.tsx    # Mantener co-location
│   └── forms/
│       ├── ProjectForm.tsx
│       └── __tests__/
│           └── ProjectForm.test.tsx
│
├── services/
│   ├── projectService.ts
│   └── __tests__/
│       ├── unit/                         # 🆕 Separación clara
│       │   └── projectService.test.ts
│       └── integration/                  # 🆕 Tests con emulator
│           └── projectService.integration.test.ts
│
├── hooks/                               # 🆕 Tests faltantes críticos
│   └── __tests__/
│       ├── useFormValidation.test.ts
│       ├── useGooglePlaces.test.ts
│       └── usePaymentsData.test.ts

e2e/                                     # Mantener separado
├── tests/
├── helpers/
└── fixtures/
```

### Documentación Consolidada
```
claude-docs/workflow/
└── testing.md                          # Documento principal único

docs/technical/testing/                 # Solo recursos técnicos de apoyo
├── mocks/                              # Ejemplos de mocks
└── examples/                           # Code samples
```

## 📋 Checklist de Implementación

### 🚀 Fase 1: Quick Wins (1-2 horas) ✅ COMPLETADA
- [x] **Eliminar duplicación TypeScript definitions**
  - [x] Eliminar `/types/jest.d.ts` duplicado
  - [x] Consolidar en `/src/types/jest.d.ts`
  - [x] Actualizar `/src/types/testing.d.ts` para referencias correctas

- [x] **Crear estructura centralizada**
  ```bash
  mkdir -p src/__tests__/{setup,helpers,types}
  ```

- [x] **Mover configuraciones globales**
  - [x] Migrar jest.setup.js a `src/__tests__/setup/jest.setup.ts`
  - [x] Crear mocks Firebase v11 en `src/__tests__/setup/firebase-mocks.ts`
  - [x] Crear mocks Google Maps en `src/__tests__/setup/google-maps-mocks.ts`
  - [x] Crear test data factory en `src/__tests__/helpers/test-data-factory.ts`
  - [x] Crear assertion helpers en `src/__tests__/helpers/assertion-helpers.ts`
  - [x] Actualizar jest.config.js para usar nueva estructura

### 🎯 Fase 2: Estandarización (2-3 horas) ✅ COMPLETADA
- [x] **Aplicar convenciones de nomenclatura**
  - [x] `AddressInput.test.tsx` - Componente renombrado a PascalCase
  - [x] Todos los tests mantienen convención `.test.ts/.tsx`
  - [x] Tests de integración con sufijo `.integration.test.ts`

- [x] **Reorganizar tests existentes**
  - [x] Crear subdirectorios `unit/` e `integration/` en `/src/services/__tests__/`
  - [x] Crear subdirectorios `unit/` en `/src/lib/config/__tests__/`, `/src/lib/places/__tests__/`, `/src/utils/__tests__/`
  - [x] Mantener co-location con código fuente
  - [x] Corregir imports relativos después de reorganización

- [x] **Consolidar documentación**
  - [x] Actualizar estructura en `claude-docs/workflow/testing.md`
  - [x] Actualizar patrones de mocking con setup centralizado
  - [x] Corregir referencias a nueva estructura
  - [x] Actualizar cobertura y métricas

### 📊 Fase 3: Completar Gaps Críticos (4-6 horas)
- [ ] **Tests para hooks críticos**
  - [ ] `useFormValidation.test.ts` - CRÍTICO
  - [ ] `useGooglePlaces.test.ts` - CRÍTICO
  - [ ] `usePaymentsData.test.ts` - ALTO
  - [ ] `useClientPaymentData.test.ts` - ALTO

- [ ] **Smoke tests para páginas principales**
  - [ ] `/app/projects/page.test.tsx`
  - [ ] `/app/payments/page.test.tsx`
  - [ ] `/app/clients/page.test.tsx`

- [ ] **Tests para constants y contexts**
  - [ ] Constants de validación
  - [ ] AuthContext
  - [ ] DataSyncContext

### ✅ Fase 4: Optimización (1-2 horas)
- [ ] **Actualizar configuración Jest**
  - [ ] Paths mapping para nuevo setup
  - [ ] Coverage patterns actualizados

- [ ] **Documentar convenciones**
  - [ ] Crear guía de convenciones en README
  - [ ] Actualizar CLAUDE.md con nueva estructura

- [ ] **Validar estructura completa**
  - [ ] Ejecutar todos los tests
  - [ ] Verificar coverage
  - [ ] Confirmar imports funcionan

## 📐 Convenciones Establecidas

### Nomenclatura de Archivos
```typescript
// Componentes React
ComponentName.test.tsx

// Servicios y utilities
serviceName.test.ts

// Tests de integración
serviceName.integration.test.ts

// Tests E2E
feature-name.spec.ts
```

### Estructura de Tests
```typescript
describe('ComponentName', () => {
  // Setup común
  beforeEach(() => {
    // Configuración
  });

  // Cleanup
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests agrupados por funcionalidad
  describe('rendering', () => {
    it('debe renderizar correctamente', () => {
      // Test
    });
  });

  describe('user interactions', () => {
    it('debe manejar click', () => {
      // Test
    });
  });
});
```

### Imports Centralizados
```typescript
// Usar setup centralizado
import { mockFirebase } from '@/__tests__/setup/firebase-mocks';
import { mockGoogleMaps } from '@/__tests__/setup/google-maps-mocks';
import { createMockProject } from '@/__tests__/helpers/test-data-factory';
```

## 🎯 Beneficios Esperados

1. **Mantenibilidad mejorada:** Un solo lugar para configuración global
2. **Discoverabilidad:** Fácil ubicar todos los tests
3. **DRY:** Eliminación de duplicaciones
4. **Escalabilidad:** Estructura que crece naturalmente
5. **Developer Experience:** Tests donde se esperan encontrar

## 📚 Referencias

- **Análisis técnico completo:** Sesión con teacher agent del 17/09/2025
- **Documentación actual de testing:** `claude-docs/workflow/testing.md`
- **Patrones establecidos:** `claude-docs/references/patterns.md`

## 🔄 Estado de Implementación

| Fase | Estado | Progreso | Notas |
|------|--------|----------|-------|
| Fase 1: Quick Wins | ✅ Completada | 100% | Duplicaciones eliminadas, estructura centralizada creada |
| Fase 2: Estandarización | ✅ Completada | 100% | Convenciones aplicadas, tests reorganizados, documentación actualizada |
| Fase 3: Gaps Críticos | ⏳ Pendiente | 0% | Tests faltantes |
| Fase 4: Optimización | ⏳ Pendiente | 0% | Validación final |

---

**📅 Creado:** Septiembre 17, 2025
**👤 Última actualización:** Septiembre 17, 2025 - Fase 2 completada
**🎯 Próxima sesión:** Implementar Fase 3 - Completar Gaps Críticos

## ✅ Resumen Fase 1 Completada

### Archivos Creados:
- `/src/__tests__/setup/jest.setup.ts` - Configuración Jest centralizada
- `/src/__tests__/setup/firebase-mocks.ts` - Mocks Firebase v11 completos
- `/src/__tests__/setup/google-maps-mocks.ts` - Mocks Google Maps API
- `/src/__tests__/helpers/test-data-factory.ts` - Factory para datos de prueba
- `/src/__tests__/helpers/assertion-helpers.ts` - Helpers para assertions

### Cambios Realizados:
- ✅ Eliminado `/types/jest.d.ts` duplicado
- ✅ Consolidado tipos en `/src/types/jest.d.ts`
- ✅ Actualizado `jest.config.js` para usar nueva estructura
- ✅ Corregidos errores TypeScript en test factories
- ✅ Verificado que `npm run typecheck` pasa sin errores

### Beneficios Inmediatos:
- 🎯 Setup centralizado para todos los tests
- 🔧 Mocks reutilizables para Firebase v11 y Google Maps
- 📚 Factories de datos mock consistentes
- 🛠️ Helpers de assertions para patterns comunes
- ✅ Eliminación completa de duplicaciones

## ✅ Resumen Fase 2 Completada

### Reorganización de Tests:
- **`AddressInput.test.tsx`** - Renombrado siguiendo convención PascalCase
- **Tests unitarios** organizados en subdirectorios `/unit/`
- **Tests de integración** organizados en subdirectorios `/integration/`
- **Imports corregidos** después de reorganización

### Estructura Final Aplicada:
```
src/services/__tests__/
├── unit/                     # Tests unitarios con mocks
│   ├── afterSalesService.test.ts
│   └── visitService.test.ts
└── integration/              # Tests con Firebase Emulator
    └── projectService.integration.test.ts

src/lib/places/__tests__/unit/
└── PlacesServiceAdapter.test.ts

src/utils/__tests__/unit/
└── address-utils.test.ts
```

### Documentación Actualizada:
- ✅ Estructura en `claude-docs/workflow/testing.md` actualizada
- ✅ Patrones de mocking con setup centralizado documentados
- ✅ Referencias corregidas para nueva estructura
- ✅ Métricas y cobertura actualizadas

### Beneficios Adicionales:
- 📂 Organización clara por tipo de test (unit/integration)
- 🔄 Convenciones consistentes aplicadas
- 📖 Documentación alineada con implementación real
- ✅ TypeScript compila sin errores después de reorganización