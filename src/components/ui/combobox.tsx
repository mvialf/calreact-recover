"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"

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

export interface ComboboxItem extends Record<string, any> {
  value: string
  label: string
  [key: string]: any
}

interface ComboboxProps {
  /** Lista de elementos a mostrar en el combobox */
  items: ComboboxItem[]
  /** Valor seleccionado actualmente */
  value?: string
  /** Función que se llama al seleccionar un elemento */
  onSelect: (value: string) => void
  /** Función opcional que se invoca cuando se selecciona un valor, útil para lógica adicional. */
  onValueSelect?: (value: string) => void
  /** Función opcional para realizar búsquedas personalizadas */
  onSearch?: (query: string) => void
  /** Texto a mostrar cuando no hay valor seleccionado */
  placeholder?: string
  /** Texto a mostrar cuando no hay resultados */
  emptyText?: string
  /** Texto del placeholder del campo de búsqueda */
  searchPlaceholder?: string
  /** Si el combobox está deshabilitado */
  disabled?: boolean
  /** Si se debe mostrar un indicador de carga */
  isLoading?: boolean
  /** Clase CSS personalizada para el contenedor */
  className?: string
  /** Clase CSS para el botón del combobox */
  buttonClassName?: string
  /** Clase CSS para el contenido del popover */
  contentClassName?: string
  /** Clase CSS para los elementos de la lista */
  itemClassName?: string
  /** Si se debe mostrar el campo de búsqueda */
  showSearch?: boolean
  /** Función personalizada para renderizar cada elemento de la lista */
  renderItem?: (item: ComboboxItem, isSelected: boolean) => React.ReactNode
  /** Función personalizada para renderizar el elemento seleccionado */
  renderSelectedItem?: (item: ComboboxItem) => React.ReactNode
}

export function Combobox({
  items,
  value,
  onSelect,
  onSearch,
  onValueSelect,
  placeholder = "Seleccionar...",
  emptyText = "No se encontraron resultados.",
  searchPlaceholder = "Buscar...",
  disabled = false,
  isLoading = false,
  className,
  buttonClassName,
  contentClassName,
  itemClassName,
  showSearch = true,
  renderItem,
  renderSelectedItem,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Manejar búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }

  const filteredItems = React.useMemo(() => {
    // Si hay una búsqueda personalizada, no filtrar localmente
    if (onSearch) return items
    
    // Filtrado local si no hay búsqueda personalizada
    if (!searchQuery) return items
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [items, searchQuery, onSearch])

  const selectedItem = items.find((item) => item.value === value)

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal h-8 text-sm",
              !selectedItem && "text-muted-foreground",
              buttonClassName
            )}
            disabled={disabled || isLoading}
          >
            <span className="truncate text-left">
              {selectedItem 
                ? (renderSelectedItem ? renderSelectedItem(selectedItem) : selectedItem.label)
                : placeholder}
            </span>
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn("w-full", contentClassName)}
          align="start"
        >
          <Command>
            {showSearch && (
              <CommandInput 
                placeholder={searchPlaceholder} 
                className="h-10"
                value={searchQuery}
                onValueChange={handleSearch}
              />
            )}
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup className="max-h-48 overflow-y-auto">
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value} // Usar el valor real (placeId) para la selección
                    onSelect={(currentValue) => {
                      if (onValueSelect) {
                        onValueSelect(item.value);
                      }
                      onSelect(item.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      itemClassName
                    )}
                  >
                    {renderItem ? (
                      renderItem(item, value === item.value)
                    ) : (
                      <>
                        <div 
                          className={cn(
                            "w-4 h-4 flex items-center justify-center",
                            value === item.value ? "opacity-100" : "opacity-0"
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
