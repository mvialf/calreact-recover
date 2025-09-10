# 🏗️ Estrategia de Testing - Arquitectura Híbrida Optimizada

**Fecha de diseño:** 8 de septiembre de 2025  
**Architect:** Mentor Técnico AI  
**Versión:** 1.0

---

## 🎯 Filosofía de Testing

### 🧠 **Principios Fundamentales**
1. **Testing Piramidal Moderno**: Más tests unitarios, menos E2E costosos
2. **Pragmatismo sobre Purismo**: Usar la herramienta correcta para cada caso
3. **Velocidad + Confiabilidad**: Balance óptimo entre rapidez y cobertura real
4. **Mantenibilidad**: Código de test tan importante como código de producción

### 🏆 **Estrategia Recomendada: Híbrida Optimizada**

Basada en análisis profundo del proyecto Cobralon-FB y las necesidades específicas identificadas.

---

## 📊 Matriz de Decisión de Testing

### 🧩 **Por Tipo de Funcionalidad**

| Funcionalidad | Tipo de Test | Herramientas | Justificación |
|---------------|--------------|--------------|---------------|
| **Lógica de negocio pura** | Unitarios | Jest + Mocks | Rápido, aislado, predictible |
| **Servicios Firebase críticos** | Integración | Emulator + SDK Testing | Comportamiento real de Firebase |
| **APIs externas (Google Maps)** | Unitarios | Mocks avanzados | Evita dependencias externas |
| **Componentes UI** | Unitarios | React Testing Library | Enfoque en comportamiento usuario |
| **Flujos completos** | E2E | Playwright | Validación end-to-end |

### 🎚️ **Por Nivel de Criticidad**

| Nivel | Criterio | Estrategia |
|-------|----------|------------|
| **🔴 Crítico** | Servicios core, pagos, auth | Emulator + Tests rigurosos |
| **🟡 Importante** | Features principales | Mocks + Tests de integración |
| **🟢 Estándar** | Utilidades, helpers | Tests unitarios básicos |

---

## 🏗️ Arquitectura de Testing Propuesta

### 📁 **Estructura de Archivos**

```
src/
├── __tests__/                         # Setup global y utilidades
│   ├── setup/
│   │   ├── firebase-testing-setup.ts  # Configuración Firebase Testing SDK
│   │   ├── firebase-mocks.ts          # Mocks centralizados v11 compatible
│   │   ├── google-maps-mocks.ts       # Mocks Google Maps/Places API
│   │   └── jest-setup.ts              # Configuración Jest global
│   └── helpers/
│       ├── test-data-factory.ts       # Factory de datos de prueba
│       ├── async-helpers.ts           # Utilidades para tests async
│       └── assertion-helpers.ts       # Assertions personalizadas
├── services/__tests__/                 # Tests de servicios
│   ├── unit/                          # Tests unitarios con mocks
│   └── integration/                   # Tests con Firebase Emulator
└── components/__tests__/               # Tests de componentes UI
```

### ⚙️ **Configuración Jest Optimizada**

```typescript
// jest.config.js
module.exports = {
  // Configuración por entorno
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest-setup.ts']
    },
    {
      displayName: 'integration', 
      testMatch: ['**/__tests__/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/firebase-testing-setup.ts']
    }
  ]
}
```

---

## 🛠️ Implementación por Capas

### 🟦 **Capa 1: Tests Unitarios (70% de los tests)**

#### **Características:**
- **Velocidad**: <100ms por test
- **Aislamiento**: Sin dependencias externas
- **Cobertura**: Lógica de negocio, validaciones, transformaciones

#### **Herramientas:**
- **Jest**: Framework principal
- **Mocks centralizados**: Firebase, Google Maps, APIs externas
- **React Testing Library**: Para componentes UI

#### **Ejemplo de Uso:**
```typescript
// ✅ TEST UNITARIO - afterSalesService.test.ts
describe('afterSalesService - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should transform document correctly', () => {
    const mockDoc = createMockAfterSalesDoc();
    const result = afterSalesFromDoc(mockDoc);
    
    expect(result.id).toBe(mockDoc.id);
    expect(result.entryDate).toBeInstanceOf(Date);
  });
});
```

### 🟩 **Capa 2: Tests de Integración (25% de los tests)**

#### **Características:**
- **Velocidad**: 1-5 segundos por test
- **Realismo**: Comportamiento real de Firebase
- **Cobertura**: Servicios críticos, operaciones CRUD

#### **Herramientas:**
- **Firebase Emulator**: Firestore, Auth, Functions
- **Firebase Testing SDK**: APIs oficiales de testing
- **Test containers**: Aislamiento completo

#### **Ejemplo de Uso:**
```typescript
// ✅ TEST INTEGRACIÓN - projectService.integration.test.ts
describe('projectService - Integration Tests', () => {
  let testFirestore: Firestore;

  beforeAll(async () => {
    testFirestore = initializeTestApp().firestore();
  });

  it('should create project in Firestore', async () => {
    const projectData = createTestProjectData();
    const result = await createProject(testFirestore, projectData);
    
    // Verificación real contra Firestore
    const doc = await getDoc(doc(testFirestore, 'projects', result.id));
    expect(doc.exists()).toBe(true);
  });
});
```

### 🟪 **Capa 3: Tests E2E (5% de los tests)**

#### **Características:**
- **Velocidad**: 10-30 segundos por test
- **Realismo**: Flujo completo del usuario
- **Cobertura**: Happy paths, flujos críticos de negocio

#### **Herramientas:**
- **Playwright**: Con MCP integration
- **Real APIs**: Contra entorno de staging

---

## 🎛️ Configuración Específica por Componente

### 🔥 **Firebase Services**

#### **Services Críticos → Emulator**
- `projectService`
- `paymentService` 
- `authService`

#### **Services Estándar → Mocks**
- `afterSalesService`
- `visitService`
- `eventService`

```typescript
// Patrón de testing híbrido
if (process.env.TEST_TYPE === 'integration') {
  // Usar Firebase Emulator
  firestore = getTestFirestore();
} else {
  // Usar mocks avanzados
  firestore = getMockFirestore();
}
```

### 🗺️ **Google Maps/Places API**

#### **Estrategia: Solo Mocks**
Justificación: API externa, costos, limitaciones de rate

```typescript
// Mock centralizado en google-maps-mocks.ts
export const mockGoogleMaps = {
  importLibrary: jest.fn().mockResolvedValue({
    AutocompleteService: mockAutocompleteService,
    PlacesService: mockPlacesService
  })
};
```

### 🎨 **Componentes React**

#### **Estrategia: Testing Library + Mocks**
```typescript
// Patrón estándar para componentes
describe('AddressInput', () => {
  beforeEach(() => {
    mockGoogleMapsHooks();
  });

  it('should show suggestions on typing', async () => {
    render(<AddressInput />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'Madrid' } });
    
    await waitFor(() => {
      expect(screen.getByText('Madrid, España')).toBeInTheDocument();
    });
  });
});
```

---

## ⚡ Performance y Optimización

### 🚀 **Objetivos de Performance**

| Métrica | Target | Actual | Estrategia |
|---------|--------|--------|------------|
| **Tests unitarios** | <30 segundos | ~60s | Mocks optimizados |
| **Tests integración** | <2 minutos | N/A | Emulator setup |
| **Suite completa** | <5 minutos | ~62s | Paralelización |
| **Success rate** | >95% | 70% | Estabilizar mocks |

### 🔧 **Optimizaciones Técnicas**

#### **1. Paralelización Inteligente**
```javascript
// jest.config.js
module.exports = {
  maxWorkers: '50%', // No sobrecargar en CI
  testTimeout: 10000, // 10s timeout global
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest-setup.ts']
}
```

#### **2. Mocks Compartidos**
```typescript
// setup/firebase-mocks.ts - Una sola configuración para todos los tests
export const sharedFirebaseMocks = {
  // Mocks reutilizables y optimizados
};
```

#### **3. Test Data Factories**
```typescript
// helpers/test-data-factory.ts
export const createTestProject = (overrides = {}) => ({
  id: 'test-project-id',
  name: 'Test Project',
  date: new Date(),
  ...overrides
});
```

---

## 🔍 Monitoreo y Métricas

### 📊 **KPIs de Testing**

#### **Métricas de Calidad**
- **Test Coverage**: >80% líneas, >90% branches críticas
- **Success Rate**: >95% tests pasando
- **Flaky Tests**: <5% fallos intermitentes

#### **Métricas de Performance**  
- **Total Test Time**: <5 minutos
- **Feedback Loop**: <2 minutos para tests afectados
- **CI/CD Reliability**: >99% builds estables

### 🎯 **Dashboard de Testing**
```bash
# Scripts para métricas
npm run test:coverage     # Coverage report
npm run test:performance  # Timing analysis  
npm run test:flaky       # Detectar tests inestables
```

---

## 🚀 Plan de Migración

### 📅 **Fases de Implementación**

#### **Fase 1: Fundaciones (1-2 días)**
1. ✅ Crear setup centralizado
2. ✅ Implementar mocks de Firebase v11
3. ✅ Corregir tests críticos fallando

#### **Fase 2: Estandarización (3-5 días)**
1. 🔄 Migrar tests a nuevos patrones
2. 🔄 Configurar Firebase Testing SDK
3. 🔄 Optimizar performance

#### **Fase 3: Excelencia (1 semana)**
1. 🔄 Métricas y monitoreo
2. 🔄 Documentación para equipo
3. 🔄 Automatización CI/CD

### ⚖️ **Criterios de Éxito**

#### **Técnicos**
- [ ] 95%+ tests pasando
- [ ] <5 minutos suite completa
- [ ] Mocks estables y mantenibles

#### **Operacionales** 
- [ ] CI/CD confiable sin fallos aleatorios
- [ ] Developer experience fluida
- [ ] Documentación completa

---

**Estado:** ✅ **Estrategia definida - Lista para implementación**  
**Próximo paso:** Revisar [IMPLEMENTACION.md](./IMPLEMENTACION.md) para plan detallado de ejecución