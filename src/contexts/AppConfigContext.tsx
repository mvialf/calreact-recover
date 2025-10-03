import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Country } from 'react-phone-number-input';
import { Logger } from '@/lib/logger';
import { normalizeCountryCode } from '@/utils/country-utils';

type AppConfig = {
  defaultCountry: Country;
};

type AppConfigContextType = {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
  loading: boolean;
};

const defaultConfig: AppConfig = {
  defaultCountry: 'CL', // Chile por defecto
};

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

// Logger para configuración de la aplicación
const configLogger = new Logger('APP_CONFIG');

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  // Cargar configuración del localStorage al iniciar
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('appConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        // Normalizar código de país para asegurar formato ISO consistente
        const normalizedConfig = {
          ...parsed,
          defaultCountry: normalizeCountryCode(parsed.defaultCountry).toUpperCase() as Country
        };
        setConfig(normalizedConfig);
      }
    } catch (error) {
      configLogger.error('Error al cargar la configuración', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Guardar configuración en localStorage cuando cambia
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('appConfig', JSON.stringify(config));
    }
  }, [config, loading]);

  return (
    <AppConfigContext.Provider value={{ config, setConfig, loading }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig debe usarse dentro de un AppConfigProvider');
  }
  return context;
}
