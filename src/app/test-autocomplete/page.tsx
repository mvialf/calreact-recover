"use client"

import { useState } from 'react';
import { Autocomplete, AutocompleteItem } from '@/components/ui/autocomplete';

// ============================================================================
// Mock Data
// ============================================================================

const mockItems: AutocompleteItem[] = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2' },
  { value: '3', label: 'Opción 3' }
];

const customRenderItems: AutocompleteItem[] = [
  { value: 'custom1', label: 'Custom Item 1', emoji: '🎨' },
  { value: 'custom2', label: 'Custom Item 2', emoji: '🚀' },
  { value: 'custom3', label: 'Custom Item 3', emoji: '⭐' }
];

// ============================================================================
// Página de Testing para E2E
// ============================================================================

export default function TestAutocompletePage() {
  const [basicValue, setBasicValue] = useState('');
  const [strictValue, setStrictValue] = useState('');
  const [debounceValue, setDebounceValue] = useState('');
  const [customValue, setCustomValue] = useState('');

  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Autocomplete Testing Page</h1>

      {/* Autocomplete Básico */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Autocomplete Básico</h2>
        <Autocomplete
          items={mockItems}
          value={basicValue}
          onSelect={setBasicValue}
          placeholder="Buscar opción..."
        />
        <p className="text-sm text-muted-foreground">
          Valor seleccionado: {basicValue || '(ninguno)'}
        </p>
      </section>

      {/* StrictSelection */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">StrictSelection</h2>
        <Autocomplete
          items={mockItems}
          value={strictValue}
          onSelect={setStrictValue}
          placeholder="Solo valores válidos..."
          strictSelection={true}
          data-testid="strict-autocomplete"
        />
        <p className="text-sm text-muted-foreground">
          Valor seleccionado: {strictValue || '(ninguno)'}
        </p>
      </section>

      {/* Debounce */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Con Debounce (500ms)</h2>
        <Autocomplete
          items={mockItems}
          value={debounceValue}
          onSelect={setDebounceValue}
          placeholder="Búsqueda con debounce..."
          debounceMs={500}
          data-testid="debounce-autocomplete"
        />
        <p className="text-sm text-muted-foreground">
          Valor seleccionado: {debounceValue || '(ninguno)'}
        </p>
      </section>

      {/* Loading State */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Estado de Carga</h2>
        <Autocomplete
          items={mockItems}
          value=""
          onSelect={() => {}}
          placeholder="Cargando..."
          isLoading={true}
          data-testid="loading-autocomplete"
        />
      </section>

      {/* Renderizado Personalizado */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Renderizado Personalizado</h2>
        <Autocomplete
          items={customRenderItems}
          value={customValue}
          onSelect={setCustomValue}
          placeholder="Buscar con emojis..."
          data-testid="custom-render-autocomplete"
          renderItem={(item, isSelected) => (
            <div className="flex items-center gap-2">
              <span className="text-xl">{item.emoji}</span>
              <span className={isSelected ? 'font-semibold' : ''}>
                {item.label}
              </span>
            </div>
          )}
        />
        <p className="text-sm text-muted-foreground">
          Valor seleccionado: {customValue || '(ninguno)'}
        </p>
      </section>

      {/* Todos los estados */}
      <section className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Estado Global</h3>
        <ul className="space-y-1 text-sm">
          <li>Básico: {basicValue || '(vacío)'}</li>
          <li>Strict: {strictValue || '(vacío)'}</li>
          <li>Debounce: {debounceValue || '(vacío)'}</li>
          <li>Custom: {customValue || '(vacío)'}</li>
        </ul>
      </section>
    </div>
  );
}
