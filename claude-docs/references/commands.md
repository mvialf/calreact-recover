# 📋 Comandos de Desarrollo - CalReact

## 🔧 Desarrollo Principal

### Servidor de Desarrollo
```bash
npm run dev         # Turbopack - Puerto 3002 (RECOMENDADO)
npm run dev:webpack # Webpack - Puerto 3001 (Alternativo)
```

### Build y Producción
```bash
npm run build       # Construir aplicación para producción
npm run start       # Iniciar servidor de producción
```

### Validación de Código (CRÍTICO)
```bash
npm run lint        # ESLint - OBLIGATORIO después de cambios
npm run typecheck   # TypeScript - OBLIGATORIO después de cambios
```

## 🧪 Testing

**Para información completa de testing:** [testing.md](../workflow/testing.md)

### Comandos Básicos de Testing
```bash
npm test              # Watch mode - tests unitarios  
npm run test:ci       # CI mode - tests unitarios
npm run test:e2e      # Tests E2E con Playwright
```

## 🔧 Scripts de Sincronización y Mantenimiento

### Sincronización de Datos
```bash
# Sincronización de nombres de clientes
npx tsx scripts/sync-client-names.ts

# Test completo de eventos de proyecto
npx tsx scripts/test-project-events.ts
```

### Migración de Datos
```bash
# Script de migración de eventos (disponible)
npx tsx scripts/migrate-events-to-lean.ts
```

## ⚙️ Configuraciones Específicas

### Puertos de Desarrollo
- **3002**: Turbopack (por defecto y recomendado)
- **3001**: Webpack (alternativo)

### Variables de Entorno Requeridas
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  # Obligatoria para funcionalidad de mapas
```

## 🔄 Flujo de Trabajo Recomendado

### 1. Inicio de Desarrollo
```bash
npm run dev  # Iniciar servidor
```

### 2. Después de Cada Cambio (OBLIGATORIO)
```bash
npm run lint && npm run typecheck
```

### 3. Antes de Commit
```bash
npm run test:ci      # Opcional: verificar tests
npm run build        # Opcional: verificar build
```

### 4. Testing Completo
```bash
npm run test:coverage && npm run test:e2e
```