# 📋 Plan de Implementación: Eliminar Status de Eventos

**Fecha:** 2025-10-06
**Objetivo:** Simplificar arquitectura eliminando campo `status` de eventos
**Estrategia:** Status global del proyecto (fuente de verdad única)

---

## 🎯 Resumen Ejecutivo

### Decisión Arquitectural
**ELIMINAR** campo `status` de `ProjectEventType` y obtenerlo siempre del proyecto padre.

### Justificación
- **Respuestas del usuario:**
  - 1-3 eventos por proyecto (volumen bajo)
  - Cambio de status ocasional (priorizar simplicidad)
  - Agregar dropdown a EventViewDialog (edición desde modal)
  - Proyecto es fuente de verdad (actualizar proyecto)

- **Beneficios:**
  - ✅ Máxima simplicidad (cero sincronización)
  - ✅ Cero riesgo de desincronización
  - ✅ Una sola fuente de verdad
  - ✅ Menos código que mantener

- **Costo aceptable:**
  - +1 query al abrir EventViewDialog (mitigado por React Query cache)
  - Calendario requiere fetch combinado (patrón ya usado)

---

## 📊 Análisis de Impacto

### Archivos a Modificar

| Archivo | Tipo de Cambio | Complejidad | Prioridad |
|---------|----------------|-------------|-----------|
| `src/types/project.ts` | Eliminar campo `status` | Baja | Alta |
| `src/utils/eventValidation.ts` | Eliminar validación y copia | Media | Alta |
| `src/services/projectEventService.ts` | Actualizar tipos | Baja | Alta |
| `src/components/calendar/EventViewDialog.tsx` | Agregar dropdown + fetch proyecto | Media | Alta |
| `src/components/summary/project-event-details.tsx` | Recibir status como prop | Baja | Media |
| `src/types/event.ts` | Hacer status opcional (computado) | Baja | Media |

### Impacto en Features Existentes

**✅ Sin impacto:**
- Tabla de proyectos (usa `project.status` directamente)
- Formulario de proyectos (edita `project.status`)
- Creación de eventos (ya no copiará status)

**⚠️ Requiere ajuste:**
- EventViewDialog (agregar dropdown + fetch proyecto)
- ProjectEventDetails (recibir status como prop)
- Calendario (enriquecer eventos con status del proyecto)

---

## 🔧 Cambios Detallados por Archivo

### 1. `src/types/project.ts` (CRÍTICO)

**Línea 106** - Eliminar campo `status` de `ProjectEventType`:

```typescript
// ANTES:
export interface ProjectEventType {
  id: string;
  projectId: string;
  eventDate: Date;
  status: ProjectStatus;  // ← ELIMINAR
  // ... otros campos
}

// DESPUÉS:
export interface ProjectEventType {
  id: string;
  projectId: string;
  eventDate: Date;
  // status removido - se obtiene del proyecto padre
  // ... otros campos
}
```

**Justificación:** Elimina duplicación en el modelo de datos.

---

### 2. `src/utils/eventValidation.ts` (CRÍTICO)

**Cambio 1 - Línea 31-33:** Eliminar validación de status requerido

```typescript
// ANTES:
if (!eventData.status) {
  errors.push('Estado del evento es requerido');
}

// DESPUÉS:
// Validación eliminada - status viene del proyecto
```

**Cambio 2 - Línea 150:** Eliminar copia de status en `sanitizeProjectEventData`

```typescript
// ANTES (línea 150):
return {
  projectId: projectData.id,
  eventDate,
  description: eventData.description || projectData.description || '',
  phone: eventData.phone || projectData.phone || '',
  fullAddress: eventData.fullAddress || projectData.fullAddress || undefined,
  status: eventData.status || projectData.status,  // ← ELIMINAR
  windowsCount,
  squareMeters,
  uninstallTags,
  clientName,
  glosa: eventData.glosa || projectData.glosa,
  checklist: eventData.checklist || []
};

// DESPUÉS:
return {
  projectId: projectData.id,
  eventDate,
  description: eventData.description || projectData.description || '',
  phone: eventData.phone || projectData.phone || '',
  fullAddress: eventData.fullAddress || projectData.fullAddress || undefined,
  // status eliminado
  windowsCount,
  squareMeters,
  uninstallTags,
  clientName,
  glosa: eventData.glosa || projectData.glosa,
  checklist: eventData.checklist || []
};
```

**Cambio 3 - Línea 184:** Eliminar uso de status en `generateEventDisplayName`

```typescript
// ANTES:
const status = eventData?.status || projectData.status;
if (status && status !== 'ingresado') {
  parts.push(`(${status})`);
}

// DESPUÉS:
// Usar solo projectData.status (siempre disponible)
if (projectData.status && projectData.status !== 'ingresado') {
  parts.push(`(${projectData.status})`);
}
```

**Justificación:** Eventos ya no tienen status propio, siempre usar del proyecto.

---

### 3. `src/components/calendar/EventViewDialog.tsx` (NUEVA FUNCIONALIDAD)

**Agregar imports:**

```typescript
// Línea 18 - Agregar imports
import { ProjectStatusDropdown } from '@/components/summary/project-status-dropdown';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, updateProject } from '@/services/projectService';
import { useToast } from '@/hooks/use-toast';
```

**Agregar hook para fetch del proyecto:**

```typescript
// Después de la línea 42 (dentro del componente)
const queryClient = useQueryClient();
const { toast } = useToast();

// Fetch del proyecto solo si es evento de tipo 'Proyecto'
const { data: project, isLoading: isLoadingProject } = useQuery({
  queryKey: ['project', event.projectId],
  queryFn: () => getProject(event.projectId),
  enabled: event.type === 'Proyecto' && !!event.projectId,
});

// Mutation para actualizar status
const updateStatusMutation = useMutation({
  mutationFn: ({ projectId, status }: { projectId: string; status: string }) =>
    updateProject(projectId, { status }),
  onSuccess: () => {
    toast({
      title: 'Status actualizado',
      description: 'El estado del proyecto se actualizó correctamente.',
    });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
  },
  onError: (err: Error) => {
    toast({
      title: 'Error',
      description: `Error al actualizar el estado: ${err.message}`,
      variant: 'destructive',
    });
  },
});

const handleStatusChange = (projectId: string, newStatus: string) => {
  updateStatusMutation.mutate({ projectId, newStatus });
};
```

**Agregar dropdown en el DialogHeader (después de línea 97):**

```typescript
// Dentro del DialogHeader, después de la fecha
{event.type === 'Proyecto' && project && (
  <div className="mt-2">
    <ProjectStatusDropdown
      projectId={event.projectId}
      currentStatus={project.status}
      onStatusChange={handleStatusChange}
      isPending={updateStatusMutation.isPending}
    />
  </div>
)}
```

**Pasar status al ProjectEventDetails (línea 114):**

```typescript
// ANTES:
<ProjectEventDetails event={event} />

// DESPUÉS:
<ProjectEventDetails
  event={event}
  status={project?.status} // Pasar status del proyecto
/>
```

**Justificación:** Permite editar status desde el modal del evento, cumpliendo requisito del usuario.

---

### 4. `src/components/summary/project-event-details.tsx` (AJUSTE MENOR)

**Cambio en la interfaz (línea 9):**

```typescript
// ANTES:
interface ProjectEventDetailsProps {
  event: EventType;
}

// DESPUÉS:
interface ProjectEventDetailsProps {
  event: EventType;
  status?: string; // Status del proyecto (opcional, computado)
}
```

**Cambio en el componente (línea 29):**

```typescript
// ANTES:
export function ProjectEventDetails({ event }: ProjectEventDetailsProps) {

// DESPUÉS:
export function ProjectEventDetails({ event, status }: ProjectEventDetailsProps) {
```

**Actualizar uso de status (líneas 37, 44, 52-55):**

```typescript
// ANTES (línea 37):
if (!hasTechnicalDetails && !hasUninstallTags && !event.description && !event.phone && !event.status && !event.fullAddress) {

// DESPUÉS:
if (!hasTechnicalDetails && !hasUninstallTags && !event.description && !event.phone && !status && !event.fullAddress) {

// ANTES (línea 44):
{(event.phone || event.status) && (

// DESPUÉS:
{(event.phone || status) && (

// ANTES (líneas 52-55):
{event.status && (
  <div className="flex items-center gap-2">
    <Badge variant={getStatusBadgeVariant(event.status)}>
      {PROJECT_STATUS_OPTIONS.find(opt => opt.value === event.status)?.label || event.status}

// DESPUÉS:
{status && (
  <div className="flex items-center gap-2">
    <Badge variant={getStatusBadgeVariant(status)}>
      {PROJECT_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
```

**Justificación:** Componente ahora recibe status como prop en lugar de leerlo del evento.

---

### 5. `src/types/event.ts` (OPCIONAL - Si existe tipo EventType)

**Hacer status opcional (computado en runtime):**

```typescript
// Si existe definición de EventType que incluye status:
export interface EventType {
  // ... otros campos
  status?: ProjectStatus; // Opcional - computado desde proyecto
}
```

**Justificación:** Status se agrega en queries, no existe en Firestore.

---

### 6. Vista de Calendario (Enriquecimiento de Eventos)

**Ubicación probable:** `src/app/calreact/page.tsx` o componente de calendario

**Patrón a implementar:**

```typescript
// Fetch separado de eventos y proyectos
const { data: events } = useQuery(['events']);
const { data: projects } = useQuery(['projects']);

// Mapear proyectos para lookup rápido
const projectsMap = useMemo(
  () => new Map(projects?.map(p => [p.id, p]) || []),
  [projects]
);

// Enriquecer eventos con status del proyecto
const eventsWithStatus = useMemo(
  () => events?.map(event => ({
    ...event,
    status: event.type === 'Proyecto'
      ? projectsMap.get(event.projectId)?.status
      : undefined
  })),
  [events, projectsMap]
);

// Pasar eventos enriquecidos al calendario
<Calendar events={eventsWithStatus} />
```

**Justificación:** Calendario necesita mostrar badges de status, enriquecimiento se hace en cliente con React Query cache.

---

## 🔄 Orden de Implementación (Opción A: Incremental)

### Contexto: Por qué Incremental

**Código legacy identificado (commit d47e586):**
- Status obligatorio restaurado después de revert
- Validación que asume status requerido
- Arquitectura híbrida no intencional

**Estrategia Opción A elegida:**
- ✅ Código siempre funcional
- ✅ Commits progresivos
- ✅ Rollback fácil
- ✅ Checkpoints de seguridad

---

### Fase 0: Limpieza Preparatoria (Código Legacy) - 10 min

**Objetivo:** Eliminar código problemático del commit d47e586

1. **Hacer status opcional en tipo (temporal)**
   ```typescript
   // src/types/project.ts línea 106
   status?: ProjectStatus;  // Opcional durante transición
   ```

2. **Eliminar validación problemática**
   - `src/utils/eventValidation.ts` líneas 31-33 (validación de status)
   - `src/__tests__/helpers/test-data-factory.ts` línea 32 (comentario "obligatorio")

3. **Commit preparatorio**
   ```bash
   git checkout -b feature/eliminar-status-eventos
   npm run typecheck  # Verificar
   git commit -m "prep: Preparar tipos para eliminación de status"
   ```

**✅ Checkpoint 1:** Código pasa typecheck con status opcional.

**Justificación:** Elimina código más problemático inmediatamente mientras permite implementación incremental.

---

### Fase 1: Implementar Compensaciones (ANTES de eliminar status) - 30-45 min

**Objetivo:** Implementar toda la funcionalidad nueva que reemplazará status

1. **Modificar `EventViewDialog.tsx`**
   - Agregar imports (línea 18)
   - Agregar hooks y queries (línea 43)
   - Agregar dropdown en DialogHeader (línea 97)
   - Pasar status a ProjectEventDetails (línea 114)

2. **Modificar `project-event-details.tsx`**
   - Actualizar interfaz de props (línea 9)
   - Actualizar firma del componente (línea 29)
   - Actualizar 4 usos de status (líneas 37, 44, 52-56)

3. **Implementar enriquecimiento en calendario**
   - Vista de calendario con patrón de enriquecimiento

4. **Verificar funcionalidad**
   ```bash
   npm run typecheck && npm run lint
   npm run dev  # Testing manual
   ```

**✅ Checkpoint 2:** Código funciona con status opcional. Dropdown y enriquecimiento funcionan.

**Justificación:** En este punto, status es opcional pero todo funciona. Puedes pausar aquí sin romper nada.

---

### Fase 2: Limpieza Final de Status - 10 min

**Objetivo:** Solo después de verificar que todo funciona, eliminar status completamente

1. **Eliminar status del tipo completamente**
   ```typescript
   // src/types/project.ts línea 106
   // Eliminar línea completa (no opcional, eliminada)
   ```

2. **Limpiar eventValidation.ts**
   - Línea 150: Eliminar copia de status
   - Líneas 183-187: Usar solo projectData.status

3. **Commit final**
   ```bash
   npm run typecheck && npm run lint  # Verificar
   git commit -m "feat: Eliminar campo status de eventos - usar status global del proyecto"
   ```

**✅ Checkpoint 3:** Código pasa sin status en eventos.

**Justificación:** Limpieza final solo después de confirmar que todo funciona.

---

### Fase 3: Testing Completo y Documentación - 15 min

1. **Testing manual completo** (4 escenarios descriptos abajo)
2. **Usuario borra eventos de prueba** manualmente
3. **Actualizar `IMPLEMENTATIONS.md`** con entrada completa
4. **Archivar documentación** de este plan en `/docs/technical/migrations/archived/`

**⏱️ Tiempo total estimado:** 1-1.5 horas

---

## 🧪 Testing Necesario

### Tests Manuales (Desarrollo)

**Escenario 1: Abrir modal de evento**
1. Abrir calendario
2. Click en evento de proyecto
3. ✅ Verificar: Dropdown de status aparece
4. ✅ Verificar: Status actual se muestra correctamente
5. ✅ Verificar: No hay errores en consola

**Escenario 2: Cambiar status desde modal**
1. Abrir EventViewDialog de un evento
2. Cambiar status usando dropdown (ej: "Programar" → "Fabricación")
3. ✅ Verificar: Toast de confirmación aparece
4. ✅ Verificar: Proyecto se actualiza en Firestore
5. ✅ Verificar: Badge en calendario refleja nuevo status
6. ✅ Verificar: Modal se actualiza con nuevo status

**Escenario 3: Cambiar status desde tabla de proyectos**
1. Ir a página de proyectos
2. Cambiar status usando dropdown existente
3. ✅ Verificar: Proyecto se actualiza
4. ✅ Verificar: Eventos del proyecto muestran nuevo status en calendario

**Escenario 4: Crear nuevo evento**
1. Crear nuevo evento de proyecto
2. ✅ Verificar: No se guarda campo `status` en Firestore
3. ✅ Verificar: Evento muestra status del proyecto en calendario
4. ✅ Verificar: Abrir modal muestra status correcto

### Tests de TypeScript
```bash
npm run typecheck  # Debe pasar sin errores
npm run lint       # Debe pasar sin errores
```

### Verificación en Firestore

**ANTES (evento tiene status):**
```javascript
{
  id: "evt123",
  projectId: "proj456",
  eventDate: Timestamp,
  status: "Fabricación",  // ← Este campo existe
  // ... otros campos
}
```

**DESPUÉS (evento sin status):**
```javascript
{
  id: "evt123",
  projectId: "proj456",
  eventDate: Timestamp,
  // status eliminado
  // ... otros campos
}
```

---

## ⚠️ Consideraciones y Riesgos

### Riesgos Identificados

1. **Eventos existentes en Firestore tienen campo `status`**
   - **Impacto:** Bajo - El código ignorará el campo
   - **Mitigación:** Usuario borrará eventos de prueba manualmente
   - **Acción futura:** Eventualmente se puede crear script de limpieza

2. **Performance de queries adicionales**
   - **Impacto:** Bajo - React Query cachea en cliente
   - **Mitigación:** 1-3 eventos por proyecto (confirmado por usuario)
   - **Monitoring:** Verificar performance en calendario con 50+ eventos

3. **Filtrado de eventos por status en Firestore**
   - **Impacto:** Medio - Ya no se puede filtrar directamente
   - **Mitigación:** Actualmente no hay queries que filtren por status
   - **Acción:** Si se necesita en el futuro, filtrar en cliente

### Breaking Changes

- ✅ **Tipo TypeScript** - `ProjectEventType.status` eliminado
- ✅ **Validación** - Ya no se valida status en eventos
- ✅ **Sanitización** - Ya no se copia status del proyecto

### Backward Compatibility

- ❌ **NO compatible** con código que espera `event.status`
- ✅ **Compatible** con Firestore (campo ignorado si existe)
- ✅ **Compatible** con lecturas (TypeScript marca como opcional)

---

## 📝 Checklist de Implementación

### Pre-implementación
- [ ] Plan revisado y aprobado por usuario
- [ ] Backup de Firestore (opcional, datos de prueba)
- [ ] Branch creado para cambios

### Implementación
- [ ] Modificar `src/types/project.ts`
- [ ] Modificar `src/utils/eventValidation.ts` (3 cambios)
- [ ] Modificar `src/components/calendar/EventViewDialog.tsx`
- [ ] Modificar `src/components/summary/project-event-details.tsx`
- [ ] Actualizar calendario (enriquecimiento de eventos)
- [ ] Actualizar `src/types/event.ts` si existe

### Validación
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] Testing manual - Escenario 1 (abrir modal)
- [ ] Testing manual - Escenario 2 (cambiar status desde modal)
- [ ] Testing manual - Escenario 3 (cambiar desde tabla)
- [ ] Testing manual - Escenario 4 (crear evento nuevo)

### Post-implementación
- [ ] Commit con mensaje descriptivo
- [ ] Usuario borra eventos de prueba manualmente
- [ ] Verificar performance en uso real
- [ ] Documentar cambios en IMPLEMENTATIONS.md

---

## 📊 Métricas de Éxito

### Antes
- Eventos tienen campo `status` duplicado
- Riesgo de desincronización
- Función de sincronización compleja necesaria

### Después
- Eventos SIN campo `status`
- Cero riesgo de desincronización
- Código más simple (fuente de verdad única)
- Dropdown funcional en EventViewDialog
- Performance aceptable (1-3 eventos, cache de React Query)

---

## 🔗 Referencias

- **Tipo ProjectEventType:** `src/types/project.ts:106`
- **Sanitización de eventos:** `src/utils/eventValidation.ts:118`
- **EventViewDialog:** `src/components/calendar/EventViewDialog.tsx`
- **ProjectStatusDropdown:** `src/components/summary/project-status-dropdown.tsx`
- **Conversación completa:** Ver historial del chat con teacher agent

---

**Documento creado:** 2025-10-06
**Última actualización:** 2025-10-06
**Estado:** ✅ Listo para revisión del usuario
