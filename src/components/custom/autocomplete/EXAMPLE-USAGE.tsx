/**
 * Ejemplos de uso del componente Autocomplete
 *
 * Estos ejemplos muestran las diferentes formas de usar el componente
 * en diferentes escenarios comunes.
 */

import React from 'react';
import { Autocomplete } from '@/components/custom/autocomplete';
import type { AutocompleteItem } from './types';

// ============================================================================
// Ejemplo 1: Uso Básico
// ============================================================================

export function BasicExample() {
  const [value, setValue] = React.useState('');

  const items: AutocompleteItem[] = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
    { value: '3', label: 'Opción 3' },
  ];

  return (
    <div className="w-full max-w-md">
      <label className="text-sm font-medium mb-2 block">
        Selecciona una opción
      </label>
      <Autocomplete
        items={items}
        value={value}
        onSelect={setValue}
        placeholder="Buscar..."
      />
    </div>
  );
}

// ============================================================================
// Ejemplo 2: Con Debounce (búsqueda en API)
// ============================================================================

export function DebounceExample() {
  const [value, setValue] = React.useState('');
  const [results, setResults] = React.useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Simular API call
      const response = await fetch(`/api/search?q=${query}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <label className="text-sm font-medium mb-2 block">
        Buscar productos
      </label>
      <Autocomplete
        items={results}
        value={value}
        onSelect={setValue}
        onSearch={handleSearch}
        debounceMs={300}
        isLoading={loading}
        placeholder="Escribe para buscar..."
      />
    </div>
  );
}

// ============================================================================
// Ejemplo 3: Con Validación Estricta
// ============================================================================

export function StrictSelectionExample() {
  const [value, setValue] = React.useState('');

  const countries: AutocompleteItem[] = [
    { value: 'cl', label: 'Chile' },
    { value: 'ar', label: 'Argentina' },
    { value: 'pe', label: 'Perú' },
    { value: 'co', label: 'Colombia' },
    { value: 'mx', label: 'México' },
  ];

  return (
    <div className="w-full max-w-md">
      <label className="text-sm font-medium mb-2 block">
        País *
      </label>
      <Autocomplete
        items={countries}
        value={value}
        onSelect={setValue}
        strictSelection={true}
        placeholder="Selecciona un país"
        emptyText="País no encontrado"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Solo puedes seleccionar valores de la lista
      </p>
    </div>
  );
}

// ============================================================================
// Ejemplo 4: Con Render Customizado
// ============================================================================

interface User extends AutocompleteItem {
  avatar: string;
  email: string;
}

export function CustomRenderExample() {
  const [value, setValue] = React.useState('');

  const users: User[] = [
    {
      value: '1',
      label: 'Juan Pérez',
      avatar: '/avatars/juan.jpg',
      email: 'juan@example.com',
    },
    {
      value: '2',
      label: 'María González',
      avatar: '/avatars/maria.jpg',
      email: 'maria@example.com',
    },
    {
      value: '3',
      label: 'Pedro Rodríguez',
      avatar: '/avatars/pedro.jpg',
      email: 'pedro@example.com',
    },
  ];

  return (
    <div className="w-full max-w-md">
      <label className="text-sm font-medium mb-2 block">
        Asignar a
      </label>
      <Autocomplete
        items={users}
        value={value}
        onSelect={setValue}
        placeholder="Buscar usuario..."
        renderItem={(item, isSelected) => {
          const user = item as User;
          return (
            <div className="flex items-center gap-3 py-1">
              <img
                src={user.avatar}
                alt={user.label}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.label}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              {isSelected && (
                <span className="text-xs text-primary font-medium">
                  Seleccionado
                </span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}

// ============================================================================
// Ejemplo 5: Con Estado de Formulario (React Hook Form)
// ============================================================================

import { useForm, Controller } from 'react-hook-form';

interface FormData {
  country: string;
  product: string;
}

export function FormExample() {
  const { control, handleSubmit } = useForm<FormData>();

  const countries: AutocompleteItem[] = [
    { value: 'cl', label: 'Chile' },
    { value: 'ar', label: 'Argentina' },
    { value: 'pe', label: 'Perú' },
  ];

  const products: AutocompleteItem[] = [
    { value: 'p1', label: 'Producto A' },
    { value: 'p2', label: 'Producto B' },
    { value: 'p3', label: 'Producto C' },
  ];

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label className="text-sm font-medium mb-2 block">País *</label>
        <Controller
          name="country"
          control={control}
          rules={{ required: 'País es requerido' }}
          render={({ field, fieldState }) => (
            <>
              <Autocomplete
                items={countries}
                value={field.value}
                onSelect={field.onChange}
                strictSelection={true}
                placeholder="Selecciona un país"
              />
              {fieldState.error && (
                <p className="text-xs text-destructive mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Producto *</label>
        <Controller
          name="product"
          control={control}
          rules={{ required: 'Producto es requerido' }}
          render={({ field, fieldState }) => (
            <>
              <Autocomplete
                items={products}
                value={field.value}
                onSelect={field.onChange}
                placeholder="Buscar producto..."
                debounceMs={200}
              />
              {fieldState.error && (
                <p className="text-xs text-destructive mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Enviar
      </button>
    </form>
  );
}

// ============================================================================
// Ejemplo 6: Con Filtrado Local Customizado
// ============================================================================

export function CustomFilterExample() {
  const [value, setValue] = React.useState('');
  const [items] = React.useState<AutocompleteItem[]>([
    { value: '1', label: 'JavaScript', category: 'Programming' },
    { value: '2', label: 'Python', category: 'Programming' },
    { value: '3', label: 'React', category: 'Framework' },
    { value: '4', label: 'Vue', category: 'Framework' },
    { value: '5', label: 'Angular', category: 'Framework' },
  ]);

  // Filtrado local customizado
  const [filteredItems, setFilteredItems] = React.useState(items);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredItems(items);
      return;
    }

    // Filtrado fuzzy o por categoría
    const filtered = items.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  return (
    <div className="w-full max-w-md">
      <label className="text-sm font-medium mb-2 block">
        Tecnología
      </label>
      <Autocomplete
        items={filteredItems}
        value={value}
        onSelect={setValue}
        onSearch={handleSearch}
        placeholder="Buscar por nombre o categoría..."
        renderItem={(item) => (
          <div className="flex items-center justify-between py-1">
            <span>{item.label}</span>
            <span className="text-xs text-muted-foreground">
              {item.category}
            </span>
          </div>
        )}
      />
    </div>
  );
}

// ============================================================================
// Ejemplo 7: Con Estado Disabled
// ============================================================================

export function DisabledExample() {
  const [value, setValue] = React.useState('');
  const [isDisabled, setIsDisabled] = React.useState(true);

  const items: AutocompleteItem[] = [
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' },
  ];

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!isDisabled}
            onChange={(e) => setIsDisabled(!e.target.checked)}
          />
          <span className="text-sm">Habilitar campo</span>
        </label>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Campo condicional
        </label>
        <Autocomplete
          items={items}
          value={value}
          onSelect={setValue}
          disabled={isDisabled}
          placeholder="Campo deshabilitado"
        />
      </div>
    </div>
  );
}
