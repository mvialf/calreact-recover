# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

**IGNORA LOS SIGUIENTES ARCHIVOS**
- gemini.md
- .windsurfrules

## 📚 Importaciones de Documentación

@claude-docs/references/commands.md
@claude-docs/references/stack.md
@claude-docs/references/dependencias.md
@claude-docs/references/patterns.md
@claude-docs/context/architecture.md
@claude-docs/workflow/workflow.md
@claude-docs/workflow/testing.md
@claude-docs/IMPLEMENTATIONS.md



## ⚡ Comandos Críticos Obligatorios

**EXTREMADAMENTE IMPORTANTE:** Ejecutar SIEMPRE después de cualquier modificación:

```bash
npm run lint        # Verificar calidad de código ESLint  
npm run typecheck   # Verificar tipos TypeScript
```

**Desarrollo:**
```bash
npm run dev         # Puerto 3002 (Turbopack) - RECOMENDADO
npm run dev:webpack # Puerto 3001 (Webpack) - Alternativo
```

## 🌐 Idioma y Comunicación

- **Respuestas:** Todas las explicaciones en **español**
- **Comentarios de código:** En español
- **Mensajes de commit:** Preferir español
- **Excepción:** Mantener nombres de variables/funciones en inglés

## 🔍 Consulta de Documentación

- **Claude Code:** Usar `/docs` SIEMPRE antes de especular
- **Bibliotecas/APIs:** Cuando se solicitan ejemplos de código, pasos de configuración o documentación de biblioteca/API, utilice el servidor mcp de Context7 para obtener la información.

## 🚨 Principios No Negociables

1. **Verificación obligatoria:** `lint` + `typecheck` después de cada cambio
2. **DRY:** Verificar existencia antes de crear código nuevo
3. **Funciones máximo:** 40 líneas por función
4. **Servicios Firebase:** Usar utilidades centralizadas de `firestore-helpers.ts`
5. **Testing:** Crear tests durante implementación (Test-As-You-Go)
6. **documentación** Utilizar servidor MCP Context7 para documentación actualizada

## 🤖 Referencias Automáticas por Contexto

### 📦 DEPENDENCIAS - Protocolo de Validación Automática
**ANTES de instalar:** 
1. `Bash('npm list --depth=0 | grep nombre-paquete')` → verificar instaladas
2. `mcp__filesystem__read_text_file('claude-docs/references/dependencias.md')` → verificar versión documentada
3. `Context7.resolve-library-id('biblioteca')` → solo si no está documentada
4. **SI conflict → STOP y reportar**

### 🏗️ COMPONENTES - Protocolo Minimalista  
**ANTES de crear:**
1. `mcp__filesystem__search_files(path='src/components', pattern='NombreComponente')` → verificar existencia
2. `mcp__filesystem__read_text_file('claude-docs/references/patterns.md')` → cargar patrones
3. **Solo si existe conflicto → usar `Serena.find_symbol()` para análisis detallado**
4. **SI exists similar → sugerir reutilización**

### 🔥 FIREBASE - Protocolo Eficiente
**ANTES de modificar:**
1. `Firebase.firestore_get_documents()` → validar estructura actual  
2. `mcp__filesystem__read_text_file('claude-docs/references/patterns.md')` → consultar patrones Firebase
3. `Bash('git log --oneline -5')` → contexto reciente
4. **Solo si breaking change → usar `Serena.find_referencing_symbols()` para análisis de impacto**

### 🎯 ARQUITECTURA - Protocolo Básico
**ANTES de cambios estructurales:**
1. `mcp__filesystem__read_text_file('claude-docs/context/architecture.md')` → cargar principios
2. `mcp__filesystem__directory_tree('src/')` → mapear estructura actual
3. **Solo para refactoring complejo → usar `Serena.get_symbols_overview()`**

### 📋 TESTING - Protocolo Mínimo
**DURANTE implementación:**
1. `mcp__filesystem__read_text_file('claude-docs/workflow/testing.md')` → cargar estrategia
2. `Bash('npm run typecheck && npm run lint')` → validación obligatoria
3. **Testing UI solo cuando sea crítico → `Playwright.browser_snapshot()`**

## 🎯 Decisiones Automáticas por Trigger

```typescript
// Triggers optimizados para mínimo consumo de tokens
TRIGGER("instalar", "npm install", "dependencia") {
  1. Bash('npm list --depth=0 | grep ${package}') // Verificación rápida
  2. mcp__filesystem__search_files('claude-docs/', pattern=${package}) // Búsqueda eficiente
  3. IF not_found → Context7.resolve-library-id(${package}) // Solo cuando necesario
}

TRIGGER("crear", "component") {
  1. mcp__filesystem__search_files('src/components', pattern=${name}) // Búsqueda eficiente
  2. IF found → READ solo sección relevante de patterns.md
  3. EVITAR Serena a menos que sea crítico para arquitectura
}

TRIGGER("firebase", "firestore") {
  1. Firebase.firestore_get_documents() // Validación directa
  2. mcp__filesystem__read_text_file('architecture.md') // Solo arquitectura
  3. Serena SOLO si se detecta breaking change
}
```

## 📁 Estrategia de Uso de Herramientas por Prioridad

### 🟢 **Siempre usar (Token-eficientes):**
- `Bash()` - Comandos del sistema (gratis)
- `mcp__filesystem__*` - Navegación de archivos (eficiente)
- `Firebase MCP` - Validaciones directas (específico)

### 🟡 **Usar solo cuando sea necesario:**
- `Context7` - Solo para librerías no documentadas
- `Playwright` - Solo para testing UI crítico

### 🔴 **Usar solo en casos críticos:**
- `Serena.find_symbol()` - Solo cuando hay conflictos de nombres
- `Serena.find_referencing_symbols()` - Solo para breaking changes
- `Serena.get_symbols_overview()` - Solo para refactoring mayor




