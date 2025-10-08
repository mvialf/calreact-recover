# =Ñ Proceso de Eliminación de Código Legacy/Deprecated

**Última actualización:** Octubre 2025
**Propósito:** Guía completa para eliminar código obsoleto manteniendo codebase limpio y escalable

---

## <¯ Regla de Oro: Zero Deprecated Policy

**NUNCA dejar código deprecated/legacy mezclado con código activo.**

### Filosofía
- **Código limpio = Velocidad de desarrollo**
- **Git es tu backup confiable** (nada se pierde realmente)
- **Documentación añade contexto** (Git no explica el "por qué")
- **Decisión inmediata** (no acumular deuda técnica)

### Principio Core
```
Código Obsoleto ’ Eliminar Inmediatamente ’ Registrar en DELETIONS.md ’ Git Archive
```

---

## = Proceso Obligatorio (4 Pasos)

### 1ã Verificar Sin Referencias Activas

**Comandos obligatorios:**
```bash
# Buscar uso del componente/función
rg "ComponentName" src/ --type typescript

# Buscar imports
rg "import.*ComponentName" src/

# Buscar referencias en tests
rg "ComponentName" src/**/__tests__/

# Contar ocurrencias (debe ser 0)
rg "ComponentName" src/ -c
```

**Criterio de éxito:** 0 referencias activas encontradas.

**Si encuentra referencias:**
- L NO eliminar aún
-  Migrar primero las referencias al nuevo código
-  Validar que nueva implementación funciona
-  Entonces volver al paso 1

---

### 2ã Eliminar Código Completamente

**Comandos de eliminación:**
```bash
# Eliminar archivo principal
git rm src/path/to/old-code.tsx

# Eliminar tests asociados (si existen)
git rm src/path/to/old-code.test.tsx

# Eliminar archivos relacionados
git rm src/path/to/helper-deprecated.ts
```

**IMPORTANTE:** Usar `git rm` (no `rm` simple) para tracking correcto.

**Validación intermedia:**
```bash
# Verificar que no rompió nada
npm run typecheck  # Debe pasar sin errores
npm run lint       # Debe pasar sin errores críticos
```

---

### 3ã Registrar en DELETIONS.md

**Usar template de `docs/deletions/DELETIONS.md`**

**Información mínima requerida:**
-  Commit hash (se obtiene después del commit)
-  Qué hacía (1-2 líneas descriptivas)
-  Por qué eliminado (razón técnica específica)
-  Tamaño (líneas de código eliminadas)
-  Reemplazo (si existe nueva implementación)
-  Comando de restauración (git checkout)

**Ejemplo de entrada:**
```markdown
### FormModal System (2025-10-07)
- **Commit:** `f78cd87` | **Impact:** High
- **Qué hacía:** Sistema modal deprecated FormModal + useModalManager (380 líneas)
- **Por qué eliminado:** Reemplazado por ModalLayout pattern unificado
- **Reemplazo:** ModalLayout con props formId
- **Restaurar:**
  ```bash
  git checkout f78cd87 -- src/components/ui/modal/FormModal.tsx
  git checkout f78cd87 -- src/hooks/useModalManager.ts
  ```
```

---

### 4ã Commit Específico con Formato Estandarizado

**Template de commit:**
```bash
git commit -m "refactor(cleanup): Eliminar [NombreComponente] legacy

- Qué: [archivo.tsx] (X líneas)
- Por qué: Reemplazado por [NuevoComponente] con [beneficio]
- Registrado en: docs/deletions/DELETIONS.md

Archivos eliminados:
- src/path/to/old-file.tsx
- src/path/to/old-file.test.tsx

Validación: TypeScript  | ESLint  | Build 
"
```

**Ejemplo real del proyecto:**
```bash
git commit -m "refactor(cleanup): Eliminar código legacy completo (1,258 líneas)

Eliminación sistemática de código legacy en 4 fases:

FASE 1: Modo Full - ProjectEventForm (748 líneas)
FASE 2: FormModal System Deprecated (380 líneas)
FASE 3: Firebase Config Re-export Layer (15 líneas)
FASE 4: Tests Obsoletos (115 líneas)

Archivos eliminados (6):
- src/components/forms/ProjectEventForm/FullFields.tsx
- src/components/ui/modal/FormModal.tsx
- src/hooks/useModalManager.ts
- (+ 3 archivos de tests)

Validación: TypeScript (0 errores) | ESLint (0 críticos) | Build (exitoso)
"
```

---

##  Criterios para Eliminar Directamente

**Eliminar SIN deprecación previa cuando:**

-  **Código interno** sin dependencias externas (usuarios, APIs públicas)
-  **Sin referencias activas** verificado con `rg`
-  **Nueva implementación lista** probada y en producción
-  **Tamaño significativo** (>100 líneas o arquitecturalmente importante)
-  **Proyecto interno** equipo pequeño/personal (caso CalReact)

**Ejemplo decisión rápida:**
```typescript
// ComponenteViejoModal.tsx (150 líneas)
// Referencias activas: 0 (verificado con rg)
// Reemplazo: NuevoModalLayout (ya en producción)
// Decisión: ELIMINAR DIRECTAMENTE 
```

---

##   Excepciones: Cuándo Deprecar Temporalmente

**Solo usar período de gracia deprecated si aplica TODO lo siguiente:**

-   **Biblioteca pública** con usuarios externos, O
-   **API consumida** por otros equipos/servicios, O
-   **Migración compleja** que requiere >2 semanas coordinación

**En estos casos excepcionales:**

1. Marcar código con `@deprecated`:
   ```typescript
   /**
    * @deprecated Use NewComponent instead. Will be removed in v2.0 (2025-12-01)
    * Migration guide: docs/migrations/old-to-new.md
    */
   export const OldComponent = () => { ... }
   ```

2. Documentar en `docs/deletions/PENDING-DELETIONS.md`:
   ```markdown
   ### OldComponent (Pending Deletion)
   - **Deprecation Date:** 2025-10-08
   - **Planned Deletion:** 2025-12-01 (8 semanas)
   - **Reason:** Public API usado por 3 equipos externos
   - **Migration Guide:** docs/migrations/old-to-new.md
   ```

3. Establecer **fecha límite** de eliminación
4. Comunicar a usuarios/equipos afectados
5. Tras período de gracia ’ eliminar siguiendo proceso estándar

**Nota para CalReact:** Proyecto interno, equipo pequeño ’ 95% eliminaciones directas, sin deprecación.

---

## >ê Validación Post-Eliminación (OBLIGATORIA)

**Checklist de validación:**

```bash
# 1. TypeScript: 0 errores
npm run typecheck
# Resultado esperado: "Found 0 errors"

# 2. ESLint: 0 errores críticos
npm run lint
# Resultado esperado: Sin errores (warnings OK)

# 3. Build exitoso
npm run build
# Resultado esperado: Build completo sin errores

# 4. Tests (opcional pero recomendado)
npm run test:ci
# Resultado esperado: Todos los tests pasan
```

**Criterio de éxito:** TODOS los comandos pasan sin errores.

**Si alguno falla:**
- L NO hacer commit aún
-  Revisar qué rompió la eliminación
-  Corregir referencias rotas o migrar código faltante
-  Volver a validar hasta que TODO pase

---

## =Ê Granularidad: Qué Registrar vs Qué No

###  REGISTRAR en DELETIONS.md (Significativo)

- Componentes completos (>100 líneas)
- Servicios/hooks eliminados
- Arquitecturas deprecated (FormModal, EventModal)
- Migraciones completas (Google Places, PageTableLayout)
- Sistemas completos (modo Full, cache experimental)

### L NO REGISTRAR (Ruido)

- Funciones helper individuales (<20 líneas)
- Constantes duplicadas
- Imports sin usar
- Comentarios viejos
- Console.logs de debug
- Variables renombradas

**Regla práctica:** Si restaurarlo requeriría >30 minutos de trabajo, regístralo.

---

## =Ý Template de Commit Específico

**Formato estandarizado para commits de eliminación:**

```bash
refactor(cleanup): Eliminar [Nombre] [tipo]

- Qué: [archivo.tsx] (X líneas)
- Por qué: [Razón técnica específica]
- Reemplazo: [Nuevo componente/patrón] (si existe)
- Registrado en: docs/deletions/DELETIONS.md

[Sección opcional: Archivos eliminados]
- src/path/file1.tsx
- src/path/file2.test.tsx

[Sección opcional: Detalles de fases si es eliminación grande]
FASE 1: [Descripción]
FASE 2: [Descripción]

Validación: TypeScript  | ESLint  | Build 
```

**Variantes del tipo:**
- `legacy` - Código antiguo reemplazado
- `deprecated` - Código marcado deprecated previamente
- `unused` - Código sin referencias activas
- `duplicated` - Código duplicado consolidado
- `experimental` - Código de prueba no productivo

---

## = Comandos Útiles de Análisis

### Buscar Código Deprecated Actual

```bash
# Buscar archivos marcados como deprecated
rg "DEPRECATED|@deprecated|OBSOLETO" src/ -C 3

# Buscar funciones que lanzan errores de deprecated
rg "throw new Error.*deprecated" src/

# Buscar TODOs relacionados con legacy
rg "TODO.*legacy|TODO.*deprec" src/
```

### Analizar Eliminaciones Pasadas

```bash
# Commits de eliminación de código
git log --oneline --grep="eliminar\|remove\|delete\|legacy" -i -20

# Ver estadísticas de commit específico
git show f78cd87 --stat

# Ver cambios completos de una eliminación
git diff f78cd87~1..f78cd87
```

### Estimar Tamaño de Eliminación

```bash
# Contar líneas de archivo a eliminar
wc -l src/components/OldComponent.tsx

# Contar líneas de múltiples archivos
find src/components/deprecated/ -name "*.tsx" -exec wc -l {} + | tail -1
```

---

## <¯ Ejemplos Reales del Proyecto CalReact

### Ejemplo 1: Eliminación Masiva por Fases (commit f78cd87)

**Contexto:** Eliminar 1,258 líneas de código legacy en 4 fases incrementales.

**Proceso seguido:**

```bash
# FASE 1: Modo Full (748 líneas)
git rm src/components/forms/ProjectEventForm/FullFields.tsx
git rm src/components/forms/ProjectEventForm/__tests__/FullFields.test.tsx
# ... actualizar archivos relacionados
npm run typecheck && npm run lint  #  Checkpoint 1

# FASE 2: FormModal System (380 líneas)
git rm src/components/ui/modal/FormModal.tsx
git rm src/hooks/useModalManager.ts
# ... actualizar exports
npm run typecheck && npm run lint  #  Checkpoint 2

# FASE 3: Firebase Config (15 líneas)
git rm src/lib/firebase/config.ts
# ... actualizar imports
npm run typecheck && npm run lint  #  Checkpoint 3

# FASE 4: Tests Obsoletos (115 líneas)
# ... limpiar tests FormModal
npm run typecheck && npm run lint && npm run build  #  Checkpoint final

# Commit unificado
git commit -m "refactor(cleanup): Eliminar código legacy completo (1,258 líneas)
..."
```

**Lección aprendida:** Fases incrementales reducen riesgo, cada fase validada independientemente.

---

### Ejemplo 2: Eliminación Arquitectural (commit 1c6e405)

**Contexto:** Eliminar campo `status` de `ProjectEventType` (arquitectura SSOT).

**Proceso seguido:**

```bash
# Verificar referencias
rg "ProjectEventType" src/ --type typescript
rg "eventStatus|event\.status" src/

# Eliminar campo de tipo
# (Edit src/types/project.ts - remover status de interface)

# Actualizar servicios afectados
# ... 6 archivos modificados

# Validación
npm run typecheck  # 0 errores
npm run lint       # 0 errores críticos
npm run build      # Build exitoso

# Commit específico
git commit -m "refactor(events): Eliminar campo status de ProjectEventType completamente
..."
```

**Lección aprendida:** Eliminación de campo requiere análisis de impacto (6 archivos afectados), validación crítica.

---

### Ejemplo 3: Eliminación de Deuda Técnica (commit 2816761)

**Contexto:** Eliminar modo Full deprecated tras migración a lean-only.

**Proceso seguido:**

```bash
# Verificar modo Full sin referencias
rg "mode=\"full\"" src/
rg "projectEventFullSchema" src/

# Resultados: Solo en tests (migrados a lean)

# Eliminar schema deprecated
# (Edit src/schemas/project-event.schemas.ts)

# Eliminar FullFields component
git rm src/components/forms/ProjectEventForm/FullFields.tsx

# Actualizar tipos (FormMode = 'lean' solo)
# (Edit types.ts)

# Validación completa
npm run typecheck && npm run lint && npm run build  #  Todo pasa

# Commit
git commit -m "refactor(cleanup): Eliminar deuda técnica del modo Full
..."
```

**Lección aprendida:** Deuda técnica acumulada ralentiza desarrollo, eliminar proactivamente.

---

## =€ Flujo Rápido (Checklist)

**Para eliminaciones simples (<500 líneas, un solo archivo):**

- [ ] Verificar sin referencias: `rg "ComponentName" src/`
- [ ] Eliminar: `git rm src/path/file.tsx`
- [ ] Validar: `npm run typecheck && npm run lint`
- [ ] Registrar en `docs/deletions/DELETIONS.md`
- [ ] Commit: `refactor(cleanup): Eliminar [Nombre] legacy`
- [ ] Build final: `npm run build`

**Tiempo estimado:** 5-10 minutos para eliminación estándar.

---

## =Ú Recursos Relacionados

### Documentación del Proyecto
- **Template:** `docs/deletions/DELETIONS.md` - Formato de registro
- **Implementaciones:** `claude-docs/IMPLEMENTATIONS.md` - Log de features completadas
- **Patterns:** `claude-docs/references/patterns.md` - Anti-patterns a evitar

### Git y Restauración
```bash
# Ver archivo eliminado en commit específico
git show f78cd87:src/components/ui/modal/FormModal.tsx

# Restaurar archivo eliminado
git checkout f78cd87 -- src/path/to/file.tsx

# Ver historia completa de archivo eliminado
git log --all --full-history -- "src/path/to/file.tsx"
```

---

## <“ Principios de Diseño

### Por Qué Eliminar en Lugar de Deprecar

**Ventajas de eliminación inmediata:**
1. **Codebase limpio** - Solo código activo visible
2. **Velocidad onboarding** - Nuevos desarrolladores no confundidos
3. **Recuperabilidad** - Git nunca pierde código realmente
4. **Contexto documentado** - DELETIONS.md explica decisiones
5. **Deuda técnica cero** - No acumulación de código muerto

**Desventajas de deprecación prolongada:**
1. L Código muerto mezclado con activo
2. L Confusión sobre qué usar (¿viejo o nuevo?)
3. L Mantenimiento doble (viejo + nuevo)
4. L Tests duplicados
5. L Complejidad arquitectural innecesaria

### Filosofía Single Source of Truth (SSOT)

Aplicado a eliminación de código:
- **Una sola implementación activa** por funcionalidad
- **Una sola fuente de verdad** arquitectural
- **Documentación clara** de qué es activo vs archivado
- **Decisiones explícitas** registradas en DELETIONS.md

---

**=Ê Última actualización:** Octubre 2025
**=' Mantenimiento:** Revisar proceso trimestralmente
**=Ý Feedback:** Proponer mejoras en CLAUDE.md si proceso no funciona
