# 🚀 Calendar Event Refactoring - Referencia Rápida

**Para plan completo:** [calendar-event-refactoring.md](./calendar-event-refactoring.md)
**Para código completo:** [calendar-event-code-examples.md](./calendar-event-code-examples.md)

---

## 🎯 Resumen Ejecutivo

**Qué:** Refactorizar `calendar-event.tsx` (239 líneas con conditionals) → `CalendarEventCard.tsx` con Registry Pattern

**Por qué:** Eliminar conditionals hardcodeados que no escalan para múltiples tipos de eventos (Proyecto, Visita, Postventa)

**Cómo:** Registry Pattern - cada tipo de evento tiene su propio renderer

**Cuándo:** Listo para implementación (3-4 horas estimadas)

---

## 📂 Estructura Final

```
src/components/calendar/
├── event-renderers/                    # NUEVO
│   ├── ProjectEventRenderer.tsx        # Lógica específica Proyecto
│   ├── DefaultEventRenderer.tsx        # Lógica genérica fallback
│   └── index.ts                        # Registry + tipos
│
├── CalendarEventCard.tsx               # NUEVO - Reemplazo
├── calendar-event.tsx                  # ELIMINAR tras migración
├── month-view.tsx                      # Actualizar import
├── week-view.tsx                       # Actualizar import
└── day-view.tsx                        # Actualizar import
```

---

## ✅ Checklist Rápido

### Fase 1: Preparación ✅ COMPLETADA (Sep 29, 2025)
```bash
- [x] mkdir src/components/calendar/event-renderers/
- [x] Crear ProjectEventRenderer.tsx (1.7 KB - lógica extraída líneas 201-222)
- [x] Crear DefaultEventRenderer.tsx (1.8 KB - lógica extraída líneas 224-236)
- [x] Crear index.ts con EVENT_RENDERERS (1.8 KB - registry implementado)
- [x] npm run typecheck && npm run lint (0 errores)
```

**Archivos creados:**
- `src/components/calendar/event-renderers/ProjectEventRenderer.tsx`
- `src/components/calendar/event-renderers/DefaultEventRenderer.tsx`
- `src/components/calendar/event-renderers/index.ts`

**Validación:**
- TypeScript: ✅ 0 errores
- ESLint: ✅ 0 warnings nuevos
- Funcionalidad: ✅ Calendario sin cambios (como esperado)

### Fase 2: CalendarEventCard (60-90 min)
```bash
- [ ] Crear CalendarEventCard.tsx
- [ ] Copiar hooks de calendar-event.tsx
- [ ] Implementar lógica registry: const Renderer = EVENT_RENDERERS[type] || Default
- [ ] npm run typecheck && npm run lint && npm run dev
```

### Fase 3: Migración Vistas (45-60 min)
```bash
- [ ] month-view.tsx: Cambiar import + componente → validar
- [ ] week-view.tsx: Cambiar import + componente → validar
- [ ] day-view.tsx: Cambiar import + componente → validar
- [ ] npm run lint && npm run typecheck por cada vista
```

### Fase 4: Limpieza (15-30 min)
```bash
- [ ] Deprecar calendar-event.tsx (comentario @deprecated)
- [ ] grep -r "CalendarEvent" → verificar sin referencias
- [ ] rm calendar-event.tsx
- [ ] Actualizar patterns.md
- [ ] npm run build
```

---

## 📊 Estado de Implementación

**Última actualización:** Septiembre 29, 2025

### Progreso General: 25% Completado

```
[████████░░░░░░░░░░░░░░░░░░░░] 25%

Fase 1: ✅ Completada (Sep 29, 2025)
Fase 2: 🔄 Siguiente
Fase 3: ⏳ Pendiente
Fase 4: ⏳ Pendiente
```

### Detalles de Fase 1 Completada

**Duración real:** ~25 minutos (estimado: 30-45 min) ✅
**Archivos creados:** 3 (ProjectEventRenderer, DefaultEventRenderer, index)
**Tamaño total:** ~5.3 KB de código nuevo
**Validaciones:** TypeScript ✅ ESLint ✅ Build ✅

**Código creado sin breaking changes:**
- Registry Pattern implementado correctamente
- Renderers extraídos de calendar-event.tsx
- Documentación inline completa
- Tipos TypeScript bien definidos

**Próximo paso:** Fase 2 - Crear CalendarEventCard.tsx

---

## 🔍 Comandos Críticos

### Validación (OBLIGATORIO)
```bash
npm run lint && npm run typecheck  # Después de CADA cambio
npm run dev                        # Puerto 3002
npm run build                      # Antes de finalizar
```

### Búsqueda de Referencias
```bash
# Buscar uso de CalendarEvent viejo
grep -r "CalendarEvent" src/components/calendar/ --include="*.tsx" | grep -v "CalendarEventCard"

# Listar archivos con imports viejos
grep -l "from './calendar-event'" src/components/calendar/*.tsx
```

### Navegación Rápida
```bash
# Ver estructura de renderers
ls -la src/components/calendar/event-renderers/

# Ver registry
cat src/components/calendar/event-renderers/index.ts

# Ver componente principal
cat src/components/calendar/CalendarEventCard.tsx
```

---

## 💡 Conceptos Clave

### Registry Pattern
```typescript
// En lugar de:
if (type === 'Proyecto') { <ProjectSummary /> }
else if (type === 'Visita') { <VisitSummary /> }
else { <Default /> }

// Usamos:
const REGISTRY = { 'Proyecto': ProjectRenderer, 'Visita': VisitRenderer }
const Renderer = REGISTRY[type] || DefaultRenderer
<Renderer event={event} />
```

### Beneficio Principal
```typescript
// Agregar nuevo tipo SIN modificar código existente:
// 1. Crear NuevoTipoRenderer.tsx (archivo nuevo)
// 2. Agregar a REGISTRY: { 'NuevoTipo': NuevoTipoRenderer }
// 3. Listo ✅
```

---

## ⚠️ Crítico Preservar

### Hooks (Mantener TODOS)
```typescript
const event = useValidatedEvent(originalEvent);
const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({...});
const {setNodeRef: setDroppableRef, isOver} = useDroppable({...});
```

### Estilos CSS
```typescript
className={cn(
  "bg-card dark:bg-[hsl(240,5%,12%)] text-card-foreground",
  "border border-border/60",
  "border-l-4",
  // ... mantener todos
)}
```

### Data Attributes
```typescript
data-calendar-event="true"  // ← CRÍTICO para detección de clicks
```

---

## 📊 Comparación Antes/Después

### Agregar Nuevo Tipo de Evento

#### ❌ ANTES (calendar-event.tsx)
```
1. Abrir calendar-event.tsx (239 líneas)
2. Encontrar condicional (línea 201)
3. Agregar else if anidado
4. Importar VisitSummary
5. Riesgo de romper Proyecto
6. Tests afectados
```

#### ✅ DESPUÉS (CalendarEventCard + Registry)
```
1. Crear VisitEventRenderer.tsx (20 líneas)
2. Agregar a registry: 'Visita': VisitEventRenderer
3. Listo - código existente intacto
```

---

## 🔄 Flujo de Datos

```
Firestore (projectEvents collection)
    ↓
projectEventService.ts
    ↓
ProjectEventType (tipo específico)
    ↓
calendarEventService.ts (conversión)
    ↓
EventType (tipo unificado)
    ↓
CalendarEventCard (selecciona renderer desde registry)
    ↓
ProjectEventRenderer | DefaultEventRenderer | VisitEventRenderer
    ↓
UI renderizado
```

---

## 🎯 Criterios de Éxito

### Funcionales
- ✅ Eventos se renderizan en 3 vistas (mes/semana/día)
- ✅ Drag & drop funciona
- ✅ Click abre modal correcto
- ✅ Estilos correctos (claro/oscuro)

### Técnicos
- ✅ `npm run build` sin errores
- ✅ `npm run typecheck` sin errores
- ✅ `npm run lint` sin errores
- ✅ No hay referencias a `calendar-event.tsx`

### Arquitecturales
- ✅ Agregar nuevo tipo requiere solo 2 archivos (renderer + registry)
- ✅ Código existente no se modifica para extensiones
- ✅ Cada renderer es independiente y testeable

---

## 📝 Estado de Implementación

**Status:** 📋 Planificado - Listo para implementar

**Checklist de tracking:**
```
Fase 1: [ ] Preparación
Fase 2: [ ] CalendarEventCard
Fase 3: [ ] Migración Vistas
Fase 4: [ ] Limpieza
Fase 5: [ ] Expansión (futuro)
```

**Actualizar este archivo al completar cada fase** ✏️

---

## 🚀 Próximos Pasos Inmediatos

1. **Iniciar con Fase 1:**
   ```bash
   mkdir src/components/calendar/event-renderers/
   ```

2. **Seguir plan detallado:**
   - Archivo completo: [calendar-event-refactoring.md](./calendar-event-refactoring.md)
   - Código copy/paste: [calendar-event-code-examples.md](./calendar-event-code-examples.md)

3. **Validar constantemente:**
   ```bash
   npm run lint && npm run typecheck  # Después de CADA cambio
   ```

---

## 📚 Referencias de Archivos

### Documentación
- **Plan completo:** `/docs/technical/calendar-event-refactoring.md`
- **Código completo:** `/docs/technical/calendar-event-code-examples.md`
- **Esta referencia:** `/docs/technical/calendar-event-quick-reference.md`

### Código Actual
- **Componente actual:** `src/components/calendar/calendar-event.tsx` (239 líneas)
- **Vistas que usan:** `month-view.tsx`, `week-view.tsx`, `day-view.tsx`
- **Servicios:** `projectEventService.ts`, `calendarEventService.ts`
- **Tipos:** `src/types/event.ts` (EventType), `src/types/project.ts` (ProjectEventType)

### Código Futuro
- **Renderers:** `src/components/calendar/event-renderers/`
- **Nuevo componente:** `src/components/calendar/CalendarEventCard.tsx`

---

## 🧪 Testing (Futuro)

**Después de completar implementación**, crear tests para:

```
event-renderers/__tests__/
├── ProjectEventRenderer.test.tsx
├── DefaultEventRenderer.test.tsx
└── VisitEventRenderer.test.tsx

calendar/__tests__/
├── CalendarEventCard.test.tsx
└── calendar-views.integration.test.tsx
```

**Beneficio:** Cada renderer testeable independientemente sin montar calendario completo

---

## 💬 Decisión Arquitectural

**Problema:** `calendar-event.tsx` con conditionals hardcodeados no escala

**Opciones evaluadas:**
1. ❌ Mantener conditionals y seguir agregando `else if`
2. ✅ **Registry Pattern** (seleccionada)
3. ❌ Render Props Pattern (más verboso)

**Por qué Registry Pattern:**
- Open/Closed Principle (extensión sin modificación)
- Single Responsibility (cada renderer independiente)
- Escalable (10+ tipos de eventos sin complejidad)
- Testeable (componentes aislados)
- Estándar en React para este problema

---

**Última actualización:** Septiembre 2025
**Estado:** Listo para implementación
**Tiempo estimado:** 3-4 horas
**Prioridad:** Media-Alta