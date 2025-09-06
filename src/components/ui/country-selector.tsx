"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Country } from "react-phone-number-input"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import flags from "react-phone-number-input/flags"
import { getCountryCallingCode } from "react-phone-number-input/input"

interface CountryOption {
  value: Country
  label: string
  phoneCode: string
}

interface CountrySelectorProps {
  value: Country | undefined
  onChange: (value: Country) => void
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function CountrySelector({
  value,
  onChange,
  className,
  disabled = false,
  placeholder = "Selecciona un país...",
}: CountrySelectorProps) {
  // Obtener la lista de países desde react-phone-number-input
  const countries: CountryOption[] = Object.entries(flags)
    .map(([code]) => {
      try {
        const phoneCode = getCountryCallingCode(code as Country);
        return {
          value: code as Country,
          label: new Intl.DisplayNames(['es'], { type: 'region' }).of(code.toUpperCase()) || code,
          phoneCode: phoneCode.toString(),
        };
      } catch (error) {
        // Ignorar países sin código de llamada válido (como AQ - Antártida)
        return null;
      }
    })
    .filter((country): country is CountryOption => country !== null)
    .sort((a, b) => a.label.localeCompare(b.label))

  const selectedCountry = value ? countries.find(c => c.value === value) : undefined

  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredCountries = React.useMemo(() => {
    if (!searchTerm) return countries;
    
    const term = searchTerm.toLowerCase();
    return countries.filter(country => 
      country.label.toLowerCase().includes(term) ||
      country.value.toLowerCase().includes(term) ||
      country.phoneCode.includes(term)
    );
  }, [countries, searchTerm]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <CountryFlag countryCode={selectedCountry.value} />
              <span className="truncate">
                {selectedCountry.label} (+{selectedCountry.phoneCode})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar país..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No se encontraron países.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {filteredCountries.map((country) => (
              <CommandItem
                key={country.value}
                value={`${country.label} ${country.value} ${country.phoneCode}`}
                onSelect={() => {
                  onChange(country.value);
                  setSearchTerm("");
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex items-center gap-2">
                  <CountryFlag countryCode={country.value} />
                  <span className="flex-1">{country.label}</span>
                  <span className="text-muted-foreground">
                    +{country.phoneCode}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface CountryFlagProps {
  countryCode: Country
  className?: string
}

function CountryFlag({ countryCode, className }: CountryFlagProps) {
  const FlagComponent = flags[countryCode as keyof typeof flags]
  
  return (
    <span className={cn("flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm bg-foreground/20", className)}>
      {FlagComponent && React.createElement(FlagComponent, { title: countryCode })}
    </span>
  )
}
