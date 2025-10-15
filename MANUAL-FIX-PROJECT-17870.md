# 🔧 Manual Fix: Proyecto 17870 - Agregar Abbreviations a Tags

**Fecha:** 2025-10-15
**Problema:** Tags sin campo `abbreviation` en proyecto 17870
**Impacto:** Eventos heredan tags incompletos y muestran nombres completos ("Aluminio", "Madera") en lugar de abreviaciones ("AL", "MD")

---

## 📋 Pasos para Corrección Manual en Firebase Console

### 1. Abrir Firebase Console - Ir Directamente al Proyecto
```
https://console.firebase.google.com/project/calreact-6a481/firestore/data/~2Fprojects~2Fch6T7gLoHBHJVESipW2I
```

**⚠️ IMPORTANTE:** Debes ir a la colección `projects`, NO a `uninstall-tags` (que es donde estás ahora)

### 2. Navegar al Documento
```
Collection: projects
Document ID: ch6T7gLoHBHJVESipW2I
```

### 3. Editar Campo `uninstallTags`

**Ubicar el campo:** `uninstallTags` (array con 2 elementos)

**Reemplazar el array completo con:**

```json
[
  {
    "id": "Uh8Q4A363QByl1kXOfAZ",
    "name": "Aluminio",
    "color": "sky",
    "abbreviation": "AL",
    "createdAt": {"seconds": 1726913273, "nanoseconds": 934000000}
  },
  {
    "id": "9WaoIE0pR4iTFPyJnarb",
    "name": "Madera",
    "color": "yellow",
    "abbreviation": "MD",
    "createdAt": {"seconds": 1726913196, "nanoseconds": 777000000}
  }
]
```

**Cambios realizados:**
- ✅ Tag Aluminio: Agregado campo `"abbreviation": "AL"`
- ✅ Tag Madera: Agregado campo `"abbreviation": "MD"` (explícito)
- ✅ Timestamps preservados exactamente como en el original

### 4. Guardar Cambios
- Click en botón "Update" o "Actualizar"
- Verificar que no haya errores

---

## ✅ Validación Post-Fix

### Paso 1: Eliminar Evento de Prueba
```
Collection: projectEvents
Document ID: LuiCVpcg90zIR4thVZhx
Acción: Eliminar documento
```

### Paso 2: Crear Nuevo Evento de Prueba
1. Ir a http://localhost:3002/calreact
2. Click "Añadir Evento" → "Proyecto"
3. Buscar proyecto "17870"
4. Crear evento con fecha 15 de octubre
5. **Verificar:** Los tags deben mostrar "AL" y "MD" en el modal

### Paso 3: Verificar en Calendario
1. El evento debe aparecer en el calendario
2. **Verificar:** Los tags deben mostrar "AL" y "MD" (no "Aluminio", "Madera")

---

## 📊 Datos de Referencia

### Tags Maestros (uninstall-tags collection)
```json
{
  "Aluminio": {
    "id": "Uh8Q4A363QByl1kXOfAZ",
    "abbreviation": "AL",
    "color": "sky"
  },
  "Madera": {
    "id": "9WaoIE0pR4iTFPyJnarb",
    "abbreviation": "MD",
    "color": "yellow"
  }
}
```

### Proyecto 17870 (Antes del Fix)
```json
"uninstallTags": [
  {"id": "Uh8Q4A363QByl1kXOfAZ", "name": "Aluminio", "color": "sky"},
  {"id": "9WaoIE0pR4iTFPyJnarb", "name": "Madera", "color": "yellow"}
]
```
❌ **Problema:** Falta campo `abbreviation`

### Proyecto 17870 (Después del Fix)
```json
"uninstallTags": [
  {"id": "Uh8Q4A363QByl1kXOfAZ", "name": "Aluminio", "color": "sky", "abbreviation": "AL"},
  {"id": "9WaoIE0pR4iTFPyJnarb", "name": "Madera", "color": "yellow", "abbreviation": "MD"}
]
```
✅ **Solucionado:** Campo `abbreviation` agregado

---

## 🎯 Resultado Esperado

**Antes del fix:**
- Modal: Tags muestran "Aluminio", "Madera"
- Calendario: Tags muestran "Aluminio", "Madera"

**Después del fix:**
- Modal: Tags muestran "AL", "MD"
- Calendario: Tags muestran "AL", "MD"

---

## 📝 Notas Técnicas

**Por qué este problema ocurrió:**
- Los tags fueron asignados al proyecto antes de implementar el campo `abbreviation`
- El sistema de denormalización copia los tags completos al proyecto
- Los eventos heredan los tags del proyecto (incluidas las faltas)

**Arquitectura actual:**
```
uninstall-tags (maestro)
    ↓ (copia completa)
projects.uninstallTags
    ↓ (herencia)
projectEvents.uninstallTags
    ↓ (renderizado)
Calendar TagBadge → {tag.abbreviation || tag.name}
```

**Prevención futura:**
- El sistema ya está configurado para incluir `abbreviation` al asignar tags
- Este fix es retroactivo para proyectos creados antes de la implementación

---

**📸 Screenshots de evidencia:**
- `.playwright-mcp/evento-proyecto-17870-tags-sin-abbreviation.png`
- `.playwright-mcp/calendario-evento-17870-tags-sin-abbreviation.png`

**🔗 Script automático (fallido por permisos):**
- `scripts/fix-project-17870-tags.ts`
- Alternativa: Fix manual (este documento)
