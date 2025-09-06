/**
 * Helper de autenticación para tests E2E con Playwright MCP
 * Proporciona utilidades para login/logout y gestión de sesiones
 */

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export const TEST_USERS = {
  admin: {
    email: 'admin@test.com',
    password: 'test123456',
    name: 'Admin Test'
  },
  user: {
    email: 'user@test.com', 
    password: 'test123456',
    name: 'Usuario Test'
  }
} as const;

/**
 * Realiza login con credenciales de prueba
 * @param page - Página de Playwright MCP
 * @param user - Usuario de prueba
 */
export const loginUser = async (page: any, user: TestUser) => {
  // Navegar a página de login
  await page.navigate('http://localhost:3002/auth/login');
  
  // Esperar que el formulario de login esté visible
  await page.waitFor({ text: 'Iniciar Sesión' });
  
  // Llenar formulario de login
  await page.type({
    element: 'campo de email',
    ref: 'input[type="email"]',
    text: user.email
  });
  
  await page.type({
    element: 'campo de contraseña',
    ref: 'input[type="password"]', 
    text: user.password
  });
  
  // Hacer click en botón de login
  await page.click({
    element: 'botón de iniciar sesión',
    ref: 'button[type="submit"]'
  });
  
  // Esperar redirección al dashboard
  await page.waitFor({ text: 'Dashboard' });
  
  // Verificar que estamos autenticados
  await page.waitFor({ text: user.name });
};

/**
 * Realiza logout del usuario actual
 * @param page - Página de Playwright MCP
 */
export const logoutUser = async (page: any) => {
  // Buscar y hacer click en menú de usuario
  await page.click({
    element: 'menú de usuario',
    ref: '[data-testid="user-menu"]'
  });
  
  // Hacer click en opción de logout
  await page.click({
    element: 'botón de cerrar sesión',
    ref: '[data-testid="logout-button"]'
  });
  
  // Esperar redirección a login
  await page.waitFor({ text: 'Iniciar Sesión' });
};

/**
 * Verifica si el usuario está autenticado
 * @param page - Página de Playwright MCP
 */
export const verifyAuthenticated = async (page: any) => {
  // Verificar presencia de elementos de usuario autenticado
  const userMenuVisible = await page.evaluate({
    function: '() => document.querySelector("[data-testid=\\"user-menu\\"]") !== null'
  });
  
  if (!userMenuVisible) {
    throw new Error('Usuario no está autenticado');
  }
};

/**
 * Verifica si el usuario NO está autenticado
 * @param page - Página de Playwright MCP  
 */
export const verifyNotAuthenticated = async (page: any) => {
  // Verificar presencia de formulario de login
  const loginFormVisible = await page.evaluate({
    function: '() => document.querySelector("input[type=\\"email\\"]") !== null'
  });
  
  if (!loginFormVisible) {
    throw new Error('Se esperaba que el usuario no estuviera autenticado');
  }
};

/**
 * Limpia el estado de autenticación (localStorage, sessionStorage)
 * @param page - Página de Playwright MCP
 */
export const clearAuthState = async (page: any) => {
  await page.evaluate({
    function: `() => {
      localStorage.clear();
      sessionStorage.clear();
      // Limpiar cookies de Firebase Auth si existen
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }`
  });
};