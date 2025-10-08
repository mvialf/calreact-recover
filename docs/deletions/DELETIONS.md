# 🗑️ Registro de Código Eliminado - CalReact

**Propósito:** Índice arqueológico de eliminaciones significativas (>100 líneas o arquitecturales)

**Proceso completo:** Ver [CLAUDE.md](./CLAUDE.md) en este directorio

---

## 📝 Template Rápido

```markdown
### [Nombre] (YYYY-MM-DD)
- **Commit:** `hash` | **Impact:** High/Medium/Low
- **Qué:** Descripción concisa (1 línea) - X líneas
- **Por qué:** Razón técnica
- **Reemplazo:** [Nuevo componente] (si existe)
- **Restaurar:** `git checkout hash -- src/path/to/file.tsx`
```

---

## 📊 Registro de Eliminaciones (Cronológico)

### Código Legacy Completo (2025-10-07)
- **Commit:** `f78cd87` | **Impact:** High
- **Qué:** Eliminación masiva de 1,258 líneas legacy en 4 fases sistemáticas
- **Por qué:** Deuda técnica acumulada, arquitectura inconsistente con patrones actuales
- **Componentes eliminados:**
  - **FASE 1:** Modo Full - ProjectEventForm (748 líneas)
  - **FASE 2:** FormModal System (380 líneas)
  - **FASE 3:** Firebase Config Re-export (15 líneas)
  - **FASE 4:** Tests obsoletos (115 líneas)
- **Reemplazo:**
  - Modo lean-only en ProjectEventForm
  - ModalLayout pattern unificado
  - Imports directos desde constants/firebase
- **Restaurar:** Ver commit `f78cd87` para archivos específicos

---

### Deuda Técnica Modo Full (2025-10-07)
- **Commit:** `2816761` | **Impact:** Medium
- **Qué:** Schema Full y tipos relacionados para ProjectEventForm modo completo
- **Por qué:** Migración completada a lean-only mode, schema Full sin referencias activas
- **Reemplazo:** projectEventLeanSchema como único schema activo
- **Restaurar:** `git checkout 2816761 -- src/schemas/project-event.schemas.ts`

---

### Campo Status de ProjectEventType (2025-10-07)
- **Commit:** `1c6e405` | **Impact:** High
- **Qué:** Campo `status` duplicado en ProjectEventType (violación SSOT)
- **Por qué:** Arquitectura Single Source of Truth implementada, status ahora solo en ProjectType
- **Cambio arquitectural:** Eventos enriquecidos en runtime con project.status (computed property)
- **Archivos afectados:** 6 archivos (types, components, services, utils, tests)
- **Reemplazo:** Computed properties pattern con enriquecimiento Map-based O(1)
- **Restaurar:** `git checkout 1c6e405 -- src/types/project.ts`

---

## 📈 Estadísticas Acumuladas

### Totales
- **Líneas eliminadas:** 1,258+ líneas de código legacy
- **Componentes completos:** 3 (FullFields, FormModal, useModalManager)
- **Schemas deprecated:** 1 (projectEventFullSchema)
- **Campos arquitecturales:** 1 (ProjectEventType.status)
- **Archivos completos eliminados:** 6+

### Impacto por Tipo
- **High Impact:** 2 eliminaciones (legacy completo, campo status)
- **Medium Impact:** 1 eliminación (deuda técnica Full mode)
- **Low Impact:** 0 eliminaciones

### Validación Continua
- ✅ **TypeScript errors:** 0 en todas las eliminaciones
- ✅ **ESLint críticos:** 0 en todas las eliminaciones
- ✅ **Build status:** Exitoso en todas las eliminaciones
- ✅ **Breaking changes:** 0 en funcionalidad productiva

---

**📊 Última actualización:** Octubre 2025
**📝 Total de entradas:** 3 eliminaciones registradas
**🔧 Mantenimiento:** Actualizar cada eliminación significativa (>100 líneas)
