# 📋 Autocomplete Component - Guía Técnica Completa

**Versión:** 2.0 (Reescritura completa - Octubre 2025)
**Ubicación:** `src/components/ui/autocomplete.tsx`
**Tipo:** Input editable con búsqueda directa en el trigger
**Hereda de:** Combobox de Shadcn/ui

---

## 🎯 Descripción General

El componente `Autocomplete` es un **input editable** que permite buscar y seleccionar elementos de una lista mediante escritura directa. A diferencia del `Combobox`, la búsqueda ocurre directamente en el campo de input (no en un dropdown separado), siguiendo el patrón de diseño común en Google Search, GitHub, y otros.

### **Diferencia Principal vs Combobox**

| Aspecto | Combobox | Autocomplete |
|---------|----------|--------------|
| **Trigger** | Botón con texto | Input editable |
| **Search** | Campo dentro del dropdown | Directamente en el trigger |
| **Apertura** | Click manual en botón | Automática al escribir |
| **Use case** | Selección de opciones conocidas | Búsqueda exploratoria |

---

## 🏗️ Arquitectura del Componente

### **Estructura Modular**

```typescript
src/components/ui/autocomplete.tsx (487 líneas)
├─ Types & Interfaces (líneas 1-114)
│  ├─ AutocompleteItem - Interface del item
│  └─ AutocompleteProps - Props del componente (14 props)
│
├─ Custom Hooks (líneas 115-216)
│  ├─ useAutocompleteState - Gestión de estado
│  │  ├─ inputValue, open, selectedItem
│  │  ├─ Debounce configurable
│  │  └─ Sincronización con prop value
│  │
│  └─ useAutocompleteKeyboard - Navegación
│     ├─ 8 teclas soportadas
│     ├─ ArrowUp/Down, Home/End, Enter, Escape, Tab
│     └─ Prevención de scroll de página
│
└─ Componente Principal (líneas 217-486)
   ├─ Input editable con iconos
   ├─ Popover con lista filtrada
   ├─ Lógica de búsqueda inteligente
   └─ Callbacks unificados
```

---

## 📚 API Reference

### **Props Principales**

#### **Datos**
```typescript
items: AutocompleteItem[]  // Lista de elementos
value?: string            // Valor seleccionado (controlado)
```

#### **Callbacks**
```typescript
onSelect: (value: string) => void           // Al seleccionar (OBLIGATORIO)
onValueSelect?: (value: string) => void     // Callback adicional (heredado de Combobox)
onSearch?: (query: string) => void          // Búsqueda personalizada/async
onInputChange?: (value: string) => void     // Al cambiar input (legacy)
```

#### **Textos**
```typescript
placeholder?: string           // "Buscar..."
searchPlaceholder?: string     // Alternativo (heredado de Combobox)
emptyText?: string            // "No se encontraron resultados."
```

#### **Comportamiento**
```typescript
disabled?: boolean            // Deshabilitar componente
isLoading?: boolean          // Mostrar spinner
strictSelection?: boolean     // Solo valores de la lista (EXCLUSIVO)
debounceMs?: number          // Debounce en ms (EXCLUSIVO, default: 0)
```

#### **Estilos**
```typescript
className?: string           // Contenedor principal
inputClassName?: string      // Input editable
popoverClassName?: string    // Popover container
itemClassName?: string       // Items de la lista
```

#### **Renderizado**
```typescript
renderItem?: (item: AutocompleteItem, isSelected: boolean) => ReactNode
renderSelectedItem?: (item: AutocompleteItem) => ReactNode
showSearch?: boolean         // Siempre true internamente
```

---

## 🚀 Ejemplos de Uso

### **1. Caso Básico (Compatible con versión anterior)**

```typescript
import { Autocomplete } from '@/components/ui/autocomplete'

function ClientSelector() {
  const [clientId, setClientId] = useState('')

  const clientItems = clients.map(client => ({
    value: client.id,
    label: client.name
  }))

  return (
    <Autocomplete
      items={clientItems}
      value={clientId}
      onSelect={setClientId}
      placeholder="Buscar cliente..."
      emptyText="No se encontraron clientes."
    />
  )
}
```

**Características:**
- ✅ Búsqueda local automática
- ✅ Filtrado por `label` case-insensitive
- ✅ Sin debounce (inmediato)

---

### **2. Con Modo Estricto (Validación)**

```typescript
<Autocomplete
  items={countries}
  value={country}
  onSelect={setCountry}
  placeholder="Seleccionar país..."
  strictSelection={true}  // ← Solo valores válidos
  inputClassName="border-2"
/>
```

**Comportamiento con `strictSelection={true}`:**
- ✅ Input se valida contra la lista
- ✅ Border rojo si el valor no existe
- ✅ Revierte al último valor válido en blur
- ✅ Solo permite selección de items existentes

**Visual:**
```typescript
// Input válido: border normal
// Input inválido: border-destructive (rojo)
```

---

### **3. Con Debounce (Performance)**

```typescript
<Autocomplete
  items={largeDataset}  // 1000+ items
  value={selected}
  onSelect={setSelected}
  placeholder="Buscar en 10,000 items..."
  debounceMs={300}  // ← Espera 300ms antes de filtrar
/>
```

**Casos de uso:**
- ✅ Listas grandes (>500 items)
- ✅ Búsquedas costosas computacionalmente
- ✅ Mejorar UX con menos re-renders

---

### **4. Con Búsqueda Async (Nuevo - Heredado de Combobox)**

```typescript
function AsyncClientSearch() {
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query: string) => {
    if (query.length < 2) return

    setIsLoading(true)
    try {
      const results = await fetch(`/api/clients/search?q=${query}`)
        .then(res => res.json())

      setSearchResults(results.map(c => ({
        value: c.id,
        label: c.name,
        email: c.email  // Datos extra
      })))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Autocomplete
      items={searchResults}
      value={clientId}
      onSelect={setClientId}
      onSearch={handleSearch}  // ← Callback async
      debounceMs={500}        // ← Debounce automático
      isLoading={isLoading}
      placeholder="Buscar cliente por nombre..."
    />
  )
}
```

**Características:**
- ✅ `onSearch` se ejecuta con debounce automático
- ✅ Indicador de loading integrado
- ✅ Padre controla el filtrado (no local)
- ✅ Soporte para datos adicionales en items

---

### **5. Con Renderizado Customizado (Nuevo - Heredado de Combobox)**

```typescript
<Autocomplete
  items={clients}
  value={clientId}
  onSelect={handleSelect}

  // Renderizado del item seleccionado (en el input)
  renderSelectedItem={(item) => (
    <div className="flex items-center gap-2">
      <Avatar src={item.avatar} className="h-5 w-5" />
      <span className="font-medium">{item.label}</span>
    </div>
  )}

  // Renderizado de cada item en la lista
  renderItem={(item, isSelected) => (
    <div className="flex items-center gap-3 w-full">
      <Avatar src={item.avatar} className="h-8 w-8" />
      <div className="flex-1">
        <p className="font-medium">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.email}</p>
      </div>
      {item.verified && (
        <Badge variant="success">Verificado</Badge>
      )}
    </div>
  )}
/>
```

**Casos de uso:**
- ✅ Items con múltiples campos (nombre, email, avatar)
- ✅ Badges, iconos, status indicators
- ✅ Layouts complejos

---

### **6. Con Callback Adicional `onValueSelect`**

```typescript
<Autocomplete
  items={products}
  value={productId}
  onSelect={setProductId}

  // Callback principal (siempre se ejecuta)
  onSelect={setProductId}

  // Callback adicional para lógica extra
  onValueSelect={(value) => {
    // Analytics tracking
    trackEvent('product-selected', { productId: value })

    // Prefetch datos relacionados
    prefetchProductDetails(value)

    // Log para debugging
    console.log('Selected product:', value)
  }}
/>
```

---

### **7. Con Estilos Granulares**

```typescript
<Autocomplete
  items={items}
  value={value}
  onSelect={handleSelect}

  // Contenedor principal
  className="max-w-md"

  // Input editable
  inputClassName="h-12 text-lg font-semibold border-2"

  // Popover dropdown
  popoverClassName="shadow-2xl border-primary"

  // Items individuales
  itemClassName="py-4 px-6 hover:bg-blue-50"
/>
```

---

## 🎨 Navegación por Teclado

### **Teclas Soportadas (8 teclas)**

| Tecla | Acción | Notas |
|-------|--------|-------|
| `↓ ArrowDown` | Siguiente item | Con wrap al final |
| `↑ ArrowUp` | Item anterior | Con wrap al inicio |
| `Home` | Primer item | Salto rápido (NUEVO) |
| `End` | Último item | Salto rápido (NUEVO) |
| `Enter` | Seleccionar item actual | Cierra dropdown |
| `Escape` | Cerrar dropdown | Sin seleccionar |
| `Tab` | Cerrar y siguiente campo | Navegación estándar |
| Typing | Abrir dropdown | Automático si hay texto |

### **Mejoras vs Versión Anterior**

- ✅ **Home/End** para saltos rápidos (nuevo)
- ✅ **Prevención de scroll** de página
- ✅ **Bounds checking** mejorado
- ✅ **useCallback** para optimización

---

## 🔍 Estados Visuales

### **1. Estado Normal**
```typescript
// Input sin valor
<Input placeholder="Buscar..." />

// Icono: Search (🔍)
```

### **2. Estado Loading**
```typescript
isLoading={true}

// Input deshabilitado
// Icono: Loader2 animado (⏳)
```

### **3. Estado Inválido (strictSelection)**
```typescript
strictSelection={true}
// Usuario escribe "xyz" pero no hay match

// Border: border-destructive (rojo)
// ARIA: aria-invalid="true"
```

### **4. Estado Seleccionado**
```typescript
value="client-123"

// Input muestra: selectedItem.label
// Check icon visible en el item seleccionado
```

---

## 🧪 Integration con React Hook Form

### **Patrón Estándar (Usado en el Proyecto)**

```typescript
import { useForm } from 'react-hook-form'
import { Autocomplete } from '@/components/ui/autocomplete'

function ProjectForm() {
  const form = useForm({
    defaultValues: {
      clientId: ''
    }
  })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="clientId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cliente</FormLabel>
            <FormControl>
              <Autocomplete
                items={clientItems}
                value={field.value}
                onSelect={field.onChange}  // ← Integración perfecta
                placeholder="Buscar cliente..."
                strictSelection={true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
```

**Usado en:**
- ✅ [ProjectForm.tsx:180](../../src/components/forms/ProjectForm.tsx:180) - Selección de clientes
- ✅ [AfterSaleForm.tsx](../../src/components/forms/AfterSaleForm.tsx) - Selección de proyectos

---

## 🆚 Comparación vs Otros Componentes

### **¿Cuándo usar Autocomplete vs Combobox?**

| Caso de Uso | Componente Recomendado |
|-------------|----------------------|
| **Búsqueda exploratoria** (usuario no sabe qué busca) | ✅ Autocomplete |
| **Selección rápida** (usuario sabe qué busca) | Combobox |
| **Listas grandes** (>100 items) | ✅ Autocomplete + debounce |
| **Búsquedas API remotas** | ✅ Autocomplete + onSearch |
| **Validación estricta** requerida | ✅ Autocomplete + strictSelection |
| **Multi-select** (múltiples valores) | Combobox (mejor UX) |
| **Opciones predefinidas** fijas | Combobox |

**Ejemplo del proyecto:**
- ✅ **Clientes**: Autocomplete (búsqueda exploratoria, listas grandes)
- ✅ **Proyectos**: Autocomplete (búsqueda con renderizado custom)
- ⚠️ **Estados de proyecto**: Combobox (opciones fijas predefinidas)
- ⚠️ **Países**: Combobox (lista conocida, selección rápida)

---

## 🔧 Troubleshooting

### **Problema 1: Input no se sincroniza con `value` prop**

**Síntoma:**
```typescript
// Cambias value externamente pero el input no se actualiza
setValue('new-id')  // No se refleja en el input
```

**Solución:**
El componente usa un `useEffect` para sincronizar:
```typescript
// Verifica que el item existe en la lista
const item = items.find(i => i.value === value)
// Si no existe, el input se limpia
```

**Fix:**
Asegúrate de que `value` corresponde a un `item.value` válido en la lista.

---

### **Problema 2: Búsqueda no filtra correctamente**

**Síntoma:**
```typescript
// Escribes en el input pero no se filtran los resultados
```

**Diagnóstico:**
Si usas `onSearch`, el filtrado es **responsabilidad del padre**:

```typescript
// ❌ INCORRECTO - onSearch definido pero no actualiza items
<Autocomplete
  items={staticItems}  // ← No cambia nunca
  onSearch={(query) => {
    console.log(query)  // Solo loguea, no actualiza nada
  }}
/>

// ✅ CORRECTO - Padre actualiza items
const [filteredItems, setFilteredItems] = useState(allItems)

<Autocomplete
  items={filteredItems}  // ← Se actualiza dinámicamente
  onSearch={(query) => {
    const results = allItems.filter(i =>
      i.label.includes(query)
    )
    setFilteredItems(results)
  }}
/>
```

---

### **Problema 3: Debounce no funciona**

**Síntoma:**
```typescript
// Configuraste debounceMs pero filtra inmediatamente
<Autocomplete
  debounceMs={500}
  onSearch={handleSearch}
/>
```

**Causa:**
El debounce se aplica al input interno, pero `onSearch` se ejecuta **después** del debounce.

**Comportamiento esperado:**
1. Usuario escribe "cli"
2. Espera 500ms
3. **Entonces** ejecuta `onSearch("cli")`

**Validación:**
```typescript
onSearch={(query) => {
  console.log('Searching:', query, new Date())
  // Deberías ver logs espaciados por debounceMs
}}
```

---

## 📊 Performance Tips

### **1. Usar `debounceMs` para Listas Grandes**

```typescript
// ❌ Sin debounce - 1000 re-renders al escribir
<Autocomplete
  items={tenThousandItems}
  value={value}
  onSelect={setValue}
/>

// ✅ Con debounce - ~3 re-renders al escribir
<Autocomplete
  items={tenThousandItems}
  value={value}
  onSelect={setValue}
  debounceMs={300}
/>
```

**Recomendación:**
- **0-100 items:** No usar debounce
- **100-500 items:** `debounceMs={150}`
- **500-1000 items:** `debounceMs={300}`
- **>1000 items:** Considerar `onSearch` con API

---

### **2. Memoizar `items` en el Padre**

```typescript
// ❌ items se recrea en cada render
function Parent() {
  const items = clients.map(c => ({ value: c.id, label: c.name }))

  return <Autocomplete items={items} ... />
}

// ✅ items se memoiza
function Parent() {
  const items = useMemo(
    () => clients.map(c => ({ value: c.id, label: c.name })),
    [clients]
  )

  return <Autocomplete items={items} ... />
}
```

---

### **3. Usar `onSearch` para Búsquedas API**

```typescript
// En lugar de cargar 10,000 items localmente:
const handleSearch = useCallback(async (query: string) => {
  const results = await api.search(query)  // Solo 10-20 results
  setItems(results)
}, [])

<Autocomplete
  items={items}  // Solo resultados relevantes
  onSearch={handleSearch}
  debounceMs={500}
/>
```

---

## 🔐 Accesibilidad (ARIA)

El componente implementa las especificaciones W3C para Combobox:

```typescript
<Input
  role="combobox"
  aria-autocomplete="list"
  aria-expanded={open}
  aria-controls="autocomplete-listbox"
  aria-invalid={strictSelection && !isValidInput}
/>

<CommandList
  id="autocomplete-listbox"
  role="listbox"
/>
```

**Features:**
- ✅ **Screen reader** compatible
- ✅ **Keyboard navigation** completa
- ✅ **ARIA states** correctos
- ✅ **Focus management** robusto

---

## 📚 Referencias

### **Código Fuente**
- [autocomplete.tsx](../../src/components/ui/autocomplete.tsx) - Componente principal
- [combobox.tsx](../../src/components/ui/combobox.tsx) - Componente base heredado

### **Usos en el Proyecto**
- [ProjectForm.tsx:180](../../src/components/forms/ProjectForm.tsx:180) - Selección de clientes
- [AfterSaleForm.tsx](../../src/components/forms/AfterSaleForm.tsx) - Selección de proyectos

### **Comparaciones**
- [autocomplete-vs-combobox.md](./autocomplete-vs-combobox.md) - Comparación técnica detallada

### **Testing**
- [chrome-devtools-testing.md](../testing/chrome-devtools-testing.md) - Guía de testing con Chrome DevTools MCP

### **Estándares Web**
- [W3C Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [ARIA Autocomplete](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/)

---

**Última actualización:** Octubre 2025
**Versión del componente:** 2.0
**Mantenedores:** Equipo CalReact
