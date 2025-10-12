"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"

import { cn } from "./utils/cn"
import { Input } from "./ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command"
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "./ui/popover"
import { useDebounce } from "./hooks/useDebounce"

// ============================================================================
// Types (heredados y extendidos desde Combobox)
// ============================================================================

/**
 * Item del autocomplete compatible con ComboboxItem
 */
export interface AutocompleteItem extends Record<string, any> {
  value: string
  label: string
  [key: string]: any
}

/**
 * Props del componente Autocomplete
 * Hereda TODAS las funcionalidades del Combobox pero con búsqueda en el trigger
 */
interface AutocompleteProps {
  // ============ DATOS ============
  /** Lista de elementos a mostrar en el autocomplete */
  items: AutocompleteItem[]

  /** Valor seleccionado actualmente */
  value?: string

  // ============ CALLBACKS ============
  /** Función que se llama al seleccionar un elemento */
  onSelect: (value: string) => void

  /** Función opcional que se invoca cuando se selecciona un valor (heredado de Combobox) */
  onValueSelect?: (value: string) => void

  /** Función opcional para realizar búsquedas personalizadas (heredado de Combobox) */
  onSearch?: (query: string) => void

  /** Función opcional que se invoca cuando cambia el input (compatibilidad legacy) */
  onInputChange?: (value: string) => void

  // ============ TEXTOS ============
  /** Texto a mostrar cuando no hay valor seleccionado */
  placeholder?: string

  /** Texto del placeholder del campo de búsqueda (heredado de Combobox) */
  searchPlaceholder?: string

  /** Texto a mostrar cuando no hay resultados */
  emptyText?: string

  // ============ COMPORTAMIENTO ============
  /** Si el autocomplete está deshabilitado */
  disabled?: boolean

  /** Si se debe mostrar un indicador de carga */
  isLoading?: boolean

  /**
   * Si el input debe validar que solo se permitan valores de la lista
   * (exclusivo de Autocomplete, no existe en Combobox)
   */
  strictSelection?: boolean

  /**
   * Milisegundos de debounce para el input
   * (exclusivo de Autocomplete, no existe en Combobox)
   */
  debounceMs?: number

  // ============ ESTILOS (heredado de Combobox) ============
  /** Clase CSS personalizada para el contenedor */
  className?: string

  /** Clase CSS para el input del autocomplete (equivalente a buttonClassName en Combobox) */
  inputClassName?: string

  /** Clase CSS para el contenido del popover (heredado de Combobox) */
  popoverClassName?: string

  /** Clase CSS para los elementos de la lista (heredado de Combobox) */
  itemClassName?: string

  // ============ RENDERIZADO (heredado de Combobox) ============
  /**
   * Si se debe mostrar el campo de búsqueda
   * (heredado de Combobox, pero en Autocomplete siempre es true internamente)
   */
  showSearch?: boolean

  /** Función personalizada para renderizar cada elemento de la lista */
  renderItem?: (item: AutocompleteItem, isSelected: boolean) => React.ReactNode

  /** Función personalizada para renderizar el elemento seleccionado (heredado de Combobox) */
  renderSelectedItem?: (item: AutocompleteItem) => React.ReactNode
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook para manejar el estado del autocomplete
 */
function useAutocompleteState(
  items: AutocompleteItem[],
  value: string | undefined,
  debounceMs: number
) {
  const [inputValue, setInputValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<AutocompleteItem | null>(null)
  const [isValidInput, setIsValidInput] = React.useState(true)

  // Aplicar debounce solo cuando sea configurado
  const debouncedInputValue = useDebounce(inputValue, debounceMs)

  // Actualizar el valor del input cuando cambia el valor seleccionado
  React.useEffect(() => {
    if (value) {
      const item = items.find(item => item.value === value)
      setSelectedItem(item || null)
      if (item) {
        setInputValue(item.label)
      } else {
        setInputValue("")
      }
    } else {
      setSelectedItem(null)
      setInputValue("")
    }
  }, [value, items])

  return {
    inputValue,
    setInputValue,
    debouncedInputValue,
    open,
    setOpen,
    selectedItem,
    setSelectedItem,
    isValidInput,
    setIsValidInput,
  }
}

/**
 * Hook para manejar la navegación por teclado
 */
function useAutocompleteKeyboard(
  open: boolean,
  filteredItems: AutocompleteItem[],
  selectedIndex: number,
  setSelectedIndex: (index: number) => void,
  onSelectItem: (value: string) => void,
  onClose: () => void
) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open || filteredItems.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(Math.min(selectedIndex + 1, filteredItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(Math.max(selectedIndex - 1, 0))
          break
        case 'Home':
          e.preventDefault()
          setSelectedIndex(0)
          break
        case 'End':
          e.preventDefault()
          setSelectedIndex(filteredItems.length - 1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
            onSelectItem(filteredItems[selectedIndex].value)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'Tab':
          onClose()
          break
      }
    },
    [open, filteredItems, selectedIndex, setSelectedIndex, onSelectItem, onClose]
  )

  return { handleKeyDown }
}

// ============================================================================
// Componente Principal
// ============================================================================

export function Autocomplete({
  items = [],
  value,
  onSelect,
  onValueSelect,
  onSearch,
  onInputChange,
  placeholder = "Buscar...",
  searchPlaceholder,
  emptyText = "No se encontraron resultados.",
  disabled = false,
  isLoading = false,
  strictSelection = false,
  debounceMs = 0,
  className = "",
  inputClassName = "",
  popoverClassName = "",
  itemClassName = "",
  showSearch = true,
  renderItem,
  renderSelectedItem,
}: AutocompleteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Estado del autocomplete
  const {
    inputValue,
    setInputValue,
    debouncedInputValue,
    open,
    setOpen,
    selectedItem,
    setSelectedItem,
    isValidInput,
    setIsValidInput,
  } = useAutocompleteState(items, value, debounceMs)

  // Búsqueda inteligente (heredado de Combobox)
  const filteredItems = React.useMemo(() => {
    // Usar valor con debounce solo cuando esté configurado, sino usar valor inmediato
    const searchValue = debounceMs > 0 ? debouncedInputValue : inputValue

    // Si hay callback onSearch, delegar al padre (heredado de Combobox)
    if (onSearch) {
      onSearch(searchValue)
      return items // El padre controla el filtrado
    }

    // Filtrado local por defecto
    if (!searchValue) return items
    return items.filter(item =>
      item.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [debouncedInputValue, inputValue, items, onSearch, debounceMs])

  // Reset selected index cuando cambian resultados
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems])

  // Navegación por teclado
  const { handleKeyDown } = useAutocompleteKeyboard(
    open,
    filteredItems,
    selectedIndex,
    setSelectedIndex,
    (val) => handleSelect(val),
    () => setOpen(false)
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    // ✅ MEJORA: Siempre permitir escribir, validar solo visualmente
    setInputValue(newValue)
    if (onInputChange) onInputChange(newValue)

    if (strictSelection) {
      // Validar contra items disponibles pero NO bloquear escritura
      const hasMatchingItem = items.some(item =>
        item.label.toLowerCase().includes(newValue.toLowerCase())
      )

      // Solo marcar validez visual, no bloquear input
      setIsValidInput(hasMatchingItem || newValue === '')
    } else {
      setIsValidInput(true)
    }

    // Abrir popover si hay texto
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
    if (!selected) return

    setSelectedItem(selected)
    setInputValue(selected.label)
    setIsValidInput(true)

    // Callbacks (unificados con Combobox)
    if (onValueSelect) {
      onValueSelect(selected.value)
    }
    onSelect(selectedValue)

    setOpen(false)
    inputRef.current?.focus()
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

  // Placeholder efectivo (usar searchPlaceholder si está disponible, heredado de Combobox)
  const effectivePlaceholder = searchPlaceholder || placeholder

  // ✅ MEJORA: Mensaje dinámico cuando no hay resultados
  const emptyMessage = React.useMemo(() => {
    const searchValue = debounceMs > 0 ? debouncedInputValue : inputValue

    if (!searchValue) return emptyText

    return `No se encontraron resultados para "${searchValue}". Intenta con menos caracteres.`
  }, [inputValue, debouncedInputValue, emptyText, debounceMs])

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={effectivePlaceholder}
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
              role="combobox"
              aria-expanded={open}
              aria-controls="autocomplete-listbox"
            />

            {/* Icono derecho (heredado de Combobox con mejoras) */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {isLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              ) : (
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          </div>
        </PopoverAnchor>

        <PopoverContent
          className={cn("w-[--radix-popover-trigger-width] p-0", popoverClassName)}
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandList id="autocomplete-listbox">
              {isLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredItems.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup className="w-full overflow-y-auto">
                  {filteredItems.map((item, index) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={handleSelect}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "cursor-pointer flex items-center gap-2",
                        index === selectedIndex && "bg-accent",
                        itemClassName
                      )}
                    >
                      {/* Check icon (heredado de Combobox) */}
                      <div
                        className={cn(
                          "w-4 h-4 flex items-center justify-center flex-shrink-0",
                          selectedItem?.value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>

                      {/* Renderizado del item (heredado de Combobox) */}
                      {renderItem ? (
                        renderItem(item, selectedItem?.value === item.value)
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
