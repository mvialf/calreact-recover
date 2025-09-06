/**
 * Tests E2E para autenticación usando Playwright MCP
 * Validación completa de flujos de login, logout y gestión de sesiones
 */

import { 
  loginUser, 
  logoutUser, 
  verifyAuthenticated, 
  verifyNotAuthenticated,
  clearAuthState,
  TEST_USERS 
} from '../helpers/auth.helper';
import { WAIT_TIMES } from '../helpers/test-data.helper';
import { isFirebaseError } from '../types/forms';

/**
 * Test de login exitoso con credenciales válidas
 */
export const testLoginSuccess = async (page: any) => {
  console.log('🔑 Iniciando test de login exitoso');
  
  try {
    // Limpiar estado previo
    await clearAuthState(page);
    
    // Navegar a página de login
    await page.navigate('http://localhost:3002/auth/login');
    await page.waitFor({ text: 'Iniciar Sesión' });
    
    // Realizar login
    await loginUser(page, TEST_USERS.admin);
    
    // Verificar autenticación exitosa
    await verifyAuthenticated(page);
    
    // Verificar redirección al dashboard
    const currentUrl = await page.evaluate({
      function: '() => window.location.pathname'
    });
    
    if (!currentUrl.includes('/dashboard')) {
      throw new Error(`Redirección incorrecta. URL actual: ${currentUrl}`);
    }
    
    console.log('✅ Login exitoso - Usuario autenticado y redirigido correctamente');
    
    return { 
      success: true, 
      message: 'Login completado exitosamente',
      user: TEST_USERS.admin.name
    };
    
  } catch (error: unknown) {
    console.error('❌ Error en test de login:', error);
    
    await page.take_screenshot({
      filename: `error-login-${Date.now()}.png`,
      fullPage: true
    });
    
    return { 
      success: false, 
      error: isFirebaseError(error) ? error.message : 'Error desconocido en test de login' 
    };
  }
};

/**
 * Test de login fallido con credenciales incorrectas
 */
export const testLoginFailure = async (page: any) => {
  console.log('❌ Iniciando test de login con credenciales incorrectas');
  
  try {
    // Limpiar estado previo
    await clearAuthState(page);
    
    // Navegar a página de login
    await page.navigate('http://localhost:3002/auth/login');
    await page.waitFor({ text: 'Iniciar Sesión' });
    
    // Intentar login con credenciales incorrectas
    await page.fill_form({
      fields: [
        {
          name: 'email incorrecto',
          type: 'textbox',
          ref: 'input[type="email"]',
          value: 'usuario@inexistente.com'
        },
        {
          name: 'contraseña incorrecta',
          type: 'textbox', 
          ref: 'input[type="password"]',
          value: 'passwordincorrecto'
        }
      ]
    });
    
    // Hacer click en submit
    await page.click({
      element: 'botón iniciar sesión',
      ref: 'button[type="submit"]'
    });
    
    // Esperar mensaje de error
    await page.waitFor({ text: 'Credenciales incorrectas' });
    
    // Verificar que seguimos en página de login
    await verifyNotAuthenticated(page);
    
    const currentUrl = await page.evaluate({
      function: '() => window.location.pathname'
    });
    
    if (!currentUrl.includes('/auth/login')) {
      throw new Error(`No se mantuvo en login. URL actual: ${currentUrl}`);
    }
    
    console.log('✅ Login fallido manejado correctamente - Error mostrado sin redirección');
    
    return { 
      success: true, 
      message: 'Login fallido manejado correctamente' 
    };
    
  } catch (error: unknown) {
    console.error('❌ Error en test de login fallido:', error);
    return { success: false, error: isFirebaseError(error) ? error.message : 'Error desconocido en test de login fallido' };
  }
};

/**
 * Test de logout exitoso
 */
export const testLogoutSuccess = async (page: any) => {
  console.log('🚪 Iniciando test de logout exitoso');
  
  try {
    // Primero hacer login
    await clearAuthState(page);
    await loginUser(page, TEST_USERS.admin);
    await verifyAuthenticated(page);
    
    // Realizar logout
    await logoutUser(page);
    
    // Verificar que ya no estamos autenticados
    await verifyNotAuthenticated(page);
    
    // Verificar redirección a login
    await page.waitFor({ text: 'Iniciar Sesión' });
    
    const currentUrl = await page.evaluate({
      function: '() => window.location.pathname'
    });
    
    if (!currentUrl.includes('/auth/login')) {
      throw new Error(`Redirección de logout incorrecta. URL actual: ${currentUrl}`);
    }
    
    console.log('✅ Logout exitoso - Sesión cerrada y redirigido a login');
    
    return { 
      success: true, 
      message: 'Logout completado exitosamente' 
    };
    
  } catch (error: unknown) {
    console.error('❌ Error en test de logout:', error);
    return { success: false, error: isFirebaseError(error) ? error.message : 'Error desconocido en test de logout' };
  }
};

/**
 * Test de persistencia de sesión después de recarga de página
 */
export const testSessionPersistence = async (page: any) => {
  console.log('💾 Iniciando test de persistencia de sesión');
  
  try {
    // Hacer login
    await clearAuthState(page);
    await loginUser(page, TEST_USERS.admin);
    await verifyAuthenticated(page);
    
    // Recargar la página
    await page.evaluate({
      function: '() => window.location.reload()'
    });
    
    // Esperar que cargue
    await page.waitFor({ time: WAIT_TIMES.page_load });
    
    // Verificar que seguimos autenticados
    await verifyAuthenticated(page);
    
    // Verificar que estamos en dashboard (no redirigidos a login)
    await page.waitFor({ text: 'Dashboard' });
    
    console.log('✅ Persistencia de sesión verificada - Usuario sigue autenticado después de recarga');
    
    return { 
      success: true, 
      message: 'Sesión persistida correctamente' 
    };
    
  } catch (error: unknown) {
    console.error('❌ Error en test de persistencia:', error);
    return { success: false, error: isFirebaseError(error) ? error.message : 'Error desconocido en test de persistencia' };
  }
};

/**
 * Test de acceso a ruta protegida sin autenticación
 */
export const testProtectedRouteAccess = async (page: any) => {
  console.log('🛡️ Iniciando test de acceso a ruta protegida');
  
  try {
    // Asegurar que no estamos autenticados
    await clearAuthState(page);
    
    // Intentar acceder directamente al dashboard
    await page.navigate('http://localhost:3002/dashboard');
    
    // Esperar redirección automática a login
    await page.waitFor({ text: 'Iniciar Sesión' });
    
    // Verificar que estamos en página de login
    const currentUrl = await page.evaluate({
      function: '() => window.location.pathname'
    });
    
    if (!currentUrl.includes('/auth/login')) {
      throw new Error(`Redirección de protección no funcionó. URL actual: ${currentUrl}`);
    }
    
    console.log('✅ Protección de rutas funcionando - Redirección automática a login');
    
    return { 
      success: true, 
      message: 'Protección de rutas verificada' 
    };
    
  } catch (error: unknown) {
    console.error('❌ Error en test de ruta protegida:', error);
    return { success: false, error: isFirebaseError(error) ? error.message : 'Error desconocido en test de ruta protegida' };
  }
};

/**
 * Test de tiempo de expiración de sesión (simulado)
 */
export const testSessionExpiration = async (page: any) => {
  console.log('⏰ Iniciando test de expiración de sesión');
  
  try {
    // Hacer login
    await clearAuthState(page);
    await loginUser(page, TEST_USERS.admin);
    await verifyAuthenticated(page);
    
    // Simular expiración limpiando el token manualmente
    await page.evaluate({
      function: `() => {
        // Simular token expirado eliminando localStorage
        localStorage.removeItem('firebase-auth-token');
        localStorage.removeItem('firebase:authUser:default');
        sessionStorage.clear();
      }`
    });
    
    // Intentar navegar a una página protegida
    await page.navigate('http://localhost:3002/projects');
    
    // Debería redirigir a login automáticamente
    await page.waitFor({ text: 'Iniciar Sesión' });
    
    const currentUrl = await page.evaluate({
      function: '() => window.location.pathname'
    });
    
    if (!currentUrl.includes('/auth/login')) {
      throw new Error(`Manejo de expiración falló. URL actual: ${currentUrl}`);
    }
    
    console.log('✅ Expiración de sesión manejada correctamente');
    
    return { 
      success: true, 
      message: 'Expiración de sesión verificada' 
    };
    
  } catch (error: unknown) {
    console.error('❌ Error en test de expiración:', error);
    return { success: false, error: isFirebaseError(error) ? error.message : 'Error desconocido en test de expiración' };
  }
};

/**
 * Test de múltiples intentos de login fallidos
 */
export const testMultipleLoginAttempts = async (page: any) => {
  console.log('🚫 Iniciando test de múltiples intentos fallidos');
  
  try {
    await clearAuthState(page);
    await page.navigate('http://localhost:3002/auth/login');
    
    // Realizar 3 intentos fallidos
    for (let i = 1; i <= 3; i++) {
      console.log(`Intento ${i} de login fallido`);
      
      await page.fill_form({
        fields: [
          {
            name: 'email incorrecto',
            type: 'textbox', 
            ref: 'input[type="email"]',
            value: `intento${i}@fail.com`
          },
          {
            name: 'contraseña incorrecta',
            type: 'textbox',
            ref: 'input[type="password"]', 
            value: `fail${i}`
          }
        ]
      });
      
      await page.click({
        element: 'botón iniciar sesión',
        ref: 'button[type="submit"]'
      });
      
      await page.waitFor({ text: 'Credenciales incorrectas' });
      
      // Esperar un poco entre intentos
      await page.waitFor({ time: 1000 });
    }
    
    // Verificar que sigue permitiendo intentos (no hay bloqueo)
    // En una implementación real podría haber rate limiting
    await page.waitFor({ text: 'Iniciar Sesión' });
    
    console.log('✅ Múltiples intentos fallidos manejados correctamente');
    
    return { 
      success: true, 
      message: 'Múltiples intentos verificados' 
    };
    
  } catch (error: unknown) {
    console.error('❌ Error en test de múltiples intentos:', error);
    return { success: false, error: isFirebaseError(error) ? error.message : 'Error desconocido en test de múltiples intentos' };
  }
};

// Exportar todos los tests de autenticación
export const AUTH_E2E_TESTS = {
  testLoginSuccess,
  testLoginFailure, 
  testLogoutSuccess,
  testSessionPersistence,
  testProtectedRouteAccess,
  testSessionExpiration,
  testMultipleLoginAttempts
} as const;