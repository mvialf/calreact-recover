# 📝 Snippets de Código - Eliminar Status de Eventos

**Complemento de:** `eliminar-status-eventos-plan.md`
**Propósito:** Snippets completos de código actual y modificado para copiar/pegar

---

## 🔍 Contexto Rápido

**Decisión:** Eliminar campo `status` de eventos, obtenerlo del proyecto padre
**Razón:** Simplicidad > Performance (1-3 eventos por proyecto, cambios ocasionales)
**Nueva funcionalidad:** Dropdown de status en EventViewDialog

---

## 🔧 Fase 0: Limpieza Preparatoria (Código Legacy)

### Contexto
Commit d47e586 dejó código en estado intermedio problemático. Esta fase elimina lo más problemático mientras prepara para implementación incremental.

### Cambio 0.1: Status Opcional Temporal

**Archivo:** `src/types/project.ts` línea 106

**Estado Actual:**
```typescript
status: ProjectStatus;  // ← Obligatorio, problemático
```

**Estado Temporal (Fase 0):**
```typescript
status?: ProjectStatus;  // ← Opcional durante implementación
```

**Estado Final (Fase 2):**
```typescript
// Línea eliminada completamente
```

**Justificación:** Hacer opcional permite implementar compensaciones sin romper código existente.

---

### Cambio 0.2: Eliminar Validación Legacy

**Archivo:** `src/utils/eventValidation.ts` líneas 31-33

**ELIMINAR estas líneas (código legacy problemático):**
```typescript
if (!eventData.status) {
  errors.push('Estado del evento es requerido');
}
```

**Justificación:** Esta validación asume status obligatorio. Eliminarla inmediatamente evita conflictos.

---

### Cambio 0.3: Limpiar Test Factory

**Archivo:** `src/__tests__/helpers/test-data-factory.ts` línea 32

**ANTES:**
```typescript
status: 'ingresado', // Campo obligatorio  ← ELIMINAR comentario
```

**DESPUÉS (Fase 0):**
```typescript
status: 'ingresado', // Temporal - será eliminado
```

**DESPUÉS (Fase 2):**
```typescript
// Línea eliminada completamente
```

---

### Comando Fase 0

```bash
# Después de hacer los 3 cambios de Fase 0
npm run typecheck  # Debe pasar
git add .
git commit -m "prep: Preparar tipos para eliminación de status (status opcional temporal)"
```

**✅ Checkpoint 1:** Código pasa typecheck con status opcional.

---

## 📂 Archivo 1: `src/types/project.ts`

### Estado Actual (Líneas 98-120)

```typescript
// Tipo para evento de proyecto (colección separada)
export interface ProjectEventType {
  id: string;
  projectId: string; // Referencia al proyecto relacionado
  eventDate: Date; // Fecha específica del evento
  description?: string;
  phone?: string;
  fullAddress?: FormattedAddress;
  status: ProjectStatus;  // ← LÍNEA 106 - ELIMINAR ESTE CAMPO
  windowsCount?: number;
  squareMeters?: number;
  uninstallTags?: UninstallTag[];
  clientName?: string; // Copiado del proyecto para facilitar consultas
  glosa?: string; // Short note or summary, similar to description but often more technical or brief
  checklist?: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    createdAt?: Date;
    completedAt?: Date;
  }>; // Lista de verificación específica del evento
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Código Modificado

```typescript
// Tipo para evento de proyecto (colección separada)
export interface ProjectEventType {
  id: string;
  projectId: string; // Referencia al proyecto relacionado
  eventDate: Date; // Fecha específica del evento
  description?: string;
  phone?: string;
  fullAddress?: FormattedAddress;
  // status removido - se obtiene del proyecto padre
  windowsCount?: number;
  squareMeters?: number;
  uninstallTags?: UninstallTag[];
  clientName?: string; // Copiado del proyecto para facilitar consultas
  glosa?: string; // Short note or summary, similar to description but often more technical or brief
  checklist?: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    createdAt?: Date;
    completedAt?: Date;
  }>; // Lista de verificación específica del evento
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Acción:** Eliminar línea 106 completa (incluyendo comentario si existe)

---

## 📂 Archivo 2: `src/utils/eventValidation.ts`

### Cambio 1: Validación de Status (Líneas 31-33)

**ELIMINAR estas líneas:**

```typescript
  if (!eventData.status) {
    errors.push('Estado del evento es requerido');
  }
```

**Resultado:** Bloque completo eliminado (3 líneas)

---

### Cambio 2: Sanitización - Línea 150

**Estado Actual (Líneas 144-158):**

```typescript
  return {
    projectId: projectData.id,
    eventDate,
    description: eventData.description || projectData.description || '',
    phone: eventData.phone || projectData.phone || '',
    fullAddress: eventData.fullAddress || projectData.fullAddress || undefined,
    status: eventData.status || projectData.status,  // ← LÍNEA 150 - ELIMINAR
    windowsCount,
    squareMeters,
    uninstallTags,
    clientName,
    glosa: eventData.glosa || projectData.glosa,
    checklist: eventData.checklist || []
  };
```

**Código Modificado:**

```typescript
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

**Acción:** Eliminar línea 150, agregar comentario opcional

---

### Cambio 3: generateEventDisplayName (Líneas 183-187)

**Estado Actual:**

```typescript
  // Agregar estado si es relevante
  const status = eventData?.status || projectData.status;
  if (status && status !== 'ingresado') {
    parts.push(`(${status})`);
  }
```

**Código Modificado:**

```typescript
  // Agregar estado si es relevante (siempre desde proyecto)
  if (projectData.status && projectData.status !== 'ingresado') {
    parts.push(`(${projectData.status})`);
  }
```

**Acción:** Eliminar variable local `status`, usar directamente `projectData.status`

---

## 📂 Archivo 3: `src/components/calendar/EventViewDialog.tsx`

### Imports a Agregar (Después de línea 18)

```typescript
import { ProjectStatusDropdown } from '@/components/summary/project-status-dropdown';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, updateProject } from '@/services/projectService';
import { useToast } from '@/hooks/use-toast';
```

**Ubicación exacta:** Después de `import { PROJECT_STATUS_OPTIONS } from '@/constants/project';`

---

### Hooks y Lógica (Dentro del componente, línea ~43)

**Agregar DESPUÉS de `if (!event) return null;`:**

```typescript
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
    updateStatusMutation.mutate({ projectId, status: newStatus });
  };
```

---

### Dropdown en DialogHeader (Línea ~97, dentro del bloque de tipo Proyecto)

**Estado Actual (Líneas 78-98):**

```typescript
              {event.type === 'Proyecto' ? (
                <DialogTitle>
                  <div className="flex items-center justify-between gap-4">
                    <ProjectSummary
                      project={{
                        projectNumber: event.projectNumber,
                        clientName: event.clientName,
                        glosa: event.glosa,
                      }}
                      showProjectNumber={true}
                      layout="stacked"
                      size="sm"
                    />
                    <div className="flex flex-col gap-2 text-sm text-base font-normal">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange()}</span>
                      </div>
                    </div>
                  </div>
                </DialogTitle>
              ) : (
```

**Código Modificado (agregar dropdown DESPUÉS del div de fecha):**

```typescript
              {event.type === 'Proyecto' ? (
                <DialogTitle>
                  <div className="flex items-center justify-between gap-4">
                    <ProjectSummary
                      project={{
                        projectNumber: event.projectNumber,
                        clientName: event.clientName,
                        glosa: event.glosa,
                      }}
                      showProjectNumber={true}
                      layout="stacked"
                      size="sm"
                    />
                    <div className="flex flex-col gap-2 text-sm text-base font-normal">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange()}</span>
                      </div>
                      {/* Dropdown de status */}
                      {project && (
                        <ProjectStatusDropdown
                          projectId={event.projectId}
                          currentStatus={project.status}
                          onStatusChange={handleStatusChange}
                          isPending={updateStatusMutation.isPending}
                        />
                      )}
                    </div>
                  </div>
                </DialogTitle>
              ) : (
```

---

### Pasar Status a ProjectEventDetails (Línea ~114)

**Estado Actual:**

```typescript
          {/* Detalles del Proyecto */}
          <ProjectEventDetails event={event} />
```

**Código Modificado:**

```typescript
          {/* Detalles del Proyecto */}
          <ProjectEventDetails
            event={event}
            status={project?.status}
          />
```

---

## 📂 Archivo 4: `src/components/summary/project-event-details.tsx`

### Interfaz de Props (Línea 9)

**Estado Actual:**

```typescript
interface ProjectEventDetailsProps {
  event: EventType;
}
```

**Código Modificado:**

```typescript
interface ProjectEventDetailsProps {
  event: EventType;
  status?: string; // Status del proyecto (opcional, computado)
}
```

---

### Firma del Componente (Línea 29)

**Estado Actual:**

```typescript
export function ProjectEventDetails({ event }: ProjectEventDetailsProps) {
```

**Código Modificado:**

```typescript
export function ProjectEventDetails({ event, status }: ProjectEventDetailsProps) {
```

---

### Uso de Status en el Componente (4 cambios)

**Cambio 1 - Línea 37:**

```typescript
// ANTES:
  if (!hasTechnicalDetails && !hasUninstallTags && !event.description && !event.phone && !event.status && !event.fullAddress) {

// DESPUÉS:
  if (!hasTechnicalDetails && !hasUninstallTags && !event.description && !event.phone && !status && !event.fullAddress) {
```

**Cambio 2 - Línea 44:**

```typescript
// ANTES:
      {(event.phone || event.status) && (

// DESPUÉS:
      {(event.phone || status) && (
```

**Cambio 3 - Líneas 52-56:**

```typescript
// ANTES:
          {event.status && (
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(event.status)}>
                {PROJECT_STATUS_OPTIONS.find(opt => opt.value === event.status)?.label || event.status}
              </Badge>

// DESPUÉS:
          {status && (
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(status)}>
                {PROJECT_STATUS_OPTIONS.find(opt => opt.value === status)?.label || status}
              </Badge>
```

---

## 📂 Archivo 5: `src/types/event.ts` (Si existe)

**Si existe interfaz EventType con campo status, hacerlo opcional:**

```typescript
export interface EventType {
  // ... otros campos
  status?: ProjectStatus; // Opcional - computado desde proyecto en runtime
}
```

**Nota:** Este cambio solo aplica si el tipo EventType define explícitamente el campo status.

---

## 📂 Archivo 6: Vista de Calendario (Enriquecimiento)

**Ubicación probable:** `src/app/calreact/page.tsx` o componente que renderiza el calendario

### Patrón de Enriquecimiento

**Buscar código similar a:**

```typescript
const { data: events } = useQuery(['events']);

// Pasar directamente a calendario
<Calendar events={events} />
```

**Reemplazar con:**

```typescript
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

// Pasar eventos enriquecidos a calendario
<Calendar events={eventsWithStatus} />
```

**Nota:** La implementación exacta depende de cómo esté estructurado el componente actual del calendario.

---

## 🔧 Comandos de Verificación

### Antes de Empezar

```bash
# Crear branch para cambios
git checkout -b feature/eliminar-status-eventos

# Verificar estado inicial
npm run typecheck  # Debe pasar
npm run lint       # Debe pasar
```

### Durante Implementación

```bash
# Después de cada archivo modificado
npm run typecheck

# Si hay errores de tipo, buscar referencias adicionales
rg "event\.status|eventData\.status" src/ --type typescript
```

### Después de Completar

```bash
# Verificación final
npm run typecheck  # Debe pasar sin errores
npm run lint       # Debe pasar sin errores

# Iniciar servidor de desarrollo
npm run dev        # Puerto 3002 (Turbopack)

# Testing manual
# 1. Abrir http://localhost:3002/calreact
# 2. Click en evento de proyecto
# 3. Verificar dropdown de status aparece
# 4. Cambiar status y verificar actualización
```

---

## ⚠️ Errores Comunes y Soluciones

### Error 1: TypeScript - Property 'status' does not exist

**Causa:** Referencias a `event.status` que no fueron actualizadas

**Solución:**

```bash
# Buscar todas las referencias
rg "event\.status" src/ -n

# Verificar cada una y actualizar según contexto
```

---

### Error 2: EventViewDialog no muestra dropdown

**Causa:** Query de proyecto no se ejecuta correctamente

**Solución:** Verificar en DevTools:
1. React Query Devtools → Ver query `['project', projectId]`
2. Console → Verificar no hay errores de fetch
3. Verificar que `event.projectId` existe y es válido

---

### Error 3: Cambiar status no actualiza proyecto

**Causa:** Mutation no se ejecuta o falla

**Solución:**
1. Verificar import de `updateProject` desde `@/services/projectService`
2. Console → Ver errores de Firestore
3. React Query Devtools → Ver estado de mutation

---

### Error 4: Calendario no muestra badges de status

**Causa:** Eventos no fueron enriquecidos con status

**Solución:**
1. Verificar que vista de calendario implementa patrón de enriquecimiento
2. Console.log eventos antes de pasarlos a `<Calendar>`
3. Verificar que query de proyectos se ejecuta correctamente

---

## 📋 Checklist Rápido de Implementación

```markdown
Fase 1: Tipos
- [ ] src/types/project.ts - Eliminar línea 106
- [ ] src/types/event.ts - Status opcional (si existe)
- [ ] npm run typecheck

Fase 2: Validación
- [ ] src/utils/eventValidation.ts - Cambio 1 (líneas 31-33)
- [ ] src/utils/eventValidation.ts - Cambio 2 (línea 150)
- [ ] src/utils/eventValidation.ts - Cambio 3 (líneas 183-187)
- [ ] npm run typecheck

Fase 3: Componentes
- [ ] src/components/calendar/EventViewDialog.tsx - Imports
- [ ] src/components/calendar/EventViewDialog.tsx - Hooks
- [ ] src/components/calendar/EventViewDialog.tsx - Dropdown
- [ ] src/components/calendar/EventViewDialog.tsx - Pasar status
- [ ] src/components/summary/project-event-details.tsx - Props
- [ ] src/components/summary/project-event-details.tsx - 4 usos de status
- [ ] npm run typecheck && npm run lint

Fase 4: Calendario
- [ ] Implementar enriquecimiento de eventos
- [ ] npm run dev
- [ ] Testing manual (4 escenarios)

Fase 5: Limpieza
- [ ] Usuario borra eventos de prueba
- [ ] Commit cambios
- [ ] Actualizar IMPLEMENTATIONS.md
```

---

## 🔗 Referencias de Servicios Usados

### getProject
**Ubicación:** `src/services/projectService.ts`
**Firma:** `getProject(projectId: string): Promise<ProjectType>`

### updateProject
**Ubicación:** `src/services/projectService.ts`
**Firma:** `updateProject(projectId: string, data: Partial<ProjectType>): Promise<void>`

### ProjectStatusDropdown
**Ubicación:** `src/components/summary/project-status-dropdown.tsx`
**Props:**
- `projectId: string`
- `currentStatus: string`
- `onStatusChange?: (projectId: string, newStatus: string) => void`
- `isPending?: boolean`
- `readOnly?: boolean`

---

## 📚 Estrategia de Implementación: Opción A

### Por Qué Incremental

**Ventajas comprobadas:**
- ✅ Código siempre funcional
- ✅ Puedes pausar en cualquier momento
- ✅ Commits progresivos (mejor code review)
- ✅ Menos presión durante implementación

**Orden de ejecución:**
1. **Fase 0:** Limpieza preparatoria (10 min)
2. **Fase 1:** Implementar compensaciones (30-45 min)
3. **Validación:** Testing manual (15 min)
4. **Fase 2:** Limpieza final de status (10 min)

**Total estimado:** 1-1.5 horas

### Checkpoint de Seguridad

**Después de Fase 1 (antes de Fase 2):**
```bash
# Verificar que todo funciona con status opcional
npm run dev

# Probar manualmente:
# 1. Abrir EventViewDialog
# 2. Ver dropdown de status
# 3. Cambiar status
# 4. Verificar actualización

# Solo si todo funciona → Proceder a Fase 2
```

**Si hay problemas:**
- Status opcional permite rollback fácil
- Código funcional siempre disponible
- No hay breaking changes hasta Fase 2

---

**Documento creado:** 2025-10-06
**Última actualización:** 2025-10-06 (Opción A integrada)
**Propósito:** Snippets completos para copiar/pegar durante implementación
**Complementa:** `eliminar-status-eventos-plan.md`
