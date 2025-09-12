# 🏛️ Arquitectura del Proyecto - CalReact

## 📋 Descripción General

**Cobralon-FB** es una aplicación Next.js construida con Firebase para servicios backend. Sistema de gestión de proyectos para manejar clientes, proyectos, pagos, visitas y servicios postventa.

### Stack Tecnológico Principal
- **Frontend**: Next.js 15, React 18, TypeScript
- **Framework UI**: Tailwind CSS con componentes Shadcn/ui
- **Backend**: Firebase (Firestore, Authentication)
- **Gestión de Estado**: React Context API
- **Formularios**: React Hook Form con validación Zod
- **Pruebas**: Jest, React Testing Library, Playwright E2E
- **Mapas**: Integración Google Maps API con PlacesServiceAdapter

## 📁 Estructura Principal del Proyecto

```
src/
├── app/                # Páginas Next.js App Router
│   ├── (dashboard)/    # Rutas agrupadas del dashboard
│   ├── auth/          # Páginas de autenticación
│   └── layout.tsx     # Layout principal
├── components/         # Componentes React reutilizables
│   ├── ui/            # Componentes UI base (Shadcn)
│   ├── forms/         # Formularios específicos
│   └── modals/        # Componentes modales
├── services/           # Capa de servicios Firebase
│   ├── cache/         # Servicios de cache inteligente
│   └── index.ts       # Barrel exports
├── hooks/              # Custom hooks de React
├── lib/                # Utilidades y configuraciones
│   ├── firebase/      # Configuración Firebase
│   ├── places/        # PlacesServiceAdapter
│   └── config/        # Configuración general
├── constants/          # Datos estáticos centralizados
├── utils/              # Funciones puras y helpers
└── types/              # Definiciones de tipos TypeScript
```

## 🏗️ Principios de Arquitectura

### SOLID, DRY, KISS, YAGNI

#### Single Responsibility Principle
- **Componentes**: Una responsabilidad por componente
- **Servicios**: Una operación por función
- **Hooks**: Una funcionalidad específica por hook

#### DRY (Don't Repeat Yourself) - OBLIGATORIO
```typescript
// ✅ CORRECTO - Verificar existencia antes de crear
// 1. Buscar funcionalidad existente en:
//    - /src/utils/
//    - /src/lib/
//    - /src/hooks/
//    - /src/services/
// 2. Solo entonces crear nueva funcionalidad
```

#### Keep It Simple, Stupid
- Evitar sobreingeniería
- Mantener diseño simple y comprensible
- Funciones máximo 40 líneas

#### You Aren't Gonna Need It
- No agregar funcionalidad "por si acaso"
- Implementar solo lo que se necesita ahora

## 📂 Organización por Responsabilidades

### `/src/utils/` - Funciones Puras
```typescript
// Helpers sin dependencias externas
// Funciones que reciben input, devuelven output
// Sin efectos secundarios
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};
```

### `/src/lib/` - Lógica de Negocio Central
```typescript
// Configuraciones y utilidades centrales
// Lógica de negocio compartida
// Integraciones con servicios externos
```

### `/src/hooks/` - Custom Hooks de React
```typescript
// Estado y lógica reutilizable
// Encapsulación de efectos secundarios
// Abstracción de operaciones complejas
```

### `/src/services/` - Integración con APIs Externas
```typescript
// Operaciones Firebase
// Integraciones con APIs externas
// Capa de abstracción para servicios backend
```

### `/src/constants/` - Datos Estáticos Centralizados
```typescript
// ✅ OBLIGATORIO - NO valores mágicos en componentes
export const PROJECT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed'
} as const;
```

## 🎨 Patrones de Componentes

### Arrow Functions con Tipado Explícito
```typescript
// ✅ PATRÓN ESTABLECIDO
interface ComponentProps {
  title: string;
  onSave: () => void;
}

export const Component: React.FC<ComponentProps> = ({ 
  title, 
  onSave 
}) => {
  // Implementación
};
```

### Nomenclatura de Manejadores
```typescript
// ✅ PREFIJO 'handle' obligatorio
const handleClick = () => { /* */ };
const handleSubmit = () => { /* */ };
const handleChange = () => { /* */ };
```

### Retornos Anticipados (Early Returns)
```typescript
// ✅ USAR SIEMPRE para reducir anidamiento
const processUser = (user: User) => {
  if (!user) return null;
  if (!user.isActive) return <InactiveMessage />;
  if (!user.permissions) return <NoPermissions />;
  
  return <UserDashboard user={user} />;
};
```

## 🔧 Configuración Técnica

### Firebase Configuration
- **Archivo**: `src/lib/firebase/config.ts`
- **Variables de entorno**: Configuración para desarrollo/producción
- **Valores por defecto**: Configurados para desarrollo local

### Build y Desarrollo
- **Puerto desarrollo**: 3002 (Turbopack) / 3001 (Webpack)
- **Build**: Errores TypeScript y ESLint ignorados en producción (configurado)
- **Google Maps**: Requiere API key en variables de entorno
- **Temas**: Soporte claro/oscuro configurado

### Accesibilidad (Obligatoria)
```typescript
// ✅ HTML semántico obligatorio
<button 
  aria-label="Guardar proyecto"
  aria-describedby="save-description"
>
  Guardar
</button>

// ✅ Atributos ARIA requeridos
<input 
  type="text"
  aria-invalid={errors.name ? 'true' : 'false'}
  aria-describedby={errors.name ? 'name-error' : undefined}
/>
```

## 🗄️ Arquitectura de Datos

### Firebase Collections Structure
```
projects/               # Proyectos principales
├── {projectId}/       # Documento de proyecto
│   ├── events/        # Subcolección de eventos (legacy)
│   └── ...
projectEvents/         # Eventos específicos (nueva arquitectura)
├── {eventId}/         # Evento individual
clients/               # Clientes con auto-sync
payments/              # Pagos asociados a proyectos  
afterSales/            # Servicios postventa
```

### Tipos TypeScript Centralizados
```typescript
// /src/types/ - Tipos principales
export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  // ... otros campos
}

export interface ProjectEventLean {
  // Versión optimizada para eventos
}
```

## 🚀 Performance & Optimización

### Compound Component Pattern
```typescript
// ✅ PATRÓN ESTABLECIDO para componentes complejos
const ProjectForm = {
  Container: ProjectFormContainer,
  Section: ProjectFormSection,
  Field: ProjectFormField,
  Actions: ProjectFormActions
};
```

### Lazy Loading
```typescript
// ✅ Para componentes pesados
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Memoización Inteligente
```typescript
// ✅ Solo cuando es necesario
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

## 🔐 Seguridad

### Variables de Entorno
```bash
# ✅ Obligatorias
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=    # Google Maps
FIREBASE_PROJECT_ID=                # Firebase Project
FIREBASE_CLIENT_EMAIL=              # Firebase Admin
```

### Best Practices
- Nunca exponer secrets o keys en código
- Nunca commitear credenciales al repositorio
- Validación de entrada en el servidor
- Sanitización de datos antes de mostrar

## 📚 Documentación Referencial

### Documentación Consolidada
- **Estado actual**: `/docs/refactorizacion/REFACTORING_STATUS.md`
- **Técnica detallada**: `/docs/refactorizacion/REFACTORING_TECHNICAL.md`
- **Migración Google Places**: `/docs/google-places-migration/`
- **Testing**: `/docs/claude-reference/plan-correccion-tests/`