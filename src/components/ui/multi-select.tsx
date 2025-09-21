import * as React from "react"
import { Check, X, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDebounce } from "@/hooks/usePerformanceOptimizations"

export interface MultiSelectItem {
  value: string
  label: string
  [key: string]: any
}

interface MultiSelectProps {
  items: MultiSelectItem[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  onSearch?: (query: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  isLoading?: boolean
  maxItems?: number
  className?: string
  renderItem?: (item: MultiSelectItem, isSelected: boolean) => React.ReactNode
  renderSelectedBadge?: (item: MultiSelectItem) => React.ReactNode
  debounceMs?: number
  showSelectedInDropdown?: boolean
  clearable?: boolean
}

export function MultiSelect({
  items,
  selectedValues,
  onSelectionChange,
  onSearch,
  placeholder = "Seleccionar elementos...",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  isLoading = false,
  maxItems,
  className,
  renderItem,
  renderSelectedBadge,
  debounceMs = 0,
  showSelectedInDropdown = true,
  clearable = true,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Aplicar debounce al query de búsqueda
  const debouncedQuery = useDebounce(searchQuery, debounceMs)

  // Ejecutar búsqueda con debounce
  React.useEffect(() => {
    if (onSearch && debouncedQuery !== undefined) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  // Filtrar items basado en búsqueda local
  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items
    if (onSearch) return items // Si hay búsqueda externa, no filtrar localmente

    return items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [items, searchQuery, onSearch])

  // Obtener items seleccionados
  const selectedItems = React.useMemo(
    () => items.filter(item => selectedValues.includes(item.value)),
    [items, selectedValues]
  )

  const handleSelect = (value: string) => {
    const isSelected = selectedValues.includes(value)
    let newValues: string[]

    if (isSelected) {
      newValues = selectedValues.filter(v => v !== value)
    } else {
      if (maxItems && selectedValues.length >= maxItems) {
        return // No permitir más selecciones
      }
      newValues = [...selectedValues, value]
    }

    onSelectionChange(newValues)
  }

  const handleRemove = (value: string) => {
    onSelectionChange(selectedValues.filter(v => v !== value))
  }

  const handleClear = () => {
    onSelectionChange([])
    setSearchQuery("")
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          >
            <span className="truncate text-left">
              {selectedItems.length > 0
                ? `${selectedItems.length} seleccionado${selectedItems.length !== 1 ? 's' : ''}`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full bg-transparent py-3 text-sm outline-none border-0 focus:ring-0 placeholder:text-muted-foreground"
              />
            </div>

            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredItems.map((item) => {
                  const isSelected = selectedValues.includes(item.value)

                  if (!showSelectedInDropdown && isSelected) {
                    return null
                  }

                  return (
                    <CommandItem
                      key={item.value}
                      onSelect={() => handleSelect(item.value)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {renderItem ? (
                          renderItem(item, isSelected)
                        ) : (
                          <span>{item.label}</span>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Badges de elementos seleccionados */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedItems.map((item) => (
            <Badge
              key={item.value}
              variant="secondary"
              className="gap-1"
            >
              {renderSelectedBadge ? renderSelectedBadge(item) : item.label}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleRemove(item.value)
                }}
                className="ml-1 hover:bg-muted rounded-sm p-0.5"
                aria-label={`Remover ${item.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {clearable && selectedItems.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 px-2 text-xs"
            >
              Limpiar todo
            </Button>
          )}
        </div>
      )}
    </div>
  )
}