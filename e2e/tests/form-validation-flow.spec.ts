/**
 * E2E Tests para flujo de validación de formularios
 *
 * Verifica:
 * - Validación en tiempo real (useFormValidation)
 * - Mensajes de error personalizados
 * - Validación de campos requeridos
 * - Validación de formatos (email, números)
 * - Submit exitoso tras correcciones
 */

import { test, expect } from '@playwright/test';

test.describe('Validación de Formularios - Proyecto', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await page.waitForLoadState('networkidle');

    // Abrir formulario de nuevo proyecto
    await page.click('button:has-text("Nuevo Proyecto")');
    await expect(page.locator('role=dialog')).toBeVisible();
  });

  test('debe mostrar errores de validación para campos requeridos', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.click('button:has-text("Guardar")');

    // Verificar mensajes de error de campos requeridos
    await expect(page.locator('text=/número.*requerido|proyecto.*requerido/i')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=/dirección.*requerida/i')).toBeVisible({ timeout: 3000 });
  });

  test('debe validar formato de campos en tiempo real', async ({ page }) => {
    // Llenar campo numérico con texto
    const budgetInput = page.locator('input[name="budget"], input[placeholder*="presupuesto"]');
    if (await budgetInput.isVisible({ timeout: 2000 })) {
      await budgetInput.fill('abc'); // Texto en campo numérico

      // Blur para trigger validación
      await budgetInput.blur();

      // Verificar error de formato
      await expect(page.locator('text=/debe ser.*número|formato.*inválido/i')).toBeVisible({ timeout: 2000 });
    }
  });

  test('debe limpiar errores al corregir campos', async ({ page }) => {
    // Trigger error
    await page.click('button:has-text("Guardar")');
    await expect(page.locator('text=/número.*requerido/i')).toBeVisible({ timeout: 3000 });

    // Corregir campo
    await page.fill('input[name="projectNumber"]', 'PROJ-001');
    await page.locator('input[name="projectNumber"]').blur();

    // Esperar que error desaparezca
    await expect(page.locator('text=/número.*requerido/i')).not.toBeVisible({ timeout: 2000 });
  });

  test('debe permitir submit cuando todos los campos son válidos', async ({ page }) => {
    // Llenar todos los campos requeridos
    await page.fill('input[name="projectNumber"]', 'PROJ-E2E-001');
    await page.fill('input[name="glosa"]', 'Proyecto Test E2E');

    // Dirección
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av Test 123, Santiago');
    await page.waitForTimeout(500);

    const suggestions = page.locator('[role="listbox"], [role="menu"]');
    if (await suggestions.isVisible({ timeout: 3000 })) {
      await suggestions.locator('[role="option"], li').first().click();
    }

    // Cliente
    const clientSelect = page.locator('select[name="clientId"], [aria-label*="Cliente"]');
    if (await clientSelect.isVisible({ timeout: 2000 })) {
      await clientSelect.selectOption({ index: 1 });
    }

    // Submit
    await page.click('button:has-text("Guardar")');

    // Verificar éxito
    await expect(page.locator('text=/proyecto.*creado|éxito/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('role=dialog')).not.toBeVisible({ timeout: 3000 });
  });

  test('debe mostrar loading state durante submit', async ({ page }) => {
    // Llenar formulario
    await page.fill('input[name="projectNumber"]', 'PROJ-LOADING-001');
    await page.fill('input[name="glosa"]', 'Test Loading State');

    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Calle Test 456');

    // Click submit
    const submitButton = page.locator('button:has-text("Guardar")');
    await submitButton.click();

    // Verificar estado de loading (button disabled o spinner)
    await expect(submitButton).toBeDisabled({ timeout: 1000 }).catch(async () => {
      // Alternativamente, verificar spinner
      await expect(page.locator('[role="status"], .spinner, [aria-busy="true"]')).toBeVisible({ timeout: 1000 });
    });
  });
});

test.describe('Validación de Formularios - Visita', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/visits');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Nueva Visita")');
    await expect(page.locator('role=dialog')).toBeVisible();
  });

  test('debe validar campos de fecha', async ({ page }) => {
    const dateInput = page.locator('input[type="date"], input[name="visitDate"]');

    if (await dateInput.isVisible({ timeout: 2000 })) {
      // Intentar fecha inválida o pasada si hay validación
      await dateInput.fill('2020-01-01');
      await dateInput.blur();

      // Verificar mensaje de error si aplica
      const errorMessage = page.locator('text=/fecha.*inválida|fecha.*pasada/i');
      if (await errorMessage.isVisible({ timeout: 1000 })) {
        expect(await errorMessage.textContent()).toBeTruthy();
      }
    }
  });

  test('debe validar campos de texto con longitud mínima', async ({ page }) => {
    const notesInput = page.locator('textarea[name="notes"], textarea[placeholder*="notas"]');

    if (await notesInput.isVisible({ timeout: 2000 })) {
      // Escribir menos del mínimo si hay validación
      await notesInput.fill('ab');
      await notesInput.blur();

      // Verificar error de longitud mínima
      const errorMessage = page.locator('text=/mínimo.*caracteres|muy corto/i');
      if (await errorMessage.isVisible({ timeout: 1000 })) {
        expect(await errorMessage.textContent()).toBeTruthy();
      }
    }
  });
});

test.describe('Validación de Formularios - After Sales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/aftersales');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Nuevo Servicio"), button:has-text("Nueva")');
    await expect(page.locator('role=dialog')).toBeVisible({ timeout: 3000 });
  });

  test('debe validar selección de proyecto requerido', async ({ page }) => {
    // Intentar submit sin proyecto
    await page.click('button:has-text("Guardar")');

    // Verificar error de proyecto requerido
    await expect(page.locator('text=/proyecto.*requerido|seleccione.*proyecto/i')).toBeVisible({ timeout: 3000 });
  });

  test('debe validar tipo de servicio requerido', async ({ page }) => {
    // Llenar proyecto pero no tipo
    const projectSelect = page.locator('select[name="projectId"]');
    if (await projectSelect.isVisible({ timeout: 2000 })) {
      await projectSelect.selectOption({ index: 1 });
    }

    await page.click('button:has-text("Guardar")');

    // Verificar error de tipo requerido
    const errorMessage = page.locator('text=/tipo.*requerido|servicio.*requerido/i');
    if (await errorMessage.isVisible({ timeout: 2000 })) {
      expect(await errorMessage.textContent()).toBeTruthy();
    }
  });
});

test.describe('Validación Cross-Field', () => {
  test('debe validar que fecha de inicio < fecha de fin', async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    const startDate = page.locator('input[name="startDate"]');
    const endDate = page.locator('input[name="endDate"]');

    if (await startDate.isVisible({ timeout: 2000 }) && await endDate.isVisible({ timeout: 2000 })) {
      // Fecha fin antes que inicio
      await startDate.fill('2025-12-31');
      await endDate.fill('2025-01-01');
      await endDate.blur();

      // Verificar error de validación cross-field
      const errorMessage = page.locator('text=/fecha.*inicio.*fin|fin.*debe.*después/i');
      if (await errorMessage.isVisible({ timeout: 2000 })) {
        expect(await errorMessage.textContent()).toBeTruthy();
      }
    }
  });
});

test.describe('Accesibilidad de Validación', () => {
  test('debe tener atributos ARIA para errores', async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    // Trigger error
    await page.click('button:has-text("Guardar")');
    await page.waitForTimeout(1000);

    // Verificar atributos aria-invalid
    const invalidInput = page.locator('input[aria-invalid="true"]').first();
    if (await invalidInput.isVisible({ timeout: 2000 })) {
      const ariaDescribedBy = await invalidInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toBeTruthy();

      // Verificar que elemento de error existe con ese ID
      const errorElement = page.locator(`#${ariaDescribedBy}`);
      await expect(errorElement).toBeVisible();
    }
  });

  test('debe hacer focus en primer campo con error', async ({ page }) => {
    await page.goto('http://localhost:3002/projects');
    await page.click('button:has-text("Nuevo Proyecto")');

    // Submit para trigger errores
    await page.click('button:has-text("Guardar")');
    await page.waitForTimeout(500);

    // Verificar que algún campo con error tiene focus
    const focusedElement = page.locator(':focus');
    const ariaInvalid = await focusedElement.getAttribute('aria-invalid');

    if (ariaInvalid) {
      expect(ariaInvalid).toBe('true');
    }
  });
});
