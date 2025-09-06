/**
 * Constantes de rutas de navegación de la aplicación
 * 
 * Centraliza todas las rutas para evitar strings hardcodeados y facilitar
 * cambios futuros en la estructura de navegación.
 */

// ===== RUTAS PRINCIPALES =====

export const ROUTES = {
  // Página de inicio
  HOME: '/',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Gestión de proyectos
  PROJECTS: '/projects',
  PROJECT_NEW: '/projects/new',
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  PROJECT_EDIT: (id: string) => `/projects/${id}/edit`,
  
  // Calendario/Calreact
  CALENDAR: '/calreact',
  
  // Postventa
  AFTERSALES: '/aftersales',
  AFTERSALE_NEW: '/aftersales/new',
  AFTERSALE_DETAIL: (id: string) => `/aftersales/${id}`,
  AFTERSALE_EDIT: (id: string) => `/aftersales/${id}/edit`,
  
  // Visitas
  VISITS: '/visits',
  VISIT_NEW: '/visits/new',
  VISIT_DETAIL: (id: string) => `/visits/${id}`,
  VISIT_EDIT: (id: string) => `/visits/${id}/edit`,
  
  // Pagos
  PAYMENTS: '/payments',
  PAYMENT_NEW: '/payments/new',
  PAYMENT_INSTALLMENT: '/payments/installment',
  PAYMENT_DETAIL: (id: string) => `/payments/${id}`,
  PAYMENT_EDIT: (id: string) => `/payments/${id}/edit`,
  
  // Clientes
  CLIENTS: '/clients',
  CLIENT_NEW: '/clients/new',
  CLIENT_DETAIL: (id: string) => `/clients/${id}`,
  CLIENT_EDIT: (id: string) => `/clients/${id}/edit`,
  CLIENT_NEW_PAYMENT: (clientId: string) => `/clients/newPayment/${clientId}`,
  
  // Configuración
  SETTINGS: '/settings',
} as const;

// ===== TIPOS DE RUTAS =====

export type RouteKey = keyof typeof ROUTES;
export type StaticRoute = string;
export type DynamicRoute = (id: string) => string;

// ===== NAVEGACIÓN =====

/**
 * Items de navegación para el sidebar
 */
export const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    title: 'Proyectos', 
    href: ROUTES.PROJECTS,
    icon: 'Briefcase',
  },
  {
    title: 'Calendario',
    href: ROUTES.CALENDAR,
    icon: 'Calendar',
  },
  {
    title: 'Postventa',
    href: ROUTES.AFTERSALES,
    icon: 'Wrench',
  },
  {
    title: 'Visitas',
    href: ROUTES.VISITS,
    icon: 'MapPin',
  },
  {
    title: 'Pagos',
    href: ROUTES.PAYMENTS,
    icon: 'CreditCard',
  },
  {
    title: 'Clientes',
    href: ROUTES.CLIENTS,
    icon: 'Users',
  },
  {
    title: 'Configuración',
    href: ROUTES.SETTINGS,
    icon: 'Settings',
  },
] as const;

// ===== RUTAS API =====

/**
 * Rutas para API endpoints (para uso futuro)
 */
export const API_ROUTES = {
  // Proyectos
  PROJECTS: '/api/projects',
  PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
  
  // Clientes
  CLIENTS: '/api/clients',
  CLIENT_BY_ID: (id: string) => `/api/clients/${id}`,
  
  // Pagos
  PAYMENTS: '/api/payments',
  PAYMENT_BY_ID: (id: string) => `/api/payments/${id}`,
  
  // Visitas
  VISITS: '/api/visits',
  VISIT_BY_ID: (id: string) => `/api/visits/${id}`,
  
  // Postventa
  AFTERSALES: '/api/aftersales',
  AFTERSALE_BY_ID: (id: string) => `/api/aftersales/${id}`,
} as const;

// ===== UTILIDADES =====

/**
 * Obtiene la ruta padre de una ruta dada
 */
export const getParentRoute = (route: string): string => {
  const segments = route.split('/').filter(Boolean);
  segments.pop();
  return segments.length > 0 ? `/${segments.join('/')}` : ROUTES.HOME;
};

/**
 * Verifica si una ruta es una ruta de detalle (contiene un ID)
 */
export const isDetailRoute = (route: string): boolean => {
  const segments = route.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Verificar si el último segmento parece un ID (UUID o string alfanumérico)
  return /^[a-zA-Z0-9_-]+$/.test(lastSegment) && lastSegment.length > 10;
};

/**
 * Construye breadcrumbs basado en la ruta actual
 */
export const getBreadcrumbs = (route: string): Array<{ title: string; href: string }> => {
  const segments = route.split('/').filter(Boolean);
  const breadcrumbs: Array<{ title: string; href: string }> = [{ title: 'Inicio', href: ROUTES.HOME }];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Mapear segmentos comunes a títulos legibles
    const titleMap: Record<string, string> = {
      dashboard: 'Dashboard',
      projects: 'Proyectos',
      calreact: 'Calendario',
      aftersales: 'Postventa',
      visits: 'Visitas',
      payments: 'Pagos',
      clients: 'Clientes',
      settings: 'Configuración',
      new: 'Nuevo',
      edit: 'Editar',
    };
    
    const title = titleMap[segment] || segment;
    
    breadcrumbs.push({
      title,
      href: currentPath as string,
    });
  });
  
  return breadcrumbs;
};