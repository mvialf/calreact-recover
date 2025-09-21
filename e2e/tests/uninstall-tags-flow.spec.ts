// e2e/tests/uninstall-tags-flow.spec.ts
// Tests E2E para validar flujo completo del sistema uninstallTags post-migración

import { test, expect } from '@playwright/test';

test.describe('UninstallTags Flow - Post Migration Validation', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');

    // Asumir que estamos autenticados (usar fixtures si es necesario)
    // await page.waitForSelector('[data-testid="dashboard"]');
  });

  test.describe('Crear proyecto con uninstall tags', () => {
    test('debe permitir crear proyecto con tags de desinstalación', async ({ page }) => {
      // 1. Abrir modal de nuevo proyecto
      await page.click('[data-testid="new-project-button"]');
      await expect(page.locator('[data-testid="project-form-modal"]')).toBeVisible();

      // 2. Verificar que NO existe el checkbox de "uninstall" (migración completada)
      await expect(page.locator('input[type="checkbox"][name*="uninstall"]')).not.toBeVisible();
      await expect(page.locator('text="Requiere desinstalación"')).not.toBeVisible();

      // 3. Verificar que el TagSelector está siempre visible
      await expect(page.locator('[data-testid="tag-selector"]')).toBeVisible();
      await expect(page.locator('text="Tags de Desinstalación"')).toBeVisible();

      // 4. Llenar campos básicos del proyecto
      await page.fill('[name="projectNumber"]', '2025-E2E-001');
      await page.fill('[name="glosa"]', 'Proyecto E2E con tags');
      await page.fill('[name="subtotal"]', '1000');

      // 5. Agregar tags de desinstalación
      // Buscar tags disponibles y agregar algunas
      await page.click('[data-testid="tag-dropdown"]');

      // Seleccionar o crear tags (adaptar según implementación real)
      await page.click('text="Cortina"');
      await page.click('text="Persiana"');

      // Verificar que las tags aparecen como seleccionadas
      await expect(page.locator('[data-testid="selected-tag"]')).toHaveCount(2);

      // 6. Guardar proyecto
      await page.click('[data-testid="save-project-button"]');

      // 7. Verificar éxito
      await expect(page.locator('text="Proyecto creado exitosamente"')).toBeVisible();

      // 8. Verificar que el proyecto aparece en la lista con tags
      await expect(page.locator(`text="2025-E2E-001"`)).toBeVisible();
    });

    test('debe validar que tags se persisten correctamente', async ({ page }) => {
      // Crear proyecto con tags
      await page.click('[data-testid="new-project-button"]');
      await page.fill('[name="projectNumber"]', '2025-E2E-002');
      await page.fill('[name="glosa"]', 'Proyecto persistencia tags');
      await page.fill('[name="subtotal"]', '1500');

      // Agregar tags específicas
      await page.click('[data-testid="tag-dropdown"]');
      await page.click('text="Toldo"');
      await page.click('text="Cortina"');

      await page.click('[data-testid="save-project-button"]');
      await expect(page.locator('text="Proyecto creado exitosamente"')).toBeVisible();

      // Recargar página para verificar persistencia
      await page.reload();

      // Buscar y abrir el proyecto creado
      await page.click(`text="2025-E2E-002"`);
      await page.click('[data-testid="edit-project-button"]');

      // Verificar que las tags están cargadas
      await expect(page.locator('text="Toldo"')).toBeVisible();
      await expect(page.locator('text="Cortina"')).toBeVisible();
    });
  });

  test.describe('Editar tags de proyecto existente', () => {
    test('debe permitir modificar tags en proyecto existente', async ({ page }) => {
      // Crear proyecto base
      await page.click('[data-testid="new-project-button"]');
      await page.fill('[name="projectNumber"]', '2025-E2E-003');
      await page.fill('[name="glosa"]', 'Proyecto edición tags');
      await page.fill('[name="subtotal"]', '2000');

      // Agregar tag inicial
      await page.click('[data-testid="tag-dropdown"]');
      await page.click('text="Persiana"');

      await page.click('[data-testid="save-project-button"]');
      await expect(page.locator('text="Proyecto creado exitosamente"')).toBeVisible();

      // Editar el proyecto
      await page.click(`text="2025-E2E-003"`);
      await page.click('[data-testid="edit-project-button"]');

      // Verificar tag existente
      await expect(page.locator('text="Persiana"')).toBeVisible();

      // Agregar nueva tag
      await page.click('[data-testid="tag-dropdown"]');
      await page.click('text="Cortina"');

      // Eliminar tag existente
      await page.click('[data-testid="remove-tag-persiana"]');

      // Guardar cambios
      await page.click('[data-testid="update-project-button"]');
      await expect(page.locator('text="Proyecto actualizado"')).toBeVisible();

      // Verificar cambios
      await page.click(`text="2025-E2E-003"`);
      await page.click('[data-testid="edit-project-button"]');

      await expect(page.locator('text="Cortina"')).toBeVisible();
      await expect(page.locator('text="Persiana"')).not.toBeVisible();
    });
  });

  test.describe('Crear evento con tags heredados', () => {
    test('debe heredar tags del proyecto al crear evento', async ({ page }) => {
      // 1. Crear proyecto con tags
      await page.click('[data-testid="new-project-button"]');
      await page.fill('[name="projectNumber"]', '2025-E2E-004');
      await page.fill('[name="glosa"]', 'Proyecto para evento');
      await page.fill('[name="subtotal"]', '1200');

      // Agregar tags al proyecto
      await page.click('[data-testid="tag-dropdown"]');
      await page.click('text="Cortina"');
      await page.click('text="Toldo"');

      await page.click('[data-testid="save-project-button"]');
      await expect(page.locator('text="Proyecto creado exitosamente"')).toBeVisible();

      // 2. Crear evento para este proyecto
      await page.click('[data-testid="new-event-button"]');

      // Seleccionar el proyecto creado
      await page.click('[data-testid="project-selector"]');
      await page.click(`text="2025-E2E-004"`);

      // 3. Verificar que las tags se heredan automáticamente
      await expect(page.locator('text="Cortina"')).toBeVisible();
      await expect(page.locator('text="Toldo"')).toBeVisible();

      // 4. Verificar que NO hay checkbox de uninstall en el formulario de evento
      await expect(page.locator('input[type="checkbox"][name*="uninstall"]')).not.toBeVisible();

      // 5. Modificar tags en el evento (agregar una nueva)
      await page.click('[data-testid="tag-dropdown"]');
      await page.click('text="Persiana"');

      // 6. Llenar otros campos del evento
      await page.selectOption('[name="status"]', 'ingresado');
      await page.fill('[name="description"]', 'Evento con tags heredados');

      // 7. Guardar evento
      await page.click('[data-testid="save-event-button"]');
      await expect(page.locator('text="Evento creado exitosamente"')).toBeVisible();

      // 8. Verificar que el evento aparece en el calendario con las tags correctas
      await page.click('[data-testid="calendar-view"]');
      await expect(page.locator(`text="2025-E2E-004"`)).toBeVisible();
    });

    test('debe permitir modificar tags independientemente del proyecto', async ({ page }) => {
      // Crear proyecto base con tags
      await page.click('[data-testid="new-project-button"]');
      await page.fill('[name="projectNumber"]', '2025-E2E-005');
      await page.fill('[name="glosa"]', 'Proyecto independiente');
      await page.fill('[name="subtotal"]', '1800');

      await page.click('[data-testid="tag-dropdown"]');
      await page.click('text="Cortina"');

      await page.click('[data-testid="save-project-button"]');

      // Crear evento con tags diferentes
      await page.click('[data-testid="new-event-button"]');
      await page.click('[data-testid="project-selector"]');
      await page.click(`text="2025-E2E-005"`);

      // Tags heredadas del proyecto
      await expect(page.locator('text="Cortina"')).toBeVisible();

      // Eliminar tag heredada
      await page.click('[data-testid="remove-tag-cortina"]');

      // Agregar tags diferentes
      await page.click('[data-testid="tag-dropdown"]');
      await page.click('text="Persiana"');
      await page.click('text="Toldo"');

      // Verificar estado final del evento
      await expect(page.locator('[data-testid="selected-tag"]')).toHaveCount(2);
      await expect(page.locator('text="Persiana"')).toBeVisible();
      await expect(page.locator('text="Toldo"')).toBeVisible();
      await expect(page.locator('text="Cortina"')).not.toBeVisible();

      // Guardar evento
      await page.selectOption('[name="status"]', 'ingresado');
      await page.click('[data-testid="save-event-button"]');
      await expect(page.locator('text="Evento creado exitosamente"')).toBeVisible();
    });
  });

  test.describe('Gestión de tags personalizada', () => {
    test('debe permitir crear nuevas tags desde el formulario', async ({ page }) => {
      await page.click('[data-testid="new-project-button"]');

      // Abrir gestión de tags
      await page.click('[data-testid="manage-tags-button"]');

      // Crear nueva tag
      await page.click('[data-testid="create-tag-button"]');
      await page.fill('[name="tagName"]', 'Tag Personalizada E2E');
      await page.selectOption('[name="tagColor"]', 'purple');
      await page.click('[data-testid="confirm-create-tag"]');

      // Verificar que la nueva tag aparece disponible
      await expect(page.locator('text="Tag Personalizada E2E"')).toBeVisible();

      // Usar la nueva tag en el proyecto
      await page.click('text="Tag Personalizada E2E"');
      await expect(page.locator('[data-testid="selected-tag"]')).toContainText('Tag Personalizada E2E');
    });

    test('debe validar persistencia entre formularios', async ({ page }) => {
      // Crear tag en formulario de proyecto
      await page.click('[data-testid="new-project-button"]');
      await page.click('[data-testid="manage-tags-button"]');
      await page.click('[data-testid="create-tag-button"]');
      await page.fill('[name="tagName"]', 'Tag Global');
      await page.selectOption('[name="tagColor"]', 'orange');
      await page.click('[data-testid="confirm-create-tag"]');

      // Cerrar modal de proyecto
      await page.click('[data-testid="close-modal"]');

      // Abrir formulario de evento
      await page.click('[data-testid="new-event-button"]');

      // Verificar que la tag creada está disponible
      await page.click('[data-testid="tag-dropdown"]');
      await expect(page.locator('text="Tag Global"')).toBeVisible();
    });
  });

  test.describe('Verificación de migración completa', () => {
    test('NO debe mostrar elementos del sistema anterior', async ({ page }) => {
      // Abrir cualquier formulario
      await page.click('[data-testid="new-project-button"]');

      // Verificar que NO existen elementos de la implementación anterior
      await expect(page.locator('text="Requiere desinstalación"')).not.toBeVisible();
      await expect(page.locator('input[type="checkbox"][name="uninstall"]')).not.toBeVisible();
      await expect(page.locator('text="Tipos de desinstalación"')).not.toBeVisible();
      await expect(page.locator('[name="uninstallTypes"]')).not.toBeVisible();

      // Solo debe existir el sistema unificado
      await expect(page.locator('[data-testid="tag-selector"]')).toBeVisible();
      await expect(page.locator('text="Tags de Desinstalación"')).toBeVisible();

      // Cerrar y probar en formulario de evento
      await page.click('[data-testid="close-modal"]');
      await page.click('[data-testid="new-event-button"]');

      // Misma verificación en evento
      await expect(page.locator('input[type="checkbox"][name="uninstall"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="tag-selector"]')).toBeVisible();
    });

    test('debe funcionar sin errores JavaScript', async ({ page }) => {
      // Capturar errores de consola
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Flujo completo sin errores
      await page.click('[data-testid="new-project-button"]');
      await page.fill('[name="projectNumber"]', '2025-E2E-ERROR-TEST');
      await page.fill('[name="glosa"]', 'Test sin errores');
      await page.fill('[name="subtotal"]', '500');

      await page.click('[data-testid="tag-dropdown"]');
      await page.click('text="Cortina"');

      await page.click('[data-testid="save-project-button"]');
      await expect(page.locator('text="Proyecto creado exitosamente"')).toBeVisible();

      // Verificar que no hubo errores JavaScript
      expect(consoleErrors.filter(error =>
        !error.includes('Warning') && // Ignorar warnings de React
        !error.includes('DevTools') && // Ignorar errores de DevTools
        !error.includes('lighthouse') // Ignorar errores de lighthouse
      )).toHaveLength(0);
    });
  });
});