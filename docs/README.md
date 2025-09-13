# 📚 Documentación CalReact

**Versión:** 2.0 - Reorganizada Septiembre 2025  
**Proyecto:** Next.js 15 + Firebase con arquitectura de eventos específicos por dominio

## 🗂️ Estructura de Directorios

### 📁 `/claude/` - Documentación para Claude Code

**Propósito:** Referencias exclusivas para Claude Code AI Assistant

```
claude/
├── references/          # Referencias técnicas del proyecto
│   ├── commands.md     # Comandos de desarrollo disponibles
│   ├── stack.md        # Stack tecnológico y arquitectura
│   ├── dependencias.md # Inventario completo de dependencias
│   ├── patterns.md     # Patrones de código establecidos
│   └── dependencias-no-utilizadas-explicacion.md
├── context/             # Contexto arquitectural
│   └── architecture.md # Arquitectura del proyecto
└── workflow/           # Flujos de trabajo
    ├── workflow.md     # Flujo de desarrollo
    └── testing.md      # Estrategias de testing
```

### 📁 `/technical/` - Documentación Técnica Consolidada

**Propósito:** Documentación técnica para desarrolladores

```
technical/
├── architecture/        # Decisiones arquitecturales y ADRs
├── testing/            # Documentación de testing consolidada
│   ├── implementation/ # Plan de corrección de tests (histórico)
│   │   ├── ejemplos/   # Ejemplos de tests
│   │   ├── mocks/      # Mocks y configuraciones
│   │   ├── ANALISIS-ERRORES.md
│   │   ├── ESTRATEGIA-TESTING.md
│   │   └── IMPLEMENTACION.md
│   ├── google-maps-guide/ # Guías específicas Google Maps
│   │   ├── GOOGLE_MAPS_TESTING_GUIDE.md
│   │   └── PLACES_ADAPTER_TEST_REFACTORING.md
│   └── strategies/     # Estrategias generales de testing
├── components/         # Documentación de componentes UI
│   └── AddressInput.md # Documentación específica de componentes
└── migrations/         # Histórico de migraciones completadas
    ├── google-places-2025/      # Migración Google Places API
    │   ├── 01-ANALISIS-ACTUAL.md
    │   ├── 02-PLAN-MIGRACION.md
    │   ├── 03-IMPLEMENTACION-TESTS.md
    │   ├── MIGRACION-COMPLETADA.md
    │   └── ... (11 archivos total)
    ├── DEPENDENCIES-CLEANUP-COMPLETED.md  # Limpieza de dependencias (completada)
    └── refactoring-2025/        # Refactorización general 2025
        ├── REFACTORING_STATUS.md
        ├── REFACTORING_TECHNICAL.md
        └── ... (archivos de refactorización)
```

### 📁 `/operations/` - Operaciones y Mantenimiento

**Propósito:** Scripts, guías de deployment y operaciones

```
operations/
├── maintenance-scripts/ # Scripts de mantenimiento
└── deployment-guides/   # Guías de despliegue
```

## 🎯 Cómo Navegar la Documentación

### 📖 Para Claude Code AI
- **Inicio:** Documentación importada automáticamente desde `/claude/`
- **Referencias:** Todo en `/claude/references/` para consulta rápida
- **Contexto:** Arquitectura del proyecto en `/claude/context/`

### 👨‍💻 Para Desarrolladores
- **Arquitectura:** `/technical/architecture/` para decisiones de diseño
- **Testing:** `/technical/testing/` para estrategias y implementación
- **Componentes:** `/technical/components/` para documentación UI
- **Historia:** `/technical/migrations/` para entender evolución

### ⚙️ Para DevOps/Operaciones
- **Scripts:** `/operations/maintenance-scripts/`
- **Deployment:** `/operations/deployment-guides/`

## 🔍 Documentación Clave por Tema

### 🏗️ Arquitectura
- **Stack completo:** `/claude/references/stack.md`
- **Arquitectura detallada:** `/claude/context/architecture.md`
- **Patrones de código:** `/claude/references/patterns.md`

### 🧪 Testing
- **Estrategia general:** `/claude/workflow/testing.md`
- **Implementación detallada:** `/technical/testing/implementation/`
- **Google Maps testing:** `/technical/testing/google-maps-guide/`

### 📦 Dependencias
- **Inventario completo:** `/claude/references/dependencias.md`
- **Limpieza completada:** `/technical/migrations/DEPENDENCIES-CLEANUP-COMPLETED.md`

### 🗺️ Migraciones Importantes
- **Google Places 2025:** `/technical/migrations/google-places-2025/`
- **Refactorización general:** `/technical/migrations/refactoring-2025/`

## 📊 Métricas de la Reorganización

### ✅ Mejoras Logradas
- **Eliminación de duplicaciones:** Testing consolidado en un solo lugar
- **Separación clara:** Claude vs documentación técnica vs operaciones  
- **Navegación optimizada:** 3 directorios principales vs 6 anteriores
- **42 archivos reorganizados** con propósito claro
- **0 pérdida de información:** Todo migrado correctamente

### 🎯 Estructura Anterior vs Nueva
```
ANTES (Desordenada):                DESPUÉS (Organizada):
├── claude-reference/               ├── claude/
├── components/                     ├── technical/
├── migracion-google-places.../     └── operations/
├── refactorizacion/
├── testing/  <-- DUPLICADO
└── claude-reference/plan-correccion-tests/  <-- DUPLICADO
```

## 🔄 Mantenimiento de la Documentación

### 📝 Reglas de Actualización
1. **Claude references:** Solo actualizar archivos en `/claude/`
2. **Documentación técnica:** Agregar nuevos docs en `/technical/`
3. **Migraciones futuras:** Crear nuevos directorios en `/technical/migrations/`

### 🚨 Importante
- **CLAUDE.md actualizado** con nuevas rutas
- **Importaciones automáticas** configuradas para Claude Code
- **Backward compatibility:** Links internos pueden necesitar actualización

---

**📅 Reorganizada:** Septiembre 2025  
**🎯 Próxima revisión:** Según necesidades del proyecto  
**📊 Total archivos:** 42 archivos organizados en estructura lógica