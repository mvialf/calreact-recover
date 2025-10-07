# 📚 Guía Completa: Eliminar Status de Eventos

**Fecha:** 2025-10-06
**Estado:** ✅ Plan completo - Listo para implementación
**Branch sugerido:** `feature/eliminar-status-eventos`

---

## 🎯 Quick Start

### Para Implementar en Otra Sesión

1. **Leer primero:** Este README (contexto general)
2. **Plan estratégico:** `eliminar-status-eventos-plan.md` (540 líneas)
3. **Snippets de código:** `eliminar-status-eventos-snippets.md` (código para copiar/pegar)
4. **Ejecutar:** Seguir orden de implementación del plan

### Comandos Rápidos

```bash
# Crear branch
git checkout -b feature/eliminar-status-eventos

# Verificar estado inicial
npm run typecheck && npm run lint

# Después de cambios
npm run typecheck && npm run lint
npm run dev  # Testing manual
```

---

## 📖 Documentos del Plan

### 1. `eliminar-status-eventos-plan.md` (Estratégico)

**Contenido:**
- ✅ Resumen ejecutivo con justificación
- ✅ Análisis de impacto (6 archivos)
- ✅ Cambios detallados por archivo con ANTES/DESPUÉS
- ✅ Orden de implementación en 5 fases
- ✅ Testing necesario (4 escenarios)
- ✅ Checklist completo
- ✅ Métricas de éxito

**Cuándo leer:**
- Entender decisión arquitectural
- Ver impacto completo
- Planificar orden de trabajo

---

### 2. `eliminar-status-eventos-snippets.md` (Práctico)

**Contenido:**
- ✅ Snippets completos de código actual
- ✅ Snippets modificados para copiar/pegar
- ✅ Ubicación exacta de cada cambio (números de línea)
- ✅ Comandos de verificación
- ✅ Errores comunes y soluciones
- ✅ Checklist rápido de implementación

**Cuándo usar:**
- Durante la implementación
- Para copiar/pegar código
- Resolver errores comunes

---

## 🎯 Resumen de la Decisión

### Problema Original
- Eventos tenían campo `status` duplicado del proyecto
- Riesgo de desincronización
- Necesidad de sincronización manual compleja

### Solución Elegida: OPCIÓN A
**Eliminar** campo `status` de eventos, obtenerlo del proyecto padre

### Justificación
- **Respuestas del usuario:**
  - 1-3 eventos por proyecto (volumen bajo)
  - Cambio de status ocasional (priorizar simplicidad)
  - Agregar dropdown a EventViewDialog ✓
  - Proyecto es fuente de verdad ✓

### Beneficios
- ✅ Máxima simplicidad (cero sincronización)
- ✅ Cero riesgo de desincronización
- ✅ Una sola fuente de verdad
- ✅ Menos código que mantener

### Costo Aceptable
- +1 query al abrir EventViewDialog (mitigado por React Query cache)
- Calendario requiere enriquecimiento (patrón ya usado en proyecto)

---

## 🚨 Contexto de Código Legacy (Importante)

### Contradicción con Commit Reciente (d47e586)

**Situación identificada:**
- El commit de hoy (6 oct 2025) revirtió arquitectura de snapshot
- Restauró campo `status` como **obligatorio** en eventos
- Dejó código en estado "intermedio problemático"

**Código legacy problemático:**
1. Tipo con status obligatorio (`status: ProjectStatus` sin `?`)
2. Validación que requiere status en `eventValidation.ts`
3. Status se copia del proyecto (arquitectura híbrida no intencional)

**Decisión tomada:** El plan propuesto (eliminar status completamente) es la solución correcta. Código legacy será limpiado como parte de la implementación.

### Estrategia de Implementación: Opción A (Incremental)

**Por qué incremental:**
- ✅ Código siempre funcional durante implementación
- ✅ Commits progresivos (mejor para code review)
- ✅ Puedes pausar en cualquier momento
- ✅ Menos presión durante implementación
- ✅ Rollback fácil si hay problemas

**Fases adicionales:**
- **Fase 0:** Limpieza preparatoria del código legacy problemático
- Status temporalmente opcional (`status?: ProjectStatus`) durante implementación
- Limpieza final de status después de implementar compensaciones
- Checkpoints de seguridad entre fases

**Estimación de tiempo:** 1-1.5 horas (con testing manual)

---

## 📊 Resumen de Cambios

### 6 Archivos a Modificar

| # | Archivo | Cambios | Complejidad |
|---|---------|---------|-------------|
| 1 | `src/types/project.ts` | Eliminar campo `status` línea 106 | Baja |
| 2 | `src/utils/eventValidation.ts` | 3 cambios (validación, sanitización, display) | Media |
| 3 | `src/components/calendar/EventViewDialog.tsx` | Agregar dropdown + fetch proyecto | Media |
| 4 | `src/components/summary/project-event-details.tsx` | Recibir status como prop (4 lugares) | Baja |
| 5 | `src/types/event.ts` | Status opcional (si existe) | Baja |
| 6 | Vista de calendario | Enriquecer eventos con status | Media |

### Nueva Funcionalidad
- **Dropdown de status en EventViewDialog**
  - Permite cambiar status del proyecto desde modal del evento
  - Usa `ProjectStatusDropdown` component existente
  - Actualiza proyecto + invalida cache de React Query

---

## 🔄 Orden de Implementación (Opción A: Incremental)

### Fase 0: Limpieza Preparatoria (10 min)
```bash
# Crear branch
git checkout -b feature/eliminar-status-eventos

# 1. Hacer status OPCIONAL en tipo (temporal)
# src/types/project.ts línea 106: status?: ProjectStatus;

# 2. Eliminar validación legacy
# src/utils/eventValidation.ts líneas 31-33 (eliminar bloque if)

# 3. Limpiar test factory
# src/__tests__/helpers/test-data-factory.ts línea 32 (eliminar comentario "obligatorio")

npm run typecheck  # Verificar
git commit -m "prep: Preparar tipos para eliminación de status (opcional temporal)"
```

**✅ Checkpoint 1:** Código pasa typecheck con status opcional.

---

### Fase 1: Implementar Compensaciones (30-45 min)
```bash
# 1. Modificar EventViewDialog.tsx
#    - Agregar imports
#    - Agregar hooks y queries
#    - Agregar dropdown en DialogHeader
#    - Pasar status a ProjectEventDetails

# 2. Modificar project-event-details.tsx
#    - Actualizar props (agregar status?: string)
#    - Actualizar 4 usos de status

# 3. Implementar enriquecimiento en calendario
#    - Vista de calendario con patrón de enriquecimiento

npm run typecheck && npm run lint  # Verificar
npm run dev  # Testing manual
```

**✅ Checkpoint 2:** Código funcional con status opcional. Dropdown y enriquecimiento funcionan.

---

### Fase 2: Limpieza Final de Status (10 min)
```bash
# Solo después de verificar que todo funciona en Fase 1:

# 1. Eliminar status del tipo completamente
# src/types/project.ts línea 106 (eliminar línea completa)

# 2. Limpiar eventValidation.ts
# Línea 150: Eliminar copia de status
# Líneas 183-187: Usar solo projectData.status

npm run typecheck && npm run lint  # Verificar
npm run dev  # Testing final
```

**✅ Checkpoint 3:** Código pasa sin status en eventos.

---

### Fase 3: Finalización (15 min)
```bash
# Testing manual completo (4 escenarios)
# Usuario borra eventos de prueba manualmente

git add .
git commit -m "feat: Eliminar campo status de eventos - usar status global del proyecto"

# Actualizar IMPLEMENTATIONS.md
```

**⏱️ Tiempo total estimado:** 1-1.5 horas

---

## 🧪 Testing Manual

### Escenario 1: Abrir Modal de Evento
1. Abrir calendario (`http://localhost:3002/calreact`)
2. Click en evento de proyecto
3. ✅ Verificar: Dropdown de status aparece
4. ✅ Verificar: Status actual se muestra
5. ✅ Verificar: No hay errores en consola

### Escenario 2: Cambiar Status desde Modal
1. Abrir EventViewDialog
2. Cambiar status (ej: "Programar" → "Fabricación")
3. ✅ Verificar: Toast de confirmación
4. ✅ Verificar: Badge en calendario se actualiza
5. ✅ Verificar: Proyecto actualizado en Firestore

### Escenario 3: Cambiar Status desde Tabla
1. Ir a página de proyectos
2. Cambiar status usando dropdown existente
3. ✅ Verificar: Eventos muestran nuevo status

### Escenario 4: Crear Nuevo Evento
1. Crear nuevo evento de proyecto
2. ✅ Verificar: No se guarda campo `status` en Firestore
3. ✅ Verificar: Evento muestra status del proyecto

---

## ⚠️ Errores Comunes

### 1. TypeScript - Property 'status' does not exist
**Solución:** Buscar referencias no actualizadas
```bash
rg "event\.status" src/ -n
```

### 2. EventViewDialog no muestra dropdown
**Solución:** Verificar query de proyecto en React Query DevTools

### 3. Cambiar status no actualiza
**Solución:** Verificar import de `updateProject` y mutation en DevTools

### 4. Calendario sin badges de status
**Solución:** Implementar patrón de enriquecimiento de eventos

**Ver más:** `eliminar-status-eventos-snippets.md` sección "Errores Comunes"

---

## 📝 Checklist de Implementación

### Pre-implementación
- [ ] Plan revisado y aprobado
- [ ] Branch `feature/eliminar-status-eventos` creado
- [ ] Estado inicial verificado (`typecheck` + `lint` pasan)

### Fase 1: Tipos
- [ ] `src/types/project.ts` - Línea 106 eliminada
- [ ] `src/types/event.ts` - Status opcional (si existe)
- [ ] `npm run typecheck` pasa

### Fase 2: Validación
- [ ] `src/utils/eventValidation.ts` - Cambio 1 (líneas 31-33)
- [ ] `src/utils/eventValidation.ts` - Cambio 2 (línea 150)
- [ ] `src/utils/eventValidation.ts` - Cambio 3 (líneas 183-187)
- [ ] `npm run typecheck` pasa

### Fase 3: Componentes
- [ ] `EventViewDialog.tsx` - Imports agregados
- [ ] `EventViewDialog.tsx` - Hooks agregados
- [ ] `EventViewDialog.tsx` - Dropdown agregado
- [ ] `EventViewDialog.tsx` - Status pasado a ProjectEventDetails
- [ ] `project-event-details.tsx` - Props actualizadas
- [ ] `project-event-details.tsx` - 4 usos de status actualizados
- [ ] `npm run typecheck && npm run lint` pasan

### Fase 4: Calendario
- [ ] Vista de calendario - Enriquecimiento implementado
- [ ] `npm run dev` - Servidor funcionando
- [ ] Testing manual - Escenario 1 ✓
- [ ] Testing manual - Escenario 2 ✓
- [ ] Testing manual - Escenario 3 ✓
- [ ] Testing manual - Escenario 4 ✓

### Fase 5: Finalización
- [ ] Usuario borra eventos de prueba manualmente
- [ ] Commit con mensaje descriptivo
- [ ] Actualizar `IMPLEMENTATIONS.md`
- [ ] Testing en uso real

---

## 🔗 Referencias Técnicas

### Servicios Usados
- `getProject(projectId: string)` - `src/services/projectService.ts`
- `updateProject(projectId: string, data: Partial<ProjectType>)` - `src/services/projectService.ts`

### Componentes Usados
- `ProjectStatusDropdown` - `src/components/summary/project-status-dropdown.tsx`
  - Props: `projectId`, `currentStatus`, `onStatusChange`, `isPending`, `readOnly`

### Hooks Usados
- `useQuery` - TanStack Query para fetch de proyecto
- `useMutation` - TanStack Query para actualizar status
- `useToast` - Shadcn/ui para notificaciones

### Constants Usados
- `PROJECT_STATUS_OPTIONS` - `src/constants/project.ts`
- `ProjectStatus` type - `src/types/project.ts`

---

## 📚 Contexto de la Conversación

### Análisis Previo con Teacher Agent

**Preguntas respondidas por el usuario:**
1. **¿Cuántos eventos por proyecto?** → 1-3 eventos
2. **¿Frecuencia de cambio de status?** → Ocasional (priorizar simplicidad)
3. **¿Agregar dropdown a EventViewDialog?** → Sí
4. **¿Al cambiar status desde evento?** → Actualizar proyecto (fuente de verdad)

**Alternativas evaluadas:**
- ❌ Opción B: Mantener status con sincronización (rechazada: "sobreingeniería")
- ❌ Opción C: Agregación sin status único (rechazada: complejidad innecesaria)
- ✅ **Opción A: Eliminar status de eventos** (elegida: simplicidad)

**Análisis de teacher disponible en:** Historial de la conversación (2025-10-06)

---

## 📊 Métricas de Éxito

### Antes
- Eventos con campo `status` duplicado
- Riesgo de desincronización
- Necesidad de función de sincronización compleja

### Después
- Eventos SIN campo `status`
- Cero riesgo de desincronización
- Código más simple (fuente de verdad única)
- Dropdown funcional en EventViewDialog
- Performance aceptable (1-3 eventos, React Query cache)

---

## 🎯 Próximos Pasos Después de Implementación

1. **Testing en uso real** - Validar performance con datos reales
2. **Documentar en IMPLEMENTATIONS.md** - Agregar entrada de implementación completada
3. **Monitorear queries** - Verificar impacto de query adicional en DevTools
4. **Considerar optimizaciones futuras** (solo si necesario):
   - Prefetch de proyectos en calendario
   - Cache más agresivo de proyectos
   - Batch fetching de proyectos únicos

---

## 📄 Documentos Relacionados

- **Plan estratégico:** `eliminar-status-eventos-plan.md`
- **Snippets prácticos:** `eliminar-status-eventos-snippets.md`
- **Arquitectura general:** `claude-docs/context/architecture.md`
- **Patrones establecidos:** `claude-docs/references/patterns.md`
- **Log de implementaciones:** `claude-docs/IMPLEMENTATIONS.md`

---

**Documento creado:** 2025-10-06
**Última actualización:** 2025-10-06
**Estado:** ✅ Listo para implementación
**Contacto:** Ver historial de conversación con teacher agent
