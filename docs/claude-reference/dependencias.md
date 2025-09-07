# Dependencias del Proyecto Calreact

**Proyecto:** nextn v0.1.0  
**Fecha de actualización:** 7 de septiembre de 2025  
**Total de dependencias instaladas:** 81 paquetes

## 📊 Resumen Ejecutivo

- **Dependencias de producción:** 56 paquetes
- **Dependencias de desarrollo:** 25 paquetes
- **Framework principal:** Next.js 15.2.3 con React 18.3.1
- **Backend:** Firebase 11.9.1
- **UI Framework:** Radix UI + Tailwind CSS + Shadcn/ui

## 🚀 Dependencias de Producción (56)

### Framework Core
- **next** - `15.2.3` - Framework React con App Router
- **react** - `18.3.1` - Librería de interfaz de usuario
- **react-dom** - `18.3.1` - React DOM renderer
- **typescript** - `5.8.3` - Lenguaje de programación tipado

### Backend y Base de Datos
- **firebase** - `11.9.1` - SDK de Firebase v11 (¡Importante: Breaking changes desde v10!)
- **firebase-admin** - `13.4.0` - SDK administrativo de Firebase

### Gestión de Estado y Datos
- **zustand** - `5.0.5` - Gestión de estado ligera
- **@tanstack/react-query** - `5.81.5` - Cache y sincronización de datos
- **@tanstack-query-firebase/react** - `1.0.6` - Integración TanStack Query con Firebase

### UI Components (Radix UI Ecosystem)
- **@radix-ui/react-accordion** - `1.2.3`
- **@radix-ui/react-alert-dialog** - `1.1.6`
- **@radix-ui/react-avatar** - `1.1.3`
- **@radix-ui/react-checkbox** - `1.1.4`
- **@radix-ui/react-context-menu** - `2.2.15`
- **@radix-ui/react-dialog** - `1.1.6`
- **@radix-ui/react-dropdown-menu** - `2.1.6`
- **@radix-ui/react-form** - `0.1.7`
- **@radix-ui/react-label** - `2.1.7`
- **@radix-ui/react-menubar** - `1.1.6`
- **@radix-ui/react-popover** - `1.1.6`
- **@radix-ui/react-progress** - `1.1.2`
- **@radix-ui/react-radio-group** - `1.2.3`
- **@radix-ui/react-scroll-area** - `1.2.3`
- **@radix-ui/react-select** - `2.1.6`
- **@radix-ui/react-separator** - `1.1.2`
- **@radix-ui/react-slider** - `1.2.3`
- **@radix-ui/react-slot** - `1.2.3`
- **@radix-ui/react-switch** - `1.1.3`
- **@radix-ui/react-tabs** - `1.1.3`
- **@radix-ui/react-toast** - `1.2.6`
- **@radix-ui/react-tooltip** - `1.1.8`

### Styling y Clases
- **tailwind-merge** - `3.0.1` - Fusión inteligente de clases Tailwind
- **tailwindcss-animate** - `1.0.7` - Animaciones con Tailwind CSS
- **class-variance-authority** - `0.7.1` - Variantes de componentes
- **clsx** - `2.1.1` - Utilidad para clases condicionales
- **next-themes** - `0.3.0` - Soporte para temas claro/oscuro

### Formularios y Validación
- **react-hook-form** - `7.54.2` - Gestión de formularios performante
- **@hookform/resolvers** - `4.1.3` - Resolvers para RHF
- **zod** - `3.25.67` - Validación de esquemas TypeScript-first

### Mapas y Geolocalización
- **@react-google-maps/api** - `2.20.7` - Integración Google Maps
- **@vis.gl/react-google-maps** - `1.5.4` - Componentes avanzados de mapas
- **react-google-autocomplete** - `2.7.5` - Autocompletado de Google Places
- **react-google-places-autocomplete** - `4.1.0` - Hook de autocompletado
- **use-places-autocomplete** - `4.0.1` - Hook personalizado para Places

### Componentes UI Específicos
- **lucide-react** - `0.475.0` - Iconografía moderna
- **cmdk** - `1.1.1` - Command palette/menu
- **sonner** - `2.0.5` - Notificaciones toast elegantes
- **react-day-picker** - `8.10.1` - Selector de fechas
- **recharts** - `2.15.1` - Gráficos y visualizaciones

### Entrada de Datos
- **react-input-mask** - `2.0.4` - Máscaras de entrada
- **react-number-format** - `5.4.4` - Formateo de números
- **react-phone-number-input** - `3.4.12` - Input de números telefónicos

### Utilidades y Helpers
- **date-fns** - `3.6.0` - Manipulación de fechas moderna
- **country-data** - `0.0.31` - Datos de países
- **winston** - `3.17.0` - Sistema de logging profesional
- **dotenv** - `16.5.0` - Variables de entorno
- **patch-package** - `8.0.0` - Parchear dependencias de node_modules

### Drag & Drop y Interacciones
- **@dnd-kit/core** - `6.3.1` - Drag and drop accesible
- **@zumer/snapdom** - `1.3.0` - Capturas DOM

### Testing de Producción
- **@playwright/mcp** - `0.0.36` - Integración Playwright con MCP
- **@playwright/test** - `1.55.0` - Framework E2E testing

## 🛠️ Dependencias de Desarrollo (25)

### TypeScript y Tipos
- **@types/country-data** - `0.0.5`
- **@types/google.maps** - `3.58.1`
- **@types/jest** - `29.5.12`
- **@types/node** - `20.19.11`
- **@types/react-dom** - `18.3.5`
- **@types/react-input-mask** - `3.0.6`
- **@types/react** - `18.3.18`
- **@types/testing-library__jest-dom** - `5.14.9`

### Linting y Code Quality
- **eslint** - `8.57.1` - Linter principal
- **@typescript-eslint/eslint-plugin** - `8.35.0` - Plugin ESLint para TypeScript
- **@typescript-eslint/parser** - `8.35.0` - Parser TypeScript para ESLint
- **eslint-config-next** - `15.4.4` - Configuración ESLint para Next.js
- **eslint-config-prettier** - `10.1.5` - Desactivar reglas conflictivas con Prettier
- **eslint-plugin-jsx-a11y** - `6.10.2` - Reglas de accesibilidad JSX
- **eslint-plugin-prettier** - `5.5.0` - Integración Prettier con ESLint
- **eslint-plugin-react-hooks** - `5.2.0` - Reglas para React Hooks
- **eslint-plugin-react-refresh** - `0.4.20` - Fast Refresh para React
- **eslint-plugin-react** - `7.37.5` - Reglas específicas de React

### Testing Unitario
- **jest** - `30.0.3` - Framework de testing principal
- **jest-environment-jsdom** - `29.7.0` - Entorno DOM para Jest
- **@testing-library/jest-dom** - `6.6.3` - Matchers personalizados para DOM
- **@testing-library/react** - `14.3.1` - Utilidades de testing para React
- **@testing-library/user-event** - `14.6.1` - Simulación de eventos de usuario

### Build y Tooling
- **postcss** - `8.5.2` - Transformador CSS
- **tailwindcss** - `3.4.17` - Framework CSS utility-first
- **prettier** - `3.6.0` - Formateador de código
- **ts-node** - `10.9.2` - Ejecutor TypeScript para Node.js

## 🔧 Configuración y Comandos

### Scripts NPM Disponibles
```bash
npm run dev              # Desarrollo con Turbopack (puerto 3002)
npm run dev:webpack      # Desarrollo con Webpack (puerto 3001)
npm run build           # Build de producción
npm run start           # Servidor de producción
npm run lint            # Linter ESLint
npm run typecheck       # Verificación TypeScript
npm test                # Tests unitarios en watch mode
npm run test:ci         # Tests en modo CI
npm run test:coverage   # Tests con cobertura
npm run test:e2e        # Tests E2E con Playwright
```

## ⚠️ Notas Importantes

### Firebase v11 Breaking Changes
- **Nueva inicialización:** Usar patrones v11, NO v9/v10
- **Timestamps:** Usar `addTimestamps()` y `updateTimestamps()`
- **Conversión:** Usar `convertFirestoreDocuments()` para conversión masiva

### React 18.3.1 Limitaciones
- **NO usar:** APIs de React 19 (`use()`, `useOptimistic()`, etc.)
- **Compatible:** Suspense básico, Concurrent Mode limitado

### Versiones Críticas No Cambiar
- **React:** Mantener en 18.3.1 (no actualizar a 19)
- **Next.js:** 15.2.3 estable con App Router
- **Firebase:** 11.9.1 con breaking changes implementados

## 🎯 Patrones de Uso Establecidos

### Componentes UI
```typescript
// ✅ CORRECTO - Usar Shadcn/ui existente
import { Button } from "@/components/ui/button"

// ❌ EVITAR - Crear componentes desde cero
```

### Formularios
```typescript
// ✅ CORRECTO - Patrón establecido
const form = useForm<SchemaType>({
  resolver: zodResolver(schema),
  defaultValues: { /* */ }
});
```

### Firebase
```typescript
// ✅ CORRECTO - Firebase v11
import { operacion } from '@/services/firebase-service';

// ❌ EVITAR - Patrones v9/v10 obsoletos
```

---

**Generado automáticamente el 7 de septiembre de 2025**  
**Para actualizaciones:** `npm list --depth=0`