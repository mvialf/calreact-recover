# Componentes Portables (Custom)

Componentes auto-contenidos diseñados para ser copiados/pegados en otros proyectos.

## 📦 Componentes Disponibles

### data-table/
Sistema completo de tabla basado en **TanStack Table** + **Shadcn/ui**.

**Características:**
- Paginación server-side ready
- Sorting multi-columna
- Filtros facetados avanzados
- Column management (mostrar/ocultar)
- Row selection
- Acciones por fila customizables

**Dependencias externas:**
```json
{
  "@tanstack/react-table": "^8.21.3",
  "@radix-ui/react-icons": "^1.3.2",
  "lucide-react": "^0.475.0"
}
```

**Componentes Shadcn/ui requeridos:**
- `button`, `input`, `popover`, `checkbox`, `dropdown-menu`, `separator`, `badge`

**Para copiar a otro proyecto:**
1. Copiar carpeta `data-table/` completa
2. Asegurar que el proyecto tenga Tailwind CSS configurado
3. Instalar dependencias listadas arriba: `npm install @tanstack/react-table @radix-ui/react-icons lucide-react`
4. Copiar componentes Shadcn/ui necesarios (si no los tienes)
5. Verificar que `cn()` utility esté disponible en el proyecto

**Uso básico:**
```typescript
import { DataTable } from '@/components/custom/data-table/data-table';
import { columns } from './columns'; // Define tus columnas

export default function MyPage() {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Buscar por nombre..."
    />
  );
}
```


---

### autocomplete/
Sistema de autocompletado avanzado basado en **Radix UI** con funcionalidades completas.

**Características:**
- Búsqueda con debounce configurable
- Navegación por teclado (ArrowUp/Down, Home/End, Enter, Esc)
- Strict selection mode (validación de input)
- Loading states integrados
- Render customizable
- ARIA completo (W3C standards)
- 24 test cases (>85% coverage)

**Dependencias externas:**
```json
{
  "@radix-ui/react-command": "^1.x",
  "@radix-ui/react-popover": "^1.x",
  "@radix-ui/react-label": "^2.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x",
  "lucide-react": "^0.x"
}
```

**Componentes Shadcn/ui incluidos:**
- `input.tsx` (22 líneas) - Ya incluido en carpeta
- `command.tsx` (159 líneas) - Ya incluido en carpeta
- `popover.tsx` (34 líneas) - Ya incluido en carpeta

**Para copiar a otro proyecto:**
1. Copiar carpeta `autocomplete/` completa
2. Asegurar que el proyecto tenga Tailwind CSS configurado
3. Instalar dependencias listadas arriba: `npm install @radix-ui/react-command @radix-ui/react-popover @radix-ui/react-label clsx tailwind-merge lucide-react`
4. Importar y usar

**Uso básico:**
```typescript
import { Autocomplete } from '@/components/custom/autocomplete';

const items = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2' }
];

<Autocomplete
  items={items}
  onSelect={(value) => console.log(value)}
  placeholder="Buscar..."
/>
```

**Features avanzados:**
- Debounce: `debounceMs={300}`
- Validación: `strictSelection={true}`
- Loading: `isLoading={loading}`
- Custom render: `renderItem={(item) => ...}`

**Documentación completa:** Ver `autocomplete/README.md` y `autocomplete/QUICK-START.md`

---

### uninstall-tags/
Sistema de gestión de tags con colores portables y validación integrada.

**Características:**
- Sistema de colores portable (18 opciones predefinidas)
- CRUD completo (crear, editar, eliminar tags)
- Validación de duplicados
- Popover para selección múltiple
- Override de colores opcional
- TypeScript types incluidos

**Dependencias externas:**
```json
{
  "@radix-ui/react-dialog": "^1.1.6",
  "@radix-ui/react-popover": "^1.1.15",
  "lucide-react": "^0.475.0"
}
```

**Componentes Shadcn/ui requeridos:**
- `button`, `input`, `badge`, `dialog`, `popover`, `label`, `separator`, `dropdown-menu`

**Para copiar a otro proyecto:**
1. Copiar carpeta `uninstall-tags/` completa (incluye `types.ts`)
2. Asegurar que el proyecto tenga Tailwind CSS configurado
3. Instalar dependencias listadas arriba: `npm install @radix-ui/react-dialog @radix-ui/react-popover lucide-react`
4. Copiar componentes Shadcn/ui necesarios (si no los tienes)
5. Verificar que `cn()` utility esté disponible en el proyecto

**Uso básico:**
```typescript
import { TagSelector } from '@/components/custom/uninstall-tags/TagSelector';
import type { UninstallTag } from '@/components/custom/uninstall-tags/types';

export default function MyForm() {
  const [selectedTags, setSelectedTags] = useState<UninstallTag[]>([]);

  return (
    <TagSelector
      selectedTags={selectedTags}
      onTagsChange={setSelectedTags}
      placeholder="Seleccionar tags..."
    />
  );
}
```

---

## 🛠️ Stack Tecnológico Requerido

Todos los componentes asumen que el proyecto tiene:

- **React** 18+
- **TypeScript** 5+
- **Tailwind CSS** 3+
- **Shadcn/ui** components (o equivalente Radix UI)

## 📋 Configuración de Tailwind

Para que los componentes funcionen correctamente, asegúrate de que tu `tailwind.config.js` incluya:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    // Si instalas como paquete npm:
    "./node_modules/@tu-usuario/custom-components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Los componentes usan variables CSS de Shadcn/ui
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... otros colores de Shadcn/ui
      }
    }
  }
}
```

## 🔧 Utilidades Compartidas

### `cn()` Function
Ambos componentes usan la función `cn()` para merge de clases Tailwind:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Instalar dependencias:**
```bash
npm install clsx tailwind-merge
```

---

## 📚 Recursos Adicionales

- **TanStack Table**: https://tanstack.com/table/latest
- **Shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **Lucide Icons**: https://lucide.dev/

---

## 🆕 Agregar Nuevos Componentes

Para agregar un nuevo componente portable a esta carpeta:

1. **Verificar dependencias mínimas**: El componente no debe depender de servicios Firebase, contextos específicos del proyecto, o lógica de negocio
2. **Documentar en este README**: Agregar sección con dependencias, uso básico, y pasos para copiar
3. **Incluir types**: Si el componente tiene tipos específicos, incluirlos en el mismo directorio
4. **Probar portabilidad**: Copiar a proyecto de prueba para verificar que funciona sin modificaciones

---

**Última actualización:** Octubre 2025
**Mantenedor:** CalReact Team
