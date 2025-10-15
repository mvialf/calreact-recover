# 🏷️ Migración: Agregar Abbreviations a UninstallTags

**Fecha:** 2025-10-15
**Problema:** Tags de desinstalación no muestran abreviaturas en calendario
**Causa Raíz:** Proyectos y eventos tienen `uninstallTags[]` sin campo `abbreviation`

---

## 📋 Diagnóstico del Problema

###  Estado Actual

**✅ Colección `uninstall-tags` (Maestro):**
```json
{
  "id": "Uh8Q4A363QByl1kXOfAZ",
  "name": "Aluminio",
  "abbreviation": "AL",  // ✅ Campo existe
  "color": "sky"
}
```

**❌ Colección `projects` (Referencia):**
```json
{
  "uninstallTags": [
    {
      "id": "Uh8Q4A363QByl1kXOfAZ",
      "name": "Aluminio",
      // ❌ FALTA: "abbreviation": "AL"
      "color": "sky"
    }
  ]
}
```

**❌ Colección `projectEvents` (Referencia):**
```json
{
  "uninstallTags": [
    {
      "id": "Uh8Q4A363QByl1kXOfAZ",
      "name": "Aluminio",
      // ❌ FALTA: "abbreviation": "AL"
      "color": "sky"
    }
  ]
}
```

### Flujo de Datos Actual

```
uninstall-tags (Maestro)
  ↓ [TagSelector carga availableTags]
  ↓ [Usuario selecciona tags]
  ↓ [Tag completo con abbreviation]
projects.uninstallTags
  ↓ [Formulario copia de project]
projectEvents.uninstallTags
  ↓ [CalendarEventCard renderiza]
TagBadge
  ↓ [tag.abbreviation || tag.name]
❌ RESULTADO: Muestra "Aluminio" en lugar de "AL"
```

---

## 🛠️ Solución: Migración Manual con Firebase Console

### Opción 1: Script Automático (Recomendado para Producción)

**Script preparado:** `scripts/migrate-uninstall-tags-abbreviations.ts`

**Configuración requerida:**
1. Asegurar que `.env.local` tiene credenciales válidas de Firebase
2. Ejecutar con variables de entorno:
   ```bash
   export $(cat .env.local | xargs) && npx tsx scripts/migrate-uninstall-tags-abbreviations.ts
   ```

**Nota:** El script actual usa Client SDK. Para producción, migrar a Admin SDK.

---

### Opción 2: Actualización Manual por Firebase Console (Más Rápida)

#### Paso 1: Obtener IDs de Tags con Abbreviations

Consulta en Firebase Console → Firestore → `uninstall-tags`:

| ID | Name | Abbreviation |
|----|------|--------------|
| `Uh8Q4A363QByl1kXOfAZ` | Aluminio | AL |
| `9WaoIE0pR4iTFPyJnarb` | Madera | MD |
| `OML9AaUbrPE6bQmF4gW1` | Fierro | FE |

#### Paso 2: Actualizar Proyectos

1. Ir a Firebase Console → Firestore → `projects`
2. Filtrar: `uninstallTags != []`
3. Para cada proyecto:
   ```json
   // ANTES
   {
     "uninstallTags": [
       {"id": "Uh8Q...", "name": "Aluminio", "color": "sky"}
     ]
   }

   // DESPUÉS (agregar campo manualmente)
   {
     "uninstallTags": [
       {"id": "Uh8Q...", "name": "Aluminio", "color": "sky", "abbreviation": "AL"}
     ]
   }
   ```

#### Paso 3: Actualizar Eventos

1. Ir a Firebase Console → Firestore → `projectEvents`
2. Filtrar: `uninstallTags != []`
3. Repetir mismo proceso que proyectos

**⚠️ IMPORTANTE:** Si un proyecto tiene múltiples tags, actualizar TODOS los objetos del array.

---

### Opción 3: Cloud Function (Producción - Recomendado)

Crear una Cloud Function para migración en background:

```typescript
// functions/src/migrateTagAbbreviations.ts
export const migrateTagAbbreviations = functions
  .runWith({ timeoutSeconds: 540, memory: '1GB' })
  .https.onRequest(async (req, res) => {
    const db = admin.firestore();

    // Cargar tags maestros
    const tagsSnapshot = await db.collection('uninstall-tags').get();
    const tagsMap = new Map();
    tagsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      tagsMap.set(doc.id, data.abbreviation);
    });

    // Actualizar proyectos
    const projectsSnapshot = await db.collection('projects')
      .where('uninstallTags', '!=', [])
      .get();

    const batch = db.batch();
    let count = 0;

    projectsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const enrichedTags = data.uninstallTags.map(tag => ({
        ...tag,
        abbreviation: tagsMap.get(tag.id) || tag.name.substring(0, 2).toUpperCase()
      }));

      batch.update(doc.ref, { uninstallTags: enrichedTags });
      count++;

      if (count === 500) { // Firestore batch limit
        await batch.commit();
        count = 0;
      }
    });

    if (count > 0) await batch.commit();

    res.send({ success: true, migrated: projectsSnapshot.size });
  });
```

**Despliegue:**
```bash
firebase deploy --only functions:migrateTagAbbreviations
```

**Ejecución:**
```bash
curl https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/migrateTagAbbreviations
```

---

## ✅ Validación Post-Migración

### 1. Verificar en Firestore Console

**Proyecto de ejemplo:**
```
projects/{projectId}
  └─ uninstallTags[0]
      ├─ id: "Uh8Q4A363QByl1kXOfAZ"
      ├─ name: "Aluminio"
      ├─ color: "sky"
      └─ abbreviation: "AL"  ✅ Campo presente
```

### 2. Testing Visual en Calendario

1. Abrir `/calreact` en navegador
2. Buscar evento con tags de desinstalación
3. Confirmar que se muestran **abreviaturas** ("AL", "MD") en lugar de nombres completos

**Antes:**
```
┌───────────┐
│ Aluminio  │  ← Nombre completo
│ Madera    │
└───────────┘
```

**Después:**
```
┌─────┐ ┌─────┐
│ AL  │ │ MD  │  ← Abreviaturas (2 letras)
└─────┘ └─────┘
```

### 3. Testing con Playwright

```bash
npx playwright test --headed --grep "tags de desinstalación"
```

**Validaciones automáticas:**
- TagBadge renderiza abreviaturas
- Tooltip muestra nombre completo al hover
- Tags se ven correctamente en todos los eventos

---

## 🔮 Prevención Futura

### Solución Arquitectural: Normalización de Referencias

**Problema actual:** Tags se duplican en proyectos/eventos sin sincronización

**Solución propuesta:**
1. **Cambio 1:** Guardar solo IDs en proyectos/eventos
   ```json
   {
     "uninstallTagIds": ["Uh8Q4A363QByl1kXOfAZ", "9WaoIE0pR4iTFPyJnarb"]
   }
   ```

2. **Cambio 2:** Enriquecer en runtime (frontend)
   ```typescript
   const enrichedEvent = {
     ...event,
     uninstallTags: event.uninstallTagIds.map(id => tagsMap.get(id))
   };
   ```

**Beneficios:**
- ✅ Single Source of Truth (tags maestros)
- ✅ Cambios en tags se reflejan automáticamente
- ✅ Sin necesidad de migración de datos existentes

**Trade-offs:**
- ❌ Requiere join en frontend (acceptable con pocos tags)
- ❌ Refactor de servicios y componentes

**Estado:** Propuesto (no implementado)

---

## 📚 Referencias

- **Script de migración:** `/scripts/migrate-uninstall-tags-abbreviations.ts`
- **Tipo Tag:** `/src/types/tags.ts` (interface Tag)
- **Componente TagBadge:** `/src/components/custom/uninstall-tags/TagBadge.tsx`
- **Servicio Tags:** `/src/services/uninstallTagService.ts`

---

**Última actualización:** 2025-10-15
**Estado:** Documentado - Requiere ejecución manual
**Prioridad:** Alta (afecta UX del calendario)
