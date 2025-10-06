# 🧪 Testing Documentation - CalReact

**Framework:** Chrome DevTools MCP
**Fecha:** Octubre 2025
**Reemplaza:** Playwright (deprecado en este proyecto)

---

## 📚 Documentación Disponible

### **1. Chrome DevTools Testing Guide** ⭐
**Archivo:** [chrome-devtools-testing.md](./chrome-devtools-testing.md)

**Contenido completo:**
- 🎯 Por qué Chrome DevTools MCP
- 🚀 Quick start (3 pasos)
- 📋 8 casos de test de Autocomplete
  1. Renderizado inicial
  2. Búsqueda y filtrado
  3. Navegación por teclado
  4. Modo strict selection
  5. Estado loading
  6. Click en items
  7. Renderizado custom
  8. Debounce performance
- 📸 Screenshots y debugging
- 🎯 Test patterns reutilizables
- 🧪 Test suite completo
- 📚 Tools reference
- 🆚 Comparación con Playwright

**Cuándo leer:**
- ✅ Necesitas testear componentes UI
- ✅ Debugging interactivo con Claude
- ✅ Crear tests conversacionales
- ✅ Migrar desde Playwright

**Tiempo de lectura:** 15-20 minutos

---

## 🎯 Quick Start

### **Iniciar Testing en 3 Pasos**

#### **Paso 1: Iniciar Servidor**
```bash
npm run dev  # Puerto 3002
```

#### **Paso 2: Navegar en Chrome DevTools MCP**
```typescript
await mcp__chrome-devtools__navigate_page({
  url: "http://localhost:3002/projects/new"
})
```

#### **Paso 3: Tomar Snapshot**
```typescript
const snapshot = await mcp__chrome-devtools__take_snapshot()
// Analizar snapshot para encontrar elementos
```

---

## 📋 Casos de Test por Componente

### **Autocomplete Component**

| Test Case | Herramientas | Tiempo | Documentación |
|-----------|--------------|--------|---------------|
| Renderizado inicial | `navigate_page`, `take_snapshot` | 30s | [Caso 1](./chrome-devtools-testing.md#caso-1-renderizado-inicial) |
| Búsqueda y filtrado | `fill`, `wait_for`, `take_snapshot` | 45s | [Caso 2](./chrome-devtools-testing.md#caso-2-búsqueda-y-filtrado) |
| Navegación teclado | `press_key`, `take_snapshot` | 60s | [Caso 3](./chrome-devtools-testing.md#caso-3-navegación-por-teclado) |
| Strict selection | `fill`, `evaluate_script`, `blur` | 45s | [Caso 4](./chrome-devtools-testing.md#caso-4-modo-strict-selection) |
| Estado loading | `fill`, `wait` | 30s | [Caso 5](./chrome-devtools-testing.md#caso-5-estado-loading) |
| Click en items | `click`, `hover` | 40s | [Caso 6](./chrome-devtools-testing.md#caso-6-click-en-item-de-la-lista) |
| Renderizado custom | `take_screenshot` | 30s | [Caso 7](./chrome-devtools-testing.md#caso-7-renderizado-custom-con-renderitem) |
| Debounce performance | `network_requests` | 50s | [Caso 8](./chrome-devtools-testing.md#caso-8-debounce-performance) |

**Total:** 8 casos de test | ~6 minutos de ejecución

---

## 🛠️ Chrome DevTools MCP Tools

### **Categorías de Tools**

#### **1. Navegación**
```typescript
navigate_page({ url: string })
navigate_page_history({ navigate: "back" | "forward" })
```

#### **2. Interacción**
```typescript
click({ uid: string })
fill({ uid: string, value: string })
hover({ uid: string })
drag({ from_uid: string, to_uid: string })
press_key({ key: string })
```

#### **3. Snapshot & Screenshots**
```typescript
take_snapshot()
take_screenshot({ filename?, element?, fullPage?, type? })
```

#### **4. Debugging**
```typescript
console_messages({ onlyErrors? })
network_requests({ resourceTypes? })
evaluate_script({ function: string })
```

#### **5. Wait & Timing**
```typescript
wait_for({ text: string, timeout? })
wait({ time: number })
```

**Total de tools:** 15+

---

## 📊 Comparación: Chrome DevTools MCP vs Playwright

| Aspecto | Chrome DevTools MCP | Playwright |
|---------|---------------------|------------|
| **Setup** | ✅ Zero config | ⚠️ npm install + config |
| **Ejecución** | ✅ Conversacional | ⚠️ Scripts escritos |
| **Debugging** | ✅ Interactive con Claude | ⚠️ Manual con VSCode |
| **Velocidad desarrollo** | ✅ Instantánea | ⚠️ Ciclo write-run-debug |
| **Integration Claude** | ✅ Nativa | ❌ No integrada |
| **Screenshots** | ✅ Automático | ✅ Programático |
| **Cross-browser** | ⚠️ Chrome/Chromium | ✅ Todos los browsers |
| **CI/CD** | ⚠️ Limitado | ✅ Excelente |

**Decisión:** Chrome DevTools MCP para desarrollo, Playwright para CI/CD (si es necesario)

---

## 🎨 Test Patterns Recomendados

### **Pattern 1: Fill → Wait → Snapshot**
```typescript
// Uso común: Búsqueda y validación
await fill({ uid: "input_uid", value: "search term" })
await wait_for({ text: "Expected Result" })
const snapshot = await take_snapshot()
// Validar snapshot
```

**Casos de uso:**
- Búsqueda en Autocomplete
- Filtros en tablas
- Formularios dinámicos

---

### **Pattern 2: Keyboard → Snapshot → Verify**
```typescript
// Uso común: Navegación por teclado
await press_key({ key: "ArrowDown" })
const snapshot = await take_snapshot()
// Verificar elemento highlighted
```

**Casos de uso:**
- Navegación en listas
- Selección con teclado
- Accesibilidad testing

---

### **Pattern 3: Error State → Screenshot**
```typescript
// Uso común: Validación visual de errores
await fill({ uid: "input_uid", value: "invalid" })
await evaluate_script({ function: `() => blur()` })
await take_screenshot({ filename: "error-state.png" })
```

**Casos de uso:**
- Validación de formularios
- Estados de error
- Documentación visual

---

## 📁 Estructura de Testing

```
docs/technical/testing/
├── README.md (este archivo)
├── chrome-devtools-testing.md (guía principal)
├── google-maps-guide/
│   └── ... (testing de Maps API)
├── implementation/
│   └── ... (testing de implementaciones)
└── strategies/
    └── ... (estrategias de testing)
```

---

## 🚀 Ejecutar Tests Rápidos

### **Test Rápido: Autocomplete Básico**
```typescript
// 1 minuto - Verificar funcionalidad básica
await navigate_page({ url: "http://localhost:3002/projects/new" })
await fill({ uid: "combobox_uid", value: "test" })
await wait_for({ text: "test" })
const snapshot = await take_snapshot()
console.log("Items encontrados:", snapshot.listbox.items.length)
```

### **Test Rápido: Navegación Teclado**
```typescript
// 1 minuto - Verificar keyboard navigation
await fill({ uid: "combobox_uid", value: "cli" })
await wait_for({ text: "Cliente" })
await press_key({ key: "ArrowDown" })
await press_key({ key: "Enter" })
await wait({ time: 200 })
const snapshot = await take_snapshot()
console.log("Valor seleccionado:", snapshot.combobox.value)
```

### **Test Rápido: Validación Estricta**
```typescript
// 1 minuto - Verificar strict validation
await fill({ uid: "combobox_uid", value: "xyz" })
await evaluate_script({ function: `() => document.querySelector('[role="combobox"]').blur()` })
await wait({ time: 200 })
const snapshot = await take_snapshot()
console.log("Es inválido:", snapshot.combobox["aria-invalid"])
```

---

## 🔗 Referencias

### **Documentación Relacionada**
- [Autocomplete Component Guide](../components/autocomplete-component.md)
- [Autocomplete vs Combobox](../components/autocomplete-vs-combobox.md)

### **Código Fuente**
- [Autocomplete Component](../../../src/components/ui/autocomplete.tsx)
- [Test Files](../../../src/components/ui/__tests__/)

### **MCP Servers**
- Chrome DevTools MCP (configurado)
- Playwright MCP (disponible como alternativa)

---

## 📝 Contribuir

### **Agregar Nuevos Tests**

1. **Documentar el caso de test**
   - Objetivo claro
   - Pasos de ejecución
   - Resultado esperado

2. **Usar patterns existentes**
   - Reutilizar patterns comunes
   - Seguir convenciones de naming

3. **Incluir screenshots**
   - Estados importantes
   - Errores visuales
   - Documentación

### **Template de Test Case**

```markdown
### **Caso X: [Nombre del Test]**

**Objetivo:** [Descripción clara]

```typescript
// 1. Setup
await navigate_page({ url: "..." })

// 2. Acción
await fill({ uid: "...", value: "..." })

// 3. Validación
const snapshot = await take_snapshot()
// Verificar resultado
```

**Resultado esperado:**
- Item 1
- Item 2
```

---

## 📊 Estadísticas

**Documentación de testing:**
- 📄 Documentos: 1 guía principal
- 📋 Casos de test: 8 documentados
- 🎯 Test patterns: 3 reutilizables
- 🛠️ Tools documentados: 15+
- 📸 Screenshots de ejemplo: 6+

**Tiempo estimado:**
- Lectura completa: 20 minutos
- Quick start: 5 minutos
- Test suite completo: 6 minutos

---

## 🎓 Próximos Pasos

1. **Leer la guía principal:** [chrome-devtools-testing.md](./chrome-devtools-testing.md)
2. **Probar el Quick Start:** 3 pasos, 2 minutos
3. **Ejecutar un test rápido:** Validar que todo funciona
4. **Explorar casos avanzados:** Debugging, performance, custom rendering

---

**Última actualización:** Octubre 2025
**Framework:** Chrome DevTools MCP
**Mantenedores:** Equipo CalReact
