import React from 'react';
import {
  FolderOpen,
  CalendarDays,
  Settings,
  Users,
  DollarSign,
  LayoutDashboard,
  Wrench,
  Home,
} from 'lucide-react';

export interface NavItem {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  altPaths?: string[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Panel Principal',
    altPaths: ['/']
  },
  {
    href: '/projects',
    icon: FolderOpen,
    label: 'Proyectos'
  },
  {
    href: '/calreact',
    icon: CalendarDays,
    label: 'Calendario'
  },
  {
    href: '/aftersales',
    icon: Wrench,
    label: 'Postventas'
  },
  {
    href: '/visits',
    icon: Home,
    label: 'Visitas'
  },
  {
    href: '/payments',
    icon: DollarSign,
    label: 'Pagos'
  },
  {
    href: '/clients',
    icon: Users,
    label: 'Clientes'
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Configuración'
  },
];