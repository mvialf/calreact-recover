# 🛠️ Templates de Mocks - Guía de Uso

**Propósito:** Mocks funcionales y optimizados para Firebase 11.x y Google Maps API  
**Compatibilidad:** TypeScript + Jest  
**Actualización:** 8 de septiembre de 2025

---

## 📁 Contenido de la Carpeta

| Archivo | Descripción | Uso Principal |
|---------|-------------|---------------|
| **firebase-v11-mocks.ts** | Mocks completos de Firebase v11 | Tests unitarios de servicios |
| **google-maps-mocks.ts** | Mocks de Google Maps/Places API | Tests de PlacesServiceAdapter |
| **jest-setup-ejemplo.ts** | Configuración Jest optimizada | Setup global de tests |

---

## 🚀 Guía de Implementación Rápida

### 1️⃣ **Para Tests de Firebase**

```typescript
// En tu archivo de test
import { mockFirestore, MockTimestamp } from '../mocks/firebase-v11-mocks';

// Aplicar mock al inicio del archivo
jest.mock('firebase/firestore', () => mockFirestore);

// Usar en tests
describe('Mi Service', () => {
  it('should handle timestamps correctly', () => {
    const timestamp = new MockTimestamp(Date.now() / 1000);
    expect(timestamp instanceof MockTimestamp).toBe(true); // ✅ Funciona!
    expect(timestamp.toDate()).toBeInstanceOf(Date);
  });
});
```

### 2️⃣ **Para Tests de Google Maps**

```typescript
// En tu archivo de test  
import { mockGoogleMaps, mockPlacesLib } from '../mocks/google-maps-mocks';

// Aplicar mock
jest.mock('@googlemaps/js-api-loader', () => mockGoogleMaps);

// Usar en tests
describe('PlacesServiceAdapter', () => {
  it('should get place predictions', async () => {
    const adapter = new PlacesServiceAdapter();
    await adapter.initialize();
    
    const results = await adapter.getPlacePredictions('test');
    expect(results).toBeDefined();
  });
});
```

### 3️⃣ **Setup Global de Jest**

```typescript
// En jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/jest-setup.ts']
};

// Copiar jest-setup-ejemplo.ts a tu proyecto
```

---

## ⚡ Problemas Solucionados

### 🔧 **"instanceof not callable"**
**Antes:**
```typescript
// ❌ Mock que no funciona
Timestamp: {
  now: jest.fn(() => ({}))
}
```

**Después:**  
```typescript
// ✅ Mock funcional
class MockTimestamp {
  constructor(seconds, nanoseconds) { /* ... */ }
  static now() { return new MockTimestamp(/* ... */); }
}
```

### 🔧 **Tests que timeout esperando APIs**
**Antes:**
```typescript
// ❌ Intenta cargar API real
importLibrary('places').then(/* timeout */)
```

**Después:**
```typescript
// ✅ Mock que responde inmediatamente
importLibrary: jest.fn().mockResolvedValue(mockPlacesLib)
```

---

## 🎯 Casos de Uso por Template

### **firebase-v11-mocks.ts**
- ✅ Tests de `afterSalesService`
- ✅ Tests de `visitService` 
- ✅ Tests de `projectService` (unitarios)
- ✅ Cualquier servicio que use Firestore

### **google-maps-mocks.ts**
- ✅ Tests de `PlacesServiceAdapter`
- ✅ Tests de `AddressInput` component
- ✅ Tests de `useGooglePlaces` hook
- ✅ Cualquier funcionalidad con Google Maps

### **jest-setup-ejemplo.ts**  
- ✅ Configuración global para todos los tests
- ✅ Setup de mocks automáticos
- ✅ Utilities compartidas
- ✅ Configuración de timeouts

---

## ⚙️ Personalización

### **Modificar Respuestas de Mock**

```typescript
// Personalizar datos de respuesta
import { mockFirestore } from './firebase-v11-mocks';

// En tu test específico
mockFirestore.collection().doc().get.mockResolvedValue({
  id: 'custom-id',
  data: () => ({ customField: 'custom-value' }),
  exists: () => true
});
```

### **Agregar Nuevos Mocks**

```typescript
// Extender mocks existentes
import { mockFirestore as baseMockFirestore } from './firebase-v11-mocks';

const customMockFirestore = {
  ...baseMockFirestore,
  customMethod: jest.fn().mockResolvedValue('custom-response')
};

export { customMockFirestore };
```

---

## 🔍 Debug y Troubleshooting

### **Verificar que Mock se Aplica**
```typescript
// Al inicio de tu test
console.log('Timestamp mock:', jest.isMockFunction(Timestamp.now)); // true
```

### **Mock No Funciona**
```typescript
// Asegurar orden correcto
jest.mock('firebase/firestore', () => mockFirestore); // ✅ Antes de imports
import { getFirestore } from 'firebase/firestore';     // ✅ Después de mock
```

### **Errores Comunes**
```typescript
// ❌ INCORRECTO: Mock después de import
import { Timestamp } from 'firebase/firestore';
jest.mock('firebase/firestore', () => ({})); // No funciona

// ✅ CORRECTO: Mock antes de import  
jest.mock('firebase/firestore', () => mockFirestore);
import { Timestamp } from 'firebase/firestore';
```

---

## 📊 Performance Tips

### **1. Compartir Mocks Between Tests**
```typescript
// setup/global-mocks.ts
export const sharedMocks = {
  firebase: mockFirestore,
  googleMaps: mockGoogleMaps
};

// En cada test
import { sharedMocks } from '../setup/global-mocks';
```

### **2. Mock Solo Lo Necesario**
```typescript
// ❌ Mock todo Firebase (pesado)
jest.mock('firebase/firestore', () => mockEverything);

// ✅ Mock solo lo que usas (liviano)
jest.mock('firebase/firestore', () => ({
  Timestamp: MockTimestamp,
  getFirestore: jest.fn(),
  collection: jest.fn()
}));
```

### **3. Cleanup Between Tests**
```typescript
// En cada describe block
afterEach(() => {
  jest.clearAllMocks();
});
```

---

## 🎓 Best Practices

### **✅ DO**
- Usar mocks específicos para cada caso de uso
- Verificar que mocks se comportan como APIs reales
- Mantener mocks simples y enfocados
- Limpiar mocks entre tests

### **❌ DON'T**
- Crear mocks demasiado complejos
- Mock todo cuando solo necesitas una función
- Olvidar limpiar estado entre tests
- Hacer mocks que no coinciden con API real

---

## 📚 Referencias

- [Firebase v11 Documentation](https://firebase.google.com/docs/web/modular-upgrade)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Jest Mocking Guide](https://jestjs.io/docs/manual-mocks)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)

---

**¿Problemas?** Consulta [ANALISIS-ERRORES.md](../ANALISIS-ERRORES.md) para diagnósticos específicos.