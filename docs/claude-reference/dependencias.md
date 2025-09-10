# 📦 Dependencias del Proyecto CalReact

**Proyecto:** nextn v0.1.0  
**Fecha de actualización:** Septiembre 2025  
**Total de dependencias:** 82 paquetes (54 producción + 28 desarrollo)

**Para arquitectura del stack:** [@docs/claude-reference/stack.md](./stack.md)

---

## 🚀 Dependencias de Producción (54)

### Framework Core
- **next**: `15.2.3` - Framework React con App Router y Turbopack
- **react**: `18.3.1` - Librería de interfaz de usuario
- **react-dom**: `18.3.1` - React DOM renderer

### Backend y Base de Datos
- **firebase**: `11.9.1` - SDK de Firebase v11 (Breaking changes desde v10)
- **firebase-admin**: `13.4.0` - SDK administrativo de Firebase

### Gestión de Estado y Datos
- **@tanstack/react-query**: `5.81.5` - Cache y sincronización de datos server state
- **@tanstack-query-firebase/react**: `1.0.5` - Integración TanStack Query con Firebase

### UI Components - Radix UI Ecosystem
- **@radix-ui/react-accordion**: `1.2.3` - Componente accordion accesible
- **@radix-ui/react-alert-dialog**: `1.1.6` - Diálogos de alerta
- **@radix-ui/react-avatar**: `1.1.3` - Componente avatar
- **@radix-ui/react-checkbox**: `1.1.4` - Checkboxes accesibles
- **@radix-ui/react-context-menu**: `2.2.15` - Menús contextuales
- **@radix-ui/react-dialog**: `1.1.6` - Componente dialog/modal
- **@radix-ui/react-dropdown-menu**: `2.1.6` - Menús desplegables
- **@radix-ui/react-form**: `0.1.7` - Formularios accesibles
- **@radix-ui/react-label**: `2.1.2` - Labels semánticas
- **@radix-ui/react-menubar**: `1.1.6` - Barras de menú
- **@radix-ui/react-popover**: `1.1.6` - Componente popover
- **@radix-ui/react-progress**: `1.1.2` - Barras de progreso
- **@radix-ui/react-radio-group**: `1.2.3` - Grupos de radio buttons
- **@radix-ui/react-scroll-area**: `1.2.3` - Áreas de scroll personalizadas
- **@radix-ui/react-select**: `2.1.6` - Componente select avanzado
- **@radix-ui/react-separator**: `1.1.2` - Separadores visuales
- **@radix-ui/react-slider**: `1.2.3` - Controles deslizantes
- **@radix-ui/react-slot**: `1.2.3` - Componente slot para composición
- **@radix-ui/react-switch**: `1.1.3` - Interruptores toggle
- **@radix-ui/react-tabs**: `1.1.3` - Sistema de pestañas
- **@radix-ui/react-toast**: `1.2.6` - Notificaciones toast
- **@radix-ui/react-tooltip**: `1.1.8` - Tooltips accesibles

### Styling y Clases
- **tailwind-merge**: `3.0.1` - Fusión inteligente de clases Tailwind
- **tailwindcss-animate**: `1.0.7` - Animaciones con Tailwind CSS
- **class-variance-authority**: `0.7.1` - Variantes de componentes tipadas
- **clsx**: `2.1.1` - Utilidad para clases condicionales
- **next-themes**: `0.3.0` - Soporte para temas claro/oscuro

### Formularios y Validación
- **react-hook-form**: `7.54.2` - Gestión de formularios performante
- **@hookform/resolvers**: `4.1.3` - Resolvers para React Hook Form
- **zod**: `3.25.67` - Validación de esquemas TypeScript-first

### Mapas y Geolocalización
- **@react-google-maps/api**: `2.20.7` - Integración Google Maps API
- *(PlacesServiceAdapter implementado en src/lib/places/)*

### Componentes UI Específicos
- **lucide-react**: `0.475.0` - Iconografía moderna y consistente
- **cmdk**: `1.0.0` - Command palette/menu componente
- **sonner**: `2.0.5` - Notificaciones toast elegantes
- **react-day-picker**: `8.10.1` - Selector de fechas avanzado
- **recharts**: `2.15.1` - Gráficos y visualizaciones

### Entrada de Datos
- **react-input-mask**: `2.0.4` - Máscaras de entrada de texto
- **react-number-format**: `5.4.4` - Formateo de números
- **react-phone-number-input**: `3.4.12` - Input de números telefónicos

### Utilidades y Helpers
- **date-fns**: `3.6.0` - Manipulación de fechas moderna (alternative to moment.js)
- **country-data**: `0.0.31` - Datos de países y regiones
- **dotenv**: `16.5.0` - Gestión de variables de entorno
- **patch-package**: `8.0.0` - Parchear dependencias de node_modules

### Interacciones Avanzadas
- **@dnd-kit/core**: `6.3.1` - Drag and drop accesible y performante
- **@zumer/snapdom**: `1.3.0` - Capturas DOM para testing

### Testing E2E (Producción)
- **@playwright/test**: `1.55.0` - Framework E2E testing
- **@playwright/mcp**: `0.0.36` - Integración Playwright con Claude Code MCP

---

## 🛠️ Dependencias de Desarrollo (28)

### TypeScript y Definiciones de Tipos
- **@types/country-data**: `0.0.5` - Tipos para country-data
- **@types/google.maps**: `3.58.1` - Tipos para Google Maps API
- **@types/jest**: `29.5.12` - Tipos para Jest
- **@types/node**: `20.19.11` - Tipos para Node.js
- **@types/react**: `18` - Tipos para React
- **@types/react-dom**: `18` - Tipos para React DOM
- **@types/react-input-mask**: `3.0.6` - Tipos para react-input-mask
- **@types/testing-library__jest-dom**: `5.14.9` - Tipos para Jest DOM

### Linting y Code Quality
- **eslint**: `8.57.1` - Linter principal JavaScript/TypeScript
- **@typescript-eslint/eslint-plugin**: `8.35.0` - Plugin ESLint para TypeScript
- **@typescript-eslint/parser**: `8.35.0` - Parser TypeScript para ESLint
- **eslint-config-next**: `15.4.4` - Configuración ESLint para Next.js
- **eslint-config-prettier**: `10.1.5` - Desactiva reglas conflictivas con Prettier
- **eslint-plugin-jsx-a11y**: `6.10.2` - Reglas de accesibilidad para JSX
- **eslint-plugin-prettier**: `5.5.0` - Integra Prettier como regla de ESLint
- **eslint-plugin-react**: `7.37.5` - Reglas específicas para React
- **eslint-plugin-react-hooks**: `5.2.0` - Reglas para React Hooks
- **eslint-plugin-react-refresh**: `0.4.20` - Fast Refresh para React

### Testing Unitario e Integración
- **jest**: `30.0.3` - Framework de testing principal
- **jest-environment-jsdom**: `29.7.0` - Entorno DOM virtual para Jest
- **@testing-library/jest-dom**: `6.6.3` - Matchers personalizados para DOM
- **@testing-library/react**: `14.3.1` - Utilidades de testing para React
- **@testing-library/user-event**: `14.6.1` - Simulación de eventos de usuario

### Build Tools y Utilidades
- **postcss**: `8.5.2` - Transformador CSS
- **tailwindcss**: `3.4.17` - Framework CSS utility-first
- **prettier**: `3.6.0` - Formateador de código automático
- **ts-node**: `10.9.2` - Ejecutor TypeScript directo para Node.js

---

## 🚨 Dependencias Eliminadas Históricamente

Estas dependencias fueron removidas durante las refactorizaciones de 2025:

### Google Places (Septiembre 2025)
- **~~use-places-autocomplete~~** → Reemplazado por `PlacesServiceAdapter` personalizado
- **~~@vis.gl/react-google-maps~~** → Eliminado por complejidad innecesaria  
- **~~react-google-autocomplete~~** → Deprecado en favor de solución personalizada

### Estado y Logging (Agosto 2025)
- **~~zustand~~** → Migrado a React Context API nativo
- **~~winston~~** → Reemplazado por sistema `logger.ts` personalizado

---

## 🔧 Comandos de Gestión

### Verificar Dependencias
```bash
# Listar dependencias instaladas
npm list --depth=0

# Verificar vulnerabilidades
npm audit

# Actualizar dependencias (con precaución)
npm update
```

### Instalación y Limpieza
```bash
# Instalación limpia
rm -rf node_modules package-lock.json
npm install

# Verificar paquetes no utilizados
npx depcheck
```

## ⚠️ Notas Críticas de Compatibilidad

### Firebase v11 (Breaking Changes)
- **Migración obligatoria** desde v9/v10 patterns
- Usar utilidades en `src/lib/firebase/firestore-helpers.ts`

### React 18.3.1 (Estabilidad)
- **NO actualizar** a React 19 hasta mayor estabilidad
- APIs de React 19 no disponibles

### Next.js 15.2.3 (App Router)
- **Turbopack habilitado** por defecto en desarrollo
- **Pages directory deprecated** - usar App Router

---

**📊 Generado automáticamente el:** Septiembre 2025  
**📋 Para actualizar ejecutar:** `npm list --depth=0`  
**🏗️ Para patrones arquitecturales ver:** [`@docs/claude-reference/stack.md`](./stack.md)