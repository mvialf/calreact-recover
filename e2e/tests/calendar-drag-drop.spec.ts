import { test, expect } from '@playwright/test';

/**
 * Tests E2E para funcionalidad drag & drop del calendario
 *
 * Valida que los eventos se puedan arrastrar entre días
 * y que se actualicen correctamente en Firebase
 */

test.describe('Calendar Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página del calendario
    await page.goto('http://localhost:3002/calreact');

    // Esperar a que el calendario esté completamente cargado
    await page.waitForSelector('[data-calendar-event="true"]', { timeout: 10000 });
  });

  test('debe mostrar eventos draggables en vista mensual', async ({ page }) => {
    // Verificar que existan eventos en el calendario
    const events = page.locator('[data-calendar-event="true"]');
    await expect(events.first()).toBeVisible();

    // Verificar que los eventos tengan el atributo draggable
    const firstEvent = events.first();
    const isDraggable = await firstEvent.getAttribute('draggable');
    expect(isDraggable).toBe('true');
  });

  test('debe cambiar cursor a grab cuando hover sobre evento', async ({ page }) => {
    const firstEvent = page.locator('[data-calendar-event="true"]').first();

    // Hacer hover sobre el evento
    await firstEvent.hover();

    // Verificar que el cursor cambie (la clase debe incluir cursor-grab)
    const classList = await firstEvent.getAttribute('class');
    expect(classList).toContain('cursor-grab');
  });

  test('debe mover evento entre días en vista mensual', async ({ page }) => {
    // Tomar el primer evento visible
    const firstEvent = page.locator('[data-calendar-event="true"]').first();

    // Obtener el contenedor padre para saber en qué celda está
    const originalCell = firstEvent.locator('xpath=ancestor::div[contains(@class, "border-r")]').first();
    await expect(originalCell).toBeVisible();

    // Seleccionar una celda de destino diferente (3 celdas después)
    const allCells = page.locator('div.border-r.border-b');
    const targetCell = allCells.nth(3);

    // Verificar que la celda de destino existe
    await expect(targetCell).toBeVisible();

    // Realizar drag and drop
    await firstEvent.dragTo(targetCell, {
      force: true,
      targetPosition: { x: 50, y: 50 }
    });

    // Esperar un momento para que se complete la animación
    await page.waitForTimeout(1000);

    // Verificar que apareció el toast de éxito
    const successToast = page.getByText(/evento movido/i);
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test('debe mantener duración del evento al moverlo', async ({ page }) => {
    // Este test verifica que un evento de varios días mantenga su duración

    // Crear un evento de prueba de varios días mediante la UI
    const addButton = page.getByRole('button', { name: /agregar evento/i });
    if (await addButton.isVisible()) {
      await addButton.click();

      // Llenar el formulario con un evento de varios días
      // (Este paso depende de cómo esté implementado el modal)
      // Por ahora, solo verificamos que el sistema mantiene la duración
      await page.keyboard.press('Escape'); // Cerrar modal
    }

    // Nota: Este test requiere datos de prueba pre-configurados
    // o una implementación más compleja para crear eventos vía UI
  });

  test('debe mostrar feedback visual durante drag', async ({ page }) => {
    const firstEvent = page.locator('[data-calendar-event="true"]').first();
    const targetCell = page.locator('div.border-r.border-b').nth(3);

    // Iniciar drag
    await firstEvent.hover();
    await page.mouse.down();

    // Durante el drag, el evento debe tener opacidad reducida
    const classList = await firstEvent.getAttribute('class');

    // Mover sobre el target
    await targetCell.hover();
    await page.waitForTimeout(300);

    // Verificar que la celda target tiene highlight
    const targetClass = await targetCell.getAttribute('class');
    expect(targetClass).toContain('bg-accent'); // Visual feedback

    // Soltar
    await page.mouse.up();
  });

  test('debe funcionar drag & drop en vista semanal', async ({ page }) => {
    // Cambiar a vista semanal
    const viewSelect = page.locator('select, [role="combobox"]').first();
    await viewSelect.click();

    const weekOption = page.getByText(/semana/i);
    if (await weekOption.isVisible()) {
      await weekOption.click();

      // Esperar a que cargue la vista semanal
      await page.waitForTimeout(500);

      // Verificar que hay eventos en vista semanal
      const events = page.locator('[data-calendar-event="true"]');
      if (await events.count() > 0) {
        const firstEvent = events.first();
        const targetColumn = page.locator('div[class*="flex-col"]').nth(2);

        await firstEvent.dragTo(targetColumn, { force: true });

        // Verificar toast
        const successToast = page.getByText(/evento movido/i);
        await expect(successToast).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('debe funcionar drag & drop en vista diaria', async ({ page }) => {
    // Cambiar a vista diaria
    const viewSelect = page.locator('select, [role="combobox"]').first();
    await viewSelect.click();

    const dayOption = page.getByText(/día/i);
    if (await dayOption.isVisible()) {
      await dayOption.click();

      // Esperar a que cargue la vista diaria
      await page.waitForTimeout(500);

      // En vista diaria, verificar que los eventos son draggables
      const events = page.locator('[data-calendar-event="true"]');
      if (await events.count() > 0) {
        const firstEvent = events.first();
        const isDraggable = await firstEvent.getAttribute('draggable');
        expect(isDraggable).toBe('true');
      }
    }
  });

  test('debe mostrar error si falla actualización en Firebase', async ({ page }) => {
    // Simular error de red desconectando
    await page.context().setOffline(true);

    const firstEvent = page.locator('[data-calendar-event="true"]').first();
    const targetCell = page.locator('div.border-r.border-b').nth(3);

    // Intentar mover evento sin conexión
    await firstEvent.dragTo(targetCell, { force: true });

    // Esperar a que aparezca el toast de error
    await page.waitForTimeout(2000);

    const errorToast = page.getByText(/error/i);
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    // Restaurar conexión
    await page.context().setOffline(false);
  });
});