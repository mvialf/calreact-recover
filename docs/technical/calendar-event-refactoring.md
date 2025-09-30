# 🎯 Plan de Refactorización: Calendar Event Architecture

**Status:** 🔄 En Progreso - Fase 1 Completada (25%)
**Fecha de creación:** Septiembre 2025
**Última actualización:** Septiembre 29, 2025
**Prioridad:** Media-Alta
**Impacto:** Alto (afecta sistema completo de calendario)

---

## 📊 Estado de Implementación

**Última actualización:** Septiembre 29, 2025
**Status:** 🔄 En Progreso - Fase 1 Completada

### Progreso por Fase

| Fase | Status | Fecha | Duración Real | Notas |
|------|--------|-------|---------------|-------|
| **Fase 1: Preparación** | ✅ Completada | Sep 29, 2025 | 25 min | 3 archivos creados, 0 errores |
| **Fase 2: CalendarEventCard** | ⏳ Pendiente | - | - | Siguiente paso |
| **Fase 3: Migración Vistas** | ⏳ Pendiente | - | - | - |
| **Fase 4: Limpieza** | ⏳ Pendiente | - | - | - |

### Detalles de Fase 1 (Completada)

**Archivos creados:**
```
src/components/calendar/event-renderers/
├── ProjectEventRenderer.tsx   (1.7 KB) ✅
├── DefaultEventRenderer.tsx   (1.8 KB) ✅
└── index.ts                   (1.8 KB) ✅
```

**Validaciones:**
- ✅ TypeScript: 0 errores
- ✅ ESLint: 0 warnings nuevos
- ✅ Estructura correcta verificada
- ✅ Calendario funciona idénticamente (sin breaking changes)

**Commits sugeridos:**
```bash
git add src/components/calendar/event-renderers/
git commit -m "feat: Crear estructura event-renderers con Registry Pattern

- Implementar ProjectEventRenderer para eventos de proyecto
- Implementar DefaultEventRenderer para eventos genéricos
- Crear registry EVENT_RENDERERS para mapeo tipo → renderer
- Extraer lógica de calendar-event.tsx sin modificar comportamiento

Parte de Fase 1 del plan de refactorización de arquitectura de eventos.
Ver docs/technical/calendar-event-refactoring.md para detalles."
```

**Lecciones de Fase 1:**
- ✅ Extracción de lógica más directa de lo esperado
- ✅ Sin necesidad de ajustes en tipos - EventType ya tenía campos necesarios
- ✅ Documentación inline ayuda mucho para siguiente fase
- ⚠️ Recordatorio: Fase 2 requiere cuidado especial con hooks de drag & drop

---

## 📋 Tabla de Contenidos

1. [Contexto y Motivación](#contexto-y-motivación)
2. [Problema Actual](#problema-actual)
3. [Solución Propuesta](#solución-propuesta)
4. [Plan de Implementación](#plan-de-implementación)
5. [Beneficios Esperados](#beneficios-esperados)
6. [Riesgos y Mitigación](#riesgos-y-mitigación)
7. [Checklist de Implementación](#checklist-de-implementación)
8. [Referencias Técnicas](#referencias-técnicas)

---

## 🎯 Contexto y Motivación

### Estado Actual del Sistema de Eventos

CalReact actualmente maneja eventos específicos por dominio:

```
✅ Implementados:
├── projectEventService.ts        # Eventos de proyecto
└── ProjectEventType              # Tipo específico con campos de proyecto

📋 Planificados:
├── visitEventService.ts          # Eventos de visita
└── afterSalesEventService.ts     # Eventos de postventa
```

### Arquitectura de Conversión Actual

```typescript
// Flujo de datos:
ProjectEventType → (calendarEventService) → EventType → (calendar-event.tsx) → UI
```

**EventType** es una abstracción para el calendario que unifica eventos de diferentes dominios.

---

## ❌ Problema Actual

### Lógica Condicional Hardcodeada en `calendar-event.tsx`

**Ubicación:** `src/components/calendar/calendar-event.tsx` líneas 201-236

```typescript
// ❌ PROBLEMA: Conditionals hardcodeados
{event.type === 'Proyecto' ? (
  <div className="space-y-1">
    <ProjectSummary
      project={{
        projectNumber: event.projectNumber,
        clientName: event.clientName,
        glosa: event.glosa
      }}
      className="text-foreground text-xs"
    />
    {event.fullAddress?.comune && (
      <p className="text-xs text-muted-foreground truncate">
        {event.fullAddress.comune}
      </p>
    )}
  </div>
) : (
  // Renderizado genérico para otros tipos
  <>
    <div className="font-semibold truncate">{event.name}</div>
    {isMultiDay && (
      <div className="text-xs opacity-80 truncate">
        {formatLocalDate(event.startDate)} - {formatLocalDate(event.endDate)}
      </div>
    )}
  </>
)}
```

### Consecuencias de este Diseño

#### 1️⃣ **Violación del Principio Open/Closed**
- ❌ Para agregar un nuevo tipo de evento (Visita, Postventa) necesitas **modificar** `calendar-event.tsx`
- ❌ Cada nuevo tipo requiere otro `else if` o ternario anidado
- ❌ El archivo crece indefinidamente (actualmente 239 líneas)

#### 2️⃣ **Acoplamiento Alto**
```typescript
// calendar-event.tsx necesita conocer:
import { ProjectSummary } from '@/components/summary';  // ← Dependencia específica

// En el futuro necesitaría:
import { VisitSummary } from '@/components/summary';
import { AfterSalesSummary } from '@/components/summary';
// ... más imports por cada tipo
```

#### 3️⃣ **Difícil de Testear**
- Tests necesitan mockear todos los tipos de eventos
- Cambios en un tipo pueden romper tests de otros tipos
- No se pueden probar renderers independientemente

#### 4️⃣ **Mantenimiento Complejo**
```typescript
// Escenario futuro con 5+ tipos de eventos:
{event.type === 'Proyecto' ? (
  <ProjectSummary ... />
) : event.type === 'Visita' ? (
  <VisitSummary ... />
) : event.type === 'Postventa' ? (
  <AfterSalesSummary ... />
) : event.type === 'Instalación' ? (
  <InstallationSummary ... />
) : event.type === 'Mantención' ? (
  <MaintenanceSummary ... />
) : (
  <DefaultRenderer ... />
)}
// ← Pesadilla de mantenimiento
```

---

## ✅ Solución Propuesta: Registry Pattern

### Concepto del Patrón

**Registry Pattern** es un patrón de diseño que permite registrar variantes de comportamiento y seleccionarlas dinámicamente sin conditionals.

```typescript
// En lugar de:
if (type === 'A') { /* ... */ }
else if (type === 'B') { /* ... */ }

// Usamos:
const renderer = REGISTRY[type];
renderer.render();
```

### Arquitectura Propuesta

```
src/components/calendar/
├── event-renderers/                    # NUEVO - Directorio de renderers
│   ├── ProjectEventRenderer.tsx        # Extrae lógica de Proyecto
│   ├── DefaultEventRenderer.tsx        # Extrae lógica genérica
│   ├── VisitEventRenderer.tsx          # FUTURO - Para visitas
│   ├── AfterSalesEventRenderer.tsx     # FUTURO - Para postventa
│   └── index.ts                        # Registry con mapping
│
├── CalendarEventCard.tsx               # NUEVO - Reemplazo de calendar-event.tsx
├── calendar-event.tsx                  # DEPRECAR → Eliminar tras migración
├── month-view.tsx                      # Actualizar import
├── week-view.tsx                       # Actualizar import
└── day-view.tsx                        # Actualizar import
```

### Implementación del Registry

```typescript
// src/components/calendar/event-renderers/index.ts
import { ProjectEventRenderer } from './ProjectEventRenderer';
import { DefaultEventRenderer } from './DefaultEventRenderer';
import type { EventType } from '@/types/event';

export const EVENT_RENDERERS = {
  'Proyecto': ProjectEventRenderer,
  // Listos para agregar sin modificar código:
  // 'Visita': VisitEventRenderer,
  // 'Postventa': AfterSalesEventRenderer,
} as const;

export type EventRendererProps = {
  event: EventType;
  view: 'month' | 'week' | 'day';
};

export type EventRenderer = React.FC<EventRendererProps>;
```

### Implementación del Componente Principal

```typescript
// src/components/calendar/CalendarEventCard.tsx
import { EVENT_RENDERERS, DefaultEventRenderer } from './event-renderers';
import type { EventType } from '@/types/event';

interface CalendarEventCardProps {
  event: EventType;
  onClick: (event: EventType) => void;
  view: 'month' | 'week' | 'day';
  enableDragAndDrop?: boolean;
}

export function CalendarEventCard({
  event: originalEvent,
  onClick,
  view,
  enableDragAndDrop
}: CalendarEventCardProps) {
  // 🔥 MANTENER TODOS LOS HOOKS EXISTENTES
  const event = useValidatedEvent(originalEvent);
  const eventData = useMemo(() => { /* ... */ }, [event]);
  const {attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging} = useDraggable({
    id: event?.id || 'invalid-event',
    data: eventData || undefined,
    disabled: !enableDragAndDrop || !event,
  });
  const {setNodeRef: setDroppableRef, isOver} = useDroppable({
    id: event?.id ? `droppable-event-${event.id}` : 'invalid-droppable',
    disabled: !enableDragAndDrop || !event,
  });

  // 🎯 NUEVA LÓGICA: Selección de renderer desde registry
  const Renderer = EVENT_RENDERERS[event.type] || DefaultEventRenderer;

  if (!event) return null;

  return (
    <div
      ref={(node) => {
        setDraggableRef(node);
        setDroppableRef(node);
      }}
      {...attributes}
      {...listeners}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      className={cn(
        "bg-card dark:bg-[hsl(240,5%,12%)] text-card-foreground",
        "border border-border/60",
        "border-l-4",
        "p-1.5 rounded-md text-xs overflow-hidden shadow-sm hover:shadow-md relative",
        isDragging ? "shadow-2xl" : "hover:shadow-md",
        isOver ? "ring-2 ring-primary ring-offset-1" : ""
      )}
      onClick={() => onClick(event)}
      title={/* tooltip logic */}
      data-calendar-event="true"
    >
      {/* 🎯 USO DEL RENDERER DESDE REGISTRY */}
      <Renderer event={event} view={view} />
    </div>
  );
}
```

### Implementación de Renderers Específicos

```typescript
// src/components/calendar/event-renderers/ProjectEventRenderer.tsx
import { ProjectSummary } from '@/components/summary';
import type { EventRendererProps } from './index';

export const ProjectEventRenderer: React.FC<EventRendererProps> = ({ event, view }) => {
  return (
    <div className="space-y-1">
      <ProjectSummary
        project={{
          projectNumber: event.projectNumber,
          clientName: event.clientName,
          glosa: event.glosa
        }}
        className="text-foreground text-xs"
      />
      {event.fullAddress?.comune && (
        <p className="text-xs text-muted-foreground truncate">
          {event.fullAddress.comune}
        </p>
      )}
      {!event.fullAddress?.comune && event.fullAddress?.componentes?.comuna && (
        <p className="text-xs text-muted-foreground truncate">
          {event.fullAddress.componentes.comuna}
        </p>
      )}
    </div>
  );
};
```

```typescript
// src/components/calendar/event-renderers/DefaultEventRenderer.tsx
import { formatLocalDate } from '@/lib/calendar-utils';
import type { EventRendererProps } from './index';

export const DefaultEventRenderer: React.FC<EventRendererProps> = ({ event, view }) => {
  const isMultiDay = !isSameDay(event.startDate, event.endDate);

  return (
    <>
      <div className="font-semibold truncate">{event.name}</div>
      {isMultiDay && (
        <div className="text-xs opacity-80 truncate">
          {formatLocalDate(event.startDate)} - {formatLocalDate(event.endDate)}
        </div>
      )}
      {!isMultiDay && view !== 'month' && event.description && (
        <p className="text-xs truncate opacity-75 mt-0.5">{event.description}</p>
      )}
    </>
  );
};
```

---

## 🔄 Plan de Implementación

### Fase 1: Preparación (Sin Breaking Changes)

**Objetivo:** Crear estructura sin afectar código existente

```bash
# 1. Crear directorio de renderers
mkdir -p src/components/calendar/event-renderers

# 2. Verificar estructura
ls -la src/components/calendar/event-renderers/
```

**Archivos a crear:**

1. **`src/components/calendar/event-renderers/ProjectEventRenderer.tsx`**
   - Extraer código de líneas 201-222 de `calendar-event.tsx`
   - Wrappear en componente funcional con props tipadas

2. **`src/components/calendar/event-renderers/DefaultEventRenderer.tsx`**
   - Extraer código de líneas 224-236 de `calendar-event.tsx`
   - Wrappear en componente funcional con props tipadas

3. **`src/components/calendar/event-renderers/index.ts`**
   - Crear registry `EVENT_RENDERERS`
   - Exportar tipos `EventRendererProps` y `EventRenderer`

**Validación:**
```bash
npm run typecheck  # Debe pasar sin errores
npm run lint       # Debe pasar sin errores
```

---

### Fase 2: Crear CalendarEventCard

**Objetivo:** Componente nuevo que use registry

**Archivo a crear:**

1. **`src/components/calendar/CalendarEventCard.tsx`**
   - Copiar estructura completa de `calendar-event.tsx`
   - Mantener TODOS los hooks (useDraggable, useDroppable, useValidatedEvent)
   - Reemplazar condicional (líneas 201-236) con lógica de registry
   - Mantener estilos, tooltips, data attributes

**Código crítico a mantener:**

```typescript
// ✅ MANTENER: Hooks de drag & drop
const {attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging} = useDraggable({...});
const {setNodeRef: setDroppableRef, isOver} = useDroppable({...});

// ✅ MANTENER: Validación de evento
const event = useValidatedEvent(originalEvent);

// ✅ MANTENER: Estilos y clases
className={cn(
  "bg-card dark:bg-[hsl(240,5%,12%)] text-card-foreground",
  "border border-border/60",
  // ... resto de estilos
)}

// ✅ MANTENER: Data attribute para detección de clicks
data-calendar-event="true"
```

**Validación:**
```bash
npm run typecheck  # Debe pasar
npm run lint       # Debe pasar
npm run dev        # Verificar que compila
```

---

### Fase 3: Migración Gradual de Vistas

**Objetivo:** Actualizar vistas una por una para usar `CalendarEventCard`

#### 3.1 Migrar `month-view.tsx`

```typescript
// ANTES:
import { CalendarEvent } from './calendar-event';

// DESPUÉS:
import { CalendarEventCard } from './CalendarEventCard';

// Reemplazar todas las ocurrencias:
<CalendarEvent
  event={event}
  onClick={handleEventClick}
  view="month"
  enableDragAndDrop={enableDragAndDrop}
/>

// POR:
<CalendarEventCard
  event={event}
  onClick={handleEventClick}
  view="month"
  enableDragAndDrop={enableDragAndDrop}
/>
```

**Validación tras cambio:**
```bash
npm run dev  # Abrir http://localhost:3002/calreact
# Verificar:
# - Eventos se renderizan correctamente
# - Click en eventos funciona
# - Drag & drop funciona (si está habilitado)
# - Estilos se mantienen
```

#### 3.2 Migrar `week-view.tsx`

- Mismo proceso que month-view.tsx
- Cambiar import y componente
- Validar visualmente

#### 3.3 Migrar `day-view.tsx`

- Mismo proceso que month-view.tsx
- Cambiar import y componente
- Validar visualmente

**Comandos de validación después de cada vista:**
```bash
npm run lint && npm run typecheck  # OBLIGATORIO
```

---

### Fase 4: Limpieza Final

**Objetivo:** Eliminar código obsoleto y actualizar documentación

#### 4.1 Deprecar `calendar-event.tsx`

```bash
# NO eliminar todavía, agregar comentario de deprecación
```

Agregar al inicio del archivo:
```typescript
/**
 * @deprecated Este componente está deprecado y será eliminado.
 * Usar CalendarEventCard en su lugar.
 *
 * Migración completada en:
 * - month-view.tsx ✅
 * - week-view.tsx ✅
 * - day-view.tsx ✅
 */
```

#### 4.2 Verificar que no hay más referencias

```bash
# Buscar referencias a CalendarEvent (viejo)
grep -r "CalendarEvent" src/components/calendar/ --include="*.tsx" --include="*.ts" | grep -v "CalendarEventCard"

# Debe retornar solo calendar-event.tsx y sus imports internos
```

#### 4.3 Eliminar archivo obsoleto

```bash
# Solo después de verificar que no hay referencias
rm src/components/calendar/calendar-event.tsx
```

#### 4.4 Actualizar documentación

Actualizar `claude-docs/references/patterns.md`:

```markdown
## 🎨 Calendar Event Rendering Pattern

### Registry Pattern para Eventos (IMPLEMENTADO)

Los eventos de calendario usan un Registry Pattern para renderizado específico por tipo:

\`\`\`typescript
// ✅ Patrón establecido
import { CalendarEventCard } from '@/components/calendar/CalendarEventCard';

// El componente selecciona automáticamente el renderer correcto:
<CalendarEventCard event={event} view="month" onClick={handleClick} />

// Para agregar nuevo tipo de evento:
// 1. Crear src/components/calendar/event-renderers/NuevoTipoRenderer.tsx
// 2. Agregar a EVENT_RENDERERS en index.ts
// 3. Listo - sin modificar código existente
\`\`\`
```

**Validación final:**
```bash
npm run build        # Build completo debe pasar
npm run lint         # Sin errores
npm run typecheck    # Sin errores
git status           # Verificar archivos modificados
```

---

### Fase 5: Expansión (Futuro)

**Objetivo:** Agregar nuevos tipos de eventos (Visita, Postventa)

#### 5.1 Crear VisitEventRenderer

```typescript
// src/components/calendar/event-renderers/VisitEventRenderer.tsx
export const VisitEventRenderer: React.FC<EventRendererProps> = ({ event, view }) => {
  return (
    <div className="space-y-1">
      {/* Lógica específica de visita */}
      <div className="font-semibold">{event.clientName || event.name}</div>
      {event.location && (
        <p className="text-xs text-muted-foreground">{event.location}</p>
      )}
    </div>
  );
};
```

#### 5.2 Actualizar Registry

```typescript
// src/components/calendar/event-renderers/index.ts
export const EVENT_RENDERERS = {
  'Proyecto': ProjectEventRenderer,
  'Visita': VisitEventRenderer,        // ← NUEVO
  // 'Postventa': AfterSalesEventRenderer,  // Próximo
} as const;
```

**Validación:**
```bash
npm run typecheck && npm run lint  # Debe pasar
npm run dev  # Verificar visitas se renderizan correctamente
```

#### 5.3 Repetir proceso para AfterSalesEventRenderer

---

## 🎁 Beneficios Esperados

### 1️⃣ Escalabilidad

**ANTES:**
```typescript
// Para agregar Visita:
// 1. Modificar calendar-event.tsx (239 líneas)
// 2. Agregar conditional anidado
// 3. Importar VisitSummary
// 4. Riesgo de romper Proyecto
```

**DESPUÉS:**
```typescript
// Para agregar Visita:
// 1. Crear VisitEventRenderer.tsx (20 líneas)
// 2. Agregar a registry (1 línea)
// 3. Listo - sin tocar código existente
```

### 2️⃣ Principios SOLID

- ✅ **Single Responsibility:** Cada renderer maneja solo su tipo
- ✅ **Open/Closed:** Abierto a extensión (nuevo renderer), cerrado a modificación (CalendarEventCard no cambia)
- ✅ **Dependency Inversion:** CalendarEventCard depende de abstracción (registry), no de implementaciones concretas

### 3️⃣ Mantenibilidad

```typescript
// Cambiar renderizado de Proyecto:
// ANTES: Buscar línea específica en archivo de 239 líneas
// DESPUÉS: Editar ProjectEventRenderer.tsx (20 líneas aisladas)
```

### 4️⃣ Testabilidad (Futuro)

```typescript
// Tests aislados por renderer:
describe('ProjectEventRenderer', () => {
  it('debe renderizar ProjectSummary correctamente', () => {
    // Test específico sin dependencias de calendario
  });
});

// Tests del registry:
describe('CalendarEventCard', () => {
  it('debe seleccionar ProjectEventRenderer para tipo Proyecto', () => {
    // Test de lógica de selección
  });
});
```

---

## ⚠️ Riesgos y Mitigación

### Riesgo 1: Romper Drag & Drop

**Riesgo:** Perder funcionalidad de arrastrar y soltar eventos

**Mitigación:**
- ✅ Copiar TODOS los hooks de `calendar-event.tsx`
- ✅ Mantener `useDraggable` y `useDroppable` idénticos
- ✅ Conservar `data-calendar-event` attribute
- ✅ Validar drag & drop en cada vista migrada

**Código crítico:**
```typescript
// ✅ MANTENER EXACTAMENTE IGUAL:
const {attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging} = useDraggable({
  id: event?.id || 'invalid-event',
  data: eventData || undefined,
  disabled: !enableDragAndDrop || !event,
});
```

### Riesgo 2: Pérdida de Estilos

**Riesgo:** Eventos se renderizan sin estilos o con estilos incorrectos

**Mitigación:**
- ✅ Copiar clases CSS completas de `calendar-event.tsx`
- ✅ Mantener estructura de DOM idéntica
- ✅ Validación visual después de cada cambio

**Validación:**
```bash
# Comparar visualmente antes/después en:
# - Tema claro
# - Tema oscuro
# - Vista mes, semana, día
```

### Riesgo 3: Breaking Changes Durante Migración

**Riesgo:** Usuario final ve errores durante proceso de migración

**Mitigación:**
- ✅ **Migración gradual:** Una vista a la vez
- ✅ **Mantener ambos componentes:** `calendar-event.tsx` y `CalendarEventCard.tsx` coexisten
- ✅ **Validar en desarrollo:** No hacer deploy hasta completar todas las vistas
- ✅ **Rollback fácil:** Git commit por cada vista migrada

**Estrategia de commits:**
```bash
git commit -m "feat: Crear estructura event-renderers"
git commit -m "feat: Crear CalendarEventCard con registry pattern"
git commit -m "feat: Migrar month-view a CalendarEventCard"
git commit -m "feat: Migrar week-view a CalendarEventCard"
git commit -m "feat: Migrar day-view a CalendarEventCard"
git commit -m "refactor: Eliminar calendar-event.tsx deprecado"
```

### Riesgo 4: Regresiones en Comportamiento

**Riesgo:** Cambios sutiles en comportamiento (tooltips, clicks, validaciones)

**Mitigación:**
- ✅ Mantener `useValidatedEvent` hook
- ✅ Conservar lógica de tooltip
- ✅ Mantener onClick handler
- ✅ Testing manual exhaustivo (después de implementación, tests automatizados en futuro)

---

## ✅ Checklist de Implementación

### Fase 1: Preparación ✅ COMPLETADA (Sep 29, 2025)
- [x] Crear directorio `src/components/calendar/event-renderers/`
- [x] Crear `ProjectEventRenderer.tsx` (extraído líneas 201-222)
- [x] Crear `DefaultEventRenderer.tsx` (extraído líneas 224-236)
- [x] Crear `index.ts` con `EVENT_RENDERERS` registry
- [x] Validar: `npm run typecheck && npm run lint` ✅

**Resultado:** 3 archivos nuevos (~5.3 KB), 0 errores, sin breaking changes

### Fase 2: Nuevo Componente
- [ ] Crear `CalendarEventCard.tsx` con estructura de `calendar-event.tsx`
- [ ] Copiar TODOS los hooks (useDraggable, useDroppable, useValidatedEvent)
- [ ] Implementar lógica de registry para selección de renderer
- [ ] Mantener estilos y clases CSS idénticos
- [ ] Validar: `npm run typecheck && npm run lint && npm run dev`

### Fase 3: Migración de Vistas
- [ ] Migrar `month-view.tsx`: Cambiar import y componente
  - [ ] Validar visualmente en navegador
  - [ ] Probar drag & drop (si aplica)
  - [ ] Probar click en eventos
  - [ ] `npm run lint && npm run typecheck`
- [ ] Migrar `week-view.tsx`: Mismo proceso
  - [ ] Validación visual y funcional
  - [ ] `npm run lint && npm run typecheck`
- [ ] Migrar `day-view.tsx`: Mismo proceso
  - [ ] Validación visual y funcional
  - [ ] `npm run lint && npm run typecheck`

### Fase 4: Limpieza
- [ ] Agregar comentario de deprecación a `calendar-event.tsx`
- [ ] Verificar no hay referencias: `grep -r "CalendarEvent" src/`
- [ ] Eliminar `calendar-event.tsx`
- [ ] Actualizar `patterns.md` con nuevo patrón
- [ ] Validar: `npm run build`

### Fase 5: Expansión Futura
- [ ] Crear `VisitEventRenderer.tsx` cuando se implemente servicio de visitas
- [ ] Crear `AfterSalesEventRenderer.tsx` cuando se implemente servicio de postventa
- [ ] Agregar a `EVENT_RENDERERS` sin modificar código existente

---

## 📚 Referencias Técnicas

### Archivos Actuales Relevantes

**Servicios:**
```
src/services/projectEventService.ts       # Servicio de eventos de proyecto
src/services/calendarEventService.ts      # Conversión a EventType
src/services/eventEnrichmentService.ts    # Enriquecimiento de datos
```

**Tipos:**
```
src/types/event.ts                        # EventType (abstracción calendario)
src/types/project.ts                      # ProjectEventType (específico)
```

**Componentes:**
```
src/components/calendar/calendar-event.tsx  # DEPRECAR tras migración
src/components/calendar/month-view.tsx      # Actualizar import
src/components/calendar/week-view.tsx       # Actualizar import
src/components/calendar/day-view.tsx        # Actualizar import
src/components/summary/                     # ProjectSummary usado en renderer
```

### Código Específico a Preservar

#### useValidatedEvent Hook
```typescript
// src/components/calendar/calendar-event.tsx líneas 23-46
const useValidatedEvent = (event: EventType) => {
  return useMemo(() => {
    try {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      if (!isValid(startDate) || !isValid(endDate)) {
        eventLogger.error('Fechas de evento inválidas', { startDate, endDate });
        return null;
      }

      return { ...event, startDate, endDate };
    } catch (error) {
      eventLogger.error('Error al procesar fechas del evento', error);
      return null;
    }
  }, [event]);
};
```

#### Drag & Drop Configuration
```typescript
// src/components/calendar/calendar-event.tsx líneas 59-97
const eventData = useMemo(() => {
  if (!event) return null;
  return {
    type: 'event',
    event: {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      name: event.name,
      description: event.description,
      color: event.color,
      ...(event as any)
    }
  };
}, [event]);

const {attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging} = useDraggable({
  id: event?.id || 'invalid-event',
  data: eventData || undefined,
  disabled: !enableDragAndDrop || !event,
});

const {setNodeRef: setDroppableRef, isOver} = useDroppable({
  id: event?.id ? `droppable-event-${event.id}` : 'invalid-droppable',
  data: {
    type: 'event-target',
    accepts: ['event'],
    eventId: event?.id || '',
    date: event?.startDate || new Date(),
    targetEvent: event
  },
  disabled: !enableDragAndDrop || !event,
});
```

#### Estilos CSS Críticos
```typescript
// src/components/calendar/calendar-event.tsx líneas 189-196
className={cn(
  "bg-card dark:bg-[hsl(240,5%,12%)] text-card-foreground",
  "border border-border/60",
  "border-l-4",
  "p-1.5 rounded-md text-xs overflow-hidden shadow-sm hover:shadow-md relative",
  isDragging ? "shadow-2xl" : "hover:shadow-md",
  isOver ? "ring-2 ring-primary ring-offset-1" : ""
)}
```

### Comandos de Validación

```bash
# Durante desarrollo (OBLIGATORIO después de cada cambio)
npm run lint && npm run typecheck

# Iniciar servidor desarrollo
npm run dev  # Puerto 3002 (Turbopack)

# Build completo (antes de finalizar)
npm run build

# Buscar referencias a componente viejo
grep -r "CalendarEvent" src/components/calendar/ --include="*.tsx" | grep -v "CalendarEventCard"
```

### Patrones de Documentación

**Actualizar tras completar:**
- `claude-docs/references/patterns.md` - Agregar Registry Pattern para eventos
- `claude-docs/IMPLEMENTATIONS.md` - Agregar entrada con status completado

---

## 📊 Estimación de Esfuerzo

**Tiempo estimado total:** 3-4 horas

| Fase | Tiempo Estimado | Complejidad |
|------|----------------|-------------|
| Fase 1: Preparación | 30-45 min | Baja |
| Fase 2: CalendarEventCard | 60-90 min | Media |
| Fase 3: Migración Vistas | 45-60 min | Baja |
| Fase 4: Limpieza | 15-30 min | Baja |
| **Total** | **3-4 horas** | **Media** |

**Complejidad técnica:** Media (requiere cuidado con hooks y drag & drop)
**Riesgo de regresiones:** Bajo (con validación adecuada)
**Impacto esperado:** Alto (mejora significativa en arquitectura)

---

## 🎯 Criterios de Éxito

### Funcionales
- ✅ Todos los eventos se renderizan correctamente en las 3 vistas
- ✅ Drag & drop funciona si está habilitado
- ✅ Click en eventos abre modal correcto
- ✅ Estilos se mantienen en tema claro y oscuro
- ✅ Tooltips funcionan correctamente

### Técnicos
- ✅ `npm run build` pasa sin errores
- ✅ `npm run typecheck` pasa sin errores
- ✅ `npm run lint` pasa sin errores
- ✅ No hay referencias a `calendar-event.tsx` en codebase
- ✅ Agregar nuevo tipo de evento requiere solo 2 archivos nuevos (renderer + registry)

### Documentación
- ✅ `patterns.md` actualizado con Registry Pattern
- ✅ `IMPLEMENTATIONS.md` tiene entrada de refactorización completada
- ✅ Comentarios inline explican decisiones arquitecturales

---

**Fecha última actualización:** Septiembre 2025
**Autor:** Plan generado por análisis técnico
**Estado:** Listo para implementación

---

## 📝 Notas Adicionales

### Consideraciones para Testing Futuro

Una vez completada la implementación, se recomienda crear tests para:

```typescript
// Tests unitarios por renderer
ProjectEventRenderer.test.tsx       # Verificar ProjectSummary se renderiza
DefaultEventRenderer.test.tsx       # Verificar fallback genérico
VisitEventRenderer.test.tsx         # Cuando se implemente

// Tests de integración
CalendarEventCard.test.tsx          # Verificar selección de renderer
calendar-views.integration.test.tsx # Verificar drag & drop y clicks
```

**Beneficio del Registry Pattern para testing:**
- Cada renderer es testeable independientemente
- No necesitas montar componente completo de calendario
- Mocks son simples (solo props de EventType)
- Agregar tests para nuevos tipos no requiere modificar tests existentes

### Extensiones Futuras Posibles

Este patrón permite fácilmente:
- **Temas por tipo de evento:** Cada renderer puede tener su propia paleta de colores
- **Iconos personalizados:** Agregar iconografía específica por dominio
- **Acciones contextuales:** Botones de acción rápida específicos por tipo
- **Detalles expandibles:** Mostrar más información en hover específica por tipo

---

**Para comenzar implementación:** Seguir Fase 1 del checklist
**Para dudas técnicas:** Consultar sección de Referencias Técnicas
**Para validación:** Seguir comandos en cada fase