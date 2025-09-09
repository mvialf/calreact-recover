# 📚 Ejemplos Prácticos - Nuevos Patrones de Testing

**Propósito:** Ejemplos concretos de cómo implementar tests correctos  
**Compatibilidad:** Firebase 11.x, Jest, React Testing Library  
**Fecha:** 8 de septiembre de 2025

---

## 📁 Contenido de Ejemplos

| Archivo | Descripción | Soluciona |
|---------|-------------|-----------|
| **test-unitario-ejemplo.ts** | Test unitario con mocks correctos | instanceof Timestamp errors |
| **test-integracion-ejemplo.ts** | Test con Firebase Emulator | Tests de integración reales |
| **test-componente-ejemplo.tsx** | Component test con RTL | Testing de componentes React |
| **test-async-ejemplo.ts** | Patrones para async/await | Timeouts y promesas |

---

## 🎯 Patrones de Uso

### 🟦 **Tests Unitarios** 
Use `test-unitario-ejemplo.ts` para:
- ✅ Servicios Firebase con mocks
- ✅ Lógica de negocio pura
- ✅ Transformaciones de datos
- ✅ Validaciones

### 🟩 **Tests de Integración**
Use `test-integracion-ejemplo.ts` para:
- ✅ Operaciones CRUD reales
- ✅ Transacciones Firebase
- ✅ Security rules testing
- ✅ Queries complejas

### 🟪 **Tests de Componentes**
Use `test-componente-ejemplo.tsx` para:
- ✅ Rendering y props
- ✅ Interacciones de usuario
- ✅ Estados y efectos
- ✅ Integration con hooks

### 🟨 **Tests Asíncronos**
Use `test-async-ejemplo.ts` para:
- ✅ APIs externas
- ✅ Promises y async/await
- ✅ Error handling
- ✅ Loading states

---

## ⚡ Quick Start

### **1. Copiar archivos base a tu proyecto:**
```bash
# Copiar ejemplos a tu estructura de tests
cp ejemplos/test-unitario-ejemplo.ts src/services/__tests__/unit/
cp ejemplos/test-integracion-ejemplo.ts src/services/__tests__/integration/
cp ejemplos/test-componente-ejemplo.tsx src/components/__tests__/
```

### **2. Adaptar a tus necesidades:**
```typescript
// Cambiar nombres y datos específicos
describe('MiService', () => {  // Cambiar por tu servicio
  const mockData = {           // Adaptar datos de prueba
    // ...tu data específica
  };
});
```

### **3. Ejecutar tests:**
```bash
npm test -- MiService.test.ts
```

---

## 🔧 Personalización por Caso de Uso

### **Para afterSalesService:**
```typescript
// Usar test-unitario-ejemplo.ts como base
// Cambiar por datos específicos de afterSales
const mockAfterSalesData = {
  projectId: 'test-project',
  description: 'Test service',
  status: 'pending'
};
```

### **Para projectService:**
```typescript
// Usar test-integracion-ejemplo.ts como base  
// Adaptar para operaciones de proyecto
const testProject = {
  name: 'Test Project',
  clientId: 'test-client',
  date: new Date()
};
```

### **Para componentes UI:**
```typescript
// Usar test-componente-ejemplo.tsx como base
// Adaptar props y interactions específicas
render(<MiComponente prop1="value" prop2={mockData} />);
```

---

## 📊 Comparación Antes/Después

### ❌ **Antes (problemas)**
```typescript
// Mock que no funciona
const mockTimestamp = { now: () => ({}) };

// Tests que fallan
expect(data.createdAt instanceof Timestamp).toBe(true); // Error!
```

### ✅ **Después (solucionado)**  
```typescript
// Mock funcional
class MockTimestamp {
  static now() { return new MockTimestamp(Date.now() / 1000); }
}

// Tests que pasan
expect(data.createdAt instanceof MockTimestamp).toBe(true); // ✅
```

---

## 🎓 Best Practices Demostradas

### **✅ DO - Ejemplos incluyen:**
- Cleanup correcto entre tests
- Mocks específicos y eficientes
- Assertions claras y descriptivas
- Error handling apropiado
- Patrones de setup/teardown

### **❌ DON'T - Ejemplos evitan:**
- Mocks excesivamente complejos
- Tests dependientes entre sí
- Hard-coded values sin constantes
- Assertions vagas o múltiples
- Setup global innecesario

---

## 📝 Notas de Implementación

### **Estructura recomendada:**
```
src/
├── __tests__/
│   ├── setup/
│   │   └── jest-setup.ts          # De mocks/jest-setup-ejemplo.ts
│   └── helpers/
│       └── test-data-factory.ts   # Para generar datos de prueba
├── services/__tests__/
│   ├── unit/
│   │   └── miService.unit.test.ts # De test-unitario-ejemplo.ts
│   └── integration/
│       └── miService.integration.test.ts # De test-integracion-ejemplo.ts
└── components/__tests__/
    └── MiComponente.test.tsx       # De test-componente-ejemplo.tsx
```

### **Configuración Jest recomendada:**
```javascript
// jest.config.js
module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.test.ts']
    },
    {
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/**/*.test.ts']
    }
  ]
};
```

---

## 🚀 Próximos Pasos

1. **Revisar ejemplos** - Entender patrones antes de implementar
2. **Copiar y adaptar** - Usar como template para tus tests
3. **Ejecutar incremental** - Probar un archivo a la vez
4. **Refinar según necesidad** - Adaptar a casos específicos

---

**¿Dudas sobre implementación?** Consulta [IMPLEMENTACION.md](../IMPLEMENTACION.md) para el plan completo paso a paso.