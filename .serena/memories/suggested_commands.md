# Comandos Esenciales para Desarrollo

## Comandos de Desarrollo Principal
```bash
# Desarrollo
npm run dev              # Servidor desarrollo con Turbopack (puerto 3002)
npm run dev:webpack      # Servidor desarrollo con Webpack (puerto 3001)
npm run build           # Construir para producción
npm run start           # Iniciar servidor producción

# Calidad de Código
npm run lint            # Ejecutar ESLint
npm run typecheck       # Verificación de tipos TypeScript
```

## Comandos de Testing
```bash
# Testing Principal
npm test                # Tests en modo observación
npm run test:ci         # Tests en modo CI (sin observación)
npm run test:coverage   # Tests con reporte de cobertura
npm run test:all        # Ejecutar todas las pruebas

# Testing Específico
npm run test:types      # Verificación de tipos para tests
npm run test:lint       # Lint solo archivos de test
npm run test:debug      # Debug de tests con inspector
npm run test:watch-types # Watch mode para tipos de test
```

## Scripts Especializados del Proyecto
```bash
# Sincronización de datos
npx tsx scripts/sync-client-names.ts     # Sincronizar nombres de clientes
npx tsx scripts/test-project-events.ts   # Test completo eventos de proyecto

# Debug y desarrollo
npx tsx scripts/debug-calendar-events.ts # Debug eventos calendario
npx tsx scripts/test-calendar-integration.ts # Test integración calendario
```

## Comandos del Sistema (Linux)
```bash
# Navegación y archivos
ls -la                  # Listar archivos detallado
find . -name "*.ts"     # Buscar archivos TypeScript
grep -r "pattern" src/  # Buscar patrones en código

# Git
git status             # Estado del repositorio
git add .              # Agregar cambios
git commit -m "msg"    # Commit con mensaje
git push               # Subir cambios
```

## Comandos Post-Tarea (Obligatorios)
**SIEMPRE ejecutar después de completar una tarea:**
1. `npm run typecheck` - Verificar tipos
2. `npm run lint` - Verificar estilo de código
3. `npm run test:ci` - Ejecutar tests (opcional según la tarea)