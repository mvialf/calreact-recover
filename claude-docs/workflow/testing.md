# 🧪 Testing - Estrategia Integral CalReact 2025

**Versión:** 2.0
**Última Actualización:** Octubre 2025
**Stack:** Jest 30.0.3 + Playwright 1.55.0 + Testing Library 14.3.1

Para **configuración de commands:** [commands.md](../references/commands.md)
Para **dependencias de testing:** [dependencias.md](../references/dependencias.md)

---

## 🎯 Filosofía y Principios de Testing

### 🧠 **Test-As-You-Go (Obligatorio)**
- **Crear tests DURANTE la implementación**, no después
- Verificar comportamiento desde **perspectiva del usuario**
- Usar `getByRole`, `getByText` antes que `getByTestId`

### 🏗️ **Pirámide de Testing Moderna**
```
           🔺 E2E (Pocos)
         🔶 Integration (Algunos)  
       🔷 Unit Tests (Muchos)
```

### 📊 **Estrategia Híbrida Optimizada**

| Funcionalidad | Tipo de Test | Herramientas | Justificación |
|---------------|--------------|--------------|---------------|
| **Lógica de negocio pura** | Unitarios | Jest + Mocks | Rápido, aislado, predictible |
| **Servicios Firebase críticos** | Integración | Emulator + SDK Testing | Comportamiento real de Firebase |
| **APIs externas (Google Maps)** | Unitarios | Mocks avanzados | Evita dependencias externas |
| **Componentes UI** | Unitarios | React Testing Library | Enfoque en comportamiento usuario |
| **Flujos completos** | E2E | Playwright | Validación end-to-end |

---

## 🛠️ Stack Tecnológico de Testing

### ⚡ **Testing Unitario e Integración**
- **Jest**: `30.0.3` - Framework de testing principal
- **React Testing Library**: `14.3.1` - Testing de componentes React
- **@testing-library/user-event**: `14.6.1` - Simulación de eventos de usuario
- **@testing-library/jest-dom**: `6.6.3` - Matchers personalizados para DOM
- **jest-environment-jsdom**: `29.7.0` - Entorno DOM virtual para Jest

### 🎭 **Testing E2E**
- **Playwright**: `1.55.0` - Framework E2E testing
- **@playwright/mcp**: `0.0.36` - Integración con Claude Code MCP

### 📋 **Tipos TypeScript**
- **@types/jest**: `29.5.12` - Tipos para Jest
- **@types/testing-library__jest-dom**: `5.14.9` - Tipos para Jest DOM matchers

---

## 🔧 Comandos de Testing

### 🧪 **Tests Unitarios**
```bash
npm test                # Modo observación (watch) - DESARROLLO
npm run test:ci         # Modo CI (sin observación) - CI/CD
npm run test:coverage   # Con reporte de cobertura
npm run test:all        # Ejecutar todas las pruebas
```

### 📊 **Testing Avanzado**
```bash
npm run test:types      # Verificar tipos en tests
npm run test:lint       # ESLint específico para tests  
npm run test:debug      # Modo debug con inspector
npm run test:watch-types # Observar tipos en tiempo real
```

### 🎬 **Tests E2E con Playwright**
```bash
npm run test:e2e               # Tests E2E completos
npm run test:e2e:ui           # Interfaz visual interactiva
npm run test:e2e:debug        # Modo debug paso a paso
npm run test:e2e:headed       # Navegador visible
npm run playwright:install    # Instalar navegadores
```

### 🖥️ **E2E Sistema (Navegadores del Sistema)**
```bash
npm run test:e2e:system        # Usar navegadores del sistema
npm run test:e2e:system:ui     # UI con navegadores del sistema
npm run test:e2e:system:headed # Headed con navegadores del sistema
```

---

## ⚙️ Configuración de Testing

### 🔧 **Jest Configuration** (`jest.config.js`)
- **Framework**: Next.js Jest integration
- **Environment**: `jest-environment-jsdom`
- **Setup**: `jest.setup.js` con mocks globales
- **Coverage**: `text`, `lcov`, `html` reporters
- **Timeout**: 10 segundos por test
- **Module Mapping**: `@/` → `src/`

### 🎭 **Playwright Configuration** (`playwright.config.ts`)
- **Base URL**: `http://localhost:3002` (Turbopack)
- **Browsers**: Chromium (con soporte para navegadores del sistema)
- **Timeout**: 60 segundos para tests, 10 para assertions
- **Screenshots**: Solo en fallos
- **Trace/Video**: Deshabilitado (evita dependencias FFmpeg)
- **Fixtures**: Estado de autenticación persistente

### 🎨 **Jest Setup** (`jest.setup.js`)
**Mocks globales configurados:**
- `@testing-library/jest-dom` - Matchers personalizados
- `fetch` - Mock global de fetch
- `matchMedia` - Mock para media queries
- `IntersectionObserver` - Mock para scroll components
- `ResizeObserver` - Mock para componentes responsive
- `localStorage`/`sessionStorage` - Mocks de storage
- Console filters - Evita spam en output de tests

---

## 📁 Estructura de Tests

### 🗂️ **Organización de Archivos**
```
src/
├── __tests__/                     # Setup centralizado
│   ├── setup/
│   │   ├── jest.setup.ts         # Configuración Jest unificada
│   │   ├── firebase-mocks.ts     # Mocks Firebase v11 centralizados
│   │   └── google-maps-mocks.ts  # Mocks Google Maps/Places
│   ├── helpers/
│   │   ├── test-data-factory.ts  # Factory datos de prueba
│   │   └── assertion-helpers.ts  # Assertions personalizadas
│   └── types/
│       └── testing.d.ts          # Tipos consolidados
│
├── components/
│   ├── ui/__tests__/
│   │   └── AddressInput.test.tsx  # Convención PascalCase
│   └── forms/__tests__/
│       └── ProjectFormCompound.test.tsx
├── services/__tests__/
│   ├── unit/                     # Tests unitarios con mocks
│   │   ├── afterSalesService.test.ts
│   │   └── visitService.test.ts
│   └── integration/              # Tests con Firebase Emulator
│       └── projectService.integration.test.ts
├── lib/
│   ├── config/__tests__/unit/
│   │   └── featureFlags.test.ts
│   └── places/__tests__/unit/
│       └── PlacesServiceAdapter.test.ts
└── utils/__tests__/unit/
    └── address-utils.test.ts

e2e/
├── tests/
│   ├── address-selection.spec.ts
│   ├── auth.e2e.ts
│   ├── projects.e2e.ts
│   └── smoke.spec.ts
├── fixtures/          # Estado de autenticación
├── helpers/           # Utilidades E2E
└── types/             # Tipos específicos E2E
```

### 📊 **Cobertura Actual**
- **Tests unitarios**: 8 archivos organizados en estructura unit/integration
- **Tests E2E**: 4 archivos
- **Setup centralizado**: 5 archivos en `/src/__tests__/`
- **Objetivo de cobertura**: >70% en código nuevo
- **Directorios excluidos**: `/e2e/`, `/coverage/`, `/.next/`, `/src/__tests__/`

---

## 🎨 Patrones y Best Practices

### 🔍 **Selección de Elementos (Prioridad)**
```typescript
// ✅ ORDEN DE PRIORIDAD para seleccionar elementos
// 1. getByRole (más semántico)
screen.getByRole('button', { name: /guardar/i })

// 2. getByText (contenido visible)
screen.getByText(/proyecto creado/i)

// 3. getByTestId (último recurso)
screen.getByTestId('project-form')
```

### 📋 **Estructura de Tests Estándar**
```typescript
// ✅ PATRÓN para estructura de tests
describe('ComponentName', () => {
  // Setup común
  beforeEach(() => {
    // Configuración por test
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar correctamente', () => {
    // Arrange
    render(<Component {...props} />);
    
    // Act
    // Interacciones del usuario
    
    // Assert  
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### 🎭 **Mocking Patterns (Actualizados)**
```typescript
// ✅ USAR setup centralizado
import { setupFirestoreResponse, resetFirebaseMocks } from '@/__tests__/setup/firebase-mocks';
import { setupPlacesResponse, resetGoogleMapsMocks } from '@/__tests__/setup/google-maps-mocks';
import { createMockProject, createMockClient } from '@/__tests__/helpers/test-data-factory';

// ✅ Setup en tests
beforeEach(() => {
  resetFirebaseMocks();
  resetGoogleMapsMocks();
});

// ✅ Configurar respuestas específicas
setupFirestoreResponse.success(createMockProject());
setupPlacesResponse.predictions();
```

---

## 🛡️ Testing de Firebase (v11.x)

### 🔥 **Firebase Testing Strategy**
- **Emulator Suite** para tests de integración críticos
- **Mocks avanzados** para tests unitarios rápidos
- **Utilidades personalizadas** para conversión de datos

### 📚 **Recursos de Mocks Disponibles (Actualizados)**
Setup centralizado en `/src/__tests__/setup/`:
- **firebase-mocks.ts** - Mocks completos Firebase v11 centralizados
- **google-maps-mocks.ts** - Mocks Google Maps/Places API centralizados
- **jest.setup.ts** - Configuración Jest optimizada y unificada

Helpers en `/src/__tests__/helpers/`:
- **test-data-factory.ts** - Factories para datos de prueba consistentes
- **assertion-helpers.ts** - Helpers para assertions comunes

---

## 🗺️ Testing de Google Maps

### 🗺️ **PlacesServiceAdapter Testing (Actualizado)**
- **Mocks centralizados** en `/src/__tests__/setup/google-maps-mocks.ts`
- **Simulación de respuestas** Places API con helpers
- **Tests unitarios** organizados en estructura estándar

Ver implementación: `src/lib/places/__tests__/unit/PlacesServiceAdapter.test.ts`

---

## 📊 Coverage y Métricas

### 📈 **Configuración de Cobertura**
```javascript
// jest.config.js - Cobertura configurada
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',
  '!src/**/*.d.ts',
  '!src/__mocks__/**',
  '!src/types/**',
  '!src/app/globals.css',
]
```

### 🎯 **Métricas Actuales Verificadas**
```bash
✅ React Hooks errors: 0 (20 errores resueltos)
✅ Console.logs: 0 en producción (solo 8 en logger.ts oficial)  
✅ TypeScript errors: 0
✅ ESLint críticos: 0
✅ Build status: Exitoso
✅ Test coverage: >70% en código nuevo
✅ TODOs pendientes: 0 en servicios críticos
```

---

## 🚀 Flujo de Trabajo Testing

### 1. 🔄 **Durante Desarrollo**
```bash
npm test  # Watch mode para tests unitarios
```

### 2. 🧪 **Antes de Commit**
```bash
npm run test:ci      # Tests en modo CI
npm run test:coverage # Verificar cobertura  
```

### 3. 🎬 **Testing E2E**
```bash
npm run test:e2e     # Tests completos E2E
```

### 4. ✅ **Validación Final** (OBLIGATORIO)
```bash
npm run lint && npm run typecheck  # Calidad de código
```

---

## 📚 Recursos Avanzados

### 📖 **Implementación Actual**
Ver implementación práctica en:
- **Setup centralizado**: `src/__tests__/setup/` - Configuración Jest y mocks centralizados
- **Helpers de testing**: `src/__tests__/helpers/` - Factories y assertions personalizadas
- **Tests unitarios**: `src/**/__tests__/unit/` - Ejemplos de tests unitarios
- **Tests de integración**: `src/**/__tests__/integration/` - Tests con Firebase Emulator
- **Tests E2E**: `e2e/tests/` - Tests end-to-end con Playwright

### 🛠️ **Mocks y Configuración Actuales**
- **Firebase v11 mocks**: `src/__tests__/setup/firebase-mocks.ts`
- **Google Maps mocks**: `src/__tests__/setup/google-maps-mocks.ts`
- **Jest setup**: `src/__tests__/setup/jest.setup.ts`
- **Test data factory**: `src/__tests__/helpers/test-data-factory.ts`

---

## 🚨 Notas Críticas

### ⚠️ **Firebase v11 Testing**
- **Usar mocks v11 específicos** - NO usar patrones v9/v10
- **Timestamp mocking** requiere estructura específica
- **Emulator suite** configurada para tests de integración

### 🎭 **Playwright Specifics**
- **Puerto 3002** configurado (Turbopack)
- **MCP integration** para Claude Code
- **Sistema browsers** disponible con PLAYWRIGHT_BROWSERS_PATH=0

### 📊 **Coverage Requirements**
- **>70% cobertura** obligatoria en código nuevo
- **Tests críticos** para servicios de negocio
- **Smoke tests** para flujos principales

---

**📊 Generado automáticamente:** Octubre 2025  
**🔧 Para comandos específicos:** [commands.md](../references/commands.md)
**📦 Para dependencias de testing:** [dependencias.md](../references/dependencias.md)