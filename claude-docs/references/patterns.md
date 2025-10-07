# 🎨 Patrones de Código Establecidos - CalReact

## 🏗️ Layout Modular con AppLayout

### ✅ Patrón AppLayout para Páginas
```typescript
// ✅ PATRÓN OBLIGATORIO para nuevas páginas
import { AppLayout } from '@/components/layout';
import { IconName } from 'lucide-react';

export default function ExamplePage() {
  return (
    <AppLayout
      pageTitle="Título de la Página"
      pageDescription="Descripción opcional"
      pageIcon={IconName}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Título' }
      ]}
      headerActions={
        <>
          <Switch />
          <Button>Acción</Button>
        </>
      }
    >
      {/* Contenido de la página */}
      <DataTable {...} />
    </AppLayout>
  );
}
```

### Beneficios del Patrón AppLayout
- **Consistencia:** Header estandarizado en todas las páginas
- **Breadcrumbs:** Navegación clara y automática
- **Escalabilidad:** Agregar features sin tocar layout core
- **Testabilidad:** Componentes aislados testeables
- **Mantenibilidad:** Single Responsibility aplicado

### Componentes del Sistema
- **AppLayout** (`src/components/layout/AppLayout.tsx`) - Wrapper principal (84 líneas)
- **AppSidebar** (`src/components/layout/AppSidebar.tsx`) - Navegación lateral (78 líneas)
- **PageHeader** (`src/components/layout/PageHeader.tsx`) - Header con breadcrumbs (107 líneas)

### Páginas Migradas (100% del Proyecto)
- ✅ **projects** - Gestión de proyectos con DataTable
- ✅ **payments** - Registro de pagos
- ✅ **clients** - Gestión de clientes
- ✅ **visits** - Programación de visitas
- ✅ **aftersales** - Servicios postventa
- ✅ **calreact** - Calendario de eventos (con CalendarToolbar especializado)
- ✅ **dashboard** - Vista general del sistema
- ✅ **settings** - Configuración con tabs

### 📅 Caso Especial: Calendario con Controles Complejos
```typescript
// ✅ PATRÓN para páginas con controles especializados
import { AppLayout } from '@/components/layout';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar';

export default function CalendarPage() {
  return (
    <AppLayout
      pageTitle="Calendario"
      pageIcon={CalendarDays}
      breadcrumbs={[...]}
      headerActions={
        <DropdownMenu>
          {/* Solo acción principal en header */}
          <Button>Añadir Evento</Button>
        </DropdownMenu>
      }
    >
      {/* Controles específicos como children */}
      <CalendarToolbar {...} />
      <CalendarView {...} />
    </AppLayout>
  );
}
```

**Cuando usar este patrón:**
- Componentes con controles multi-línea (navegación temporal, filtros complejos)
- Toolbars especializados que manejan estado interno
- Vistas que requieren interfaz única (calendarios, dashboards)

### ❌ Anti-Pattern: Layout Monolítico
```typescript
// ❌ NO USAR - Layout inline hardcodeado
return (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1>Título</h1>
      <Button>Acción</Button>
    </div>
    <DataTable {...} />
  </div>
);
```

## 🏗️ Arquitectura de Eventos por Dominio

### ✅ Servicios de Eventos Específicos
```typescript
// ✅ CORRECTO - Eventos específicos por dominio
import { createProjectEvent } from '@/services/projectEventService';

// ❌ INCORRECTO - Sistema general deprecated
import { createEvent } from '@/services/eventService'; // NO EXISTE
```

**Servicios de eventos disponibles:**
- `projectEventService.ts` - Eventos de proyecto
- `calendarEventService.ts` - Eventos de calendario
- `eventEnrichmentService.ts` - Enriquecimiento de eventos
- `eventReferenceService.ts` - Referencias entre eventos

## 📅 Calendar Event Rendering Pattern

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

### ❌ Anti-Pattern Eliminado
```typescript
// ❌ NO USAR - Componente legacy eliminado
import { CalendarEvent } from '@/components/calendar/calendar-event';

// El componente calendar-event.tsx fue eliminado completamente.
// Usar CalendarEventCard con Registry Pattern en su lugar.
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

## 🗺️ Google Places Integration

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

### 🌍 Configuración de País (AddressInput - Arquitectura Híbrida)

#### Sistema de Prioridad Inteligente
AddressInput usa un orden de prioridad para seleccionar el país de búsqueda:

```typescript
// Orden de prioridad automático:
1. countryCode prop         // Override explícito (casos especiales)
2. entidad.componentes?.pais // País de entidad al editar
3. config.defaultCountry     // Configuración usuario (GeneralSettings)
4. 'CL'                      // Fallback último recurso
```

#### Uso en Formularios

**Crear nueva entidad (usa configuración global):**
```typescript
// ✅ No pasa countryCode → usa appConfig.defaultCountry
<AddressInput
  value={field.value}
  onSelect={field.onChange}
  placeholder="Ingrese la dirección"
/>
```

**Editar entidad existente (usa país de entidad):**
```typescript
// ✅ Respeta país del proyecto/visita/afterSale al editar
<AddressInput
  value={field.value}
  onSelect={field.onChange}
  placeholder="Ingrese la dirección"
  countryCode={defaultValues?.fullAddress?.componentes?.pais}
/>
```

**Override manual (casos especiales):**
```typescript
// ✅ Forzar búsqueda en país específico
<AddressInput
  value={field.value}
  onSelect={field.onChange}
  countryCode="AR" // Argentina
/>
```

#### Configuración Global del Usuario
El usuario puede cambiar el país predeterminado en:
- **Ruta:** `/settings` → GeneralSettings
- **Componente:** CountrySelector
- **Persistencia:** localStorage vía AppConfigContext
- **Efecto:** Todos los formularios de creación usarán este país por defecto

#### Formularios Optimizados
Los siguientes formularios respetan el país de la entidad al editar:
- ✅ [ProjectForm](src/components/forms/ProjectForm.tsx:324)
- ✅ [VisitForm](src/components/forms/VisitForm.tsx:236)
- ✅ [AfterSaleForm](src/components/forms/AfterSaleForm.tsx:369)
- ✅ [NewProjectEventForm](src/components/forms/NewProjectEventForm.tsx:261)

#### Implementación Técnica
```typescript
// src/components/ui/addressInput.tsx
const { config: appConfig } = useAppConfig();

const effectiveCountry = React.useMemo(() => {
  const country = countryCode || appConfig.defaultCountry || 'CL';
  return country.toLowerCase(); // Google Maps API usa lowercase
}, [countryCode, appConfig.defaultCountry]);

// PlacesServiceAdapter usa país efectivo
const adapter = new PlacesServiceAdapter({
  componentRestrictions: { country: effectiveCountry },
  region: effectiveCountry,
  sessionToken: true
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

### ProjectEventForm - Compound Component System

Sistema unificado para crear eventos de proyecto usando **Compound Component Pattern** con Context API.

**Arquitectura de componentes:**
```typescript
import { ProjectEventForm } from '@/components/forms/ProjectEventForm';

// Componentes disponibles:
ProjectEventForm.Container      // Wrapper principal con Context API
ProjectEventForm.ProjectInfo    // Card informativa (solo lean mode)
ProjectEventForm.BaseFields     // Campos comunes (eventDate, eventNotes)
ProjectEventForm.FullFields     // Campos completos (full mode)
ProjectEventForm.OverrideFields // Campos de override (lean mode)
ProjectEventForm.ChecklistSection // Gestión de checklist
```

**Uso recomendado (Lean Mode):**
```tsx
export function NewProjectEventModal({ project }: { project: ProjectType }) {
  const handleSubmit = async (data: ProjectEventFormValues) => {
    await createProjectEvent(project.id, data);
  };

  return (
    <ProjectEventForm.Container
      mode="lean"
      project={project}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <ProjectEventForm.ProjectInfo />
        <ProjectEventForm.BaseFields />
        <ProjectEventForm.OverrideFields />
        <ProjectEventForm.ChecklistSection />
      </div>
    </ProjectEventForm.Container>
  );
}
```

**Beneficios:**
- **Composición flexible:** Agregar/quitar secciones según necesidad
- **Context API:** Estado compartido sin prop drilling
- **Type-safety:** TypeScript garantiza uso correcto
- **Modos duales:** Lean (eficiente) vs Full (legacy)
- **Error Boundary:** Manejo robusto de errores
- **Suspense Ready:** Loading states integrados

**Estructura de archivos:**
```
src/components/forms/ProjectEventForm/
├── Container.tsx          # Wrapper con Context
├── ProjectInfo.tsx        # Card de información
├── BaseFields.tsx         # Campos base
├── FullFields.tsx         # Campos completos
├── OverrideFields.tsx     # Campos override
├── ChecklistSection.tsx   # Checklist component
├── FormErrorBoundary.tsx  # Error handling
├── LoadingSkeleton.tsx    # Loading UI
├── index.ts               # Barrel exports
├── types.ts               # TypeScript types
└── __tests__/             # Test suite completo
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

### Escalado de Componentes UI
```typescript
// ✅ PATRÓN para escalar componentes visualmente importantes
// Caso de uso: Mejorar visibilidad de componentes críticos sin modificar su código interno

// Escalado 1.5x (50% más grande) - Balance entre visibilidad y espacio
<div className="flex items-center">
  <div className="scale-[1.5] origin-left">
    <ImportantComponent {...props} />
  </div>
</div>

// Escalado 2x (doble tamaño) - Para componentes muy pequeños
<div className="flex items-center">
  <div className="scale-[2] origin-center">
    <TinyComponent {...props} />
  </div>
</div>

// ⚠️ IMPORTANTE: Usar origin-left/center/right según necesidad
// - origin-left: Escala desde lado izquierdo (evita expansión hacia ambos lados)
// - origin-center: Escala desde centro (componentes centrados)
// - origin-right: Escala desde lado derecho (alineación derecha)
```

### Wrappers Transparentes (Ghost Variant)
```typescript
// ✅ USAR variant="ghost" para botones que wrappean otros componentes
// Elimina backgrounds redundantes manteniendo interactividad

<Button
  variant="ghost"
  className="p-0 h-auto font-normal hover:bg-transparent"
  disabled={isPending}
>
  <Badge variant={variant} className="cursor-pointer">
    {content}
  </Badge>
</Button>

// ❌ EVITAR variant="secondary" - causa doble background
<Button variant="secondary"> {/* Background gris extra */}
  <Badge variant="primary"> {/* Su propio background */}
  </Badge>
</Button>
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

## 🏗️ Modal-Form Integration Pattern

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