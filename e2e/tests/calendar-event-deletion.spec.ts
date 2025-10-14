/**
 * E2E Test: Calendar Event Deletion Bug Investigation
 *
 * Objetivo: Reproducir el bug de bloqueo de clicks después de eliminar un evento
 *
 * Escenario:
 * 1. Usuario navega a /calreact
 * 2. Usuario elimina un evento del día de hoy
 * 3. Verificar si la página se bloquea y no permite más clicks
 */

import { test, expect } from '@playwright/test';

test.describe('Calendar Event Deletion - UI Blocking Bug', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar al calendario
    await page.goto('http://localhost:3002/calreact');

    // Esperar que el título de la página esté visible
    await page.waitForSelector('h1:has-text("Calendario")', {
      state: 'visible',
      timeout: 15000
    });

    // Esperar que el toolbar esté visible
    await page.waitForSelector('button:has-text("Hoy")', {
      state: 'visible',
      timeout: 10000
    });
  });

  test('debe permitir clicks después de eliminar un evento', async ({ page }) => {
    // 1. Tomar snapshot inicial
    console.log('📸 Capturando estado inicial del calendario...');
    await page.screenshot({ path: 'test-results/calendar-before-delete.png', fullPage: true });

    // 2. Buscar eventos usando el atributo data-calendar-event
    // Los eventos tienen data-calendar-event="true" (ver CalendarEventCard.tsx línea 180)
    const todayEvents = page.locator('[data-calendar-event="true"]');

    const eventCount = await todayEvents.count();
    console.log(`🔍 Eventos encontrados: ${eventCount}`);

    if (eventCount === 0) {
      console.log('⚠️ No hay eventos para eliminar - test skipped');
      test.skip();
    }

    // 3. Hacer hover sobre el primer evento para mostrar el botón de acciones
    console.log('🖱️ Haciendo hover sobre el primer evento...');
    await todayEvents.first().hover();

    // Esperar un momento para que aparezca el botón de acciones (transición CSS)
    await page.waitForTimeout(500);

    // 4. Hacer click en el botón de acciones (3 puntos verticales)
    console.log('📋 Abriendo menú de acciones...');
    const actionsButton = page.locator('button[aria-label="Acciones del evento"]').first();
    await actionsButton.click();

    // Esperar que aparezca el dropdown menu
    await page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 5000 });
    console.log('✅ Menú de acciones abierto');

    // Tomar screenshot del menú
    await page.screenshot({ path: 'test-results/calendar-actions-menu.png', fullPage: true });

    // 5. Buscar y hacer click en el menuitem "Eliminar"
    const deleteMenuItem = page.getByRole('menuitem', { name: /eliminar/i });
    console.log('🗑️ Haciendo click en opción Eliminar...');
    await deleteMenuItem.click();

    // 6. Esperar el dialog de confirmación (EventDeleteDialog)
    await page.waitForSelector('[role="alertdialog"]', { state: 'visible', timeout: 5000 });
    console.log('✅ Dialog de confirmación abierto');

    // Tomar screenshot del dialog de confirmación
    await page.screenshot({ path: 'test-results/calendar-delete-confirmation.png', fullPage: true });

    // 6. Confirmar la eliminación
    const confirmButton = page.getByRole('button', { name: /confirmar|eliminar/i });
    console.log('✔️ Confirmando eliminación...');
    await confirmButton.click();

    // 7. Esperar que el dialog se cierre
    await page.waitForSelector('[role="alertdialog"]', { state: 'hidden', timeout: 5000 });
    console.log('✅ Dialog cerrado');

    // 8. Esperar que el toast de éxito aparezca
    await page.waitForSelector('text=/evento eliminado/i', { timeout: 5000 });
    console.log('✅ Toast de éxito mostrado');

    // Tomar screenshot después de eliminar
    await page.screenshot({ path: 'test-results/calendar-after-delete.png', fullPage: true });

    // 9. CRÍTICO: Verificar que la página NO está bloqueada
    console.log('🔍 Verificando que la página sigue siendo interactiva...');

    // Intentar hacer click en el botón "Hoy" del toolbar
    const todayButton = page.getByRole('button', { name: /hoy|today/i });
    await expect(todayButton).toBeEnabled();
    await todayButton.click({ timeout: 5000 });
    console.log('✅ Botón "Hoy" clickeable');

    // Intentar hacer click en el botón de agregar evento
    const addEventButton = page.getByRole('button', { name: /añadir evento/i });
    await expect(addEventButton).toBeEnabled();
    await addEventButton.click({ timeout: 5000 });
    console.log('✅ Botón "Añadir Evento" clickeable');

    // Verificar que se abre el dropdown de tipos de evento
    await page.waitForSelector('[role="menu"]', { state: 'visible', timeout: 5000 });
    console.log('✅ Dropdown de tipos de evento abierto');

    // Cerrar el dropdown haciendo click fuera
    await page.keyboard.press('Escape');

    // 10. Verificar que otros elementos siguen siendo clickeables
    const filterInput = page.getByPlaceholder(/buscar|filtrar/i);
    await expect(filterInput).toBeEnabled();
    console.log('✅ Input de filtro clickeable');

    // Tomar screenshot final
    await page.screenshot({ path: 'test-results/calendar-final-state.png', fullPage: true });

    console.log('✅ TEST EXITOSO: La página permanece interactiva después de eliminar');
  });

  test('debe detectar elementos con pointer-events: none después de eliminar', async ({ page }) => {
    // Este test busca específicamente elementos bloqueados con pointer-events

    const todayEvents = page.locator('[data-calendar-event="true"]');
    const eventCount = await todayEvents.count();

    if (eventCount === 0) {
      test.skip();
    }

    // Eliminar evento usando dropdown de acciones
    await todayEvents.first().hover();
    await page.waitForTimeout(500);

    const actionsButton = page.locator('button[aria-label="Acciones del evento"]').first();
    await actionsButton.click();

    await page.waitForSelector('[role="menu"]', { state: 'visible' });
    const deleteMenuItem = page.getByRole('menuitem', { name: /eliminar/i });
    await deleteMenuItem.click();

    await page.waitForSelector('[role="alertdialog"]', { state: 'visible' });
    const confirmButton = page.getByRole('button', { name: /confirmar|eliminar/i });
    await confirmButton.click();

    await page.waitForSelector('[role="alertdialog"]', { state: 'hidden' });

    // Esperar 1 segundo para que cualquier efecto secundario ocurra
    await page.waitForTimeout(1000);

    // Buscar elementos con pointer-events: none
    const blockedElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const blocked: string[] = [];

      allElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.pointerEvents === 'none') {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? `#${el.id}` : '';
          const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
          blocked.push(`${tag}${id}${classes}`);
        }
      });

      return blocked;
    });

    console.log('🔍 Elementos con pointer-events: none:', blockedElements);

    // Verificar que no hay elementos críticos bloqueados
    const criticalSelectors = [
      'body',
      'main',
      '[data-testid="calendar-view"]',
      'button'
    ];

    for (const selector of criticalSelectors) {
      const element = page.locator(selector).first();
      const pointerEvents = await element.evaluate((el) =>
        window.getComputedStyle(el).pointerEvents
      );

      expect(pointerEvents).not.toBe('none');
      console.log(`✅ ${selector} no está bloqueado`);
    }
  });

  test('debe verificar que no hay overlays bloqueantes después de eliminar', async ({ page }) => {
    const todayEvents = page.locator('[data-calendar-event="true"]');
    const eventCount = await todayEvents.count();

    if (eventCount === 0) {
      test.skip();
    }

    // Eliminar evento usando dropdown de acciones
    await todayEvents.first().hover();
    await page.waitForTimeout(500);

    const actionsButton = page.locator('button[aria-label="Acciones del evento"]').first();
    await actionsButton.click();

    await page.waitForSelector('[role="menu"]', { state: 'visible' });
    const deleteMenuItem = page.getByRole('menuitem', { name: /eliminar/i });
    await deleteMenuItem.click();

    await page.waitForSelector('[role="alertdialog"]', { state: 'visible' });
    const confirmButton = page.getByRole('button', { name: /confirmar|eliminar/i });
    await confirmButton.click();

    await page.waitForSelector('[role="alertdialog"]', { state: 'hidden' });

    // Esperar que cualquier animación termine
    await page.waitForTimeout(1000);

    // Buscar overlays/backdrops que puedan estar bloqueando
    const overlays = await page.evaluate(() => {
      const potentialOverlays = document.querySelectorAll(
        '[data-radix-dialog-overlay], [role="presentation"], .modal-backdrop, .overlay'
      );

      return Array.from(potentialOverlays).map((el) => {
        const style = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          zIndex: style.zIndex
        };
      });
    });

    console.log('🔍 Overlays encontrados:', overlays);

    // Verificar que no hay overlays visibles bloqueando
    const visibleOverlays = overlays.filter(
      (o) => o.display !== 'none' && o.visibility !== 'hidden' && parseFloat(o.opacity) > 0
    );

    expect(visibleOverlays.length).toBe(0);
    console.log('✅ No hay overlays visibles bloqueando la UI');
  });
});
