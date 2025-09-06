# Cobralon-FB - Descripción General del Proyecto

## Propósito del Proyecto
Cobralon-FB es una aplicación Next.js construida con Firebase para servicios backend. Es un sistema de gestión de proyectos especializado para manejar clientes, proyectos, pagos, visitas y servicios postventa.

## Stack Tecnológico Principal

### Frontend
- **Next.js 15** con App Router (React 18, TypeScript)
- **Framework UI**: Tailwind CSS con componentes Shadcn/ui
- **Iconos**: Lucide React
- **Tema**: Sistema claro/oscuro con next-themes

### Backend y Base de Datos
- **Firebase**: Firestore (base de datos), Authentication
- **Configuración**: Variables de entorno con validación en tiempo de ejecución

### Gestión de Estado y Formularios
- **Estado Global**: Zustand stores
- **Formularios**: React Hook Form con validación Zod
- **Estado del Servidor**: Firebase Firestore con listeners en tiempo real

### Mapas y Ubicación
- **Google Maps API**: Integración completa para manejo de direcciones
- **Librerías**: @react-google-maps/api, @vis.gl/react-google-maps

### Testing
- **Jest** con React Testing Library
- **Cypress** para tests E2E
- **Cobertura**: Reportes de cobertura configurados

## Dominios de Negocio
1. **Clientes** - Gestión de información de clientes
2. **Proyectos** - Administración de proyectos con eventos específicos
3. **Pagos** - Procesamiento y seguimiento de pagos
4. **Visitas** - Programación y gestión de visitas
5. **Postventa** - Servicios después de la venta

## Características Técnicas Destacadas
- **Arquitectura de Eventos Específicos por Dominio** (Post-refactorización 2025)
- **Inyección de Dependencias** para servicios Firebase
- **Sincronización Automática** de datos de cliente
- **Sistema de Constantes Centralizadas** (Post-auditoría 2025)
- **Utilidades Firestore Reutilizables**
- **Validación Robusta** con prevención de valores NaN