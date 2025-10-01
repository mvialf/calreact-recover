/**
 * @fileoverview Sistema de logging simple para Cobralon-FB
 * 
 * Logger simple que funciona tanto en servidor como cliente.
 * Reemplaza Winston temporalmente para evitar problemas de build.
 * 
 * @version 1.2.0
 * @since Enero 2025 - Hotfix logging isomórfico
 */

// Tipo para niveles de log
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Verificar si estamos en el servidor
const isServer = typeof window === 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

// Interface común para logger
interface ILogger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// Determinar si se debe loggear según el nivel
const shouldLog = (level: LogLevel): boolean => {
  if (isProduction) {
    return level === 'error' || level === 'warn';
  }
  return true;
};

// Crear logger simple usando console
const logger: ILogger = {
  info: (message: string, meta?: any) => {
    if (shouldLog('info')) {
      if (isServer) {
        // eslint-disable-next-line no-console
        console.log(`ℹ️  INFO: ${message}`, meta || '');
      } else {
        // eslint-disable-next-line no-console
        console.log(`ℹ️  ${message}`, meta || '');
      }
    }
  },
  warn: (message: string, meta?: any) => {
    if (shouldLog('warn')) {
      if (isServer) {
        console.warn(`⚠️  WARN: ${message}`, meta || '');
      } else {
        console.warn(`⚠️  ${message}`, meta || '');
      }
    }
  },
  error: (message: string, meta?: any) => {
    if (shouldLog('error')) {
      if (isServer) {
        console.error(`❌ ERROR: ${message}`, meta || '');
      } else {
        console.error(`❌ ${message}`, meta || '');
      }
    }
  },
  debug: (message: string, meta?: any) => {
    if (shouldLog('debug')) {
      if (isServer) {
        // eslint-disable-next-line no-console
        console.log(`🔍 DEBUG: ${message}`, meta || '');
      } else {
        // eslint-disable-next-line no-console
        console.log(`🔍 ${message}`, meta || '');
      }
    }
  },
};

/**
 * Clase de utilidades de logging para diferentes dominios
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Log de información general
   */
  info(message: string, meta?: any): void {
    logger.info(`[${this.context}] ${message}`, meta);
  }

  /**
   * Log de advertencias
   */
  warn(message: string, meta?: any): void {
    logger.warn(`[${this.context}] ${message}`, meta);
  }

  /**
   * Log de errores
   */
  error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      logger.error(`[${this.context}] ${message}`, {
        error: error.message,
        stack: error.stack,
      });
    } else {
      logger.error(`[${this.context}] ${message}`, { error });
    }
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message: string, meta?: any): void {
    logger.debug(`[${this.context}] ${message}`, meta);
  }

  /**
   * Log específico para operaciones de base de datos
   */
  database(operation: string, details?: any): void {
    logger.debug(`[${this.context}] DB: ${operation}`, details);
  }

  /**
   * Log específico para operaciones de autenticación
   */
  auth(action: string, userId?: string): void {
    logger.info(`[${this.context}] AUTH: ${action}`, { userId });
  }

  /**
   * Log específico para operaciones de pago
   */
  payment(action: string, paymentId?: string, amount?: number): void {
    logger.info(`[${this.context}] PAYMENT: ${action}`, { 
      paymentId, 
      amount 
    });
  }
}

// Loggers predefinidos para diferentes módulos
export const projectLogger = new Logger('PROJECT');
export const paymentLogger = new Logger('PAYMENT');
export const clientLogger = new Logger('CLIENT');
export const eventLogger = new Logger('EVENT');
export const authLogger = new Logger('AUTH');
export const utilityLogger = new Logger('UTILITY');
export const formLogger = new Logger('FORM');
export const uiLogger = new Logger('UI');
export const visitLogger = new Logger('VISIT');
export const settingsLogger = new Logger('SETTINGS');
export const afterSalesLogger = new Logger('AFTERSALES');
export const errorBoundaryLogger = new Logger('ERROR_BOUNDARY');

export default logger;