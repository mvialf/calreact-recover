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

### 🗄️ Sistema de Cache Inteligente
```typescript
// ✅ IMPLEMENTADO - Sistema de cache para eventos de proyecto (EN USO)
import { projectCacheService } from '@/services/cache/projectCacheService';
import { eventEnrichmentService } from '@/services/eventEnrichmentService';
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