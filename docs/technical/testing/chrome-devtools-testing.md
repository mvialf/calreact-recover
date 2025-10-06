# 🧪 Testing con Chrome DevTools MCP - Guía Completa

**Framework:** Chrome DevTools MCP Server
**Fecha:** Octubre 2025
**Reemplaza:** Playwright (deprecado en este proyecto)

---

## 🎯 ¿Por Qué Chrome DevTools MCP?

### **Ventajas sobre Playwright**

| Aspecto | Chrome DevTools MCP | Playwright |
|---------|---------------------|------------|
| **Integración Claude** | ✅ Nativa | ❌ Manual |
| **Setup** | ✅ Cero configuración | ⚠️ Requiere instalación |
| **Debugging** | ✅ Interactive con Claude | ⚠️ Manual |
| **Velocidad desarrollo** | ✅ Testing conversacional | ⚠️ Escribir scripts |
| **Browser support** | Chrome/Chromium | Chrome, Firefox, Safari, Edge |
| **Headless** | Sí | Sí |
| **Screenshots** | ✅ Automático | ✅ Programático |
| **Network mocking** | ✅ Disponible | ✅ Disponible |

**Decisión:** Chrome DevTools MCP es superior para desarrollo con Claude Code.

---

## 🚀 Quick Start

### **1. Verificar Disponibilidad del MCP**

El servidor Chrome DevTools MCP ya está configurado en el proyecto. Verifica:

```typescript
// En Claude Code, los siguientes tools están disponibles:
mcp__chrome-devtools__navigate_page
mcp__chrome-devtools__take_snapshot
mcp__chrome-devtools__click
mcp__chrome-devtools__fill
mcp__chrome-devtools__evaluate_script
mcp__chrome-devtools__take_screenshot
// ... y más
```

### **2. Iniciar Servidor de Desarrollo**

```bash
# Terminal 1: Servidor de desarrollo
npm run dev  # Puerto 3002 (Turbopack)

# Esperar mensaje:
# ✓ Ready in 2.3s
# ○ Local:   http://localhost:3002
```

### **3. Navegar a la Página**

```typescript
// Desde Claude Code
await mcp__chrome-devtools__navigate_page({
  url: "http://localhost:3002/projects"
})
```

---

## 📋 Testing del Componente Autocomplete

### **Caso 1: Renderizado Inicial**

**Objetivo:** Verificar que el componente se renderiza correctamente

```typescript
// 1. Navegar a la página
await navigate_page({ url: "http://localhost:3002/projects/new" })

// 2. Tomar snapshot de la página
const snapshot = await take_snapshot()

// 3. Verificar que existe el autocomplete
// Buscar en snapshot:
// - Input con role="combobox"
// - Placeholder "Buscar cliente..."
// - Estado inicial sin selección

// Resultado esperado:
{
  role: "combobox",
  placeholder: "Buscar cliente...",
  value: "",
  disabled: false
}
```

**Validación con Screenshot:**
```typescript
await take_screenshot({
  filename: "autocomplete-initial-state.png"
})
```

---

### **Caso 2: Búsqueda y Filtrado**

**Objetivo:** Verificar que la búsqueda filtra correctamente

```typescript
// 1. Navegar a la página
await navigate_page({ url: "http://localhost:3002/projects/new" })

// 2. Tomar snapshot para encontrar el input
const snapshot1 = await take_snapshot()
// Encontrar uid del input combobox

// 3. Escribir en el autocomplete
await fill({
  uid: "input_combobox_uid",  // Obtenido del snapshot
  value: "Juan"
})

// 4. Esperar a que aparezcan resultados
await wait_for({
  text: "Juan Pérez",
  timeout: 2000
})

// 5. Tomar nuevo snapshot
const snapshot2 = await take_snapshot()

// 6. Verificar resultados filtrados
// Buscar en snapshot2:
// - Listbox con id="autocomplete-listbox"
// - Items que contienen "Juan"
// - Items que NO contienen otros nombres

// Resultado esperado:
{
  listbox: {
    items: [
      { value: "client-1", label: "Juan Pérez" },
      { value: "client-5", label: "Juan Carlos" }
    ],
    total: 2
  }
}
```

**Screenshot de validación:**
```typescript
await take_screenshot({
  filename: "autocomplete-filtered-results.png"
})
```

---

### **Caso 3: Navegación por Teclado**

**Objetivo:** Verificar navegación con Arrow Down/Up, Home, End

```typescript
// 1. Setup: Abrir autocomplete con resultados
await navigate_page({ url: "http://localhost:3002/projects/new" })
await fill({ uid: "combobox_uid", value: "cli" })
await wait_for({ text: "Cliente" })

// 2. Presionar ArrowDown
await press_key({ key: "ArrowDown" })

// 3. Tomar snapshot
const snapshot1 = await take_snapshot()

// Verificar en snapshot1:
// - Primer item tiene bg-accent (highlighted)

// 4. Presionar Home (saltar al inicio)
await press_key({ key: "Home" })

const snapshot2 = await take_snapshot()

// Verificar en snapshot2:
// - Index 0 está seleccionado

// 5. Presionar End (saltar al final)
await press_key({ key: "End" })

const snapshot3 = await take_snapshot()

// Verificar en snapshot3:
// - Último item está seleccionado

// 6. Presionar Enter (seleccionar)
await press_key({ key: "Enter" })

// 7. Verificar input muestra valor seleccionado
const snapshot4 = await take_snapshot()

// Resultado esperado en snapshot4:
{
  role: "combobox",
  value: "Cliente seleccionado",
  aria-expanded: "false"  // Dropdown cerrado
}
```

---

### **Caso 4: Modo Strict Selection**

**Objetivo:** Verificar validación de input inválido

```typescript
// 1. Navegar a página con strictSelection
await navigate_page({ url: "http://localhost:3002/aftersales/new" })

// 2. Escribir valor inválido
await fill({
  uid: "project_autocomplete_uid",
  value: "xyz123"  // No existe en la lista
})

// 3. Blur del input (quitar foco)
await evaluate_script({
  function: `() => {
    document.querySelector('[role="combobox"]').blur()
  }`
})

// 4. Esperar a que se aplique validación
await wait({ time: 200 })

// 5. Tomar snapshot
const snapshot = await take_snapshot()

// Verificar en snapshot:
// - Input tiene aria-invalid="true"
// - Border rojo aplicado (className contiene "border-destructive")
// - Valor revertido a último válido o vacío

// Resultado esperado:
{
  role: "combobox",
  "aria-invalid": "true",
  className: "... border-destructive ...",
  value: ""  // Revertido a vacío
}
```

**Screenshot de error visual:**
```typescript
await take_screenshot({
  filename: "autocomplete-invalid-state.png"
})
```

---

### **Caso 5: Estado Loading**

**Objetivo:** Verificar indicador de carga

```typescript
// 1. Setup: Simular búsqueda async lenta
await navigate_page({ url: "http://localhost:3002/projects/new" })

// 2. Interceptar requests (opcional)
await evaluate_script({
  function: `() => {
    // Mock fetch para simular delay
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      return originalFetch(...args)
    }
  }`
})

// 3. Escribir en autocomplete (trigger búsqueda)
await fill({ uid: "combobox_uid", value: "cli" })

// 4. Inmediatamente tomar snapshot (mientras carga)
const snapshot = await take_snapshot()

// Verificar en snapshot:
// - Icono Loader2 visible
// - Input deshabilitado
// - Spinner animado

// Resultado esperado:
{
  loading: true,
  disabled: true,
  icon: "Loader2"  // h-4 w-4 animate-spin
}
```

---

### **Caso 6: Click en Item de la Lista**

**Objetivo:** Verificar selección con mouse

```typescript
// 1. Setup: Abrir autocomplete
await navigate_page({ url: "http://localhost:3002/projects/new" })
await fill({ uid: "combobox_uid", value: "Juan" })
await wait_for({ text: "Juan Pérez" })

// 2. Tomar snapshot para obtener UID del item
const snapshot = await take_snapshot()

// Buscar en snapshot el item con text "Juan Pérez"
const itemUid = snapshot.items.find(i => i.text === "Juan Pérez").uid

// 3. Hover sobre el item
await hover({ uid: itemUid })

// 4. Verificar highlight con snapshot
const snapshot2 = await take_snapshot()

// Item debe tener bg-accent

// 5. Click en el item
await click({ uid: itemUid })

// 6. Verificar selección
await wait({ time: 200 })
const snapshot3 = await take_snapshot()

// Resultado esperado en snapshot3:
{
  combobox: {
    value: "Juan Pérez",
    "aria-expanded": "false"  // Cerrado
  },
  listbox: null  // Ya no visible
}
```

---

## 🔍 Casos Avanzados

### **Caso 7: Renderizado Custom con `renderItem`**

**Objetivo:** Verificar que el renderizado personalizado funciona

```typescript
// Componente usa renderItem con Avatar + Email
await navigate_page({ url: "http://localhost:3002/aftersales/new" })

// Abrir autocomplete
await fill({ uid: "project_autocomplete_uid", value: "Proyecto" })
await wait_for({ text: "Proyecto" })

// Tomar snapshot
const snapshot = await take_snapshot()

// Verificar estructura custom en snapshot:
// - Cada item tiene Avatar
// - Título del proyecto visible
// - Email o info adicional visible

// Screenshot de validación visual
await take_screenshot({
  element: "listbox_uid",
  filename: "autocomplete-custom-render.png"
})
```

---

### **Caso 8: Debounce Performance**

**Objetivo:** Verificar que debounce reduce requests

```typescript
// 1. Setup: Monitorear network requests
await navigate_page({ url: "http://localhost:3002/projects/new" })

// 2. Escribir rápidamente (simular typing)
await fill({ uid: "combobox_uid", value: "c" })
await wait({ time: 50 })
await fill({ uid: "combobox_uid", value: "cl" })
await wait({ time: 50 })
await fill({ uid: "combobox_uid", value: "cli" })
await wait({ time: 50 })
await fill({ uid: "combobox_uid", value: "clie" })

// 3. Esperar debounce (300ms)
await wait({ time: 400 })

// 4. Verificar requests
const networkRequests = await network_requests({
  resourceTypes: ["fetch", "xhr"]
})

// Resultado esperado:
// - Solo 1 request (no 4)
// - Request se hizo DESPUÉS del debounce

// Validación:
expect(networkRequests.filter(r => r.url.includes('search')).length).toBe(1)
```

---

## 📸 Screenshots y Debugging

### **Tomar Screenshots Específicos**

#### **1. Screenshot de Input Trigger**
```typescript
await take_screenshot({
  element: "combobox_trigger_uid",
  filename: "autocomplete-trigger.png",
  type: "png"
})
```

#### **2. Screenshot de Dropdown Abierto**
```typescript
await take_screenshot({
  element: "autocomplete_popover_uid",
  filename: "autocomplete-dropdown.png",
  type: "png"
})
```

#### **3. Screenshot Full Page**
```typescript
await take_screenshot({
  fullPage: true,
  filename: "autocomplete-full-context.png"
})
```

### **Debugging con Console Messages**

```typescript
// Obtener errores de consola
const consoleMessages = await console_messages({
  onlyErrors: true
})

// Verificar que no hay errores React
expect(consoleMessages.filter(m => m.includes('Warning'))).toEqual([])
```

### **Debugging con Network Inspector**

```typescript
// Ver todas las requests durante el test
const allRequests = await network_requests()

// Filtrar requests específicas
const apiRequests = allRequests.filter(r =>
  r.url.includes('/api/clients')
)

// Verificar response de búsqueda
const searchRequest = apiRequests.find(r =>
  r.url.includes('search?q=Juan')
)

console.log('Search response:', searchRequest.response)
```

---

## 🎯 Test Patterns Comunes

### **Pattern 1: Fill → Wait → Snapshot → Validate**

```typescript
async function testAutocompleteSearch(searchTerm: string, expectedItems: string[]) {
  // Fill
  await fill({ uid: "combobox_uid", value: searchTerm })

  // Wait
  await wait_for({ text: expectedItems[0], timeout: 2000 })

  // Snapshot
  const snapshot = await take_snapshot()

  // Validate
  const actualItems = snapshot.listbox.items.map(i => i.label)
  expect(actualItems).toEqual(expectedItems)
}

// Uso
await testAutocompleteSearch("Juan", ["Juan Pérez", "Juan Carlos"])
```

### **Pattern 2: Keyboard Navigation → Snapshot → Verify Selection**

```typescript
async function testKeyboardNavigation(keys: string[], expectedIndex: number) {
  // Open autocomplete
  await fill({ uid: "combobox_uid", value: "cli" })
  await wait_for({ text: "Cliente" })

  // Press keys
  for (const key of keys) {
    await press_key({ key })
  }

  // Snapshot
  const snapshot = await take_snapshot()

  // Verify
  const selectedItem = snapshot.listbox.items[expectedIndex]
  expect(selectedItem.className).toContain("bg-accent")
}

// Uso
await testKeyboardNavigation(["ArrowDown", "ArrowDown"], 2)
await testKeyboardNavigation(["Home"], 0)
await testKeyboardNavigation(["End"], 9)
```

### **Pattern 3: Error State → Screenshot → Validate Visuals**

```typescript
async function testErrorState(invalidValue: string) {
  // Trigger error
  await fill({ uid: "combobox_uid", value: invalidValue })
  await evaluate_script({ function: `() => document.querySelector('[role="combobox"]').blur()` })
  await wait({ time: 200 })

  // Screenshot
  const filename = `error-${invalidValue}.png`
  await take_screenshot({ filename })

  // Snapshot
  const snapshot = await take_snapshot()

  // Validate
  expect(snapshot.combobox["aria-invalid"]).toBe("true")
  expect(snapshot.combobox.className).toContain("border-destructive")

  return filename
}

// Uso
await testErrorState("xyz123")
```

---

## 🧪 Test Suite Completo: Autocomplete

```typescript
// Suite de tests para Autocomplete component
async function testAutocompleteSuite() {
  console.log("🧪 Testing Autocomplete Component...")

  // Test 1: Renderizado inicial
  console.log("1. Verificando renderizado inicial...")
  await navigate_page({ url: "http://localhost:3002/projects/new" })
  const initialSnapshot = await take_snapshot()
  assert(initialSnapshot.combobox.role === "combobox")
  console.log("✅ Renderizado inicial OK")

  // Test 2: Búsqueda y filtrado
  console.log("2. Verificando búsqueda...")
  await fill({ uid: "combobox_uid", value: "Juan" })
  await wait_for({ text: "Juan" })
  const searchSnapshot = await take_snapshot()
  assert(searchSnapshot.listbox.items.length > 0)
  console.log("✅ Búsqueda OK")

  // Test 3: Navegación con teclado
  console.log("3. Verificando navegación teclado...")
  await press_key({ key: "ArrowDown" })
  await press_key({ key: "Home" })
  await press_key({ key: "End" })
  console.log("✅ Navegación OK")

  // Test 4: Selección con Enter
  console.log("4. Verificando selección...")
  await press_key({ key: "Home" })
  await press_key({ key: "Enter" })
  await wait({ time: 200 })
  const selectedSnapshot = await take_snapshot()
  assert(selectedSnapshot.combobox.value !== "")
  console.log("✅ Selección OK")

  // Test 5: Validación estricta
  console.log("5. Verificando validación estricta...")
  await fill({ uid: "combobox_uid", value: "xyz" })
  await evaluate_script({ function: `() => document.querySelector('[role="combobox"]').blur()` })
  await wait({ time: 200 })
  const errorSnapshot = await take_snapshot()
  assert(errorSnapshot.combobox["aria-invalid"] === "true")
  console.log("✅ Validación OK")

  console.log("🎉 Todos los tests pasaron!")
}

// Ejecutar suite
await testAutocompleteSuite()
```

---

## 📚 Chrome DevTools MCP Tools Reference

### **Navegación**
```typescript
mcp__chrome-devtools__navigate_page({ url: string })
mcp__chrome-devtools__navigate_page_history({ navigate: "back" | "forward" })
```

### **Interacción**
```typescript
mcp__chrome-devtools__click({ uid: string })
mcp__chrome-devtools__fill({ uid: string, value: string })
mcp__chrome-devtools__hover({ uid: string })
mcp__chrome-devtools__drag({ from_uid: string, to_uid: string })
```

### **Teclado**
```typescript
mcp__chrome-devtools__press_key({ key: string })
// Keys: "ArrowDown", "ArrowUp", "Enter", "Escape", "Home", "End", "Tab"
```

### **Snapshot & Screenshots**
```typescript
mcp__chrome-devtools__take_snapshot()
mcp__chrome-devtools__take_screenshot({
  filename?: string,
  element?: string,
  fullPage?: boolean,
  type?: "png" | "jpeg" | "webp"
})
```

### **Debugging**
```typescript
mcp__chrome-devtools__console_messages({ onlyErrors?: boolean })
mcp__chrome-devtools__network_requests({ resourceTypes?: string[] })
mcp__chrome-devtools__evaluate_script({ function: string })
```

### **Wait & Timing**
```typescript
mcp__chrome-devtools__wait_for({ text: string, timeout?: number })
mcp__chrome-devtools__wait({ time: number })
```

---

## 🎓 Best Practices

### **1. Siempre usar `wait_for` antes de interactuar**

```typescript
// ❌ Malo - Puede fallar si el elemento no está listo
await click({ uid: "item_uid" })

// ✅ Bueno - Esperar a que el elemento esté visible
await wait_for({ text: "Item Text" })
await click({ uid: "item_uid" })
```

### **2. Tomar snapshots para validación de estado**

```typescript
// ✅ Snapshot es más confiable que screenshots
const snapshot = await take_snapshot()
const hasError = snapshot.combobox["aria-invalid"] === "true"

// Los snapshots son estructurados y parseables
```

### **3. Screenshots para debugging visual**

```typescript
// ✅ Screenshots para debugging y documentación
await take_screenshot({
  filename: `test-${Date.now()}.png`,
  fullPage: true
})
```

### **4. Limpiar estado entre tests**

```typescript
// ✅ Refrescar página entre tests
await navigate_page({ url: "http://localhost:3002/projects/new" })

// O limpiar input manualmente
await fill({ uid: "combobox_uid", value: "" })
```

---

## 🆚 Chrome DevTools MCP vs Playwright

### **Migración desde Playwright**

#### **Playwright**
```typescript
// playwright.spec.ts
test('autocomplete search', async ({ page }) => {
  await page.goto('http://localhost:3002/projects/new')
  await page.fill('[role="combobox"]', 'Juan')
  await page.waitForSelector('text=Juan Pérez')
  const items = await page.locator('[role="option"]').count()
  expect(items).toBe(2)
})
```

#### **Chrome DevTools MCP**
```typescript
// Conversacional con Claude
await navigate_page({ url: "http://localhost:3002/projects/new" })
await fill({ uid: "combobox_uid", value: "Juan" })
await wait_for({ text: "Juan Pérez" })
const snapshot = await take_snapshot()
// Verificar snapshot.listbox.items.length === 2
```

**Diferencia clave:** Chrome DevTools MCP es **conversacional** y se ejecuta directamente desde Claude Code sin escribir archivos de test.

---

## 📖 Referencias

### **Componentes Testeados**
- [Autocomplete Component](../components/autocomplete-component.md)
- [Autocomplete vs Combobox](../components/autocomplete-vs-combobox.md)

### **Chrome DevTools MCP**
- Servidor MCP configurado en el proyecto
- Tools disponibles directamente en Claude Code
- Sin instalación adicional requerida

### **Casos de Uso Reales**
- [ProjectForm Testing](../../src/components/forms/ProjectForm.tsx)
- [AfterSaleForm Testing](../../src/components/forms/AfterSaleForm.tsx)

---

**Última actualización:** Octubre 2025
**Testing framework:** Chrome DevTools MCP
**Reemplaza:** Playwright (deprecado)
