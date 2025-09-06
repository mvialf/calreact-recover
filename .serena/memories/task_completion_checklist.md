# Lista de Verificación Post-Tarea

## Comandos Obligatorios (Ejecutar SIEMPRE)

### 1. Verificación de Tipos TypeScript
```bash
npm run typecheck
```
**Propósito**: Asegurar que no hay errores de tipado
**Acción si falla**: Corregir errores antes de continuar

### 2. Verificación de Estilo de Código
```bash
npm run lint
```
**Propósito**: Verificar adherencia a estándares de código
**Acción si falla**: Corregir warnings/errores de ESLint

### 3. Tests (Opcional según la tarea)
```bash
npm run test:ci
```
**Cuándo ejecutar**: Si la tarea modifica lógica de negocio o componentes críticos
**Acción si falla**: Corregir tests fallidos o actualizar si es necesario

## Verificaciones Manuales

### Arquitectura y Patrones
- [ ] ¿Se siguió la arquitectura de eventos específicos por dominio?
- [ ] ¿Se evitó duplicación de código (DRY)?
- [ ] ¿Se usaron las constantes centralizadas en lugar de valores mágicos?
- [ ] ¿Se aplicaron los principios SOLID, KISS, YAGNI?

### Servicios Firebase
- [ ] ¿Los servicios aceptan instancia Firestore como parámetro?
- [ ] ¿Se usaron utilidades de `firestore-helpers.ts`?
- [ ] ¿Se implementó manejo adecuado de errores?
- [ ] ¿Se aplicó validación robusta para prevenir valores NaN?

### Componentes React
- [ ] ¿Se siguieron las convenciones de nomenclatura?
- [ ] ¿Se implementó accesibilidad apropiada?
- [ ] ¿Se usaron patrones de retorno anticipado?
- [ ] ¿Los estilos provienen exclusivamente de Tailwind config?

### Formularios y Validación
- [ ] ¿Se usó React Hook Form con esquemas Zod?
- [ ] ¿Se implementó validación numérica robusta?
- [ ] ¿Se siguieron patrones consistentes de manejo de errores?

## Acciones Específicas por Tipo de Tarea

### Nuevos Componentes
- [ ] Crear en estructura correcta de directorios
- [ ] Seguir patrones existentes de componentes similares
- [ ] Incluir tipos TypeScript para todas las props
- [ ] Implementar características de accesibilidad

### Nuevos Servicios
- [ ] Seguir patrón de inyección de dependencias
- [ ] Usar utilidades centralizadas
- [ ] Incluir tests unitarios si es crítico
- [ ] Documentar API en JSDoc si es complejo

### Modificaciones de Estado
- [ ] Verificar impacto en sincronización automática
- [ ] Validar que no se rompan referencias existentes
- [ ] Probar flujos de datos críticos

## Notas Importantes
- **NO crear archivos de documentación** a menos que se solicite explícitamente
- **Priorizar edición** sobre creación de nuevos archivos
- **Seguir idioma**: Código y comentarios en español