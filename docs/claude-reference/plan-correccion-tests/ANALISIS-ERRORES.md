# 🔍 Análisis Detallado de Errores en Tests

**Fecha de análisis:** 8 de septiembre de 2025  
**Analista:** Mentor Técnico AI  
**Estado:** ✅ Completado

---

## 🚨 Error Crítico #1: "instanceof Timestamp not callable"

### 📍 **Ubicación del Problema**
```
FAIL src/services/__tests__/afterSalesService.test.ts
FAIL src/services/__tests__/visitService.test.ts
```

### 🔍 **Análisis de Causa Raíz**

#### **Problema Principal:**
Los tests mockean Firebase incorrectamente, causando que `instanceof Timestamp` falle porque el mock devuelve `undefined` en lugar de un constructor de clase.

#### **Código Problemático:**
```typescript
// ❌ MOCK INCORRECTO en tests
jest.mock('firebase/firestore', () => ({
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 }))
  }
}));

// ✅ CÓDIGO DE PRODUCCIÓN (correcto)
entryDate: data.entryDate instanceof Timestamp ? data.entryDate.toDate() : new Date()
```

#### **Error Específico:**
```
Error al crear registro de postventa: Right-hand side of 'instanceof' is not callable
```

### 🎯 **Archivos Afectados en Detalle**

#### **1. afterSalesService.test.ts**
- **Línea 85**: `data.entryDate instanceof Timestamp`
- **Línea 86**: `data.resolutionDate instanceof Timestamp` 
- **Línea 87-88**: `data.createdAt instanceof Timestamp`, `data.updatedAt instanceof Timestamp`
- **Función afectada**: `afterSalesFromDoc()`

#### **2. visitService.test.ts**  
- **Error similar**: Mock de Timestamp no funcional
- **Función afectada**: Conversión de timestamps en mapeo de visitas

### 🔧 **Solución Propuesta**

#### **Mock Correcto de Timestamp:**
```typescript
// ✅ SOLUCIÓN: Mock funcional
const mockTimestamp = jest.fn().mockImplementation((seconds, nanoseconds) => ({
  seconds,
  nanoseconds,
  toDate: () => new Date(seconds * 1000 + nanoseconds / 1000000)
}));

mockTimestamp.now = jest.fn(() => new mockTimestamp(Date.now() / 1000, 0));
mockTimestamp.fromDate = jest.fn((date) => new mockTimestamp(date.getTime() / 1000, 0));

jest.mock('firebase/firestore', () => ({
  Timestamp: mockTimestamp,
  // ... otros mocks
}));
```

---

## ⏱️ Error Crítico #2: Timeouts en PlacesServiceAdapter

### 📍 **Ubicación del Problema**
```
FAIL src/lib/places/__tests__/PlacesServiceAdapter.test.ts (20.493s)
```

### 🔍 **Análisis de Causa Raíz**

#### **Problema Principal:**
Los tests intentan cargar APIs reales de Google Maps en lugar de usar mocks, causando timeouts de 10 segundos.

#### **Errores Específicos:**
```
thrown: "Exceeded timeout of 10000 ms for a test."
- debe obtener sugerencias usando nueva API
- debe manejar errores de nueva API
```

#### **Mocks Fallidos:**
```typescript
// ❌ MOCKS NO INTERCEPTAN CORRECTAMENTE
expect(mockAutocompleteSuggestion.fetchAutocompleteSuggestions).toHaveBeenCalled();
// Expected number of calls: >= 1
// Received number of calls: 0
```

### 🎯 **Archivos Afectados**

#### **PlacesServiceAdapter.test.ts**
- **Tests con timeout**: Líneas 168, 206
- **Mocks fallidos**: `mockAutocompleteSuggestion.fetchAutocompleteSuggestions` no se ejecuta
- **Session tokens**: Tests esperan mocks que no se están aplicando

### 🔧 **Solución Propuesta**

#### **Mock Mejorado de Google Places:**
```typescript
// ✅ SOLUCIÓN: Mock que intercepta correctamente
const mockPlacesLib = {
  AutocompleteService: jest.fn(),
  AutocompleteSessionToken: jest.fn(),
  PlacesService: jest.fn()
};

const mockImportLibrary = jest.fn().mockResolvedValue(mockPlacesLib);

jest.mock('@googlemaps/js-api-loader', () => ({
  Loader: jest.fn().mockImplementation(() => ({
    importLibrary: mockImportLibrary
  }))
}));
```

---

## 🔌 Error #3: Firebase Emulator Offline

### 📍 **Ubicación del Problema**
```
FAIL src/services/__tests__/projectService.test.ts
```

### 🔍 **Análisis de Causa Raíz**

#### **Problema Principal:**
Los tests requieren Firebase Emulator corriendo en puerto 8081 pero no está configurado en el ambiente de testing.

#### **Errores Específicos:**
```
FirebaseError: Failed to get document because the client is offline.
thrown: "Exceeded timeout of 10000 ms for a hook."
```

#### **Configuración Actual:**
```typescript
// Tests requieren emulator pero no está garantizado que corra
beforeEach(async () => {
  await clearTestData(); // Intenta conectar a emulator
});
```

### 🎯 **Impacto**
- Tests de integración no pueden ejecutarse de forma aislada
- Dependencia de infraestructura externa para CI/CD
- Timeouts en `beforeEach` hooks

### 🔧 **Solución Propuesta**

#### **Opción A: Configuración Automática de Emulator**
```typescript
// Setup automático del emulator para tests
beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    await startFirebaseEmulator();
  }
});
```

#### **Opción B: Mock Híbrido**
```typescript
// Mock para CI, emulator para desarrollo local  
const useEmulator = process.env.FIREBASE_EMULATOR_HOST;
```

---

## 📊 Resumen de Impacto

### 🔴 **Tests Críticos Afectados**
| Archivo | Tests Fallando | Causa Principal |
|---------|----------------|-----------------|
| afterSalesService.test.ts | 3/6 | instanceof Timestamp |
| visitService.test.ts | 2/4 | instanceof Timestamp |  
| PlacesServiceAdapter.test.ts | 11/15 | Google Maps mocks |
| projectService.test.ts | 6/8 | Firebase Emulator |

### 📈 **Métricas de Mejora Esperadas**

**Antes de Correcciones:**
- Tests fallando: 41/137 (70% éxito)
- Tiempo de ejecución: ~62 segundos
- Confiabilidad CI/CD: Baja (fallos aleatorios)

**Después de Correcciones:**
- Tests fallando: <5/137 (95%+ éxito)
- Tiempo de ejecución: ~30-40 segundos  
- Confiabilidad CI/CD: Alta (predecible)

---

## 🎯 Priorización de Correcciones

### 🔥 **Prioridad 1: instanceof Timestamp**
- **Impacto**: Crítico (servicios core)
- **Esfuerzo**: Bajo (2-3 horas)
- **ROI**: Muy Alto

### ⚡ **Prioridad 2: PlacesServiceAdapter Mocks**  
- **Impacto**: Medio (feature específica)
- **Esfuerzo**: Medio (4-6 horas)
- **ROI**: Alto

### 🔧 **Prioridad 3: Firebase Emulator**
- **Impacto**: Medio (tests de integración)  
- **Esfuerzo**: Alto (1-2 días configuración)
- **ROI**: Medio (infraestructura)

---

## 🛠️ Templates de Corrección

### **Template 1: Mock de Timestamp Funcional**
Disponible en: `mocks/firebase-v11-mocks.ts`

### **Template 2: Google Maps API Mock**  
Disponible en: `mocks/google-maps-mocks.ts`

### **Template 3: Configuración Jest Actualizada**
Disponible en: `ejemplos/jest-setup-ejemplo.ts`

---

**Estado:** ✅ **Análisis completado - Listo para implementación**  
**Próximo paso:** Revisar [ESTRATEGIA-TESTING.md](./ESTRATEGIA-TESTING.md) para arquitectura recomendada