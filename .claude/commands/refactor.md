allowed-tools	argument-hint	description	model
# Herramientas Críticas para Refactorización
mcp__serena__get_symbols_overview, mcp__serena__find_symbol, mcp__serena__search_for_pattern, mcp__serena__replace_symbol_body, mcp__serena__replace_regex, mcp__serena__insert_before_symbol, mcp__serena__read_file, mcp__serena__find_referencing_symbols,
# Herramientas de Validación y Control
mcp__git__git_status, mcp__git__git_log, mcp__git__git_diff, Bash, TodoWrite,
# Herramientas de Contexto y Documentación  
Read, Glob, Grep, WebSearch
fase_numero (ej: 1, 2, 3) o 'status' para ver estado actual
Continuar refactorización CalReact desde cualquier punto sin perder contexto
claude-3-5-sonnet-20241022

# 🚀 Refactorización CalReact - Continuación de Sesión

**Contexto:** Proyecto de refactorización sistemática con estrategia Fix-First + Test-As-You-Go
**Estado:** Fase 0 completada ✅ (20 errores React Hooks resueltos)
**Progreso:** 20% completado (10/50+ tareas)

## **PASO 1: Cargar Contexto Crítico**

### **Documentación de Referencia**
```bash
# Leer secuencialmente para contexto completo:
1. docs/refactorizacion/PLAN_REFACTORIZACION.md     # Plan maestro
2. docs/refactorizacion/SESSION_HANDOFF.md          # Contexto crítico  
3. docs/refactorizacion/CHECKLIST_TAREAS.md         # Progreso granular
4. docs/refactorizacion/ISSUES_LOG.md               # Problemas resueltos
5. CLAUDE.md                                        # Arquitectura proyecto
```

### **Estado Técnico Actual** 
```bash
✅ React Hooks errors: 0 (20 resueltos)
✅ TypeScript errors: 0  
✅ Build status: Exitoso
✅ ESLint críticos: 0
❌ Console.logs: 38+ identificados
❌ Test coverage: 0%
❌ TODOs servicios: 3 pendientes
```

## **PASO 2: Verificación de Estado**

```bash
# Comandos de diagnóstico automático:
npm run lint                    # Verificar errores críticos
npm run typecheck              # Verificar tipos
npm run build                  # Verificar build
git status                     # Estado de archivos
git log --oneline -5           # Commits recientes
```

## **PASO 3: Identificar Próxima Fase**

**Argumentos del comando:**
- `$ARGUMENTS = "status"` → Mostrar estado actual y próxima fase
- `$ARGUMENTS = "1"` → Continuar Fase 1 (Core Services)  
- `$ARGUMENTS = "2"` → Continuar Fase 2 (Component Architecture)
- `$ARGUMENTS = "3"` → Continuar Fase 3 (Clean Up & Optimization)

### **Si $ARGUMENTS = "status":**
```bash
# Mostrar estado actual completo:
1. Leer CHECKLIST_TAREAS.md → progreso detallado
2. Ejecutar comandos diagnóstico  
3. Identificar próxima tarea pendiente
4. Mostrar resumen y recomendación
```

### **Si $ARGUMENTS = "1" (Fase 1 - Core Services):**
**Sprint 1.1: projectService.ts (3-4h)**
- Aplicar principios SOLID como projectEventService.ts
- Funciones máximo 40 líneas
- Crear tests incrementales
- Checkpoint: lint + typecheck + test

**Sprint 1.2: clientService.ts (3-4h)** 
- Consolidar con clientSyncService (eliminar duplicación)
- Optimizar queries Firestore
- Implementar caching inteligente

**Sprint 1.3: calendarEventService.ts (2h)**
- Resolver TODOs específicos identificados
- Implementar obtención datos proyecto relacionado

### **Si $ARGUMENTS = "2" (Fase 2 - Components):**
**Sprint 2.1: ProjectForm.tsx Decomposition (4-5h)**
- Problema: 80+ símbolos, estructura incomprensible
- Crear: ProjectBasicInfo, ProjectFinancials, ProjectAddress, ProjectValidation
- Tests para cada sub-componente

**Sprint 2.2: Custom Hooks (3-4h)**
- useProjectValidation, useProjectSync, useErrorHandling  
- Extraer lógica de negocio reutilizable

**Sprint 2.3: Modal Refactoring (3h)**
- NewProjectEventModal: eliminar 10+ console.logs
- Aplicar hooks creados, simplificar validación

### **Si $ARGUMENTS = "3" (Fase 3 - Clean Up):**
**Sprint 3.1: Global Cleanup (2h)**
- Eliminar 38+ console.logs restantes
- Resolver warnings ESLint no críticos
- Optimizar imports (máximo 10 por archivo)

**Sprint 3.2: E2E Testing (2-3h)**
- Flujos críticos: crear proyecto, procesar pago, programar evento

**Sprint 3.3: Documentation Update (1h)**
- Actualizar CLAUDE.md con patrones nuevos

## **PASO 4: Patrón de Trabajo Establecido**

### **Workflow por Tarea:**
```bash
1. Leer próxima tarea en CHECKLIST_TAREAS.md
2. Usar mcp__serena__get_symbols_overview para análisis
3. Aplicar corrección siguiendo patrones documentados  
4. Ejecutar checkpoint: npm run lint && npm run typecheck
5. Actualizar CHECKLIST_TAREAS.md con progreso
6. Si hay problemas: documentar en ISSUES_LOG.md
7. Commit: git add . && git commit -m "[tipo]: [descripción]"
```

### **Herramientas MCP Críticas:**
```bash
# ANÁLISIS:
mcp__serena__get_symbols_overview    # Estructura archivos
mcp__serena__find_symbol            # Localizar funciones
mcp__serena__search_for_pattern     # Buscar console.logs/errores

# REFACTORING:  
mcp__serena__replace_symbol_body    # Reemplazar funciones completas
mcp__serena__replace_regex         # Cambios granulares con wildcards
mcp__serena__insert_before_symbol  # Agregar imports/utilidades

# VALIDACIÓN:
Bash(npm run lint)                 # Post-cambios
Bash(npm run typecheck)           # Validar tipos  
Bash(npm run test)                # Tests nuevos
```

## **PASO 5: Principios y Antipatrones**

### **✅ HACER:**
- Usar herramientas MCP intensivamente (optimización Claude)
- Seguir patrones en servicios refactorizados (projectEventService referencia)
- Validar después de cada cambio (lint, typecheck, build)  
- Test-As-You-Go (crear tests durante refactorización)
- Commits frecuentes para backup

### **❌ NO HACER:**
- NO crear tests antes de empezar (usuario rechazó explícitamente)
- NO refactorizar antes de fix errors (amplifica problemas)
- NO hardcodear valores (usar constantes centralizadas)
- NO crear documentación sin pedirla

### **🚨 Escalación al Usuario:**
- Errores que bloquean progreso >2 horas
- Decisiones de business logic críticas  
- Cambios que afectan funcionalidad significativamente

## **PASO 6: Métricas de Éxito**

### **Checkpoint por Cambio:**
```bash
npm run lint --file=[archivo]     # 0 errores críticos
npm run typecheck                 # 0 errores
[test específico si existe]       # Todos pasan
```

### **Target Cuantificable:**
```bash  
# ESTADO ACTUAL → TARGET:
Console.logs: 38+ → 0
Test coverage: 0% → >70%  
TODOs pendientes: 3+ → 0
React Hooks errors: 0 → 0 (mantener)
```

---

**Proceder con Fase $ARGUMENTS:**
```bash
# Si es "status": mostrar estado y próxima recomendación
# Si es numero de fase: cargar contexto específico y comenzar ejecución
# Comenzar siempre leyendo documentación actualizada para contexto completo
```