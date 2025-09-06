# Convenciones y Estilo de Código

## Principios Fundamentales (SOLID, DRY, KISS, YAGNI)

### Responsabilidad Única y Simplicidad
- Cada componente y función debe tener una sola responsabilidad
- Mantener la simplicidad en el diseño e implementación
- Evitar la sobreingeniería

### No te Repitas (DRY) - OBLIGATORIO
- **Duplicación de código está PROHIBIDA**
- Antes de crear algo nuevo, verificar si ya existe
- Priorizar reutilización máxima de componentes, hooks y utilidades

## Estructura de Archivos Obligatoria

### Lógica
- `src/utils/`: Funciones puras, helpers (format, validation)
- `src/lib/`: Lógica de negocio central (api, auth)
- `src/hooks/`: Custom Hooks de React
- `src/services/`: Integración con APIs de terceros

### Constantes (Post-Auditoría 2025)
- `src/constants/`: **Centraliza todos los datos estáticos**
- **PROHIBIDO**: Valores mágicos (strings, números) en componentes
- Archivos específicos: `project.ts`, `payment.ts`, `firebase.ts`, `defaults.ts`

## Implementación TypeScript/React

### Nomenclatura
- **Manejadores de eventos**: Prefijo `handle` (ej. `handleClick`)
- **Variables y funciones**: Descriptivas en `camelCase`
- **Componentes**: PascalCase

### Componentes React
```typescript
type MiComponenteProps = {
  // props tipadas
};

export const MiComponente: React.FC<MiComponenteProps> = ({ /* props */ }) => {
  // Retornos anticipados para reducir anidamiento
  if (condición) return <div>Early return</div>;
  
  return (
    // JSX
  );
};
```

### Patrones Obligatorios
- **Retornos Anticipados**: Usar siempre para reducir anidamiento
- **Clases Condicionales**: `clsx` o `tailwind-merge` para clases dinámicas
- **Accesibilidad**: HTML semántico + atributos `aria-*`, `role`, `tabIndex`

## Estilos TailwindCSS
- **Fuente de Verdad**: Solo `tailwind.config.ts`
- **PROHIBIDO**: Valores hardcodeados en `className` o `style`
- **Sistema de Tokens**: Usar variables CSS definidas en configuración

## Servicios Firebase (Arquitectura Post-Auditoría)

### Requisitos Obligatorios
- Aceptar instancia Firestore como primer parámetro
- Usar utilidades de `src/utils/firestore-helpers.ts`
- Implementar conversión con `timestampToDate()`
- Incluir manejo adecuado de errores
- Validación con tipos TypeScript

### Validación Numérica Robusta
```typescript
// Prevenir valores NaN
const numericValue = parseInt(value) || 0;
const floatValue = parseFloat(value) || 0;

// En esquemas Zod
z.number().default(0)
```

## Arquitectura de Eventos (Enero 2025)
- **USAR**: Eventos específicos por dominio (`projectEventService.ts`)
- **NO USAR**: Sistema general de eventos (deprecated)
- **Sincronización**: Aprovechar auto-sync de datos cliente

## Idioma
- **Todo el código, comentarios y documentación**: Exclusivamente en español
- **Nomenclatura**: Inglés para nombres técnicos, español para lógica de negocio