# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

**IGNORA LOS SIGUIENTES ARCHIVOS**
- gemini.md
- docs/WINDSURF_RULES.md



**ESTADO ACTUAL:** Aplicación Next.js con Firebase optimizada mediante refactorizaciones arquitecturales (Enero 2025). Arquitectura de eventos específicos por dominio implementada y componentes migrados a patrones modulares.

**ISSUES CONOCIDOS:** 48 console.logs activos en 16 archivos que requieren limpieza.

## Comandos de Desarrollo

### Desarrollo Principal
- `npm run dev` - Iniciar servidor de desarrollo con Turbopack en puerto 3002
- `npm run dev:webpack` - Iniciar servidor de desarrollo con Webpack en puerto 3001
- `npm run build` - Construir aplicación para producción
- `npm run start` - Iniciar servidor de producción
- `npm run lint` - Ejecutar ESLint
- `npm run typecheck` - Ejecutar verificación de tipos TypeScript

### Pruebas
- `npm test` - Ejecutar pruebas en modo observación
- `npm run test:ci` - Ejecutar pruebas en modo CI (sin observación)
- `npm run test:coverage` - Ejecutar pruebas con reporte de cobertura
- `npm run test:all` - Ejecutar todas las pruebas

## Arquitectura del Proyecto

### Descripción General
Cobralon-FB es una aplicación Next.js construida con Firebase para servicios backend. Sistema de gestión de proyectos para manejar clientes, proyectos, pagos, visitas y servicios postventa.

### Stack Tecnológico
- **Frontend**: Next.js 15, React 18, TypeScript
- **Framework UI**: Tailwind CSS con componentes Shadcn/ui
- **Backend**: Firebase (Firestore, Authentication)
- **Gestión de Estado**: Zustand
- **Formularios**: React Hook Form con validación Zod
- **Pruebas**: Jest, React Testing Library, Cypress
- **Mapas**: Integración Google Maps API

## Dependency Stack

**Versión:** 1.0.0  
**Node.js Requerido:** >=18.0.0  
**Última Actualización:** Enero 2025

### Framework Core & Versiones Críticas

#### Next.js & React (Configuración Estable)
- **Next.js**: `15.2.3` - App Router estable, Turbopack habilitado
- **React**: `18.3.1` - Sin React 19 (evitar concurrent features nuevas)
- **React DOM**: `18.3.1` - Versión matching con React
- **TypeScript**: `5.8.3` - Última versión estable compatible

**🔥 Notas Técnicas:**
- React 18.3.1: NO usar APIs de React 19 (no disponibles)
- Next.js 15.2.3: Turbopack habilitado por defecto en dev
- Puerto desarrollo: 3002 (Turbopack) / 3001 (Webpack)
- Build configurado para ignorar errores TypeScript en producción

#### Firebase Stack (Versión 11.x)
- **Firebase**: `11.9.1` - ⚠️ BREAKING CHANGES desde v10.x
- **Firebase Admin**: `13.4.0` - Compatible con Firebase 11.x
- **TanStack Query Firebase**: `1.0.5` - Integración optimizada

**⚠️ Compatibilidad Firebase 11.x:**
- Nuevas APIs de inicialización (NO usar v9/v10 patterns)
- Timestamps automáticos con `addTimestamps()` / `updateTimestamps()`
- Usar `convertFirestoreDocuments()` para conversión masiva

#### UI & Styling (Ecosystem Radix)
- **Shadcn/ui**: Componentes sobre Radix UI primitives
- **Radix UI**: `^1.x` - Suite completa de primitives UI
- **Tailwind CSS**: `3.4.1` - Con plugins de animación
- **Class Variance Authority**: `0.7.1` - Para variantes de componentes
- **Lucide React**: `0.475.0` - Iconografía consistente

**🎨 Patrón UI Establecido:**
```typescript
// ✅ CORRECTO - Usar componentes Shadcn existentes
import { Button } from "@/components/ui/button"

// ❌ EVITAR - Crear componentes UI desde cero
```

#### State Management & Forms
- **Zustand**: `5.0.5` - Store global ligero
- **React Hook Form**: `7.54.2` - Gestión de formularios
- **Zod**: `3.25.67` - Validación de esquemas
- **TanStack Query**: `5.81.5` - Cache de datos server state

**📋 Patrón Forms Establecido:**
```typescript
// ✅ CORRECTO - Usar patrón establecido
const form = useForm<SchemaType>({
  resolver: zodResolver(schema),
  defaultValues: { /* */ }
});
```

#### Maps & Location Services
- **@react-google-maps/api**: `2.20.7` - Integración Google Maps
- **@vis.gl/react-google-maps**: `1.5.4` - Componentes avanzados
- **react-google-autocomplete**: `2.7.5` - Autocompletado lugares
- **use-places-autocomplete**: `4.0.1` - Hook personalizado

**🗺️ API Key Requerida:**
- Variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` obligatoria

#### Testing Suite
- **Jest**: `30.0.3` - Framework testing principal
- **React Testing Library**: `14.3.1` - Testing componentes
- **Cypress**: `14.5.0` - E2E testing
- **@testing-library/user-event**: `14.6.1` - Simulación interacciones

**🧪 Comandos Testing:**
```bash
npm test          # Watch mode
npm run test:ci   # CI mode  
npm run test:coverage # Con cobertura
```

### Restricciones y Compatibilidad

#### APIs a EVITAR (incompatibles con versiones actuales)
- React 19 features: `use()`, `useOptimistic()`, etc.
- Firebase v9/v10 initialization patterns
- Next.js 14 configuration patterns obsoletos

#### APIs RECOMENDADAS (compatibles)
- Firebase v11 modular SDK con utilidades personalizadas
- React 18 patterns: Suspense, Concurrent Mode básico
- Next.js 15 App Router con Turbopack

### Estructura Principal
```
src/
├── app/                # Páginas Next.js App Router
├── components/         # Componentes React reutilizables
├── services/           # Capa de servicios Firebase
├── hooks/              # Custom hooks de React
├── lib/                # Utilidades y configuraciones
├── constants/          # Datos estáticos centralizados
├── utils/              # Funciones puras y helpers
└── types/              # Definiciones de tipos TypeScript
```

### Patrón de Servicios Firebase
Todos los servicios Firebase siguen el patrón optimizado:
```typescript
export const operacion = async (
  firestore: Firestore, 
  parametros: TipoParam
): Promise<TipoReturn> => {
  // Usa utilidades centralizadas de firestore-helpers.ts
  return convertFirestoreDocuments(docs, convertDocument);
};
```

## Principios de Desarrollo

### SOLID, DRY, KISS, YAGNI
- **Responsabilidad única:** Cada componente y función con una sola responsabilidad
- **DRY obligatorio:** Verificar existencia antes de crear nuevo código
- **Simplicidad:** Evitar sobreingeniería, mantener diseño simple
- **Funciones máximo:** 40 líneas por función

### Estructura de Archivos Obligatoria
- `src/utils/` - Funciones puras, helpers
- `src/lib/` - Lógica de negocio central
- `src/hooks/` - Custom Hooks de React
- `src/services/` - Integración con APIs externas
- `src/constants/` - Datos estáticos centralizados (NO valores mágicos en componentes)

### Nomenclatura y Estilo
- **Componentes:** Arrow functions con tipado explícito
- **Manejadores:** Prefijo `handle` (ej. `handleClick`)
- **Variables:** Descriptivas en `camelCase`
- **Funciones:** Máximo 40 líneas por función
- **Retornos anticipados:** Usar siempre para reducir anidamiento
- **Clases condicionales:** `clsx` o `tailwind-merge`
- **Accesibilidad:** Obligatoria con HTML semántico y atributos aria

## Patrones Establecidos

### Arquitectura de Eventos por Dominio
```typescript
// ✅ CORRECTO - Eventos específicos por dominio
import { createProjectEvent } from '@/services/projectEventService';

// ❌ INCORRECTO - Sistema general deprecated
import { createEvent } from '@/services/eventService'; // NO EXISTE
```

**Servicios disponibles:**
- `projectEventService.ts` - Eventos de proyecto (implementado)
- `afterSalesEventService.ts` - Para futuros eventos postventa  
- `visitEventService.ts` - Para futuros eventos de visita

### Servicios Firebase
**Utilidades centralizadas disponibles:**
- `convertFirestoreDocuments()` - Conversión masiva de documentos
- `addTimestamps()` - Agregar timestamps automáticamente
- `updateTimestamps()` - Actualizar timestamps en modificaciones
- `timestampToDate()` - Conversión segura de Timestamp a Date

**Colecciones principales:**
- `projects` - Proyectos principales
- `projectEvents` - Eventos específicos de proyecto
- `clients` - Información de clientes con auto-sync
- `payments` - Pagos asociados a proyectos
- `afterSales` - Servicios postventa

### Componentes y Formularios
- **Patrón establecido:** Compound Component Pattern (ej. ProjectFormCompound)
- **Validación:** React Hook Form + esquemas Zod
- **Validación numérica:** `parseInt(value) || 0` y `parseFloat(value) || 0`
- **Manejo errores:** Try/catch + `useToast()` para errores esperados
- **UI Components:** Shadcn/ui sobre Radix UI + Tailwind CSS

## Flujo de Trabajo y Validación

### Filosofía de Testing
- **Test-As-You-Go:** Crear tests durante implementación
- **Comportamiento del usuario:** Verificar desde perspectiva del usuario
- **Selección de elementos:** Priorizar `getByRole`, `getByText`

### Flujo de Desarrollo Obligatorio

#### EXTREMADAMENTE IMPORTANTE: Verificaciones de Calidad de Código

**SIEMPRE ejecutar antes de completar cualquier tarea:**

1. **Diagnóstico IDE Automático (PRIORIDAD)**
   - Ejecutar `mcp__ide__getDiagnostics` para verificar TODOS los archivos modificados
   - Corregir cualquier error de linting o tipos detectado
   - Este paso es CRÍTICO y NUNCA debe omitirse

2. **Comandos de Validación Complementarios**
   ```bash
   npm run lint        # Verificar calidad de código
   npm run typecheck   # Verificar tipos TypeScript  
   npm run build       # Verificar build exitoso (opcional)
   npm run test        # Ejecutar tests si existen
   ```

3. **Otros principios de desarrollo:**
   - Preferir lectura de archivos específicos antes que exploración general
   - Mantener commits en español con mensajes descriptivos
   - Consultar `/docs` para dudas sobre Claude Code

## Configuración Técnica

### Firebase
- Configuración en `src/lib/firebase/config.ts`
- Variables de entorno para configuración
- Valores por defecto para desarrollo

### Build y Desarrollo
- **Puerto desarrollo:** 3002 (Turbopack) / 3001 (Webpack)
- **Build:** Errores TypeScript y ESLint ignorados (configurado)
- **Google Maps:** Requiere API key en variables de entorno
- **Temas:** Soporte claro/oscuro configurado

## 📚 Documentación Especializada

Para información detallada sobre refactorizaciones y auditorías:
- **`docs/refactorizacion/SESSION_HANDOFF.md`** - Contexto y estado actual de refactorización
- **`docs/refactorizacion/FASE_2_AUDITORIA_INFORME.md`** - Detalles técnicos de Component Architecture
- **`docs/refactorizacion/CHECKLIST_TAREAS.md`** - Progreso detallado de todas las tareas
- **`docs/refactorizacion/PLAN_REFACTORIZACION.md`** - Plan maestro completo

## Comandos Especiales

### Scripts de Sincronización
```bash
# Sincronización de nombres de clientes
npx tsx scripts/sync-client-names.ts

# Test completo de eventos de proyecto
npx tsx scripts/test-project-events.ts
```