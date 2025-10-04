import * as React from "react"
import { Check, Loader2 } from "lucide-react"
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
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useDebounce } from "@/hooks/usePerformanceOptimizations"

export interface AutocompleteItem {
  value: string;
  label: string;
  [key: string]: any;
}

interface AutocompleteProps {
  items: AutocompleteItem[]
  value: string
  onSelect: (value: string) => void
  onInputChange?: (value: string) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  inputClassName?: string
  popoverClassName?: string
  renderItem?: (item: AutocompleteItem) => React.ReactNode
  strictSelection?: boolean
  debounceMs?: number
}

export function Autocomplete({
  items = [],
  value,
  onSelect,
  onInputChange,
  placeholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  isLoading = false,
  className = "",
  inputClassName = "",
  popoverClassName = "",
  renderItem,
  strictSelection = false,
  debounceMs = 0,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<AutocompleteItem | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [isValidInput, setIsValidInput] = React.useState(true)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Aplicar debounce solo cuando sea configurado
  const debouncedInputValue = useDebounce(inputValue, debounceMs)

  // Actualizar el valor del input cuando cambia el valor seleccionado
  React.useEffect(() => {
    if (value) {
      const item = items.find(item => item.value === value)
      setSelectedItem(item || null)
      if (item) {
        setInputValue(item.label);
      } else {
        setInputValue("");
      }
    } else {
      setSelectedItem(null)
      setInputValue("")
    }
  }, [value, items])

  const filteredItems = React.useMemo(() => {
    // Usar valor con debounce solo cuando esté configurado, sino usar valor inmediato
    const searchValue = debounceMs > 0 ? debouncedInputValue : inputValue
    if (!searchValue) return items
    return items.filter(item =>
      item.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [debouncedInputValue, inputValue, items, debounceMs])

  React.useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    if (strictSelection) {
      // Modo estricto: validar contra items disponibles
      const hasMatchingItem = items.some(item =>
        item.label.toLowerCase().includes(newValue.toLowerCase())
      )

      // Solo permitir si hay coincidencia o está vacío
      if (hasMatchingItem || newValue === '') {
        setInputValue(newValue)
        setIsValidInput(true)
        if (onInputChange) onInputChange(newValue)

        // Abrir popover si hay texto
        if (newValue.length > 0 && !open) {
          setOpen(true)
        }

        // Limpiamos la selección si el input está vacío
        if (newValue.length === 0) {
          onSelect("")
        }
      } else {
        // Input inválido - marcar como tal pero no actualizar
        setIsValidInput(false)
      }
      return
    }

    // Comportamiento normal (texto libre)
    setInputValue(newValue)
    setIsValidInput(true)
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
      setIsValidInput(true)
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
    if (strictSelection && inputValue) {
      // Verificar si el valor actual corresponde a un item válido
      const exactMatch = items.find(item =>
        item.label.toLowerCase() === inputValue.toLowerCase()
      )

      if (!exactMatch) {
        // Revertir al último valor válido o vacío
        const currentSelection = items.find(item => item.value === value)
        setInputValue(currentSelection ? currentSelection.label : '')
        setIsValidInput(true)
      }
    }

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
                "w-full pr-10",
                strictSelection && !isValidInput && "border-destructive focus:ring-destructive",
                inputClassName
              )}
              aria-invalid={strictSelection && !isValidInput}
              aria-autocomplete={strictSelection ? "list" : "both"}
            />
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
                        <span className="truncate">
                          {item.label}
                        </span>
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

