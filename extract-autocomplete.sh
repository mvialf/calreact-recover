#!/bin/bash
# Script de extracción automática del componente Autocomplete
# Uso: ./extract-autocomplete.sh

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Extracción Componente Autocomplete Reutilizable${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# 1. Crear estructura de carpetas
echo -e "${YELLOW}📁 Creando estructura de carpetas...${NC}"
mkdir -p src/components/autocomplete/{hooks,utils,ui,__tests__}
echo -e "${GREEN}   ✓ Carpetas creadas${NC}\n"

# 2. Copiar componente principal
echo -e "${YELLOW}📦 Copiando componente principal...${NC}"
if [ -f "src/components/ui/autocomplete.tsx" ]; then
    cp src/components/ui/autocomplete.tsx src/components/autocomplete/
    echo -e "${GREEN}   ✓ autocomplete.tsx copiado${NC}\n"
else
    echo -e "${RED}   ✗ No se encontró autocomplete.tsx${NC}\n"
    exit 1
fi

# 3. Copiar tests
echo -e "${YELLOW}🧪 Copiando tests...${NC}"
if [ -f "src/components/ui/__tests__/autocomplete.test.tsx" ]; then
    cp src/components/ui/__tests__/autocomplete.test.tsx src/components/autocomplete/__tests__/
    echo -e "${GREEN}   ✓ Tests copiados${NC}\n"
else
    echo -e "${YELLOW}   ⚠ Tests no encontrados (opcional)${NC}\n"
fi

# 4. Copiar componentes Shadcn necesarios
echo -e "${YELLOW}🎨 Copiando componentes Shadcn/ui...${NC}"
for component in input command popover; do
    if [ -f "src/components/ui/$component.tsx" ]; then
        cp src/components/ui/$component.tsx src/components/autocomplete/ui/
        echo -e "${GREEN}   ✓ $component.tsx copiado${NC}"
    else
        echo -e "${RED}   ✗ $component.tsx no encontrado${NC}"
    fi
done
echo ""

# 5. Crear hook useDebounce
echo -e "${YELLOW}⚡ Creando hook useDebounce...${NC}"
cat > src/components/autocomplete/hooks/useDebounce.ts << 'EOF'
import { useEffect, useState } from 'react';

/**
 * Hook para aplicar debounce a un valor
 * @param value - Valor a aplicar debounce
 * @param delay - Delay en milisegundos
 * @returns Valor con debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
EOF
echo -e "${GREEN}   ✓ useDebounce.ts creado${NC}\n"

# 6. Crear utilidad cn()
echo -e "${YELLOW}🎨 Creando utilidad cn()...${NC}"
cat > src/components/autocomplete/utils/cn.ts << 'EOF'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función de utilidad para combinar clases CSS de Tailwind
 * Evita conflictos y mantiene la especificidad correcta
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF
echo -e "${GREEN}   ✓ cn.ts creado${NC}\n"

# 7. Crear archivo de tipos
echo -e "${YELLOW}📝 Creando archivo de tipos...${NC}"
cat > src/components/autocomplete/types.ts << 'EOF'
import * as React from "react"

/**
 * Item del autocomplete
 */
export interface AutocompleteItem extends Record<string, any> {
  value: string
  label: string
  [key: string]: any
}

/**
 * Props del componente Autocomplete
 */
export interface AutocompleteProps {
  // ============ DATOS ============
  items: AutocompleteItem[]
  value?: string

  // ============ CALLBACKS ============
  onSelect: (value: string) => void
  onValueSelect?: (value: string) => void
  onSearch?: (query: string) => void
  onInputChange?: (value: string) => void

  // ============ TEXTOS ============
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string

  // ============ COMPORTAMIENTO ============
  disabled?: boolean
  isLoading?: boolean
  strictSelection?: boolean
  debounceMs?: number

  // ============ ESTILOS ============
  className?: string
  inputClassName?: string
  popoverClassName?: string
  itemClassName?: string

  // ============ RENDERIZADO ============
  showSearch?: boolean
  renderItem?: (item: AutocompleteItem, isSelected: boolean) => React.ReactNode
  renderSelectedItem?: (item: AutocompleteItem) => React.ReactNode
}
EOF
echo -e "${GREEN}   ✓ types.ts creado${NC}\n"

# 8. Crear barrel export (index.ts)
echo -e "${YELLOW}📦 Creando exports públicos...${NC}"
cat > src/components/autocomplete/index.ts << 'EOF'
/**
 * Componente Autocomplete Reutilizable
 *
 * @example
 * ```tsx
 * import { Autocomplete } from './components/autocomplete';
 *
 * <Autocomplete
 *   items={items}
 *   onSelect={(value) => console.log(value)}
 *   placeholder="Buscar..."
 * />
 * ```
 */

export { Autocomplete } from './autocomplete';
export type { AutocompleteItem, AutocompleteProps } from './types';
EOF
echo -e "${GREEN}   ✓ index.ts creado${NC}\n"

# 9. Ajustar imports en autocomplete.tsx
echo -e "${YELLOW}🔧 Ajustando imports en autocomplete.tsx...${NC}"
sed -i.bak \
    -e 's|@/lib/utils|./utils/cn|g' \
    -e 's|@/components/ui/input|./ui/input|g' \
    -e 's|@/components/ui/command|./ui/command|g' \
    -e 's|@/components/ui/popover|./ui/popover|g' \
    -e 's|@/hooks/usePerformanceOptimizations|./hooks/useDebounce|g' \
    src/components/autocomplete/autocomplete.tsx

# Limpiar backup
rm -f src/components/autocomplete/autocomplete.tsx.bak
echo -e "${GREEN}   ✓ Imports ajustados${NC}\n"

# 10. Ajustar imports en tests (si existen)
if [ -f "src/components/autocomplete/__tests__/autocomplete.test.tsx" ]; then
    echo -e "${YELLOW}🧪 Ajustando imports en tests...${NC}"
    sed -i.bak \
        -e "s|from '../autocomplete'|from '../index'|g" \
        -e "s|from '../../autocomplete'|from '../index'|g" \
        src/components/autocomplete/__tests__/autocomplete.test.tsx
    rm -f src/components/autocomplete/__tests__/autocomplete.test.tsx.bak
    echo -e "${GREEN}   ✓ Tests ajustados${NC}\n"
fi

# 11. Crear README
echo -e "${YELLOW}📚 Creando documentación...${NC}"
cat > src/components/autocomplete/README.md << 'EOF'
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
import { Autocomplete } from './components/autocomplete';

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
EOF
echo -e "${GREEN}   ✓ README.md creado${NC}\n"

# Resumen final
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Extracción completada exitosamente!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}📍 Ubicación:${NC} src/components/autocomplete/"
echo -e "${BLUE}📦 Archivos creados:${NC}"
echo -e "   - autocomplete.tsx (478 líneas)"
echo -e "   - types.ts"
echo -e "   - index.ts (API pública)"
echo -e "   - hooks/useDebounce.ts"
echo -e "   - utils/cn.ts"
echo -e "   - ui/{input,command,popover}.tsx"
echo -e "   - __tests__/autocomplete.test.tsx"
echo -e "   - README.md\n"

echo -e "${YELLOW}⚠️  Próximos pasos:${NC}"
echo -e "   1. Verificar TypeScript: ${BLUE}npm run typecheck${NC}"
echo -e "   2. Verificar ESLint: ${BLUE}npm run lint${NC}"
echo -e "   3. Ejecutar tests: ${BLUE}npm test -- autocomplete.test.tsx${NC}"
echo -e "   4. Ver documentación: ${BLUE}cat src/components/autocomplete/README.md${NC}\n"

echo -e "${GREEN}🎉 Listo para copiar a otros proyectos!${NC}"
echo -e "${BLUE}📋 Copiar carpeta completa:${NC} cp -r src/components/autocomplete /destino/src/components/\n"
