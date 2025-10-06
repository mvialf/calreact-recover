# 📝 Calendar Event Refactoring - Ejemplos de Código Implementados

**Complemento de:** [calendar-event-refactoring.md](./calendar-event-refactoring.md)
**Propósito:** Código YA IMPLEMENTADO en producción (Sep 29, 2025)
**Status:** ✅ Estos ejemplos están activos en el codebase

---

## 📋 Índice de Ejemplos

1. [Registry y Tipos](#1-registry-y-tipos)
2. [ProjectEventRenderer](#2-projecteventrenderer)
3. [DefaultEventRenderer](#3-defaulteventrenderer)
4. [CalendarEventCard](#4-calendareventcard)
5. [Migraciones de Vistas](#5-migraciones-de-vistas)
6. [Tests Futuros](#6-tests-futuros)

---

## 1. Registry y Tipos

### `src/components/calendar/event-renderers/index.ts`

```typescript
// src/components/calendar/event-renderers/index.ts
import type { EventType } from '@/types/event';
import { ProjectEventRenderer } from './ProjectEventRenderer';
import { DefaultEventRenderer } from './DefaultEventRenderer';

/**
 * Props comunes para todos los event renderers
 */
export interface EventRendererProps {
  event: EventType;
  view: 'month' | 'week' | 'day';
}

/**
 * Tipo para componentes renderer de eventos
 */
export type EventRenderer = React.FC<EventRendererProps>;

/**
 * Registry de renderers por tipo de evento
 *
 * Para agregar nuevo tipo:
 * 1. Crear NuevoTipoRenderer.tsx en este directorio
 * 2. Importar arriba
 * 3. Agregar al objeto EVENT_RENDERERS
 * 4. Listo - CalendarEventCard lo seleccionará automáticamente
 */
export const EVENT_RENDERERS: Record<string, EventRenderer> = {
  'Proyecto': ProjectEventRenderer,
  // FUTURO: Descomentar cuando se implementen
  // 'Visita': VisitEventRenderer,
  // 'Postventa': AfterSalesEventRenderer,
} as const;

/**
 * Exportar renderers individuales para uso directo si se necesita
 */
export { ProjectEventRenderer } from './ProjectEventRenderer';
export { DefaultEventRenderer } from './DefaultEventRenderer';
```

---

## 2. ProjectEventRenderer

### `src/components/calendar/event-renderers/ProjectEventRenderer.tsx`

```typescript
// src/components/calendar/event-renderers/ProjectEventRenderer.tsx
import type { EventRendererProps } from './index';
import { ProjectSummary } from '@/components/summary';

/**
 * Renderer específico para eventos de tipo 'Proyecto'
 *
 * Renderiza:
 * - ProjectSummary con número, cliente y glosa
 * - Comuna del proyecto (fullAddress.comune o componentes.comuna)
 *
 * @param event - Evento de calendario con campos específicos de proyecto
 * @param view - Vista actual del calendario (month/week/day)
 */
export const ProjectEventRenderer: React.FC<EventRendererProps> = ({ event, view }) => {
  return (
    <div className="space-y-1">
      {/* Componente reutilizable de ProjectSummary */}
      <ProjectSummary
        project={{
          projectNumber: event.projectNumber,
          clientName: event.clientName,
          glosa: event.glosa
        }}
        className="text-foreground text-xs"
      />

      {/* Mostrar comuna si está disponible */}
      {event.fullAddress?.comune && (
        <p className="text-xs text-muted-foreground truncate">
          {event.fullAddress.comune}
        </p>
      )}

      {/* Fallback: mostrar desde componentes si existe */}
      {!event.fullAddress?.comune && event.fullAddress?.componentes?.comuna && (
        <p className="text-xs text-muted-foreground truncate">
          {event.fullAddress.componentes.comuna}
        </p>
      )}
    </div>
  );
};
```

---

## 3. DefaultEventRenderer

### `src/components/calendar/event-renderers/DefaultEventRenderer.tsx`

```typescript
// src/components/calendar/event-renderers/DefaultEventRenderer.tsx
import { isSameDay } from 'date-fns';
import type { EventRendererProps } from './index';

/**
 * Formatea fecha local en formato legible
 */
const formatLocalDate = (date: Date): string => {
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short'
  });
};

/**
 * Renderer por defecto para eventos sin renderer específico
 *
 * Renderiza:
 * - Nombre del evento (siempre)
 * - Rango de fechas (si es multi-día)
 * - Descripción (si es un solo día y no es vista mes)
 *
 * @param event - Evento de calendario genérico
 * @param view - Vista actual del calendario (month/week/day)
 */
export const DefaultEventRenderer: React.FC<EventRendererProps> = ({ event, view }) => {
  // Determinar si el evento abarca múltiples días
  const isMultiDay = !isSameDay(event.startDate, event.endDate);

  return (
    <>
      {/* Nombre del evento siempre visible */}
      <div className="font-semibold truncate">{event.name}</div>

      {/* Mostrar rango de fechas solo para eventos multi-día */}
      {isMultiDay && (
        <div className="text-xs opacity-80 truncate">
          {formatLocalDate(event.startDate)} - {formatLocalDate(event.endDate)}
        </div>
      )}

      {/* Mostrar descripción para eventos de un día en vistas week/day */}
      {!isMultiDay && view !== 'month' && event.description && (
        <p className="text-xs truncate opacity-75 mt-0.5">
          {event.description}
        </p>
      )}
    </>
  );
};
```

---

## 4. CalendarEventCard

### `src/components/calendar/CalendarEventCard.tsx`

```typescript
// src/components/calendar/CalendarEventCard.tsx
"use client";

import { useMemo } from 'react';
import type { EventType } from '@/types/event';
import { format, isSameDay } from '@/lib/calendar-utils';
import { isValid } from 'date-fns';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type React from 'react';
import { eventLogger } from '@/lib/logger';
import { EVENT_RENDERERS, DefaultEventRenderer } from './event-renderers';

interface CalendarEventCardProps {
  event: EventType;
  onClick: (event: EventType) => void;
  view: 'month' | 'week' | 'day';
  enableDragAndDrop?: boolean;
  enableResizing?: boolean;
}

/**
 * Hook para validar y normalizar las fechas del evento
 */
const useValidatedEvent = (event: EventType) => {
  return useMemo(() => {
    try {
      // Crear nuevas instancias de fecha para evitar mutaciones
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      // Validar que las fechas sean válidas
      if (!isValid(startDate) || !isValid(endDate)) {
        eventLogger.error('Fechas de evento inválidas', { startDate, endDate });
        return null;
      }

      return {
        ...event,
        startDate,
        endDate
      };
    } catch (error) {
      eventLogger.error('Error al procesar fechas del evento', error);
      return null;
    }
  }, [event]);
};

/**
 * Componente de tarjeta de evento para calendario
 *
 * Características:
 * - Usa Registry Pattern para seleccionar renderer apropiado por tipo
 * - Soporta drag & drop con @dnd-kit
 * - Valida fechas antes de renderizar
 * - Maneja estilos de hover, dragging y drop
 *
 * @param event - Evento a renderizar (EventType)
 * @param onClick - Handler para click en evento
 * @param view - Vista actual del calendario (month/week/day)
 * @param enableDragAndDrop - Habilitar funcionalidad de arrastrar y soltar
 */
export function CalendarEventCard({
  event: originalEvent,
  onClick,
  view,
  enableDragAndDrop
}: CalendarEventCardProps) {
  // 🔥 TODOS LOS HOOKS AL INICIO - ANTES DE CUALQUIER EARLY RETURN

  // Hook para validar evento
  const event = useValidatedEvent(originalEvent);

  // Hook para preparar datos del evento para arrastre
  const eventData = useMemo(() => {
    if (!event) return null;
    return {
      type: 'event',
      event: {
        ...event,
        // Asegurarse de que las fechas sean serializables
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        name: event.name,
        description: event.description,
        color: event.color,
        // Incluir todos los campos del evento
        ...(event as any)
      }
    };
  }, [event]);

  // Hook para configurar draggable
  const {attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging} = useDraggable({
    id: event?.id || 'invalid-event',
    data: eventData || undefined,
    disabled: !enableDragAndDrop || !event,
  });

  // Hook para configurar droppable
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

  // Hook para verificar si es multi-día
  const isMultiDay = useMemo(() => {
    if (!event) return false;
    return !isSameDay(event.startDate, event.endDate);
  }, [event]);

  // 🎯 NUEVA LÓGICA: Selección de renderer desde registry
  const Renderer = event ? (EVENT_RENDERERS[event.type] || DefaultEventRenderer) : DefaultEventRenderer;

  // Early return después de todos los hooks
  if (!event) {
    eventLogger.warn('Intento de renderizar evento inválido');
    return null;
  }

  /**
   * Formatea fecha local para tooltip
   */
  const formatLocalDate = (date: Date): string => {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Genera texto de tooltip con información del evento
   */
  const getTooltipText = (): string => {
    const parts = [event.name];

    if (isMultiDay) {
      parts.push(`${formatLocalDate(event.startDate)} - ${formatLocalDate(event.endDate)}`);
    } else {
      parts.push(formatLocalDate(event.startDate));
    }

    if (event.description) {
      parts.push(event.description);
    }

    return parts.join('\n');
  };

  /**
   * Maneja click en evento, evita propagación
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(event);
  };

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
        borderLeftColor: event.color || 'hsl(var(--primary))',
      }}
      className={cn(
        "bg-card dark:bg-[hsl(240,5%,12%)] text-card-foreground",
        "border border-border/60",
        "border-l-4",
        "p-1.5 rounded-md text-xs overflow-hidden shadow-sm hover:shadow-md relative",
        isDragging ? "shadow-2xl" : "hover:shadow-md",
        isOver ? "ring-2 ring-primary ring-offset-1" : ""
      )}
      onClick={handleClick}
      title={getTooltipText()}
      data-calendar-event="true" // Mantener para detección de clicks en padre
    >
      {/* 🎯 RENDERIZADO DINÁMICO CON REGISTRY PATTERN */}
      <Renderer event={event} view={view} />
    </div>
  );
}
```

---

## 5. Migraciones de Vistas

### 5.1 Migración de `month-view.tsx`

```typescript
// CAMBIOS EN: src/components/calendar/month-view.tsx

// ❌ ANTES:
import { CalendarEvent } from './calendar-event';

// ✅ DESPUÉS:
import { CalendarEventCard } from './CalendarEventCard';

// ... en el código de renderizado:

// ❌ ANTES:
<CalendarEvent
  key={event.id}
  event={event}
  onClick={handleEventClick}
  view="month"
  enableDragAndDrop={enableDragAndDrop}
/>

// ✅ DESPUÉS:
<CalendarEventCard
  key={event.id}
  event={event}
  onClick={handleEventClick}
  view="month"
  enableDragAndDrop={enableDragAndDrop}
/>
```

### 5.2 Migración de `week-view.tsx`

```typescript
// CAMBIOS EN: src/components/calendar/week-view.tsx

// ❌ ANTES:
import { CalendarEvent } from './calendar-event';

// ✅ DESPUÉS:
import { CalendarEventCard } from './CalendarEventCard';

// ... en el código de renderizado:

// ❌ ANTES:
<CalendarEvent
  key={event.id}
  event={event}
  onClick={handleEventClick}
  view="week"
  enableDragAndDrop={enableDragAndDrop}
/>

// ✅ DESPUÉS:
<CalendarEventCard
  key={event.id}
  event={event}
  onClick={handleEventClick}
  view="week"
  enableDragAndDrop={enableDragAndDrop}
/>
```

### 5.3 Migración de `day-view.tsx`

```typescript
// CAMBIOS EN: src/components/calendar/day-view.tsx

// ❌ ANTES:
import { CalendarEvent } from './calendar-event';

// ✅ DESPUÉS:
import { CalendarEventCard } from './CalendarEventCard';

// ... en el código de renderizado:

// ❌ ANTES:
<CalendarEvent
  key={event.id}
  event={event}
  onClick={handleEventClick}
  view="day"
  enableDragAndDrop={enableDragAndDrop}
/>

// ✅ DESPUÉS:
<CalendarEventCard
  key={event.id}
  event={event}
  onClick={handleEventClick}
  view="day"
  enableDragAndDrop={enableDragAndDrop}
/>
```

---

## 6. Tests Futuros

### 6.1 Test de ProjectEventRenderer

```typescript
// src/components/calendar/event-renderers/__tests__/ProjectEventRenderer.test.tsx
import { render, screen } from '@testing-library/react';
import { ProjectEventRenderer } from '../ProjectEventRenderer';
import type { EventType } from '@/types/event';

describe('ProjectEventRenderer', () => {
  const mockProjectEvent: EventType = {
    id: '1',
    name: 'Proyecto Test',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-15'),
    type: 'Proyecto',
    referenceId: 'proj-123',
    projectNumber: '2025-001',
    clientName: 'Cliente Test',
    glosa: 'Glosa Test',
    fullAddress: {
      comune: 'Santiago',
    },
  };

  it('debe renderizar ProjectSummary con datos correctos', () => {
    render(<ProjectEventRenderer event={mockProjectEvent} view="month" />);

    // Verificar que ProjectSummary se renderiza (depende de implementación de ProjectSummary)
    expect(screen.getByText(/2025-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Cliente Test/i)).toBeInTheDocument();
  });

  it('debe mostrar comuna cuando está disponible', () => {
    render(<ProjectEventRenderer event={mockProjectEvent} view="month" />);

    expect(screen.getByText('Santiago')).toBeInTheDocument();
  });

  it('debe mostrar comuna desde componentes como fallback', () => {
    const eventWithComponentes = {
      ...mockProjectEvent,
      fullAddress: {
        componentes: {
          comuna: 'Providencia',
        },
      },
    };

    render(<ProjectEventRenderer event={eventWithComponentes} view="month" />);

    expect(screen.getByText('Providencia')).toBeInTheDocument();
  });
});
```

### 6.2 Test de DefaultEventRenderer

```typescript
// src/components/calendar/event-renderers/__tests__/DefaultEventRenderer.test.tsx
import { render, screen } from '@testing-library/react';
import { DefaultEventRenderer } from '../DefaultEventRenderer';
import type { EventType } from '@/types/event';

describe('DefaultEventRenderer', () => {
  const mockEvent: EventType = {
    id: '1',
    name: 'Evento Genérico',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-15'),
    type: 'Visita',
    referenceId: 'visit-123',
    description: 'Descripción del evento',
  };

  it('debe renderizar nombre del evento', () => {
    render(<DefaultEventRenderer event={mockEvent} view="month" />);

    expect(screen.getByText('Evento Genérico')).toBeInTheDocument();
  });

  it('debe mostrar descripción en vista week para evento de un día', () => {
    render(<DefaultEventRenderer event={mockEvent} view="week" />);

    expect(screen.getByText('Descripción del evento')).toBeInTheDocument();
  });

  it('NO debe mostrar descripción en vista month', () => {
    render(<DefaultEventRenderer event={mockEvent} view="month" />);

    expect(screen.queryByText('Descripción del evento')).not.toBeInTheDocument();
  });

  it('debe mostrar rango de fechas para evento multi-día', () => {
    const multiDayEvent = {
      ...mockEvent,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-17'),
    };

    render(<DefaultEventRenderer event={multiDayEvent} view="month" />);

    // Verificar que se muestra algún formato de rango de fechas
    expect(screen.getByText(/15.*17/)).toBeInTheDocument();
  });
});
```

### 6.3 Test de CalendarEventCard

```typescript
// src/components/calendar/__tests__/CalendarEventCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarEventCard } from '../CalendarEventCard';
import { DndContext } from '@dnd-kit/core';
import type { EventType } from '@/types/event';

describe('CalendarEventCard', () => {
  const mockOnClick = jest.fn();

  const mockProjectEvent: EventType = {
    id: '1',
    name: 'Proyecto Test',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-15'),
    type: 'Proyecto',
    referenceId: 'proj-123',
    projectNumber: '2025-001',
    clientName: 'Cliente Test',
  };

  const mockGenericEvent: EventType = {
    id: '2',
    name: 'Evento Genérico',
    startDate: new Date('2025-01-16'),
    endDate: new Date('2025-01-16'),
    type: 'Visita',
    referenceId: 'visit-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe seleccionar ProjectEventRenderer para tipo Proyecto', () => {
    render(
      <DndContext>
        <CalendarEventCard
          event={mockProjectEvent}
          onClick={mockOnClick}
          view="month"
        />
      </DndContext>
    );

    // Verificar que se renderiza contenido específico de proyecto
    expect(screen.getByText(/2025-001/)).toBeInTheDocument();
  });

  it('debe seleccionar DefaultEventRenderer para tipo sin renderer específico', () => {
    render(
      <DndContext>
        <CalendarEventCard
          event={mockGenericEvent}
          onClick={mockOnClick}
          view="month"
        />
      </DndContext>
    );

    // Verificar que se renderiza contenido genérico
    expect(screen.getByText('Evento Genérico')).toBeInTheDocument();
  });

  it('debe llamar onClick cuando se hace click en el evento', () => {
    render(
      <DndContext>
        <CalendarEventCard
          event={mockProjectEvent}
          onClick={mockOnClick}
          view="month"
        />
      </DndContext>
    );

    const eventCard = screen.getByTitle(/Proyecto Test/i);
    fireEvent.click(eventCard);

    expect(mockOnClick).toHaveBeenCalledWith(mockProjectEvent);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar con estilos de drag cuando isDragging', () => {
    // Test más complejo que requiere mockear @dnd-kit
    // Omitido por brevedad, pero se puede implementar
  });

  it('debe retornar null si el evento es inválido', () => {
    const invalidEvent = {
      ...mockProjectEvent,
      startDate: new Date('invalid'),
    };

    const { container } = render(
      <DndContext>
        <CalendarEventCard
          event={invalidEvent}
          onClick={mockOnClick}
          view="month"
        />
      </DndContext>
    );

    expect(container.firstChild).toBeNull();
  });

  it('debe tener data-calendar-event attribute para detección de clicks', () => {
    render(
      <DndContext>
        <CalendarEventCard
          event={mockProjectEvent}
          onClick={mockOnClick}
          view="month"
        />
      </DndContext>
    );

    const eventCard = screen.getByTitle(/Proyecto Test/i);
    expect(eventCard).toHaveAttribute('data-calendar-event', 'true');
  });
});
```

---

## 7. Comandos Útiles Durante Implementación

### Validación continua
```bash
# Después de cada cambio (OBLIGATORIO)
npm run lint && npm run typecheck

# Iniciar servidor desarrollo
npm run dev

# Abrir navegador
http://localhost:3002/calreact
```

### Buscar referencias
```bash
# Buscar uso de CalendarEvent viejo
grep -r "CalendarEvent" src/components/calendar/ --include="*.tsx" | grep -v "CalendarEventCard"

# Buscar imports del componente viejo
grep -r "from './calendar-event'" src/components/calendar/

# Listar archivos que importan CalendarEvent
grep -l "CalendarEvent" src/components/calendar/*.tsx
```

### Verificar estructura
```bash
# Listar renderers creados
ls -la src/components/calendar/event-renderers/

# Ver contenido de registry
cat src/components/calendar/event-renderers/index.ts
```

### Git durante implementación
```bash
# Commit por fase
git add src/components/calendar/event-renderers/
git commit -m "feat: Crear estructura event-renderers con registry pattern"

git add src/components/calendar/CalendarEventCard.tsx
git commit -m "feat: Crear CalendarEventCard con registry pattern"

git add src/components/calendar/month-view.tsx
git commit -m "feat: Migrar month-view a CalendarEventCard"

# ... y así sucesivamente
```

---

## 🎉 Estado del Código

**Fecha de creación:** Septiembre 2025
**Fecha de implementación:** Septiembre 29, 2025
**Estado:** ✅ CÓDIGO EN PRODUCCIÓN

### Commits Relacionados
```bash
4a59fbb - feat: Crear estructura event-renderers con Registry Pattern
dacf602 - feat: Completar Fase 2 - CalendarEventCard con Registry Pattern
cba2156 - feat: Completar Fase 3 - Migrar vistas a CalendarEventCard
a598625 - feat: Completar Fase 4 - Eliminar componente legacy calendar-event.tsx
```

### Archivos Implementados
- ✅ `src/components/calendar/event-renderers/index.ts`
- ✅ `src/components/calendar/event-renderers/ProjectEventRenderer.tsx`
- ✅ `src/components/calendar/event-renderers/DefaultEventRenderer.tsx`
- ✅ `src/components/calendar/CalendarEventCard.tsx`

### Archivos Migrados
- ✅ `src/components/calendar/month-view.tsx`
- ✅ `src/components/calendar/week-view.tsx`
- ✅ `src/components/calendar/day-view.tsx`

### Archivos Eliminados
- ✅ `src/components/calendar/calendar-event.tsx` (239 líneas removidas)

**Nota:** Este documento ahora sirve como referencia del código implementado, no como guía de implementación.

---

**Complemento de:** [calendar-event-refactoring.md](./calendar-event-refactoring.md)
**Propósito:** Referencia del código implementado en producción