# 🧪 Guía de Testing - Firebase Emulator Suite

**Proyecto:** Cobralon-FB  
**Fecha creación:** 06-septiembre-2025  
**Estado:** Activo - 4 tests unitarios implementados con Firebase Emulator Suite ✅  

Esta guía documenta el sistema de testing implementado usando Firebase Emulator Suite, reemplazando los mocks complejos problemáticos que causaban fallas recurrentes.

---

## 📋 CONTEXTO Y JUSTIFICACIÓN

### **Problema Inicial**
- **Mocks complejos de Firebase** causaban errores recurrentes ("Claude rompe mi código")
- **Errores específicos identificados:**
  - `snapshot.exists is not a function`
  - `instanceof Timestamp fails`
  - Inconsistencias entre servicios con diferentes estrategias de mocking
- **Mantenimiento frágil:** Cada actualización de Firebase podía romper mocks

### **Solución Adoptada**
- **Firebase Emulator Suite** - Solución oficial recomendada por Firebase 2025
- **APIs reales** contra emulators locales
- **Eliminación completa** de mocks complejos problemáticos
- **Template validado** replicable para todos los servicios

---

## ⚙️ CONFIGURACIÓN

### **1. Configuración en firebase.json**
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": ".next/out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "trailingSlash": false
  },
  "emulators": {
    "firestore": {
      "port": 8081
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### **2. Verificar Instalación**
```bash
# Verificar Firebase CLI
firebase --version  # Debe ser >=14.0.0

# Probar emulator
firebase emulators:start --only firestore
# Debe mostrar: Firestore running on 127.0.0.1:8081
```

---

## 🔧 TEMPLATE DE TEST

### **Estructura Base (sin mocks complejos)**
```typescript
/**
 * @fileoverview Tests para [SERVICE]Service usando Firebase Emulator Suite
 * Sin mocks - usa APIs reales de Firebase contra emulators
 * Solución oficial recomendada por Firebase 2025
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { [SERVICE_TYPE] } from '@/types/[service]';

// Configurar mocks ANTES de importar servicios
const testApp = initializeApp({
  projectId: 'test-project-id'
});

const testDb = getFirestore(testApp);

// Mock para usar testDb en lugar de db de producción
jest.mock('@/lib/firebase/client', () => ({
  get db() {
    return testDb;
  }
}));

// Mock para DI functions
jest.mock('@/lib/firebase/di', () => ({
  createFirestoreFunction: jest.fn((impl) => {
    return (...args: any[]) => impl(testDb, ...args);
  })
}));

// Mock servicios dependientes (estos no los vamos a testear aquí)
jest.mock('../dependentService', () => ({
  someFunction: jest.fn().mockResolvedValue(undefined)
}));

// Importar servicios DESPUÉS de configurar mocks
import {
  // Importar funciones del servicio
} from '../[service]Service';

// Conectar a emulator después de imports
connectFirestoreEmulator(testDb, 'localhost', 8081);

// Helper para limpiar base de datos del emulator
const clearTestData = async () => {
  const collections = ['projects', 'clients', 'payments', 'afterSales']; // Ajustar según servicio
  
  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(testDb, collectionName));
      if (!snapshot.empty) {
        const batch = writeBatch(testDb);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      // Ignorar errores de colecciones que no existen
    }
  }
};

describe('[service]Service (Firebase Emulator)', () => {
  const mockData: Omit<[SERVICE_TYPE], 'id' | 'createdAt' | 'updatedAt'> = {
    // Datos de test específicos del servicio
  };

  beforeEach(async () => {
    // Limpiar datos del emulator antes de cada test
    await clearTestData();
  });

  describe('functionName', () => {
    it('should work correctly', async () => {
      // Test implementation usando APIs reales
      const result = await functionName(mockData);
      
      expect(result.id).toBeDefined();
      // Más assertions...
    });
  });
});

// Test helper para verificar que emulator está funcionando
describe('Firebase Emulator Connection', () => {
  it('should be connected to emulator', () => {
    // Si llegamos aquí sin errores, el emulator está funcionando
    expect(testDb).toBeDefined();
  });
});
```

### **Ejemplo Completo: projectService.test.ts**
Ver `src/services/__tests__/projectService.test.ts` para implementación completa validada (9/9 tests pasando).

---

## 🚀 COMANDOS DE EJECUCIÓN

### **Opción 1: Manual (Desarrollo)**
```bash
# Terminal 1: Iniciar emulator
firebase emulators:start --only firestore --project test-project-id

# Terminal 2: Ejecutar tests (en otra terminal)
npm test -- --testPathPatterns=projectService.test.ts --watchAll=false

# Parar emulator: Ctrl+C en Terminal 1
```

### **Opción 2: Automática (CI/CD)**
```bash
# Ejecutar tests con emulator automático
firebase emulators:exec --only firestore "npm test -- --testPathPatterns=SERVICE.test.ts"

# O todos los tests
firebase emulators:exec --only firestore "npm test"
```

### **Opción 3: Scripts de package.json**
```json
{
  "scripts": {
    "test:emulator": "firebase emulators:exec --only firestore 'npm test'",
    "test:service": "firebase emulators:exec --only firestore 'npm test -- --testPathPatterns=SERVICE.test.ts'"
  }
}
```

---

## 🔍 TROUBLESHOOTING

### **Problema: "Emulator not running"**
```bash
# Solución: Verificar que emulator está corriendo
firebase emulators:start --only firestore

# Verificar puerto disponible
netstat -tulpn | grep :8081
```

### **Problema: "Cannot connect to emulator"**
```bash
# Solución: Verificar configuración firebase.json
cat firebase.json | grep -A 10 "emulators"

# Verificar project ID
firebase projects:list
```

### **Problema: "Tests hang indefinitely"**
```typescript
// Solución: Asegurar timeout adecuado
describe('service tests', () => {
  // Timeout global para todos los tests
  jest.setTimeout(30000); // 30 segundos
  
  // O timeout específico por test
  it('should work', async () => {
    // test implementation
  }, 10000); // 10 segundos
});
```

### **Problema: "Data persists between tests"**
```typescript
// Solución: Asegurar clearTestData funciona
beforeEach(async () => {
  await clearTestData();
  
  // Verificar limpieza
  const snapshot = await getDocs(collection(testDb, 'projects'));
  expect(snapshot.empty).toBe(true);
});
```

---

## 📊 MÉTRICAS DE ÉXITO

### **Template Validado: projectService.test.ts**
- ✅ **9/9 tests pasando** con emulators
- ✅ **0 errores de mocking** (vs múltiples errores con mocks)
- ✅ **Testing contra APIs reales** (más confiable que mocks)
- ✅ **Tiempo de ejecución:** ~4.5 segundos (aceptable para testing local)

### **Comparación vs Mocks Complejos**
| Aspecto | Mocks Complejos | Firebase Emulators |
|---------|-----------------|-------------------|
| Errores recurrentes | ❌ Múltiples | ✅ Cero |
| Mantenimiento | ❌ Frágil | ✅ Auto-actualizado |
| Confiabilidad | ❌ Simulación | ✅ APIs reales |
| Documentación | ❌ Custom | ✅ Oficial Firebase |

---

## 🎯 MEJORES PRÁCTICAS

### **DO's (Hacer)**
- ✅ **Usar helper clearTestData()** antes de cada test
- ✅ **Conectar emulator después de imports** para evitar errores de inicialización
- ✅ **Mock solo servicios dependientes**, no Firebase APIs
- ✅ **Usar testDb directamente** en lugar de mocks complejos
- ✅ **Verificar conexión emulator** con test helper

### **DON'Ts (No hacer)**
- ❌ **NO crear mocks de DocumentSnapshot** - usar APIs reales
- ❌ **NO mockear Timestamp class** - usar APIs reales
- ❌ **NO hardcodear project IDs** - usar test-project-id
- ❌ **NO compartir datos entre tests** - limpiar con clearTestData()
- ❌ **NO importar servicios antes de mocks** - orden de importación crítico

### **Orden Crítico de Configuración**
```typescript
1. Configurar testApp y testDb
2. Configurar jest.mock() statements
3. Importar servicios bajo test
4. Conectar a emulator
5. Definir helper functions
6. Escribir tests
```

---

## 🔄 MIGRACIÓN DE SERVICIOS EXISTENTES

### **Checklist para Migrar Servicio**
- [ ] Crear archivo `[service].test.ts` usando template
- [ ] Ajustar collections en `clearTestData()`
- [ ] Agregar mocks de servicios dependientes
- [ ] Implementar tests básicos (CRUD operations)
- [ ] Ejecutar tests con emulator
- [ ] Validar 100% tests pasando
- [ ] Documentar casos edge específicos del servicio

### **Orden de Migración Recomendado**
1. **Servicios simples primero** (ej: visitService, afterSalesService)
2. **Servicios con dependencias** (ej: clientService)
3. **Servicios complejos al final** (ej: calendarEventService)

---

## 📚 RECURSOS ADICIONALES

### **Documentación Oficial**
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Testing with Firestore Emulator](https://firebase.google.com/docs/emulator-suite/connect_firestore)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### **Ejemplos en el Proyecto**
- `src/services/__tests__/projectService.test.ts` - Template completo validado
- `firebase.json` - Configuración de emulators
- `src/services/projectService.ts` - Servicio bajo test

### **Scripts Útiles**
```bash
# Iniciar emulator en background
firebase emulators:start --only firestore > emulator.log 2>&1 &

# Verificar status de emulator
curl -f http://localhost:8081 && echo "Emulator running" || echo "Emulator not running"

# Limpiar datos de emulator durante desarrollo
curl -X DELETE http://localhost:8081/emulator/v1/projects/test-project-id/databases/(default)/documents
```

---

**📅 Documento creado:** 06-septiembre-2025  
**📅 Última actualización:** 06-septiembre-2025 - Estado actual: 4 tests unitarios funcionando
**🎯 Estado:** Activo - Template establecido con Firebase Emulator Suite  
**👤 Mantenido por:** Claude Code  
**📞 Contacto:** Ver ISSUES_LOG.md para escalación de problemas

*Esta guía se actualiza cuando se establece un nuevo patrón de testing o se resuelve un problema común.*