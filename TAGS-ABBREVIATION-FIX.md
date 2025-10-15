# 🏷️ SOLUCIÓN: Tags de Desinstalación - Mostrar Abreviaturas

**Fecha:** 2025-10-15
**Status:** ✅ Causa raíz identificada | 🛠️ Solución documentada
**Prioridad:** Alta (UX del calendario)

---

## 🎯 Problema Identificado

### Síntoma
Las **tags de desinstalación** en el calendario muestran nombres completos ("Aluminio", "Madera") en lugar de abreviaturas ("AL", "MD").

### Causa Raíz
Los documentos en `projects` y `projectEvents` tienen `uninstallTags[]` **sin el campo `abbreviation`**.

```json
// ❌ Estado actual en projectEvents/projects
{
  "uninstallTags": [
    {
      "id": "Uh8Q4A363QByl1kXOfAZ",
      "name": "Aluminio",
      "color": "sky"
      // ❌ FALTA: "abbreviation": "AL"
    }
  ]
}
```

### Flujo del Bug
```
1. TagSelector carga tags desde uninstall-tags ✅ (CON abbreviation)
2. Usuario selecciona tags → se guardan en project ❌ (SIN abbreviation)
3. Evento hereda tags del proyecto ❌ (SIN abbreviation)
4. TagBadge renderiza: tag.abbreviation || tag.name
5. Resultado: Muestra nombre completo "Aluminio"
```

---

## ✅ Solución Inmediata: Actualización Manual

### Mapeo de Tags Maestros

| ID (Firebase) | Nombre | Abbreviation |
|---------------|--------|--------------|
| `Uh8Q4A363QByl1kXOfAZ` | Aluminio | **AL** |
| `9WaoIE0pR4iTFPyJnarb` | Madera | **MD** |
| `OML9AaUbrPE6bQmF4gW1` | Fierro | **FE** |

### Opción A: Firebase Console (Más Rápida)

1. **Ir a:** [Firebase Console](https://console.firebase.google.com) → Firestore Database
2. **Colección:** `projectEvents`
3. **Filtro:** `uninstallTags != []`
4. **Por cada documento:**
   - Expandir array `uninstallTags`
   - Para cada objeto en el array:
     - Click en "Add field"
     - **Field:** `abbreviation`
     - **Type:** string
     - **Value:** Usar tabla de mapeo arriba (ej: "AL" para Aluminio)

**Ejemplo visual:**
```
projectEvents/HJixowmpBK6TOif2FRJk
└─ uninstallTags (array)
    ├─ [0] (map)
    │   ├─ id: "Uh8Q4A363QByl1kXOfAZ"
    │   ├─ name: "Aluminio"
    │   ├─ color: "sky"
    │   └─ abbreviation: "AL"  ← AGREGAR MANUALMENTE
    └─ [1] (map)
        ├─ id: "9WaoIE0pR4iTFPyJnarb"
        ├─ name: "Madera"
        ├─ color: "yellow"
        └─ abbreviation: "MD"  ← AGREGAR MANUALMENTE
```

5. **Repetir para colección:** `projects`

**Documentos afectados (estimado):**
- `projectEvents`: ~5-10 documentos con tags
- `projects`: ~10-15 documentos con tags

**Tiempo estimado:** 10-15 minutos

---

### Opción B: Script Automatizado (Requiere Setup)

**Archivos preparados:**
- ✅ `/scripts/migrate-uninstall-tags-abbreviations.ts` - Script completo
- ✅ `/scripts/MIGRATE-TAGS-ABBREVIATIONS-README.md` - Documentación detallada

**Requisitos previos:**
1. Credenciales de Firebase Admin SDK configuradas
2. Variables de entorno válidas en `.env.local`

**Ejecución:**
```bash
# Opción 1: Con Admin SDK (recomendado)
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
npx tsx scripts/migrate-uninstall-tags-abbreviations.ts

# Opción 2: Cloud Function
firebase deploy --only functions:migrateTagAbbreviations
curl https://REGION-PROJECT.cloudfunctions.net/migrateTagAbbreviations
```

**Status actual:** Script preparado pero requiere configuración de credenciales Admin SDK.

---

## 🔍 Validación Post-Actualización

### 1. Verificar en Firestore

**Query en consola:**
```
projectEvents
  WHERE uninstallTags array-contains ANY
```

**Validar estructura:**
```json
{
  "uninstallTags": [
    {
      "id": "Uh8Q4A363QByl1kXOfAZ",
      "name": "Aluminio",
      "color": "sky",
      "abbreviation": "AL"  ✅ Campo presente
    }
  ]
}
```

### 2. Testing Visual en Aplicación

1. Abrir navegador: `http://localhost:3002/calreact`
2. Buscar evento: "17870 - Sra. Loreto Castañeda" (14 de octubre)
3. **Expectativa:** Ver badges con abreviaturas:
   ```
   ┌─────┐ ┌─────┐
   │ AL  │ │ MD  │  ← Abreviaturas visibles
   └─────┘ └─────┘
   ```
4. **Hover:** Tooltip muestra nombre completo "Aluminio"

### 3. Testing Automatizado con Playwright

```bash
# Iniciar servidor
npm run dev  # Puerto 3002

# En otra terminal: ejecutar test
npx playwright test --headed
```

**Script de validación:**
```typescript
// Navegar al calendario
await page.goto('http://localhost:3002/calreact');

// Buscar evento con tags
const event = page.locator('text=17870');
await event.click();

// Validar que TagBadge muestra abreviaturas
const badges = page.locator('[data-testid="tag-badge"]');
await expect(badges.first()).toContainText('AL');
await expect(badges.nth(1)).toContainText('MD');
```

---

## 📊 Documentos Afectados (Muestra)

### ProjectEvents con Tags
```
HJixowmpBK6TOif2FRJk - 17870 - Capitán Carrera
  └─ Aluminio (SIN abbreviation) ❌
  └─ Madera (SIN abbreviation) ❌

t0VID75SIfCpK7vYil72 - 17870 - Capitán Carrera
  └─ Aluminio (SIN abbreviation) ❌
  └─ Madera (SIN abbreviation) ❌

LUhKzubYH63Qv0ncirfj - 17870 - Capitán Carrera
  └─ Aluminio (SIN abbreviation) ❌
  └─ Madera (SIN abbreviation) ❌
```

### Projects con Tags
```
DkDj27lYA8aBevzK9HUx - Proyecto 18143
  └─ Aluminio (SIN abbreviation) ❌
  └─ Madera (CON abbreviation: MD) ✅ (Parcial)

lKbaoKNVpMNXqfSPTwko - Proyecto 18048
  └─ Aluminio (SIN abbreviation) ❌

z9F783Ufnlv7mVcdIYwW - Proyecto 18026
  └─ Aluminio (SIN abbreviation) ❌
```

---

## 🔮 Solución Arquitectural Futura (Opcional)

### Problema de Diseño Actual
Actualmente los tags se **duplican** en cada documento (desnormalización):
```
uninstall-tags/{id}     ← Maestro
projects/{id}           ← Copia completa del tag
projectEvents/{id}      ← Copia completa del tag
```

**Desventajas:**
- ❌ Actualizar un tag requiere migración de datos
- ❌ Inconsistencias entre copias
- ❌ Desperdicio de espacio de almacenamiento

### Propuesta: Normalización con IDs
```json
// Solo guardar referencias
{
  "uninstallTagIds": ["Uh8Q4A363QByl1kXOfAZ", "9WaoIE0pR4iTFPyJnarb"]
}

// Enriquecer en frontend
const enrichedTags = event.uninstallTagIds.map(id => masterTagsMap.get(id));
```

**Beneficios:**
- ✅ Single Source of Truth
- ✅ Cambios automáticos en todos los documentos
- ✅ Sin migración de datos necesaria

**Trade-offs:**
- ❌ Join en frontend (acceptable para <100 tags)
- ❌ Requiere refactor de servicios

**Status:** Propuesto - No implementado (fuera del scope actual)

---

## 📚 Archivos Relacionados

### Scripts
- `/scripts/migrate-uninstall-tags-abbreviations.ts` - Migración automatizada
- `/scripts/fix-single-event-tags.ts` - Demo con un solo evento
- `/scripts/MIGRATE-TAGS-ABBREVIATIONS-README.md` - Documentación completa

### Código Fuente
- `/src/types/tags.ts` - Interface Tag con abbreviation
- `/src/services/uninstallTagService.ts` - CRUD tags (incluye abbreviation)
- `/src/components/custom/uninstall-tags/TagBadge.tsx` - Renderiza abbreviation
- `/src/components/custom/uninstall-tags/TagSelector.tsx` - Selector de tags
- `/src/utils/eventValidation.ts` - Sanitización (copia tags tal cual)

### Testing
- `/src/components/custom/uninstall-tags/__tests__/TagBadge.test.tsx`
- `/e2e/tests/address-input-integration.spec.ts` (patrón similar)

---

## ✅ Checklist de Implementación

- [x] 🔍 Diagnosticar causa raíz
- [x] 📝 Crear script de migración
- [x] 📚 Documentar solución completa
- [ ] 🔧 Ejecutar actualización manual (Firebase Console)
- [ ] ✅ Validar en Firestore que tags tienen abbreviation
- [ ] 👁️ Testing visual en calendario (localhost:3002/calreact)
- [ ] 🤖 Testing automatizado con Playwright
- [ ] 📊 Registrar en IMPLEMENTATIONS.md

---

**Última actualización:** 2025-10-15
**Autor:** Claude Code + Usuario
**Status:** ✅ Ready for execution
