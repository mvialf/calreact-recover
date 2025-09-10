# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

**IGNORA LOS SIGUIENTES ARCHIVOS**
- gemini.md
- docs/WINDSURF_RULES.md

## 📚 Importaciones de Documentación

@docs/claude/references/commands.md
@docs/claude/references/stack.md
@docs/claude/references/dependencias.md
@docs/claude/references/patterns.md
@docs/claude/context/architecture.md
@docs/claude/workflow/workflow.md
@docs/claude/workflow/testing.md
@docs/IMPLEMENTATIONS.md

## 🎯 Estado Actual del Proyecto

**ESTADO:** ✅ **98% COMPLETADO** - Production Ready (Septiembre 2025)
**APLICACIÓN:** Next.js 15 + Firebase con arquitectura de eventos específicos por dominio

### 🔥 Logros Recientes
- **Migración Google Places completada** - PlacesServiceAdapter implementado
- **Sistema cache inteligente** para eventos de proyecto 
- **0 console.logs** en código de producción (solo 8 en logger.ts oficial)
- **Testing integral** con Playwright MCP configurado

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
- **Bibliotecas/APIs:** Utilizar servidor MCP Context7 para documentación actualizada

## 🚨 Principios No Negociables

1. **Verificación obligatoria:** `lint` + `typecheck` después de cada cambio
2. **DRY:** Verificar existencia antes de crear código nuevo
3. **Funciones máximo:** 40 líneas por función
4. **Servicios Firebase:** Usar utilidades centralizadas de `firestore-helpers.ts`
5. **Testing:** Crear tests durante implementación (Test-As-You-Go)