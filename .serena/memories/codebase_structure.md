# Estructura del Codebase

## Estructura Principal de Directorios

```
src/
├── app/                # Páginas Next.js App Router
│   ├── dashboard/      # Panel principal
│   ├── projects/       # Gestión de proyectos  
│   ├── clients/        # Gestión de clientes
│   ├── payments/       # Procesamiento de pagos
│   ├── visits/         # Programación de visitas
│   ├── aftersales/     # Servicio postventa
│   └── settings/       # Configuración de aplicación
├── components/         # Componentes React reutilizables
│   ├── forms/          # Componentes de formularios
│   ├── modals/         # Diálogos modales
│   ├── ui/             # Componentes Shadcn/ui
│   └── calendar/       # Funcionalidad de calendario
├── services/           # Capa de servicios Firebase
├── hooks/              # Custom hooks de React
├── lib/                # Utilidades y configuraciones
├── types/              # Definiciones de tipos TypeScript
├── constants/          # Sistema centralizado de constantes
└── utils/              # Funciones puras y helpers
```

## Servicios Firebase (Post-Auditoría)

### Servicios Principales
- `projectService.ts` - Proyectos principales
- `projectEventService.ts` - Eventos específicos de proyecto ✅
- `clientService.ts` - Información de clientes
- `paymentService.ts` - Pagos asociados
- `afterSalesService.ts` - Servicios postventa
- `visitService.ts` - Programación de visitas

### Servicios de Soporte
- `clientSyncService.ts` - Sincronización automática cliente-proyecto
- `eventValidation.ts` - Validaciones especializadas

## Colecciones Firestore

### Colecciones Activas
- `projects` - Proyectos principales
- `projectEvents` - Eventos de proyecto independientes ✅ **NUEVO**
- `clients` - Información de clientes con sincronización automática
- `payments` - Pagos asociados a proyectos  
- `afterSales` - Servicios postventa

### Colecciones Deprecated
- ~~`events`~~ - **ELIMINADO**: Sistema general de eventos

## Componentes UI

### Estructura de Componentes
- `src/components/ui/` - Biblioteca Shadcn/ui sobre Radix UI
- `src/components/forms/` - Formularios especializados
- `src/components/modals/` - Diálogos organizados por dominio
- `src/components/calendar/` - Funcionalidad de calendario

### Organización por Dominio
```
modals/
├── projects/      # Modales de proyectos
├── afterSales/    # Modales de postventa  
├── visits/        # Modales de visitas
└── calendar/      # Modales de calendario
```

## Configuración y Constantes

### Sistema de Constantes (Post-Auditoría)
- `constants/defaults.ts` - Valores por defecto
- `constants/firebase.ts` - Configuración Firebase
- `constants/project.ts` - Constantes de proyectos
- `constants/payment.ts` - Constantes de pagos
- `constants/routes.ts` - Rutas de la aplicación

### Utilidades Centralizadas
- `utils/firestore-helpers.ts` - Operaciones Firestore comunes
- `utils/validation-schemas.ts` - Esquemas Zod reutilizables
- `utils/eventValidation.ts` - Validaciones de eventos
- `utils/date-helpers.ts` - Manejo de fechas

## Testing

### Estructura de Tests
- `src/__tests__/` - Tests principales organizados por tipo
- `src/components/ui/__tests__/` - Tests de componentes UI
- `src/services/__tests__/` - Tests de servicios
- `src/utils/__tests__/` - Tests de utilidades

### Configuración Testing
- `jest.config.js` - Configuración principal Jest
- `jest.setup.js` - Setup global de tests
- `src/__mocks__/` - Mocks para Firebase y APIs externas