# 📦 Calendar Event Registry Pattern - Referencia Técnica

**Proyecto:** CalReact - Arquitectura de Eventos de Calendario
**Implementado:** Septiembre 2025
**Status:** ✅ Producción
**Patrón:** Registry Pattern para renderizado de eventos por tipo

---

## 🎯 Descripción General

### Problema Resuelto
El componente legacy `calendar-event.tsx` (239 líneas) usaba conditionals hardcodeados (`if/else if`) para renderizar diferentes tipos de eventos (Proyecto, Visita, Postventa). Esta arquitectura no escalaba: agregar un nuevo tipo requería modificar código existente, aumentando el riesgo de romper funcionalidad ya probada.

### Solución Implementada
**Registry Pattern** con componentes especializados por tipo de evento. Cada tipo tiene su propio renderer independiente que se mapea en un registry central. Agregar nuevos tipos requiere solo **crear 1 archivo nuevo** y **agregar 1 línea al registry**, sin modificar código existente.

**Beneficios cuantificados:**
- 🎯 Escalabilidad: De 2 tipos actuales a 10+ sin aumentar complejidad
- 🧪 Testabilidad: Cada renderer testeable independientemente
- 🔧 Mantenimiento: 239 líneas complejas → componentes de 50-80 líneas
- ⚡ Extensibilidad: Agregar tipo nuevo en 2 pasos vs modificar conditional anidado

---

## 🏗️ Arquitectura Implementada

### Estructura de Archivos

```
src/components/calendar/
├── event-renderers/                     # Sistema de renderers
│   ├── ProjectEventRenderer.tsx         # Lógica específica Proyecto
│   ├── DefaultEventRenderer.tsx         # Fallback genérico
│   ├── types.ts                         # Interfaces compartidas
│   └── index.ts                         # Registry + exports
│
├── CalendarEventCard.tsx                # Componente principal (wrapper)
│
├── month-view.tsx                       # Vista mensual (usa CalendarEventCard)
├── week-view.tsx                        # Vista semanal (usa CalendarEventCard)
└── day-view.tsx                         # Vista diaria (usa CalendarEventCard)
```

**Archivos clave:**
- **Registry:** [src/components/calendar/event-renderers/index.ts](../../src/components/calendar/event-renderers/index.ts)
- **Wrapper:** [src/components/calendar/CalendarEventCard.tsx](../../src/components/calendar/CalendarEventCard.tsx)
- **Patrón documentado:** [claude-docs/references/patterns.md](../../claude-docs/references/patterns.md#-calendar-event-rendering-pattern-implementado---sept-2025)

### Flujo de Renderizado

```
Firestore (projectEvents collection)
    ↓
projectEventService.ts
    ↓
ProjectEventType (tipo específico con metadatos)
    ↓
calendarEventService.ts (conversión a tipo unificado)
    ↓
EventType { type: 'Proyecto' | 'Visita' | ... }
    ↓
CalendarEventCard (punto de entrada)
    ↓
Registry selecciona renderer: EVENT_RENDERERS[event.type]
    ↓
ProjectEventRenderer | DefaultEventRenderer | VisitEventRenderer
    ↓
UI final renderizado con estilos y hooks preservados
```

---

## 💡 Decisiones Técnicas Clave

### Por Qué Registry Pattern

**Comparación de alternativas evaluadas:**

| Aspecto | Conditionals (antes) | Registry (implementado) | Render Props |
|---------|----------------------|-------------------------|--------------|
| **Escalabilidad** | ❌ O(n) complejidad | ✅ O(1) lookup | ⚠️ O(1) pero verboso |
| **Extensibilidad** | ❌ Modificar código | ✅ Solo agregar | ⚠️ Configurar props |
| **Mantenibilidad** | ❌ 239 líneas monolito | ✅ ~50-80 por renderer | ⚠️ Lógica dispersa |
| **Testabilidad** | ❌ Montar calendario | ✅ Test renderer solo | ✅ Test renderer |
| **Type Safety** | ⚠️ Manual exhaustive | ✅ TypeScript garantiza | ⚠️ Configuración compleja |

**Razón de selección:**
- **Open/Closed Principle**: Abierto a extensión, cerrado a modificación
- **Single Responsibility**: Cada renderer maneja solo su tipo
- **Estándar probado**: Patrón común en React para este problema específico

### Qué Se Preservó (Crítico)

Durante la migración se preservaron **100% de funcionalidades críticas**:

#### Hooks de Drag & Drop
```typescript
const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
  id: event.id,
  data: { event, type: 'calendar-event' }
});

const { setNodeRef: setDroppableRef, isOver } = useDroppable({
  id: event.id,
  data: { event }
});
```

#### Validación de Eventos
```typescript
const event = useValidatedEvent(originalEvent);
// Garantiza que start/end son Date válidos
```

#### Data Attributes
```typescript
data-calendar-event="true"  // ← CRÍTICO para detección de clicks
data-event-id={event.id}
data-event-type={event.type}
```

#### Estilos CSS Completos
```typescript
className={cn(
  "bg-card dark:bg-[hsl(240,5%,12%)]",
  "border border-border/60 border-l-4",
  "hover:shadow-md dark:hover:shadow-lg",
  // ... 15+ clases Tailwind preservadas
)}
```

---

## 🚀 Guía de Uso

### Agregar Nuevo Tipo de Evento (2 Pasos)

#### Paso 1: Crear Renderer Específico

```typescript
// src/components/calendar/event-renderers/VisitEventRenderer.tsx
import React from 'react';
import type { EventRenderer } from './types';

export const VisitEventRenderer: EventRenderer = ({
  event,
  view,
  onClick
}) => {
  // Lógica específica para eventos de Visita
  const { title, client, visitType } = event;

  return (
    <div
      onClick={() => onClick?.(event)}
      className="space-y-1"
    >
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">
        Cliente: {client?.name}
      </div>
      {view !== 'month' && (
        <div className="text-xs opacity-75">
          Tipo: {visitType}
        </div>
      )}
    </div>
  );
};
```

#### Paso 2: Registrar en Registry

```typescript
// src/components/calendar/event-renderers/index.ts

import { VisitEventRenderer } from './VisitEventRenderer';

export const EVENT_RENDERERS = {
  'Proyecto': ProjectEventRenderer,
  'Visita': VisitEventRenderer,    // ← Nueva línea
  // Futuros tipos aquí...
} as const;
```

**Listo** ✅ - Sin modificar código existente, sin breaking changes.

### Validación Obligatoria

```bash
# Después de cualquier cambio
npm run lint && npm run typecheck

# Verificar en navegador
npm run dev  # Puerto 3002
```

### Búsqueda de Referencias

```bash
# Ver uso del registry
grep -r "EVENT_RENDERERS" src/components/calendar/

# Verificar que no hay imports viejos
grep -r "calendar-event" src/ --include="*.tsx" | grep -v "CalendarEventCard"
```

---

## 📚 Referencias de Código en Producción

### Registry Pattern

**Ubicación:** [event-renderers/index.ts:15-20](../../src/components/calendar/event-renderers/index.ts)

```typescript
export const EVENT_RENDERERS = {
  'Proyecto': ProjectEventRenderer,
  // Extensible: agregar nuevos tipos aquí
} as const satisfies Record<string, EventRenderer>;
```

### Ejemplo de Renderer

**Ubicación:** [ProjectEventRenderer.tsx:45-67](../../src/components/calendar/event-renderers/ProjectEventRenderer.tsx)

```typescript
export const ProjectEventRenderer: EventRenderer = ({ event, view, onClick }) => {
  const statusColors: Record<string, string> = {
    pending: 'border-l-yellow-500',
    in_progress: 'border-l-blue-500',
    completed: 'border-l-green-500',
    // ... más estados
  };

  return (
    <div onClick={() => onClick?.(event)} className="space-y-1">
      <div className="font-medium text-sm">{event.title}</div>
      {view !== 'month' && (
        <div className="text-xs text-muted-foreground">
          {event.description}
        </div>
      )}
    </div>
  );
};
```

### Uso en Vistas

**Ubicación:** [month-view.tsx:123](../../src/components/calendar/month-view.tsx)

```typescript
import { CalendarEventCard } from './CalendarEventCard';

// En renderizado
<CalendarEventCard
  event={event}
  view="month"
  onClick={handleEventClick}
  enableDragAndDrop={true}
/>
```

### Patrón Documentado

**Ubicación:** [patterns.md:200-280](../../claude-docs/references/patterns.md#-calendar-event-rendering-pattern-implementado---sept-2025)

Sección completa con:
- Uso obligatorio del Registry Pattern
- Beneficios del patrón
- Arquitectura de archivos
- Anti-patterns eliminados

---

## 🔍 Mantenimiento y Extensión

### Cuándo Modificar el Registry

**Agregar nuevo tipo:**
```typescript
// Siempre que necesites soportar un nuevo tipo de evento
'NuevoTipo': NuevoTipoRenderer
```

**NO modificar:**
- Lógica de selección del renderer (delegada al registry)
- Estructura del objeto EVENT_RENDERERS (mantener formato)

### Cómo Extender Renderers Existentes

**Opción 1: Modificar renderer existente** (si cambia lógica de ese tipo)
```typescript
// ProjectEventRenderer.tsx
export const ProjectEventRenderer: EventRenderer = ({ event, view }) => {
  // Agregar nueva lógica específica de Proyecto
};
```

**Opción 2: Crear variante** (si necesitas comportamiento alternativo)
```typescript
// ProjectEventRendererCompact.tsx
export const ProjectEventRendererCompact: EventRenderer = ...

// Registrar ambos con nombres diferentes
EVENT_RENDERERS = {
  'Proyecto': ProjectEventRenderer,
  'ProyectoCompacto': ProjectEventRendererCompact
}
```

### Testing Recomendado

```typescript
// event-renderers/__tests__/ProjectEventRenderer.test.tsx
import { render, screen } from '@testing-library/react';
import { ProjectEventRenderer } from '../ProjectEventRenderer';

describe('ProjectEventRenderer', () => {
  it('debe renderizar título del evento', () => {
    const mockEvent = {
      id: '1',
      title: 'Test Proyecto',
      type: 'Proyecto' as const
    };

    render(<ProjectEventRenderer event={mockEvent} view="month" />);

    expect(screen.getByText('Test Proyecto')).toBeInTheDocument();
  });
});
```

**Beneficio:** Test renderer sin necesidad de montar calendario completo ni simular Firebase.

---

## 🎓 Conceptos Técnicos

### Registry Pattern Explicado

```typescript
// En lugar de condicionales (no escalable):
function renderEvent(event) {
  if (event.type === 'Proyecto') return <ProjectSummary />;
  else if (event.type === 'Visita') return <VisitSummary />;
  else if (event.type === 'Postventa') return <AfterSalesSummary />;
  // ... agregar nuevo tipo requiere modificar AQUÍ
}

// Registry Pattern (escalable):
const REGISTRY = {
  'Proyecto': ProjectRenderer,
  'Visita': VisitRenderer,
  'Postventa': AfterSalesRenderer
  // ... agregar nuevo tipo solo requiere nueva línea
};

function renderEvent(event) {
  const Renderer = REGISTRY[event.type] || DefaultRenderer;
  return <Renderer event={event} />;
}
```

### Type Safety con TypeScript

```typescript
// El registry garantiza type safety
export const EVENT_RENDERERS = {
  'Proyecto': ProjectEventRenderer,
  'Visita': VisitEventRenderer
} as const satisfies Record<string, EventRenderer>;

// TypeScript infiere automáticamente:
type ValidEventType = keyof typeof EVENT_RENDERERS;
// 'Proyecto' | 'Visita'
```

---

## 📖 Documentación Relacionada

### Documentación Activa
- **Patrones establecidos:** [claude-docs/references/patterns.md](../../claude-docs/references/patterns.md)
- **Arquitectura del proyecto:** [claude-docs/context/architecture.md](../../claude-docs/context/architecture.md)

### Proceso de Implementación (Archivado)
El proceso detallado de implementación (plan fase 1-4, changelog, lecciones) está archivado en:

**Ubicación:** [docs/technical/migrations/archived/calendar-event-2025-process/](./migrations/archived/calendar-event-2025-process/)

**Contenido:**
- Plan de implementación original (fases, estimaciones)
- Changelog detallado (commits, duración real, lecciones)
- Código de ejemplos completo (código de referencia usado)

**Cuándo consultar:**
- Si necesitas entender el "por qué" de decisiones específicas
- Para referencia si implementas refactoring similar
- Contexto histórico para auditoría o documentación

---

## ✅ Validación del Sistema

### Criterios de Funcionamiento Correcto

**Funcionales:**
- ✅ Eventos se renderizan en las 3 vistas (mes, semana, día)
- ✅ Drag & drop funciona correctamente
- ✅ Click en evento abre modal correspondiente
- ✅ Estilos correctos en modo claro y oscuro

**Técnicos:**
```bash
npm run build        # ✅ Sin errores
npm run typecheck    # ✅ Sin errores TypeScript
npm run lint         # ✅ Sin errores ESLint críticos
```

**Arquitecturales:**
- ✅ Agregar nuevo tipo requiere solo 2 archivos (renderer + 1 línea registry)
- ✅ Código existente no se modifica para extensiones
- ✅ Cada renderer es independiente y testeable sin dependencias

---

## 🔄 Changelog Resumido

**Implementación:** Septiembre 29, 2025
**Duración:** ~2 horas (4 fases)
**Código eliminado:** 239 líneas (calendar-event.tsx)
**Código nuevo:** ~250 líneas (event-renderers/ + CalendarEventCard)
**Breaking changes:** 0
**Errores de validación:** 0

**Commits principales:**
- `4a59fbb` - feat: Crear estructura event-renderers con Registry Pattern
- `dacf602` - feat: Completar Fase 2 - CalendarEventCard con Registry Pattern
- `cba2156` - feat: Completar Fase 3 - Migrar vistas a CalendarEventCard
- `a598625` - feat: Completar Fase 4 - Eliminar componente legacy calendar-event.tsx

**Para changelog completo:** Ver [implementation-log.md](./migrations/archived/calendar-event-2025-process/implementation-log.md)

---

**Última actualización:** Septiembre 2025
**Mantenido por:** Equipo CalReact
**Estado:** ✅ Producción estable