# 🎨 Patrones de Código Establecidos - CalReact

## 🏗️ Arquitectura de Eventos por Dominio

### ✅ Servicios de Eventos Específicos (IMPLEMENTADO)
```typescript
// ✅ CORRECTO - Eventos específicos por dominio
import { createProjectEvent } from '@/services/projectEventService';

// ❌ INCORRECTO - Sistema general deprecated
import { createEvent } from '@/services/eventService'; // NO EXISTE
```

**Servicios disponibles:**
- `projectEventService.ts` - Eventos de proyecto (implementado)
- `projectEventServiceV2.ts` - Versión optimizada con cache  
- `afterSalesEventService.ts` - Para eventos postventa  
- `visitEventService.ts` - Para eventos de visita

### 🗄️ Sistema de Enrichment de Eventos
```typescript
// ✅ IMPLEMENTADO - Sistema de enrichment para eventos de proyecto (EN USO)
import { eventEnrichmentService } from '@/services/eventEnrichmentService';
```

## 🔧 Servicios Críticos del Sistema (IMPLEMENTADOS)

### 📁 Gestión de Proyectos (projectService)
```typescript
// ✅ PATRÓN ESTABLECIDO - CRUD completo de proyectos
import { createProject, updateProject, getProjects, calculateProjectBalance } from '@/services/projectService';

// Crear proyecto con validaciones
const newProjectId = await createProject(firestore, {
  name: "Proyecto Ejemplo",
  clientId: "client-123",
  totalAmount: 50000,
  status: "pending"
});

// Obtener proyectos con balance calculado
const projects = await getProjects(firestore);
const balance = await calculateProjectBalance(firestore, projectId);
```

**Funciones principales:**
- `createProject()` - Crear nuevo proyecto con validaciones
- `updateProject()` - Actualizar proyecto existente
- `getProjects()` - Obtener todos los proyectos activos
- `calculateProjectBalance()` - Calcular balance financiero

**Casos de uso:**
- CRUD completo de proyectos
- Cálculo automático de balances
- Integración con sistema de pagos

### 💰 Sistema de Pagos y Cuotas (paymentService)
```typescript
// ✅ PATRÓN ESTABLECIDO - Sistema financiero completo
import {
  addPayment,
  generateInstallments,
  processPaymentTransaction,
  getCurrentMonthInstallmentSum
} from '@/services/paymentService';

// Crear pago con cuotas automáticas
const paymentData = {
  projectId: "project-123",
  amount: 15000,
  installments: 3,
  paymentMethod: "transfer"
};

const paymentId = await addPayment(firestore, paymentData);
const installments = generateInstallments(paymentData);
await processPaymentTransaction(firestore, paymentData);

// Obtener estadísticas financieras
const monthTotal = await getCurrentMonthInstallmentSum(firestore);
```

**Funciones principales:**
- `addPayment()` - Crear nuevo pago con validaciones
- `generateInstallments()` - Generar cuotas automáticamente
- `processPaymentTransaction()` - Procesar pago en transacción atómica
- `getCurrentMonthInstallmentSum()` - Suma de cuotas del mes

**Casos de uso:**
- Pagos únicos y en cuotas
- Transacciones atómicas
- Cálculos financieros avanzados

### 👥 Gestión de Clientes (clientService)
```typescript
// ✅ PATRÓN ESTABLECIDO - CRUD optimizado de clientes
import { addClient, getClientById, updateClient, getClients } from '@/services/clientService';

// CRUD con validaciones automáticas
const clientId = await addClient(firestore, {
  name: "Cliente Ejemplo",
  email: "cliente@email.com",
  phone: "+34666777888"
});

const client = await getClientById(firestore, clientId);
const allClients = await getClients(firestore);
```

**Funciones principales:**
- `addClient()` - Crear nuevo cliente
- `getClientById()` - Obtener cliente específico
- `updateClient()` - Actualizar información de cliente
- `getClients()` - Obtener todos los clientes activos

**Casos de uso:**
- Gestión completa de información de clientes
- Validación de integridad de datos
- Integración con proyectos

### 📅 Eventos de Calendario (calendarEventService)
```typescript
// ✅ PATRÓN ESTABLECIDO - Conversión automática de eventos
import {
  convertProjectEventToCalendarEvent,
  getCalendarEventsInRange,
  searchCalendarEvents
} from '@/services/calendarEventService';

// Conversión automática para calendario
const calendarEvent = convertProjectEventToCalendarEvent(projectEvent, project);
const monthEvents = await getCalendarEventsInRange(firestore, startDate, endDate);
const searchResults = await searchCalendarEvents(firestore, "instalación");
```

**Funciones principales:**
- `convertProjectEventToCalendarEvent()` - Conversión automática de eventos
- `getCalendarEventsInRange()` - Búsqueda por rango de fechas
- `searchCalendarEvents()` - Búsqueda por texto

**Casos de uso:**
- Integración con sistema de calendario
- Búsquedas optimizadas por fechas
- Conversión automática de eventos de proyecto

### 🔄 Sincronización de Clientes (clientSyncService)
```typescript
// ✅ PATRÓN ESTABLECIDO - Sincronización automática
import {
  syncProjectClientNames,
  getProjectClientSyncStats,
  syncSingleProjectClientName
} from '@/services/clientSyncService';

// Sincronización masiva y estadísticas
await syncProjectClientNames(firestore);
const stats = await getProjectClientSyncStats(firestore);

// Sincronización específica
await syncSingleProjectClientName(firestore, projectId);
```

**Funciones principales:**
- `syncProjectClientNames()` - Sincronización masiva de nombres
- `getProjectClientSyncStats()` - Estadísticas de sincronización
- `syncSingleProjectClientName()` - Sincronización específica

**Casos de uso:**
- Corrección automática de inconsistencias
- Mantenimiento de integridad referencial
- Monitoreo de sincronización

### 🏷️ Sistema de Tags con Metadata Visual (uninstallTagService)
```typescript
// ✅ PATRÓN ESTABLECIDO - Tags con colores y metadata visual
import {
  createUninstallTag,
  getUninstallTags,
  updateUninstallTag,
  deleteUninstallTag
} from '@/services/uninstallTagService';
import { TAG_COLOR_MAP, AVAILABLE_TAG_COLORS } from '@/types/tags';

// Crear tag con color visual
const tagId = await createUninstallTag("Pendiente", "yellow");

// Obtener todas las tags con información visual completa
const tags = await getUninstallTags();

// Actualizar tag con nuevo color
await updateUninstallTag(tagId, {
  name: "Completado",
  color: "complete"
});

// Sistema de colores predefinidos con mapeo CSS
const colorClasses = TAG_COLOR_MAP["yellow"];
// Resultado: { bg: 'bg-[hsl(var(--yellow))]', text: 'text-[hsl(var(--yellow-foreground))]', border: 'border-[hsl(var(--yellow))]' }

// Colores disponibles para UI
const availableColors = AVAILABLE_TAG_COLORS;
// [{ color: 'yellow', label: 'Amarillo' }, { color: 'sky', label: 'Azul Cielo' }, ...]
```

**Funciones principales:**
- `createUninstallTag()` - Crear tag con color y validación
- `getUninstallTags()` - Obtener tags ordenadas por fecha
- `updateUninstallTag()` - Actualizar nombre y/o color
- `deleteUninstallTag()` - Eliminar tag específica

**Casos de uso:**
- Sistema de etiquetado visual para procesos
- Gestión de estados con colores predefinidos
- UI components con metadata visual consistente

**Patrón único:**
- **Metadata visual**: Primer servicio con sistema de colores predefinidos
- **Validación de entrada**: `name.trim()` automática
- **Integración CSS**: Mapeo directo a variables de diseño
- **Ordenamiento temporal**: `orderBy('createdAt', 'desc')` por defecto

### 🏗️ Patrones Comunes en Servicios
```typescript
// ✅ PATRÓN OBLIGATORIO - Usar utilidades centralizadas
import {
  docSnapshotToEntity,
  docSnapshotsToEntities,
  prepareDataForFirestore,
  timestampToDate
} from '@/utils/firestore-helpers';

// ✅ PATRÓN - Estructura estándar de servicio
export const operacionService = async (
  firestore: Firestore,
  parametros: TipoParam
): Promise<TipoReturn> => {
  try {
    // Validaciones de entrada
    validateInput(parametros);

    // Preparar datos para Firestore
    const data = prepareDataForFirestore(parametros);

    // Operación Firebase
    const result = await firestore.operation(data);

    // Conversión de respuesta
    return docSnapshotsToEntities(result, convertFunction);
  } catch (error) {
    logger.error('Error en operación:', error);
    throw error;
  }
};
```

## 🔥 Servicios Firebase (Patrón Establecido)

### Utilidades Centralizadas Obligatorias
```typescript
// ✅ USAR SIEMPRE - Utilidades centralizadas
import { 
  docSnapshotToEntity,
  docSnapshotsToEntities,
  prepareDataForFirestore,
  timestampToDate 
} from '@/utils/firestore-helpers';
```

### Patrón de Servicios Firebase
```typescript
// ✅ PATRÓN ESTÁNDAR para servicios
export const operacion = async (
  firestore: Firestore, 
  parametros: TipoParam
): Promise<TipoReturn> => {
  // Usar utilidades centralizadas
  return docSnapshotsToEntities(docs, convertDocument);
};
```

### Colecciones Principales
```typescript
// Colecciones establecidas en Firestore
const COLLECTIONS = {
  projects: 'projects',           // Proyectos principales
  projectEvents: 'projectEvents', // Eventos específicos de proyecto
  clients: 'clients',             // Información clientes con auto-sync
  payments: 'payments',           // Pagos asociados a proyectos
  afterSales: 'afterSales'        // Servicios postventa
} as const;
```

## 🗺️ Google Places Integration (ACTUALIZADO)

### PlacesServiceAdapter (Nueva Implementación)
```typescript
// ✅ NUEVO PATRÓN - PlacesServiceAdapter personalizado
import { PlacesServiceAdapter } from '@/lib/places/PlacesServiceAdapter';

// Uso recomendado
const placesService = new PlacesServiceAdapter({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  useModernAPI: true
});
```

### Hook Personalizado para Places
```typescript
// ✅ Hook disponible en el proyecto
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

// En componentes
const { suggestions, loading, fetchSuggestions } = useGooglePlaces({
  sessionToken: true,
  region: 'es'
});
```

## 📋 Componentes y Formularios

### Patrón Compound Component
```typescript
// ✅ PATRÓN ESTABLECIDO - Compound Component Pattern
// Ejemplo: ProjectFormCompound
const ProjectForm = {
  Container: ProjectFormContainer,
  Section: ProjectFormSection,
  Field: ProjectFormField
};
```

### Formularios con React Hook Form + Zod
```typescript
// ✅ PATRÓN OBLIGATORIO para formularios
const form = useForm<SchemaType>({
  resolver: zodResolver(schema),
  defaultValues: { /* valores iniciales */ }
});

// Validación numérica estándar
const numericValue = parseInt(value) || 0;
const floatValue = parseFloat(value) || 0;
```

### Manejo de Errores Estándar
```typescript
// ✅ PATRÓN para manejo de errores
try {
  // Operación
} catch (error) {
  useToast({
    title: "Error",
    description: error.message || "Error inesperado",
    variant: "destructive"
  });
}
```

## 🎨 UI Components (Shadcn/ui)

### Importaciones Estándar
```typescript
// ✅ USAR SIEMPRE - Componentes Shadcn existentes
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

// ❌ EVITAR - Crear componentes UI desde cero
```

### Clases Condicionales
```typescript
// ✅ Usar clsx o cn para clases condicionales
import { cn } from "@/lib/utils";

const className = cn(
  "base-classes",
  condition && "conditional-class",
  variant === "primary" && "primary-classes"
);
```

## 🎨 CSS y Styling Patterns (Anti-Hardcodeo)

### 🏆 Regla de Estilos Anti-Hardcodeo (CRÍTICO)

**Protocolo de Selección de Estilos:**

1. **Colores:** SIEMPRE usar tokens desde `@/app/globals.css` o `@tailwind.config.ts`
   - Tokens disponibles: `primary`, `secondary`, `muted`, `accent`, `destructive`
   - Custom: `yellow`, `sky`, `orange`, `brown`, `complete`, `purple`

2. **Criterio de duplicación:** Si usas el mismo valor 2+ veces → debe ir al sistema de diseño

3. **Excepciones permitidas:** Valores únicos para componentes específicos (ej: `max-w-[450px]` para modal)

4. **Verificación obligatoria:**
   ```bash
   # Antes de implementar, verificar hardcodeo prohibido:
   rg "bg-gray|text-gray|border-gray" src/ -g "*.tsx"
   ```

### ✅ Patrones Recomendados
```typescript
// ✅ CORRECTO - Usar tokens del sistema
className="bg-primary text-primary-foreground"
className="bg-muted text-muted-foreground"
className="border-border bg-background"

// ✅ CORRECTO - Usar cn() para clases condicionales
const className = cn(
  "bg-primary text-primary-foreground",
  isDisabled && "bg-muted text-muted-foreground"
);
```

### ❌ Anti-Patrones Prohibidos
```typescript
// ❌ NUNCA - Hardcodear colores directos
className="bg-gray-50"              // → usar "bg-muted"
className="text-gray-800"            // → usar "text-muted-foreground"
className="border-gray-300"          // → usar "border-border"

// ❌ NUNCA - Valores arbitrarios innecesarios para tokens existentes
className="bg-[hsl(var(--primary))]"   // → usar "bg-primary"

// ❌ NUNCA - Estilos inline
style={{ backgroundColor: '#3b82f6' }}  // → usar className
```

## 🔧 Hooks Personalizados

### Patrones de Hooks Establecidos
```typescript
// Hook para operaciones Firebase
const useFirebaseOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const execute = async (operation: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return { execute, loading, error };
};
```

## 🏗️ Modal-Form Integration Pattern (ACTUALIZADO)

### Problema de Duplicación Resuelto
```typescript
// ❌ EVITAR - Duplicación de botones (PROBLEMA IDENTIFICADO)
<ModalLayout showDefaultButtons={true}>
  <ProjectForm showDefaultButtons={true} /> {/* DUPLICACIÓN */}
</ModalLayout>

// ✅ USAR - Modal-Controlled Pattern (SOLUCIÓN IMPLEMENTADA)
<ModalLayout formId="project-form" submitButtonText="Crear Proyecto">
  <ProjectForm formId="project-form" showDefaultButtons={false} />
</ModalLayout>
```

### Patrón Estándar para Modales
```typescript
// ✅ PATRÓN OBLIGATORIO para nuevos modales
export function NewEntityDialog() {
  return (
    <ModalLayout
      formId="new-entity-form"           // ← ID único
      title="Nueva Entidad"
      submitButtonText="Crear Entidad"
    >
      <EntityForm
        formId="new-entity-form"          // ← Mismo ID
        showDefaultButtons={false}       // ← Sin duplicación
        onSubmit={handleCreate}
      />
    </ModalLayout>
  );
}
```

### Formularios Optimizados para Modales
```typescript
// ✅ PATRÓN para formularios reutilizables
export function EntityForm({
  formId = 'entity-form',
  showDefaultButtons = false,        // ← Default false para modales
  // ... otras props
}: EntityFormProps) {
  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        {/* Campos del formulario */}

        {/* Botones solo cuando se requieren */}
        {showDefaultButtons && (
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {submitButtonText}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
```

### Casos de Uso Específicos
```typescript
// ✅ Modal simple (caso más común)
<ModalLayout formId="simple-form">
  <SimpleForm formId="simple-form" showDefaultButtons={false} />
</ModalLayout>

// ✅ Formulario standalone (en páginas)
<SimpleForm showDefaultButtons={true} />

// ✅ Modal complejo (casos especiales)
<ModalLayout buttonStrategy="none">
  <CustomContent />
  <CustomButtons />
</ModalLayout>
```

### Documentación Técnica Completa
- **Arquitectura detallada:** [modal-architecture.md](../../docs/technical/modal-architecture.md)
- **Plan de implementación:** [modal-refactoring-plan.md](../../docs/technical/modal-refactoring-plan.md)

## 🧪 Testing Patterns

**Para patrones completos de testing:** [testing.md](../workflow/testing.md)

**Principios básicos:** `getByRole` > `getByText` > `getByTestId`

## 📊 Feature Flags System

### Configuración de Features (DISPONIBLE)
```typescript
// ✅ Sistema de feature flags implementado
import { featureFlags } from '@/lib/config/featureFlags';

// Uso en componentes
if (featureFlags.useNewProjectEventForm) {
  return <NewProjectEventModalV2 />;
}
```

## 🚫 Anti-Patrones (EVITAR)

### ❌ Patrones Deprecados o Prohibidos
```typescript
// ❌ NO USAR - APIs deprecadas
import { useReactGoogleAutocomplete } from 'react-google-autocomplete'; // ELIMINADO
import { usePlacesAutocomplete } from 'use-places-autocomplete'; // ELIMINADO

// ❌ NO USAR - Console.logs en producción
console.log('debug info'); // Solo permitido en logger.ts

// ❌ NO USAR - Valores mágicos
const MAGIC_NUMBER = 42; // Usar constants/ en su lugar

// ❌ NO USAR - Funciones largas
function longFunction() {
  // Más de 40 líneas - DIVIDIR
}
```

### ✅ Alternativas Recomendadas
```typescript
// ✅ En lugar de console.log
import { logger } from '@/lib/logger';
logger.info('Información relevante');

// ✅ En lugar de valores mágicos
import { PROJECT_STATUS } from '@/constants/projects';

// ✅ En lugar de funciones largas
const processData = (data) => {
  const validated = validateData(data);
  const transformed = transformData(validated);  
  return saveData(transformed);
};
```