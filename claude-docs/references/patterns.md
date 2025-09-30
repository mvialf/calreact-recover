# 🎨 Patrones de Código Establecidos - CalReact

## 🏗️ Arquitectura de Eventos por Dominio

### ✅ Servicios de Eventos Específicos (IMPLEMENTADO)
```typescript
// ✅ CORRECTO - Eventos específicos por dominio
import { createProjectEvent } from '@/services/projectEventService';

// ❌ INCORRECTO - Sistema general deprecated
import { createEvent } from '@/services/eventService'; // NO EXISTE
```

**Servicios disponibles:**
- `projectEventService.ts` - Eventos de proyecto (implementado)
- `projectEventServiceV2.ts` - Versión optimizada con cache  
- `afterSalesEventService.ts` - Para eventos postventa  
- `visitEventService.ts` - Para eventos de visita

### 🗄️ Sistema de Cache Inteligente
```typescript
// ✅ IMPLEMENTADO - Sistema de cache para eventos de proyecto (EN USO)
import { projectCacheService } from '@/services/cache/projectCacheService';
import { eventEnrichmentService } from '@/services/eventEnrichmentService';
```

## 📅 Calendar Event Rendering Pattern (IMPLEMENTADO - Sept 2025)

### Registry Pattern para Renderizado de Eventos
```typescript
// ✅ PATRÓN OBLIGATORIO - Registry Pattern con CalendarEventCard

// 1. Uso del componente (auto-selecciona renderer correcto)
import { CalendarEventCard } from '@/components/calendar/CalendarEventCard';

<CalendarEventCard
  event={event}         // EventType con campo 'type'
  view="month"          // 'month' | 'week' | 'day'
  onClick={handleClick}
  enableDragAndDrop={true}
/>

// 2. Estructura del Registry (event-renderers/index.ts)
export const EVENT_RENDERERS = {
  'project': ProjectEventRenderer,
  'visit': VisitEventRenderer,      // Extensión futura
  'afterSales': AfterSalesRenderer  // Extensión futura
} as const;

// 3. Crear nuevo renderer (type-safe)
export const NewEventRenderer: EventRenderer = ({
  event,
  view,
  onClick
}) => {
  return (
    <div onClick={() => onClick?.(event)}>
      {/* Renderizado específico del tipo */}
    </div>
  );
};
```

### Beneficios del Registry Pattern
- **Open/Closed Principle**: Extensible sin modificar código existente
- **Type-Safety**: TypeScript garantiza implementación correcta
- **Mantenibilidad**: Cada tipo en su propio archivo
- **Escalabilidad**: Agregar tipos sin tocar componente base

### Arquitectura de Archivos
```
src/components/calendar/
├── CalendarEventCard.tsx         # ← Componente principal (punto de entrada)
├── event-renderers/
│   ├── index.ts                  # ← Registry central
│   ├── types.ts                  # ← Tipos compartidos
│   ├── ProjectEventRenderer.tsx  # ← Renderer específico
│   ├── VisitEventRenderer.tsx    # ← Futura extensión
│   └── AfterSalesRenderer.tsx    # ← Futura extensión
```

### ❌ Anti-Pattern Eliminado (Legacy)
```typescript
// ❌ NO USAR - Componente legacy eliminado (Sept 2025)
import { CalendarEvent } from '@/components/calendar/calendar-event';

// El componente calendar-event.tsx fue eliminado completamente.
// Migración completada en commit dacf602 (Fase 1-3)
// Limpieza final en commit [Fase 4]
```

## 🔥 Servicios Firebase (Patrón Establecido)

### Utilidades Centralizadas Obligatorias
```typescript
// ✅ USAR SIEMPRE - Utilidades centralizadas
import { 
  docSnapshotToEntity,
  docSnapshotsToEntities,
  prepareDataForFirestore,
  timestampToDate 
} from '@/utils/firestore-helpers';
```

### Patrón de Servicios Firebase
```typescript
// ✅ PATRÓN ESTÁNDAR para servicios
export const operacion = async (
  firestore: Firestore, 
  parametros: TipoParam
): Promise<TipoReturn> => {
  // Usar utilidades centralizadas
  return docSnapshotsToEntities(docs, convertDocument);
};
```

### Colecciones Principales
```typescript
// Colecciones establecidas en Firestore
const COLLECTIONS = {
  projects: 'projects',           // Proyectos principales
  projectEvents: 'projectEvents', // Eventos específicos de proyecto
  clients: 'clients',             // Información clientes con auto-sync
  payments: 'payments',           // Pagos asociados a proyectos
  afterSales: 'afterSales'        // Servicios postventa
} as const;
```

## 🗺️ Google Places Integration (ACTUALIZADO)

### PlacesServiceAdapter (Nueva Implementación)
```typescript
// ✅ NUEVO PATRÓN - PlacesServiceAdapter personalizado
import { PlacesServiceAdapter } from '@/lib/places/PlacesServiceAdapter';

// Uso recomendado
const placesService = new PlacesServiceAdapter({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  useModernAPI: true
});
```

### Hook Personalizado para Places
```typescript
// ✅ Hook disponible en el proyecto
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

// En componentes
const { suggestions, loading, fetchSuggestions } = useGooglePlaces({
  sessionToken: true,
  region: 'es'
});
```

## 📋 Componentes y Formularios

### Patrón Compound Component
```typescript
// ✅ PATRÓN ESTABLECIDO - Compound Component Pattern
// Ejemplo: ProjectFormCompound
const ProjectForm = {
  Container: ProjectFormContainer,
  Section: ProjectFormSection,
  Field: ProjectFormField
};
```

### Formularios con React Hook Form + Zod
```typescript
// ✅ PATRÓN OBLIGATORIO para formularios
const form = useForm<SchemaType>({
  resolver: zodResolver(schema),
  defaultValues: { /* valores iniciales */ }
});

// Validación numérica estándar
const numericValue = parseInt(value) || 0;
const floatValue = parseFloat(value) || 0;
```

### Manejo de Errores Estándar
```typescript
// ✅ PATRÓN para manejo de errores
try {
  // Operación
} catch (error) {
  useToast({
    title: "Error",
    description: error.message || "Error inesperado",
    variant: "destructive"
  });
}
```

## 🎨 Centralización de Estilos (OBLIGATORIO)

### Fuente Única de Verdad
Los estilos (colores, espaciado, fuentes) deben provenir **únicamente** de:
- `tailwind.config.js` - Extensiones de tema personalizadas
- `src/app/globals.css` - Variables CSS globales (52 tokens disponibles)

```typescript
// ✅ USAR SIEMPRE - Tokens del design system
className="bg-primary text-primary-foreground"
className="text-muted-foreground text-sm"
className="border border-border rounded-md"

// ❌ PROHIBIDO - Valores hardcodeados
className="bg-[#3b82f6] text-[14px] top-[13px]"
className="border-[#e5e7eb] rounded-[6px]"
style={{ backgroundColor: '#3b82f6', fontSize: '14px' }}
```

### Excepciones Permitidas (con justificación)
```typescript
// ✅ Componentes Shadcn/ui generados (mantener como están)
// Los componentes de shadcn/ui pueden incluir valores hardcodeados internos

// ✅ Cálculos dinámicos específicos
style={{ maxHeight: 'calc(100vh - 200px)' }} // Dynamic viewport calculation
style={{ transform: `translateX(${position}px)` }} // Dynamic positioning

// ✅ Valores únicos no reutilizables (con comentario explicativo)
/* EXCEPTION: One-time positioning for specific modal overlay */
className="top-[13px] left-[50%]"

/* EXCEPTION: Component-specific z-index for layering */
style={{ zIndex: 9999 }}
```

### Proceso Obligatorio para Nuevos Valores
1. **¿Existe token similar?** → Usar existente de `globals.css` o Tailwind
2. **¿Se reutilizará en 2+ lugares?** → Añadir a `globals.css` como variable CSS
3. **¿Es cálculo dinámico?** → Documentar y usar `style` attribute
4. **¿Es única vez no reutilizable?** → Justificar con comentario explicativo

```css
/* Ejemplo: Añadir nuevos tokens a globals.css */
:root {
  --spacing-custom: 1.75rem;
  --header-height: 4rem;
  --sidebar-width: 16rem;
}
```

## 🎨 UI Components (Shadcn/ui)

### Importaciones Estándar
```typescript
// ✅ USAR SIEMPRE - Componentes Shadcn existentes
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

// ❌ EVITAR - Crear componentes UI desde cero
```

### Clases Condicionales
```typescript
// ✅ Usar clsx o cn para clases condicionales
import { cn } from "@/lib/utils";

const className = cn(
  "base-classes",
  condition && "conditional-class",
  variant === "primary" && "primary-classes"
);
```

## 🔧 Hooks Personalizados

### Patrones de Hooks Establecidos
```typescript
// Hook para operaciones Firebase
const useFirebaseOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const execute = async (operation: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { execute, loading, error };
};
```

## 🏗️ Modal-Form Integration Pattern (ACTUALIZADO)

### Problema de Duplicación Resuelto
```typescript
// ❌ EVITAR - Duplicación de botones (PROBLEMA IDENTIFICADO)
<ModalLayout showDefaultButtons={true}>
  <ProjectForm showDefaultButtons={true} /> {/* DUPLICACIÓN */}
</ModalLayout>

// ✅ USAR - Modal-Controlled Pattern (SOLUCIÓN IMPLEMENTADA)
<ModalLayout formId="project-form" submitButtonText="Crear Proyecto">
  <ProjectForm formId="project-form" showDefaultButtons={false} />
</ModalLayout>
```

### Patrón Estándar para Modales
```typescript
// ✅ PATRÓN OBLIGATORIO para nuevos modales
export function NewEntityDialog() {
  return (
    <ModalLayout
      formId="new-entity-form"           // ← ID único
      title="Nueva Entidad"
      submitButtonText="Crear Entidad"
    >
      <EntityForm
        formId="new-entity-form"          // ← Mismo ID
        showDefaultButtons={false}       // ← Sin duplicación
        onSubmit={handleCreate}
      />
    </ModalLayout>
  );
}
```

### Formularios Optimizados para Modales
```typescript
// ✅ PATRÓN para formularios reutilizables
export function EntityForm({
  formId = 'entity-form',
  showDefaultButtons = false,        // ← Default false para modales
  // ... otras props
}: EntityFormProps) {
  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campos del formulario */}

        {/* Botones solo cuando se requieren */}
        {showDefaultButtons && (
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {submitButtonText}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
```

### Casos de Uso Específicos
```typescript
// ✅ Modal simple (caso más común)
<ModalLayout formId="simple-form">
  <SimpleForm formId="simple-form" showDefaultButtons={false} />
</ModalLayout>

// ✅ Formulario standalone (en páginas)
<SimpleForm showDefaultButtons={true} />

// ✅ Modal complejo (casos especiales)
<ModalLayout buttonStrategy="none">
  <CustomContent />
  <CustomButtons />
</ModalLayout>
```

### Documentación Técnica Completa
- **Arquitectura detallada:** [modal-architecture.md](../../docs/technical/modal-architecture.md)
- **Plan de implementación:** [modal-refactoring-plan.md](../../docs/technical/modal-refactoring-plan.md)

## 🧪 Testing Patterns

**Para patrones completos de testing:** [testing.md](../workflow/testing.md)

**Principios básicos:** `getByRole` > `getByText` > `getByTestId`

## 📊 Feature Flags System

### Configuración de Features (DISPONIBLE)
```typescript
// ✅ Sistema de feature flags implementado
import { featureFlags } from '@/lib/config/featureFlags';

// Uso en componentes
if (featureFlags.useNewProjectEventForm) {
  return <NewProjectEventModalV2 />;
}
```

## 🚫 Anti-Patrones (EVITAR)

### ❌ Patrones Deprecados o Prohibidos
```typescript
// ❌ NO USAR - APIs deprecadas
import { useReactGoogleAutocomplete } from 'react-google-autocomplete'; // ELIMINADO
import { usePlacesAutocomplete } from 'use-places-autocomplete'; // ELIMINADO

// ❌ NO USAR - Console.logs en producción
console.log('debug info'); // Solo permitido en logger.ts

// ❌ NO USAR - Valores mágicos
const MAGIC_NUMBER = 42; // Usar constants/ en su lugar

// ❌ NO USAR - Funciones largas
function longFunction() {
  // Más de 40 líneas - DIVIDIR
}
```

### ✅ Alternativas Recomendadas
```typescript
// ✅ En lugar de console.log
import { logger } from '@/lib/logger';
logger.info('Información relevante');

// ✅ En lugar de valores mágicos
import { PROJECT_STATUS } from '@/constants/projects';

// ✅ En lugar de funciones largas
const processData = (data) => {
  const validated = validateData(data);
  const transformed = transformData(validated);  
  return saveData(transformed);
};
```