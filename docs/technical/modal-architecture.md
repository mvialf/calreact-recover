# 🏗️ Arquitectura de Modales - CalReact

**Versión:** 1.0
**Fecha:** Septiembre 2025
**Autor:** Equipo de Desarrollo CalReact

## 📋 Resumen Ejecutivo

Esta documentación define la arquitectura estandarizada para componentes modales en CalReact, resolviendo el problema de duplicación de botones entre modales y formularios, mientras establece mejores prácticas para la integración Modal-Form.

## 🚨 Problema Identificado

### Duplicación Actual de Botones

**Antes - Código con Duplicación:**

```typescript
// ❌ PROBLEMÁTICO - Duplicación activa en NewProjectDialog.tsx
<ModalLayout
  showDefaultButtons={true}
  submitButtonText="Crear Proyecto"
  formRef={formRef}
>
  <ProjectForm
    showDefaultButtons={true} // ← DUPLICACIÓN
    onSubmit={handleSubmit}
  />
</ModalLayout>
```

**Resultado visual:** Dos sets de botones renderizados simultáneamente
- Footer del modal: "Cancelar" + "Crear Proyecto"
- Dentro del formulario: "Guardar" adicional

### Impacto del Problema

1. **UX Confusa:** Usuarios ven múltiples botones con propósito similar
2. **Código Duplicado:** Lógica de submit repetida en 2 lugares
3. **Mantenimiento:** Cambios requieren actualizar múltiples ubicaciones
4. **Inconsistencia:** Diferentes modales manejan botones de manera distinta

## 🎯 Arquitectura Propuesta

### Modal-Controlled Pattern (Recomendado)

**Principio:** El modal controla toda la navegación, el formulario solo maneja datos y validación.

```typescript
// ✅ SOLUCIÓN - Modal-Controlled Pattern
<ModalLayout
  formId="project-form"          // ← Conecta con formulario
  submitButtonText="Crear Proyecto"
  showDefaultButtons={true}       // ← Modal controla botones
>
  <ProjectForm
    formId="project-form"         // ← Mismo ID para conexión
    showDefaultButtons={false}    // ← Sin botones duplicados
    onSubmit={handleSubmit}
  />
</ModalLayout>
```

### Flujo de Interacción

```mermaid
graph TD
    A[Usuario hace clic en Submit] --> B[Modal captura evento]
    B --> C[Modal busca form por formId]
    C --> D[Modal ejecuta form.requestSubmit()]
    D --> E[Form ejecuta validación Zod]
    E --> F[Form ejecuta onSubmit]
    F --> G[Datos se procesan]
    G --> H[Modal se cierra]
```

## 🔧 Especificación Técnica

### ModalLayout Interface Actualizada

```typescript
export interface ModalLayoutProps {
  // Props existentes...

  /**
   * ID único del formulario interno para submit externo
   * @example "project-form", "edit-client-form"
   */
  formId?: string;

  /**
   * Estrategia para manejo de botones
   * @default "modal-only"
   */
  buttonStrategy?: 'modal-only' | 'form-only' | 'none';
}
```

### Implementación del Submit Inteligente

```typescript
// Lógica de submit unificada en ModalLayout
const handleSubmit = () => {
  // 1. Prioridad: formId (nueva estrategia)
  if (formId) {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (form) {
      form.requestSubmit(); // ✅ Triggerea validación React Hook Form
      return;
    }
  }

  // 2. Fallback: formRef (compatibilidad)
  if (formRef?.current) {
    formRef.current.requestSubmit();
    return;
  }

  // 3. Fallback: onSubmit directo
  if (onSubmit) {
    onSubmit();
  }
};
```

### Formulario Limpio (Sin Botones)

```typescript
// Formulario optimizado para uso en modales
export function ProjectFormClean({
  formId = 'modal-form',
  showDefaultButtons = false, // ← Default false
  ...props
}: ProjectFormProps) {
  return (
    <Form {...form}>
      <form
        id={formId}  // ← Conecta con modal
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Todos los campos del formulario */}

        {/* Botones solo si se requieren explícitamente */}
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

## 🎨 Patrones de Uso

### Caso 1: Modal Simple (Recomendado)

```typescript
// ✅ Patrón estándar para la mayoría de casos
function NewProjectDialog() {
  return (
    <ModalLayout
      formId="new-project-form"
      title="Nuevo Proyecto"
      submitButtonText="Crear Proyecto"
    >
      <ProjectForm
        formId="new-project-form"
        showDefaultButtons={false}
        onSubmit={handleCreateProject}
      />
    </ModalLayout>
  );
}
```

### Caso 2: Modal Complejo (Casos Especiales)

```typescript
// ✅ Para modales con múltiples formularios o lógica especial
function ComplexDialog() {
  return (
    <ModalLayout buttonStrategy="none">
      <div className="space-y-4">
        <ProjectForm formId="project-section" />
        <ClientForm formId="client-section" />

        {/* Botones personalizados */}
        <div className="flex justify-between">
          <Button onClick={handleSaveDraft}>Guardar Borrador</Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitAll}>
              Crear Todo
            </Button>
          </div>
        </div>
      </div>
    </ModalLayout>
  );
}
```

### Caso 3: Formulario Standalone (Sin Modal)

```typescript
// ✅ Formulario reutilizable fuera de modales
function ProjectPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Nuevo Proyecto</h1>
      <ProjectForm
        showDefaultButtons={true}  // ← Mostrar botones en página
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
```

## 📏 Principios de Diseño

### 1. Separación de Responsabilidades

| Componente | Responsabilidad |
|------------|----------------|
| **Modal** | Navegación, botones de acción, layout visual |
| **Formulario** | Validación de datos, manejo de estado form |
| **Página** | Lógica de negocio, manejo de errores, navegación |

### 2. Single Source of Truth

```typescript
// ✅ Una sola definición de botones por contexto
const buttonConfig = {
  modal: {
    primary: { text: "Crear Proyecto", variant: "default" },
    secondary: { text: "Cancelar", variant: "outline" }
  }
};
```

### 3. Composición sobre Herencia

```typescript
// ✅ Componentes compuestos flexibles
const Modal = {
  Layout: ModalLayout,
  Header: ModalHeader,
  Content: ModalContent,
  Actions: ModalActions
};
```

## 🧪 Testing Strategy

### Unit Tests para Modal

```typescript
describe('ModalLayout', () => {
  it('debe triggerea submit del formulario usando formId', () => {
    const mockSubmit = jest.fn();

    render(
      <ModalLayout formId="test-form" isOpen>
        <form id="test-form" onSubmit={mockSubmit}>
          <input type="text" />
        </form>
      </ModalLayout>
    );

    fireEvent.click(screen.getByRole('button', { name: /crear/i }));

    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Modal + Form Integration', () => {
  it('debe crear proyecto cuando formulario es válido', async () => {
    const mockCreateProject = jest.fn();

    render(
      <NewProjectDialog onSubmit={mockCreateProject} />
    );

    // Llenar formulario
    await user.type(screen.getByLabelText(/nombre/i), 'Proyecto Test');

    // Submit desde modal
    await user.click(screen.getByRole('button', { name: /crear proyecto/i }));

    expect(mockCreateProject).toHaveBeenCalledWith({
      name: 'Proyecto Test',
      // ... otros campos
    });
  });
});
```

## 🚫 Anti-Patrones (Evitar)

### ❌ Duplicación de Botones

```typescript
// ❌ NUNCA - Duplicar botones en modal y formulario
<ModalLayout showDefaultButtons={true}>
  <ProjectForm showDefaultButtons={true} /> {/* ← DUPLICACIÓN */}
</ModalLayout>
```

### ❌ Lógica de Submit Dispersa

```typescript
// ❌ NUNCA - Submit handling en múltiples lugares
const handleModalSubmit = () => { /* submit logic */ };
const handleFormSubmit = () => { /* duplicate logic */ };
```

### ❌ IDs Duplicados

```typescript
// ❌ NUNCA - Usar el mismo formId en múltiples formularios
<Modal formId="form">
  <FormA id="form" />  {/* ← CONFLICTO */}
  <FormB id="form" />  {/* ← CONFLICTO */}
</Modal>
```

## 📊 Métricas de Éxito

### Antes de la Migración
- **Código duplicado:** 7 archivos con `showDefaultButtons={true}`
- **Botones por modal:** 2-4 botones visibles
- **LOC para botones:** ~15 líneas promedio por modal
- **Inconsistencias:** 3 patrones diferentes

### Después de la Migración
- **Código duplicado:** 0 archivos con duplicación
- **Botones por modal:** 2 botones estándar
- **LOC para botones:** ~5 líneas promedio por modal
- **Inconsistencias:** 1 patrón unificado

## 🔄 Proceso de Migración

Ver documento detallado: [modal-refactoring-plan.md](./modal-refactoring-plan.md)

**Fases:**
1. Actualizar ModalLayout (soporte formId)
2. Migrar formularios gradualmente
3. Actualizar modales existentes
4. Documentar patrones finales

## 📚 Referencias

### Estándares de la Industria
- [Material Design - Dialogs](https://material.io/components/dialogs)
- [Radix UI - Dialog Patterns](https://www.radix-ui.com/docs/primitives/components/dialog)
- [React Hook Form - Integration](https://react-hook-form.com/get-started)

### Implementación en CalReact
- [patterns.md](../../claude-docs/references/patterns.md) - Patrones generales
- [modalLayout.tsx](../../src/components/modals/modalLayout.tsx) - Componente base
- [ProjectForm.tsx](../../src/components/forms/ProjectForm.tsx) - Ejemplo de formulario

---

**📋 Generado:** Septiembre 2025
**🔄 Próxima revisión:** Con cada cambio en ModalLayout
**📞 Contacto:** Equipo de Desarrollo CalReact