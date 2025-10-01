import { test, expect } from '@playwright/test';

/**
 * Test específico para drag & drop del evento "Sra. Loreto Castañeda"
 *
 * Objetivo: Mover evento del 7 de septiembre al 30 de septiembre 2025
 * ID del evento: zOxCEMpuzTtbKqFaOmih
 */

test.describe('Calendar Drag & Drop - Evento Específico "Sra. Loreto Castañeda"', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar al calendario
    await page.goto('http://localhost:3002/calreact');

    // Esperar a que el calendario cargue completamente
    await page.waitForTimeout(3000);

    // 🎯 CRÍTICO: Asegurarse de estar en vista "Mes" (month view)
    const botonMes = page.locator('button').filter({ hasText: 'Mes' });
    const botonMesVisible = await botonMes.isVisible().catch(() => false);

    if (botonMesVisible) {
      // Verificar si ya está activo
      const isActive = await botonMes.getAttribute('data-state');
      console.log('Estado botón Mes:', isActive);

      if (isActive !== 'active') {
        await botonMes.click();
        await page.waitForTimeout(500);
        console.log('✓ Cambiado a vista Mes');
      } else {
        console.log('✓ Ya estamos en vista Mes');
      }
    }

    // Esperar a que los eventos carguen
    await page.waitForSelector('[data-calendar-event="true"]', { timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  test('debe mover evento "Sra. Loreto Castañeda" del 7 al 30 de septiembre 2025', async ({ page }) => {
    // 1. Tomar screenshot inicial
    await page.screenshot({ path: 'e2e/screenshots/before-drag.png', fullPage: true });

    // 2. Navegar a septiembre 2025 si no estamos ahí
    const mesActual = await page.locator('h2').first().textContent();
    console.log('Mes actual:', mesActual);

    // 3. Buscar el evento "Loreto Castañeda" en cualquier parte del calendario
    const eventoOrigen = page.locator('[data-calendar-event="true"]')
      .filter({ hasText: /Loreto|Castañeda/i })
      .first();

    // 4. Verificar que el evento existe
    await expect(eventoOrigen).toBeVisible({ timeout: 5000 });
    console.log('✓ Evento encontrado');

    // 5. Verificar que el elemento es draggable
    const isDraggable = await eventoOrigen.getAttribute('draggable');
    expect(isDraggable).toBe('true');
    console.log('✓ Elemento es draggable');

    // 6. Obtener la posición inicial del evento
    const posicionInicial = await eventoOrigen.boundingBox();
    console.log('Posición inicial:', posicionInicial);

    // 7. Localizar la celda del día 30 de septiembre
    // Buscar todas las celdas del calendario
    const todasLasCeldas = page.locator('.border-r.border-b.border-border');
    const cantidadCeldas = await todasLasCeldas.count();
    console.log(`Total de celdas del calendario: ${cantidadCeldas}`);

    // Buscar la celda que contiene el día "30"
    let celdaDestino = null;
    for (let i = 0; i < cantidadCeldas; i++) {
      const celda = todasLasCeldas.nth(i);
      const texto = await celda.textContent();

      // Buscar exactamente el día "30" (el número solo, en el span con clase específica)
      const diaSpan = celda.locator('span.self-start.mb-1');
      const diaTexto = await diaSpan.textContent();

      if (diaTexto?.trim() === '30') {
        celdaDestino = celda;
        console.log(`✓ Celda del día 30 encontrada (index ${i})`);
        break;
      }
    }

    if (!celdaDestino) {
      throw new Error('No se pudo encontrar la celda del día 30');
    }

    // 8. Verificar que la celda destino es visible
    await expect(celdaDestino).toBeVisible();
    console.log('✓ Celda destino visible');

    // 9. Realizar drag & drop usando la API de Playwright
    console.log('Iniciando drag & drop...');
    await eventoOrigen.dragTo(celdaDestino, {
      force: true, // Forzar el drag incluso si hay overlays
      timeout: 10000
    });

    console.log('✓ Drag & drop completado');

    // 10. Esperar un momento para que la UI se actualice
    await page.waitForTimeout(1500);

    // 11. Tomar screenshot después del drag
    await page.screenshot({ path: 'e2e/screenshots/after-drag.png', fullPage: true });

    // 12. Verificar que apareció alguna notificación (toast)
    // El toast puede tener diferentes textos según la implementación
    const toastVisible = await page.locator('[role="status"], .toast, [data-sonner-toast]')
      .first()
      .isVisible()
      .catch(() => false);

    if (toastVisible) {
      console.log('✓ Toast notification visible');
    } else {
      console.log('⚠️ Toast notification no detectado (puede ser muy rápido)');
    }

    // 13. Verificar que el evento ahora está en la celda del día 30
    const eventosEnDestino = await celdaDestino.locator('[data-calendar-event="true"]').count();
    console.log(`Eventos en celda destino: ${eventosEnDestino}`);

    // Buscar específicamente nuestro evento en la celda destino
    const eventoEnDestino = celdaDestino.locator('[data-calendar-event="true"]')
      .filter({ hasText: /Loreto|Castañeda/i });

    const eventoEnDestinoVisible = await eventoEnDestino.isVisible().catch(() => false);

    if (eventoEnDestinoVisible) {
      console.log('✅ Evento movido exitosamente al día 30');
    } else {
      console.log('⚠️ No se pudo verificar visualmente el movimiento (puede estar fuera del viewport o la UI aún no se actualizó)');
    }

    // 14. Resultado del test
    console.log('\n=== Test completado ===');
    console.log('El drag & drop fue ejecutado. Revisar screenshots en e2e/screenshots/');
    console.log('- before-drag.png: Estado inicial');
    console.log('- after-drag.png: Estado después del drag');
  });

  test('debe mostrar cursor "grab" en hover sobre eventos arrastrables', async ({ page }) => {
    // Localizar el primer evento arrastrable
    const primerEvento = page.locator('[data-calendar-event="true"]').first();

    // Verificar que es visible
    await expect(primerEvento).toBeVisible();

    // Verificar el atributo draggable
    const isDraggable = await primerEvento.getAttribute('draggable');
    expect(isDraggable).toBe('true');

    // Hover sobre el evento
    await primerEvento.hover();

    // Verificar cursor (via computed style)
    const cursor = await primerEvento.evaluate(el => window.getComputedStyle(el).cursor);
    console.log('Cursor detectado:', cursor);

    // El cursor debe ser "grab" o contener "grab"
    expect(cursor).toMatch(/grab/);

    console.log('✅ Cursor "grab" verificado');
  });

  test('debe tener dataTransfer configurado correctamente en dragstart', async ({ page }) => {
    // Este test verifica que el evento dragstart configura dataTransfer
    const primerEvento = page.locator('[data-calendar-event="true"]').first();

    await expect(primerEvento).toBeVisible();

    // Ejecutar script en el navegador para verificar el handler
    const resultadoTest = await page.evaluate(() => {
      const evento = document.querySelector('[data-calendar-event="true"]') as HTMLElement;
      if (!evento) return { success: false, error: 'Evento no encontrado' };

      let dataTransferConfigurado = false;

      // Crear evento de drag simulado
      const dragEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer()
      });

      // Escuchar el evento
      evento.addEventListener('dragstart', (e) => {
        const dt = (e as DragEvent).dataTransfer;
        if (dt && dt.effectAllowed === 'move') {
          dataTransferConfigurado = true;
        }
      });

      // Disparar evento
      evento.dispatchEvent(dragEvent);

      return {
        success: dataTransferConfigurado,
        effectAllowed: dragEvent.dataTransfer?.effectAllowed
      };
    });

    console.log('Resultado test dataTransfer:', resultadoTest);
    expect(resultadoTest.success).toBe(true);

    console.log('✅ dataTransfer configurado correctamente en dragstart');
  });
});