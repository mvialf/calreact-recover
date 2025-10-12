# 🏷️ Uninstall Tags System

Sistema completo de gestión de etiquetas (tags) para desinstalación con UI estilo Trello. Incluye selector con popover, modales de creación/edición, y sistema de colores personalizables con abreviaturas automáticas.

**Total:** 878 líneas de código | **Stack:** React 18 + TypeScript + Tailwind CSS + Radix UI

---

## 📦 Componentes

### `<TagSelector />`
Componente principal de selección de tags con interfaz estilo Trello.

- **UI Pattern:** Popover (Radix UI)
- **Features:** Selección múltiple, creación inline, edición contextual, drag-free UX
- **Estado:** Controlado con estado temporal para mejor UX

### `<TagBadge />`
Badge visual con colores personalizados del design system.

- **Variantes:** 9 colores predefinidos + sistema extensible
- **Features:** Abreviatura automática, removible (opcional), responsive
- **Accesibilidad:** Contraste WCAG AA compliant

### `<CreateTagModal />`
Modal para crear nuevas tags con preview en tiempo real.

- **Validación:** Nombre único, abreviatura automática (2 letras)
- **UX:** Preview live del badge, selector de color visual, auto-generación de abreviatura
- **Persistencia:** Integración con Firebase (opcional)

### `<EditTagModal />`
Modal para editar tags existentes.

- **Features:** Edición de nombre, color y abreviatura
- **Validación:** Previene nombres duplicados (excepto el mismo tag)
- **Preview:** Vista previa en tiempo real del badge actualizado

---

## 🚀 Quick Start

### Instalación Básica (Sin Firebase)

```tsx
import { TagSelector, TagBadge, type Tag } from '@/components/uninstall-tags';
import { useState } from 'react';

function MyForm() {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const availableTags: Tag[] = [
    { id: '1', name: 'Cortina', color: 'sky', abbreviation: 'CO' },
    { id: '2', name: 'Persiana', color: 'complete', abbreviation: 'PE' },
  ];

  return (
    <TagSelector
      selectedTags={selectedTags}
      availableTags={availableTags}
      onTagsChange={setSelectedTags}
      placeholder="Seleccionar elementos a desinstalar..."
      label="Tags de Desinstalación"
    />
  );
}
```

### Con Firebase Integration (Proyecto CalReact)

```tsx
import { TagSelector } from '@/components/uninstall-tags';
import { useUninstallTags } from '@/hooks/useUninstallTags';

function ProjectForm() {
  const {
    availableTags,
    selectedTags,
    setSelectedTags,
    createTag,
    editTag,
    deleteTag,
    loading,
  } = useUninstallTags();

  return (
    <TagSelector
      selectedTags={selectedTags}
      availableTags={availableTags}
      onTagsChange={setSelectedTags}
      onCreateTag={createTag}
      onEditTag={editTag}
      onDeleteTag={deleteTag}
      placeholder="Seleccionar tags..."
    />
  );
}
```

### Display Only (TagBadge)

```tsx
import { TagBadge } from '@/components/uninstall-tags';

function EventSummary({ tags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <TagBadge key={tag.id} tag={tag} />
      ))}
    </div>
  );
}
```

---

## 📋 Props API

### TagSelector

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `selectedTags` | `Tag[]` | ✅ | - | Tags actualmente seleccionadas |
| `availableTags` | `Tag[]` | ✅ | - | Tags disponibles para seleccionar |
| `onTagsChange` | `(tags: Tag[]) => void` | ✅ | - | Callback al cambiar selección |
| `onCreateTag` | `(name: string, color: TagColor, abbreviation: string) => void` | ❌ | - | Callback para crear tag (habilita botón crear) |
| `onEditTag` | `(tagId: string, name: string, color: TagColor, abbreviation: string) => void` | ❌ | - | Callback para editar tag |
| `onDeleteTag` | `(tagId: string) => void` | ❌ | - | Callback para eliminar tag |
| `placeholder` | `string` | ❌ | `"Seleccionar etiquetas..."` | Texto del trigger |
| `label` | `string` | ❌ | - | Label opcional sobre el selector |
| `className` | `string` | ❌ | - | Clases CSS adicionales |

### TagBadge

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `tag` | `Tag` | ✅ | - | Tag a mostrar |
| `removable` | `boolean` | ❌ | `false` | Si muestra botón de eliminar |
| `onRemove` | `(tagId: string) => void` | ❌ | - | Callback al eliminar (requiere `removable: true`) |
| `className` | `string` | ❌ | - | Clases CSS adicionales |

### Tag Interface

```typescript
interface Tag {
  id: string;
  name: string;
  color: TagColor;
  abbreviation?: string; // 2 letras (ej: "CO" para Cortina)
  createdAt?: Date;
}

type TagColor =
  | 'yellow' | 'sky' | 'orange' | 'brown'
  | 'complete' | 'purple' | 'primary'
  | 'secondary' | 'destructive';
```

---

## 🎨 Sistema de Colores

### Colores Portables (DEFAULT) ✅

El sistema usa **colores Tailwind estándar por defecto** para máxima portabilidad:

| Color | Label (ES) | Uso Sugerido | Clases Tailwind |
|-------|------------|--------------|-----------------|
| `yellow` | Amarillo | Advertencia, En proceso | `bg-yellow-100 text-yellow-900` |
| `sky` | Azul Cielo | Información, Agua | `bg-sky-200 text-sky-950` |
| `orange` | Naranja | Urgente, Eléctrico | `bg-orange-500 text-white` |
| `brown` | Marrón | Madera, Materiales | `bg-orange-950 text-white` |
| `complete` | Verde | Completado, Exitoso | `bg-green-400 text-white` |
| `purple` | Morado | Especial, Premium | `bg-purple-600 text-white` |
| `primary` | Primario | Default del tema | `bg-primary text-primary-foreground` |
| `secondary` | Secundario | Neutro, Secundario | `bg-secondary text-secondary-foreground` |
| `destructive` | Rojo | Error, Eliminar | `bg-destructive text-destructive-foreground` |

**✅ Ventajas:**
- **Portabilidad 10/10:** Funciona out-of-the-box en cualquier proyecto con Tailwind
- **Cero configuración:** No requiere definir variables CSS
- **Mantenimiento:** Actualizaciones de Tailwind se aplican automáticamente

### Personalización de Colores

#### Opción 1: Override Inline (Portable)

```tsx
import { TagBadge, DEFAULT_TAG_COLORS } from '@/components/uninstall-tags';

// Usar colores por defecto (portable)
<TagBadge tag={tag} />

// Override con colores personalizados
<TagBadge
  tag={tag}
  colorOverride={{
    bg: 'bg-pink-400',
    text: 'text-white',
    border: 'border-pink-600'
  }}
/>
```

#### Opción 2: Variables CSS (Backward Compatibility)

Para integrar con design system existente usando `globals.css`:

```tsx
import { TagBadge, CSS_VAR_TAG_COLORS } from '@/components/uninstall-tags';

// Usar variables CSS del proyecto
<TagBadge
  tag={tag}
  colorOverride={CSS_VAR_TAG_COLORS[tag.color]}
/>
```

**Requiere definir en `globals.css`:**
```css
:root {
  --yellow: 48 96% 53%;
  --yellow-foreground: 26 83% 14%;
  --Sky: 199 89% 48%;
  --Sky-foreground: 210 40% 98%;
  /* ... otros colores */
}
```

#### Opción 3: Agregar Nuevos Colores (Extensibilidad)

1. **Extender tipo** en `src/types/tags.ts`:
```typescript
export type TagColor =
  | 'yellow' | 'sky' | /* ... otros */
  | 'custom-color'; // ← Nuevo color
```

2. **Agregar a DEFAULT_TAG_COLORS:**
```typescript
export const DEFAULT_TAG_COLORS: Record<TagColor, ColorClasses> = {
  // ... colores existentes
  'custom-color': {
    bg: 'bg-pink-400',
    text: 'text-white',
    border: 'border-pink-600'
  }
};
```

3. **Agregar label en español:**
```typescript
export const AVAILABLE_TAG_COLORS = [
  // ... colores existentes
  { color: 'custom-color', label: 'Rosa Personalizado' }
];
```

---

## 🔧 Integración con Hooks

### Hook Base: `useTags` (Sin persistencia)

Hook genérico para lógica de selección de tags **sin** integración con backend.

```tsx
import { useTags } from '@/hooks/useTags';

const {
  selectedTags,
  selectTag,
  unselectTag,
  toggleTag,
  isTagSelected,
  clearSelectedTags
} = useTags({
  initialTags: availableTags,
  initialSelected: []
});
```

**Casos de uso:**
- Formularios locales sin persistencia
- Prototipado rápido
- Testing y mocks

### Hook Extendido: `useUninstallTags` (Con Firebase)

Hook completo con operaciones CRUD en Firebase.

```tsx
import { useUninstallTags } from '@/hooks/useUninstallTags';

const {
  availableTags,      // Tags desde Firebase
  selectedTags,       // Selección local
  createTag,          // Crear en Firebase
  editTag,            // Editar en Firebase
  deleteTag,          // Eliminar en Firebase
  loading,            // Estado de carga
  error,              // Errores
  refreshTags         // Re-fetch manual
} = useUninstallTags({ initialSelected: [] });
```

**Features:**
- Auto-fetch al montar componente
- Manejo de errores centralizado
- Actualización optimista opcional
- Sincronización automática post-CRUD

---

## 🏗️ Arquitectura y Decisiones Técnicas

### Por qué Popover en lugar de Dialog

✅ **Ventajas del Popover:**
- **UX superior:** No bloquea pantalla completa, usuario mantiene contexto
- **Workflow fluido:** Crear/editar tags sin perder vista del formulario principal
- **Mobile-friendly:** Ocupa menos espacio, mejor para pantallas pequeñas
- **Accesibilidad:** Focus trap automático, Escape key integrado

❌ **Cuándo NO usar Popover:**
- Formularios complejos con >10 campos (usar Dialog/Modal)
- Procesos multi-paso (wizards)
- Confirmaciones críticas (usar AlertDialog)

### Sistema de Abreviaturas

**Lógica automática:**
1. **Input del usuario:** Nombre del tag (ej: "Cortina")
2. **Auto-generación:** Primeras 2 letras uppercase (ej: "CO")
3. **Validación:** Usuario puede editar abreviatura manualmente
4. **Persistencia:** Se guarda en Firebase junto al tag

**Beneficios:**
- **UI compacta:** Badges pequeños muestran abreviatura en lugar del nombre completo
- **Escaneo rápido:** Usuario identifica tags visualmente por color + abreviatura
- **Escalabilidad:** Funciona con 50+ tags sin saturar UI

**Ejemplo de uso en EventViewDialog:**
```tsx
// Muestra "CO PE TO" en lugar de "Cortina Persiana Toldo"
{tags.map(tag => (
  <TagBadge key={tag.id} tag={tag} />
))}
```

### Estado Temporal en TagSelector

**Problema resuelto:**
- Usuario abre popover → selecciona 5 tags → cierra popover sin "Aceptar"
- ❌ **Sin estado temporal:** Tags se aplican inmediatamente (UX pobre)
- ✅ **Con estado temporal:** Solo se aplican al hacer clic en "Aceptar"

**Implementación:**
```tsx
// Estado temporal sincronizado con selectedTags
const [tempSelectedTags, setTempSelectedTags] = useState<Tag[]>([]);

React.useEffect(() => {
  if (isOpen) {
    setTempSelectedTags([...selectedTags]); // Clone al abrir
  }
}, [isOpen, selectedTags]);

// Solo actualiza al confirmar
const handleAccept = () => {
  onTagsChange(tempSelectedTags);
  setIsOpen(false);
};
```

### Integración con React Hook Form

**Pattern recomendado:**
```tsx
import { useForm, Controller } from 'react-hook-form';

const form = useForm<FormData>();

<Controller
  control={form.control}
  name="uninstallTags"
  render={({ field }) => (
    <TagSelector
      selectedTags={field.value || []}
      availableTags={availableTags}
      onTagsChange={field.onChange}
    />
  )}
/>
```

---

## 🧪 Testing

### Mocks Disponibles

**Test helpers en** `src/__tests__/helpers/uninstall-tags-helpers.ts`:

```typescript
import {
  mockUninstallTags,           // 3 tags de prueba
  createMockUseUninstallTags,  // Mock del hook
  createTestUninstallTag,      // Factory individual
  createTestUninstallTags,     // Factory array
} from '@/__tests__/helpers/uninstall-tags-helpers';

// Usar en tests
const mockHook = createMockUseUninstallTags();
jest.mock('@/hooks/useUninstallTags', () => ({
  useUninstallTags: () => mockHook
}));
```

### Ejemplo de Test Unitario

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TagSelector } from '@/components/uninstall-tags';

describe('TagSelector', () => {
  it('debe mostrar tags disponibles al abrir popover', async () => {
    const mockTags = [
      { id: '1', name: 'Cortina', color: 'sky', abbreviation: 'CO' }
    ];

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockTags}
        onTagsChange={jest.fn()}
      />
    );

    // Abrir popover
    fireEvent.click(screen.getByRole('button'));

    // Verificar tag visible
    expect(screen.getByText('Cortina')).toBeInTheDocument();
  });
});
```

### Test de Integración con Hook

Ver ejemplos completos en:
- `src/components/forms/__tests__/ProjectForm.uninstallTags.test.tsx` - Integración completa
- `src/components/forms/__tests__/ProjectForm.uninstallTags.simplified.test.tsx` - Mocks simplificados

---

## 📦 Extracción a Librería NPM

### Dependencias Requeridas

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@radix-ui/react-popover": "^1.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### Archivos a Incluir

```
uninstall-tags-package/
├── src/
│   ├── TagSelector.tsx
│   ├── TagBadge.tsx
│   ├── CreateTagModal.tsx
│   ├── EditTagModal.tsx
│   ├── index.ts
│   └── types.ts              ← Mover desde @/types/tags
├── hooks/
│   ├── useTags.ts           ← Hook base (sin Firebase)
│   └── index.ts
├── styles/
│   └── globals.css          ← Variables CSS necesarias
├── package.json
├── tsconfig.json
└── README.md                ← Este archivo
```

### Configuración de CSS Variables

**Tailwind config personalizado:**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'tag-yellow': 'hsl(var(--yellow))',
        'tag-sky': 'hsl(var(--Sky))',
        // ... otros colores
      }
    }
  }
}
```

**Incluir en CSS global:**
```css
/* styles/globals.css */
@layer base {
  :root {
    --yellow: 48 96% 53%;
    --yellow-foreground: 26 83% 14%;
    --Sky: 199 89% 48%;
    --Sky-foreground: 210 40% 98%;
    /* ... otros colores del sistema */
  }
}
```

---

## 🐛 Common Issues & Troubleshooting

### Issue: Tags no se muestran con colores correctos

**Causa:** Variables CSS no definidas en `globals.css`

**Solución:**
```css
/* Verificar que existan en globals.css */
:root {
  --yellow: 48 96% 53%;
  --Sky: 199 89% 48%;
  /* ... etc */
}
```

### Issue: Abreviaturas duplicadas

**Causa:** Auto-generación usa primeras 2 letras, puede coincidir (ej: "Cortina" y "Cobre" → "CO")

**Solución:** Usuario puede editar manualmente la abreviatura en CreateTagModal

### Issue: Popover no se cierra al hacer clic fuera

**Causa:** Conflicto con otros Popovers/Dialogs abiertos (Dialog anidado)

**Solución:** Migrar a arquitectura no anidada o usar `modal={false}` en Popover:
```tsx
<Popover modal={false}>
  {/* contenido */}
</Popover>
```

### Issue: Tags seleccionadas se pierden al re-renderizar

**Causa:** `selectedTags` no controlado correctamente por componente padre

**Solución:** Usar estado persistente en el padre:
```tsx
const [tags, setTags] = useState<Tag[]>([]);

<TagSelector
  selectedTags={tags}
  onTagsChange={setTags}  // ← Actualiza estado padre
/>
```

---

## 📝 Roadmap y Mejoras Futuras

### v2.0 (Planned)

- [ ] **Multi-select por teclado:** Shift+Click para rangos, Ctrl+Click individual
- [ ] **Búsqueda/Filtrado:** Input para buscar tags por nombre
- [ ] **Drag & Drop:** Reordenar tags seleccionadas
- [ ] **Tags anidadas:** Sistema de tags con categorías (tags padre/hijo)
- [ ] **Tema personalizable:** Props para override de colores sin modificar CSS

### v2.1 (Ideas)

- [ ] **Export/Import:** Exportar tags a JSON/CSV
- [ ] **Tags sugeridas:** ML para sugerir tags basado en contexto
- [ ] **Historial:** Ver tags usadas recientemente
- [ ] **Shortcuts:** Comandos de teclado (Ctrl+T para abrir, etc.)

---

## 📄 Licencia y Créditos

**Proyecto:** CalReact (Cobralon-FB)
**Autor:** Sistema de Uninstall Tags
**Stack:** React 18 + TypeScript + Tailwind CSS + Radix UI
**Patrón de diseño:** Inspirado en Trello tags system
**Fecha de creación:** Octubre 2025

---

## 🤝 Contribuciones

Para contribuir a este sistema:

1. **Reportar bugs:** Crear issue con reproducción mínima
2. **Nuevos colores:** Proponer en issue antes de PR
3. **Mejoras UX:** Mockups requeridos para cambios visuales
4. **Tests:** Toda nueva feature requiere tests unitarios

**Code style:** Seguir patrones establecidos en el proyecto CalReact.
