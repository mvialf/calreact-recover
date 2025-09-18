---
allowed-tools: [
  "mcp__sequential-thinking__sequentialthinking",
  "mcp__filesystem__read_multiple_files",
  "mcp__filesystem__directory_tree",
  "mcp__filesystem__search_files",
  "mcp__serena__find_symbol",
  "mcp__serena__get_symbols_overview",
  "mcp__serena__search_for_pattern",
  "Grep", "Bash", "Read"
]
argument-hint: [focus] - "patterns", "dependencies", "architecture", "consistency", "all"
description: "Análisis inteligente de sincronización de documentación con herramientas MCP avanzadas"
---

# 🔍 Análisis de Sincronización de Documentación

**Enfoque de análisis:** $ARGUMENTS (por defecto: "all")

## 🎯 Protocolo de Análisis Multi-Herramientas

### 1. **Análisis Estructurado Inicial**
Usar sequential thinking para descomponer el análisis de documentación:
- Identificar qué aspectos verificar según el enfoque solicitado
- Definir criterios de calidad y consistencia
- Establecer prioridades de análisis

### 2. **Mapeo Estructural (Filesystem MCP)**
- **Directory tree** completo de `claude-docs/` con categorización
- **Search files** para detectar archivos mal ubicados o duplicados
- **File relationships** entre documentos relacionados
- Inventario de cobertura por categoría (workflow, references, context, etc.)

### 3. **Análisis de Consistencia de Contenido**
- **Multiple file reads** para verificar referencias cruzadas
- **Pattern matching** para detectar información duplicada o contradictoria
- **Version consistency** entre archivos de dependencias y configuraciones
- Coherencia de patrones documentados vs implementados

### 4. **Validación con Código Real (Serena MCP)**
- **Symbol verification**: Confirmar que patrones documentados existen en código
- **API documentation sync**: Verificar endpoints/funciones actuales vs documentados
- **Implementation gaps**: Detectar código nuevo sin documentar
- **References validation**: APIs documentadas pero no implementadas

### 5. **Búsqueda Avanzada de Inconsistencias (Grep)**
- **Broken references**: Enlaces rotos usando grep patterns
- **Outdated information**: Versiones inconsistentes de dependencias
- **TODOs/FIXMEs**: Localizar pendientes en documentación
- **Cross-reference validation**: Verificar menciones entre archivos

### 6. **Contexto Histórico (Bash + Git)**
- **Recent changes analysis**: Cambios recientes que puedan afectar documentación
- **Commit correlation**: Identificar commits de código sin actualización de docs
- **Change frequency**: Evaluar frecuencia de cambios por sección
- **Impact assessment**: Correlacionar cambios de código con necesidades de docs

### 7. **Recomendaciones Accionables (Sequential Thinking)**
- **Priority matrix**: Priorizar actualizaciones por impacto y esfuerzo
- **Consolidation opportunities**: Sugerir consolidaciones o reorganizaciones
- **Automation suggestions**: Proponer mejoras de automatización
- **Specific action items**: Tareas concretas con rutas y archivos específicos

## 🚀 Beneficios vs docs-diff.md

**docs-diff.md (básico):**
```bash
git status claude-docs/ --porcelain  # Solo cambios superficiales
git diff --stat claude-docs/         # Estadísticas básicas
git log --oneline claude-docs/ -3    # Historial básico
```

**docs-sync (avanzado):**
- ✅ **Análisis semántico**: Verificación real del contenido
- ✅ **Consistencia cross-file**: Referencias entre documentos
- ✅ **Validación código-docs**: Sincronización con implementación real
- ✅ **Detección proactiva**: Problemas antes de que impacten
- ✅ **Recomendaciones específicas**: Acciones concretas priorizadas
- ✅ **Automatización inteligente**: Reduce trabajo manual significativamente

## 📊 Tipos de Análisis Disponibles

### `patterns` - Verificación de Patrones de Código
- Validar que patrones documentados existan en código
- Detectar nuevos patrones no documentados
- Verificar ejemplos de código en documentación

### `dependencies` - Sincronización de Dependencias
- Comparar package.json con dependencias.md
- Detectar nuevas dependencias sin documentar
- Verificar versiones consistency

### `architecture` - Coherencia Arquitectural
- Validar que estructura documentada refleje código real
- Detectar cambios arquitecturales sin documentar
- Verificar principios vs implementación

### `consistency` - Consistencia Entre Archivos
- Referencias cruzadas y enlaces
- Información duplicada o contradictoria
- Formateo y estructura consistency

### `all` - Análisis Integral Completo
- Combina todos los análisis anteriores
- Proporciona vista holística
- Recomendaciones priorizadas globales

## 🎯 Salida Esperada

El comando generará análisis estructurado con:

```
🔍 ANÁLISIS ESTRUCTURAL
├── ✅ Estado general de organización
├── ⚠️  Problemas detectados específicos
└── 🎯 Recomendaciones de organización

🔗 CONSISTENCIA DE CONTENIDO
├── ❌ Referencias rotas o inconsistencias
├── ✅ Elementos bien sincronizados
└── ⚠️  Áreas que requieren atención

⚡ VALIDACIÓN CON CÓDIGO REAL
├── ✅ Documentación verified con implementación
├── ❌ Documentación sin código correspondiente
└── 🎯 Gaps de documentación en código nuevo

📊 RECOMENDACIONES PRIORIZADAS
1. 🔴 CRÍTICO: Acciones urgentes con rutas específicas
2. 🟡 MEDIO: Mejoras importantes con impacto medio
3. 🟢 BAJO: Optimizaciones menores

⚡ AUTOMACIÓN SUGERIDA
- Scripts o procesos automatizables identificados
- Integración con workflow de desarrollo
- Herramientas adicionales recomendadas
```

---

**🔧 Ejecuta análisis usando todas las herramientas MCP disponibles para proporcionar insights profundos sobre el estado de la documentación y acciones específicas para mantenerla sincronizada con el código.**