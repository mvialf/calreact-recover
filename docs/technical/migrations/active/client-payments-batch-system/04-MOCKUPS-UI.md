# 🎨 Mockups UI - Sistema de Batch Payments

**Fecha:** Octubre 2025
**Herramienta de diseño:** Descripción textual ASCII + Especificaciones técnicas

---

## 📋 Índice

1. [Indicador 1(*) en Account Statement](#1-indicador-1-en-account-statement)
2. [BatchPaymentDialog - Vista Principal](#2-batchpaymentdialog---vista-principal)
3. [ConfirmDeleteBatchDialog](#3-confirmdeletebatchdialog)
4. [Payments Table - Columna Tipo](#4-payments-table---columna-tipo)
5. [Especificaciones de Diseño](#5-especificaciones-de-diseño)

---

## 1. Indicador 1(*) en Account Statement

### Vista ANTES (Sin Batch)

```
┌────────────────────────────────────────────────────────────────┐
│  Estado de Cuenta - Cliente XYZ                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Proyecto ABC-001                                  $500,000    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ Fecha       Descripción             Monto      Cant  │     │
│  ├──────────────────────────────────────────────────────┤     │
│  │ 01/10/2025  Transferencia      +$100,000       1    │     │
│  │ 15/09/2025  Efectivo           +$50,000        1    │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                │
│  Proyecto XYZ-002                                  $300,000    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ Fecha       Descripción             Monto      Cant  │     │
│  ├──────────────────────────────────────────────────────┤     │
│  │ 01/10/2025  Transferencia      +$50,000        1    │     │
│  │                                            ▲          │     │
│  │                                            │          │     │
│  │                               Sin indicador de batch │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

### Vista DESPUÉS (Con Batch)

```
┌────────────────────────────────────────────────────────────────┐
│  Estado de Cuenta - Cliente XYZ                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Proyecto ABC-001                                  $500,000    │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ Fecha       Descripción             Monto      Cant  │     │
│  ├──────────────────────────────────────────────────────┤     │
│  │ 01/10/2025  Transferencia      +$100,000     [1(*)] │◄──┐ │
│  │                                              ▲       │   │ │
│  │                                              │       │   │ │
│  │                                   Clickeable, azul  │   │ │
│  │                                   hover:underline   │   │ │
│  │                                                     │   │ │
│  │ 15/09/2025  Efectivo           +$50,000        1    │   │ │
│  │                                              ▲       │   │ │
│  │                                              │       │   │ │
│  │                                   Gris, no clickeable│  │ │
│  └──────────────────────────────────────────────────────┘   │ │
│                                                              │ │
│  Proyecto XYZ-002                                  $300,000  │ │
│  ┌──────────────────────────────────────────────────────┐   │ │
│  │ Fecha       Descripción             Monto      Cant  │   │ │
│  ├──────────────────────────────────────────────────────┤   │ │
│  │ 01/10/2025  Transferencia      +$50,000      [1(*)] │◄──┘ │
│  │                                                      │     │
│  │        Mismo batchId → mismo link al dialog        │     │
│  └──────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────┘
```

### Código HTML/React del Indicador

```tsx
{payment.batchId ? (
  <button
    onClick={(e) => {
      e.stopPropagation();
      setSelectedBatchId(payment.batchId);
      setBatchDialogOpen(true);
    }}
    className="text-xs text-primary hover:underline cursor-pointer font-medium"
    title="Ver batch completo - Click para detalles"
  >
    1(*)
  </button>
) : (
  <span className="text-xs text-muted-foreground">
    1
  </span>
)}
```

### Especificaciones del Indicador

| Propiedad | Con Batch (`1(*)`) | Sin Batch (`1`) |
|-----------|-------------------|-----------------|
| **Texto** | `1(*)` | `1` |
| **Color** | `text-primary` (azul) | `text-muted-foreground` (gris) |
| **Cursor** | `cursor-pointer` | Normal |
| **Hover** | `hover:underline` | Sin efecto |
| **Clickeable** | Sí → Abre BatchPaymentDialog | No |
| **Font** | `font-medium` | Normal |
| **Tooltip** | "Ver batch completo - Click para detalles" | Sin tooltip |

---

## 2. BatchPaymentDialog - Vista Principal

### Mockup Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✕  Pago de Cliente - María González                         [X]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Resumen completo del pago distribuido en proyectos                │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                   RESUMEN DEL PAGO                            │ │
│  │                 (fondo gris claro)                            │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │                                                               │ │
│  │    Total Pagado          Proyectos         Método            │ │
│  │    $150,000                  3          Transferencia        │ │
│  │    ▲ grande, bold        ▲ grande      ▲ texto normal       │ │
│  │    azul primary                                              │ │
│  │                                                               │ │
│  │    ─────────────────────────────────────────────────────      │ │
│  │                                                               │ │
│  │    Fecha: 1 de octubre de 2025                               │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  Distribución por Proyecto                                         │
│  ────────────────────────                                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Proyecto ABC-001                            $100,000        │ │
│  │  01/10/2025                                 ▲ grande, bold   │ │
│  │                                                               │ │
│  │  [hover: fondo gris muy claro]                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Proyecto XYZ-002                            $30,000         │ │
│  │  01/10/2025                                                  │ │
│  │  Nota: Pago parcial proyecto                                │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Proyecto DEF-003                            $20,000         │ │
│  │  01/10/2025                                                  │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│                                                                     │
│                                                         [Cerrar]    │
└─────────────────────────────────────────────────────────────────────┘
```

### Estructura de Componentes

```tsx
<Dialog>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    {/* HEADER */}
    <DialogHeader>
      <DialogTitle>Pago de Cliente - {clientName}</DialogTitle>
      <DialogDescription>
        Resumen completo del pago distribuido en proyectos
      </DialogDescription>
    </DialogHeader>

    {/* LOADING STATE */}
    {isLoading && (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )}

    {/* RESUMEN CARD */}
    <div className="bg-muted p-6 rounded-lg">
      <div className="grid grid-cols-3 gap-6">
        {/* Total Pagado */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Total Pagado
          </p>
          <p className="text-3xl font-bold text-primary">
            ${totalAmount.toLocaleString()}
          </p>
        </div>

        {/* Proyectos */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Proyectos
          </p>
          <p className="text-3xl font-bold">
            {paymentCount}
          </p>
        </div>

        {/* Método */}
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Método
          </p>
          <p className="text-lg font-semibold">
            {paymentMethod}
          </p>
        </div>
      </div>

      {/* Fecha separada */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm">
          <span className="text-muted-foreground">Fecha:</span>{' '}
          <span className="font-medium">{formattedDate}</span>
        </p>
      </div>
    </div>

    {/* LISTA DE PAGOS */}
    <div>
      <h3 className="font-semibold text-lg mb-4">
        Distribución por Proyecto
      </h3>
      <div className="space-y-3">
        {payments.map(payment => (
          <div className="flex justify-between p-4 border rounded-lg hover:bg-muted/50">
            {/* Izquierda: Info proyecto */}
            <div className="flex-1">
              <p className="font-medium">Proyecto {projectId}</p>
              <p className="text-sm text-muted-foreground">{date}</p>
              {notes && (
                <p className="text-sm text-muted-foreground mt-1">
                  {notes}
                </p>
              )}
            </div>

            {/* Derecha: Monto */}
            <div className="text-right">
              <p className="text-xl font-bold">
                ${amount.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### Estados del Dialog

#### Estado: Loading

```
┌─────────────────────────────────────────┐
│  Pago de Cliente                   [X] │
├─────────────────────────────────────────┤
│                                         │
│              ⟳                          │
│         Cargando...                     │
│                                         │
│    (Spinner animado centrado)           │
│                                         │
└─────────────────────────────────────────┘
```

#### Estado: No encontrado

```
┌─────────────────────────────────────────┐
│  Detalle de Pago                   [X] │
├─────────────────────────────────────────┤
│                                         │
│         ⚠️                              │
│  No se encontró información del batch  │
│                                         │
│    (Texto gris centrado)                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 3. ConfirmDeleteBatchDialog

### Mockup del Alert Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    ⚠️  ¿Eliminar batch de pagos?                               │
│                                                                 │
│    Esta acción eliminará 3 pagos relacionados por un total     │
│    de $150,000.                                                │
│                                                                 │
│    Esta acción no se puede deshacer.                           │
│    ▲ texto rojo, bold                                          │
│                                                                 │
│                                                                 │
│                          [Cancelar]  [Eliminar Batch]          │
│                                       ▲ botón rojo             │
└─────────────────────────────────────────────────────────────────┘
```

### Estructura de Componente

```tsx
<AlertDialog>
  <AlertDialogContent>
    {/* HEADER */}
    <AlertDialogHeader>
      <AlertDialogTitle className="text-destructive">
        ¿Eliminar batch de pagos?
      </AlertDialogTitle>

      <AlertDialogDescription className="space-y-2">
        <p>
          Esta acción eliminará{' '}
          <strong className="text-foreground">
            {paymentCount} pagos
          </strong>{' '}
          relacionados por un total de{' '}
          <strong className="text-foreground">
            ${totalAmount.toLocaleString()}
          </strong>.
        </p>

        <p className="text-destructive font-medium">
          Esta acción no se puede deshacer.
        </p>
      </AlertDialogDescription>
    </AlertDialogHeader>

    {/* FOOTER */}
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isPending}>
        Cancelar
      </AlertDialogCancel>

      <AlertDialogAction
        onClick={handleConfirm}
        disabled={isPending}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Eliminando...' : 'Eliminar Batch'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Estados del Dialog

#### Estado: Normal

```
┌──────────────────────────────────────────┐
│  ⚠️  ¿Eliminar batch de pagos?          │
│                                          │
│  Esta acción eliminará 3 pagos...       │
│                                          │
│          [Cancelar]  [Eliminar Batch]   │
└──────────────────────────────────────────┘
```

#### Estado: Eliminando (isPending)

```
┌──────────────────────────────────────────┐
│  ⚠️  ¿Eliminar batch de pagos?          │
│                                          │
│  Esta acción eliminará 3 pagos...       │
│                                          │
│     [Cancelar]  [⟳ Eliminando...]       │
│     ▲ disabled   ▲ spinner + texto      │
└──────────────────────────────────────────┘
```

---

## 4. Payments Table - Columna Tipo

### Vista ANTES (Sin columna Tipo)

```
┌──────────────────────────────────────────────────────────────────┐
│  Pagos                                             [+ Nuevo Pago] │
├──────────────────────────────────────────────────────────────────┤
│ Fecha       │ Proyecto   │ Monto     │ Método        │ Acciones │
├──────────────────────────────────────────────────────────────────┤
│ 01/10/2025  │ ABC-001    │ $100,000  │ Transferencia │    ⋮     │
│ 01/10/2025  │ XYZ-002    │ $50,000   │ Transferencia │    ⋮     │
│ 15/09/2025  │ ABC-001    │ $50,000   │ Efectivo      │    ⋮     │
└──────────────────────────────────────────────────────────────────┘
```

### Vista DESPUÉS (Con columna Tipo)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Pagos                                                   [+ Nuevo Pago]     │
├────────────────────────────────────────────────────────────────────────────┤
│ Fecha      │ Proyecto │ Tipo      │ Monto    │ Método        │ Acciones  │
├────────────────────────────────────────────────────────────────────────────┤
│ 01/10/2025 │ ABC-001  │ [Cliente] │ $100,000 │ Transferencia │  ⋮        │
│            │          │  ▲ badge  │          │               │  │        │
│            │          │  gris     │          │               │  ▼        │
│            │          │           │          │               │ ┌──────────┐
│            │          │           │          │               │ │ Editar   │
│            │          │           │          │               │ │ Eliminar │
│            │          │           │          │               │ │ ────────│
│            │          │           │          │               │ │👁 Ver    │
│            │          │           │          │               │ │  Batch   │
│            │          │           │          │               │ └──────────┘
│ 01/10/2025 │ XYZ-002  │ [Cliente] │ $50,000  │ Transferencia │  ⋮        │
│ 15/09/2025 │ ABC-001  │     -     │ $50,000  │ Efectivo      │  ⋮        │
│            │          │  ▲ sin    │          │               │            │
│            │          │  tipo     │          │               │            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Código de la Columna

```tsx
// Columna Tipo de Pago
{
  accessorKey: 'paymentType',
  header: 'Tipo',
  cell: ({ row }) => {
    const type = row.getValue('paymentType') as string | undefined;

    if (!type) {
      return (
        <span className="text-muted-foreground text-xs">
          -
        </span>
      );
    }

    return (
      <Badge
        variant={type === 'cliente' ? 'secondary' : 'default'}
        className="text-xs"
      >
        {type === 'cliente' ? 'Cliente' : 'Proyecto'}
      </Badge>
    );
  }
}
```

### Código de la Acción "Ver Batch"

```tsx
// En DropdownMenu de acciones
{row.original.batchId && (
  <>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={() => handleViewBatch(row.original.batchId!)}
    >
      <Eye className="mr-2 h-4 w-4" />
      Ver Batch Completo
    </DropdownMenuItem>
  </>
)}
```

### Badges de Tipo

| Tipo | Variant | Color | Texto |
|------|---------|-------|-------|
| Cliente | `secondary` | Gris | "Cliente" |
| Proyecto | `default` | Azul primary | "Proyecto" |
| Sin tipo | - | Gris claro | "-" |

---

## 5. Especificaciones de Diseño

### Colores

```typescript
// Usando tokens del design system

const COLORS = {
  // Indicador batch
  batchIndicatorActive: 'text-primary',           // Azul
  batchIndicatorInactive: 'text-muted-foreground', // Gris

  // Dialog
  dialogBackground: 'bg-background',
  summaryCardBackground: 'bg-muted',              // Gris claro
  summaryTotalAmount: 'text-primary',             // Azul bold
  summaryText: 'text-foreground',
  summaryLabel: 'text-muted-foreground',

  // Alert destructivo
  alertTitle: 'text-destructive',                 // Rojo
  alertButton: 'bg-destructive',
  alertButtonText: 'text-destructive-foreground',

  // Badges
  badgeClienteBackground: 'bg-secondary',         // Gris
  badgeClienteText: 'text-secondary-foreground',
  badgeProyectoBackground: 'bg-primary',          // Azul
  badgeProyectoText: 'text-primary-foreground',
};
```

### Tipografía

```typescript
const TYPOGRAPHY = {
  // DialogTitle
  dialogTitle: 'text-lg font-semibold',

  // Resumen amounts
  summaryAmountLarge: 'text-3xl font-bold',
  summaryLabel: 'text-sm text-muted-foreground',

  // Payment list
  paymentProjectName: 'font-medium',
  paymentDate: 'text-sm text-muted-foreground',
  paymentAmount: 'text-xl font-bold',

  // Indicador
  batchIndicator: 'text-xs font-medium',
  normalIndicator: 'text-xs',

  // Badges
  badgeType: 'text-xs',
};
```

### Espaciado

```typescript
const SPACING = {
  // Dialog
  dialogPadding: 'p-6',
  dialogMaxWidth: 'max-w-3xl',
  dialogMaxHeight: 'max-h-[80vh]',

  // Resumen card
  summaryCardPadding: 'p-6',
  summaryCardGap: 'gap-6',
  summaryCardMarginTop: 'mt-4',

  // Payment items
  paymentItemPadding: 'p-4',
  paymentItemGap: 'space-y-3',

  // Buttons
  buttonMarginTop: 'mt-6',
};
```

### Animaciones

```typescript
const ANIMATIONS = {
  // Hover en payment items
  paymentItemHover: 'hover:bg-muted/50 transition-colors',

  // Spinner loading
  spinnerAnimation: 'animate-spin',

  // Dialog open/close
  dialogAnimation: 'animate-in fade-in-0 zoom-in-95',
};
```

### Breakpoints Responsivos

```typescript
// Mobile (< 640px)
const MOBILE_STYLES = {
  dialogMaxWidth: 'max-w-[95vw]',
  summaryGrid: 'grid-cols-1',        // Stack vertical
  paymentItemFlex: 'flex-col',       // Stack vertical
};

// Tablet (640px - 1024px)
const TABLET_STYLES = {
  dialogMaxWidth: 'max-w-2xl',
  summaryGrid: 'grid-cols-2',        // 2 columnas
};

// Desktop (> 1024px)
const DESKTOP_STYLES = {
  dialogMaxWidth: 'max-w-3xl',
  summaryGrid: 'grid-cols-3',        // 3 columnas
};
```

### Accesibilidad

```typescript
// ARIA labels requeridos
const ACCESSIBILITY = {
  // Indicador batch
  batchIndicatorLabel: 'Ver batch completo - Click para detalles',

  // Dialog
  dialogRole: 'dialog',
  dialogAriaModal: true,
  dialogAriaLabelledby: 'dialog-title',

  // Buttons
  deleteButtonAriaLabel: 'Eliminar batch de pagos',
  cancelButtonAriaLabel: 'Cancelar eliminación',
  closeButtonAriaLabel: 'Cerrar diálogo',

  // Loading
  loadingAriaLabel: 'Cargando información del batch',
  loadingRole: 'status',
};
```

---

## 📱 Comportamiento Responsive

### Mobile (< 640px)

```
┌────────────────────────────┐
│  Pago de Cliente      [X] │
├────────────────────────────┤
│                            │
│  ┌──────────────────────┐ │
│  │ Total Pagado         │ │
│  │ $150,000             │ │
│  │                      │ │
│  │ Proyectos            │ │
│  │ 3                    │ │
│  │                      │ │
│  │ Método               │ │
│  │ Transferencia        │ │
│  └──────────────────────┘ │
│                            │
│  Distribución              │
│                            │
│  ┌──────────────────────┐ │
│  │ ABC-001              │ │
│  │ 01/10/2025           │ │
│  │                      │ │
│  │ $100,000             │ │
│  └──────────────────────┘ │
│                            │
└────────────────────────────┘
```

### Desktop (> 1024px)

```
┌──────────────────────────────────────────────────────┐
│  Pago de Cliente - María González              [X] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  Total: $150,000  │  Proyectos: 3  │  Método  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  Proyecto ABC-001              $100,000        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Flujo de Usuario

### Caso de Uso 1: Ver Batch desde Account Statement

```
1. Usuario ve estado de cuenta
   ↓
2. Identifica indicador 1(*) en pago
   ↓
3. Click en 1(*)
   ↓
4. Se abre BatchPaymentDialog
   ↓
5. Ve resumen: $150,000 total, 3 proyectos
   ↓
6. Ve lista detallada de distribución
   ↓
7. Cierra dialog
```

### Caso de Uso 2: Eliminar Batch

```
1. Usuario abre BatchPaymentDialog
   ↓
2. Click en botón "Eliminar Batch" (si existe)
   ↓
3. Se abre ConfirmDeleteBatchDialog
   ↓
4. Ve advertencia: "3 pagos, $150,000, no se puede deshacer"
   ↓
5. Confirma eliminación
   ↓
6. Loading state: "Eliminando..."
   ↓
7. Success toast: "Se eliminaron 3 pagos"
   ↓
8. UI se actualiza automáticamente (TanStack Query)
```

---

## 🔍 Detalles de Implementación UI

### Loader Component

```tsx
<div className="flex items-center justify-center py-8">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
</div>
```

### Empty State

```tsx
<div className="text-center py-8 text-muted-foreground">
  <p className="text-sm">No se encontró información del batch</p>
</div>
```

### Toast de Éxito

```tsx
toast({
  title: 'Batch eliminado exitosamente',
  description: `Se eliminaron ${deletedCount} pagos correctamente`,
  // variant por defecto (success)
});
```

### Toast de Error

```tsx
toast({
  title: 'Error al eliminar',
  description: error.message,
  variant: 'destructive'
});
```

---

## ✅ Checklist de Validación UI

### Indicador 1(*)
- [ ] Color azul cuando tiene batchId
- [ ] Color gris cuando NO tiene batchId
- [ ] Hover underline cuando clickeable
- [ ] Tooltip visible en hover
- [ ] Click abre BatchPaymentDialog

### BatchPaymentDialog
- [ ] Loading state funciona
- [ ] Empty state funciona
- [ ] Resumen muestra datos correctos
- [ ] Lista de pagos ordenada por fecha desc
- [ ] Hover en payment items visible
- [ ] Responsive en mobile/tablet/desktop
- [ ] Scroll funciona cuando hay muchos pagos

### ConfirmDeleteBatchDialog
- [ ] Advertencia clara visible
- [ ] Texto en rojo "no se puede deshacer"
- [ ] Botón "Eliminar Batch" en rojo
- [ ] Loading state durante eliminación
- [ ] Botones deshabilitados durante eliminación

### Payments Table
- [ ] Columna "Tipo" visible
- [ ] Badge "Cliente" en gris
- [ ] Badge "Proyecto" en azul
- [ ] "-" cuando no hay tipo
- [ ] Acción "Ver Batch" solo cuando tiene batchId
- [ ] Click en "Ver Batch" abre dialog

---

**Próximo documento:** `05-TESTING-STRATEGY.md` con estrategia de testing detallada
