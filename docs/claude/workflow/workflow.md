# 🔄 Flujo de Trabajo y Validación - CalReact

## 🚨 Validación Obligatoria de Código (CRÍTICO)

### ⚡ EXTREMADAMENTE IMPORTANTE - Cada Modificación

**SIEMPRE ejecutar después de cualquier cambio en el código:**

```bash
npm run lint        # Verificar calidad de código ESLint
npm run typecheck   # Verificar tipos TypeScript  
```

**Este paso es CRÍTICO y NUNCA debe omitirse**

### 🔧 Comandos Complementarios (Opcionales)
```bash
npm run build       # Verificar build exitoso (recomendado)
npm run test:ci     # Ejecutar tests (opcional)
```

## 🎯 Filosofía de Testing

**Para información completa de testing:** [@docs/claude-reference/testing.md](./testing.md)

**Filosofía principal:** Test-As-You-Go con Playwright E2E integration

## 📋 Flujo de Desarrollo Completo

### 1. 🚀 Inicio de Sesión de Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev  # Puerto 3002 (Turbopack - recomendado)

# O alternativo
npm run dev:webpack  # Puerto 3001 (Webpack)
```

### 2. 🔄 Durante el Desarrollo (Obligatorio)

**Por cada cambio en el código:**
```bash
# OBLIGATORIO - Validación inmediata
npm run lint && npm run typecheck
```

**Si hay errores:**
- Corregir TODOS los errores detectados antes de continuar
- No proceder hasta que ambos comandos pasen sin errores

### 3. 🧪 Antes de Commit (Recomendado)
```bash
# Verificar tests (si existen)
npm run test:ci

# Verificar build exitoso 
npm run build

# Testing opcional (ver testing.md)
npm run test:coverage
```

### 4. 📝 Commits en Español
```bash
# ✅ Mensajes descriptivos en español
git commit -m "feat: Implementar sistema cache inteligente para eventos"
git commit -m "fix: Corregir errores validación formulario proyecto"
git commit -m "refactor: Optimizar PlacesServiceAdapter con nuevas APIs"
```

## 🎯 Principios de Calidad de Código

### Lectura de Archivos Específicos
- **Preferir lectura targeted** antes que exploración general
- Usar herramientas de búsqueda específicas (`grep`, `find`) cuando se conoce el objetivo
- Evitar lectura masiva innecesaria de archivos

### Validación de Existencia (DRY)
```typescript
// ✅ ANTES de crear nueva funcionalidad:
// 1. Buscar en /src/utils/
// 2. Buscar en /src/lib/
// 3. Buscar en /src/hooks/
// 4. Buscar en /src/services/
// 5. Solo entonces crear nueva
```

### Máximos de Funciones
```typescript
// ✅ Máximo 40 líneas por función
const processData = (data: DataType) => {
  // Máximo 40 líneas
  // Si es más largo, dividir en funciones más pequeñas
};
```

## 🔧 Configuración de Entorno

### Variables de Entorno Requeridas
```bash
# Google Maps API (obligatoria)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# Firebase (para producción)
FIREBASE_PROJECT_ID=proyecto-id
FIREBASE_CLIENT_EMAIL=email@proyecto.iam.gserviceaccount.com
```

### Puertos de Desarrollo
- **3002**: Turbopack (por defecto, más rápido)
- **3001**: Webpack (alternativo, más compatible)

### Build Configuration
- **TypeScript errors**: Ignorados en build de producción (configurado)
- **ESLint errors**: Ignorados en build de producción (configurado)
- **Turbopack**: Habilitado por defecto para desarrollo

## 📊 Métricas de Calidad (Estado Actual)

### ✅ Métricas Verificadas
```bash
✅ React Hooks errors: 0 (20 errores resueltos)
✅ Console.logs: 0 en producción (solo 8 en logger.ts oficial)  
✅ TypeScript errors: 0
✅ ESLint críticos: 0
✅ Build status: Exitoso
✅ Test coverage: >70% en código nuevo
✅ TODOs pendientes: 0 en servicios críticos
```

## 🚫 Flujo de NO-Commits Automáticos

### Política de Commits
- **NO commitear automáticamente** a menos que el usuario lo pida explícitamente
- Siempre preguntar antes de hacer commit
- Solo hacer commit cuando se solicite directamente

### Git Best Practices
```bash
# ✅ Verificar estado antes de commit
git status
git diff

# ✅ Commits descriptivos y atómicos
git add src/specific/file.ts  # No git add .
git commit -m "feat: Descripción específica del cambio"
```

## 🔍 Debugging y Resolución de Problemas

### Para Claude Code
- **Consultar documentación local SIEMPRE**: `/docs`
- **Antes de especular**: Usar herramientas de documentación
- **Contexto específico**: Proporcionar información relevante del error

### Para Dependencias y APIs
- **Context7**: Utilizar servidor MCP para documentación actualizada
- **Bibliotecas**: Consultar documentación oficial antes de implementar
- **Patrones**: Seguir los establecidos en `/docs/claude-reference/patterns.md`

## 🎯 Optimización de Workflow

### Comandos Frecuentes (Alias Recomendados)
```bash
# En tu ~/.bashrc o ~/.zshrc
alias dev="npm run dev"
alias check="npm run lint && npm run typecheck"
alias test="npm run test:ci"
alias build="npm run build"
```

### Scripts de Sincronización
```bash
# Sincronización de datos específicos
npx tsx scripts/sync-client-names.ts

# Testing de sistema (ver testing.md)
npx tsx scripts/test-project-events.ts
```

## 📚 Recursos de Consulta

### Documentación Interna (Consulta Obligatoria)
- **Estado del proyecto**: `/docs/refactorizacion/REFACTORING_STATUS.md`
- **Detalles técnicos**: `/docs/refactorizacion/REFACTORING_TECHNICAL.md`
- **Migración Google Places**: `/docs/google-places-migration/`

### Herramientas de Desarrollo
- **Claude Code**: `/docs` para cualquier duda
- **Context7**: Para documentación de bibliotecas externas
- **Testing**: Ver [`@docs/claude-reference/testing.md`](./testing.md)