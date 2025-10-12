import * as React from "react"

/**
 * Item del autocomplete
 */
export interface AutocompleteItem extends Record<string, any> {
  value: string
  label: string
  [key: string]: any
}

/**
 * Props del componente Autocomplete
 */
export interface AutocompleteProps {
  // ============ DATOS ============
  items: AutocompleteItem[]
  value?: string

  // ============ CALLBACKS ============
  onSelect: (value: string) => void
  onValueSelect?: (value: string) => void
  onSearch?: (query: string) => void
  onInputChange?: (value: string) => void

  // ============ TEXTOS ============
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string

  // ============ COMPORTAMIENTO ============
  disabled?: boolean
  isLoading?: boolean
  strictSelection?: boolean
  debounceMs?: number

  // ============ ESTILOS ============
  className?: string
  inputClassName?: string
  popoverClassName?: string
  itemClassName?: string

  // ============ RENDERIZADO ============
  showSearch?: boolean
  renderItem?: (item: AutocompleteItem, isSelected: boolean) => React.ReactNode
  renderSelectedItem?: (item: AutocompleteItem) => React.ReactNode
}
