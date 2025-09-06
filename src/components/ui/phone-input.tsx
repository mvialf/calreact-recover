"use client"

import { forwardRef, useEffect, useRef } from "react";
import { Country } from "react-phone-number-input";
import { getCountryCallingCode } from "react-phone-number-input/input";
import { cn } from "@/lib/utils";
import { Input, InputProps } from "@/components/ui/input";
import { useAppConfig } from "@/contexts/AppConfigContext";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  country?: Country;
  excludeCountryCode?: boolean;
}

export function PhoneInput({
  value = "",
  onChange,
  className,
  placeholder = "Número de teléfono",
  disabled = false,
  country: propCountry,
  excludeCountryCode = false,
  ...props
}: PhoneInputProps) {
  const { config } = useAppConfig();
  const country = propCountry || config?.defaultCountry || 'CL';
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Obtener el código de país
  const countryCode = `+${getCountryCallingCode(country)}`;
  
  // Manejar cambios en el input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Eliminar cualquier carácter que no sea número
    const numbers = e.target.value.replace(/\D/g, '');
    
    // Si hay un cambio, actualizar el valor
    if (onChange) {
      onChange(numbers);
    }
  };
  
  // Asegurar que el valor solo contenga números
  const displayValue = value.replace(/\D/g, '');

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* Prefijo del código de país - solo si no está excluido */}
      {!excludeCountryCode && (
        <div className="absolute left-3 flex h-full items-center text-muted-foreground pointer-events-none">
          {countryCode}
        </div>
      )}
      
      {/* Input para el número de teléfono */}
      <Input
        ref={inputRef}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(excludeCountryCode ? "" : "pl-16")}
        {...props}
      />
      
      {/* Input oculto para el formulario con el valor completo */}
      <input type="hidden" name="phone" value={excludeCountryCode ? displayValue : `${countryCode}${displayValue}`} />
    </div>
  );
}