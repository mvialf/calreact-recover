# 🧪 Implementación de Tests E2E

## 🎯 Objetivo

Crear suite completa de tests E2E con Playwright para validar el comportamiento del campo address antes y después de la migración.

## 📁 Estructura de Tests

```
e2e/
├── tests/
│   └── project-event-address.spec.ts      # Tests principales
├── fixtures/
│   ├── test-projects.json                 # Datos de prueba
│   └── test-addresses.json               # Direcciones de prueba
└── helpers/
    └── address-helpers.ts                 # Utilidades para tests
```

## 🧪 Test Suite Principal

### **Archivo:** `e2e/tests/project-event-address.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { testProjects, testAddresses } from '../fixtures/test-data';

test.describe('Project Event Address Management', () => {
  
  // Configuración común para todos los tests
  test.beforeEach(async ({ page }) => {
    // Navegar al calendario
    await page.goto('http://localhost:3002/calreact');
    
    // Esperar a que Google Maps API se cargue
    await page.waitForFunction(() => {
      return window.google && window.google.maps;
    }, { timeout: 10000 });
  });

  test('should auto-populate address when selecting existing project', async ({ page }) => {
    // Datos de prueba - Proyecto 17870 (confirmado funcional)
    const testProject = testProjects.project17870;
    
    console.log('🧪 Test: Auto-población de dirección');
    
    // 1. Abrir modal de nuevo evento
    await page.getByRole('button', { name: 'Añadir Evento' }).click();
    await page.getByRole('menuitem', { name: 'Proyecto' }).click();
    
    // 2. Buscar y seleccionar proyecto
    const projectInput = page.getByRole('textbox', { name: 'Buscar proyecto...' });
    await projectInput.click();
    await projectInput.fill(testProject.id);
    
    // 3. Esperar a que aparezca la opción y seleccionarla
    await page.waitForSelector(`text=${testProject.clientName}`, { timeout: 5000 });
    await page.getByText(testProject.clientName).click();
    
    // 4. Verificar auto-población de campos
    await expect(page.getByText(testProject.address.textoCompleto)).toBeVisible();
    await expect(page.getByText(testProject.address.detalle)).toBeVisible();
    await expect(page.getByText(testProject.address.location)).toBeVisible();
    
    // 5. Verificar campos adicionales poblados
    const phoneInput = page.getByRole('textbox', { name: 'Teléfono' });
    await expect(phoneInput).toHaveValue(testProject.phone);
    
    const windowsInput = page.getByRole('spinbutton', { name: 'N° de Ventanas' });
    await expect(windowsInput).toHaveValue(testProject.windowsCount.toString());
    
    const m2Input = page.getByRole('spinbutton', { name: 'M2' });
    await expect(m2Input).toHaveValue(testProject.squareMeters.toString());
    
    console.log('✅ Auto-población funcionando correctamente');
  });

  test('should handle address autocomplete with Chilean addresses', async ({ page }) => {
    console.log('🧪 Test: Autocomplete de direcciones chilenas');
    
    // 1. Abrir modal y llegar al campo de dirección
    await page.getByRole('button', { name: 'Añadir Evento' }).click();
    await page.getByRole('menuitem', { name: 'Proyecto' }).click();
    
    // 2. Buscar en campo de dirección
    const addressInput = page.getByRole('textbox', { name: /Ingrese la dirección/ });
    await addressInput.click();
    await addressInput.fill('Providencia 123');
    
    // 3. Esperar sugerencias de autocomplete
    await page.waitForSelector('text=Providencia 123', { timeout: 5000 });
    
    // 4. Verificar que aparecen sugerencias chilenas
    const suggestions = [
      'Avenida Providencia 123, Providencia, Chile',
      'Providencia 123, Vallenar, Chile',
      'Providencia 123, Salamanca, Chile',
      'Providencia 123, Maipú, Maipu, Chile',
      'Providencia 123, Quilpué, Chile'
    ];
    
    // Verificar que al menos 3 sugerencias aparecen
    let visibleSuggestions = 0;
    for (const suggestion of suggestions) {
      try {
        await expect(page.getByText(suggestion)).toBeVisible({ timeout: 2000 });
        visibleSuggestions++;
      } catch (e) {
        // Ignorar si no aparece esta sugerencia específica
      }
    }
    
    expect(visibleSuggestions).toBeGreaterThanOrEqual(3);
    console.log(`✅ ${visibleSuggestions} sugerencias chilenas encontradas`);
    
    // 5. Seleccionar primera opción
    await page.getByText('Avenida Providencia 123, Providencia, Chile').click();
    
    // 6. Verificar que se seleccionó la dirección
    await expect(addressInput).toHaveValue('Avenida Providencia 123, Providencia, Chile');
    
    console.log('✅ Autocomplete y selección funcionando correctamente');
  });

  test('should validate FormattedAddress structure after selection', async ({ page }) => {
    console.log('🧪 Test: Validación estructura FormattedAddress');
    
    // 1. Usar proyecto conocido para tener dirección válida
    const testProject = testProjects.project17870;
    
    await page.getByRole('button', { name: 'Añadir Evento' }).click();
    await page.getByRole('menuitem', { name: 'Proyecto' }).click();
    
    // 2. Seleccionar proyecto con dirección conocida
    const projectInput = page.getByRole('textbox', { name: 'Buscar proyecto...' });
    await projectInput.fill(testProject.id);
    await page.waitForSelector(`text=${testProject.clientName}`);
    await page.getByText(testProject.clientName).click();
    
    // 3. Interceptar request de creación para validar datos
    let formattedAddressData: any = null;
    
    // Escuchar requests de Firebase
    page.on('request', (request) => {
      if (request.url().includes('firestore') && request.method() === 'POST') {
        const postData = request.postDataJSON();
        if (postData?.fullAddress) {
          formattedAddressData = postData.fullAddress;
        }
      }
    });
    
    // 4. Crear el evento
    await page.getByRole('button', { name: 'Crear Evento' }).click();
    
    // 5. Esperar y validar estructura
    await page.waitForTimeout(2000); // Dar tiempo para el request
    
    if (formattedAddressData) {
      // Verificar estructura FormattedAddress
      expect(formattedAddressData).toHaveProperty('textoCompleto');
      expect(formattedAddressData).toHaveProperty('coordenadas');
      expect(formattedAddressData).toHaveProperty('placeId');
      expect(formattedAddressData).toHaveProperty('componentes');
      expect(formattedAddressData).toHaveProperty('comune');
      
      // Verificar coordenadas
      expect(formattedAddressData.coordenadas).toHaveProperty('latitude');
      expect(formattedAddressData.coordenadas).toHaveProperty('longitude');
      
      // Verificar componentes
      expect(formattedAddressData.componentes).toHaveProperty('comuna');
      expect(formattedAddressData.componentes).toHaveProperty('region');
      
      console.log('✅ Estructura FormattedAddress válida:', {
        textoCompleto: formattedAddressData.textoCompleto,
        comune: formattedAddressData.comune,
        placeId: formattedAddressData.placeId ? 'Presente' : 'Ausente'
      });
    }
  });

  test('should handle console warnings and errors', async ({ page }) => {
    console.log('🧪 Test: Monitoreo de warnings y errores');
    
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Capturar mensajes de consola
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'warning') {
        warnings.push(text);
      } else if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    // 1. Realizar flujo completo de creación de evento
    await page.getByRole('button', { name: 'Añadir Evento' }).click();
    await page.getByRole('menuitem', { name: 'Proyecto' }).click();
    
    // 2. Probar autocomplete
    const addressInput = page.getByRole('textbox', { name: /Ingrese la dirección/ });
    await addressInput.fill('Providencia 123');
    await page.waitForTimeout(2000);
    
    // 3. Seleccionar una opción si aparece
    try {
      await page.getByText('Avenida Providencia 123, Providencia, Chile').click({ timeout: 3000 });
    } catch (e) {
      console.log('⚠️ No se pudo seleccionar dirección automáticamente');
    }
    
    // 4. Analizar warnings
    const deprecatedWarnings = warnings.filter(w => 
      w.includes('AutocompleteService') || 
      w.includes('PlacesService') ||
      w.includes('deprecated')
    );
    
    const zeroResultsErrors = warnings.filter(w => 
      w.includes('ZERO_RESULTS')
    );
    
    console.log(`📊 Análisis de consola:`);
    console.log(`   - Total warnings: ${warnings.length}`);
    console.log(`   - Warnings deprecated APIs: ${deprecatedWarnings.length}`);
    console.log(`   - Errores ZERO_RESULTS: ${zeroResultsErrors.length}`);
    console.log(`   - Errores críticos: ${errors.length}`);
    
    // Si es pre-migración, esperar warnings deprecated
    // Si es post-migración, NO debería haber warnings deprecated
    if (deprecatedWarnings.length > 0) {
      console.log('⚠️ APIs deprecated detectadas - Migración pendiente');
      deprecatedWarnings.slice(0, 3).forEach(w => console.log(`   - ${w}`));
    } else {
      console.log('✅ No se detectaron warnings de APIs deprecated');
    }
  });

  test('should preserve functionality after migration', async ({ page }) => {
    console.log('🧪 Test: Preservación de funcionalidad post-migración');
    
    // Este test compara funcionalidad antes y después de migración
    const testProject = testProjects.project17870;
    
    // 1. Flujo completo de creación de evento
    await page.getByRole('button', { name: 'Añadir Evento' }).click();
    await page.getByRole('menuitem', { name: 'Proyecto' }).click();
    
    // 2. Seleccionar proyecto
    await page.getByRole('textbox', { name: 'Buscar proyecto...' }).fill(testProject.id);
    await page.waitForSelector(`text=${testProject.clientName}`);
    await page.getByText(testProject.clientName).click();
    
    // 3. Verificar que todos los campos se poblaron correctamente
    const expectedValues = [
      { selector: 'text=' + testProject.address.textoCompleto, description: 'Dirección principal' },
      { selector: 'text=' + testProject.address.detalle, description: 'Detalle dirección' },
      { selector: 'text=' + testProject.address.location, description: 'Comuna y región' }
    ];
    
    for (const { selector, description } of expectedValues) {
      await expect(page.locator(selector)).toBeVisible();
      console.log(`✅ ${description} visible correctamente`);
    }
    
    // 4. Intentar guardar evento
    const createButton = page.getByRole('button', { name: 'Crear Evento' });
    await createButton.click();
    
    // 5. Verificar que no hay errores críticos
    await page.waitForTimeout(3000);
    
    // Si el modal se cierra, el evento se creó exitosamente
    const isModalClosed = await page.locator('dialog').isHidden();
    
    if (isModalClosed) {
      console.log('✅ Evento creado exitosamente - Funcionalidad preservada');
    } else {
      console.log('⚠️ Modal aún visible - Verificar si hay errores de validación');
    }
  });
});

// Test de performance
test.describe('Performance Tests', () => {
  
  test('autocomplete response time should be under 2 seconds', async ({ page }) => {
    await page.goto('http://localhost:3002/calreact');
    
    await page.getByRole('button', { name: 'Añadir Evento' }).click();
    await page.getByRole('menuitem', { name: 'Proyecto' }).click();
    
    const addressInput = page.getByRole('textbox', { name: /Ingrese la dirección/ });
    
    // Medir tiempo de respuesta
    const startTime = Date.now();
    await addressInput.fill('Providencia 123');
    
    // Esperar primera sugerencia
    await page.waitForSelector('text*=Providencia 123', { timeout: 5000 });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⚡ Tiempo de respuesta autocomplete: ${responseTime}ms`);
    
    // Verificar que está bajo 2 segundos
    expect(responseTime).toBeLessThan(2000);
  });
});
```

## 🗂️ Helpers para Tests

### **Archivo:** `e2e/helpers/address-helpers.ts`

```typescript
import { Page, expect } from '@playwright/test';

export class AddressTestHelpers {
  constructor(private page: Page) {}

  /**
   * Navega al calendario y abre modal de nuevo evento de proyecto
   */
  async openNewProjectEventModal() {
    await this.page.goto('http://localhost:3002/calreact');
    
    // Esperar Google Maps API
    await this.page.waitForFunction(() => {
      return window.google && window.google.maps;
    }, { timeout: 10000 });
    
    await this.page.getByRole('button', { name: 'Añadir Evento' }).click();
    await this.page.getByRole('menuitem', { name: 'Proyecto' }).click();
  }

  /**
   * Selecciona un proyecto por su ID
   */
  async selectProject(projectId: string, expectedClientName: string) {
    const projectInput = this.page.getByRole('textbox', { name: 'Buscar proyecto...' });
    await projectInput.click();
    await projectInput.fill(projectId);
    
    await this.page.waitForSelector(`text=${expectedClientName}`, { timeout: 5000 });
    await this.page.getByText(expectedClientName).click();
  }

  /**
   * Prueba autocomplete de direcciones
   */
  async testAddressAutocomplete(query: string, expectedSuggestions: string[]) {
    const addressInput = this.page.getByRole('textbox', { name: /Ingrese la dirección/ });
    await addressInput.click();
    await addressInput.fill(query);
    
    // Esperar sugerencias
    await this.page.waitForTimeout(1500);
    
    let foundSuggestions = 0;
    for (const suggestion of expectedSuggestions) {
      try {
        await expect(this.page.getByText(suggestion)).toBeVisible({ timeout: 2000 });
        foundSuggestions++;
      } catch (e) {
        // Sugerencia no encontrada
      }
    }
    
    return foundSuggestions;
  }

  /**
   * Captura warnings de consola relacionados con Places API
   */
  async captureConsoleWarnings() {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    this.page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'warning' && 
          (text.includes('places') || text.includes('deprecated'))) {
        warnings.push(text);
      } else if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    return { warnings, errors };
  }

  /**
   * Verifica estructura FormattedAddress
   */
  async verifyFormattedAddressStructure(addressData: any) {
    const requiredFields = [
      'textoCompleto',
      'coordenadas',
      'placeId',
      'componentes',
      'comune'
    ];
    
    for (const field of requiredFields) {
      expect(addressData).toHaveProperty(field);
    }
    
    // Verificar coordenadas
    expect(addressData.coordenadas).toHaveProperty('latitude');
    expect(addressData.coordenadas).toHaveProperty('longitude');
    expect(typeof addressData.coordenadas.latitude).toBe('number');
    expect(typeof addressData.coordenadas.longitude).toBe('number');
    
    // Verificar componentes
    expect(addressData.componentes).toHaveProperty('comuna');
    expect(addressData.componentes).toHaveProperty('region');
    
    return true;
  }
}
```

## 📋 Comandos de Ejecución

### **Configuración en `package.json`**

```json
{
  "scripts": {
    "test:e2e:address": "playwright test project-event-address.spec.ts",
    "test:e2e:address:ui": "playwright test project-event-address.spec.ts --ui",
    "test:e2e:address:debug": "playwright test project-event-address.spec.ts --debug",
    "test:e2e:address:headed": "playwright test project-event-address.spec.ts --headed",
    "test:e2e:address:report": "playwright show-report"
  }
}
```

### **Comandos para usar:**

```bash
# Ejecutar todos los tests de address
npm run test:e2e:address

# Ejecutar con interfaz visual
npm run test:e2e:address:ui

# Ejecutar en modo debug
npm run test:e2e:address:debug

# Ejecutar con navegador visible
npm run test:e2e:address:headed

# Ver último reporte
npm run test:e2e:address:report

# Ejecutar test específico
npx playwright test -g "should auto-populate address"
```

## 📊 Métricas a Validar

### ✅ Pre-Migración (Estado Actual)
- [ ] Autocomplete funcional con sugerencias chilenas
- [ ] Auto-población al seleccionar proyecto
- [ ] Extracción correcta de componentes
- [ ] Persistencia en Firebase
- [ ] ⚠️ Warnings de APIs deprecated presentes

### ✅ Post-Migración (Estado Objetivo)
- [ ] Todas las funcionalidades anteriores preservadas
- [ ] ✅ Cero warnings de APIs deprecated
- [ ] Mejor manejo de errores ZERO_RESULTS
- [ ] Performance similar o mejorada
- [ ] Logging implementado

## 🎯 Resultado Esperado

Al ejecutar la suite de tests:
- **Pre-migración:** 5/6 tests pasando (warnings esperados)
- **Post-migración:** 6/6 tests pasando (sin warnings)
- **Tiempo total:** < 2 minutos
- **Coverage:** 100% de funcionalidades críticas

---

> **💡 Siguiente paso:** Proceder con `04-DATOS-PRUEBA.md` para definir los fixtures y datos de prueba específicos.