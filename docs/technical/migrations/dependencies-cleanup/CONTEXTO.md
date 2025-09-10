# 🧠 Contexto del Proyecto - Plan de Limpieza de Dependencias

**Proyecto:** Calreact (Cobralon-FB)  
**Fecha de creación:** 7 de septiembre de 2025  
**Propósito:** Memoria persistente para análisis de dependencias entre sesiones

---

## 📊 Estado Actual del Proyecto

### Stack Tecnológico Principal
- **Framework:** Next.js 15.2.3 (App Router, Turbopack habilitado)
- **React:** 18.3.1 (NO React 19 - evitar APIs nuevas)
- **TypeScript:** 5.8.3
- **Firebase:** 11.9.1 (⚠️ Breaking changes desde v10)
- **UI Framework:** Shadcn/ui sobre Radix UI + Tailwind CSS
- **Mapas:** @react-google-maps/api (única implementada)

### Gestión de Estado REAL Implementada
```typescript
// ✅ PATRÓN ACTUAL EN USO:
- React Context API: src/contexts/AppConfigContext.tsx
- TanStack Query: Server state y caching (80+ usos)
- useState: Estado local de componentes
```

### Arquitectura de Archivos
```
src/
├── app/              # Next.js App Router
├── components/       # Componentes reutilizables
├── contexts/         # React Context (AppConfigContext)
├── services/         # Firebase services
├── hooks/            # Custom hooks
├── lib/              # Logger personalizado, configs
├── utils/            # Funciones puras
└── types/            # Definiciones TypeScript
```

---

## 🔍 Criterios de Evaluación de Dependencias

### ✅ Mantener si:
1. **Uso confirmado** en código fuente (imports, referencias)
2. **Configuración requerida** (eslint, postcss, jest-environment)
3. **Tipos TypeScript** para dependencias activas
4. **Herramientas CLI** efectivamente utilizadas
5. **Peer dependencies** de librerías activas

### ❌ Eliminar si:
1. **0 referencias** en código fuente tras búsqueda exhaustiva
2. **Duplicación** de funcionalidad ya implementada
3. **Decisión arquitectural** cambió (ej: Context en lugar de Zustand)
4. **No hay directorio/configuración** asociada (ej: patches/)
5. **Planificación obsoleta** sin cronograma de implementación

### 🔍 Investigar si:
1. **Uso indirecto** posible (imports dinámicos, runtime)
2. **Configuración implícita** (incluidos por otras dependencias)
3. **Scripts o CI/CD** que puedan usarla
4. **Documentación conflictiva** entre archivos

---

## 🛠️ Herramientas y Métodos de Análisis

### Comandos de Verificación Estándar
```bash
# Análisis inicial de dependencias no utilizadas
npx depcheck --json

# Búsqueda en código fuente
grep -r "nombre-dependencia" src/
grep -r "import.*nombre-dependencia" src/

# Verificación de configuración
find . -name "*.config.*" -exec grep -l "nombre-dependencia" {} \;

# Verificación de scripts
grep -r "nombre-dependencia" scripts/ package.json
```

### Patrones de Búsqueda por Tipo
- **Gestión de Estado:** `create(`, `useStore`, `store`, Context patterns
- **UI Libraries:** Import paths, component usage
- **Utilidades:** Function calls, helper usage
- **Maps:** Google Maps API, autocomplete patterns
- **Testing:** Test files, config files
- **Types:** @types/* usage en archivos .ts/.tsx

---

## 📋 Decisiones Arquitecturales Documentadas

### 1. Gestión de Estado
- **Decisión:** React Context API + TanStack Query
- **Rechazado:** Zustand (instalado pero no implementado)
- **Razón:** Simplicidad, APIs nativas de React suficientes
- **Archivos:** `src/contexts/AppConfigContext.tsx`

### 2. Sistema de Logging
- **Decisión:** Logger personalizado en `src/lib/logger.ts`
- **Rechazado:** Winston (instalado pero no usado)
- **Razón:** Control total, 12 loggers especializados implementados
- **Estado:** 0 console.logs en producción

### 3. Componentes UI
- **Decisión:** Shadcn/ui sobre Radix UI primitives
- **Stack:** Radix UI + Tailwind CSS + CVA
- **Patrón:** Usar componentes existentes, evitar crear desde cero

### 4. Mapas y Geolocalización
- **Implementado:** @react-google-maps/api en `src/components/ui/addressInput.tsx`
- **No implementadas:** @vis.gl/react-google-maps, react-google-autocomplete, etc.
- **Razón:** Una implementación de mapas es suficiente actualmente

---

## 📊 Estadísticas del Análisis

### Total de Dependencias
- **Instaladas:** 81 paquetes
- **Producción:** 56 paquetes
- **Desarrollo:** 25 paquetes

### Dependencias Reportadas por depcheck
- **No utilizadas (total):** 28 paquetes
- **Falsos positivos estimados:** ~89% (configuración, tipos, etc.)
- **Candidatos reales a eliminación:** ~3-4 paquetes

### Progreso del Plan
- **Analizadas:** 1/28
- **Aprobadas para eliminación:** 1
- **Rechazadas (mantener):** 0
- **Pendientes:** 27

---

## 🔄 Historial de Decisiones

### 2025-09-07: Inicio del Plan
- ✅ **zustand** - Aprobada para eliminación
  - Razón: No implementada, React Context en uso
  - Impacto: ~2.1KB reducción
  - Riesgo: BAJO

---

## ⚠️ Notas Importantes para Futuras Sesiones

1. **Documentación CLAUDE.md desactualizada:** Menciona Zustand pero usa React Context
2. **Firebase v11:** Breaking changes implementados, utilidades propias funcionando
3. **React 18.3.1:** NO actualizar a React 19, APIs actuales funcionan
4. **Bundle size objetivo:** Cada eliminación debe mostrar reducción medible
5. **Testing obligatorio:** `npm run typecheck && npm run lint && npm run build` tras cada cambio

---

## 📚 Referencias

- **Documentación principal:** `/docs/refactorizacion/REFACTORING_STATUS.md`
- **Dependencias completas:** `/docs/claude-reference/dependencias.md`
- **Análisis depcheck:** `/docs/claude-reference/dependencias-no-utilizadas-explicacion.md`
- **Configuración proyecto:** `CLAUDE.md`

---

**Última actualización:** 7 de septiembre de 2025  
**Próxima dependencia a analizar:** winston (sistema de logging)