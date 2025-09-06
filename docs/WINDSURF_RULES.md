# Reglas de Windsurf para Desarrollo

Este documento establece las reglas y mejores prácticas para el desarrollo de componentes y funcionalidades en el proyecto, inspiradas en los principios del windsurf: equilibrio, fluidez y adaptabilidad al entorno.

## Tabla de Contenidos
- [Principios Fundamentales](#principios-fundamentales)
- [Estructura de Componentes](#estructura-de-componentes)
- [Manejo de Estado](#manejo-de-estado)
- [Rendimiento](#rendimiento)
- [Accesibilidad](#accesibilidad)
- [Pruebas](#pruebas)
- [Documentación](#documentación)

## Principios Fundamentales

### 1. Equilibrio (Balance)
- **Simplicidad**: Mantén los componentes simples y con una única responsabilidad
- **Consistencia**: Sigue los patrones establecidos en el proyecto
- **Previsibilidad**: El comportamiento del componente debe ser predecible

### 2. Fluidez (Flow)
- **Composición**: Construye interfaces componiendo componentes pequeños
- **Unidireccionalidad**: Los datos deben fluir en una sola dirección
- **Inmutabilidad**: No modifiques directamente el estado, crea nuevas referencias

### 3. Adaptabilidad (Responsive)
- **Diseño adaptable**: Los componentes deben funcionar en todos los tamaños de pantalla
- **Extensibilidad**: Diseña pensando en futuras ampliaciones
- **Flexibilidad**: Los componentes deben ser reutilizables en diferentes contextos

## Estructura de Componentes

### 1. Organización
```
src/
  components/
    ComponentName/
      ComponentName.tsx       # Componente principal
      ComponentName.stories.tsx  # Documentación en Storybook
      ComponentName.test.tsx  # Pruebas unitarias
      index.ts                # Exportación pública
      types.ts               # Tipos específicos
      utils.ts               # Funciones auxiliares
      styles.module.css      # Estilos específicos (si son necesarios)
```

### 2. Convenciones de Nombrado
- **Componentes**: PascalCase (`MiComponente.tsx`)
  - **Obligatorio**: Todos los componentes deben basarse en Radix UI primitives y shadcn/ui
  - **Consistencia**: Mantener la misma apariencia y comportamiento en toda la aplicación
  - **Personalización**: Usar las variables de tema de Tailwind para personalizar cuando sea necesario
- **Hooks**: Prefijo `use` (`useCustomHook.ts`)
- **Utilidades**: camelCase (`miUtilidad.ts`)
- **Tipos**: PascalCase con sufijo `Type` o `Props` (`MiTipoType.ts`)
- **Constantes**: UPPER_SNAKE_CASE

## Manejo de Estado

### 1. Jerarquía de Estado
1. **Estado Local**: `useState` para estado interno del componente
2. **Estado Compartido**: `Zustand` para estado global
3. **Datos Remotos**: `React Query` para datos del servidor

### 2. Reglas de Estado
- **Minimizar el estado**: No guardes en el estado lo que puedas calcular
- **Normalización**: Mantén los datos normalizados
- **Derivación**: Usa `useMemo` para valores derivados
- **Callbacks**: Usa `useCallback` para funciones pasadas a componentes hijos

## Rendimiento

### 1. Optimizaciones
- **Memoización**: Usa `React.memo` para componentes costosos
- **Lazy Loading**: Carga perezosa de rutas y componentes pesados
- **Virtualización**: Para listas largas, usa `react-window` o `react-virtualized`

### 2. Reglas de Renderizado
- **Evita renders innecesarios**: Usa `React.memo` y `useMemo` apropiadamente
- **Fragmentación**: Divide componentes grandes en componentes más pequeños
- **Suspense**: Usa Suspense para cargas asíncronas

## Accesibilidad

### 1. HTML Semántico
- Usa elementos semánticos (`<button>`, `<nav>`, `<main>`, etc.)
- Mantén una jerarquía de encabezados correcta
- Usa ARIA cuando sea necesario pero no abuses

### 2. Navegación por Teclado
- Asegúrate de que todos los elementos interactivos sean accesibles por teclado
- Implementa `tabIndex` y manejo de eventos de teclado
- Sigue el orden lógico de tabulación

## Pruebas

### 1. Cobertura Requerida
- **Mínimo 80%** de cobertura de código
- **100%** para lógica de negocio crítica
- **Pruebas de integración** para flujos de usuario clave

### 2. Enfoque
- **Pruebas de integración** sobre pruebas unitarias
- Mock solo lo necesario
- Prueba comportamientos, no implementaciones

## Documentación

### 1. Documentación de Componentes
- Propiedades (Props) y sus tipos
- Ejemplos de uso
- Estados posibles
- Requisitos de accesibilidad

### 2. Comentarios en Código
- Explica el "por qué", no el "qué"
- Documenta decisiones de diseño complejas
- Incluye ejemplos para funciones complejas

## Convenciones de Código

### 1. Estilo
- Usa Prettier y ESLint
- Sigue las guías de estilo de React
- Máximo 100 caracteres por línea

### 2. Tipado
- Usa TypeScript en todo el código
- Evita `any` - usa tipos específicos
- Tipa las props de los componentes

## Flujo de Trabajo

### 1. Desarrollo de Características
1. Crea una rama descriptiva
2. Desarrolla en pequeños incrementos
3. Haz commits atómicos
4. Actualiza la documentación
5. Abre un Pull Request

### 2. Revisión de Código
- Al menos un revisor aprobador
- Pruebas automatizadas deben pasar
- Cobertura de código debe mantenerse o mejorar
- Documentación actualizada

## Recursos

### Herramientas Recomendadas
- **ESLint**: Para análisis estático
- **Prettier**: Para formato de código
- **React DevTools**: Para depuración
- **React Query DevTools**: Para depuración de consultas

### Referencias
- [Documentación de React](https://reactjs.org/docs/getting-started.html)
- [Patrones de Diseño de React](https://reactpatterns.com/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)

---

**Última actualización**: Febrero 2025  
**Versión**: 1.0.0
