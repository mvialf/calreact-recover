'use client';

import { useAppConfig } from '@/contexts/AppConfigContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Moon, Monitor, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { CountrySelector } from '@/components/ui/country-selector';
import { Country } from 'react-phone-number-input';
import { Separator } from '@/components/ui/separator';

type CountryInfo = {
  name: string;
  countryCallingCodes?: string[];
  [key: string]: any;
};

type Countries = {
  [key: string]: CountryInfo;
};

const themes = [
  { id: 'light', name: 'Claro', icon: Sun },
  { id: 'dark', name: 'Oscuro', icon: Moon },
  { id: 'system', name: 'Sistema', icon: Monitor },
];

export function GeneralSettings() {
  const { config, setConfig, loading } = useAppConfig();
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación hasta que el componente se monte en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCountryChange = (value: Country) => {
    setConfig({
      ...config,
      defaultCountry: value,
    });
  };

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>
            Personaliza la apariencia de la aplicación. Cambia entre temas claro, oscuro o sigue la configuración de tu sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {themes.map(({ id, name, icon: Icon }) => (
              <Button
                key={id}
                variant="outline"
                className={cn(
                  'flex flex-col items-center justify-center h-24 w-24 p-2',
                  currentTheme === id ? 'border-primary' : 'border-muted-foreground/20'
                )}
                onClick={() => setTheme(id)}
              >
                <Icon className="mb-2 h-6 w-6" />
                <span className="text-sm">{name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>País predeterminado</CardTitle>
          <CardDescription>
          Selecciona el país que se usará por defecto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="w-full max-w-md">
              <CountrySelector
                value={config.defaultCountry}
                onChange={handleCountryChange}
                placeholder="Selecciona un país..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
