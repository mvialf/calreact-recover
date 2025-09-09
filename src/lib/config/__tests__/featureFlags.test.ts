/**
 * Tests para Feature Flags - Google Places API Migration
 * 
 * Verifica el comportamiento de los feature flags que controlan
 * la migración gradual de Google Places API.
 * 
 * @version 1.0.0
 * @since Septiembre 2025
 */

// Mock de variables de entorno para testing
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules(); // Importante para que los require() refresquen los valores
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('PlacesFeatureFlags', () => {
  // Necesitamos importar dinámicamente para que tome las variables de entorno mockeadas
  const getFeatureFlags = () => {
    delete require.cache[require.resolve('../featureFlags')];
    return require('../featureFlags');
  };

  describe('Configuración por defecto', () => {
    it('debe usar valores por defecto cuando no hay variables de entorno', () => {
      // Limpiar variables relacionadas
      delete process.env.NEXT_PUBLIC_USE_NEW_PLACES_API;
      delete process.env.NEXT_PUBLIC_PLACES_API_FALLBACK;
      delete process.env.NEXT_PUBLIC_PLACES_API_MONITORING;
      delete process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API;

      const { PlacesFeatureFlags } = getFeatureFlags();
      const config = PlacesFeatureFlags.getConfig();

      expect(config.USE_NEW_API).toBe(false); // Por defecto false sin variable
      expect(config.ALLOW_FALLBACK).toBe(true); // Por defecto true (fallback permitido)
      expect(config.ENABLE_MONITORING).toBe(false); // Por defecto false sin variable
      expect(config.FORCE_LEGACY_API).toBe(false); // Por defecto false sin variable
    });
  });

  describe('shouldUseNewAPI()', () => {
    it('debe retornar true cuando USE_NEW_API=true y no hay modo emergencia', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
      process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'false';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldUseNewAPI()).toBe(true);
    });

    it('debe retornar false cuando USE_NEW_API=false', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'false';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldUseNewAPI()).toBe(false);
    });

    it('debe retornar false cuando está en modo de emergencia', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
      process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'true'; // Modo emergencia activo

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldUseNewAPI()).toBe(false);
      expect(PlacesFeatureFlags.isEmergencyMode()).toBe(true);
    });
  });

  describe('isFallbackAllowed()', () => {
    it('debe retornar true por defecto', () => {
      delete process.env.NEXT_PUBLIC_PLACES_API_FALLBACK;

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.isFallbackAllowed()).toBe(true);
    });

    it('debe retornar false cuando FALLBACK=false explícitamente', () => {
      process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'false';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.isFallbackAllowed()).toBe(false);
    });

    it('debe retornar true para cualquier valor que no sea "false"', () => {
      process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'true';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.isFallbackAllowed()).toBe(true);

      process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'anything';
      const { PlacesFeatureFlags: flags2 } = getFeatureFlags();
      expect(flags2.isFallbackAllowed()).toBe(true);
    });
  });

  describe('isMonitoringEnabled()', () => {
    it('debe retornar true cuando MONITORING=true', () => {
      process.env.NEXT_PUBLIC_PLACES_API_MONITORING = 'true';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.isMonitoringEnabled()).toBe(true);
    });

    it('debe retornar false cuando MONITORING=false o no está configurado', () => {
      process.env.NEXT_PUBLIC_PLACES_API_MONITORING = 'false';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.isMonitoringEnabled()).toBe(false);

      delete process.env.NEXT_PUBLIC_PLACES_API_MONITORING;
      const { PlacesFeatureFlags: flags2 } = getFeatureFlags();
      expect(flags2.isMonitoringEnabled()).toBe(false);
    });
  });

  describe('shouldShowDebugInfo()', () => {
    it('debe retornar true en desarrollo', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.env, 'NODE_ENV');
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true
      });

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldShowDebugInfo()).toBe(true);
      
      // Restaurar NODE_ENV
      if (originalDescriptor) {
        Object.defineProperty(process.env, 'NODE_ENV', originalDescriptor);
      }
    });

    it('debe retornar false en producción', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.env, 'NODE_ENV');
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true
      });

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldShowDebugInfo()).toBe(false);
      
      // Restaurar NODE_ENV
      if (originalDescriptor) {
        Object.defineProperty(process.env, 'NODE_ENV', originalDescriptor);
      }
    });

    it('debe retornar false en test', () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.env, 'NODE_ENV');
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'test',
        configurable: true
      });

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldShowDebugInfo()).toBe(false);
      
      // Restaurar NODE_ENV
      if (originalDescriptor) {
        Object.defineProperty(process.env, 'NODE_ENV', originalDescriptor);
      }
    });
  });

  describe('isEmergencyMode()', () => {
    it('debe retornar true cuando FORCE_LEGACY_API=true', () => {
      process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'true';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.isEmergencyMode()).toBe(true);
    });

    it('debe retornar false cuando FORCE_LEGACY_API=false o no está configurado', () => {
      process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'false';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.isEmergencyMode()).toBe(false);

      delete process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API;
      const { PlacesFeatureFlags: flags2 } = getFeatureFlags();
      expect(flags2.isEmergencyMode()).toBe(false);
    });
  });

  describe('getConfig()', () => {
    it('debe retornar configuración completa con valores computados', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
      process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'true';
      process.env.NEXT_PUBLIC_PLACES_API_MONITORING = 'true';
      process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'false';
      const originalDescriptor = Object.getOwnPropertyDescriptor(process.env, 'NODE_ENV');
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true
      });

      const { PlacesFeatureFlags } = getFeatureFlags();
      const config = PlacesFeatureFlags.getConfig();

      expect(config).toMatchObject({
        USE_NEW_API: true,
        ALLOW_FALLBACK: true,
        ENABLE_MONITORING: true,
        SHOW_DEBUG_INFO: true,
        FORCE_LEGACY_API: false,
        API_TIMEOUT_MS: 5000,
        MAX_RETRIES: 3,
        // Valores computados
        shouldUseNewAPI: true,
        isFallbackAllowed: true,
        isMonitoringEnabled: true,
        shouldShowDebugInfo: true,
        isEmergencyMode: false
      });
    });
  });

  describe('Configuraciones por entorno', () => {
    it('debe tener configuraciones específicas para desarrollo', () => {
      const { environmentDefaults } = getFeatureFlags();

      expect(environmentDefaults.development).toEqual({
        USE_NEW_API: true,
        ALLOW_FALLBACK: true,
        ENABLE_MONITORING: true,
        FORCE_LEGACY_API: false
      });
    });

    it('debe tener configuraciones específicas para producción', () => {
      const { environmentDefaults } = getFeatureFlags();

      expect(environmentDefaults.production).toEqual({
        USE_NEW_API: true,
        ALLOW_FALLBACK: true,
        ENABLE_MONITORING: false, // Menos logging en producción
        FORCE_LEGACY_API: false
      });
    });

    it('debe tener configuraciones específicas para testing', () => {
      const { environmentDefaults } = getFeatureFlags();

      expect(environmentDefaults.test).toEqual({
        USE_NEW_API: false, // Tests usan API mock
        ALLOW_FALLBACK: true,
        ENABLE_MONITORING: false,
        FORCE_LEGACY_API: false
      });
    });
  });

  describe('Escenarios de rollout', () => {
    it('debe permitir rollout gradual: nueva API con fallback', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
      process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'true';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldUseNewAPI()).toBe(true);
      expect(PlacesFeatureFlags.isFallbackAllowed()).toBe(true);
      expect(PlacesFeatureFlags.isEmergencyMode()).toBe(false);
    });

    it('debe permitir rollout completo: nueva API sin fallback', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
      process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'false';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldUseNewAPI()).toBe(true);
      expect(PlacesFeatureFlags.isFallbackAllowed()).toBe(false);
      expect(PlacesFeatureFlags.isEmergencyMode()).toBe(false);
    });

    it('debe permitir rollback de emergencia', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
      process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'true'; // Rollback de emergencia

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldUseNewAPI()).toBe(false); // Forzado a legacy
      expect(PlacesFeatureFlags.isEmergencyMode()).toBe(true);
    });

    it('debe permitir mantener API legacy: configuración conservadora', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'false';
      process.env.NEXT_PUBLIC_PLACES_API_FALLBACK = 'true';

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldUseNewAPI()).toBe(false);
      expect(PlacesFeatureFlags.isFallbackAllowed()).toBe(true);
      expect(PlacesFeatureFlags.isEmergencyMode()).toBe(false);
    });
  });

  describe('Valores de configuración específicos', () => {
    it('debe tener timeout y retries configurados para emergencias', () => {
      const { emergencyConfig } = getFeatureFlags();

      expect(emergencyConfig.API_TIMEOUT_MS).toBe(5000); // 5 segundos
      expect(emergencyConfig.MAX_RETRIES).toBe(3);
    });
  });

  describe('Consistency checks', () => {
    it('valores computados deben ser consistentes con los valores base', () => {
      // Caso 1: Nueva API habilitada
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
      process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'false';
      
      const { PlacesFeatureFlags } = getFeatureFlags();
      const config = PlacesFeatureFlags.getConfig();

      expect(config.shouldUseNewAPI).toBe(config.USE_NEW_API && !config.FORCE_LEGACY_API);
      expect(config.isEmergencyMode).toBe(config.FORCE_LEGACY_API);
    });

    it('modo de emergencia debe forzar legacy independientemente de otras configuraciones', () => {
      process.env.NEXT_PUBLIC_USE_NEW_PLACES_API = 'true';
      process.env.NEXT_PUBLIC_PLACES_API_MONITORING = 'true';
      process.env.NEXT_PUBLIC_FORCE_LEGACY_PLACES_API = 'true'; // Emergencia activa

      const { PlacesFeatureFlags } = getFeatureFlags();

      expect(PlacesFeatureFlags.shouldUseNewAPI()).toBe(false); // Debe ser false por emergencia
      expect(PlacesFeatureFlags.isEmergencyMode()).toBe(true);
    });
  });
});