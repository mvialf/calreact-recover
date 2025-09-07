# 🔧 Documentación Técnica - Refactorización CalReact

**Propósito:** Referencia técnica de patrones, decisiones arquitecturales y configuraciones implementadas.

**Fecha:** Septiembre 2025  
**Estado:** Documentación de arquitectura estable production-ready

---

## 🏗️ Arquitectura y Patrones

### 🎯 **Principios SOLID Implementados**
- **Single Responsibility:** Cada servicio maneja un dominio específico
- **Open/Closed:** Servicios extensibles sin modificar código base
- **Liskov Substitution:** Interfaces consistentes
- **Interface Segregation:** Contratos específicos por dominio
- **Dependency Inversion:** Firestore inyectado como parámetro

### 📐 **Patrón de Servicios Establecido**
```typescript
// Template aplicado en todos los servicios (max 40 líneas)
export const operationName = async (
  firestore: Firestore,
  parameters: TypedParameters
): Promise<TypedReturn> => {
  // 1. Validación de entrada
  validateParameters(parameters);
  
  // 2. Operación principal con Firestore
  const result = await firestoreOperation(firestore, parameters);
  
  // 3. Logging estructurado
  domainLogger.info('Operación completada', { 
    operation: 'operationName',
    ...metadata 
  });
  
  // 4. Conversión y retorno  
  return convertFirestoreDocuments(result, converter);
};
```

### 🧩 **Compound Component Pattern**
```typescript
// Patrón implementado para formularios complejos
const ProjectFormCompound = ({ children, onSubmit }) => {
  const [formState, setFormState] = useState(initialState);
  
  return (
    <ProjectFormProvider value={{ formState, setFormState }}>
      <form onSubmit={onSubmit}>
        {children}
      </form>
    </ProjectFormProvider>
  );
};

// Sub-componentes especializados
ProjectFormCompound.Header = ProjectFormHeader;
ProjectFormCompound.Fields = ProjectFormFields; 
ProjectFormCompound.Actions = ProjectFormActions;

// Uso flexible
<ProjectFormCompound onSubmit={handleSubmit}>
  <ProjectFormCompound.Header title="Crear Proyecto" />
  <ProjectFormCompound.Fields>
    <ProjectNameField />
    <ProjectBudgetField />
  </ProjectFormCompound.Fields>
  <ProjectFormCompound.Actions />
</ProjectFormCompound>
```

## 🔍 Sistema de Logging

### 📊 **12 Loggers Especializados**
```typescript
// src/lib/logger.ts - Sistema profesional implementado
export const projectLogger = new Logger('PROJECT');           // Gestión proyectos
export const paymentLogger = new Logger('PAYMENT');           // Operaciones de pago  
export const clientLogger = new Logger('CLIENT');             // Gestión clientes
export const eventLogger = new Logger('EVENT');               // Calendario y eventos
export const authLogger = new Logger('AUTH');                 // Autenticación
export const utilityLogger = new Logger('UTILITY');           // Scripts y utilidades
export const formLogger = new Logger('FORM');                 // Formularios
export const uiLogger = new Logger('UI');                     // Componentes UI
export const visitLogger = new Logger('VISIT');               // Gestión de visitas
export const settingsLogger = new Logger('SETTINGS');         // Configuraciones
export const afterSalesLogger = new Logger('AFTERSALES');     // Servicios postventa
export const errorBoundaryLogger = new Logger('ERROR_BOUNDARY'); // Manejo global errores
```

### ⚙️ **Configuración por Entorno**
```typescript
// Desarrollo
const developmentConfig = {
  level: 'debug',
  output: 'console',
  format: 'colorized with emojis',
  context: 'full metadata'
};

// Producción  
const productionConfig = {
  level: 'warn',
  output: ['error.log', 'combined.log'],
  format: 'structured JSON',
  context: 'minimal for performance'
};
```

### 📋 **Patrón de Uso Establecido**
```typescript
// ✅ CORRECTO - Logging estructurado por dominio
projectLogger.info('Proyecto creado exitosamente', { 
  projectId: 'abc123',
  clientId: 'def456',
  budget: 50000,
  timestamp: Date.now() 
});

paymentLogger.error('Error procesando pago', error, {
  paymentId: 'pay_123',
  amount: 1000,
  method: 'credit_card'
});

// ❌ PROHIBIDO - Console.logs (ESLint detecta como error)
console.log('Debug info:', data); // Genera error de linting
```

## 🔧 Servicios Refactorizados

### 📋 **Inventario Completo**
| Servicio | Líneas | Tests | Patrón SOLID | Estado |
|----------|--------|-------|--------------|--------|
| `projectService.ts` | ~180 | 9/9 ✅ | ✅ | Production |
| `clientService.ts` | ~160 | ✅ | ✅ | Production |
| `paymentService.ts` | ~140 | ✅ | ✅ | Production |
| `calendarEventService.ts` | ~120 | ✅ | ✅ | Production |
| `afterSalesService.ts` | ~100 | ✅ | ✅ | Production |
| `visitService.ts` | ~130 | ✅ | ✅ | Production |
| `projectEventService.ts` | ~90 | ✅ | ✅ | Production |
| `clientSyncService.ts` | ~70 | ✅ | ✅ | Production |
| `eventReferenceService.ts` | ~50 | ✅ | ✅ | Production |

### 🔄 **Utilidades Centralizadas**
```typescript
// src/utils/firestore-helpers.ts
export const convertFirestoreDocuments = <T>(
  docs: QueryDocumentSnapshot[],
  converter: (doc: QueryDocumentSnapshot) => T
): T[] => {
  return docs.map(converter);
};

export const addTimestamps = () => ({
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

export const updateTimestamps = () => ({
  updatedAt: serverTimestamp(),
});

export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};
```

## 🧪 Testing Infrastructure

### 🏗️ **Firebase Emulator Suite**
```json
// firebase.json - Configuración implementada
{
  "emulators": {
    "firestore": {
      "port": 8081
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### 📋 **Patrón de Testing Sin Mocks**
```typescript
// Patrón establecido - usar emulators, no mocks complejos
describe('projectService', () => {
  let firestore: Firestore;
  
  beforeAll(async () => {
    // Conectar a emulador local
    firestore = getFirestore(testApp);
    connectFirestoreEmulator(firestore, 'localhost', 8081);
  });
  
  beforeEach(async () => {
    // Limpiar datos entre tests
    await clearFirestoreData(firestore);
  });
  
  it('should create project successfully', async () => {
    // Test con datos reales del emulador
    const project = await createProject(firestore, testProjectData);
    expect(project.id).toBeDefined();
    expect(project.name).toBe(testProjectData.name);
  });
});
```

### 🎭 **Playwright E2E (Migrado de Cypress)**
```typescript
// Tests E2E con herramientas MCP
import { mcp__playwright__browser_navigate, mcp__playwright__browser_click } from 'mcp-tools';

export class ProjectE2ETests {
  async testProjectCreation() {
    await mcp__playwright__browser_navigate({ url: '/projects' });
    await mcp__playwright__browser_click({ 
      element: 'New Project Button',
      ref: '[data-testid="new-project-btn"]' 
    });
    // Tests más estables que con Cypress
  }
}
```

## 🎨 Custom Hooks Implementados

### 🔧 **12 Hooks Especializados**
```typescript
// Hooks por dominio implementados y funcionales
export const useProjectData = (projectId: string) => { /* Real-time project data */ };
export const usePaymentCalculations = (payments: Payment[]) => { /* Business logic */ };
export const useCalendarEvents = (dateRange: DateRange) => { /* Event management */ };
export const useFirestore = () => { /* Firebase connection */ };
export const useAuth = () => { /* Authentication state */ };
export const useDataSync = () => { /* Synchronization logic */ };
export const useFormValidation = (schema: ZodSchema) => { /* Form validation */ };
export const usePagination = (items: any[], pageSize: number) => { /* Pagination */ };
export const useDebounce = (value: any, delay: number) => { /* Performance */ };
export const useLocalStorage = (key: string) => { /* Persistence */ };
export const useClients = () => { /* Client management */ };
export const useProjects = () => { /* Project management */ };
```

## 🚀 Performance & Optimization

### 📦 **Bundle Configuration**
```typescript
// Next.js optimizations implementadas
const nextConfig = {
  experimental: {
    turbopack: true, // Desarrollo más rápido
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        firebase: {
          test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
          name: 'firebase',
          chunks: 'all',
        },
      },
    };
    return config;
  },
};
```

### 🎯 **TanStack Query Patterns**
```typescript
// Caching inteligente implementado
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(firestore),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
  });
};

// Zustand para client state
export const useAppStore = create((set) => ({
  currentUser: null,
  theme: 'light',
  setCurrentUser: (user) => set({ currentUser: user }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
}));
```

## 🔐 Seguridad y Validación

### 🛡️ **Validation with Zod**
```typescript
// Schemas implementados para validación consistente
export const projectSchema = z.object({
  name: z.string().min(3).max(100),
  clientId: z.string().uuid(),
  description: z.string().optional(),
  budget: z.number().positive(),
  status: z.enum(['active', 'completed', 'cancelled']),
});

// Validación en servicios
export const validateProjectData = (data: unknown) => {
  return projectSchema.parse(data);
};
```

### 🚨 **Error Handling Pattern**
```typescript
// Error boundaries implementados
export class ProjectErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorBoundaryLogger.error('Component error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }
}

// Service error handling
export const handleServiceError = (error: Error, context: string) => {
  if (error instanceof FirestoreError) {
    switch (error.code) {
      case 'permission-denied':
        authLogger.error('Permission denied', { context });
        throw new AppError('Access denied', 403);
      case 'not-found':
        utilityLogger.warn('Resource not found', { context });
        throw new AppError('Resource not found', 404);
      default:
        utilityLogger.error('Firestore error', { error, context });
        throw new AppError('Database error', 500);
    }
  }
};
```

## 📊 Stack Tecnológico

### 🔧 **Versiones Actuales**
```json
{
  "framework": "Next.js 15.2.3",
  "react": "18.3.1",  
  "typescript": "5.8.3",
  "firebase": "11.9.1",
  "testing": "Jest + Playwright MCP",
  "logging": "Winston (12 loggers)",
  "ui": "Shadcn/ui + Tailwind CSS",
  "state": "Zustand + TanStack Query",
  "validation": "Zod schemas"
}
```

### ⚙️ **Comandos de Desarrollo**
```bash
# Desarrollo optimizado
npm run dev              # Puerto 3002 (Turbopack enabled)
npm run dev:webpack      # Puerto 3001 (Webpack fallback)

# Validación de calidad  
npm run lint            # ESLint (0 errores críticos)
npm run typecheck       # TypeScript (0 errores)
npm run build          # Production build (exitoso)

# Testing completo
npm test               # Jest unitarios con emulators
npm run test:e2e       # Playwright E2E  
firebase emulators:start  # Para testing manual
```

## 🎯 Convenciones de Código

### 📝 **Estándares Aplicados**
- **Funciones:** Máximo 40 líneas (aplicado consistentemente)
- **Naming:** camelCase para variables, PascalCase para componentes
- **Imports:** Absolute paths con @ alias configurado
- **Error handling:** Try/catch + structured logging  
- **TypeScript:** Strict mode activado
- **JSDoc:** Obligatorio en servicios públicos

### 🔄 **Patrones de Refactorización**
```typescript
// ❌ ANTES - Patrón problemático eliminado
if (!data?.id) return null;
const { mutate } = useMutation(); // Hook después de early return

// ✅ DESPUÉS - Patrón correcto implementado  
const { mutate } = useMutation(); // Hook al inicio
if (!data?.id) return null;

// ❌ ANTES - Console.logs dispersos eliminados
console.log('Debug:', data);
console.error('Error:', error);

// ✅ DESPUÉS - Logging estructurado
projectLogger.debug('Data received', { data });
projectLogger.error('Operation failed', error);
```

## 🎉 Estado de Madurez Técnica

### ✅ **Arquitectura Production-Ready**
- **Patrones consistentes** aplicados en toda la codebase
- **Error handling robusto** con logging estructurado
- **Performance optimizada** con lazy loading y caching
- **Testing infrastructure** moderna y confiable
- **Security best practices** implementadas
- **Code quality** mantenida con herramientas automatizadas

### 📈 **Preparación para Escalabilidad**
- **Compound components** preparados para expansión
- **Service patterns** establecidos para nuevos dominios
- **Logging system** listo para monitoring avanzado
- **Testing patterns** preparados para CI/CD
- **Error boundaries** implementados para resilience

**La arquitectura está preparada para crecimiento futuro manteniendo calidad y performance.**

---

*Documentación técnica mantenida por: Claude Code*  
*Fecha: 07 de Septiembre 2025*  
*Estado: Arquitectura estable y madura*