import { Page, Browser, BrowserContext } from '@playwright/test';
import { TEST_USERS } from './test-data.helper';

/**
 * Configuración de autenticación para tests E2E
 * Maneja login, logout y persistencia de sesión
 */

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    uid: string;
    email: string;
    displayName: string;
  };
}

/**
 * Realizar login con usuario de test
 */
export async function loginWithTestUser(
  page: Page,
  userType: 'admin' | 'user' = 'admin'
): Promise<AuthState> {
  const testUser = TEST_USERS[userType];
  
  try {
    // Navegar a página de login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    
    // Llenar formulario de login
    await page.fill('input[type="email"], input[name="email"]', testUser.email);
    await page.fill('input[type="password"], input[name="password"]', testUser.password);
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")');
    
    // Esperar redirección exitosa
    await page.waitForURL(/dashboard|home|projects/i, { timeout: 15000 });
    
    // Verificar estado autenticado
    const authState = await checkAuthState(page);
    
    if (!authState.isAuthenticated) {
      throw new Error('Login failed - user not authenticated');
    }
    
    return authState;
    
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

/**
 * Verificar estado de autenticación actual
 */
export async function checkAuthState(page: Page): Promise<AuthState> {
  try {
    // Evaluar estado de Firebase Auth en el navegador
    const authState = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Verificar Firebase Auth
        if (typeof window !== 'undefined' && (window as any).firebase) {
          const auth = (window as any).firebase.auth();
          const user = auth.currentUser;
          
          if (user) {
            resolve({
              isAuthenticated: true,
              user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
              }
            });
          } else {
            resolve({ isAuthenticated: false });
          }
        } else {
          // Fallback: verificar localStorage
          const authKey = Object.keys(localStorage).find(key => 
            key.includes('firebase:authUser')
          );
          
          if (authKey) {
            try {
              const userData = JSON.parse(localStorage.getItem(authKey) || '{}');
              resolve({
                isAuthenticated: true,
                user: {
                  uid: userData.uid,
                  email: userData.email,
                  displayName: userData.displayName
                }
              });
            } catch {
              resolve({ isAuthenticated: false });
            }
          } else {
            resolve({ isAuthenticated: false });
          }
        }
      });
    });
    
    return authState as AuthState;
    
  } catch (error) {
    console.error('Error checking auth state:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Realizar logout
 */
export async function logout(page: Page): Promise<void> {
  try {
    // Buscar botón de logout
    const logoutButton = page.locator('button:has-text("Cerrar"), button:has-text("Logout"), [data-testid="logout-button"]');
    
    if (await logoutButton.isVisible({ timeout: 5000 })) {
      await logoutButton.click();
    } else {
      // Fallback: limpiar localStorage manualmente
      await page.evaluate(() => {
        const authKeys = Object.keys(localStorage).filter(key => 
          key.includes('firebase:authUser')
        );
        authKeys.forEach(key => localStorage.removeItem(key));
      });
    }
    
    // Verificar redirección a login
    await page.waitForURL(/login|auth/i, { timeout: 10000 });
    
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

/**
 * Configurar contexto con estado autenticado
 */
export async function setupAuthenticatedContext(
  browser: Browser,
  userType: 'admin' | 'user' = 'admin'
): Promise<BrowserContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await loginWithTestUser(page, userType);
    
    // Guardar estado de autenticación
    await context.storageState({ path: `e2e/fixtures/auth-state-${userType}.json` });
    
    await page.close();
    return context;
    
  } catch (error) {
    await context.close();
    throw error;
  }
}

/**
 * Esperar a que la autenticación se inicialice
 */
export async function waitForAuthReady(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).firebase) {
        const auth = (window as any).firebase.auth();
        auth.onAuthStateChanged(() => {
          resolve(true);
        });
      } else {
        // Fallback: esperar que el DOM indique estado listo
        const authIndicator = document.querySelector('[data-auth-ready="true"], .auth-ready');
        resolve(!!authIndicator);
      }
    });
  }, { timeout: 15000 });
}