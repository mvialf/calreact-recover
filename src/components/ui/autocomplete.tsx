import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import flags from "react-phone-number-input/flags"
import { Country } from "react-phone-number-input"

type CountryFlagProps = {
  countryCode?: Country;
  label: string;
  className?: string;
};

export interface AutocompleteItem {
  value: string;
  label: string;
  flag?: string;
  countryCode?: Country;
  countryName?: string;
  phoneCode?: string;
  [key: string]: any;
}

interface AutocompleteProps {
  items: AutocompleteItem[]
  value: string
  onSelect: (value: string) => void
  onInputChange?: (value: string) => void
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  inputClassName?: string
  popoverClassName?: string
  renderItem?: (item: AutocompleteItem) => React.ReactNode
}

export function Autocomplete({
  items = [],
  value,
  onSelect,
  onInputChange,
  placeholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  searchPlaceholder = "Buscar...",
  disabled = false,
  isLoading = false,
  className = "",
  inputClassName = "",
  popoverClassName = "",
  renderItem,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<AutocompleteItem | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Actualizar el valor del input cuando cambia el valor seleccionado
  React.useEffect(() => {
    if (value) {
      const item = items.find(item => item.value === value)
      setSelectedItem(item || null)
      // Mostrar solo el nombre del país y el código en el input, no la bandera
      if (item) {
        const labelWithoutFlag = item.label.replace(/^[^\w]*/, '');
        setInputValue(labelWithoutFlag);
      } else {
        setInputValue("");
      }
    } else {
      setSelectedItem(null)
      setInputValue("")
    }
  }, [value, items])

  const filteredItems = React.useMemo(() => {
    if (!inputValue) return items
    return items.filter(item =>
      item.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  }, [inputValue, items])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    if (onInputChange) onInputChange(newValue)
    
    // No cerramos automáticamente el popover aquí
    // Solo lo abrimos si hay texto y no está ya abierto
    if (newValue.length > 0 && !open) {
      setOpen(true)
    }
    
    // Limpiamos la selección si el input está vacío
    if (newValue.length === 0) {
      onSelect("")
    }
  }

  const handleSelect = (selectedValue: string) => {
    const selected = items.find(item => item.value === selectedValue)
    if (selected) {
      setSelectedItem(selected)
      setInputValue(selected.label)
      onSelect(selectedValue)
      setOpen(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filteredItems.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredItems.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
          handleSelect(filteredItems[selectedIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  const handleBlur = () => {
    // Pequeño delay para permitir clicks en los items
    setTimeout(() => {
      setOpen(false)
    }, 150)
  }

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <div className="relative w-full">
              {selectedItem?.countryCode && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-full">
                  <CountryFlag 
                    countryCode={selectedItem.countryCode}
                    label={selectedItem.countryName || selectedItem.label}
                    className="h-4 w-6"
                  />
                </div>
              )}
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (inputValue.length > 0) {
                    setOpen(true)
                  }
                }}
                onClick={(e) => {
                  // Evitar que el clic en el input cierre el popover
                  e.stopPropagation()
                  if (inputValue.length > 0) {
                    setOpen(true)
                  }
                }}
                onBlur={handleBlur}
                disabled={disabled || isLoading}
                className={cn(
                  "w-full pr-10 h-10",
                  selectedItem?.flag ? "pl-12" : "",
                  inputClassName
                )}
              />
            </div>
            {(isLoading) && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </PopoverAnchor>
        
        <PopoverContent 
          className={cn("w-[--radix-popover-trigger-width] p-0", popoverClassName)}
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandList>
              {isLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredItems.length === 0 ? (
                <CommandEmpty>{emptyText}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredItems.map((item, index) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={handleSelect}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "cursor-pointer flex items-center",
                        index === selectedIndex && "bg-accent"
                      )}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 flex-shrink-0",
                          selectedItem?.value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {renderItem ? (
                        renderItem(item)
                      ) : (
                        <>
                          {item.countryCode && (
                            <CountryFlag 
                              countryCode={item.countryCode}
                              label={item.countryName || item.label}
                              className="mr-2 h-4 w-6 flex-shrink-0"
                            />
                          )}
                          <span className="truncate">
                            {item.label.replace(/^[^\w]*/, '')}
                          </span>
                        </>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

const CountryFlag = ({ countryCode, label, className = '' }: CountryFlagProps) => {
  if (!countryCode) return null;
  
  const FlagComponent = flags[countryCode as keyof typeof flags];
  
  return (
    <span className={cn("flex items-center justify-center overflow-hidden rounded-sm bg-foreground/20", className)}>
      {FlagComponent && <FlagComponent title={label} />}
    </span>
  );
};