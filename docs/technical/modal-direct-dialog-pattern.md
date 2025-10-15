# 🎭 Modal Pattern: Direct Dialog Usage

**Fecha creación:** Octubre 2025
**Propósito:** Template estandarizado para crear modales usando Dialog directamente (sin ModalLayout)
**Beneficios:** Simplicidad, explicitness, type-safety, debugging trivial

---

## 📋 Patrón Base (Template)

### Estructura Estándar

```tsx
'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function NewEntityDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  // Mutación para crear entidad
  const createMutation = useMutation({
    mutationFn: (data: EntityData) => createEntity(data),
    onSuccess: () => {
      // IMPORTANTE: Cerrar dialog ANTES de invalidar queries
      // Workaround para Radix UI Dialog bug #1241
      setIsOpen(false);

      setTimeout(() => {
        document.body.style.removeProperty('pointer-events');
        queryClient.invalidateQueries({ queryKey: ['entities'] });
        toast.success('Entidad creada exitosamente');
      }, 100);
    },
    onError: (error: Error) => {
      toast.error('Error al crear entidad', {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (formData: EntityFormData) => {
    await createMutation.mutateAsync(formData);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only">
          Nueva Entidad
        </span>
      </Button>

      {/* Dialog Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
          <DialogHeader>
            <DialogTitle>Nueva Entidad</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para crear nueva entidad
            </DialogDescription>
          </DialogHeader>

          {/* Form Content */}
          <div className="px-6 py-4">
            <EntityForm
              formId="new-entity-form"
              onSubmit={handleSubmit}
              showDefaultButtons={false}
            />
          </div>

          {/* Footer con botones */}
          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="new-entity-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando
                </>
              ) : (
                'Crear Entidad'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## 🎯 Elementos Clave del Patrón

### 1. **DialogContent con Scroll Nativo**
```tsx
<DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
```
- `max-h-[90vh]`: Altura máxima 90% del viewport
- `overflow-y-auto`: Scroll vertical automático
- `max-w-xl`: Ancho máximo (ajustar según necesidad)

### 2. **DialogHeader con Accesibilidad**
```tsx
<DialogHeader>
  <DialogTitle>Título del Modal</DialogTitle>
  <DialogDescription className="sr-only">
    Descripción para screen readers
  </DialogDescription>
</DialogHeader>
```
- `sr-only`: Descripción invisible pero leída por screen readers

### 3. **Form Content con Padding**
```tsx
<div className="px-6 py-4">
  <EntityForm
    formId="unique-form-id"
    onSubmit={handleSubmit}
    showDefaultButtons={false}
  />
</div>
```
- Formulario sin botones propios (manejados en footer)
- `formId` único para conectar con button submit

### 4. **DialogFooter con Submit Button**
```tsx
<DialogFooter className="px-6 py-4 border-t">
  <Button variant="outline" onClick={() => setIsOpen(false)}>
    Cancelar
  </Button>
  <Button
    type="submit"
    form="unique-form-id"  {/* Conecta con formulario */}
    disabled={mutation.isPending}
  >
    {mutation.isPending ? 'Procesando...' : 'Crear'}
  </Button>
</DialogFooter>
```
- `type="submit"`: Tipo submit HTML nativo
- `form="unique-form-id"`: Conecta con form específico
- Loading state con Loader2 icon

### 5. **Race Condition Fix (OBLIGATORIO)**
```tsx
onSuccess: () => {
  // 1. Cerrar dialog PRIMERO
  setIsOpen(false);

  // 2. Esperar cleanup de Radix UI
  setTimeout(() => {
    // 3. Limpiar pointer-events manualmente
    document.body.style.removeProperty('pointer-events');

    // 4. Invalidar queries
    queryClient.invalidateQueries({ queryKey: ['entities'] });

    // 5. Mostrar toast
    toast.success('Operación exitosa');
  }, 100);
}
```

---

## ✅ Checklist de Implementación

Cuando crees un nuevo modal:

- [ ] **DialogContent** tiene `max-h-[90vh] overflow-y-auto`
- [ ] **DialogDescription** con `className="sr-only"` para accesibilidad
- [ ] **Form** tiene `formId` único
- [ ] **Submit Button** tiene `type="submit"` y `form="formId"`
- [ ] **Mutation onSuccess** cierra dialog ANTES de invalidar queries
- [ ] **setTimeout(100)** implementado con cleanup de pointer-events
- [ ] **Loading state** muestra Loader2 icon
- [ ] **Botón Cancelar** disabled durante isPending
- [ ] **DialogFooter** tiene `border-t` para separación visual

---

## 🎨 Variantes Comunes

### Modal Grande (Formularios Complejos)
```tsx
<DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
```

### Modal Compacto (Confirmaciones)
```tsx
<DialogContent className="max-h-[50vh] max-w-md">
```

### Modal Sin Footer (Custom Actions)
```tsx
{/* No incluir DialogFooter, manejar botones en form */}
<div className="px-6 py-4">
  <EntityForm showDefaultButtons={true} />
</div>
```

---

## 🚫 Anti-Patrones a Evitar

### ❌ NO usar wrapper div con scroll
```tsx
{/* INCORRECTO */}
<DialogContent>
  <div className="max-h-[75vh] overflow-y-auto">
    {children}
  </div>
</DialogContent>
```

### ❌ NO olvidar setTimeout en onSuccess
```tsx
{/* INCORRECTO - causa UI blocking */}
onSuccess: () => {
  setIsOpen(false);
  queryClient.invalidateQueries({ queryKey: ['entities'] }); // Race condition!
}
```

### ❌ NO usar formRef con requestSubmit
```tsx
{/* INCORRECTO - puede fallar silenciosamente */}
const formRef = React.useRef<HTMLFormElement>(null);
<Button onClick={() => formRef.current?.requestSubmit()}>
```

### ✅ USAR form attribute con formId
```tsx
{/* CORRECTO - HTML nativo confiable */}
<Button type="submit" form="entity-form-id">
```

---

## 📊 Migración desde ModalLayout

### Antes (ModalLayout)
```tsx
<ModalLayout
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título"
  formRef={formRef}  // Problemático
  isSubmitting={mutation.isPending}
>
  <EntityForm />
</ModalLayout>
```

### Después (Dialog Directo)
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription className="sr-only">Descripción</DialogDescription>
    </DialogHeader>

    <div className="px-6 py-4">
      <EntityForm formId="entity-form" showDefaultButtons={false} />
    </div>

    <DialogFooter className="px-6 py-4 border-t">
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button type="submit" form="entity-form" disabled={mutation.isPending}>
        {mutation.isPending ? 'Procesando...' : 'Crear'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Diferencias clave:**
- +30 líneas de boilerplate
- -1 capa de abstracción
- +100% claridad de qué hace el código
- +Type-safety (no refs opcionales)
- +Debugging trivial

---

## 🧪 Testing Pattern

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewEntityDialog } from './NewEntityDialog';

describe('NewEntityDialog', () => {
  it('debe crear entidad y cerrar modal', async () => {
    const user = userEvent.setup();
    render(<NewEntityDialog />);

    // Abrir modal
    await user.click(screen.getByRole('button', { name: /nueva entidad/i }));

    // Llenar formulario
    await user.type(screen.getByLabelText(/nombre/i), 'Test Entity');

    // Submit
    await user.click(screen.getByRole('button', { name: /crear/i }));

    // Verificar cierre
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
```

---

## 📚 Referencias

- **Radix UI Dialog bug #1241**: [GitHub Issue](https://github.com/radix-ui/primitives/issues/1241)
- **Shadcn/ui Dialog**: [Documentación oficial](https://ui.shadcn.com/docs/components/dialog)
- **TanStack Query mutations**: [Mutation callbacks](https://tanstack.com/query/latest/docs/react/guides/mutations)

---

**📊 Última actualización:** Octubre 2025
**🎯 Implementaciones:** 0/7 modales migrados
**⏱️ Tiempo estimado por modal:** ~30-45 minutos
