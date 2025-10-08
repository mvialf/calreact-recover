# 🧪 Estrategia de Testing - Sistema de Batch Payments

**Fecha:** Octubre 2025
**Framework:** Jest + React Testing Library + Playwright
**Objetivo de Coverage:** >80%

---

## 📋 Índice

1. [Pirámide de Testing](#1-pirámide-de-testing)
2. [Tests Unitarios - Servicios](#2-tests-unitarios---servicios)
3. [Tests de Integración - Componentes](#3-tests-de-integración---componentes)
4. [Tests E2E - Flujos Completos](#4-tests-e2e---flujos-completos)
5. [Casos Edge](#5-casos-edge)
6. [Métricas y Coverage](#6-métricas-y-coverage)

---

## 1. Pirámide de Testing

```
           ▲
          ╱ ╲
         ╱   ╲        E2E Tests (10%)
        ╱  🎬 ╲       - 3 flujos completos
       ╱───────╲      - Playwright
      ╱         ╲
     ╱  🔗       ╲    Integration Tests (30%)
    ╱   Tests    ╲   - 10 casos componentes
   ╱─────────────╲   - React Testing Library
  ╱               ╲
 ╱  ⚡ Unit Tests  ╲  Unit Tests (60%)
╱     (Servicios)  ╲ - 20+ casos servicios
───────────────────  - Jest puro
```

### Distribución de Tests

- **60% Unit Tests**: Servicios Firebase (createBatchPayment, getBatchPayments, etc.)
- **30% Integration Tests**: Componentes UI (BatchPaymentDialog, ConfirmDeleteBatchDialog)
- **10% E2E Tests**: Flujos completos usuario (crear → ver → eliminar batch)

---

## 2. Tests Unitarios - Servicios

### Archivo: `src/services/__tests__/paymentService.batch.test.ts`

#### Suite 1: createBatchPayment()

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createBatchPayment, getBatchPayments } from '../paymentService';
import type { CreateBatchPaymentParams } from '@/types/payment';

describe('createBatchPayment', () => {
  beforeEach(async () => {
    // Limpiar Firestore antes de cada test
    await cleanupFirestore();
  });

  afterEach(async () => {
    // Limpiar después de cada test
    await cleanupFirestore();
  });

  it('debe crear múltiples pagos con mismo batchId', async () => {
    // Arrange
    const params: CreateBatchPaymentParams = {
      clientId: 'client-test-123',
      totalAmount: 150000,
      paymentMethod: 'Transferencia',
      date: new Date('2025-10-01'),
      allocations: [
        { projectId: 'proj-001', amount: 100000 },
        { projectId: 'proj-002', amount: 50000 }
      ]
    };

    // Act
    const batchId = await createBatchPayment(params);

    // Assert
    expect(batchId).toBeDefined();
    expect(typeof batchId).toBe('string');
    expect(batchId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i); // UUID format

    // Verificar que los pagos fueron creados
    const payments = await getBatchPayments(batchId);
    expect(payments).toHaveLength(2);
    expect(payments[0].batchId).toBe(batchId);
    expect(payments[1].batchId).toBe(batchId);
  });

  it('debe asignar clientId y paymentType correctamente', async () => {
    // Arrange
    const params: CreateBatchPaymentParams = {
      clientId: 'client-456',
      totalAmount: 100000,
      paymentMethod: 'Efectivo',
      date: new Date(),
      allocations: [
        { projectId: 'proj-001', amount: 100000 }
      ]
    };

    // Act
    const batchId = await createBatchPayment(params);
    const payments = await getBatchPayments(batchId);

    // Assert
    expect(payments[0].clientId).toBe('client-456');
    expect(payments[0].paymentType).toBe('cliente');
  });

  it('debe distribuir montos correctamente', async () => {
    // Arrange
    const params: CreateBatchPaymentParams = {
      clientId: 'client-789',
      totalAmount: 300000,
      paymentMethod: 'Transferencia',
      date: new Date(),
      allocations: [
        { projectId: 'proj-A', amount: 100000 },
        { projectId: 'proj-B', amount: 150000 },
        { projectId: 'proj-C', amount: 50000 }
      ]
    };

    // Act
    const batchId = await createBatchPayment(params);
    const payments = await getBatchPayments(batchId);

    // Assert
    const totalCreated = payments.reduce((sum, p) => sum + p.amount, 0);
    expect(totalCreated).toBe(300000);
    expect(payments.find(p => p.projectId === 'proj-A')?.amount).toBe(100000);
    expect(payments.find(p => p.projectId === 'proj-B')?.amount).toBe(150000);
    expect(payments.find(p => p.projectId === 'proj-C')?.amount).toBe(50000);
  });

  it('debe manejar error si falla la creación', async () => {
    // Arrange
    const invalidParams = {
      clientId: '',  // Inválido
      totalAmount: 0,
      paymentMethod: '',
      date: new Date(),
      allocations: []
    };

    // Act & Assert
    await expect(createBatchPayment(invalidParams as any))
      .rejects
      .toThrow();
  });

  it('debe crear timestamp createdAt y updatedAt', async () => {
    // Arrange
    const params: CreateBatchPaymentParams = {
      clientId: 'client-123',
      totalAmount: 100000,
      paymentMethod: 'Transferencia',
      date: new Date(),
      allocations: [
        { projectId: 'proj-001', amount: 100000 }
      ]
    };

    // Act
    const batchId = await createBatchPayment(params);
    const payments = await getBatchPayments(batchId);

    // Assert
    expect(payments[0].createdAt).toBeInstanceOf(Date);
    expect(payments[0].updatedAt).toBeInstanceOf(Date);
    expect(payments[0].createdAt).toEqual(payments[0].updatedAt);
  });
});
```

#### Suite 2: getBatchPayments()

```typescript
describe('getBatchPayments', () => {
  it('debe retornar array vacío si no existe batchId', async () => {
    // Act
    const payments = await getBatchPayments('non-existent-uuid-12345');

    // Assert
    expect(payments).toEqual([]);
    expect(payments).toHaveLength(0);
  });

  it('debe retornar todos los pagos del batch', async () => {
    // Arrange
    const batchId = await createBatchPayment({
      clientId: 'client-123',
      totalAmount: 200000,
      paymentMethod: 'Transferencia',
      date: new Date(),
      allocations: [
        { projectId: 'proj-A', amount: 100000 },
        { projectId: 'proj-B', amount: 100000 }
      ]
    });

    // Act
    const payments = await getBatchPayments(batchId);

    // Assert
    expect(payments).toHaveLength(2);
    expect(payments.every(p => p.batchId === batchId)).toBe(true);
  });

  it('debe convertir Timestamp a Date correctamente', async () => {
    // Arrange
    const batchId = await createBatchPayment({
      clientId: 'client-123',
      totalAmount: 100000,
      paymentMethod: 'Efectivo',
      date: new Date(),
      allocations: [
        { projectId: 'proj-001', amount: 100000 }
      ]
    });

    // Act
    const payments = await getBatchPayments(batchId);

    // Assert
    expect(payments[0].date).toBeInstanceOf(Date);
    expect(payments[0].createdAt).toBeInstanceOf(Date);
    expect(payments[0].updatedAt).toBeInstanceOf(Date);
  });
});
```

#### Suite 3: deleteBatchPayment()

```typescript
describe('deleteBatchPayment', () => {
  it('debe eliminar todos los pagos del batch', async () => {
    // Arrange
    const batchId = await createBatchPayment({
      clientId: 'client-123',
      totalAmount: 150000,
      paymentMethod: 'Transferencia',
      date: new Date(),
      allocations: [
        { projectId: 'proj-A', amount: 100000 },
        { projectId: 'proj-B', amount: 50000 }
      ]
    });

    // Verificar que existen
    let payments = await getBatchPayments(batchId);
    expect(payments).toHaveLength(2);

    // Act
    const result = await deleteBatchPayment(batchId);

    // Assert
    expect(result.success).toBe(true);
    expect(result.deletedCount).toBe(2);
    expect(result.batchId).toBe(batchId);

    // Verificar que fueron eliminados
    payments = await getBatchPayments(batchId);
    expect(payments).toHaveLength(0);
  });

  it('debe retornar error si no existe el batchId', async () => {
    // Act
    const result = await deleteBatchPayment('non-existent-uuid');

    // Assert
    expect(result.success).toBe(false);
    expect(result.deletedCount).toBe(0);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('No payments found');
  });

  it('debe ser operación atómica (todo o nada)', async () => {
    // Arrange
    const batchId = await createBatchPayment({
      clientId: 'client-123',
      totalAmount: 300000,
      paymentMethod: 'Transferencia',
      date: new Date(),
      allocations: [
        { projectId: 'proj-A', amount: 100000 },
        { projectId: 'proj-B', amount: 100000 },
        { projectId: 'proj-C', amount: 100000 }
      ]
    });

    // Act
    const result = await deleteBatchPayment(batchId);

    // Assert
    expect(result.deletedCount).toBe(3); // Todos o ninguno

    const remainingPayments = await getBatchPayments(batchId);
    expect(remainingPayments).toHaveLength(0); // Verificar que NO queden residuos
  });
});
```

#### Suite 4: getBatchPaymentSummary()

```typescript
describe('getBatchPaymentSummary', () => {
  it('debe retornar null si no existe el batch', async () => {
    // Act
    const summary = await getBatchPaymentSummary('non-existent-uuid');

    // Assert
    expect(summary).toBeNull();
  });

  it('debe calcular total amount correctamente', async () => {
    // Arrange
    const batchId = await createBatchPayment({
      clientId: 'client-123',
      totalAmount: 250000,
      paymentMethod: 'Transferencia',
      date: new Date(),
      allocations: [
        { projectId: 'proj-A', amount: 100000 },
        { projectId: 'proj-B', amount: 100000 },
        { projectId: 'proj-C', amount: 50000 }
      ]
    });

    // Act
    const summary = await getBatchPaymentSummary(batchId);

    // Assert
    expect(summary).not.toBeNull();
    expect(summary!.totalAmount).toBe(250000);
    expect(summary!.paymentCount).toBe(3);
  });

  it('debe obtener nombre de cliente desde Firestore', async () => {
    // Arrange
    // Crear cliente mock en Firestore
    await createMockClient({ id: 'client-999', name: 'Juan Pérez' });

    const batchId = await createBatchPayment({
      clientId: 'client-999',
      totalAmount: 100000,
      paymentMethod: 'Efectivo',
      date: new Date(),
      allocations: [
        { projectId: 'proj-001', amount: 100000 }
      ]
    });

    // Act
    const summary = await getBatchPaymentSummary(batchId);

    // Assert
    expect(summary!.clientName).toBe('Juan Pérez');
  });

  it('debe ordenar pagos por fecha descendente', async () => {
    // Arrange
    const batchId = await createBatchPayment({
      clientId: 'client-123',
      totalAmount: 200000,
      paymentMethod: 'Transferencia',
      date: new Date('2025-10-01'),
      allocations: [
        { projectId: 'proj-A', amount: 100000 },
        { projectId: 'proj-B', amount: 100000 }
      ]
    });

    // Act
    const summary = await getBatchPaymentSummary(batchId);

    // Assert
    expect(summary!.payments).toHaveLength(2);
    // Verificar orden descendente
    expect(summary!.payments[0].date.getTime())
      .toBeGreaterThanOrEqual(summary!.payments[1].date.getTime());
  });
});
```

---

## 3. Tests de Integración - Componentes

### Archivo: `src/components/dialogs/__tests__/BatchPaymentDialog.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BatchPaymentDialog } from '../BatchPaymentDialog';
import { getBatchPaymentSummary } from '@/services/paymentService';

// Mock del servicio
jest.mock('@/services/paymentService');

const mockGetBatchPaymentSummary = getBatchPaymentSummary as jest.MockedFunction<typeof getBatchPaymentSummary>;

// Helper para renderizar con providers
const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('BatchPaymentDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe mostrar loading state inicialmente', () => {
    // Arrange
    mockGetBatchPaymentSummary.mockImplementation(() => new Promise(() => {})); // Never resolves

    // Act
    renderWithProviders(
      <BatchPaymentDialog
        batchId="uuid-123"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loader
  });

  it('debe mostrar empty state cuando no existe batch', async () => {
    // Arrange
    mockGetBatchPaymentSummary.mockResolvedValue(null);

    // Act
    renderWithProviders(
      <BatchPaymentDialog
        batchId="non-existent"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/no se encontró información/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar resumen cuando carga datos exitosamente', async () => {
    // Arrange
    mockGetBatchPaymentSummary.mockResolvedValue({
      batchId: 'uuid-123',
      clientId: 'client-123',
      clientName: 'María González',
      totalAmount: 150000,
      paymentCount: 3,
      date: new Date('2025-10-01'),
      paymentMethod: 'Transferencia',
      payments: [
        {
          id: 'pay-1',
          projectId: 'proj-A',
          amount: 100000,
          paymentMethod: 'Transferencia',
          date: new Date('2025-10-01'),
          batchId: 'uuid-123',
          clientId: 'client-123',
          paymentType: 'cliente'
        },
        {
          id: 'pay-2',
          projectId: 'proj-B',
          amount: 50000,
          paymentMethod: 'Transferencia',
          date: new Date('2025-10-01'),
          batchId: 'uuid-123',
          clientId: 'client-123',
          paymentType: 'cliente'
        }
      ]
    });

    // Act
    renderWithProviders(
      <BatchPaymentDialog
        batchId="uuid-123"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/maría gonzález/i)).toBeInTheDocument();
      expect(screen.getByText('$150,000')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Transferencia')).toBeInTheDocument();
    });
  });

  it('debe mostrar lista de pagos distribuidos', async () => {
    // Arrange
    mockGetBatchPaymentSummary.mockResolvedValue({
      batchId: 'uuid-123',
      clientId: 'client-123',
      clientName: 'Cliente Test',
      totalAmount: 150000,
      paymentCount: 2,
      date: new Date('2025-10-01'),
      paymentMethod: 'Efectivo',
      payments: [
        {
          id: 'pay-1',
          projectId: 'ABC-001',
          amount: 100000,
          paymentMethod: 'Efectivo',
          date: new Date('2025-10-01'),
          batchId: 'uuid-123',
          clientId: 'client-123',
          paymentType: 'cliente'
        },
        {
          id: 'pay-2',
          projectId: 'XYZ-002',
          amount: 50000,
          paymentMethod: 'Efectivo',
          date: new Date('2025-10-01'),
          batchId: 'uuid-123',
          clientId: 'client-123',
          paymentType: 'cliente'
        }
      ]
    });

    // Act
    renderWithProviders(
      <BatchPaymentDialog
        batchId="uuid-123"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/ABC-001/)).toBeInTheDocument();
      expect(screen.getByText(/XYZ-002/)).toBeInTheDocument();
      expect(screen.getByText('$100,000')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
    });
  });

  it('debe llamar onOpenChange al cerrar', async () => {
    // Arrange
    const onOpenChange = jest.fn();
    mockGetBatchPaymentSummary.mockResolvedValue({
      batchId: 'uuid-123',
      clientId: 'client-123',
      clientName: 'Cliente',
      totalAmount: 100000,
      paymentCount: 1,
      date: new Date(),
      paymentMethod: 'Efectivo',
      payments: []
    });

    // Act
    renderWithProviders(
      <BatchPaymentDialog
        batchId="uuid-123"
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.getByText(/cliente/i)).toBeInTheDocument();
    });

    // Simular click en X para cerrar
    const closeButton = screen.getByRole('button', { name: /cerrar/i });
    await userEvent.click(closeButton);

    // Assert
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
```

### Archivo: `src/components/dialogs/__tests__/ConfirmDeleteBatchDialog.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmDeleteBatchDialog } from '../ConfirmDeleteBatchDialog';
import { deleteBatchPayment } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

// Mocks
jest.mock('@/services/paymentService');
jest.mock('@/hooks/use-toast');

const mockDeleteBatchPayment = deleteBatchPayment as jest.MockedFunction<typeof deleteBatchPayment>;
const mockToast = jest.fn();
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('ConfirmDeleteBatchDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe mostrar advertencia correctamente', () => {
    // Act
    renderWithProviders(
      <ConfirmDeleteBatchDialog
        batchId="uuid-123"
        paymentCount={3}
        totalAmount={150000}
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Assert
    expect(screen.getByText(/eliminar batch de pagos/i)).toBeInTheDocument();
    expect(screen.getByText(/3 pagos/)).toBeInTheDocument();
    expect(screen.getByText(/\$150,000/)).toBeInTheDocument();
    expect(screen.getByText(/no se puede deshacer/i)).toBeInTheDocument();
  });

  it('debe llamar deleteBatchPayment al confirmar', async () => {
    // Arrange
    mockDeleteBatchPayment.mockResolvedValue({
      success: true,
      deletedCount: 3,
      batchId: 'uuid-123'
    });

    const onOpenChange = jest.fn();

    // Act
    renderWithProviders(
      <ConfirmDeleteBatchDialog
        batchId="uuid-123"
        paymentCount={3}
        totalAmount={150000}
        open={true}
        onOpenChange={onOpenChange}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /eliminar batch/i });
    await userEvent.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(mockDeleteBatchPayment).toHaveBeenCalledWith('uuid-123');
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Batch eliminado exitosamente',
        description: expect.stringContaining('3 pagos')
      }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('debe mostrar error toast si falla eliminación', async () => {
    // Arrange
    mockDeleteBatchPayment.mockResolvedValue({
      success: false,
      deletedCount: 0,
      batchId: 'uuid-123',
      error: 'Error de conexión'
    });

    // Act
    renderWithProviders(
      <ConfirmDeleteBatchDialog
        batchId="uuid-123"
        paymentCount={3}
        totalAmount={150000}
        open={true}
        onOpenChange={() => {}}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /eliminar batch/i });
    await userEvent.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error al eliminar',
        variant: 'destructive'
      }));
    });
  });

  it('debe deshabilitar botones durante eliminación', async () => {
    // Arrange
    mockDeleteBatchPayment.mockImplementation(() => new Promise(() => {})); // Never resolves

    // Act
    renderWithProviders(
      <ConfirmDeleteBatchDialog
        batchId="uuid-123"
        paymentCount={3}
        totalAmount={150000}
        open={true}
        onOpenChange={() => {}}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /eliminar batch/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });

    await userEvent.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      expect(screen.getByText(/eliminando/i)).toBeInTheDocument();
    });
  });
});
```

---

## 4. Tests E2E - Flujos Completos

### Archivo: `e2e/tests/client-batch-payment-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Client Batch Payment Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Esperar navegación
    await page.waitForURL('/dashboard');
  });

  test('flujo completo: crear → ver → eliminar batch payment', async ({ page }) => {
    // === PASO 1: Ir a crear pago de cliente ===
    await page.goto('/clients/newPayment/test-client-id');

    // === PASO 2: Llenar formulario ===
    await page.fill('[name="amount"]', '150000');
    await page.selectOption('[name="paymentMethod"]', 'Transferencia');
    await page.fill('[name="date"]', '2025-10-01');

    // === PASO 3: Submit ===
    await page.click('button[type="submit"]');

    // Verificar toast de éxito
    await expect(page.locator('text=Pago creado exitosamente')).toBeVisible();

    // === PASO 4: Ir a account statement del cliente ===
    await page.goto('/clients/test-client-id');

    // === PASO 5: Verificar indicador 1(*) ===
    const batchIndicator = page.locator('button:has-text("1(*)")').first();
    await expect(batchIndicator).toBeVisible();
    await expect(batchIndicator).toHaveClass(/text-primary/); // Azul

    // === PASO 6: Click en 1(*) para abrir BatchPaymentDialog ===
    await batchIndicator.click();

    // === PASO 7: Verificar dialog abierto con resumen ===
    await expect(page.locator('text=Pago de Cliente')).toBeVisible();
    await expect(page.locator('text=$150,000')).toBeVisible();
    await expect(page.locator('text=Transferencia')).toBeVisible();

    // Verificar distribución de pagos
    await expect(page.locator('text=Distribución por Proyecto')).toBeVisible();

    // === PASO 8: Cerrar dialog ===
    await page.click('button[aria-label="Cerrar"]');
    await expect(page.locator('text=Pago de Cliente')).not.toBeVisible();

    // === PASO 9: Eliminar batch (opcional) ===
    // ... test de eliminación
  });

  test('crear batch payment y verificar en tabla de pagos', async ({ page }) => {
    // Crear batch payment
    await page.goto('/clients/newPayment/test-client-id');
    await page.fill('[name="amount"]', '200000');
    await page.selectOption('[name="paymentMethod"]', 'Efectivo');
    await page.click('button[type="submit"]');

    // Esperar confirmación
    await expect(page.locator('text=Pago creado')).toBeVisible();

    // Ir a tabla de pagos
    await page.goto('/payments');

    // Verificar que aparecen pagos con badge "Cliente"
    const clientBadge = page.locator('text=Cliente').first();
    await expect(clientBadge).toBeVisible();
    await expect(clientBadge).toHaveClass(/bg-secondary/); // Badge gris

    // Verificar acción "Ver Batch" disponible
    const actionsButton = page.locator('[aria-label="Actions"]').first();
    await actionsButton.click();

    await expect(page.locator('text=Ver Batch Completo')).toBeVisible();
  });

  test('eliminar batch completo desde dialog', async ({ page }) => {
    // Pre-requisito: crear batch primero
    await page.goto('/clients/newPayment/test-client-id');
    await page.fill('[name="amount"]', '100000');
    await page.selectOption('[name="paymentMethod"]', 'Transferencia');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Pago creado')).toBeVisible();

    // Ir a ver el batch
    await page.goto('/clients/test-client-id');
    const batchIndicator = page.locator('button:has-text("1(*)")').first();
    await batchIndicator.click();

    // Click en botón eliminar (si existe)
    const deleteButton = page.locator('button:has-text("Eliminar Batch")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Verificar dialog de confirmación
      await expect(page.locator('text=¿Eliminar batch de pagos?')).toBeVisible();
      await expect(page.locator('text=no se puede deshacer')).toBeVisible();

      // Confirmar eliminación
      await page.click('button:has-text("Eliminar Batch")');

      // Verificar toast de éxito
      await expect(page.locator('text=Batch eliminado exitosamente')).toBeVisible();

      // Verificar que el indicador 1(*) desapareció
      await expect(batchIndicator).not.toBeVisible();
    }
  });
});
```

---

## 5. Casos Edge

### 5.1 Edge Cases de Servicios

```typescript
describe('Edge Cases - createBatchPayment', () => {
  it('debe manejar allocations vacío', async () => {
    const params = {
      clientId: 'client-123',
      totalAmount: 0,
      paymentMethod: 'Transferencia',
      date: new Date(),
      allocations: [] // Vacío
    };

    await expect(createBatchPayment(params)).rejects.toThrow();
  });

  it('debe manejar fecha inválida', async () => {
    const params = {
      clientId: 'client-123',
      totalAmount: 100000,
      paymentMethod: 'Efectivo',
      date: new Date('invalid-date'), // Inválida
      allocations: [{ projectId: 'proj-1', amount: 100000 }]
    };

    await expect(createBatchPayment(params)).rejects.toThrow();
  });

  it('debe manejar suma de allocations != totalAmount', async () => {
    const params = {
      clientId: 'client-123',
      totalAmount: 100000,
      paymentMethod: 'Transferencia',
      date: new Date(),
      allocations: [
        { projectId: 'proj-1', amount: 50000 },
        { projectId: 'proj-2', amount: 30000 }
        // Suma = 80000, pero totalAmount = 100000
      ]
    };

    // Dependiendo de lógica de negocio, puede:
    // - Rechazar
    // - Ajustar automáticamente
    // - Advertir

    // Decidir comportamiento esperado
  });
});

describe('Edge Cases - deleteBatchPayment', () => {
  it('debe manejar eliminación concurrente', async () => {
    const batchId = await createBatchPayment({
      clientId: 'client-123',
      totalAmount: 100000,
      paymentMethod: 'Efectivo',
      date: new Date(),
      allocations: [{ projectId: 'proj-1', amount: 100000 }]
    });

    // Simular 2 eliminaciones simultáneas
    const [result1, result2] = await Promise.all([
      deleteBatchPayment(batchId),
      deleteBatchPayment(batchId)
    ]);

    // Una debe exitosa, otra debe fallar (no encontrado)
    expect(result1.success || result2.success).toBe(true);
    expect(!result1.success || !result2.success).toBe(true);
  });
});
```

### 5.2 Edge Cases de Componentes

```typescript
describe('Edge Cases - BatchPaymentDialog', () => {
  it('debe manejar batch con muchos pagos (100+)', async () => {
    // Mock con 100 pagos
    const manyPayments = Array.from({ length: 100 }, (_, i) => ({
      id: `pay-${i}`,
      projectId: `proj-${i}`,
      amount: 1000,
      paymentMethod: 'Transferencia',
      date: new Date(),
      batchId: 'uuid-123',
      clientId: 'client-123',
      paymentType: 'cliente' as const
    }));

    mockGetBatchPaymentSummary.mockResolvedValue({
      batchId: 'uuid-123',
      clientId: 'client-123',
      clientName: 'Cliente',
      totalAmount: 100000,
      paymentCount: 100,
      date: new Date(),
      paymentMethod: 'Transferencia',
      payments: manyPayments
    });

    renderWithProviders(
      <BatchPaymentDialog
        batchId="uuid-123"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Verificar que muestra scroll
    await waitFor(() => {
      const container = screen.getByRole('dialog');
      expect(container).toHaveClass(/overflow-y-auto/);
    });
  });

  it('debe manejar nombre de cliente muy largo', async () => {
    const longName = 'A'.repeat(200); // 200 caracteres

    mockGetBatchPaymentSummary.mockResolvedValue({
      batchId: 'uuid-123',
      clientId: 'client-123',
      clientName: longName,
      totalAmount: 100000,
      paymentCount: 1,
      date: new Date(),
      paymentMethod: 'Efectivo',
      payments: []
    });

    renderWithProviders(
      <BatchPaymentDialog
        batchId="uuid-123"
        open={true}
        onOpenChange={() => {}}
      />
    );

    // Verificar que no rompe layout
    await waitFor(() => {
      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });
});
```

---

## 6. Métricas y Coverage

### Objetivos de Coverage

```typescript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    },
    './src/services/paymentService.ts': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    }
  }
};
```

### Reporte de Coverage Esperado

```
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
All files                     |   82.5  |   80.3   |   81.7  |   82.1  |
 services/                    |   91.2  |   88.5   |   90.0  |   91.0  |
  paymentService.ts           |   93.5  |   90.2   |   92.8  |   93.3  |
 components/dialogs/          |   85.7  |   82.1   |   84.3  |   85.5  |
  BatchPaymentDialog.tsx      |   87.2  |   83.5   |   86.0  |   87.0  |
  ConfirmDeleteBatchDialog.tsx|   84.1  |   80.6   |   82.5  |   84.0  |
```

### Comandos de Testing

```bash
# Tests unitarios con coverage
npm run test:coverage

# Tests específicos de batch payments
npm test -- paymentService.batch

# Tests E2E batch payment flow
npm run test:e2e -- client-batch-payment-flow

# Watch mode durante desarrollo
npm test -- --watch paymentService
```

### Checklist de Testing

**Unit Tests:**
- [ ] createBatchPayment - caso exitoso
- [ ] createBatchPayment - múltiples allocations
- [ ] createBatchPayment - error handling
- [ ] getBatchPayments - caso exitoso
- [ ] getBatchPayments - batch no existe
- [ ] deleteBatchPayment - caso exitoso
- [ ] deleteBatchPayment - batch no existe
- [ ] deleteBatchPayment - atomicidad
- [ ] getBatchPaymentSummary - caso exitoso
- [ ] getBatchPaymentSummary - cálculo total
- [ ] Edge cases - allocations vacío
- [ ] Edge cases - fecha inválida
- [ ] Edge cases - eliminación concurrente

**Integration Tests:**
- [ ] BatchPaymentDialog - loading state
- [ ] BatchPaymentDialog - empty state
- [ ] BatchPaymentDialog - datos exitosos
- [ ] BatchPaymentDialog - lista de pagos
- [ ] BatchPaymentDialog - cerrar dialog
- [ ] ConfirmDeleteBatchDialog - advertencia
- [ ] ConfirmDeleteBatchDialog - confirmar
- [ ] ConfirmDeleteBatchDialog - error
- [ ] ConfirmDeleteBatchDialog - loading state
- [ ] Edge cases - muchos pagos (100+)
- [ ] Edge cases - nombre largo

**E2E Tests:**
- [ ] Flujo completo crear → ver → eliminar
- [ ] Crear batch y verificar en tabla
- [ ] Eliminar batch desde dialog
- [ ] Indicador 1(*) funcional
- [ ] Badge "Cliente" visible

---

**Próximo documento:** `06-MIGRATION-DATA.md` con IDs de pagos legacy a eliminar
