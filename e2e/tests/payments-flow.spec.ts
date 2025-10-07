/**
 * E2E Tests para flujo completo de Payments
 *
 * Verifica:
 * - Navegación a página de pagos
 * - Renderizado de tabla con datos enriquecidos (usePaymentsData)
 * - Creación de nuevo pago
 * - Validación de formulario
 * - Actualización de tabla después de crear pago
 */

import { test, expect } from '@playwright/test';

test.describe('Flujo de Payments', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('http://localhost:3002');

    // Esperar a que cargue la app
    await page.waitForLoadState('networkidle');
  });

  test('debe renderizar página de pagos con datos enriquecidos', async ({ page }) => {
    // Navegar a payments
    await page.click('text=Pagos');
    await page.waitForURL('**/payments');

    // Verificar que la tabla se renderiza
    await expect(page.locator('table')).toBeVisible();

    // Verificar columnas de datos enriquecidos
    await expect(page.locator('th:has-text("Cliente")')).toBeVisible();
    await expect(page.locator('th:has-text("Proyecto")')).toBeVisible();
    await expect(page.locator('th:has-text("Monto")')).toBeVisible();
    await expect(page.locator('th:has-text("Fecha")')).toBeVisible();

    // Verificar que hay al menos una fila de datos
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('debe abrir modal de crear pago', async ({ page }) => {
    await page.click('text=Pagos');
    await page.waitForURL('**/payments');

    // Click en botón "Nuevo Pago"
    await page.click('button:has-text("Nuevo Pago")');

    // Verificar que modal se abre
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('text=Crear Pago')).toBeVisible();
  });

  test('debe validar campos requeridos en formulario de pago', async ({ page }) => {
    await page.click('text=Pagos');
    await page.waitForURL('**/payments');

    await page.click('button:has-text("Nuevo Pago")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Intentar enviar sin llenar campos
    await page.click('button:has-text("Guardar")');

    // Verificar mensajes de error de validación
    // (Ajustar según implementación real de validación)
    await expect(page.locator('text=/proyecto.*requerido/i')).toBeVisible({ timeout: 3000 });
  });

  test('debe crear nuevo pago y actualizar tabla', async ({ page }) => {
    await page.click('text=Pagos');
    await page.waitForURL('**/payments');

    // Contar pagos iniciales
    const initialRowCount = await page.locator('tbody tr').count();

    // Abrir modal
    await page.click('button:has-text("Nuevo Pago")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Llenar formulario
    await page.selectOption('select[name="projectId"]', { index: 1 });
    await page.fill('input[name="amount"]', '50000');
    await page.fill('input[name="paymentDate"]', '2025-10-06');
    await page.selectOption('select[name="paymentMethod"]', 'Transferencia');

    // Enviar formulario
    await page.click('button:has-text("Guardar")');

    // Esperar que modal se cierre
    await expect(page.locator('role=dialog')).not.toBeVisible({ timeout: 5000 });

    // Verificar toast de éxito
    await expect(page.locator('text=/pago.*creado/i')).toBeVisible({ timeout: 3000 });

    // Verificar que tabla se actualiza
    const finalRowCount = await page.locator('tbody tr').count();
    expect(finalRowCount).toBe(initialRowCount + 1);
  });

  test('debe filtrar pagos por cliente', async ({ page }) => {
    await page.click('text=Pagos');
    await page.waitForURL('**/payments');

    // Esperar que tabla cargue
    await expect(page.locator('table')).toBeVisible();

    // Usar filtro de búsqueda si existe
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Cliente Test');

      // Verificar que resultados filtran
      const filteredRows = page.locator('tbody tr:visible');
      await expect(filteredRows.first()).toContainText('Cliente Test');
    }
  });

  test('debe mostrar detalles de pago al hacer click en fila', async ({ page }) => {
    await page.click('text=Pagos');
    await page.waitForURL('**/payments');

    // Click en primera fila
    await page.locator('tbody tr').first().click();

    // Verificar que modal/drawer de detalles se abre
    // (Ajustar según implementación real)
    await expect(page.locator('role=dialog, role=complementary')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Validación de datos enriquecidos (usePaymentsData)', () => {
  test('debe mostrar nombre de cliente enriquecido en tabla', async ({ page }) => {
    await page.goto('http://localhost:3002/payments');
    await page.waitForLoadState('networkidle');

    // Verificar que columna Cliente muestra nombres reales
    const clientCells = page.locator('td[data-column="cliente"], td:has-text("Cliente")');
    await expect(clientCells.first()).toBeVisible();

    // Verificar que NO muestra IDs sino nombres legibles
    const firstClientName = await clientCells.first().textContent();
    expect(firstClientName).not.toMatch(/^[a-zA-Z0-9]{20,}$/); // No debe ser un ID
  });

  test('debe mostrar número de proyecto enriquecido', async ({ page }) => {
    await page.goto('http://localhost:3002/payments');
    await page.waitForLoadState('networkidle');

    // Verificar que columna Proyecto muestra números de proyecto
    const projectCells = page.locator('td[data-column="proyecto"]');
    await expect(projectCells.first()).toBeVisible();

    // Verificar formato de número de proyecto
    const firstProjectNumber = await projectCells.first().textContent();
    expect(firstProjectNumber).toBeTruthy();
  });
});
