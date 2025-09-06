/**
 * Barrel export para todos los tipos del proyecto
 * 
 * Centraliza las exportaciones de tipos para facilitar importaciones
 * y mantener consistencia en el proyecto.
 */

// ===== TIPOS DE ENTIDADES PRINCIPALES =====
export * from './project';
export * from './client';
export * from './payment';
export * from './visit';
export * from './afterSales';

// ===== TIPOS DE EVENTOS =====
export * from './event';

// ===== TIPOS DE UTILIDADES =====
export * from './tags';

// ===== DECLARACIONES GLOBALES =====
// Importar tipos específicos para testing y declaraciones globales
import './testing.d';
import './snapdom.d';
