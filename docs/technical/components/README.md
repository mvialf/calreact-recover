# 📚 Documentación de Componentes - CalReact

**Última actualización:** Octubre 2025

---

## 📋 Índice de Documentos

### **🆕 Autocomplete Component**

#### **1. Guía Completa del Componente** ⭐
**Archivo:** [autocomplete-component.md](./autocomplete-component.md)

**Contenido:**
- 🎯 Descripción general y arquitectura
- 📚 API Reference completa (14 props)
- 🚀 7 ejemplos de uso (básico a avanzado)
- ⌨️ Navegación por teclado (8 teclas)
- 🔍 Estados visuales
- 🧪 Integration con React Hook Form
- 🔧 Troubleshooting común
- 📊 Performance tips

**Cuándo leer:**
- ✅ Primera vez usando Autocomplete
- ✅ Necesitas ejemplos de código
- ✅ Dudas sobre props o comportamiento
- ✅ Problemas de integración

---

#### **2. Autocomplete vs Combobox** 📊
**Archivo:** [autocomplete-vs-combobox.md](./autocomplete-vs-combobox.md)

**Contenido:**
- 🆚 Comparación arquitectural detallada
- 📊 Tabla de props (comunes vs exclusivas)
- ⌨️ Diferencias de navegación
- 🎨 Estados visuales comparados
- 🔍 Casos de uso recomendados
- 📈 Benchmarks de performance
- 🔄 Migration guide (ambas direcciones)
- 🎯 Decision matrix

**Cuándo leer:**
- ✅ Decidir entre Autocomplete y Combobox
- ✅ Migrar de uno a otro
- ✅ Optimizar performance
- ✅ Entender diferencias técnicas

---

### **🧪 Testing**

#### **3. Testing con Chrome DevTools MCP** 🔬
**Archivo:** [../testing/chrome-devtools-testing.md](../testing/chrome-devtools-testing.md)

**Contenido:**
- 🎯 Por qué Chrome DevTools vs Playwright
- 🚀 Quick start guide
- 📋 8 casos de test de Autocomplete
- 📸 Screenshots y debugging
- 🎯 Test patterns reutilizables
- 🧪 Test suite completo
- 📚 Tools reference completa
- 🆚 Comparación con Playwright

**Cuándo leer:**
- ✅ Testing de componentes UI
- ✅ Debugging con Claude Code
- ✅ Crear tests conversacionales
- ✅ Migrar desde Playwright

---

### **📍 Otros Componentes**

#### **4. AddressInput Component**
**Archivo:** [AddressInput.md](./AddressInput.md)

**Contenido:**
- Integración con Google Places API
- PlacesServiceAdapter usage
- Session tokens y caching
- Country-specific search

---

#### **5. Project Event Cache Optimization**
**Archivo:** [project-event-cache-optimization.md](./project-event-cache-optimization.md)

**Contenido:**
- Sistema de cache inteligente
- Arquitectura de referencias
- Trade-offs y decisiones

---

#### **6. React Hook Form Patterns**
**Archivo:** [react-hook-form-patterns.md](./react-hook-form-patterns.md)

**Contenido:**
- Patrones de formularios
- Validación con Zod
- Integration patterns

---

## 🗺️ Mapa de Navegación

### **Para Desarrolladores Nuevos**

1. **Primer contacto con Autocomplete:**
   - Leer: [autocomplete-component.md](./autocomplete-component.md) → Sección "Ejemplos de Uso"

2. **Decidir entre Autocomplete y Combobox:**
   - Leer: [autocomplete-vs-combobox.md](./autocomplete-vs-combobox.md) → Sección "Decision Matrix"

3. **Testing del componente:**
   - Leer: [chrome-devtools-testing.md](../testing/chrome-devtools-testing.md) → Sección "Quick Start"

---

### **Para Debugging**

1. **Problema con Autocomplete:**
   - Leer: [autocomplete-component.md](./autocomplete-component.md) → Sección "Troubleshooting"

2. **Performance issues:**
   - Leer: [autocomplete-component.md](./autocomplete-component.md) → Sección "Performance Tips"
   - Comparar: [autocomplete-vs-combobox.md](./autocomplete-vs-combobox.md) → Sección "Performance Comparison"

3. **Testing failures:**
   - Leer: [chrome-devtools-testing.md](../testing/chrome-devtools-testing.md) → Sección "Best Practices"

---

### **Para Migración**

1. **De Combobox a Autocomplete:**
   - Leer: [autocomplete-vs-combobox.md](./autocomplete-vs-combobox.md) → Sección "Migration Guide"

2. **De Playwright a Chrome DevTools:**
   - Leer: [chrome-devtools-testing.md](../testing/chrome-devtools-testing.md) → Sección "Chrome DevTools MCP vs Playwright"

---

## 📊 Estadísticas de Documentación

| Documento | Líneas | Ejemplos | Secciones |
|-----------|--------|----------|-----------|
| autocomplete-component.md | 450+ | 7 | 12 |
| autocomplete-vs-combobox.md | 500+ | 15+ | 10 |
| chrome-devtools-testing.md | 700+ | 8 | 11 |
| **Total** | **1,650+** | **30+** | **33** |

---

## 🔗 Referencias Cruzadas

### **Código Fuente**
- [Autocomplete Component](../../../src/components/ui/autocomplete.tsx)
- [Combobox Component](../../../src/components/ui/combobox.tsx)

### **Usos en Producción**
- [ProjectForm](../../../src/components/forms/ProjectForm.tsx:180)
- [AfterSaleForm](../../../src/components/forms/AfterSaleForm.tsx)

### **Testing**
- [Chrome DevTools Testing Guide](../testing/chrome-devtools-testing.md)

---

## 📝 Notas de Actualización

**Versión 2.0 - Octubre 2025:**
- ✅ Autocomplete completamente reescrito
- ✅ Hereda TODAS las features de Combobox
- ✅ Documentación exhaustiva creada
- ✅ Testing migrado a Chrome DevTools MCP
- ✅ 0 breaking changes en código existente

**Componentes documentados:** 6
**Guías técnicas:** 3
**Ejemplos de código:** 30+
**Casos de test:** 8

---

**Mantenedores:** Equipo CalReact
**Última revisión:** Octubre 2025
