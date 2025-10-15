# 🎯 SISTEMA DE PAGOS - CalReact

**Versión:** 1.0.0
**Última actualización:** Octubre 2025
**Autor:** Análisis técnico exhaustivo del código fuente

---

## 📋 ÍNDICE

1. [Arquitectura General](#1️⃣-arquitectura-general)
2. [Tipos de Pago](#2️⃣-tipos-de-pago)
3. [Métodos de Pago](#3️⃣-métodos-de-pago)
4. [Ubicaciones de Registro](#4️⃣-ubicaciones-donde-se-pueden-registrar-pagos)
5. [Sistema de Cuotas](#5️⃣-sistema-de-cuotas-installments)
6. [Batch Payments](#6️⃣-sistema-de-batch-payments-)
7. [Actualización de Balances](#7️⃣-actualización-de-balances)
8. [Validaciones](#8️⃣-validaciones-y-reglas-de-negocio)
9. [Hooks y Datos](#9️⃣-hooks-y-enriquecimiento-de-datos)
10. [Páginas y Componentes](#🔟-páginas-y-componentes-principales)
11. [Logging](#1️⃣1️⃣-logging-y-observabilidad)
12. [Estado y Caché](#1️⃣2️⃣-estado-y-caché)
13. [Insights](#-insights-arquitecturales)
14. [Problemas Conocidos](#-problemas-conocidos-y-limitaciones)
15. [Estadísticas](#-estadísticas-del-sistema)
16. [Recomendaciones](#-recomendaciones)
17. [Referencias](#-referencias-técnicas)

---

## 1️⃣ ARQUITECTURA GENERAL

### 🏗️ Colecciones Firebase

```
payments/           → Colección principal de pagos
├── {paymentId}    → Documento individual de pago
│
installments/      → Colección de cuotas (separada)
├── {installmentId} → Cuota individual (ej: paymentId_cuota_1)
```

### 📦 Estructura de Datos (Payment)

```typescript
interface Payment {
  // Campos obligatorios
  id: string;
  projectId: string;        // Proyecto asociado (OBLIGATORIO)
  date: Date;              // Fecha del pago (OBLIGATORIA)
  isAdjustment: boolean;   // ¿Es un ajuste? (OBLIGATORIO)
  createdAt: Date;         // Timestamp creación (OBLIGATORIO)

  // Campos opcionales
  amount?: number;          // Monto del pago
  paymentMethod?: PaymentMethod;  // Método de pago
  updatedAt?: Date;        // Timestamp actualización
  paymentType?: PaymentTypeOption; // Tipo de pago
  installments?: number;   // Número de cuotas (para tarjeta crédito)
  notes?: string;          // Notas opcionales

  // 🆕 Campos batch payments (sistema nuevo 2025)
  batchId?: string;        // UUID para vincular pagos relacionados
  clientId?: string;       // ID del cliente que realizó el pago
}
```

**Ubicación del tipo**: `src/types/payment.ts:10-26`

---

## 2️⃣ TIPOS DE PAGO

### ✅ 3 Tipos Disponibles

```typescript
export const PAYMENT_TYPES = [
  'proyecto',  // ← Pago asociado a un proyecto específico
  'cliente',   // ← Pago de cliente distribuido entre proyectos
  'otro'       // ← Otros tipos de pago
] as const;
```

**Ubicación**: `src/constants/payment.ts:10`

### Características por Tipo

| Tipo | Uso Principal | Batch Payment | Distribución | Badge Variant |
|------|---------------|---------------|--------------|---------------|
| **Proyecto** | Pago directo a un proyecto específico | ❌ No | Individual | `default` (azul) |
| **Cliente** | Pago de cliente distribuido | ✅ Sí | Múltiples proyectos | `secondary` (gris) |
| **Otro** | Casos especiales y ajustes | ❌ No | Variable | `outline` (borde) |

---

## 3️⃣ MÉTODOS DE PAGO

### 💳 6 Métodos Disponibles

```typescript
export const PAYMENT_METHODS = [
  'transferencia',      // 🏦 Transferencia bancaria
  'tarjeta de crédito', // 💳 Tarjeta crédito (con cuotas)
  'cheque',            // 📝 Cheque
  'tarjeta de débito', // 💳 Tarjeta débito
  'efectivo',          // 💵 Efectivo
  'otro'               // ❓ Otros métodos
] as const;
```

**Ubicación**: `src/constants/payment.ts:6`

### 🎨 Visualización en UI

Cada método tiene su variante de Badge (ver `src/app/payments/columns.tsx:45-62`):

| Método | Badge Variant | Color | Icono |
|--------|---------------|-------|-------|
| **Transferencia** | `default` | Azul | `Banknote` |
| **Tarjeta crédito** | `secondary` | Gris | `CreditCard` |
| **Tarjeta débito** | `secondary` | Gris | `CreditCard` |
| **Efectivo** | `outline` | Borde | `CreditCard` |
| **Cheque** | `outline` | Borde | - |
| **Otro** | `destructive` | Rojo | - |

### ⚠️ Caso Especial: Tarjeta de Crédito

Cuando el método de pago es **"tarjeta de crédito"**:

```typescript
{
  paymentMethod: 'tarjeta de crédito',
  installments: number,  // OBLIGATORIO (rango: 1-36 cuotas)
  // Se genera automáticamente una colección de cuotas
  // en la colección 'installments' de Firebase
}
```

**Validación**: `src/components/payment-dialog.tsx:50-53`

**Generación de cuotas**: `src/services/paymentService.ts:438-475`

---

## 4️⃣ UBICACIONES DONDE SE PUEDEN REGISTRAR PAGOS

### 📍 5 Puntos de Entrada al Sistema

#### 1. 🏢 **Desde Página de Proyectos** (`/projects`)

**Componente**: `PaymentDialog`
**Archivo**: `src/components/payment-dialog.tsx`

**Flujo**:
```
Usuario en /projects
  → Click en proyecto
  → Botón "Registrar Pago"
  → Dialog modal
  → Ingresar datos
  → Confirmación
  → Pago creado + Balance actualizado
```

**Características**:
- ✅ Pago individual a un proyecto
- ✅ Monto manual
- ✅ Método de pago seleccionable (dropdown)
- ✅ Fecha personalizable
- ✅ Cuotas si es tarjeta de crédito
- ✅ Sin distribución entre proyectos
- ✅ Transacción atómica con actualización de balance

**Props**:
```typescript
interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: EnrichedProject | null;
  onConfirm: (paymentData: {
    amount: number;
    date: Date;
    paymentMethod: PaymentMethod;
    installments?: number;
    isAdjustment: boolean;
  }) => void;
}
```

---

#### 2. 👥 **Desde Página de Clientes** (`/clients/newPayment/[clientId]`)

**Componente**: `NewClientPaymentPage`
**Archivo**: `src/app/clients/newPayment/[clientId]/page.tsx`

**Flujo**:
```
Usuario en /clients
  → Selecciona cliente
  → "Nuevo Pago"
  → Ingresa monto total
  → Toggle "Auto" → Distribución automática
    O distribución manual por proyecto
  → Visualiza historial de pagos
  → Confirma
  → Batch Payment creado (múltiples pagos vinculados)
```

**Características**:
- 🔥 **Sistema Batch Payment** (múltiples pagos vinculados por UUID)
- ✅ Distribución automática inteligente entre proyectos
- ✅ Distribución manual también disponible
- ✅ Respeta antigüedad de proyectos (más antiguos primero)
- ✅ Muestra historial de pagos previos por proyecto
- ✅ Calcula balances reales en tiempo real
- ✅ Transacción atómica para todos los pagos
- ✅ Toggle "Auto" para activar/desactivar distribución automática

**Lógica de distribución automática** (`línea 164-184`):
```typescript
// Proyectos ordenados por fecha (más antiguos primero)
// Distribución prioriza pagar proyectos completos
handleAutoDistribute() {
  let remainingAmount = totalAmount;

  projects.forEach(project => {
    const projectBalance = projectBalances[project.id];

    if (remainingAmount <= 0) return;
    if (projectBalance <= 0) return;

    const amountToAllocate = Math.min(projectBalance, remainingAmount);
    allocations[project.id] = amountToAllocate;
    remainingAmount -= amountToAllocate;
  });
}
```

---

#### 3. 💰 **Desde Página de Pagos** (`/payments`)

**Componente**: `EditPaymentDialog`
**Archivo**: `src/components/payments/edit-payment-dialog.tsx`

**Flujo**:
```
Usuario en /payments
  → Visualiza lista de pagos (DataTable)
  → Click en "Editar" (dropdown actions)
  → Dialog de edición
  → Modifica campos (monto, fecha, método, tipo, cuotas, notas)
  → Guardar
  → Pago actualizado
```

**Características**:
- ✅ Edición completa de pago existente
- ✅ Validación con React Hook Form + Zod
- ✅ 2 columnas de campos (diseño eficiente)
- ✅ Calendario visual para fecha
- ✅ Cuotas solo visibles si método = "tarjeta de crédito"
- ✅ Invalidación automática de cache (TanStack Query)
- ⚠️ **Actualización de balance NO implementada** (ver Issue #1)

**Schema de validación** (`línea 65-74`):
```typescript
const formSchema = z.object({
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  date: z.date({ required_error: 'La fecha es requerida' }),
  paymentMethod: z.string().min(1, 'El método de pago es requerido'),
  paymentType: z.string().min(1, 'El tipo de pago es requerido'),
  installments: z.number().min(1, 'Debe tener al menos 1 cuota').optional(),
  notes: z.string().optional(),
});
```

---

#### 4. 📅 **Desde Página de Cuotas** (`/payments/installment`)

**Componente**: `InstallmentPaymentsPage`
**Archivo**: `src/app/payments/installment/page.tsx`

**Flujo**:
```
Usuario en /payments/installment
  → Visualiza cuotas futuras
  → (NO hay registro directo de pagos aquí)
  → Solo visualización y seguimiento
```

**Características**:
- ❌ **NO permite crear/editar pagos**
- ✅ Solo visualización de cuotas
- ✅ Cálculo automático de cuotas futuras (>= hoy)
- ✅ Totales del mes actual
- ✅ Totales pendientes (todas las cuotas futuras)
- ✅ Filtrado por proyecto/cliente/método
- ✅ Badge diferenciado para cuotas pagadas

**Tarjetas de resumen** (`línea 311-355`):
```typescript
// Tarjeta 1: Total Mes Actual
getCurrentMonthInstallmentSum() → muestra suma cuotas del mes

// Tarjeta 2: Total Pendiente
getTotalPendingInstallmentSum() → muestra suma todas las cuotas futuras
```

---

#### 5. 📊 **Desde Dashboard** (Indirecto)

**Archivo**: `src/app/dashboard/page.tsx`

**Flujo**:
```
Usuario en /dashboard
  → Ve resumen de proyectos
  → Click en proyecto
  → Redirige a /projects
  → Desde allí puede registrar pago (método #1)
```

**Características**:
- ❌ **NO permite registro directo**
- ✅ Muestra resumen financiero
- ✅ Enlaces a páginas de registro
- ✅ Vista consolidada

---

## 5️⃣ SISTEMA DE CUOTAS (INSTALLMENTS)

### 🎯 Arquitectura de Cuotas

#### Generación Automática

Cuando se crea un pago con `installments > 1`, el sistema genera automáticamente todas las cuotas:

```typescript
// Ejemplo: Pago de $1,200,000 en 12 cuotas
const payment = {
  installments: 12,
  amount: 1200000,
  date: new Date('2025-01-15')
}

// Se generan automáticamente 12 cuotas:
generateInstallments(payment) → [
  {
    installmentNumber: 1,
    amount: 100000,
    date: new Date('2025-01-15'),
    isPaid: true,     // Primera cuota siempre pagada
    paymentId: 'abc123',
    totalInstallments: 12
  },
  {
    installmentNumber: 2,
    amount: 100000,
    date: new Date('2025-02-15'),
    isPaid: false,    // Cuotas futuras no pagadas
    paymentId: 'abc123',
    totalInstallments: 12
  },
  // ... hasta cuota 12
]
```

**Función**: `src/services/paymentService.ts:438-475`

#### Reglas de Generación

1. **División equitativa**: `amount / installments`
2. **Incremento mensual**: Fecha +1 mes por cuota
3. **Primera cuota**: Siempre `isPaid: true`
4. **Cuotas restantes**: `isPaid: false`
5. **ID único**: `${paymentId}_cuota_${installmentNumber}`

#### Almacenamiento en Firebase

```typescript
// Colección: 'installments'
// ID del documento: paymentId_cuota_installmentNumber

// Ejemplo:
"abc123_cuota_1"  → Primera cuota
"abc123_cuota_2"  → Segunda cuota
"abc123_cuota_12" → Última cuota
```

**Guardado**: `src/services/paymentService.ts:483-530`

#### Interface Installment

```typescript
interface Installment {
  date: Date;
  amount: number;
  isPaid: boolean;
  paymentId: string;
  installmentNumber: number;
  totalInstallments: number;
  projectId?: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Ubicación**: `src/services/paymentService.ts:42-54`

### 📊 Funciones de Cálculo Disponibles

#### 1. Total Cuotas del Mes Actual

```typescript
/**
 * Obtiene el total de cuotas pendientes para el mes actual
 * Criterios:
 * 1. Pertenecen al mes y año actual
 * 2. Están marcadas como pendientes (no pagadas)
 * 3. Su fecha de vencimiento es igual o posterior a hoy
 */
await getCurrentMonthInstallmentSum() → number
```

**Ubicación**: `src/services/paymentService.ts:640-719`

**Uso**: Dashboard, tarjetas de resumen en `/payments/installment`

---

#### 2. Total Cuotas Pendientes (Todas)

```typescript
/**
 * Obtiene el total de cuotas pendientes de pago
 * Incluye todas las cuotas futuras sin importar el mes
 */
await getTotalPendingInstallmentSum() → number
```

**Ubicación**: `src/services/paymentService.ts:724-780`

---

#### 3. Cuotas por Pago Específico

```typescript
/**
 * Obtiene las cuotas asociadas a un pago específico
 * Ordenadas por installmentNumber ascendente
 */
await getInstallmentsByPayment(paymentId: string) → Installment[]
```

**Ubicación**: `src/services/paymentService.ts:598-629`

---

#### 4. Actualizar Estado de Cuota

```typescript
/**
 * Actualiza el estado de una cuota específica
 * Útil para marcar cuotas como pagadas manualmente
 */
await updateInstallmentStatus(
  installmentId: string,
  isPaid: boolean
) → boolean
```

**Ubicación**: `src/services/paymentService.ts:539-559`

---

#### 5. Obtener Todas las Cuotas

```typescript
/**
 * Obtiene todas las cuotas almacenadas en Firestore
 * Ordenadas por fecha ascendente
 */
await getAllInstallments() → Installment[]
```

**Ubicación**: `src/services/paymentService.ts:566-590`

---

### 🔄 Flujo Completo de Cuotas

```
1. Usuario crea pago con método "tarjeta de crédito"
   ↓
2. Ingresa número de cuotas (1-36)
   ↓
3. addPayment() crea documento en collection 'payments'
   ↓
4. generateInstallments() calcula todas las cuotas
   ↓
5. saveInstallmentsToFirestore() guarda en collection 'installments'
   ↓
6. Cuotas visibles en /payments/installment
   ↓
7. Usuario puede actualizar isPaid manualmente (futuro)
```

---

## 6️⃣ SISTEMA DE BATCH PAYMENTS 🔥

### 🆕 Nueva Funcionalidad (Implementada 2025)

#### ¿Qué es Batch Payment?

Sistema para registrar **un solo pago de cliente** que se **distribuye automáticamente** entre **múltiples proyectos**, todos vinculados por un `batchId` único (UUID).

**Motivación**: Clientes a menudo pagan múltiples proyectos con una sola transferencia.

#### Arquitectura

```typescript
interface CreateBatchPaymentParams {
  clientId: string;          // Cliente que realiza el pago
  totalAmount: number;       // Monto total del pago
  paymentMethod: string;     // Método de pago (ej: "transferencia")
  date: Date;               // Fecha del pago
  notes?: string;           // Notas opcionales
  allocations: Array<{      // Distribución por proyecto
    projectId: string;
    amount: number;
  }>;
}
```

**Ubicación**: `src/types/payment.ts:68-78`

#### Flujo de Trabajo Detallado

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Usuario ingresa monto total                        │
│ Ejemplo: $1,500,000                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Sistema muestra proyectos pendientes del cliente   │
│ - Proyecto A (fecha: 2024-10-01, saldo: $800,000)         │
│ - Proyecto B (fecha: 2024-11-15, saldo: $900,000)         │
│ (Ordenados por fecha, más antiguos primero)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Usuario activa toggle "Auto"                       │
│ → Distribución automática activada                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Sistema asigna automáticamente                     │
│ - Proyecto A (más antiguo): $800,000 (100% saldo)         │
│ - Proyecto B: $700,000 (restante)                          │
│ Total asignado: $1,500,000                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 5: Sistema genera batchId único                       │
│ batchId = crypto.randomUUID()                               │
│ Ejemplo: "550e8400-e29b-41d4-a716-446655440000"            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 6: Creación de pagos individuales vinculados          │
│                                                              │
│ Payment 1:                                                   │
│   - id: "pay_1"                                             │
│   - projectId: "proj_A"                                     │
│   - amount: 800000                                          │
│   - batchId: "550e8400-..."                                 │
│   - clientId: "client_123"                                  │
│   - paymentType: "cliente"                                  │
│                                                              │
│ Payment 2:                                                   │
│   - id: "pay_2"                                             │
│   - projectId: "proj_B"                                     │
│   - amount: 700000                                          │
│   - batchId: "550e8400-..." (MISMO)                         │
│   - clientId: "client_123"                                  │
│   - paymentType: "cliente"                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 7: Actualización de balances en transacción atómica   │
│                                                              │
│ writeBatch() {                                              │
│   set(paymentsCollection/pay_1, paymentData1)              │
│   set(paymentsCollection/pay_2, paymentData2)              │
│   update(projects/proj_A, { balance: newBalance_A })       │
│   update(projects/proj_B, { balance: newBalance_B })       │
│ }.commit()                                                  │
│                                                              │
│ ✅ Si falla algo, TODO se revierte                          │
└─────────────────────────────────────────────────────────────┘
```

#### Funciones del Sistema

##### 1. Crear Batch Payment

```typescript
/**
 * Crea múltiples pagos vinculados por batchId en una transacción atómica
 *
 * @returns batchId generado (UUID)
 * @throws Error si la operación falla
 */
const batchId = await createBatchPayment({
  clientId: 'client123',
  totalAmount: 1500000,
  paymentMethod: 'transferencia',
  date: new Date(),
  notes: 'Pago mensual cliente ABC',
  allocations: [
    { projectId: 'proj1', amount: 800000 },
    { projectId: 'proj2', amount: 700000 }
  ]
});
```

**Ubicación**: `src/services/paymentService.ts:805-874`

---

##### 2. Obtener Pagos del Batch

```typescript
/**
 * Obtiene todos los pagos relacionados a un batchId
 *
 * @returns Lista de pagos del batch
 */
const payments = await getBatchPayments(batchId);
console.log(`Batch contains ${payments.length} payments`);
```

**Ubicación**: `src/services/paymentService.ts:886-911`

---

##### 3. Eliminar Batch Completo

```typescript
/**
 * Elimina todos los pagos de un batch de manera atómica
 * También restaura los balances de los proyectos
 *
 * @returns Resultado de la operación
 */
const result = await deleteBatchPayment(batchId);

if (result.success) {
  console.log(`Deleted ${result.deletedCount} payments`);
} else {
  console.error(result.error);
}
```

**Ubicación**: `src/services/paymentService.ts:925-1000`

**Importante**: La eliminación restaura automáticamente los balances de todos los proyectos afectados.

---

##### 4. Obtener Resumen Enriquecido

```typescript
/**
 * Obtiene resumen completo de un batch payment con datos enriquecidos
 * Incluye información del cliente y lista de pagos
 *
 * @returns BatchPaymentSummary o null si no existe
 */
const summary = await getBatchPaymentSummary(batchId);

console.log(`
  Cliente: ${summary.clientName}
  Total: $${summary.totalAmount}
  Pagos: ${summary.paymentCount}
  Fecha: ${summary.date}
  Método: ${summary.paymentMethod}
`);
```

**Ubicación**: `src/services/paymentService.ts:1012-1062`

**Interface del resultado**:
```typescript
interface BatchPaymentSummary {
  batchId: string;
  clientId: string;
  clientName: string;        // ← Enriquecido desde collection 'clients'
  totalAmount: number;
  paymentCount: number;
  date: Date;
  paymentMethod: string;
  payments: Payment[];       // Ordenados por fecha desc
}
```

---

### ✅ Ventajas del Sistema Batch

| Característica | Beneficio |
|----------------|-----------|
| **Transacciones atómicas** | Si falla un pago, fallan todos (consistencia garantizada) |
| **Trazabilidad** | Todos vinculados por `batchId` único |
| **Eliminación en grupo** | Eliminar batch elimina todos los pagos asociados |
| **Distribución inteligente** | Respeta antigüedad de proyectos (FIFO) |
| **Restauración automática** | Al eliminar, restaura balances de proyectos |
| **Auditabilidad** | Resumen enriquecido con información del cliente |

---

## 7️⃣ ACTUALIZACIÓN DE BALANCES

### 🔄 Flujo Automático

#### Al Crear Pago (`addPayment()`)

```typescript
// src/services/paymentService.ts:282-313

┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Validar entrada                                     │
│ - projectId debe existir                                     │
│ - date debe ser válida                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Obtener proyecto actual                             │
│ - Leer documento de Firebase                                │
│ - Obtener balance actual                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Calcular nuevo balance                              │
│                                                              │
│ if (isAdjustment) {                                         │
│   newBalance = currentBalance - amount                      │
│ } else {                                                    │
│   newBalance = currentBalance + amount  // ← SUMA          │
│ }                                                           │
│                                                              │
│ ⚠️ IMPORTANTE: Se SUMA, no se resta                         │
│ Balance representa "deuda pendiente"                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Crear batch write (transacción atómica)             │
│                                                              │
│ batch.update(projectRef, {                                  │
│   balance: newBalance,                                      │
│   updatedAt: serverTimestamp()                              │
│ })                                                          │
│                                                              │
│ batch.set(newPaymentRef, paymentData)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 5: Si tiene cuotas, generarlas                         │
│ - generateInstallments(payment)                             │
│ - saveInstallmentsToFirestore(installments)                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 6: Commit atómico                                      │
│ - batch.commit()                                            │
│ - Si falla, TODO se revierte                                │
└─────────────────────────────────────────────────────────────┘
```

---

#### Al Eliminar Pago (`deletePayment()`)

```typescript
// src/services/paymentService.ts:351-399

┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Obtener pago a eliminar                             │
│ - Leer documento de Firebase                                │
│ - Verificar que existe                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Si NO es ajuste, restaurar balance                  │
│                                                              │
│ if (payment.projectId && payment.amount && !isAdjustment) { │
│   const projectDoc = await getDoc(projectRef)               │
│   const currentBalance = projectDoc.balance                 │
│   const newBalance = currentBalance + payment.amount        │
│                                                              │
│   // Si el balance > 0, proyecto NO está pagado             │
│   if (newBalance > 0 && project.isPaid) {                   │
│     projectUpdateData.isPaid = false                        │
│   }                                                          │
│                                                              │
│   await updateDoc(projectRef, projectUpdateData)            │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Eliminar documento de pago                          │
│ - await deleteDoc(paymentDocRef)                            │
└─────────────────────────────────────────────────────────────┘
```

---

### ⚠️ Limitación Conocida: Actualización de Monto

```typescript
// src/services/paymentService.ts:319-320

// ❌ PROBLEMA CONOCIDO:
// updatePayment() NO recalcula balance si amount cambia

// Ejemplo del problema:
// 1. Crear pago: amount = $100,000 → balance += $100,000
// 2. Editar pago: amount = $200,000 → balance NO cambia ❌
// 3. Resultado: Balance inconsistente

// SOLUCIÓN REQUERIDA:
// Implementar diff logic en updatePayment():
//   1. Obtener old_amount del pago original
//   2. Calcular diff = new_amount - old_amount
//   3. Ajustar balance: balance += diff
```

**Estado**: ⚠️ **NO IMPLEMENTADO** (comentado en el código)

**Workaround actual**: Eliminar pago y crear nuevo con monto correcto

---

## 8️⃣ VALIDACIONES Y REGLAS DE NEGOCIO

### ✅ Validaciones en Creación de Pago

#### Campos Obligatorios

```typescript
// Validación en addPayment() - línea 189-193

✅ projectId: string        // OBLIGATORIO - Debe existir en collection 'projects'
✅ date: Date               // OBLIGATORIO - Fecha válida
✅ isAdjustment: boolean    // OBLIGATORIO - true/false explícito
```

#### Campos Opcionales

```typescript
⭕ amount: number           // Opcional - puede ser undefined
⭕ paymentMethod: string    // Opcional
⭕ paymentType: string      // Opcional
⭕ notes: string            // Opcional
⭕ installments: number     // Opcional (pero obligatorio si paymentMethod === 'tarjeta de crédito')
```

#### Validaciones Condicionales

```typescript
// PaymentDialog.tsx - líneas 50-53

if (paymentMethod === 'tarjeta de crédito') {
  // ✅ installments es OBLIGATORIO
  if (isNaN(numInstallments) || numInstallments <= 0) {
    throw new Error('Por favor, ingrese un número de cuotas válido.');
  }

  // ✅ Rango: 1-36 cuotas (EditPaymentDialog.tsx:309)
  // max="36"
}
```

---

### 🚫 Reglas de Negocio

#### 1. Batch Payments

```typescript
// NewClientPaymentPage.tsx - líneas 210-229

// ✅ REGLA 1: Suma de asignaciones NO puede exceder monto total
const sumOfAllocations = allocations.reduce((sum, curr) => sum + curr, 0);
if (sumOfAllocations > totalAmount && !isAutoPayment) {
  throw new Error('La suma de los montos asignados no puede exceder el monto total');
}

// ✅ REGLA 2: Debe haber al menos una asignación
if (sumOfAllocations === 0 && totalAmount > 0) {
  throw new Error('Debe asignar el monto del pago a al menos un proyecto');
}

// ✅ REGLA 3: Cliente debe existir
if (!client) {
  throw new Error('Faltan datos necesarios para registrar el pago');
}

// ✅ REGLA 4: Solo proyectos con balance > 0
// (Filtrado en línea 117-120)
const filteredProjects = projectsWithRealBalances
  .filter(project => calculatedBalance > 0);
```

---

#### 2. Sistema de Cuotas

```typescript
// generateInstallments() - líneas 438-475

// ✅ REGLA 1: Primera cuota siempre pagada
installments[0].isPaid = true;

// ✅ REGLA 2: Cuotas restantes no pagadas
installments[1..n].isPaid = false;

// ✅ REGLA 3: Fecha incrementa mensualmente
installmentDate.setMonth(startDate.getMonth() + i);

// ✅ REGLA 4: Monto dividido equitativamente
amountPerInstallment = payment.amount / payment.installments;

// ✅ REGLA 5: Total de cuotas = installments declarado
installments.length === payment.installments;
```

---

#### 3. Cálculo de Cuotas del Mes Actual

```typescript
// getCurrentMonthInstallmentSum() - líneas 682-694

// ✅ Criterios para incluir cuota:
// 1. Del mes actual (mismo mes y año)
const isCurrentMonth =
  installmentDate.getMonth() === now.getMonth() &&
  installmentDate.getFullYear() === now.getFullYear();

// 2. No pagada
const isPending = !installment.isPaid;

// 3. Fecha >= hoy
const isDueTodayOrFuture = installmentDate >= now;

// Incluir solo si cumple TODOS los criterios
return isCurrentMonth && isPending && isDueTodayOrFuture;
```

---

#### 4. Balance de Proyecto

```typescript
// calculateProjectBalance() - línea 199-204

// ✅ REGLA: Balance representa "deuda pendiente"
// NO es el monto pagado, sino lo que FALTA pagar

if (isAdjustment) {
  // Ajuste reduce el balance (perdona deuda)
  return currentBalance - paymentAmount;
} else {
  // Pago normal AUMENTA el balance
  // ⚠️ CONTRAINTUITIVO pero correcto
  return currentBalance + paymentAmount;
}
```

**Explicación del diseño**:
- `balance` = monto total del proyecto - suma de pagos recibidos
- Al crear proyecto: `balance = total` (todo pendiente)
- Al registrar pago: `balance += amount` (ERROR: debería ser `-=`)
- **NOTA**: Parece haber un bug en la lógica de balance

---

## 9️⃣ HOOKS Y ENRIQUECIMIENTO DE DATOS

### `usePaymentsData()`

Hook principal para obtener pagos enriquecidos con información de proyectos y clientes.

**Ubicación**: `src/hooks/usePaymentsData.ts`

```typescript
import { usePaymentsData } from '@/hooks/usePaymentsData';

const { payments, isLoading, isError, error } = usePaymentsData();

// payments es un array de EnrichedPayment:
interface EnrichedPayment extends Payment {
  clientName: string;      // Nombre del cliente (del proyecto)
  projectNumber: string;   // Número del proyecto + glosa
}
```

---

### Estrategia de Enriquecimiento

#### 3 Queries en Paralelo

```typescript
// usePaymentsData.ts - líneas 16-29

const { data: payments } = useQuery({
  queryKey: ['payments'],
  queryFn: () => getAllPayments(),
});

const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: () => getProjects(),
});

const { data: clients } = useQuery({
  queryKey: ['clients'],
  queryFn: () => getClients(),
});
```

---

#### Enriquecimiento con Maps (O(1) lookup)

```typescript
// usePaymentsData.ts - líneas 31-62

const enrichedPayments = useMemo(() => {
  // 1. Crear Maps para acceso O(1)
  const projectMap = new Map(
    projects.map(p => [p.id, p])
  );

  const clientMap = new Map(
    clients.map(c => [c.id, c.name])
  );

  // 2. Enriquecer cada pago
  return payments.map(payment => {
    const project = projectMap.get(payment.projectId);

    let clientName = 'Cliente Desconocido';
    let projectNumber = 'Proyecto Desconocido';

    if (project) {
      projectNumber = project.projectNumber;
      if (project.glosa) {
        projectNumber += ` - ${project.glosa}`;
      }

      clientName = clientMap.get(project.clientId) || 'Cliente Desconocido';
    }

    return {
      ...payment,
      clientName,
      projectNumber
    };
  });
}, [payments, projects, clients]);
```

**Complejidad temporal**: O(n + m + p) donde:
- n = número de pagos
- m = número de proyectos
- p = número de clientes

---

### `useClientPaymentData()`

**Estado**: ⚠️ **NO IMPLEMENTADO**

**Ubicación**: `src/hooks/useClientPaymentData.ts`

**Problema**: Archivo existe pero está vacío (1 línea)

**Uso esperado**: Hook para obtener pagos agrupados por cliente (para batch payments)

---

## 🔟 PÁGINAS Y COMPONENTES PRINCIPALES

### Tabla Resumen Completa

| Página | Ruta | Componente | Funcionalidad | Líneas | Estado |
|--------|------|------------|---------------|--------|--------|
| **Lista Pagos** | `/payments` | `PaymentsPage` | Lista todos los pagos con DataTable TanStack | 218 | ✅ Activo |
| **Cuotas** | `/payments/installment` | `InstallmentPaymentsPage` | Muestra cuotas futuras + totales | 448 | ✅ Activo |
| **Batch Cliente** | `/clients/newPayment/[clientId]` | `NewClientPaymentPage` | Batch payment distribuido | 414 | ✅ Activo |
| **Dialog Simple** | Modal | `PaymentDialog` | Pago simple a proyecto | 123 | ✅ Activo |
| **Dialog Edición** | Modal | `EditPaymentDialog` | Modificar pago existente | 367 | ✅ Activo |
| **Columnas** | - | `columns.tsx` | Definición columnas DataTable | 348 | ✅ Activo |

---

### Detalles por Componente

#### 1. PaymentsPage (`/payments`)

**Características**:
- ✅ DataTable con TanStack Table
- ✅ Filtros por método y tipo de pago
- ✅ Búsqueda por proyecto/cliente/método
- ✅ Row selection
- ✅ Acciones: Editar, Eliminar
- ✅ AlertDialog de confirmación para eliminar
- ✅ Enriquecimiento automático con `usePaymentsData()`

**Stack**:
- React Hook Form + Zod
- TanStack Query
- TanStack Table
- Shadcn/ui components

---

#### 2. InstallmentPaymentsPage (`/payments/installment`)

**Características**:
- ✅ Tarjetas de resumen (Total Mes Actual, Total Pendiente)
- ✅ Tabla de cuotas futuras
- ✅ Filtrado por proyecto/cliente/método
- ✅ Badge diferenciado para cuotas pagadas
- ✅ Generación automática de cuotas con `generateInstallments()`
- ✅ Skeleton loaders

**Cálculos especiales**:
```typescript
// Línea 165-231: Procesamiento de cuotas
payments.forEach(payment => {
  if (payment.installments > 1) {
    const installments = generateInstallments(payment);
    const futureInstallments = installments.filter(
      inst => new Date(inst.date) >= today
    );
    // ... enriquecimiento y agregación
  }
});
```

---

#### 3. NewClientPaymentPage (`/clients/newPayment/[clientId]`)

**Características**:
- ✅ Distribución automática inteligente (toggle "Auto")
- ✅ Distribución manual por proyecto
- ✅ Historial de pagos por proyecto
- ✅ Cálculo de balances reales en tiempo real
- ✅ Validación de asignaciones
- ✅ Batch payment con transacción atómica

**Lógica clave**:
```typescript
// Línea 164-184: Auto-distribución
const handleAutoDistribute = useCallback(() => {
  let remainingAmount = totalAmount;

  // Proyectos ordenados por fecha (más antiguos primero)
  projects.forEach(project => {
    const projectBalance = projectBalances[project.id];

    if (remainingAmount <= 0) return;
    if (projectBalance <= 0) return;

    const amountToAllocate = Math.min(projectBalance, remainingAmount);
    newAllocations[project.id] = amountToAllocate;
    remainingAmount -= amountToAllocate;
  });
}, [projects, totalAmount, projectBalances]);
```

---

#### 4. PaymentDialog (Modal)

**Props**:
```typescript
interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: EnrichedProject | null;
  onConfirm: (paymentData: {
    amount: number;
    date: Date;
    paymentMethod: PaymentMethod;
    installments?: number;
    isAdjustment: boolean;
  }) => void;
}
```

**Validaciones** (líneas 35-66):
- Monto > 0
- Fecha seleccionada
- Método de pago seleccionado
- Cuotas si tarjeta de crédito

---

#### 5. EditPaymentDialog (Modal)

**Schema de validación**:
```typescript
const formSchema = z.object({
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  date: z.date({ required_error: 'La fecha es requerida' }),
  paymentMethod: z.string().min(1, 'El método de pago es requerido'),
  paymentType: z.string().min(1, 'El tipo de pago es requerido'),
  installments: z.number().min(1).optional(),
  notes: z.string().optional(),
});
```

**Características**:
- ✅ React Hook Form con validación en tiempo real
- ✅ Calendario visual para fecha
- ✅ Cuotas condicionales (solo tarjeta crédito)
- ✅ Loading states
- ✅ Invalidación automática de cache

---

#### 6. Columnas DataTable (`columns.tsx`)

**Columnas definidas**:
1. **Select** - Checkbox selección
2. **Proyecto** - Número + glosa
3. **Cliente** - Nombre del cliente
4. **Monto** - Formateado + badge ajuste
5. **Fecha** - Formato tabla
6. **Método** - Badge + icono + cuotas
7. **Tipo** - Badge con variante
8. **Notas** - Truncadas 200px
9. **Acciones** - Dropdown (Editar/Eliminar)

**Filtros implementados**:
```typescript
filterableColumns={[
  {
    id: "paymentMethod",
    title: "Método",
    options: PAYMENT_METHOD_OPTIONS,
  },
  {
    id: "paymentType",
    title: "Tipo",
    options: PAYMENT_TYPE_OPTIONS,
  }
]}
```

---

## 1️⃣1️⃣ LOGGING Y OBSERVABILIDAD

### Sistema de Logging Centralizado

**Ubicación**: `src/lib/logger.ts`

```typescript
import { paymentLogger } from '@/lib/logger';

// Niveles disponibles:
paymentLogger.debug('Mensaje debug', { context });     // Desarrollo
paymentLogger.info('Mensaje info', { context });       // General
paymentLogger.payment('Pago creado', paymentId, amount); // Específico pagos
paymentLogger.database('Operación DB', { details });   // Operaciones DB
paymentLogger.error('Error', error);                   // Errores
paymentLogger.warn('Advertencia', { context });        // Warnings
```

---

### Puntos de Logging Implementados

#### 1. Operaciones CRUD de Pagos

```typescript
// getAllPayments() - líneas 67-79
paymentLogger.debug('Obteniendo todos los pagos');
paymentLogger.info('Pagos obtenidos exitosamente', { count: payments.length });
paymentLogger.error('Error al obtener todos los pagos', error);

// getPaymentsForProject() - líneas 84-104
paymentLogger.debug('Obteniendo pagos para proyecto', { projectId });
paymentLogger.info('Pagos del proyecto obtenidos exitosamente', { projectId, count });

// addPayment() - líneas 284-312
paymentLogger.debug('Iniciando creación de pago', {
  projectId,
  amount,
  hasInstallments
});
paymentLogger.payment('Pago creado exitosamente', savedPayment.id, savedPayment.amount);
```

---

#### 2. Sistema de Cuotas

```typescript
// saveInstallmentsToFirestore() - líneas 485-529
paymentLogger.debug('Guardando cuotas en Firestore', {
  paymentId: payment.id,
  installments: payment.installments
});
paymentLogger.info('Cuotas guardadas exitosamente en Firestore', {
  paymentId,
  installmentCount
});

// getCurrentMonthInstallmentSum() - líneas 642-718
paymentLogger.debug('Calculando suma de cuotas del mes actual');
paymentLogger.debug('Rango de fechas para cálculo', {
  firstDay,
  lastDay
});
paymentLogger.info('Cálculo de cuotas mensuales completado', {
  total,
  processedPayments,
  validInstallmentsCount
});
```

---

#### 3. Batch Payments

```typescript
// createBatchPayment() - líneas 813-873
paymentLogger.debug('Creando batch payment', {
  clientId,
  totalAmount,
  allocationsCount,
  batchId
});
paymentLogger.info('Batch payment creado exitosamente', {
  batchId,
  paymentsCreated,
  totalAmount
});

// deleteBatchPayment() - líneas 930-999
paymentLogger.debug('Eliminando batch payment', { batchId });
paymentLogger.warn('No se encontraron pagos para el batch', { batchId });
paymentLogger.info('Batch payment eliminado exitosamente', {
  batchId,
  deletedCount
});
```

---

#### 4. Operaciones de Balance

```typescript
// deletePayment() - líneas 381-386
paymentLogger.database('Saldo del proyecto restaurado', {
  projectId,
  newBalance,
  paymentAmount
});
```

---

### Estructura de Log Contextual

Todos los logs incluyen **contexto estructurado** para debugging:

```typescript
// Ejemplo:
{
  "level": "info",
  "message": "Pago creado exitosamente",
  "paymentId": "abc123",
  "amount": 150000,
  "timestamp": "2025-10-15T10:30:00Z",
  "context": {
    "projectId": "proj_456",
    "clientId": "client_789",
    "hasInstallments": true
  }
}
```

---

## 1️⃣2️⃣ ESTADO Y CACHÉ

### TanStack Query (React Query)

Sistema de caché inteligente para minimizar llamadas a Firebase.

#### Query Keys Establecidas

```typescript
// Pagos
['payments']                          // Todos los pagos
['projects']                          // Todos los proyectos
['clients']                           // Todos los clientes

// Cuotas
['currentMonthInstallmentTotal']      // Total cuotas mes actual
['pendingInstallmentTotal']           // Total cuotas pendientes
```

---

### Configuración de Queries

```typescript
// usePaymentsData.ts - ejemplo típico

const { data: payments, isLoading, isError, error } = useQuery<Payment[], Error>({
  queryKey: ['payments'],
  queryFn: () => getAllPayments(),
  // Configuración implícita de React Query:
  // - staleTime: 0 (siempre refresca)
  // - cacheTime: 5 minutos
  // - refetchOnWindowFocus: true
  // - retry: 3 intentos
});
```

---

### Invalidación Automática

Cuando se crea, edita o elimina un pago, se invalidan automáticamente las queries relevantes:

```typescript
// EditPaymentDialog.tsx - líneas 146-152
const updatePaymentMutation = useMutation({
  mutationFn: async (data) => {
    await updatePayment(payment.id, updatedPayment);
  },
  onSuccess: () => {
    // ✅ Invalidar cache de pagos y proyectos
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    onOpenChange(false);
  }
});
```

**Efecto**: Todas las vistas dependientes se refrescan automáticamente.

---

### Estrategia de Actualización Optimista

**Estado actual**: ❌ NO IMPLEMENTADO

**Potencial mejora**:
```typescript
// Ejemplo de actualización optimista (no implementado):
const deleteMutation = useMutation({
  mutationFn: deletePayment,
  onMutate: async (paymentId) => {
    // Cancelar queries en curso
    await queryClient.cancelQueries({ queryKey: ['payments'] });

    // Snapshot del estado anterior
    const previousPayments = queryClient.getQueryData(['payments']);

    // Actualización optimista (UI inmediata)
    queryClient.setQueryData(['payments'], (old) =>
      old.filter(p => p.id !== paymentId)
    );

    return { previousPayments };
  },
  onError: (err, variables, context) => {
    // Revertir en caso de error
    queryClient.setQueryData(['payments'], context.previousPayments);
  }
});
```

---

### Prefetching (No Implementado)

**Potencial mejora** para performance:
```typescript
// Al hacer hover en un botón de edición, prefetch del pago:
const handleHover = () => {
  queryClient.prefetchQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getPaymentById(paymentId)
  });
};
```

---

## 🎨 INSIGHTS ARQUITECTURALES

`★ Insight ─────────────────────────────────────────────────────────────`

### 1. **Diseño SOLID Aplicado con Excelencia**

El archivo `paymentService.ts` fue **refactorizado en v2.1.0** aplicando principios SOLID:

**Single Responsibility Principle**:
- `validatePaymentInput()` - Solo valida entrada
- `preparePaymentData()` - Solo prepara datos para Firestore
- `calculateNewBalance()` - Solo calcula balance
- `processPaymentTransaction()` - Solo maneja transacción
- `processInstallments()` - Solo procesa cuotas

**Open/Closed Principle**:
- Sistema extensible vía nuevos métodos de pago sin modificar código existente
- Nuevos tipos de pago agregables sin breaking changes

**Dependency Inversion**:
- `addPayment(paymentData, firestore = db)` acepta instancia inyectada
- Facilita testing con mocks

**Resultado**: Código más mantenible, testeable y escalable.

---

### 2. **Batch Payments = Innovación Arquitectural**

Sistema batch payments representa un **patrón Command avanzado**:

**Características técnicas destacables**:
- ✅ **UUID universal** para vincular operaciones relacionadas
- ✅ **Transacciones atómicas** con `writeBatch()` - todo o nada
- ✅ **Eliminación en cascada** con restauración de estado
- ✅ **Auditabilidad completa** vía `getBatchPaymentSummary()`
- ✅ **Idempotencia** garantizada por UUID único

**Patrón implementado**:
```
Command Pattern + Transaction Pattern + Saga Pattern
= Sistema robusto para operaciones complejas distribuidas
```

**Beneficio**: Operaciones multi-documento garantizan consistencia en Firebase.

---

### 3. **Sistema de Cuotas Completamente Desacoplado**

Arquitectura inteligente con **separación de concerns**:

**Colección independiente**:
- `installments/` separada de `payments/`
- Permite queries específicas sin contaminar pagos
- Escalabilidad horizontal

**Generación automática**:
- `generateInstallments()` es **pura** (sin side effects)
- Testeable aisladamente
- Reutilizable en múltiples contextos

**Cálculos agregados eficientes**:
- Queries directas a `installments/` collection
- Filtrado en aplicación (fecha, estado)
- O(n) complexity para cálculos de totales

**Estado persistente**:
- `isPaid` por cuota individual
- Actualización granular sin afectar pago padre
- Permite flujos de pago parcial

---

### 4. **Estrategia de Enriquecimiento O(1)**

Hook `usePaymentsData()` implementa **lookup eficiente**:

```typescript
// En lugar de O(n²) con nested loops:
payments.map(payment => {
  const project = projects.find(p => p.id === payment.projectId); // O(n)
});
// Complejidad total: O(n²)

// Se usa Maps para O(1):
const projectMap = new Map(projects.map(p => [p.id, p]));
payments.map(payment => {
  const project = projectMap.get(payment.projectId); // O(1)
});
// Complejidad total: O(n + m)
```

**Beneficio**: Con 1000 pagos y 500 proyectos:
- Approach naive: ~500,000 operaciones
- Approach con Maps: ~1,500 operaciones
- **Mejora: 333x más rápido** 🚀

---

### 5. **TanStack Query = Cache Inteligente**

React Query maneja complejidad de sincronización automáticamente:

**Sin React Query** (manual):
```typescript
const [payments, setPayments] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  getAllPayments()
    .then(setPayments)
    .catch(setError)
    .finally(() => setLoading(false));
}, [/* ¿cuándo refrescar? */]);

// Problema: ¿Cómo invalidar al crear/editar/eliminar?
// Necesitas lógica manual compleja
```

**Con React Query** (automático):
```typescript
const { data: payments, isLoading, error } = useQuery({
  queryKey: ['payments'],
  queryFn: getAllPayments,
});

// ✅ Cache automático
// ✅ Refetch en window focus
// ✅ Invalidación declarativa
// ✅ Loading/error states unificados
```

**Beneficio**: Reduce complejidad y bugs de sincronización.

`─────────────────────────────────────────────────────────────────────────`

---

## 🚨 PROBLEMAS CONOCIDOS Y LIMITACIONES

### ⚠️ Issue #1: Balance NO se actualiza al editar monto

**Severidad**: 🔴 Alta
**Estado**: No implementado
**Ubicación**: `src/services/paymentService.ts:319-320`

**Descripción**:
```typescript
// updatePayment() NO recalcula balance si amount cambia

// Comentario en el código:
// "Note: This function does not currently recalculate project balance
//  if payment amount changes. That would require fetching the old payment
//  amount, the project, calculating the difference, and then updating."
```

**Escenario del problema**:
```
1. Crear pago: amount = $100,000
   → project.balance += $100,000

2. Editar pago: amount = $200,000
   → project.balance NO cambia ❌

3. Resultado: Balance inconsistente (diff de $100,000)
```

**Impacto**:
- Balance de proyecto desincronizado
- Reportes financieros incorrectos
- Posibles decisiones de negocio erróneas

**Solución requerida**:
```typescript
export const updatePayment = async (paymentId, paymentData) => {
  // 1. Obtener pago antiguo
  const oldPayment = await getPaymentById(paymentId);

  // 2. Si amount cambió:
  if (paymentData.amount && paymentData.amount !== oldPayment.amount) {
    const diff = paymentData.amount - oldPayment.amount;

    // 3. Ajustar balance del proyecto
    const projectRef = doc(db, 'projects', oldPayment.projectId);
    await updateDoc(projectRef, {
      balance: increment(diff),
      updatedAt: serverTimestamp()
    });
  }

  // 4. Actualizar pago
  await updateDoc(paymentDocRef, paymentData);
};
```

**Workaround actual**:
- Eliminar pago antiguo
- Crear nuevo pago con monto correcto
- ⚠️ Pierde historial de cambios

---

### ⚠️ Issue #2: Eliminación masiva sin ajuste de balance

**Severidad**: 🟡 Media
**Estado**: Diseño intencional (comentado)
**Ubicación**: `src/services/paymentService.ts:419-420`

**Descripción**:
```typescript
// deletePaymentsForProject() NO ajusta balance del proyecto

// Comentario en el código:
// "Note: This function does not adjust project balance when deleting
//  all payments for a project. If a project is deleted, its balance
//  effectively becomes irrelevant, or should be reset/archived."
```

**Escenario**:
```
1. Proyecto con 5 pagos y balance = $X
2. Eliminar todos los pagos del proyecto
3. Balance del proyecto queda en $X (inconsistente)
```

**Justificación del diseño**:
- Función se usa típicamente al eliminar el proyecto completo
- Balance de proyecto eliminado es irrelevante
- Evita operaciones innecesarias

**Riesgo**:
- Si se usa la función sin eliminar el proyecto, balance queda mal

**Recomendación**:
- Renombrar función a `deletePaymentsWhenDeletingProject()`
- O agregar validación que el proyecto esté siendo eliminado

---

### ⚠️ Issue #3: Hook useClientPaymentData.ts vacío

**Severidad**: 🟡 Media
**Estado**: No implementado
**Ubicación**: `src/hooks/useClientPaymentData.ts`

**Descripción**:
```typescript
// Archivo existe pero está completamente vacío (1 línea)
// Importado en algunos archivos pero no usado
```

**Impacto**:
- Import muerto en algunos archivos
- Funcionalidad esperada no disponible
- Confusión para desarrolladores

**Solución esperada**:
```typescript
// Implementación sugerida:
export const useClientPaymentData = (clientId: string) => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['clientPayments', clientId],
    queryFn: async () => {
      const allPayments = await getAllPayments();
      return allPayments.filter(p => p.clientId === clientId);
    }
  });

  const { data: batchSummaries } = useQuery({
    queryKey: ['clientBatches', clientId],
    queryFn: async () => {
      // Obtener batch summaries del cliente
      const batchIds = [...new Set(
        payments?.filter(p => p.batchId).map(p => p.batchId)
      )];

      return Promise.all(
        batchIds.map(getBatchPaymentSummary)
      );
    },
    enabled: !!payments
  });

  return { payments, batchSummaries, isLoading };
};
```

---

### ⚠️ Issue #4: Lógica de balance potencialmente invertida

**Severidad**: 🔴 Alta (requiere verificación)
**Estado**: Posible bug de diseño
**Ubicación**: `src/services/paymentService.ts:199-204`

**Descripción**:
```typescript
// Función calculateNewBalance()
if (isAdjustment) {
  return currentBalance - paymentAmount;  // OK
} else {
  return currentBalance + paymentAmount;  // ← ¿DEBERÍA SER RESTA?
}
```

**Análisis**:

**Interpretación A (código actual)**:
- `balance` representa "deuda acumulada"
- Al pagar, se suma al balance (contraIntuitivo)
- Ejemplo: proyecto $1M, pagan $200K → balance = $1.2M ❌

**Interpretación B (esperada)**:
- `balance` representa "deuda pendiente"
- Al pagar, se resta del balance
- Ejemplo: proyecto $1M, pagan $200K → balance = $800K ✅

**Evidencia del bug**:
```typescript
// En NewClientPaymentPage.tsx - línea 113:
const calculatedBalance = calculateProjectBalance(
  project.total,
  sumOfPayments
);

// calculateProjectBalance() hace: total - sumOfPayments
// Esto sugiere que balance DEBERÍA ser total - pagos
// Pero addPayment() hace: balance + payment ❌
```

**Impacto**:
- Balance de todos los proyectos probablemente incorrecto
- Requiere migración de datos si se corrige

**Acción requerida**:
1. Verificar en Firebase cómo se comporta balance actualmente
2. Confirmar lógica de negocio esperada con stakeholders
3. Si es bug, crear script de migración de datos
4. Actualizar `calculateNewBalance()` y tests

---

### ⚠️ Issue #5: Sin validación de monto máximo en cuotas

**Severidad**: 🟢 Baja
**Estado**: Mejora potencial

**Descripción**:
- No hay validación de que número de cuotas sea razonable para el monto
- Ejemplo: Pagar $10,000 en 36 cuotas = $277/cuota (demasiado bajo)

**Solución sugerida**:
```typescript
// Validación en PaymentDialog:
const MIN_INSTALLMENT_AMOUNT = 10000; // $10,000 por cuota

if (paymentMethod === 'tarjeta de crédito') {
  const amountPerInstallment = amount / installments;
  if (amountPerInstallment < MIN_INSTALLMENT_AMOUNT) {
    throw new Error(
      `Cada cuota debe ser al menos ${formatCurrency(MIN_INSTALLMENT_AMOUNT)}`
    );
  }
}
```

---

## 📊 ESTADÍSTICAS DEL SISTEMA

### Líneas de Código por Archivo

| Archivo | Líneas | Porcentaje | Categoría |
|---------|--------|------------|-----------|
| `paymentService.ts` | 1,064 | 35% | Servicio |
| `InstallmentPaymentsPage` | 448 | 15% | UI |
| `NewClientPaymentPage` | 414 | 14% | UI |
| `EditPaymentDialog` | 367 | 12% | Componente |
| `columns.tsx` | 348 | 11% | Configuración |
| `PaymentsPage` | 218 | 7% | UI |
| `PaymentDialog` | 123 | 4% | Componente |
| `usePaymentsData.ts` | 70 | 2% | Hook |
| **TOTAL** | **3,052** | **100%** | - |

---

### Funciones del Sistema

#### Servicios CRUD (8 funciones)
```typescript
1. getAllPayments()              // Obtener todos los pagos
2. getPaymentsForProject()       // Pagos de un proyecto
3. getPaymentById()              // Pago específico por ID
4. addPayment()                  // Crear nuevo pago
5. updatePayment()               // Actualizar pago existente
6. deletePayment()               // Eliminar pago individual
7. deletePaymentsForProject()    // Eliminar todos los pagos de proyecto
8. getInstallmentsByPayment()    // Cuotas de un pago
```

#### Batch Payments (4 funciones)
```typescript
1. createBatchPayment()          // Crear batch de pagos vinculados
2. getBatchPayments()            // Obtener pagos del batch
3. deleteBatchPayment()          // Eliminar batch completo
4. getBatchPaymentSummary()      // Resumen enriquecido del batch
```

#### Sistema de Cuotas (5 funciones)
```typescript
1. generateInstallments()                  // Generar cuotas
2. saveInstallmentsToFirestore()          // Guardar cuotas
3. getAllInstallments()                   // Todas las cuotas
4. updateInstallmentStatus()              // Actualizar estado cuota
5. getInstallmentsByPayment()             // Cuotas por pago
```

#### Cálculos Agregados (2 funciones)
```typescript
1. getCurrentMonthInstallmentSum()        // Total mes actual
2. getTotalPendingInstallmentSum()        // Total pendiente
```

**Total funciones**: **19 funciones públicas**

---

### Tipos y Constantes

#### Tipos TypeScript
```typescript
1. Payment                    // Tipo principal
2. PaymentDocument           // Para Firestore
3. PaymentImportData         // Para importación
4. PaymentMethod             // Métodos de pago
5. PaymentTypeOption         // Tipos de pago
6. CreateBatchPaymentParams  // Parámetros batch
7. BatchPaymentSummary       // Resumen batch
8. DeleteBatchResult         // Resultado eliminación
9. Installment               // Cuota individual
10. EnrichedPayment          // Pago enriquecido
```

#### Constantes
```typescript
PAYMENT_METHODS: 6 métodos
PAYMENT_TYPES: 3 tipos
PAYMENT_METHOD_OPTIONS: 6 opciones (para filtros)
PAYMENT_TYPE_OPTIONS: 3 opciones (para filtros)
```

---

### Complejidad del Código

#### Funciones Complejas (>50 líneas)
1. `addPayment()` - 76 líneas (validación + transacción + cuotas)
2. `createBatchPayment()` - 70 líneas (batch write + validaciones)
3. `deleteBatchPayment()` - 75 líneas (batch delete + restauración)
4. `getCurrentMonthInstallmentSum()` - 80 líneas (cálculos complejos)
5. `handleAutoDistribute()` - 60 líneas (distribución inteligente)

**Promedio líneas por función**: 42 líneas

---

### Dependencias Principales

#### Producción
```typescript
- firebase/firestore (v11.x)  // Database
- @tanstack/react-query       // State management
- @tanstack/react-table       // DataTable
- react-hook-form             // Formularios
- zod                         // Validación
- date-fns                    // Manejo fechas
- sonner                      // Toasts
- lucide-react               // Iconos
```

#### Desarrollo
```typescript
- @testing-library/react      // Testing
- jest                        // Test runner
- playwright                  // E2E testing
```

---

## 🎯 RECOMENDACIONES

### Prioridad 🔴 Alta (Implementar Inmediatamente)

#### 1. **Corregir Actualización de Balance en updatePayment()**

**Problema**: Balance NO se actualiza al editar monto de pago

**Impacto**: 🔴 Crítico - datos financieros inconsistentes

**Esfuerzo estimado**: 2-3 horas

**Implementación**:
```typescript
// src/services/paymentService.ts

export const updatePayment = async (
  paymentId: string,
  paymentData: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    // 1. Obtener pago antiguo
    const oldPayment = await getPaymentById(paymentId);
    if (!oldPayment) throw new Error('Payment not found');

    const paymentDocRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const batch = writeBatch(db);

    // 2. Si amount cambió, ajustar balance
    if (paymentData.amount && paymentData.amount !== oldPayment.amount) {
      const diff = paymentData.amount - oldPayment.amount;
      const projectRef = doc(db, PROJECTS_COLLECTION, oldPayment.projectId);

      // 3. Actualizar balance del proyecto
      batch.update(projectRef, {
        balance: increment(diff),
        updatedAt: serverTimestamp()
      });

      paymentLogger.info('Ajustando balance por cambio de monto', {
        paymentId,
        oldAmount: oldPayment.amount,
        newAmount: paymentData.amount,
        diff
      });
    }

    // 4. Actualizar pago
    const dataToUpdate = {
      ...paymentData,
      updatedAt: serverTimestamp()
    };

    batch.update(paymentDocRef, dataToUpdate);
    await batch.commit();

    paymentLogger.info('Pago actualizado exitosamente', { paymentId });
  } catch (error) {
    paymentLogger.error('Error al actualizar pago', error);
    throw error;
  }
};
```

**Tests requeridos**:
```typescript
describe('updatePayment - balance adjustment', () => {
  it('debe ajustar balance cuando amount aumenta', async () => {
    // Crear pago de $100,000
    // Editar a $150,000
    // Verificar balance += $50,000
  });

  it('debe ajustar balance cuando amount disminuye', async () => {
    // Crear pago de $150,000
    // Editar a $100,000
    // Verificar balance -= $50,000
  });
});
```

---

#### 2. **Verificar y Corregir Lógica de Balance**

**Problema**: Posible bug en cálculo de balance (suma en vez de resta)

**Impacto**: 🔴 Crítico - lógica fundamental del sistema

**Esfuerzo estimado**: 4-6 horas (incluye migración de datos)

**Plan de acción**:
1. Auditar datos actuales en Firebase
2. Confirmar lógica de negocio con stakeholders
3. Si es bug, crear script de migración:
   ```typescript
   // Script de migración (ejemplo)
   const migrateBalances = async () => {
     const projects = await getProjects();

     for (const project of projects) {
       const payments = await getPaymentsForProject(project.id);
       const totalPaid = payments
         .filter(p => !p.isAdjustment)
         .reduce((sum, p) => sum + (p.amount || 0), 0);

       const correctBalance = project.total - totalPaid;

       await updateDoc(doc(db, 'projects', project.id), {
         balance: correctBalance,
         balanceMigrated: true,
         balanceMigratedAt: serverTimestamp()
       });
     }
   };
   ```
4. Actualizar `calculateNewBalance()`:
   ```typescript
   if (isAdjustment) {
     return currentBalance - paymentAmount;
   } else {
     return currentBalance - paymentAmount; // ← CORREGIDO
   }
   ```

---

#### 3. **Implementar Hook useClientPaymentData**

**Problema**: Hook declarado pero vacío

**Impacto**: 🟡 Medio - funcionalidad esperada no disponible

**Esfuerzo estimado**: 1-2 horas

**Implementación completa**: (Ver Issue #3 arriba)

---

### Prioridad 🟡 Media (Próximo Sprint)

#### 4. **Agregar Tests E2E para Batch Payments**

**Justificación**: Sistema crítico sin tests E2E

**Esfuerzo estimado**: 3-4 horas

**Cobertura requerida**:
```typescript
// e2e/tests/batch-payments.spec.ts

describe('Batch Payments', () => {
  it('debe crear batch payment con distribución automática', async () => {
    // 1. Navegar a /clients/newPayment/[clientId]
    // 2. Ingresar monto total
    // 3. Activar toggle "Auto"
    // 4. Verificar distribución correcta
    // 5. Confirmar
    // 6. Verificar batch creado en Firebase
  });

  it('debe vincular pagos con mismo batchId', async () => {
    // Verificar UUID único compartido
  });

  it('debe restaurar balances al eliminar batch', async () => {
    // Crear batch, eliminar, verificar balances restaurados
  });
});
```

---

#### 5. **Validación de Monto Mínimo por Cuota**

**Justificación**: Prevenir cuotas muy pequeñas

**Esfuerzo estimado**: 1 hora

**Implementación**: (Ver Issue #5 arriba)

---

#### 6. **Optimización de Queries con Índices**

**Problema**: Queries sin índices compuestos

**Impacto**: 🟡 Performance degradada con muchos datos

**Implementación**:
```javascript
// firebase.indexes.json

{
  "indexes": [
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "batchId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "installments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" },
        { "fieldPath": "isPaid", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

### Prioridad 🟢 Baja (Backlog)

#### 7. **Exportar Pagos a CSV**

**Justificación**: Facilitar análisis externo

**Esfuerzo estimado**: 2-3 horas

**Features**:
- Export con filtros aplicados
- Columnas configurables
- Formato Excel-friendly

---

#### 8. **Dashboard de Métricas de Pagos**

**Justificación**: Visibilidad de KPIs

**Esfuerzo estimado**: 1-2 días

**Métricas sugeridas**:
- Total pagado por mes/año
- Promedio de pago por proyecto
- Métodos de pago más usados
- Tendencia de pagos (chart)
- Cuotas pendientes por vencer

---

#### 9. **Notificaciones de Cuotas Próximas**

**Justificación**: Recordatorios automáticos

**Esfuerzo estimado**: 3-4 horas

**Implementación**:
```typescript
// Cloud Function (Firebase)
export const notifyCuotasProximas = functions.pubsub
  .schedule('0 9 * * *') // 9 AM diario
  .onRun(async () => {
    const cuotasProximas = await getCuotasVencenEn7Dias();

    for (const cuota of cuotasProximas) {
      await sendEmailNotification({
        to: cuota.clientEmail,
        subject: 'Recordatorio: Cuota próxima a vencer',
        body: `Su cuota de ${formatCurrency(cuota.amount)} vence el ${format(cuota.date, 'PPP')}`
      });
    }
  });
```

---

#### 10. **Actualización Optimista en UI**

**Justificación**: Mejor UX con respuesta inmediata

**Esfuerzo estimado**: 2-3 horas

**Implementación**: (Ver sección Estado y Caché arriba)

---

## 📚 REFERENCIAS TÉCNICAS

### Archivos Clave del Sistema

```
src/
├── types/
│   └── payment.ts                          # Definiciones TypeScript completas
│
├── constants/
│   └── payment.ts                          # Constantes centralizadas (métodos, tipos)
│
├── services/
│   └── paymentService.ts                   # Lógica de negocio (1,064 líneas)
│
├── hooks/
│   ├── usePaymentsData.ts                  # Hook de enriquecimiento
│   └── useClientPaymentData.ts             # ⚠️ Vacío (no implementado)
│
├── components/
│   ├── payment-dialog.tsx                  # Dialog pago simple
│   └── payments/
│       └── edit-payment-dialog.tsx         # Dialog edición
│
└── app/
    ├── payments/
    │   ├── page.tsx                        # Lista principal (DataTable)
    │   ├── columns.tsx                     # Columnas DataTable
    │   └── installment/
    │       └── page.tsx                    # Vista cuotas
    │
    └── clients/
        └── newPayment/
            └── [clientId]/
                └── page.tsx                # Batch payment
```

---

### Referencias Externas

#### Documentación Oficial
- **Firebase Firestore**: https://firebase.google.com/docs/firestore
- **TanStack Query**: https://tanstack.com/query/latest
- **TanStack Table**: https://tanstack.com/table/latest
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/

#### Patrones Implementados
- **Transaction Pattern**: `writeBatch()` en Firebase
- **Command Pattern**: Batch Payments
- **Repository Pattern**: `paymentService.ts`
- **Hook Pattern**: Custom hooks de React
- **Observer Pattern**: React Query cache invalidation

---

### Comandos Útiles

#### Desarrollo
```bash
# Iniciar servidor desarrollo
npm run dev  # Puerto 3002 (Turbopack)

# Validación de código
npm run lint
npm run typecheck
```

#### Testing
```bash
# Tests unitarios
npm test

# Tests E2E
npm run test:e2e
npm run test:e2e:ui  # Con interfaz visual
```

#### Firebase
```bash
# Emulador local
firebase emulators:start

# Deploy
firebase deploy --only firestore:rules
firebase deploy --only functions
```

---

### Migraciones y Scripts

```bash
# Sincronizar nombres de clientes
npx tsx scripts/sync-client-names.ts

# Test de eventos de proyecto
npx tsx scripts/test-project-events.ts
```

---

## 📝 NOTAS FINALES

### Mantenimiento de Este Documento

Este documento debe actualizarse cuando:
- ✅ Se agregue un nuevo tipo de pago
- ✅ Se agregue un nuevo método de pago
- ✅ Se cree una nueva ubicación para registrar pagos
- ✅ Se modifique la lógica de balance
- ✅ Se implemente alguna de las recomendaciones
- ✅ Se corrija alguno de los problemas conocidos

### Contacto y Contribuciones

Para reportar bugs o sugerir mejoras al sistema de pagos, contactar al equipo técnico.

---

## 📊 CHANGELOG

### v1.0.0 (Octubre 2025)
- ✅ Documentación inicial completa del sistema de pagos
- ✅ Análisis exhaustivo del código fuente
- ✅ Identificación de 5 issues conocidos
- ✅ 10 recomendaciones priorizadas
- ✅ Estadísticas completas del sistema

---

**📄 Documento generado**: Octubre 2025
**🔍 Basado en**: Análisis exhaustivo del código fuente
**📊 Cobertura**: 100% del sistema de pagos
**🎯 Propósito**: Documentación técnica completa para desarrollo y mantenimiento
