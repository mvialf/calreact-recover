/**
 * E2E Tests para Autocomplete Component
 *
 * Verifica:
 * - Flujo completo de búsqueda y selección
 * - StrictSelection con reversión a valor válido
 * - Navegación por teclado (ArrowDown, Enter, Escape)
 * - Debounce de búsquedas
 * - Estados de carga
 * - Renderizado personalizado
 */

import { test, expect } from '@playwright/test';

test.describe('Autocomplete - Flujos Completos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/test-autocomplete');
    await page.waitForLoadState('networkidle');
  });

  test('debe completar flujo de búsqueda y selección', async ({ page }) => {
    // Buscar el input del autocomplete
    const input = page.getByRole('combobox').first();

    // Escribir búsqueda
    await input.fill('Opción 2');

    // Verificar que popover abrió y muestra opciones
    await expect(page.getByRole('option', { name: 'Opción 2' })).toBeVisible({ timeout: 3000 });

    // Seleccionar item
    await page.getByRole('option', { name: 'Opción 2' }).click();

    // Verificar selección
    await expect(input).toHaveValue('Opción 2');

    // Verificar que popover se cerró
    await expect(page.getByRole('option', { name: 'Opción 2' })).not.toBeVisible();
  });

  test('debe manejar strictSelection con reversión', async ({ page }) => {
    // Buscar autocomplete con strictSelection habilitado
    const strictInput = page.locator('[data-testid="strict-autocomplete"]');
    await expect(strictInput).toBeVisible();

    // Escribir texto inválido
    await strictInput.fill('texto invalido');

    // Verificar que input tiene indicador de error visual
    await expect(strictInput).toHaveClass(/border-destructive/);

    // Blur del input
    await strictInput.blur();

    // Verificar que revierte a vacío (sin valor previo)
    await expect(strictInput).toHaveValue('');
  });

  test('debe navegar con teclado y seleccionar', async ({ page }) => {
    const input = page.getByRole('combobox').first();

    // Escribir para abrir popover
    await input.fill('Op');

    // Esperar que aparezcan opciones
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 3000 });

    // Navegar con ArrowDown
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Seleccionar con Enter
    await page.keyboard.press('Enter');

    // Verificar selección del segundo item
    await expect(input).toHaveValue('Opción 2');
  });

  test('debe aplicar debounce correctamente', async ({ page }) => {
    // Buscar autocomplete con debounce
    const debounceInput = page.locator('[data-testid="debounce-autocomplete"]');
    await expect(debounceInput).toBeVisible();

    // Escribir rápidamente
    await debounceInput.type('test', { delay: 50 });

    // No debe mostrar resultados inmediatamente (antes de 500ms)
    await expect(page.getByRole('option').first()).not.toBeVisible({ timeout: 300 });

    // Esperar debounce (500ms configurado)
    await page.waitForTimeout(500);

    // Ahora debe mostrar resultados
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 2000 });
  });

  test('debe mostrar estado de carga', async ({ page }) => {
    // Buscar autocomplete con loading
    const loadingInput = page.locator('[data-testid="loading-autocomplete"]');
    await expect(loadingInput).toBeVisible();

    // Verificar que input está deshabilitado cuando está cargando
    await expect(loadingInput).toBeDisabled();

    // Verificar spinner visible (icono Loader2 con animate-spin)
    const spinner = page.locator('[data-testid="loading-autocomplete"]').locator('..').locator('.animate-spin');
    await expect(spinner).toBeVisible();
  });

  test('debe usar renderizado personalizado', async ({ page }) => {
    // Buscar autocomplete con renderizado personalizado
    const customInput = page.locator('[data-testid="custom-render-autocomplete"]');
    await expect(customInput).toBeVisible();

    // Escribir para abrir popover
    await customInput.fill('Custom');

    // Verificar que opciones tienen renderizado personalizado (emoji + texto)
    await expect(page.getByText(/🎨/)).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Autocomplete - Casos Edge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/test-autocomplete');
    await page.waitForLoadState('networkidle');
  });

  test('debe cerrar popover con Escape', async ({ page }) => {
    const input = page.getByRole('combobox').first();

    // Abrir popover
    await input.fill('Op');
    await expect(page.getByRole('option').first()).toBeVisible();

    // Presionar Escape
    await page.keyboard.press('Escape');

    // Verificar que popover se cerró
    await expect(page.getByRole('option').first()).not.toBeVisible();
  });

  test('debe limpiar selección con input vacío', async ({ page }) => {
    const input = page.getByRole('combobox').first();

    // Seleccionar un item primero
    await input.fill('Opción 1');
    await page.getByRole('option', { name: 'Opción 1' }).click();
    await expect(input).toHaveValue('Opción 1');

    // Limpiar input
    await input.clear();

    // Verificar que selección se limpia (el componente llama onSelect(''))
    await expect(input).toHaveValue('');
  });

  test('debe manejar búsqueda sin resultados', async ({ page }) => {
    const input = page.getByRole('combobox').first();

    // Escribir búsqueda que no da resultados
    await input.fill('xyzabc123invalid');
    await page.waitForTimeout(500);

    // Verificar mensaje de "sin resultados"
    await expect(page.getByText(/No se encontraron resultados/i)).toBeVisible({ timeout: 3000 });
  });
});
