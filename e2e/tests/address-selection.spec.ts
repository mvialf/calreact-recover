import { test, expect } from '@playwright/test';

// Configuración para este test
test.describe('Address Selection - Google Places API', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página que usa el componente AddressInput
    // Asumiendo que hay una página de ejemplo o form que use este componente
    await page.goto('/projects/new'); // Ajustar según la ruta real
    
    // Esperar a que se cargue Google Maps
    await page.waitForLoadState('networkidle');
  });

  test('should load address input component', async ({ page }) => {
    // Verificar que el componente AddressInput esté presente
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await expect(addressInput).toBeVisible();
    await expect(addressInput).toBeEnabled();
  });

  test('should show loading indicator while searching', async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="dirección"]');
    
    // Escribir en el input de dirección
    await addressInput.fill('Av. Providencia');
    
    // Verificar que aparece el indicador de carga
    const loadingIndicator = page.locator('[data-testid="search-loading-indicator"]');
    await expect(loadingIndicator).toBeVisible();
    
    // Esperar a que termine la búsqueda
    await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
  });

  test('should display address suggestions', async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="dirección"]');
    
    // Escribir una dirección conocida en Chile
    await addressInput.fill('Av. Providencia 123');
    
    // Esperar a que aparezcan las sugerencias
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    
    // Verificar que hay sugerencias
    const suggestions = page.locator('[role="option"]');
    const count = await suggestions.count();
    expect(count).toBeGreaterThan(0);
    
    // Verificar que las sugerencias contienen el texto buscado
    const firstSuggestion = suggestions.first();
    await expect(firstSuggestion).toContainText('Providencia');
  });

  test('should select an address from suggestions', async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="dirección"]');
    
    // Escribir en el input
    await addressInput.fill('Av. Providencia 123');
    
    // Esperar a que aparezcan las sugerencias
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    
    // Hacer clic en la primera sugerencia
    const firstSuggestion = page.locator('[role="option"]').first();
    await firstSuggestion.click();
    
    // Verificar que se seleccionó la dirección
    // El componente debería mostrar la dirección seleccionada en formato de tarjeta
    const selectedAddress = page.locator('[data-testid="selected-address"]');
    await expect(selectedAddress).toBeVisible();
    await expect(selectedAddress).toContainText('Providencia');
  });

  test('should show address actions menu', async ({ page }) => {
    // Primero seleccionar una dirección
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av. Providencia 123');
    
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.locator('[role="option"]').first().click();
    
    // Esperar a que se muestre la dirección seleccionada
    await page.waitForSelector('[data-testid="selected-address"]', { timeout: 5000 });
    
    // Hacer hover para mostrar el menú de acciones
    const selectedAddress = page.locator('[data-testid="selected-address"]');
    await selectedAddress.hover();
    
    // Hacer clic en el botón de más acciones
    const moreActionsButton = page.locator('button[aria-label="Más acciones"]');
    await expect(moreActionsButton).toBeVisible();
    await moreActionsButton.click();
    
    // Verificar que se muestran las opciones del menú
    await expect(page.locator('text=Agregar información adicional')).toBeVisible();
    await expect(page.locator('text=Ver en mapa')).toBeVisible();
    await expect(page.locator('text=Copiar dirección')).toBeVisible();
    await expect(page.locator('text=Compartir ubicación')).toBeVisible();
  });

  test('should add additional information to address', async ({ page }) => {
    // Seleccionar una dirección primero
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av. Providencia 123');
    
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.locator('[role="option"]').first().click();
    
    await page.waitForSelector('[data-testid="selected-address"]', { timeout: 5000 });
    
    // Abrir el menú de acciones
    await page.locator('[data-testid="selected-address"]').hover();
    await page.locator('button[aria-label="Más acciones"]').click();
    
    // Hacer clic en "Agregar información adicional"
    await page.locator('text=Agregar información adicional').click();
    
    // Escribir información adicional
    const additionalInfoInput = page.locator('input[placeholder*="Depto"]');
    await expect(additionalInfoInput).toBeVisible();
    await additionalInfoInput.fill('Depto 405');
    
    // Guardar la información
    await page.locator('button:has-text("OK")').click();
    
    // Verificar que la información adicional se muestra
    await expect(page.locator('text=Depto 405')).toBeVisible();
  });

  test('should clear selected address', async ({ page }) => {
    // Seleccionar una dirección
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av. Providencia 123');
    
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.locator('[role="option"]').first().click();
    
    await page.waitForSelector('[data-testid="selected-address"]', { timeout: 5000 });
    
    // Hacer hover y hacer clic en el botón de limpiar
    await page.locator('[data-testid="selected-address"]').hover();
    const clearButton = page.locator('button[aria-label="Limpiar dirección"]');
    await clearButton.click();
    
    // Verificar que se limpia la dirección
    await expect(page.locator('[data-testid="selected-address"]')).not.toBeVisible();
    await expect(addressInput).toBeVisible();
    await expect(addressInput).toHaveValue('');
  });

  test('should open Google Maps when clicking "Ver en mapa"', async ({ page }) => {
    // Seleccionar una dirección
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av. Providencia 123');
    
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.locator('[role="option"]').first().click();
    
    await page.waitForSelector('[data-testid="selected-address"]', { timeout: 5000 });
    
    // Abrir menú de acciones
    await page.locator('[data-testid="selected-address"]').hover();
    await page.locator('button[aria-label="Más acciones"]').click();
    
    // Preparar para capturar la nueva página/pestaña
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.locator('text=Ver en mapa').click()
    ]);
    
    // Verificar que se abre Google Maps
    await expect(newPage.url()).toContain('google.com/maps');
  });

  test('should handle Google Maps API errors gracefully', async ({ page }) => {
    // Simular error de red interceptando las requests a Google Maps API
    await page.route('**/*googleapis.com/**', route => {
      route.abort();
    });
    
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av. Providencia');
    
    // Esperar un momento para que se procese el error
    await page.waitForTimeout(2000);
    
    // Verificar que no se muestran sugerencias y no hay errores visibles al usuario
    const suggestions = page.locator('[role="option"]');
    await expect(suggestions).toHaveCount(0);
    
    // El input debería seguir funcionando (sin errores JavaScript)
    await expect(addressInput).toBeVisible();
    await expect(addressInput).toBeEnabled();
  });

  test('should validate minimum query length', async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="dirección"]');
    
    // Escribir menos del mínimo requerido
    await addressInput.fill('Av');
    
    // Esperar un momento
    await page.waitForTimeout(1000);
    
    // No deberían aparecer sugerencias
    const suggestions = page.locator('[role="option"]');
    await expect(suggestions).toHaveCount(0);
    
    // Escribir más del mínimo
    await addressInput.fill('Avenida');
    
    // Ahora sí deberían aparecer sugerencias (si hay conexión a API)
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    const count = await suggestions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should preserve address state during form navigation', async ({ page }) => {
    // Seleccionar una dirección
    const addressInput = page.locator('input[placeholder*="dirección"]');
    await addressInput.fill('Av. Providencia 123');
    
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.locator('[role="option"]').first().click();
    
    await page.waitForSelector('[data-testid="selected-address"]', { timeout: 5000 });
    
    // Si hay navegación entre pasos del formulario, verificar que se preserva
    // Esto depende de la implementación específica del formulario
    
    // Por ejemplo, si hay pestañas o pasos:
    const nextStepButton = page.locator('button:has-text("Siguiente")');
    if (await nextStepButton.isVisible()) {
      await nextStepButton.click();
      
      // Volver al paso anterior
      const prevStepButton = page.locator('button:has-text("Anterior")');
      if (await prevStepButton.isVisible()) {
        await prevStepButton.click();
        
        // Verificar que la dirección sigue seleccionada
        await expect(page.locator('[data-testid="selected-address"]')).toBeVisible();
        await expect(page.locator('text=Providencia')).toBeVisible();
      }
    }
  });

  test('should work with different address formats', async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="dirección"]');
    
    // Probar diferentes formatos de direcciones chilenas
    const addressFormats = [
      'Av. Providencia 1234, Providencia',
      'Calle Huérfanos 123',
      'Pasaje Los Aromos 45, Las Condes',
      'Los Leones 1234, Providencia'
    ];
    
    for (const address of addressFormats) {
      // Limpiar el input
      await addressInput.fill('');
      
      // Escribir la nueva dirección
      await addressInput.fill(address.substring(0, 10)); // Escribir parte de la dirección
      
      // Esperar sugerencias
      await page.waitForSelector('[role="option"]', { timeout: 10000 });
      
      // Verificar que hay sugerencias
      const suggestions = page.locator('[role="option"]');
      const count = await suggestions.count();
      expect(count).toBeGreaterThan(0);
      
      // Seleccionar la primera sugerencia
      await suggestions.first().click();
      
      // Verificar que se seleccionó
      await page.waitForSelector('[data-testid="selected-address"]', { timeout: 5000 });
      await expect(page.locator('[data-testid="selected-address"]')).toBeVisible();
      
      // Limpiar para la siguiente iteración
      await page.locator('button[aria-label="Limpiar dirección"]').click();
    }
  });
});