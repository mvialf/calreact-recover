# 📋 Guía de Migración: Project Events a Arquitectura Minimal

**Fecha de creación:** 2025-10-06
**Estado:** Documentación de implementación
**Impacto:** High - Migración de datos y arquitectura de eventos

---

## 🎯 Objetivo

Migrar la arquitectura de eventos de proyecto de un modelo con duplicación de datos a un modelo **minimal con snapshot inmutable**, eliminando ~70% de campos redundantes y estableciendo una base sólida y escalable.

---

## 📊 Cambios Arquitecturales

### Antes (ProjectEventType - Legacy)
```typescript
// ❌ Duplicación masiva (~35KB código)
interface ProjectEventType {
  // Datos del proyecto (DUPLICADOS)
  projectNumber: string;
  clientName: string;
  clientId: string;
  glosa: string;
  comuna: string;
  customStatus: string; // ERROR: status pertenece al proyecto
  installments: Array; // Datos complejos duplicados
  // ... ~30 campos más

  // Datos del evento
  eventDate: Timestamp;
  eventNotes: string;
  checklist: ChecklistItem[];
}
```

### Después (ProjectEventMinimal - Nueva Arquitectura)
```typescript
// ✅ Snapshot inmutable (5 campos esenciales)
interface ProjectEventMinimal {
  // Snapshot inmutable del proyecto
  projectSnapshot: {
    projectNumber: string;
    clientName: string;
    glosa: string;
    comuna: string;
    status: string; // Ahora en snapshot (correcto)
  };

  // Datos específicos del evento
  eventDate: Timestamp;
  eventNotes: string;
  checklist: ChecklistItem[];

  // Metadata
  projectId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🚀 Fase 1: Ejecutar Script de Migración

### 1.1 Preparación

**Verificar ambiente:**
```bash
# Verificar que estás en la rama correcta
git status

# Verificar configuración de Firebase
cat .env.local | grep FIREBASE

# Instalar dependencias si es necesario
npm install
```

**Backup de seguridad:**
```bash
# CRÍTICO: Hacer backup manual de Firestore antes de migrar
# En Firebase Console:
# 1. Ir a Firestore Database
# 2. Exportar colección "projectEvents"
# 3. Guardar fecha y hora del export
```

### 1.2 Ejecutar Migración

**Comando:**
```bash
npx tsx scripts/migrate-project-events-to-minimal.ts
```

**Output esperado:**
```
📊 INICIO: Migración de eventos a arquitectura minimal
============================================================

📈 ESTADÍSTICAS INICIALES:
   Total de eventos: 127
   Eventos a procesar: 127
   Batch size: 500

🔄 PROCESANDO BATCH 1/1...
   ✅ Migrados: 127/127
   ❌ Fallidos: 0/127

✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
============================================================
📊 RESUMEN FINAL:
   Total procesados: 127
   Exitosos: 127
   Fallidos: 0

🎉 Migración finalizada sin errores
```

**Posibles errores y soluciones:**

| Error | Causa | Solución |
|-------|-------|----------|
| `Permission denied` | Credenciales Firebase inválidas | Verificar `.env.local` y regenerar service account |
| `Project not found` | Documento de proyecto eliminado | Revisar logs, decidir si conservar evento huérfano |
| `Batch write failed` | Límite de escrituras excedido | Script automáticamente reintenta en batch menor |

### 1.3 Validación Post-Migración

**Checklist de validación:**

- [ ] **Firestore Console:**
  - [ ] Abrir colección `projectEvents` en Firebase Console
  - [ ] Verificar que eventos tienen estructura `projectSnapshot`
  - [ ] Confirmar que campo `customStatus` ya no existe
  - [ ] Verificar que `projectSnapshot.status` existe

- [ ] **Queries manuales:**
```javascript
// En Firebase Console > Firestore > Query
db.collection('projectEvents')
  .limit(5)
  .get()
  .then(snap => {
    snap.forEach(doc => {
      const data = doc.data();
      console.log('✅ Snapshot:', data.projectSnapshot);
      console.log('❌ CustomStatus eliminado:', !data.customStatus);
    });
  });
```

- [ ] **Validar integridad referencial:**
```bash
# Ejecutar script de validación
npx tsx scripts/validate-project-events.ts
```

---

## 🎨 Fase 2: Verificar Calendario

### 2.1 Iniciar Servidor de Desarrollo

```bash
# Iniciar en puerto 3002 (Turbopack)
npm run dev

# O alternativo en puerto 3001
npm run dev:webpack
```

### 2.2 Testing Manual del Calendario

**Checklist de validación visual:**

- [ ] **Navegación al calendario:**
  - [ ] Ir a `http://localhost:3002/calreact`
  - [ ] Verificar que eventos se renderizan correctamente
  - [ ] No hay errores en consola del navegador

- [ ] **Badge de Status:**
  - [ ] Eventos muestran Badge con status del proyecto
  - [ ] Colores correctos según estado:
    ```typescript
    'pending'     → bg-yellow-100 text-yellow-800
    'in_progress' → bg-blue-100 text-blue-800
    'completed'   → bg-green-100 text-green-800
    'on_hold'     → bg-gray-100 text-gray-800
    'cancelled'   → bg-red-100 text-red-800
    ```

- [ ] **Vistas del calendario:**
  - [ ] Vista Mes: Badge visible en cada evento
  - [ ] Vista Semana: Badge visible con texto completo
  - [ ] Vista Día: Badge visible con detalles completos

### 2.3 Testing de Interactividad

**Acciones a validar:**

- [ ] **Click en evento:**
  - [ ] Modal se abre correctamente
  - [ ] Datos del snapshot se muestran
  - [ ] Status Badge visible en modal
  - [ ] Información completa del proyecto disponible

- [ ] **Crear nuevo evento:**
  - [ ] Modal de creación funciona
  - [ ] Snapshot se genera automáticamente
  - [ ] Evento aparece en calendario con Badge correcto
  - [ ] No hay errores en consola

- [ ] **Editar evento existente:**
  - [ ] Modal de edición funciona
  - [ ] Snapshot se mantiene inmutable
  - [ ] Solo `eventDate`, `eventNotes`, `checklist` editables

### 2.4 Validación de Console Logs

**Abrir DevTools (F12) y verificar:**

```javascript
// ✅ Esperado: Sin errores
console: []

// ❌ No debería aparecer:
"Cannot read property 'customStatus' of undefined"
"ProjectSnapshot is missing"
"Status badge not rendering"
```

---

## 🔧 Fase 3: Migrar Formularios

### 3.1 Actualizar Servicios

**Archivos ya actualizados:**
- ✅ [src/services/projectEventService.ts](src/services/projectEventService.ts) - `createProjectEventMinimal()`

**Validar imports en formularios:**
```typescript
// ✅ CORRECTO - Usar servicio minimal
import { createProjectEventMinimal } from '@/services/projectEventService';

// ❌ ELIMINAR - Referencias legacy
import { createProjectEvent } from '@/services/projectEventService'; // Ya no existe
```

### 3.2 Formularios a Migrar

**Checklist de actualización:**

- [ ] **NewProjectEventForm.tsx:**
  - [ ] Importar `createProjectEventMinimal`
  - [ ] Eliminar campos relacionados a `customStatus`
  - [ ] Validar que solo envía `eventDate`, `eventNotes`, `checklist`
  - [ ] Testing manual: crear evento desde formulario

- [ ] **NewProjectEventModal.tsx:**
  - [ ] Actualizar servicio a `createProjectEventMinimal`
  - [ ] Verificar que recibe `project: ProjectType` completo
  - [ ] Testing: crear evento desde modal en calendario

- [ ] **Eliminar formularios obsoletos:**
  - [ ] ~~NewProjectEventLeanForm.tsx~~ (ya eliminado)
  - [ ] Verificar que no hay imports huérfanos

### 3.3 Validación de Tipos

**Verificar TypeScript:**
```bash
npm run typecheck
```

**Errores esperados (resolver):**
```
❌ Property 'customStatus' does not exist on type 'ProjectEventMinimal'
   → Eliminar referencias a customStatus

❌ Argument of type 'ProjectEventType' is not assignable to...
   → Cambiar a createProjectEventMinimal()
```

---

## 🧪 Fase 4: Testing Completo

### 4.1 Testing Unitario

**Ejecutar tests actualizados:**
```bash
# Tests de servicios
npm run test:ci -- projectEventService.test.ts

# Tests de componentes
npm run test:ci -- ProjectEventRenderer.test.tsx
npm run test:ci -- NewProjectEventForm.test.tsx
```

**Validar cobertura:**
```bash
npm run test:coverage
```

**Coverage mínimo esperado:**
- `projectEventService.ts`: >80%
- `ProjectEventRenderer.tsx`: >70%
- `NewProjectEventForm.tsx`: >70%

### 4.2 Testing E2E con Playwright

**Ejecutar flujo completo:**
```bash
# Iniciar servidor de desarrollo
npm run dev &

# Ejecutar tests E2E
npm run test:e2e -- calendar-events.spec.ts
```

**Casos de prueba E2E:**

1. **Crear evento desde calendario:**
```typescript
test('debe crear evento con snapshot inmutable', async ({ page }) => {
  await page.goto('/calreact');
  await page.click('[data-testid="add-event-button"]');
  await page.fill('[name="eventDate"]', '2025-10-15');
  await page.fill('[name="eventNotes"]', 'Evento de prueba');
  await page.click('[type="submit"]');

  // Validar Badge visible
  await expect(page.locator('.badge-status')).toBeVisible();
  await expect(page.locator('.badge-status')).toContainText(/pending|in_progress|completed/);
});
```

2. **Validar snapshot inmutable en edición:**
```typescript
test('snapshot no debe cambiar al editar evento', async ({ page }) => {
  // Obtener snapshot original
  const originalSnapshot = await page.evaluate(() => {
    const event = document.querySelector('[data-event-id]');
    return event?.dataset.snapshot;
  });

  // Editar evento
  await page.click('[data-testid="edit-event"]');
  await page.fill('[name="eventNotes"]', 'Notas actualizadas');
  await page.click('[type="submit"]');

  // Validar snapshot inmutable
  const updatedSnapshot = await page.evaluate(() => {
    const event = document.querySelector('[data-event-id]');
    return event?.dataset.snapshot;
  });

  expect(originalSnapshot).toEqual(updatedSnapshot);
});
```

3. **Validar status badge correcto:**
```typescript
test('debe mostrar badge de status con colores correctos', async ({ page }) => {
  await page.goto('/calreact');

  // Validar colores según estado
  const pendingBadge = page.locator('.badge-status:has-text("Pendiente")');
  await expect(pendingBadge).toHaveClass(/bg-yellow-100/);

  const completedBadge = page.locator('.badge-status:has-text("Completado")');
  await expect(completedBadge).toHaveClass(/bg-green-100/);
});
```

### 4.3 Testing de Regresión

**Validar funcionalidad existente:**

- [ ] **Búsqueda de eventos:**
  - [ ] Buscar por cliente funciona
  - [ ] Buscar por comuna funciona
  - [ ] Buscar por glosa funciona

- [ ] **Filtros de calendario:**
  - [ ] Filtrar por status funciona
  - [ ] Filtrar por rango de fechas funciona
  - [ ] Filtrar por proyecto funciona

- [ ] **Exportación de datos:**
  - [ ] Exportar eventos a CSV funciona
  - [ ] Datos exportados incluyen snapshot correcto

---

## ✅ Checklist Final de Validación

### Código y Arquitectura
- [ ] Script de migración ejecutado exitosamente (0 errores)
- [ ] Firestore Console muestra estructura `projectSnapshot` correcta
- [ ] Campo `customStatus` eliminado de todos los documentos
- [ ] Formularios usan `createProjectEventMinimal()`
- [ ] 0 errores TypeScript (`npm run typecheck`)
- [ ] 0 errores ESLint (`npm run lint`)

### Funcionalidad del Calendario
- [ ] Badge de status visible en vista Mes
- [ ] Badge de status visible en vista Semana
- [ ] Badge de status visible en vista Día
- [ ] Colores de badge correctos según estado
- [ ] Modal de evento muestra datos snapshot
- [ ] Crear evento desde calendario funciona
- [ ] Editar evento mantiene snapshot inmutable

### Testing
- [ ] Tests unitarios pasan (>70% coverage)
- [ ] Tests E2E pasan (calendario funcional)
- [ ] No hay errores en consola del navegador
- [ ] Búsqueda y filtros funcionan correctamente
- [ ] Exportación de datos funciona

### Documentación
- [ ] `IMPLEMENTATIONS.md` actualizado con entrada de migración
- [ ] `patterns.md` actualizado con patrón ProjectEventMinimal
- [ ] Comentarios de código actualizados (eliminar TODOs)
- [ ] Session notes archivadas en `/archived/`

---

## 🚨 Rollback (Si es Necesario)

**En caso de problemas críticos:**

### Restaurar Datos
```bash
# 1. Restaurar backup de Firestore
# En Firebase Console:
# Firestore > Import/Export > Import
# Seleccionar backup guardado en Fase 1.1

# 2. Revertir código
git revert HEAD~1  # Revertir último commit
git checkout feature/project-event-minimal  # O rama anterior

# 3. Reiniciar servidor
npm run dev
```

### Validar Rollback
- [ ] Eventos se muestran correctamente
- [ ] No hay errores en consola
- [ ] Funcionalidad de calendario restaurada
- [ ] Formularios funcionan

---

## 📊 Métricas de Éxito

**Indicadores de migración exitosa:**

| Métrica | Objetivo | Validación |
|---------|----------|------------|
| Eventos migrados | 100% | Script reporta 0 fallidos |
| Errores TypeScript | 0 | `npm run typecheck` pasa |
| Errores ESLint | 0 | `npm run lint` pasa |
| Test coverage | >70% | `npm run test:coverage` |
| Tests E2E passing | 100% | `npm run test:e2e` |
| Reducción de código | ~70% | Verificar eliminación de campos duplicados |
| Performance | Sin degradación | Medir load time calendario |
| UX mejorada | Badge visible | Validación manual |

---

## 📚 Referencias

### Archivos Clave
- **Script de migración:** [scripts/migrate-project-events-to-minimal.ts](../../../scripts/migrate-project-events-to-minimal.ts)
- **Servicio nuevo:** [src/services/projectEventService.ts](../../../src/services/projectEventService.ts)
- **Tipos:** [src/types/projectEvent.ts](../../../src/types/projectEvent.ts)
- **Renderer:** [src/components/calendar/event-renderers/ProjectEventRenderer.tsx](../../../src/components/calendar/event-renderers/ProjectEventRenderer.tsx)

### Documentación Relacionada
- [IMPLEMENTATIONS.md](../../IMPLEMENTATIONS.md) - Log de implementaciones
- [patterns.md](../../references/patterns.md) - Patrones establecidos
- [architecture.md](../../context/architecture.md) - Principios arquitecturales

---

**📋 Generado:** 2025-10-06
**👤 Responsable:** Equipo de desarrollo
**🔄 Última actualización:** 2025-10-06
