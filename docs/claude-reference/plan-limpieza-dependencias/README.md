# 🧹 Plan de Limpieza de Dependencias - Índice Maestro

**Proyecto:** Calreact (Cobralon-FB)  
**Fecha de inicio:** 7 de septiembre de 2025  
**Estado:** 🔄 En progreso

---

## 📋 Vista General

Este plan documenta el proceso de limpieza de dependencias no utilizadas en el proyecto. Cada dependencia se analiza individualmente antes de decidir su eliminación.

### 🎯 Objetivo
Reducir el tamaño del bundle, simplificar el stack tecnológico y mantener solo las dependencias realmente necesarias.

### 📊 Estado Actual
- **Total dependencias instaladas:** 81 paquetes
- **Reportadas como no utilizadas:** 32 paquetes
- **Analizadas:** 6/32 (19%)
- **Aprobadas para eliminación:** 6
- **Reducción estimada:** ~610KB

---

## 📚 Documentación del Plan

### 🧠 Contexto y Memoria
- **[CONTEXTO.md](./CONTEXTO.md)** - Información del proyecto para continuidad entre sesiones

### 📊 Resumen
- **[resumen-ejecutivo.md](./resumen-ejecutivo.md)** - Métricas, comandos y checklist final

---

## 🗂️ Estado de Dependencias

### ✅ **ELIMINADAS EXITOSAMENTE (6)** - 8 de septiembre de 2025

#### **Dependencias Originales (2):**
| Dependencia | Tipo | Versión | Tamaño | Análisis | Estado |
|-------------|------|---------|---------|-----------|--------|
| [zustand](./analisis/01-zustand.md) | Producción | 5.0.5 | ~2.1KB | ✅ Completado | ✅ **ELIMINADO** |
| [winston](./analisis/02-winston.md) | Producción | 3.17.0 | ~388KB | ✅ Completado | ✅ **ELIMINADO** |

#### **🚀 Nuevas - Post Migración Google Places API (4):**
| Dependencia | Tipo | Versión | Tamaño | Análisis | Estado |
|-------------|------|---------|---------|-----------|--------|
| [react-google-autocomplete](./analisis/03-react-google-autocomplete.md) | Producción | 2.7.5 | ~45KB | ✅ Completado | ✅ **ELIMINADO** |
| [react-google-places-autocomplete](./analisis/04-react-google-places-autocomplete.md) | Producción | 4.1.0 | ~52KB | ✅ Completado | ✅ **ELIMINADO** |
| [use-places-autocomplete](./analisis/05-use-places-autocomplete.md) | Producción | 4.0.1 | ~38KB | ✅ Completado | ✅ **ELIMINADO** |
| [@vis.gl/react-google-maps](./analisis/06-vis-gl-react-google-maps.md) | Producción | 1.5.4 | ~85KB | ✅ Completado | ✅ **ELIMINADO** |

**Razones consolidadas:**
- **zustand:** React Context API implementado, zustand nunca usado en código
- **winston:** Logger personalizado 100% implementado, winston 0% usado + ROI negativo
- **Google Places libs:** Reemplazadas por implementación custom con nueva Google Places API
- **@vis.gl/react-google-maps:** Duplicado con @react-google-maps/api (que sí se usa)

### 🔍 Pendientes de Análisis (26)

#### Dependencias de Producción (6)
| Dependencia | Tipo | Versión | Estado | Prioridad |
|-------------|------|---------|--------|-----------|
| country-data | Producción | 0.0.31 | 🔍 **Pendiente** | Alta - No se usa |
| react-input-mask | Producción | 2.0.4 | 🔍 **Pendiente** | Alta - No se usa |
| @tanstack-query-firebase/react | Producción | 1.0.5 | 🔍 **Pendiente** | Baja - TanStack directo |
| patch-package | Producción | 8.0.0 | 🔍 **Pendiente** | Baja - Sin patches/ |
| @radix-ui/react-form | Producción | 0.1.7 | 🔍 **Pendiente** | Baja - RHF en uso |
| @playwright/mcp | Producción | 0.0.36 | 🔍 **Pendiente** | Baja - Playwright directo |

#### DevDependencies (20)
| Dependencia | Estado | Nota |
|-------------|--------|------|
| @testing-library/user-event | 🔍 **Pendiente** | Testing - posible mantener |
| @types/country-data | 🔍 **Pendiente** | Depende de country-data |
| @types/google.maps | 🔍 **Pendiente** | Google Maps - mantener |
| @types/react-input-mask | 🔍 **Pendiente** | Depende de react-input-mask |
| @typescript-eslint/eslint-plugin | 🔍 **Pendiente** | ESLint - probablemente mantener |
| @typescript-eslint/parser | 🔍 **Pendiente** | ESLint - probablemente mantener |
| eslint-config-prettier | 🔍 **Pendiente** | ESLint - probablemente mantener |
| eslint-plugin-jsx-a11y | 🔍 **Pendiente** | ESLint - probablemente mantener |
| eslint-plugin-prettier | 🔍 **Pendiente** | ESLint - probablemente mantener |
| eslint-plugin-react | 🔍 **Pendiente** | ESLint - probablemente mantener |
| eslint-plugin-react-hooks | 🔍 **Pendiente** | ESLint - probablemente mantener |
| eslint-plugin-react-refresh | 🔍 **Pendiente** | ESLint - probablemente mantener |
| jest-environment-jsdom | 🔍 **Pendiente** | Testing - mantener |
| postcss | 🔍 **Pendiente** | Tailwind - mantener |
| prettier | 🔍 **Pendiente** | Formateo - mantener |
| ts-node | 🔍 **Pendiente** | Scripts - mantener |

---

## 🚀 Próximos Pasos

### 1. **✅ PRIMERA FASE COMPLETADA (6 dependencias eliminadas):**
```bash
✅ EJECUTADO: npm uninstall zustand winston react-google-autocomplete react-google-places-autocomplete use-places-autocomplete @vis.gl/react-google-maps

# Verificaciones realizadas:
✅ npm run typecheck - Sin errores
✅ npm run lint - Sin errores críticos
✅ npm run build - Build exitoso
✅ npm run dev - Aplicación funciona correctamente
✅ Documentación actualizada
```

### 2. **Dependencia siguiente a analizar:** country-data
- Verificar si se usa para validación de países en formularios
- Buscar alternativas más ligeras si es necesario
- Decisión esperada: Probable eliminación si no se usa

### 3. **Orden de prioridad actualizado:**
1. **Alta prioridad:** country-data, react-input-mask
2. **Baja prioridad:** Dependencias de configuración y tipos

### 4. **DevDependencies:** Analizar después de dependencias principales

---

## 📈 Progreso Visual

```
Dependencias de producción analizadas:
[████████████████████░░░░░░░░] 67% - 6 de 9 completadas

Total del plan:
[██████░░░░░░░░░░░░░░░░░░░░░░] 19% - 6 de 32 completadas
```

---

## ⚡ Comandos Rápidos

### Análisis de la siguiente dependencia
```bash
# Verificar country-data en código
grep -r "country-data" src/
grep -r "import.*country" src/

# Buscar uso de datos de países
grep -r "country" src/ | grep -i "data\|list\|code"
```

### Ejecutar eliminaciones aprobadas
```bash
# Eliminar dependencias aprobadas (6 TOTAL)
npm uninstall zustand winston react-google-autocomplete react-google-places-autocomplete use-places-autocomplete @vis.gl/react-google-maps

# Verificar todo funciona
npm run typecheck && npm run lint && npm run build
```

---

## 📝 Notas

- Cada dependencia tiene su análisis individual en `./analisis/`
- Consultar `CONTEXTO.md` para información del proyecto
- El plan se actualiza después de cada análisis completado
- Verificación obligatoria tras cada eliminación

---

**Última actualización:** 8 de septiembre de 2025  
**Próxima actualización:** Tras análisis de country-data