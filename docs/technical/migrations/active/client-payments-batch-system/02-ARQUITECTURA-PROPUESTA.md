# 🏗️ Arquitectura Propuesta - Sistema de Batch Payments

**Fecha:** Octubre 2025
**Estado:** Diseño técnico completo

---

## 📋 Índice

1. [Cambios en Tipos TypeScript](#1-cambios-en-tipos-typescript)
2. [Modificaciones en Servicios](#2-modificaciones-en-servicios)
3. [Flujos de Datos](#3-flujos-de-datos)
4. [Patrones de Consulta Firebase](#4-patrones-de-consulta-firebase)
5. [Componentes Nuevos](#5-componentes-nuevos)
6. [Impacto en Componentes Existentes](#6-impacto-en-componentes-existentes)

---

## 1. Cambios en Tipos TypeScript

### 1.1 Payment Type (src/types/payment.ts)

**ANTES:**
```typescript
export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  paymentMethod: string;
  date: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**DESPUÉS:**
```typescript
export interface Payment {
  id: string;
  projectId: string;          // ✅ Sigue siendo requerido
  amount: number;
  paymentMethod: string;
  date: Date;
  notes?: string;

  // 🆕 NUEVOS CAMPOS OPCIONALES
  batchId?: string;           // UUID linking related payments
  clientId?: string;          // ID del cliente que hizo el pago
  paymentType?: 'proyecto' | 'cliente';  // Tipo de origen del pago

  createdAt?: Date;
  updatedAt?: Date;
}
```

### 1.2 Nuevos Tipos Auxiliares

**Archivo:** `src/types/payment.ts`

```typescript
/**
 * Información resumida de un batch de pagos
 */
export interface BatchPaymentSummary {
  batchId: string;
  clientId: string;
  clientName: string;
  totalAmount: number;
  paymentCount: number;
  date: Date;
  paymentMethod: string;
  payments: Payment[];  // Lista de pagos relacionados
}

/**
 * Parámetros para crear un batch de pagos
 */
export interface CreateBatchPaymentParams {
  clientId: string;
  totalAmount: number;
  paymentMethod: string;
  date: Date;
  notes?: string;
  allocations: Array<{
    projectId: string;
    amount: number;
  }>;
}

/**
 * Resultado de eliminar un batch
 */
export interface DeleteBatchResult {
  success: boolean;
  deletedCount: number;
  batchId: string;
  error?: string;
}
```

---

## 2. Modificaciones en Servicios

### 2.1 Nuevas Funciones en paymentService.ts

**Archivo:** `src/services/paymentService.ts`

#### Función: createBatchPayment

```typescript
import { writeBatch, doc, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { CreateBatchPaymentParams, Payment } from '@/types/payment';

/**
 * Crea múltiples pagos vinculados por batchId en una transacción atómica
 *
 * @param params - Parámetros del batch payment
 * @returns Promise<string> - El batchId generado
 * @throws Error si la operación falla
 *
 * @example
 * const batchId = await createBatchPayment({
 *   clientId: 'client123',
 *   totalAmount: 150000,
 *   paymentMethod: 'Transferencia',
 *   date: new Date(),
 *   allocations: [
 *     { projectId: 'proj1', amount: 100000 },
 *     { projectId: 'proj2', amount: 50000 }
 *   ]
 * });
 */
export const createBatchPayment = async (
  params: CreateBatchPaymentParams
): Promise<string> => {
  const batchId = crypto.randomUUID();
  const batch = writeBatch(firestore);

  try {
    // Crear cada pago en el batch
    for (const allocation of params.allocations) {
      const paymentRef = doc(collection(firestore, 'payments'));

      const paymentData = {
        projectId: allocation.projectId,
        amount: allocation.amount,
        paymentMethod: params.paymentMethod,
        date: Timestamp.fromDate(params.date),
        notes: params.notes || '',

        // 🆕 Campos de batch
        batchId: batchId,
        clientId: params.clientId,
        paymentType: 'cliente' as const,

        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      batch.set(paymentRef, paymentData);
    }

    // Commit atómico
    await batch.commit();

    return batchId;

  } catch (error) {
    console.error('Error creating batch payment:', error);
    throw new Error(`Failed to create batch payment: ${error.message}`);
  }
};
```

#### Función: getBatchPayments

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { docSnapshotsToEntities } from '@/utils/firestore-helpers';

/**
 * Obtiene todos los pagos relacionados a un batchId
 *
 * @param batchId - UUID del batch
 * @returns Promise<Payment[]> - Lista de pagos del batch
 *
 * @example
 * const payments = await getBatchPayments('uuid-123-456');
 * console.log(`Batch contains ${payments.length} payments`);
 */
export const getBatchPayments = async (
  batchId: string
): Promise<Payment[]> => {
  const paymentsRef = collection(firestore, 'payments');
  const q = query(paymentsRef, where('batchId', '==', batchId));

  const snapshot = await getDocs(q);

  return docSnapshotsToEntities(snapshot.docs, (doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Payment[];
};
```

#### Función: deleteBatchPayment

```typescript
import { DeleteBatchResult } from '@/types/payment';

/**
 * Elimina todos los pagos de un batch de manera atómica
 *
 * @param batchId - UUID del batch a eliminar
 * @returns Promise<DeleteBatchResult> - Resultado de la operación
 *
 * @example
 * const result = await deleteBatchPayment('uuid-123');
 * if (result.success) {
 *   console.log(`Deleted ${result.deletedCount} payments`);
 * }
 */
export const deleteBatchPayment = async (
  batchId: string
): Promise<DeleteBatchResult> => {
  try {
    // 1. Obtener todos los pagos del batch
    const payments = await getBatchPayments(batchId);

    if (payments.length === 0) {
      return {
        success: false,
        deletedCount: 0,
        batchId,
        error: 'No payments found for this batch'
      };
    }

    // 2. Eliminar en batch write
    const batch = writeBatch(firestore);

    payments.forEach(payment => {
      const paymentRef = doc(firestore, 'payments', payment.id);
      batch.delete(paymentRef);
    });

    await batch.commit();

    return {
      success: true,
      deletedCount: payments.length,
      batchId
    };

  } catch (error) {
    console.error('Error deleting batch payment:', error);
    return {
      success: false,
      deletedCount: 0,
      batchId,
      error: error.message
    };
  }
};
```

#### Función: getBatchPaymentSummary

```typescript
/**
 * Obtiene resumen completo de un batch payment con datos enriquecidos
 *
 * @param batchId - UUID del batch
 * @returns Promise<BatchPaymentSummary | null>
 *
 * @example
 * const summary = await getBatchPaymentSummary('uuid-123');
 * console.log(`Total: $${summary.totalAmount}, Pagos: ${summary.paymentCount}`);
 */
export const getBatchPaymentSummary = async (
  batchId: string
): Promise<BatchPaymentSummary | null> => {
  const payments = await getBatchPayments(batchId);

  if (payments.length === 0) return null;

  const firstPayment = payments[0];

  // Obtener información del cliente
  const clientDoc = await getDoc(doc(firestore, 'clients', firstPayment.clientId!));
  const clientName = clientDoc.exists() ? clientDoc.data().name : 'Cliente Desconocido';

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    batchId,
    clientId: firstPayment.clientId!,
    clientName,
    totalAmount,
    paymentCount: payments.length,
    date: firstPayment.date,
    paymentMethod: firstPayment.paymentMethod,
    payments: payments.sort((a, b) => b.date.getTime() - a.date.getTime())
  };
};
```

### 2.2 Modificación de addPayment Existente

**Archivo:** `src/services/paymentService.ts`

**ANTES:**
```typescript
export const addPayment = async (payment: Omit<Payment, 'id'>) => {
  const paymentRef = await addDoc(collection(firestore, 'payments'), {
    ...payment,
    date: Timestamp.fromDate(payment.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return paymentRef.id;
};
```

**DESPUÉS (sin cambios - sigue funcionando):**
```typescript
// ✅ No requiere modificación
// Los campos batchId, clientId, paymentType son opcionales
// Si no se pasan, simplemente no se guardan (undefined)
export const addPayment = async (payment: Omit<Payment, 'id'>) => {
  const paymentRef = await addDoc(collection(firestore, 'payments'), {
    ...payment,
    date: Timestamp.fromDate(payment.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return paymentRef.id;
};
```

---

## 3. Flujos de Datos

### 3.1 Flujo ANTES (Pago Individual de Proyecto)

```
┌──────────────┐
│ ProjectPage  │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│ PaymentDialog      │
│ - projectId        │
│ - amount           │
│ - paymentMethod    │
└────────┬───────────┘
         │
         ▼
┌──────────────────────┐
│ addPayment()         │
│ - crea 1 documento   │
└────────┬─────────────┘
         │
         ▼
┌────────────────────────┐
│ Firebase: payments/    │
│ {                      │
│   projectId: 'proj1'   │
│   amount: 100000       │
│   ...                  │
│ }                      │
└────────────────────────┘
```

### 3.2 Flujo ANTES (Pago de Cliente - PROBLEMA)

```
┌──────────────────────────┐
│ NewPaymentPage           │
│ /clients/newPayment/123  │
└──────┬───────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ Distribuir pago en proyectos   │
│ - Calcular allocations (FIFO)  │
│ - Crear pagos individuales     │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ for (allocation) {           │
│   await addPayment({         │
│     projectId: proj,         │
│     amount: amt              │
│   })                         │
│ }                            │
└────────┬─────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Firebase: payments/            │
│                                │
│ ❌ PROBLEMA:                   │
│ 3 documentos SIN relación      │
│                                │
│ Doc1: { projectId: 'A', ... }  │
│ Doc2: { projectId: 'B', ... }  │
│ Doc3: { projectId: 'C', ... }  │
│                                │
│ ⚠️  No se pueden vincular      │
│ ⚠️  No se pueden eliminar juntos│
└────────────────────────────────┘
```

### 3.3 Flujo DESPUÉS (Pago de Cliente - SOLUCIÓN)

```
┌──────────────────────────┐
│ NewPaymentPage           │
│ /clients/newPayment/123  │
└──────┬───────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ Distribuir pago en proyectos   │
│ - Calcular allocations (FIFO)  │
│ - 🆕 Generar batchId (UUID)    │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ createBatchPayment({             │
│   clientId: '123',               │
│   totalAmount: 150000,           │
│   allocations: [...]             │
│ })                               │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Firebase Batch Write (ATÓMICO)      │
│                                     │
│ const batchId = crypto.randomUUID() │
│ const batch = writeBatch(firestore) │
│                                     │
│ for (allocation) {                  │
│   batch.set(docRef, {               │
│     projectId: proj,                │
│     amount: amt,                    │
│     batchId: batchId,  ✅           │
│     clientId: '123',   ✅           │
│     paymentType: 'cliente' ✅       │
│   })                                │
│ }                                   │
│                                     │
│ await batch.commit()                │
└────────┬────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ Firebase: payments/                │
│                                    │
│ ✅ SOLUCIÓN:                       │
│ 3 documentos VINCULADOS            │
│                                    │
│ Doc1: {                            │
│   projectId: 'A',                  │
│   batchId: 'uuid-123',  ✅         │
│   clientId: '123',      ✅         │
│   paymentType: 'cliente' ✅        │
│ }                                  │
│                                    │
│ Doc2: {                            │
│   projectId: 'B',                  │
│   batchId: 'uuid-123',  ✅         │
│   clientId: '123',      ✅         │
│   paymentType: 'cliente' ✅        │
│ }                                  │
│                                    │
│ Doc3: {                            │
│   projectId: 'C',                  │
│   batchId: 'uuid-123',  ✅         │
│   clientId: '123',      ✅         │
│   paymentType: 'cliente' ✅        │
│ }                                  │
│                                    │
│ ✅ Se pueden consultar juntos      │
│ ✅ Se pueden eliminar juntos       │
│ ✅ Total batch = sum(amounts)      │
└────────────────────────────────────┘
```

### 3.4 Flujo de Eliminación de Batch

```
┌──────────────────────────┐
│ Usuario hace clic en     │
│ "Eliminar" en batch      │
└──────┬───────────────────┘
       │
       ▼
┌────────────────────────────────┐
│ ConfirmDeleteBatchDialog       │
│ - Muestra resumen del batch    │
│ - Confirma acción              │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ deleteBatchPayment(batchId)      │
│                                  │
│ 1. getBatchPayments(batchId)     │
│    → Obtiene [payment1, ... N]   │
│                                  │
│ 2. writeBatch(firestore)         │
│    - batch.delete(doc1)          │
│    - batch.delete(doc2)          │
│    - batch.delete(docN)          │
│                                  │
│ 3. await batch.commit()          │
│    → ATÓMICO: todo o nada        │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Invalidate TanStack Query      │
│ - queryClient.invalidateQueries│
│ - Actualiza UI automáticamente │
└────────────────────────────────┘
```

---

## 4. Patrones de Consulta Firebase

### 4.1 Consultar Pagos de un Batch

```typescript
// Query simple
const q = query(
  collection(firestore, 'payments'),
  where('batchId', '==', 'uuid-123-456')
);

const snapshot = await getDocs(q);

// Resultado: todos los pagos vinculados al batch
```

### 4.2 Consultar Pagos de Cliente (Todos los Batches)

```typescript
// Query por clientId
const q = query(
  collection(firestore, 'payments'),
  where('clientId', '==', 'client123'),
  orderBy('date', 'desc')
);

const snapshot = await getDocs(q);

// Resultado: todos los pagos del cliente (agrupados o no)
```

### 4.3 Consultar Solo Pagos Tipo Cliente

```typescript
// Query por tipo de pago
const q = query(
  collection(firestore, 'payments'),
  where('paymentType', '==', 'cliente')
);

const snapshot = await getDocs(q);

// Resultado: solo pagos originados desde cliente
```

### 4.4 Query Compuesta (Proyecto + Tipo)

```typescript
// Query combinada
const q = query(
  collection(firestore, 'payments'),
  where('projectId', '==', 'proj123'),
  where('paymentType', '==', 'cliente')
);

const snapshot = await getDocs(q);

// Resultado: pagos de cliente para proyecto específico
```

### 4.5 Índices Compuestos Requeridos

**⚠️ IMPORTANTE:** Firebase requerirá crear índices compuestos

```
Crear en Firebase Console > Firestore > Indexes:

Index 1:
- Collection: payments
- Fields:
  - clientId (Ascending)
  - date (Descending)

Index 2:
- Collection: payments
- Fields:
  - projectId (Ascending)
  - paymentType (Ascending)
  - date (Descending)
```

---

## 5. Componentes Nuevos

### 5.1 BatchPaymentDialog

**Archivo:** `src/components/dialogs/BatchPaymentDialog.tsx`

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getBatchPaymentSummary } from '@/services/paymentService';
import { useQuery } from '@tanstack/react-query';

interface BatchPaymentDialogProps {
  batchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BatchPaymentDialog: React.FC<BatchPaymentDialogProps> = ({
  batchId,
  open,
  onOpenChange
}) => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['batchPayment', batchId],
    queryFn: () => getBatchPaymentSummary(batchId),
    enabled: open && !!batchId
  });

  if (isLoading) return <div>Cargando...</div>;
  if (!summary) return <div>No se encontró el batch</div>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Detalle de Pago de Cliente - {summary.clientName}
          </DialogTitle>
        </DialogHeader>

        {/* Resumen */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Pagado</p>
              <p className="text-2xl font-bold">
                ${summary.totalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Proyectos</p>
              <p className="text-2xl font-bold">{summary.paymentCount}</p>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <p>Fecha: {summary.date.toLocaleDateString()}</p>
            <p>Método: {summary.paymentMethod}</p>
          </div>
        </div>

        {/* Lista de pagos */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Distribución por Proyecto</h3>
          <div className="space-y-2">
            {summary.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div>
                  <p className="font-medium">Proyecto {payment.projectId}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.date.toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold">
                  ${payment.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### 5.2 ConfirmDeleteBatchDialog

**Archivo:** `src/components/dialogs/ConfirmDeleteBatchDialog.tsx`

```typescript
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import { deleteBatchPayment } from '@/services/paymentService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ConfirmDeleteBatchDialogProps {
  batchId: string;
  paymentCount: number;
  totalAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConfirmDeleteBatchDialog: React.FC<ConfirmDeleteBatchDialogProps> = ({
  batchId,
  paymentCount,
  totalAmount,
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteBatchPayment(batchId),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Batch eliminado',
          description: `Se eliminaron ${result.deletedCount} pagos correctamente`,
        });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'No se pudo eliminar el batch',
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar batch de pagos?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará <strong>{paymentCount} pagos</strong> por un total de{' '}
            <strong>${totalAmount.toLocaleString()}</strong>.
            <br />
            <br />
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar Batch'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

---

## 6. Impacto en Componentes Existentes

### 6.1 account-statement-dialog.tsx

**Líneas 251-255 - Modificar indicador**

**ANTES:**
```typescript
<span className="text-xs text-muted-foreground">
  1
</span>
```

**DESPUÉS:**
```typescript
{payment.batchId ? (
  <button
    onClick={() => setSelectedBatchId(payment.batchId)}
    className="text-xs text-primary hover:underline cursor-pointer"
  >
    1(*)
  </button>
) : (
  <span className="text-xs text-muted-foreground">1</span>
)}
```

### 6.2 src/app/clients/newPayment/[clientId]/page.tsx

**Líneas 236-247 - Modificar creación de pagos**

**ANTES:**
```typescript
for (const allocation of currentAllocations) {
  await addPayment({
    projectId: allocation.projectId,
    amount: allocation.amount,
    paymentMethod: paymentData.paymentMethod,
    date: paymentData.date,
    notes: paymentData.notes || '',
  });
}
```

**DESPUÉS:**
```typescript
// 🆕 Usar createBatchPayment en lugar de addPayment individual
await createBatchPayment({
  clientId: params.clientId,
  totalAmount: paymentData.amount,
  paymentMethod: paymentData.paymentMethod,
  date: paymentData.date,
  notes: paymentData.notes || '',
  allocations: currentAllocations.map(alloc => ({
    projectId: alloc.projectId,
    amount: alloc.amount
  }))
});
```

### 6.3 src/app/payments/columns.tsx

**Agregar columna de tipo de pago**

```typescript
{
  accessorKey: 'paymentType',
  header: 'Tipo',
  cell: ({ row }) => {
    const type = row.getValue('paymentType') as string | undefined;

    if (!type) return null;

    return (
      <Badge variant={type === 'cliente' ? 'secondary' : 'default'}>
        {type === 'cliente' ? 'Cliente' : 'Proyecto'}
      </Badge>
    );
  }
}
```

**Agregar acción "Ver Batch" en dropdown**

```typescript
// En el DropdownMenu de acciones
{row.original.batchId && (
  <DropdownMenuItem
    onClick={() => handleViewBatch(row.original.batchId!)}
  >
    <Eye className="mr-2 h-4 w-4" />
    Ver Batch Completo
  </DropdownMenuItem>
)}
```

---

## 🎯 Resumen de Arquitectura

### Principios de Diseño

1. **Backward Compatibility** ✅
   - Campos opcionales no rompen pagos existentes
   - addPayment() sigue funcionando sin cambios

2. **Atomicidad** ✅
   - Firebase Batch Writes para operaciones grupales
   - Todo o nada en creación y eliminación

3. **Trazabilidad** ✅
   - batchId vincula pagos relacionados
   - clientId identifica origen del pago
   - paymentType distingue flujos

4. **Consultas Eficientes** ✅
   - Índices compuestos para queries rápidas
   - where() clauses optimizadas

5. **UI Consistente** ✅
   - Indicador `1(*)` para batch payments
   - Dialogs reutilizables con TanStack Query
   - Confirmación antes de eliminar batches

### Métricas de Cambio

- **Tipos modificados:** 1 (Payment)
- **Tipos nuevos:** 3 (BatchPaymentSummary, CreateBatchPaymentParams, DeleteBatchResult)
- **Servicios nuevos:** 4 funciones (createBatchPayment, getBatchPayments, deleteBatchPayment, getBatchPaymentSummary)
- **Componentes nuevos:** 2 (BatchPaymentDialog, ConfirmDeleteBatchDialog)
- **Componentes modificados:** 3 (account-statement-dialog, newPayment page, payments columns)
- **Índices Firebase:** 2 compuestos requeridos

---

**Próximo documento:** `03-PLAN-IMPLEMENTACION.md` con pasos detallados de implementación
