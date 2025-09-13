# 📋 Guía del Sistema de Migraciones - CalReact

**Sistema de Templates Optimizado para Claude Code**

## 🎯 Propósito del Sistema

Este sistema permite a **Claude Code** gestionar migraciones de manera **ordenada, documentada y escalable**, siguiendo tu filosofía de:

- **Documentación técnica extensa** como contexto para IA
- **Transparencia completa** del proceso (7 archivos)
- **Pocas migraciones activas** simultáneamente
- **Completar antes de iniciar** nuevas migraciones
- **Dual documentation:** Granular (migrations) + Consolidado (implementation-tracking)

## 🤖 Optimizado para Claude Code

**IMPORTANTE:** Los templates han sido optimizados específicamente para Claude Code:
- ✅ Sin fechas ni estimaciones temporales (Claude Code no maneja bien el tiempo real)
- ✅ Comandos exactos y criterios binarios
- ✅ Contexto técnico claro sin overhead de gestión humana
- ✅ Transparencia total para debugging y continuación de trabajo

---

## 🏗️ Estructura del Sistema

```
docs/technical/migrations/
├── 📁 pending-migrations/           # Migraciones activas (WIP limitado)
├── 📁 complete-migrations/          # Migraciones archivadas
├── 📁 TEMPLATE-MIGRATION/           # Template completo (>2 horas)
├── 📁 MICRO-TEMPLATE/              # Template simple (<2 horas)
├── 📁 scripts/                     # Herramientas de automatización
└── 📋 MIGRATION-GUIDE.md           # Esta guía
```

---

## 🚀 Cómo Usar el Sistema

### **1️⃣ Decidir Tipo de Template**

| Estimación | Template | Archivos | Uso para |
|------------|----------|----------|----------|
| **< 2 horas** | MICRO-TEMPLATE | 2 archivos | Hotfixes, cambios simples |
| **2+ horas** | TEMPLATE-MIGRATION | 7 archivos | Migraciones arquitecturales |

### **2️⃣ Crear Nueva Migración**

#### **Opción A: Manual (Rápido)**
```bash
# 1. Copiar template apropiado
cp -r docs/technical/migrations/TEMPLATE-MIGRATION/ \
      docs/technical/migrations/pending-migrations/nueva-migration-2025/

# 2. Crear branch
git checkout -b feature/nueva-migration-2025

# 3. Personalizar archivos (cambiar placeholders)
```

#### **Opción B: Con Script (Automatizado)**
```bash
# Ejecutar script interactivo
./docs/technical/migrations/scripts/create-migration.sh

# El script preguntará:
# - Nombre de migración
# - Tipo (API/Dependency/Architecture/etc)
# - Prioridad (Alta/Media/Baja)
# - Estimación de tiempo
# Y creará todo automáticamente
```

### **3️⃣ Proceso de Desarrollo**

#### **Para MICRO-TEMPLATE:**
1. **README.md** - Definir problema y objetivos
2. **IMPLEMENTATION.md** - Implementar cambios
3. **Validar** y **completar**

#### **Para TEMPLATE-MIGRATION:**
1. **00-README.md** - Control central y quick start
2. **01-ANALYSIS.md** - Analizar estado actual 
3. **02-PLAN.md** - Crear plan detallado
4. **03-IMPLEMENTATION.md** - Implementar paso a paso
5. **04-VALIDATION.md** - Validar exhaustivamente  
6. **05-ROLLBACK.md** - Preparar contingencias
7. **06-COMPLETION.md** - Documentar resultados

### **4️⃣ Al Completar Migración**

```bash
# 1. Finalizar 06-COMPLETION.md con métricas
# 2. Mover a complete-migrations
mv docs/technical/migrations/pending-migrations/[nombre]/ \
   docs/technical/migrations/complete-migrations/

# 3. Crear resumen consolidado
cp docs/technical/migrations/complete-migrations/[nombre]/06-COMPLETION.md \
   docs/technical/migrations/complete-migrations/[nombre].md

# 4. Actualizar implementation-tracking
# (Agregar entrada en docs/IMPLEMENTATIONS.md)

# 5. Limpiar pending-migrations
rm -rf docs/technical/migrations/pending-migrations/[nombre]/
```

---

## 📋 Templates Disponibles

### **🔧 TEMPLATE-MIGRATION (Completo)**

| Archivo | Propósito | Cuándo usar |
|---------|-----------|-------------|
| `00-README.md` | Control central, quick start | Punto de entrada |
| `01-ANALYSIS.md` | Estado actual, problemas | Entender qué cambiar |
| `02-PLAN.md` | Plan detallado, cronograma | Antes de implementar |
| `03-IMPLEMENTATION.md` | Pasos específicos código | Durante implementación |
| `04-VALIDATION.md` | Checklist de validación | Testing exhaustivo |
| `05-ROLLBACK.md` | Plan de contingencia | Si algo falla |
| `06-COMPLETION.md` | Resumen final, métricas | Al terminar |

### **⚡ MICRO-TEMPLATE (Simplificado)**

| Archivo | Propósito |
|---------|-----------|
| `README.md` | Problema, objetivos, checklist |
| `IMPLEMENTATION.md` | Cambios específicos, validación |

---

## 🎛️ Criterios de Decisión

### **Usar MICRO-TEMPLATE cuando:**
- ✅ Estimación < 2 horas
- ✅ 1-3 archivos afectados
- ✅ Cambio bien definido y simple
- ✅ Riesgo bajo si falla

### **Usar TEMPLATE-MIGRATION cuando:**
- ✅ Estimación > 2 horas  
- ✅ Múltiples archivos/módulos
- ✅ Cambios arquitecturales
- ✅ Requiere plan de rollback
- ✅ Afecta funcionalidades críticas

### **Ejemplo de decisiones:**
```
Hotfix bug CSS                    → MICRO-TEMPLATE
Update dependency minor version   → MICRO-TEMPLATE
Migrar API deprecated            → TEMPLATE-MIGRATION  
Refactoring arquitectural        → TEMPLATE-MIGRATION
Performance optimization         → TEMPLATE-MIGRATION
```

---

## 🔄 Flujo de Gestión (Tu Filosofía)

### **Principio: WIP Limits**
- **Máximo 1-2 migraciones activas** en `pending-migrations/`
- **Completar antes de iniciar** nuevas migraciones
- **Focus en calidad** sobre cantidad

### **Flujo Completo:**
```
1. Identificar necesidad de migración
2. Crear en pending-migrations/ (WIP +1)  
3. Desarrollar siguiendo template
4. Completar 100% (incluyendo documentación)
5. Mover a complete-migrations/ (WIP -1)
6. Actualizar implementation-tracking/
7. pending-migrations/ queda limpio
```

### **Dual Documentation Strategy:**
- **`pending-migrations/`** - Working directory con detalles granulares
- **`complete-migrations/`** - Archive histórico con resúmenes  
- **`implementation-tracking/`** - Índice ejecutivo para Claude Code

---

## 🛠️ Scripts Disponibles

### **`create-migration.sh`**
**Propósito:** Crear nueva migración interactivamente

**Uso:**
```bash
./docs/technical/migrations/scripts/create-migration.sh
```

**Qué hace:**
- Solicita información básica (nombre, tipo, prioridad)
- Determina template apropiado automáticamente
- Copia y personaliza archivos
- Crea branch de Git
- Hace commit inicial

### **`archive-migration.sh`** (Pendiente de creación)
**Propósito:** Archivar migración completada

**Uso:**
```bash
./docs/technical/migrations/scripts/archive-migration.sh [nombre-migración]
```

**Qué haría:**
- Verificar que 06-COMPLETION.md existe
- Mover a complete-migrations/
- Crear entrada en implementation-tracking/
- Limpiar pending-migrations/

---

## 📊 Best Practices

### **Durante Desarrollo:**
- **Actualizar README.md** regularmente con progreso
- **Marcar checkboxes** a medida que se completan tareas
- **Documentar desviaciones** del plan original
- **Actualizar estimaciones** si cambian significativamente

### **Placeholders Importantes:**
Al personalizar templates, cambiar:
- `[NOMBRE-MIGRACIÓN]` → Nombre específico
- `[AÑO]` → Año actual
- `[YYYY-MM-DD]` → Fecha específica
- `[archivo-específico]` → Rutas reales
- `[comando-específico]` → Comandos del proyecto

### **Commits Recomendados:**
```bash
git commit -m "docs: Add [nombre] migration template"
git commit -m "feat: [nombre] migration - [descripción específica]" 
git commit -m "docs: Complete [nombre] migration with metrics"
```

---

## 🎯 Beneficios del Sistema

### **Para el Desarrollador:**
- **Estructura consistente** - No pensar en organización
- **Checklist completos** - No olvidar pasos críticos  
- **Templates probados** - Basados en migraciones exitosas
- **Rollback plans** - Contingencias siempre preparadas

### **Para el Proyecto:**
- **Trazabilidad completa** - Historial de decisiones
- **Knowledge transfer** - Documentación persistente
- **Claude Code integration** - IA puede entender contexto
- **Escalabilidad** - Sistema funciona con crecimiento

### **Para Colaboración:**
- **Onboarding rápido** - Nuevos desarrolladores entienden flujo
- **Review process** - Documentación facilita code review
- **Handover seamless** - Contexto completo disponible

---

## 📚 Referencias y Links

### **Ejemplos Reales en el Proyecto:**
- **Google Places Migration:** `complete-migrations/google-places-2025/`
- **Dependencies Cleanup:** `complete-migrations/DEPENDENCIES-CLEANUP.md`
- **Refactoring 2025:** `complete-migrations/REFACTORING-2025.md`

### **Documentación Relacionada:**
- **Implementation Tracking:** `docs/implementation-tracking/`
- **Claude Instructions:** `CLAUDE.md`
- **Project Architecture:** `docs/technical/architecture/`

---

## 🔧 Troubleshooting

### **"¿Qué template usar?"**
- **< 2 horas estimado** → MICRO-TEMPLATE
- **> 2 horas estimado** → TEMPLATE-MIGRATION  
- **Cuando dudes** → TEMPLATE-MIGRATION (mejor sobre-documentar)

### **"¿Cómo manejar cambios al plan original?"**
- **Actualizar 02-PLAN.md** con cambios
- **Documentar razones** en archivos relevantes
- **No borrar plan original** - agregar secciones "UPDATE"

### **"¿Qué hacer si migración se vuelve compleja?"**
- **Si MICRO se vuelve grande** → Migrar a TEMPLATE-MIGRATION
- **Copiar contenido existente** a template completo
- **Continuar con proceso completo**

---

## ✅ Checklist para Nueva Migración

### **Antes de Empezar:**
- [ ] Decidido tipo de template (MICRO vs FULL)
- [ ] Verificado que no hay >2 migraciones activas  
- [ ] Nombre de migración definido y único

### **Durante Setup:**
- [ ] Template copiado a pending-migrations/
- [ ] Branch creado (`feature/[nombre-migration]`)
- [ ] Placeholders personalizados
- [ ] README.md actualizado con información específica

### **Durante Desarrollo:**
- [ ] Progreso actualizado regularmente
- [ ] Checkboxes marcados
- [ ] Documentación mantenida actualizada

### **Al Completar:**
- [ ] 06-COMPLETION.md (o equivalent) finalizado
- [ ] Métricas documentadas
- [ ] Migración movida a complete-migrations/
- [ ] Implementation-tracking actualizado
- [ ] pending-migrations/ limpio

---

**🎯 El sistema está diseñado para soportar tu filosofía de calidad sobre cantidad, documentación extensa como inversión, y enfoque en completar antes de iniciar nuevas tareas.**

**✨ ¡Utilízalo para mantener tus migraciones organizadas y documentadas de manera profesional!**

---

**📅 Guía creada:** Septiembre 2025  
**🔄 Versión:** 1.0  
**📊 Basado en:** Patrones exitosos de google-places-2025 y refactoring-2025