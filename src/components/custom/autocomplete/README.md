# Autocomplete Component

Componente de autocompletado avanzado basado en Radix UI con funcionalidades completas.

## ✨ Features

- ✅ Búsqueda con debounce configurable
- ✅ Navegación por teclado (ArrowUp/Down, Home/End, Enter, Esc)
- ✅ Strict selection mode (validación de input)
- ✅ Loading states integrados
- ✅ Render customizable
- ✅ ARIA completo (W3C standards)
- ✅ 24 test cases (>85% coverage)

## 📦 Instalación

```bash
# Dependencias requeridas
npm install @radix-ui/react-command @radix-ui/react-popover @radix-ui/react-label
npm install clsx tailwind-merge lucide-react
```

## 🚀 Uso Básico

```tsx
import { Autocomplete } from '@/components/custom/autocomplete';

const items = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2' },
  { value: '3', label: 'Opción 3' }
];

function MyForm() {
  const [value, setValue] = React.useState('');

  return (
    <Autocomplete
      items={items}
      value={value}
      onSelect={setValue}
      placeholder="Buscar..."
    />
  );
}
```

## 🔧 Props Principales

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `items` | `AutocompleteItem[]` | `[]` | Lista de elementos |
| `value` | `string` | `undefined` | Valor seleccionado |
| `onSelect` | `(value: string) => void` | - | Callback al seleccionar |
| `placeholder` | `string` | `"Buscar..."` | Placeholder del input |
| `debounceMs` | `number` | `0` | Debounce en milisegundos |
| `strictSelection` | `boolean` | `false` | Solo valores de la lista |
| `isLoading` | `boolean` | `false` | Mostrar spinner |
| `disabled` | `boolean` | `false` | Deshabilitar componente |

## 🎯 Ejemplos Avanzados

### Con Debounce (búsqueda en API)

```tsx
<Autocomplete
  items={results}
  onSelect={setValue}
  onSearch={handleSearch}
  debounceMs={300}
  isLoading={loading}
  placeholder="Buscar productos..."
/>
```

### Con Validación Estricta

```tsx
<Autocomplete
  items={countries}
  onSelect={setCountry}
  strictSelection={true}
  placeholder="Selecciona un país"
/>
```

### Con Render Customizado

```tsx
<Autocomplete
  items={users}
  onSelect={setUser}
  renderItem={(item) => (
    <div className="flex items-center gap-2">
      <Avatar src={item.avatar} />
      <span>{item.label}</span>
    </div>
  )}
/>
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test -- autocomplete.test.tsx

# Con coverage
npm test -- autocomplete.test.tsx --coverage
```

## 📚 Documentación Completa

Ver documentación técnica completa en el proyecto CalReact original:
- `docs/technical/components/autocomplete-component.md` (660 líneas)
- `docs/technical/components/autocomplete-vs-combobox.md` (612 líneas)

## 🔗 Origen

Extraído de: CalReact
Última actualización: Octubre 2025
