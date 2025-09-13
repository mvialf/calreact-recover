# 🎯 Migración [NOMBRE-MIGRACIÓN] - [AÑO] (MICRO)

## 📊 Estado del Proyecto
- **Fecha Inicio:** [YYYY-MM-DD]
- **Prioridad:** 🔴/🟡/🟢 [ALTA/MEDIA/BAJA]
- **Estado:** ⚪/🔄/✅ [Pending/In Progress/Complete]
- **Tipo:** [API/Dependency/Hotfix/Performance]
- **Estimación:** < 2 horas

## 🚨 Problema/Objetivo
**Problema:** [Descripción concisa del problema o mejora]

**Solución:** [Descripción breve de la solución planteada]

## 🎯 Objetivos (Máximo 3)
- [ ] **Objetivo 1:** [Descripción específica y medible]
- [ ] **Objetivo 2:** [Descripción específica y medible]
- [ ] **Objetivo 3:** [Descripción específica y medible]

## ⚡ Quick Implementation

### **Archivos a Modificar:**
- `[archivo1]` - [Descripción del cambio]
- `[archivo2]` - [Descripción del cambio]

### **Comandos Básicos:**
```bash
# 1. Setup
git checkout -b feature/[nombre-migration]

# 2. Implementar (ver IMPLEMENTATION.md)

# 3. Validar
npm run typecheck && npm run lint && npm run build
```

## 📊 Métricas de Éxito
- **[Métrica 1]:** [baseline] → [objetivo]
- **[Métrica 2]:** [baseline] → [objetivo]

## 🚨 Criterios de Red Flag
- ❌ [Condición específica que requiere rollback]
- ❌ [Condición específica que requiere rollback]

## 🔄 Rollback Plan (< 2 minutos)
```bash
# Opción simple para migraciones micro
git checkout HEAD~1 -- [archivo-modificado]
npm run dev  # Verificar funcionalidad
```

---

## ✅ Completion Checklist
- [ ] **Implementación** completada (ver IMPLEMENTATION.md)
- [ ] **Compilación** sin errores (`npm run typecheck && npm run lint`)
- [ ] **Funcionalidad** validada manualmente
- [ ] **Performance** sin degradación
- [ ] **Documentación** actualizada (si aplica)

---

> **💡 Para migraciones micro:** Si el cambio se vuelve más complejo que 2 horas, considerar usar TEMPLATE-MIGRATION completo.

**📅 Creado:** [YYYY-MM-DD]  
**👤 Responsable:** [Nombre]  
**⏳ Time to complete:** [X horas] de 2 estimadas