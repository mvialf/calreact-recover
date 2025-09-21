# 📚 Análisis Histórico de Dependencias "No Utilizadas" - Proyecto Calreact

**⚠️ ARCHIVO HISTÓRICO - Solo para referencia**
**Fecha:** 7 de septiembre de 2025
**Estado:** DESACTUALIZADO - Muchas dependencias mencionadas fueron eliminadas en migraciones posteriores  
**Herramienta:** depcheck v1.4.3  
**Total dependencias analizadas:** 81 paquetes  
**Marcadas como no utilizadas:** 28 paquetes (34.6%)

## 📊 Resumen Ejecutivo

Este documento explica **por qué 28 dependencias marcadas como "no utilizadas" por `depcheck` son realmente necesarias** para el funcionamiento correcto del proyecto. La herramienta `depcheck` genera falsos positivos porque no detecta ciertos patrones de uso comunes en proyectos modernos de React/Next.js.

### Distribución por Tipo
- **Dependencias regulares:** 12 marcadas como no utilizadas
- **Dependencias de desarrollo:** 16 marcadas como no utilizadas  
- **Falsos positivos:** 25 dependencias (89.3%)
- **Posibles candidatos a remoción:** 3 dependencias (10.7%)

---

## 🔍 Categorías de Falsos Positivos

### 1. 🔧 Dependencias de Configuración Indirectas

**¿Por qué depcheck no las detecta?** Se usan en archivos de configuración o son incluidas automáticamente por otras dependencias, no mediante imports directos.

| Dependencia | Ubicación/Uso | Razón |
|------------|---------------|--------|
| `@typescript-eslint/eslint-plugin` | `.eslintrc.json` → `"next/core-web-vitals"` | Incluida automáticamente por configuración Next.js |
| `@typescript-eslint/parser` | `.eslintrc.json` → `"next/core-web-vitals"` | Parser automático para reglas TypeScript |
| `eslint-config-prettier` | `.eslintrc.json` → `"next/core-web-vitals"` | Desactivar conflictos ESLint-Prettier |
| `eslint-plugin-jsx-a11y` | `.eslintrc.json` → `"next/core-web-vitals"` | Reglas de accesibilidad JSX |
| `eslint-plugin-prettier` | `.eslintrc.json` → `"next/core-web-vitals"` | Integración Prettier como regla ESLint |
| `eslint-plugin-react` | `.eslintrc.json` → `"next/core-web-vitals"` | Reglas específicas de React |
| `eslint-plugin-react-hooks` | `.eslintrc.json` → `"next/core-web-vitals"` | Reglas para React Hooks |
| `eslint-plugin-react-refresh` | `.eslintrc.json` → `"next/core-web-vitals"` | Fast Refresh para React |
| `postcss` | Requerida por Tailwind CSS | CSS processor, no se importa directamente |
| `jest-environment-jsdom` | `jest.config.js` línea 11 | Configurado como `testEnvironment` |

### 2. 📝 Dependencias de Tipos TypeScript

**¿Por qué depcheck no las detecta?** Los tipos TypeScript se usan implícitamente, no mediante imports explícitos.

| Dependencia | Propósito | Justificación |
|------------|-----------|---------------|
| `@types/country-data` | Tipos para librería `country-data` | Tipado automático en TypeScript |
| `@types/google.maps` | Tipos para Google Maps API | Tipado para integración de mapas |
| `@types/react-input-mask` | Tipos para `react-input-mask` | Tipado de componente de máscaras |

### 3. 🔮 Dependencias Planificadas/Futuras

**¿Por qué depcheck no las detecta?** Están instaladas para uso futuro o características planificadas.

| Dependencia | Estado Actual | Propósito Planificado |
|------------|---------------|----------------------|
| `@radix-ui/react-form` | Instalada, no implementada | Formularios avanzados con Radix UI |
| `@vis.gl/react-google-maps` | Instalada, no implementada | Componentes avanzados Google Maps |
| `react-google-autocomplete` | Instalada, no implementada | Autocompletado Google Places |
| `react-google-places-autocomplete` | Instalada, no implementada | Hook autocompletado Places |
| `use-places-autocomplete` | Instalada, no implementada | Hook personalizado Places |
| `winston` | Instalada, no implementada | Sistema de logging profesional |

**📌 Nota:** El proyecto actualmente usa logger personalizado (`src/lib/logger.ts`) pero winston está preparada para migración futura.

### 4. 🛠️ Herramientas y Utilidades CLI

**¿Por qué depcheck no las detecta?** Se usan vía línea de comandos o scripts, no en código fuente.

| Dependencia | Uso | Ubicación |
|------------|-----|-----------|
| `@playwright/mcp` | Integración Playwright-MCP | Scripts de testing E2E |
| `patch-package` | Parchar dependencias node_modules | Scripts post-install (si existen patches) |
| `prettier` | Formateador de código | CLI y IDE integration |
| `ts-node` | Ejecutar scripts TypeScript | Scripts de utilidad |

### 5. 🧪 Dependencias de Testing

**¿Por qué depcheck no las detecta?** Usadas en contexto específico de testing o configuración de test.

| Dependencia | Uso en Testing | Justificación |
|------------|----------------|---------------|
| `@testing-library/user-event` | Simulación interacciones usuario | Testing avanzado componentes |
| `jest-environment-jsdom` | Entorno DOM para Jest | Configurado en `jest.config.js` |

### 6. ❓ Dependencias Posiblemente No Utilizadas

**Candidatos para evaluación de remoción:**

| Dependencia | Estado | Recomendación |
|------------|---------|---------------|
| `zustand` | No encontrada en código fuente | ⚠️ **EVALUAR REMOCIÓN** - Verificar si es necesaria |
| `country-data` | No encontrada en código fuente | ⚠️ **EVALUAR REMOCIÓN** - Confirmar uso planificado |
| `react-input-mask` | No encontrada en código fuente | ⚠️ **EVALUAR REMOCIÓN** - Verificar implementación |

---

## 📋 Tabla Completa de Análisis

### Dependencias Regulares (12)

| Dependencia | Categoría | Estado | Acción |
|------------|-----------|---------|---------|
| `@playwright/mcp` | Herramientas CLI | ✅ Necesaria | Mantener |
| `@radix-ui/react-form` | Planificada | ⏳ Futura | Mantener |
| `@tanstack-query-firebase/react` | Configuración | ✅ Necesaria | Mantener |
| `@vis.gl/react-google-maps` | Planificada | ⏳ Futura | Mantener |
| `country-data` | No utilizada | ⚠️ Evaluar | Revisar |
| `patch-package` | Herramientas CLI | ✅ Necesaria | Mantener |
| `react-google-autocomplete` | Planificada | ⏳ Futura | Mantener |
| `react-google-places-autocomplete` | Planificada | ⏳ Futura | Mantener |
| `react-input-mask` | No utilizada | ⚠️ Evaluar | Revisar |
| `use-places-autocomplete` | Planificada | ⏳ Futura | Mantener |
| `winston` | Planificada | ⏳ Futura | Mantener |
| `zustand` | No utilizada | ⚠️ Evaluar | Revisar |

### Dependencias de Desarrollo (16)

| Dependencia | Categoría | Estado | Acción |
|------------|-----------|---------|---------|
| `@testing-library/user-event` | Testing | ✅ Necesaria | Mantener |
| `@types/country-data` | Tipos TS | ✅ Necesaria | Mantener |
| `@types/google.maps` | Tipos TS | ✅ Necesaria | Mantener |
| `@types/react-input-mask` | Tipos TS | ✅ Necesaria | Mantener |
| `@typescript-eslint/eslint-plugin` | Configuración | ✅ Necesaria | Mantener |
| `@typescript-eslint/parser` | Configuración | ✅ Necesaria | Mantener |
| `eslint-config-prettier` | Configuración | ✅ Necesaria | Mantener |
| `eslint-plugin-jsx-a11y` | Configuración | ✅ Necesaria | Mantener |
| `eslint-plugin-prettier` | Configuración | ✅ Necesaria | Mantener |
| `eslint-plugin-react` | Configuración | ✅ Necesaria | Mantener |
| `eslint-plugin-react-hooks` | Configuración | ✅ Necesaria | Mantener |
| `eslint-plugin-react-refresh` | Configuración | ✅ Necesaria | Mantener |
| `jest-environment-jsdom` | Testing | ✅ Necesaria | Mantener |
| `postcss` | Configuración | ✅ Necesaria | Mantener |
| `prettier` | Herramientas CLI | ✅ Necesaria | Mantener |
| `ts-node` | Herramientas CLI | ✅ Necesaria | Mantener |

---

## 🔧 Recomendaciones de Mantenimiento

### Script de Auditoría Periódica

```bash
# Ejecutar cada 3 meses para revisar dependencias
npx depcheck --detailed
npm audit
npm outdated
```

### Mejores Prácticas

1. **Documentar dependencias planificadas** en este archivo
2. **Revisar candidatos a remoción** trimestralmente
3. **Verificar configuración depcheck** para reducir falsos positivos
4. **Mantener tipos TypeScript** aunque no se importen directamente

### Configuración depcheck Optimizada

Crear `.depcheckrc` para reducir falsos positivos:

```json
{
  "ignores": [
    "@typescript-eslint/*",
    "eslint-*",
    "@types/*",
    "postcss",
    "jest-environment-jsdom",
    "prettier",
    "ts-node"
  ],
  "skip-missing": true
}
```

---

## 📈 Métricas de Calidad

### Estado Actual
- **Dependencias realmente necesarias:** 25/28 (89.3%)
- **Falsos positivos de depcheck:** 89.3%
- **Dependencias a evaluar:** 3/28 (10.7%)

### Objetivo
- **Meta falsos positivos:** <10%
- **Frecuencia auditoría:** Trimestral
- **Documentación:** Mantener actualizada

---

## 📚 Referencias Técnicas

### Herramientas Utilizadas
- **depcheck** v1.4.3 - Análisis dependencias no utilizadas
- **npm ls** - Árbol de dependencias
- **Búsqueda semántica** - Verificación uso en código fuente

### Patrones de Detección
1. **Imports estáticos:** `import { } from 'package'`
2. **Imports dinámicos:** `import('package')`
3. **Require statements:** `require('package')`
4. **Configuración archivos:** `package.json`, config files
5. **Tipos TypeScript:** Detección implícita

---

**Última actualización:** 7 de septiembre de 2025  
**Próxima auditoría recomendada:** Diciembre 2025