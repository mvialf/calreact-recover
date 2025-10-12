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

### 🏗️ **Estrategia E2E-First (Actualizado Octubre 2025)**
```
           🔺 E2E (MÁS - Prioridad alta)
         🔶 Integration (Algunos - críticos)
       🔷 Unit Tests (MENOS - solo lógica pura)
```

**Filosofía:** Priorizar tests E2E con Playwright sobre tests unitarios complejos de hooks/componentes.

### 📊 **Estrategia de Testing por Tipo de Código**

| Código a Testear | Estrategia Recomendada | Herramientas | Justificación |
|------------------|------------------------|--------------|---------------|
| **Hooks con UI (useGooglePlaces, useFormValidation)** | E2E del componente que lo usa | Playwright | Testing real sin mocking complejo |
| **Flujos de usuario completos** | E2E | Playwright | Validación comportamiento end-to-end |
| **Lógica pura (utils, helpers)** | Unitarios | Jest | Rápido, sin dependencias externas |
| **Servicios Firebase críticos** | Integración | Emulator + SDK | Comportamiento real de Firebase |
| **Componentes UI aislados** | Unitarios | React Testing Library | Solo si no están en E2E |

### ✅ **Cuándo usar E2E vs Unitarios**

**USAR E2E cuando:**
- Hook interactúa con UI (formularios, inputs, selects)
- Funcionalidad requiere integración de múltiples componentes
- Validación de flujo completo de usuario
- APIs externas (Google Maps, etc.) se usan en UI

**USAR Unitarios cuando:**
- Lógica pura sin dependencias (utils, validadores)
- Funciones de transformación de datos
- Helpers que NO requieren DOM
- Performance crítica (tests muy rápidos)

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
│   ├── address-selection.spec.ts              # Tests legacy de dirección
│   ├── address-input-integration.spec.ts      # 🆕 Tests completos AddressInput + useGooglePlaces
│   ├── auth.e2e.ts                            # Tests de autenticación
│   ├── projects.e2e.ts                        # Tests de proyectos
│   ├── payments-flow.spec.ts                  # 🆕 Tests flujo completo pagos + usePaymentsData
│   ├── form-validation-flow.spec.ts           # 🆕 Tests validación formularios + useFormValidation
│   ├── smoke.spec.ts                          # Smoke tests básicos
│   ├── calendar-drag-drop.spec.ts             # Tests drag & drop calendario
│   ├── calendar-drag-drop-specific.spec.ts    # Tests específicos calendario
│   └── uninstall-tags-flow.spec.ts            # Tests flujo uninstall tags
├── fixtures/          # Estado de autenticación
├── helpers/           # Utilidades E2E
└── types/             # Tipos específicos E2E
```

### 📊 **Cobertura Actual (Actualizado Octubre 2025)**
- **Tests unitarios**: 30+ archivos organizados en estructura unit/integration
- **Tests E2E**: 10 archivos (3 nuevos para hooks críticos)
- **Setup centralizado**: 5 archivos en `/src/__tests__/`
- **Objetivo de cobertura**: >70% en código nuevo
- **Directorios excluidos**: `/e2e/`, `/coverage/`, `/.next/`, `/src/__tests__/`

### 🆕 **Nuevos Tests E2E (Octubre 2025)**
1. **`payments-flow.spec.ts`** - Flujo completo de pagos
   - Renderizado de tabla con datos enriquecidos (usePaymentsData)
   - Creación de nuevo pago con validación
   - Filtrado de pagos por cliente
   - Actualización de tabla después de crear pago

2. **`address-input-integration.spec.ts`** - Integration Google Places
   - Autocomplete de Google Places (useGooglePlaces)
   - Selección de dirección y extracción de componentes
   - Configuración de país desde Settings
   - Uso de país de entidad al editar
   - Performance y cache de búsquedas

3. **`form-validation-flow.spec.ts`** - Validación de formularios
   - Validación en tiempo real (useFormValidation)
   - Mensajes de error personalizados
   - Validación cross-field
   - Accesibilidad (atributos ARIA)
   - Loading states durante submit

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

## 🛡️ Testing Componentes Radix UI

**Actualizado:** Octubre 2025
**Stack:** Radix UI 1.x, @testing-library/user-event 14.6.1, Jest 30.0.3
**Componentes aplicables:** Autocomplete, Popover, Dialog, Select, Dropdown, Tooltip

### 📋 **Quick Reference**

```typescript
// ✅ Infrastructure setup obligatorio
global.PointerEvent = MouseEvent as any;  // jest.setup.ts

// ✅ Fake timers + userEvent
jest.useFakeTimers();
const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

// ✅ Performance optimization
await user.paste('texto largo');  // NO user.type() para strings largos

// ✅ Validaciones semánticas
expect(item).toHaveAttribute('aria-selected', 'true');  // NO .toHaveClass()
```

---

### 🔧 **Configuración Infrastructure (jest.setup.ts)**

#### **Problema 1: PointerEvent API Missing**

**Contexto:**
Radix UI utiliza `PointerEvent` API para manejar interacciones (clicks, hover, focus). jsdom no implementa esta API nativamente, causando errores en tests.

**Síntoma:**
```bash
TypeError: window.PointerEvent is not a constructor
```

**Solución (Obligatoria):**
```typescript
// src/__tests__/setup/jest.setup.ts
// Mock PointerEvent global con MouseEvent
global.PointerEvent = MouseEvent as any;
```

**Referencia:** [Radix UI Issue #2619](https://github.com/radix-ui/primitives/issues/2619)

---

#### **Problema 2: Warnings act() de Radix UI Internals**

**Contexto:**
Radix UI Presence/Portal/Popper tienen efectos asíncronos internos que disparan warnings de `act()` fuera de nuestro control. Estos warnings son del código de la biblioteca, NO de nuestro código.

**Síntoma:**
```bash
Warning: An update to Presence inside a test was not wrapped in act(...)
Warning: An update to Portal inside a test was not wrapped in act(...)
Warning: An update to Popover inside a test was not wrapped in act(...)
```

**Solución (Suppression Selectiva):**
```typescript
// src/__tests__/setup/jest.setup.ts
const originalError = console.error;

console.error = (...args) => {
  // Suprimir warnings de act() de bibliotecas externas (Radix UI)
  // Estos son problemas conocidos de Radix UI, no de nuestro código
  if (
    typeof args[0] === 'string' &&
    args[0].includes('An update to') &&
    args[0].includes('inside a test was not wrapped in act')
  ) {
    return; // Suprimir silenciosamente
  }

  originalError.call(console, ...args);
};
```

**Importante:** Esta suppression es **arquitecturalmente correcta** porque:
- ✅ Los warnings provienen de código externo (Radix UI)
- ✅ No podemos controlar los efectos internos de Radix UI
- ✅ Alternativa sería wrappear todo en `act()`, pero no funciona con async effects internos
- ✅ Radix UI tiene issue abierto reconociendo el problema

---

#### **Problema 3: Timeout Global Insuficiente**

**Contexto:**
Radix UI Popover/Dialog tienen animaciones y efectos asíncronos que pueden tardar >10 segundos en completarse con `userEvent` en tests lentos.

**Solución:**
```typescript
// src/__tests__/setup/jest.setup.ts
// Aumentar timeout a 20s para componentes Radix UI
jest.setTimeout(20000);
```

**Alternativa (Test-specific):**
```typescript
it('test con popover complejo', async () => {
  // ...
}, 30000); // 30 segundos para este test específico
```

---

### ⚡ **Patrones de Testing**

#### **Patrón 1: Fake Timers + userEvent**

**Problema:**
userEvent v14+ es completamente asíncrono y usa `setTimeout` internamente. Cuando `jest.useFakeTimers()` está activo, bloquea los timers de userEvent causando timeouts.

**Síntoma:**
```bash
thrown: "Exceeded timeout of 10000 ms for a test."
```

**Solución:**
```typescript
// ❌ INCORRECTO (causa timeout):
const user = userEvent.setup();
jest.useFakeTimers();

// ✅ CORRECTO (configurar advanceTimers):
jest.useFakeTimers();
const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
```

**Ejemplo Completo:**
```typescript
it('debe aplicar debounce cuando debounceMs > 0', async () => {
  // Setup correcto
  jest.useFakeTimers();
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const handleSearch = jest.fn();

  render(<Autocomplete items={items} onSearch={handleSearch} debounceMs={300} />);

  const input = screen.getByRole('combobox');
  await user.type(input, 'test');

  // Clear any calls durante typing
  handleSearch.mockClear();

  // Avanzar timers manualmente
  jest.advanceTimersByTime(300);

  await waitFor(() => {
    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  jest.useRealTimers(); // Limpiar al final
});
```

---

#### **Patrón 2: Performance - paste() vs type()**

**Problema:**
`userEvent.type()` dispara un re-render completo de Radix UI Popover **por cada carácter** digitado. Para strings largos, esto resulta en decenas de renders síncronos con delays, haciendo tests extremadamente lentos.

**Benchmark:**
```
'Opción 1' (8 caracteres):
- user.type()  → 8-10 segundos
- user.paste() → 0.1-0.3 segundos

'texto invalido' (14 caracteres):
- user.type()  → 15-20 segundos
- user.paste() → 0.2-0.4 segundos
```

**Solución (Regla de Oro):**

```typescript
// ❌ USAR type() solo cuando validamos comportamiento carácter por carácter
it('debe aplicar debounce en cada tecla', async () => {
  const user = userEvent.setup();
  await user.type(input, 'test'); // Necesario para validar debounce incremental
});

// ✅ USAR paste() para la mayoría de los tests
it('debe seleccionar item y cerrar popover', async () => {
  const user = userEvent.setup();
  input.focus();
  await user.paste('Opción 1'); // 90% más rápido

  const option = screen.getByText('Opción 1');
  await user.click(option);
});
```

**Cuándo usar cada uno:**

| Método | Usar cuando | Ejemplo |
|--------|-------------|---------|
| `type()` | Validar debounce carácter por carácter | Debounce search input |
| `type()` | Validar onInputChange incremental | Live validation |
| `type()` | Validar navegación con teclado (ArrowDown, Enter) | Keyboard navigation |
| `paste()` | Seleccionar un item de lista | Select autocomplete option |
| `paste()` | Validar StrictSelection | Validate invalid input |
| `paste()` | Filtrado final (no incremental) | Filter results |

---

#### **Patrón 3: Validaciones Semánticas**

**Problema:**
Radix UI usa clases CSS con variantes de Tailwind (e.g., `aria-selected:bg-accent`). Estas clases NO están presentes directamente en el elemento, sino que se aplican condicionalmente via pseudo-selectores.

**Síntoma:**
```typescript
// ❌ Test falla
expect(item).toHaveClass('bg-accent');
// Received: "... aria-selected:bg-accent ..." (clase condicional, no directa)
```

**Solución (Validar atributos ARIA):**
```typescript
// ❌ INCORRECTO (validar clase CSS directa)
const items = screen.getAllByRole('option');
expect(items[0]).toHaveClass('bg-accent');

// ✅ CORRECTO (validar atributo semántico)
const items = screen.getAllByRole('option');
expect(items[0]).toHaveAttribute('aria-selected', 'true');
```

**Otros ejemplos:**
```typescript
// Validar estado inválido
expect(input).toHaveAttribute('aria-invalid', 'true');
expect(input).toHaveClass('border-destructive'); // ✅ Esta clase SÍ es directa

// Validar expansión de popover
expect(input).toHaveAttribute('aria-expanded', 'true');

// Validar tipo de autocomplete
expect(input).toHaveAttribute('aria-autocomplete', 'list');
```

---

#### **Patrón 4: Asynchronous Assertions**

**Problema:**
Radix UI Presence/Portal manejan montaje/desmontaje de elementos asíncronamente. Assertions inmediatas pueden fallar porque el DOM aún no se actualizó.

**Solución (Usar waitFor):**
```typescript
// ❌ PUEDE FALLAR (assertion síncrona)
await user.click(input);
expect(input).toHaveAttribute('aria-expanded', 'true');

// ✅ CORRECTO (waitFor para async updates)
await user.click(input);
await waitFor(() => {
  expect(input).toHaveAttribute('aria-expanded', 'true');
});

// ✅ ALTERNATIVA (findBy automáticamente espera)
await user.click(input);
const popover = await screen.findByRole('listbox');
expect(popover).toBeInTheDocument();
```

---

### 🧪 **Ejemplo Completo: Autocomplete Test**

```typescript
// src/components/ui/__tests__/autocomplete.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from '../autocomplete';

describe('Autocomplete - Interacción Usuario', () => {
  const mockItems = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
  ];

  it('debe abrir popover al escribir en el input', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Autocomplete items={mockItems} onSelect={jest.fn()} />);

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('Op'); // paste() para performance

    // Assert - Usar waitFor para async Radix UI updates
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('debe seleccionar item y cerrar popover al hacer click', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSelect = jest.fn();
    render(<Autocomplete items={mockItems} onSelect={handleSelect} />);

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('Opción 1');

    const option = screen.getByText('Opción 1');
    await user.click(option);

    // Assert
    expect(handleSelect).toHaveBeenCalledWith('1');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('debe cerrar popover con delay al hacer blur', async () => {
    // Arrange - Fake timers para delay
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<Autocomplete items={mockItems} onSelect={jest.fn()} />);

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('Op');

    // Blur
    input.blur();

    // Assert - Avanzar timers para delay
    jest.advanceTimersByTime(200);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    jest.useRealTimers();
  });
});

describe('Autocomplete - Navegación Teclado', () => {
  it('debe navegar con ArrowDown', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Autocomplete items={mockItems} onSelect={jest.fn()} />);

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'Op'); // type() necesario para keyboard navigation

    await user.keyboard('{ArrowDown}');

    // Assert - Validar aria-selected (NO clase CSS)
    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
  });
});
```

---

### 🚨 **Troubleshooting Common Issues**

#### **Error: "window.PointerEvent is not a constructor"**
```typescript
// Solución: Agregar a jest.setup.ts
global.PointerEvent = MouseEvent as any;
```

#### **Error: "Exceeded timeout of 10000 ms"**
```typescript
// Opción 1: Aumentar timeout global (jest.setup.ts)
jest.setTimeout(20000);

// Opción 2: Usar paste() en lugar de type()
await user.paste('texto'); // NO user.type('texto')

// Opción 3: Configurar advanceTimers con fake timers
jest.useFakeTimers();
const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
```

#### **Warning: "act() was not wrapped"**
```typescript
// Solución: Suppression selectiva en jest.setup.ts (ver arriba)
// O usar waitFor para async assertions:
await waitFor(() => {
  expect(element).toHaveAttribute('aria-expanded', 'true');
});
```

#### **Test falla: "toHaveClass('bg-accent')"**
```typescript
// Solución: Validar atributo ARIA en lugar de clase CSS
expect(item).toHaveAttribute('aria-selected', 'true');
```

---

### 📚 **Referencias**

- **Implementación completa:** [autocomplete.test.tsx](../../src/components/ui/__tests__/autocomplete.test.tsx)
- **Jest setup:** [jest.setup.ts](../../src/__tests__/setup/jest.setup.ts)
- **Radix UI Issue:** [#2619 - act() warnings](https://github.com/radix-ui/primitives/issues/2619)
- **userEvent v14 docs:** [Testing Library](https://testing-library.com/docs/user-event/intro)

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