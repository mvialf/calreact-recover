import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright optimizada para Calreact
 * Next.js 15 + Firebase + Turbopack
 */
export default defineConfig({
  // Directorio de tests E2E
  testDir: './e2e/tests',
  
  // Configuraciones de timeout y retry
  timeout: 60000, // 60 segundos para tests E2E
  expect: {
    timeout: 10000, // 10 segundos para assertions
  },
  
  // Reintentos en caso de fallo
  retries: process.env.CI ? 2 : 1,
  
  // Paralelización
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter para output
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['line']
  ],

  // Configuración global para todos los tests
  use: {
    // URL base de la aplicación
    baseURL: 'http://localhost:3002',
    
    // Screenshots automáticos en fallos
    screenshot: 'only-on-failure',
    
    // Trace para debugging (deshabilitado para evitar FFmpeg)
    trace: 'off',
    
    // Video recording (deshabilitado para evitar FFmpeg)
    video: 'off',
    
    // Configuración de navegador
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    
    // Configuración de navegación
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Estado de autenticación persistente
    storageState: process.env.STORAGE_STATE || undefined,
  },

  // Configuración de servidor local
  webServer: {
    command: 'npm run dev',
    port: 3002,
    timeout: 120000, // 2 minutos para iniciar
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Proyectos de testing (browsers)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Configuración específica para Chromium del sistema
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH === '0' ? 
            '/usr/bin/chromium-browser' : undefined,
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
    },
    
    // Descomenta para testing multi-browser
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Directorios de output
  outputDir: './test-results/',
  
  // Configuración de archivos
  testMatch: '**/*.{spec,test}.{ts,js}',
  testIgnore: '**/node_modules/**',
  
  // Configuración de entorno
  globalSetup: process.env.GLOBAL_SETUP ? './e2e/helpers/global-setup.ts' : undefined,
  globalTeardown: process.env.GLOBAL_TEARDOWN ? './e2e/helpers/global-teardown.ts' : undefined,
});