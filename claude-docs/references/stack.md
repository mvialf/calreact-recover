# 🏗️ Arquitectura del Stack Tecnológico - CalReact 2025

**Versión:** 1.0.0  
**Node.js Requerido:** >=18.0.0  
**Última Actualización:** Septiembre 2025

Para el **inventario completo de dependencias** ver: [dependencias.md](./dependencias.md)

## 🎯 Framework Core & Principios Arquitecturales

### Next.js & React (Configuración Estable)
**Estrategia:** Mantenerse en versiones estables probadas

**🔥 Configuración Crítica:**
- **React 18.3.1:** NO usar APIs de React 19 (no disponibles)
- **Next.js 15.2.3:** Turbopack habilitado por defecto en desarrollo
- **Puerto desarrollo:** 3002 (Turbopack) / 3001 (Webpack)
- **Build:** Configurado para ignorar errores TypeScript en producción

### Firebase Stack (Versión 11.x)
**Estrategia:** Firebase 11.x con breaking changes implementados

**⚠️ Compatibilidad Crítica Firebase 11.x:**
- **Nuevas APIs de inicialización:** NO usar v9/v10 patterns
- **Timestamps automáticos:** Usar `addTimestamps()` / `updateTimestamps()`
- **Conversión masiva:** Usar `convertFirestoreDocuments()`

## 🎨 Patrones UI Establecidos

### UI Ecosystem (Radix + Shadcn)
**Estrategia:** Componentes sobre Radix UI primitives con Shadcn/ui

**🎨 Patrón UI Obligatorio:**
```typescript
// ✅ CORRECTO - Usar componentes Shadcn existentes
import { Button } from "@/components/ui/button"

// ❌ EVITAR - Crear componentes UI desde cero
```

### Styling Architecture
**Estrategia:** Tailwind CSS con plugins de animación y variantes controladas

## 📝 Gestión de Estado y Formularios

### State Management Pattern
**Estrategia:** React Context API nativo + TanStack Query para server state

### Formularios Pattern (Obligatorio)
```typescript
// ✅ PATRÓN ESTABLECIDO - React Hook Form + Zod
const form = useForm<SchemaType>({
  resolver: zodResolver(schema),
  defaultValues: { /* valores iniciales */ }
});
```

## 🗺️ Google Maps Integration

### Migración Completada (Septiembre 2025)
**Estrategia:** PlacesServiceAdapter personalizado

**🚨 DEPENDENCIAS ELIMINADAS:**
- ~~use-places-autocomplete~~ → Reemplazado por PlacesServiceAdapter
- ~~@vis.gl/react-google-maps~~ → Removido tras limpieza
- ~~react-google-autocomplete~~ → Deprecado

**✅ ARQUITECTURA ACTUAL:**
- `@react-google-maps/api` - Integración principal
- `PlacesServiceAdapter` - Sistema personalizado en `src/lib/places/`

## 🧪 Testing Architecture

**Para información completa de testing:** [testing.md](../workflow/testing.md)

**Estrategia:** Test-As-You-Go con integración Playwright MCP

## ⛔ APIs y Patrones a EVITAR

### APIs Incompatibles con Versiones Actuales
```typescript
// ❌ NO USAR - APIs incompatibles
React19APIs: use(), useOptimistic()     // No disponibles en React 18.3.1
FirebaseV9V10: initializeApp(legacy)    // Usar Firebase 11.x patterns
NextJS14Config: pages directory         // Usar App Router
```

### Dependencias Removidas Históricamente
```typescript
// ❌ ELIMINADAS - No usar en nuevos desarrollos
'use-places-autocomplete'     // → PlacesServiceAdapter
'@vis.gl/react-google-maps'   // → @react-google-maps/api
'react-google-autocomplete'   // → PlacesServiceAdapter
'winston'                     // → logger.ts personalizado
'zustand'                     // → React Context API
```

## ✅ Patrones y APIs RECOMENDADAS

### Arquitectura Preferida
```typescript
// ✅ FRAMEWORK PATTERNS
NextJS15: App Router + Turbopack         // Performance optimizada
React18: Suspense + Concurrent básico    // Estabilidad probada
Firebase11: Modular SDK + utilidades     // Breaking changes implementados
```

### Estructura de Imports Recomendada
```typescript
// ✅ ORDEN DE IMPORTS ESTABLECIDO
// 1. Framework
import { useState, useEffect } from 'react'
import { NextPage } from 'next'

// 2. UI Components  
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 3. Services & Utils
import { PlacesServiceAdapter } from '@/lib/places/PlacesServiceAdapter'
import { convertFirestoreDocuments } from '@/lib/firebase/firestore-helpers'

// 4. Types
import type { Project } from '@/types/project'
```

## 🔧 Configuración Técnica

### Build Tools Strategy
- **Desarrollo:** Turbopack (por defecto) - Puerto 3002
- **Alternativo:** Webpack - Puerto 3001  
- **Producción:** Next.js optimized build

### Variables de Entorno Críticas
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=    # Google Maps (obligatoria)
FIREBASE_PROJECT_ID=                # Firebase Project
FIREBASE_CLIENT_EMAIL=              # Firebase Admin
```

### Accesibilidad (Obligatoria)
```typescript
// ✅ HTML semántico obligatorio + ARIA
<button 
  aria-label="Guardar proyecto"
  aria-describedby="save-description"
>
  Guardar
</button>
```

## 🚀 Performance & Patterns

### Compound Component Pattern (Establecido)
```typescript
// ✅ PATRÓN para componentes complejos
const ProjectForm = {
  Container: ProjectFormContainer,
  Section: ProjectFormSection,
  Field: ProjectFormField,
  Actions: ProjectFormActions
};
```

### Feature Flags System
```typescript
// ✅ Sistema implementado en src/lib/config/featureFlags
import { featureFlags } from '@/lib/config/featureFlags';

if (featureFlags.useNewProjectEventForm) {
  return <NewProjectEventModalV2 />;
}
```

## 📚 Referencias Arquitecturales

### Documentación Técnica
- **Estado actual:** [IMPLEMENTATIONS.md](../IMPLEMENTATIONS.md) - Log de implementaciones completadas
- **Arquitectura:** [architecture.md](../context/architecture.md) - Principios y estructura del proyecto
- **Inventario de dependencias:** [dependencias.md](./dependencias.md)