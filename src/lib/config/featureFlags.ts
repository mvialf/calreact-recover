/**
 * @fileoverview Feature Flags para Migración Google Places API
 * 
 * Controla el rollout gradual de la nueva API y permite rollback inmediato
 * 
 * @version 1.0.0
 * @since Septiembre 2025
 */

// ✅ Feature flags centralizados para Places API
export const placesAPIFeatureFlags = {
  /**
   * Usar nueva API de Places cuando esté disponible
   */
  USE_NEW_API: process.env.NEXT_PUBLIC_USE_NEW_PLACES_API === 'true',
  
  /**
   * Permitir fallback a API legacy si nueva API falla
   */
  ALLOW_FALLBACK: process.env.NEXT_PUBLIC_PLACES_API_FALLBACK !== 'false',
  
  /**
   * Habilitar monitoreo y logging detallado
   */
  ENABLE_MONITORING: process.env.NEXT_PUBLIC_PLACES_API_MONITORING === 'true',
  
  /**
   * Mostrar indicadores de debug en desarrollo
   */
  SHOW_DEBUG_INFO: process.env.NODE_ENV === 'development'
} as const;

// ✅ Configuración para rollback de emergencia
export const emergencyConfig = {
  /**
   * Forzar uso de API legacy (para rollback de emergencia)
   * Solo activar en caso de problemas críticos con nueva API
   */
  FORCE_LEGACY_API: process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API === 'true',
  
  /**
   * Tiempo máximo de espera para inicialización de API (ms)
   */
  API_TIMEOUT_MS: 5000,
  
  /**
   * Máximo número de reintentos para requests fallidos
   */
  MAX_RETRIES: 3
} as const;

// ✅ Helper para verificar estado de feature flags
export const PlacesFeatureFlags = {
  /**
   * ¿Debe usarse la nueva API?
   */
  shouldUseNewAPI(): boolean {
    return placesAPIFeatureFlags.USE_NEW_API && !emergencyConfig.FORCE_LEGACY_API;
  },
  
  /**
   * ¿Está permitido el fallback?
   */
  isFallbackAllowed(): boolean {
    return placesAPIFeatureFlags.ALLOW_FALLBACK;
  },
  
  /**
   * ¿Está habilitado el monitoreo?
   */
  isMonitoringEnabled(): boolean {
    return placesAPIFeatureFlags.ENABLE_MONITORING;
  },
  
  /**
   * ¿Mostrar información de debug?
   */
  shouldShowDebugInfo(): boolean {
    return placesAPIFeatureFlags.SHOW_DEBUG_INFO;
  },
  
  /**
   * ¿Está activo el modo de emergencia?
   */
  isEmergencyMode(): boolean {
    return emergencyConfig.FORCE_LEGACY_API;
  },
  
  /**
   * Obtener configuración completa de feature flags
   */
  getConfig() {
    return {
      ...placesAPIFeatureFlags,
      ...emergencyConfig,
      // Estado computado
      shouldUseNewAPI: this.shouldUseNewAPI(),
      isFallbackAllowed: this.isFallbackAllowed(),
      isMonitoringEnabled: this.isMonitoringEnabled(),
      shouldShowDebugInfo: this.shouldShowDebugInfo(),
      isEmergencyMode: this.isEmergencyMode()
    };
  }
};

// ✅ Valores por defecto para diferentes entornos
export const environmentDefaults = {
  development: {
    USE_NEW_API: true,
    ALLOW_FALLBACK: true,
    ENABLE_MONITORING: true,
    FORCE_LEGACY_API: false
  },
  production: {
    USE_NEW_API: true,
    ALLOW_FALLBACK: true,
    ENABLE_MONITORING: false, // Menos logging en producción
    FORCE_LEGACY_API: false
  },
  test: {
    USE_NEW_API: false, // Tests usan siempre API mock
    ALLOW_FALLBACK: true,
    ENABLE_MONITORING: false,
    FORCE_LEGACY_API: false
  }
} as const;