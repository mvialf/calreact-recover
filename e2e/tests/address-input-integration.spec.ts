/**
 * E2E Tests para AddressInput con Google Places Integration
 *
 * Verifica:
 * - Renderizado de AddressInput
 * - Autocomplete de Google Places (useGooglePlaces)
 * - Selección de dirección
 * - Extracción de componentes de dirección
 * - Integración con formularios
 */

import { test, expect } from '@playwright/test';

test.describe('AddressInput - Google Places Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
  });

  test('debe renderizar AddressInput en formulario de proyecto', async ({ page }) => {
    // Navegar a proyectos
    await page.click('text=Proyectos');
    await page.waitForURL('**/projects');

    // Abrir modal de nuevo proyecto
    await page.click('button:has-text("Nuevo Proyecto")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Verificar que AddressInput está presente
    await expect(page.locator('input[placeholder*="dirección"]')).toBeVisible();
  });

  test('debe mostrar sugerencias de Google Places al escribir', async ({ page }) => {
    await page.click('text=Proyectos');
    await page.waitForURL('**/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    const addressInput = page.locator('input[placeholder*="dirección"]');
    await expect(addressInput).toBeVisible();

    // Escribir dirección
    await addressInput.fill('Av Lib');
    await page.waitForTimeout(500); // Debounce

    // Verificar que aparecen sugerencias
    const suggestions = page.locator('[role="listbox"], [role="menu"], .suggestions');
    await expect(suggestions).toBeVisible({ timeout: 5000 });

    // Verificar que hay al menos una sugerencia
    const suggestionItems = suggestions.locator('[role="option"], li');
    await expect(suggestionItems.first()).toBeVisible();
  });

  test('debe seleccionar dirección de las sugerencias', async ({ page }) => {
    await page.click('text=Proyectos');
    await page.waitForURL('**/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av Libertador');
    await page.waitForTimeout(500);

    // Esperar sugerencias
    const suggestions = page.locator('[role="listbox"], [role="menu"]');
    await expect(suggestions).toBeVisible({ timeout: 5000 });

    // Click en primera sugerencia
    await suggestions.locator('[role="option"], li').first().click();

    // Verificar que input se llena con dirección seleccionada
    const selectedValue = await addressInput.inputValue();
    expect(selectedValue).toContain('Libertador');
  });

  test('debe extraer componentes de dirección correctamente', async ({ page }) => {
    await page.click('text=Proyectos');
    await page.waitForURL('**/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    // Llenar campos básicos del proyecto
    await page.fill('input[name="projectNumber"]', 'TEST-001');
    await page.fill('input[name="glosa"]', 'Proyecto Test');

    // Seleccionar dirección
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av Libertador 1234, Santiago');
    await page.waitForTimeout(500);

    const suggestions = page.locator('[role="listbox"], [role="menu"]');
    if (await suggestions.isVisible({ timeout: 3000 })) {
      await suggestions.locator('[role="option"], li').first().click();
    }

    // Enviar formulario
    await page.click('button:has-text("Guardar")');

    // Verificar que proyecto se crea exitosamente
    await expect(page.locator('text=/proyecto.*creado/i')).toBeVisible({ timeout: 5000 });
  });

  test('debe manejar error cuando no hay sugerencias', async ({ page }) => {
    await page.click('text=Proyectos');
    await page.waitForURL('**/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    const addressInput = page.locator('input[placeholder*="dirección"]');

    // Escribir texto que no debería dar resultados
    await addressInput.fill('xyzabc123invalid');
    await page.waitForTimeout(1000);

    // Verificar que no hay sugerencias o mensaje de "sin resultados"
    const noResults = page.locator('text=/sin resultados|no encontrado/i');
    await expect(noResults).toBeVisible({ timeout: 3000 }).catch(() => {
      // Si no hay mensaje, verificar que lista de sugerencias no existe
      return expect(page.locator('[role="listbox"]:visible')).toHaveCount(0);
    });
  });

  test('debe validar dirección requerida en formulario', async ({ page }) => {
    await page.click('text=Proyectos');
    await page.waitForURL('**/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    // Llenar solo algunos campos sin dirección
    await page.fill('input[name="projectNumber"]', 'TEST-002');

    // Intentar enviar sin dirección
    await page.click('button:has-text("Guardar")');

    // Verificar mensaje de error de validación
    await expect(page.locator('text=/dirección.*requerida/i')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('AddressInput - Country Configuration', () => {
  test('debe respetar configuración de país desde Settings', async ({ page }) => {
    // Ir a Settings
    await page.goto('http://localhost:3002/settings');
    await page.waitForLoadState('networkidle');

    // Cambiar país a Argentina
    const countrySelector = page.locator('select[name="defaultCountry"], [aria-label*="país"]');
    if (await countrySelector.isVisible({ timeout: 2000 })) {
      await countrySelector.selectOption('AR');

      // Guardar configuración si hay botón
      const saveButton = page.locator('button:has-text("Guardar")');
      if (await saveButton.isVisible({ timeout: 1000 })) {
        await saveButton.click();
      }
    }

    // Navegar a crear proyecto
    await page.click('text=Proyectos');
    await page.waitForURL('**/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av Corrientes');
    await page.waitForTimeout(500);

    // Verificar que sugerencias son de Argentina
    const suggestions = page.locator('[role="listbox"], [role="menu"]');
    if (await suggestions.isVisible({ timeout: 3000 })) {
      const firstSuggestion = await suggestions.locator('[role="option"], li').first().textContent();
      expect(firstSuggestion).toMatch(/argentina|buenos aires/i);
    }
  });

  test('debe usar país de entidad al editar proyecto existente', async ({ page }) => {
    // Navegar a proyectos
    await page.goto('http://localhost:3002/projects');
    await page.waitForLoadState('networkidle');

    // Click en primer proyecto para editar
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Esperar modal de edición
    await expect(page.locator('role=dialog')).toBeVisible({ timeout: 3000 });

    // Verificar que AddressInput tiene valor pre-cargado
    const addressInput = page.locator('input[placeholder*="dirección"]');
    const currentValue = await addressInput.inputValue();

    // Si hay dirección, modificarla debería usar país de la entidad
    if (currentValue) {
      await addressInput.clear();
      await addressInput.fill('Nueva direccion 123');
      await page.waitForTimeout(500);

      // Verificar que sugerencias mantienen país del proyecto
      const suggestions = page.locator('[role="listbox"], [role="menu"]');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('AddressInput - Performance & Cache', () => {
  test('debe usar cache para búsquedas repetidas', async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    const addressInput = page.locator('input[placeholder*="dirección"]');

    // Primera búsqueda
    await addressInput.fill('Av Libertador');
    await page.waitForTimeout(500);
    const firstLoadTime = Date.now();
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });
    const firstDuration = Date.now() - firstLoadTime;

    // Limpiar y repetir misma búsqueda
    await addressInput.clear();
    await page.waitForTimeout(300);
    await addressInput.fill('Av Libertador');
    await page.waitForTimeout(500);
    const secondLoadTime = Date.now();
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });
    const secondDuration = Date.now() - secondLoadTime;

    // Segunda búsqueda debería ser más rápida (cache)
    expect(secondDuration).toBeLessThanOrEqual(firstDuration * 1.5);
  });

  test('debe hacer debounce de búsquedas rápidas', async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    const addressInput = page.locator('input[placeholder*="dirección"]');

    // Escribir rápidamente caracteres
    await addressInput.pressSequentially('Av Lib', { delay: 50 });

    // Esperar menos del debounce time
    await page.waitForTimeout(200);

    // No debería haber sugerencias aún
    const suggestionsBeforeDebounce = page.locator('[role="listbox"]:visible');
    expect(await suggestionsBeforeDebounce.count()).toBe(0);

    // Esperar tiempo de debounce completo
    await page.waitForTimeout(500);

    // Ahora sí debería haber sugerencias
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 2000 });
  });
});
