import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete, AutocompleteItem } from '../autocomplete';

// ============================================================================
// Mock Data
// ============================================================================

const mockItems: AutocompleteItem[] = [
  { value: '1', label: 'Opción 1' },
  { value: '2', label: 'Opción 2' },
  { value: '3', label: 'Opción 3' }
];

// ============================================================================
// Tests: Renderizado Básico
// ============================================================================

describe('Autocomplete - Renderizado Básico', () => {
  it('debe renderizar con placeholder correcto', () => {
    // Arrange & Act
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        placeholder="Buscar opciones"
      />
    );

    // Assert
    expect(screen.getByPlaceholderText('Buscar opciones')).toBeInTheDocument();
  });

  it('debe mostrar valor seleccionado cuando se pasa prop value', () => {
    // Arrange & Act
    render(
      <Autocomplete
        items={mockItems}
        value="2"
        onSelect={jest.fn()}
      />
    );

    // Assert
    expect(screen.getByDisplayValue('Opción 2')).toBeInTheDocument();
  });

  it('debe mostrar indicador de carga cuando isLoading es true', () => {
    // Arrange & Act
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        isLoading={true}
      />
    );

    // Assert - Buscar icono Loader2 con clase animate-spin
    const loader = document.querySelector('.animate-spin');
    expect(loader).toBeInTheDocument();
  });

  it('debe deshabilitar input cuando disabled es true', () => {
    // Arrange & Act
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        disabled={true}
      />
    );

    // Assert
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('debe renderizar icono Search por defecto', () => {
    // Arrange & Act
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
      />
    );

    // Assert - Verificar que existe el contenedor del icono
    const iconContainer = document.querySelector('.absolute.right-2');
    expect(iconContainer).toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Interacción de Usuario
// ============================================================================

describe('Autocomplete - Interacción Usuario', () => {
  it('debe abrir popover al escribir en el input', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'Op');

    // Assert - Esperar actualizaciones asíncronas de Radix UI Popover
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('debe seleccionar item y cerrar popover al hacer click', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSelect = jest.fn();

    render(
      <Autocomplete
        items={mockItems}
        onSelect={handleSelect}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('Opción 1');

    const option = screen.getByText('Opción 1');
    await user.click(option);

    // Assert
    expect(handleSelect).toHaveBeenCalledWith('1');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('debe cerrar popover con delay al hacer blur', async () => {
    // Arrange
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'Op');

    // Blur del input (delay de 150ms configurado en línea 357)
    input.blur();

    // Assert - Delay de 150ms configurado
    jest.advanceTimersByTime(150);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    jest.useRealTimers();
  });

  it('debe limpiar selección cuando input está vacío', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSelect = jest.fn();

    render(
      <Autocomplete
        items={mockItems}
        value="1"
        onSelect={handleSelect}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.clear(input);

    // Assert - Verificar línea 318-320
    expect(handleSelect).toHaveBeenCalledWith('');
  });
});

// ============================================================================
// Tests: Búsqueda y Filtrado
// ============================================================================

describe('Autocomplete - Búsqueda y Filtrado', () => {
  it('debe filtrar items localmente por defecto', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('Opción 2');

    // Assert - Verificar filtrado local (líneas 272-275)
    expect(screen.getByText('Opción 2')).toBeInTheDocument();
    expect(screen.queryByText('Opción 1')).not.toBeInTheDocument();
  });

  it('debe delegar búsqueda al padre cuando existe onSearch', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSearch = jest.fn();

    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        onSearch={handleSearch}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'test');

    // Assert - Verificar delegación (líneas 266-269)
    expect(handleSearch).toHaveBeenCalledWith('test');
  });

  it('debe aplicar debounce cuando debounceMs > 0', async () => {
    // Arrange
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const handleSearch = jest.fn();

    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        onSearch={handleSearch}
        debounceMs={300}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'test');

    // Clear any calls that happened during typing
    handleSearch.mockClear();

    // Assert - No debe llamar inmediatamente después de typing
    expect(handleSearch).not.toHaveBeenCalled();

    // Avanzar 300ms (línea 134)
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(handleSearch).toHaveBeenCalledWith('test');
    });

    jest.useRealTimers();
  });
});

// ============================================================================
// Tests: StrictSelection
// ============================================================================

describe('Autocomplete - StrictSelection', () => {
  it('debe marcar input como inválido cuando no coincide con item (strictSelection)', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        strictSelection={true}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('texto invalido');

    // Assert - Verificar validación visual (línea 402)
    expect(input).toHaveClass('border-destructive');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('debe revertir a último valor válido en blur con strictSelection', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        value="1"
        onSelect={jest.fn()}
        strictSelection={true}
      />
    );

    // Act
    const input = screen.getByRole('combobox');

    // Escribir valor inválido
    await user.clear(input);
    input.focus();
    await user.paste('invalido');

    // Blur (líneas 342-354)
    input.blur();

    // Assert - Debe revertir a "Opción 1"
    await waitFor(() => {
      expect(input).toHaveValue('Opción 1');
    });
  });

  it('NO debe validar cuando strictSelection es false', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        strictSelection={false}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('cualquier texto');

    // Assert - No debe tener clase de error (línea 309)
    expect(input).not.toHaveClass('border-destructive');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });
});

// ============================================================================
// Tests: Navegación por Teclado
// ============================================================================

describe('Autocomplete - Navegación Teclado', () => {
  it('debe navegar con ArrowDown', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'Op');

    // ArrowDown (línea 181-184)
    await user.keyboard('{ArrowDown}');

    // Assert - Verificar que primer item está seleccionado (aria-selected)
    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('debe ir al primer item con Home', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'Op');

    // Navegar a último item primero
    await user.keyboard('{End}');

    // Home (línea 189-192)
    await user.keyboard('{Home}');

    // Assert - Verificar que primer item está seleccionado (aria-selected)
    const items = screen.getAllByRole('option');
    expect(items[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('debe seleccionar con Enter', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSelect = jest.fn();

    render(
      <Autocomplete
        items={mockItems}
        onSelect={handleSelect}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'Op');

    // Enter (línea 197-202)
    await user.keyboard('{Enter}');

    // Assert
    expect(handleSelect).toHaveBeenCalledWith('1');
  });

  it('debe cerrar popover con Escape', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'Op');

    // Escape (línea 203-206)
    await user.keyboard('{Escape}');

    // Assert
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('debe cerrar popover con Tab', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'Op');

    // Tab (línea 207-209)
    await user.keyboard('{Tab}');

    // Assert
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });
});

// ============================================================================
// Tests: Callbacks
// ============================================================================

describe('Autocomplete - Callbacks', () => {
  it('debe llamar onSelect al seleccionar item', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleSelect = jest.fn();

    render(
      <Autocomplete
        items={mockItems}
        onSelect={handleSelect}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('Opción 3');

    const option = screen.getByText('Opción 3');
    await user.click(option);

    // Assert
    expect(handleSelect).toHaveBeenCalledWith('3');
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onInputChange al escribir', async () => {
    // Arrange
    const user = userEvent.setup();
    const handleInputChange = jest.fn();

    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        onInputChange={handleInputChange}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    await user.type(input, 'test');

    // Assert
    expect(handleInputChange).toHaveBeenCalledWith('test');
  });
});

// ============================================================================
// Tests: Accesibilidad
// ============================================================================

describe('Autocomplete - Accesibilidad', () => {
  it('debe tener aria-invalid cuando strictSelection && !isValidInput', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        strictSelection={true}
      />
    );

    // Act
    const input = screen.getByRole('combobox');
    input.focus();
    await user.paste('texto invalido');

    // Assert
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('debe tener aria-autocomplete según strictSelection', () => {
    // Arrange & Act - Con strictSelection
    const { rerender } = render(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        strictSelection={true}
      />
    );

    // Assert - Con strictSelection debe ser "list"
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');

    // Act - Sin strictSelection
    rerender(
      <Autocomplete
        items={mockItems}
        onSelect={jest.fn()}
        strictSelection={false}
      />
    );

    // Assert - Sin strictSelection debe ser "both"
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'both');
  });
});
