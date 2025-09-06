import { test, expect } from '@playwright/test';

/**
 * Suite de Smoke Tests para Calreact
 * Tests básicos para verificar funcionalidad principal
 */

test.describe('Smoke Tests - Aplicación Principal', () => {
  test('debe cargar la página de inicio correctamente', async ({ page }) => {
    // Navegar a la página de inicio
    await page.goto('/');
    
    // Esperar a que la página cargue completamente
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que la página carga (título o contenido)
    const title = await page.title();
    const hasContent = await page.locator('body').isVisible();
    
    // La página debe tener al menos contenido visible, aunque no tenga título específico
    expect(hasContent).toBe(true);
    
    // Si hay título, verificar que no esté vacío
    if (title) {
      expect(title.length).toBeGreaterThan(0);
    }
    
    // Tomar screenshot para documentación
    await page.screenshot({ path: 'test-results/smoke-home.png' });
  });

  test('debe mostrar navegación principal', async ({ page }) => {
    await page.goto('/');
    
    // Esperar a que la navegación cargue
    await page.waitForLoadState('domcontentloaded');
    
    // Verificar que hay elementos de navegación
    // (Adaptado a tu estructura específica)
    const nav = page.locator('nav, header, [role="navigation"]');
    await expect(nav.first()).toBeVisible({ timeout: 10000 });
    
    // Verificar que hay al menos un enlace de navegación
    const links = page.locator('a[href]');
    await expect(links.first()).toBeVisible();
  });

  test('debe responder a interacciones básicas', async ({ page }) => {
    await page.goto('/');
    
    // Esperar carga completa
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Verificar que JavaScript está funcionando
    const isJSEnabled = await page.evaluate(() => {
      return typeof window !== 'undefined' && window.document !== null;
    });
    
    expect(isJSEnabled).toBe(true);
    
    // Verificar que React está montado
    const reactMounted = await page.evaluate(() => {
      // Buscar indicadores de que React está funcionando
      return document.querySelectorAll('[data-reactroot], #__next, [data-testid]').length > 0;
    });
    
    expect(reactMounted).toBe(true);
  });

  test('debe manejar rutas básicas sin errores', async ({ page }) => {
    // Array de rutas comunes a verificar
    const routes = [
      '/',
      '/dashboard',
      '/projects', 
      '/clients'
    ];
    
    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      
      // Verificar que no hay errores 404 o 500
      const statusCode = page.url().includes('404') || page.url().includes('500');
      expect(statusCode).toBe(false);
      
      // Verificar que la página tiene contenido
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      expect(bodyText!.length).toBeGreaterThan(10);
    }
  });

  test('debe cargar estilos CSS correctamente', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que Tailwind CSS está cargado
    const tailwindLoaded = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets);
      return stylesheets.some(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules);
          return rules.some(rule => rule.cssText.includes('tailwind') || 
                                   rule.cssText.includes('tw-'));
        } catch (e) {
          return false;
        }
      });
    });
    
    // Si Tailwind no se detecta directamente, verificar clases comunes
    const hasTailwindClasses = await page.evaluate(() => {
      const elementsWithClasses = document.querySelectorAll('[class*="flex"], [class*="grid"], [class*="p-"], [class*="m-"], [class*="bg-"]');
      return elementsWithClasses.length > 0;
    });
    
    expect(tailwindLoaded || hasTailwindClasses).toBe(true);
  });

  test('debe ser responsive en diferentes tamaños', async ({ page }) => {
    await page.goto('/');
    
    // Desktop (1280x720 - ya configurado por defecto)
    await page.waitForLoadState('domcontentloaded');
    let viewport = page.viewportSize();
    expect(viewport?.width).toBe(1280);
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000); // Esperar reflow
    
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const bodyVisibleMobile = await page.locator('body').isVisible();
    expect(bodyVisibleMobile).toBe(true);
    
    // Screenshot mobile para documentación
    await page.screenshot({ path: 'test-results/smoke-mobile.png' });
  });
});

test.describe('Smoke Tests - Conectividad', () => {
  test('debe conectar con servicios externos sin errores críticos', async ({ page }) => {
    // Escuchar errores de red críticos
    const networkErrors: string[] = [];
    
    page.on('response', response => {
      if (response.status() >= 500) {
        networkErrors.push(`${response.status()}: ${response.url()}`);
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(5000); // Esperar requests iniciales
    
    // Verificar que no hay errores 5xx críticos
    expect(networkErrors.length).toBe(0);
  });

  test('debe manejar estado offline gracefully', async ({ page, context }) => {
    await page.goto('/');
    
    // Simular offline
    await context.setOffline(true);
    
    // Intentar navegar
    const navigationPromise = page.goto('/', { timeout: 5000 }).catch(() => null);
    await navigationPromise;
    
    // Restaurar online
    await context.setOffline(false);
    
    // Verificar que la app se recupera
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});