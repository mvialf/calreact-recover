import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTagModal } from '../CreateTagModal';
import type { Tag, TagColor } from '@/types/tags';

// ============================================================================
// Mock Data
// ============================================================================

const mockExistingTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'Cortina',
    color: 'sky',
    abbreviation: 'CO',
  },
  {
    id: 'tag-2',
    name: 'Persiana',
    color: 'complete',
    abbreviation: 'PE',
  },
];

// ============================================================================
// Tests: Renderizado y Apertura
// ============================================================================

describe('CreateTagModal - Renderizado y Apertura', () => {
  it('debe tener DialogDescription para accesibilidad', () => {
    // Arrange & Act
    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Assert - Verificar que existe DialogDescription
    expect(
      screen.getByText(/Ingresa un nombre y selecciona un color/)
    ).toBeInTheDocument();
  });

  it('debe renderizar con campos vacíos al abrir', () => {
    // Arrange & Act
    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Assert
    const nameInput = screen.getByLabelText('Nombre');
    const abbrevInput = screen.getByLabelText(/Abreviatura/);

    expect(nameInput).toHaveValue('');
    expect(abbrevInput).toHaveValue('');
  });

  it('debe deshabilitar botón "Crear etiqueta" sin nombre', () => {
    // Arrange & Act
    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Assert
    const createButton = screen.getByRole('button', { name: /Crear etiqueta/ });
    expect(createButton).toBeDisabled();
  });

  it('debe mostrar preview con "Nueva etiqueta" por defecto', () => {
    // Arrange & Act
    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Assert - Verificar texto en sección Vista previa
    expect(screen.getByText('Vista previa')).toBeInTheDocument();
    expect(screen.getByText('Nueva etiqueta')).toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Validación
// ============================================================================

describe('CreateTagModal - Validación', () => {
  it('debe mostrar error cuando intenta crear sin nombre', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Act - Escribir espacio y borrar para activar validación
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, ' ');
    await user.clear(nameInput);

    // Intentar avanzar (blur simulará validación)
    nameInput.blur();

    // Assert - Botón debe estar deshabilitado cuando no hay nombre
    const createButton = screen.getByRole('button', { name: /Crear etiqueta/ });
    expect(createButton).toBeDisabled();
  });

  it('debe mostrar error cuando nombre duplicado (case-insensitive)', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={mockExistingTags}
      />
    );

    // Act - Escribir nombre duplicado con diferente case
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'cortina');

    // Assert
    expect(
      screen.getByText('Ya existe una etiqueta con este nombre')
    ).toBeInTheDocument();
  });

  it('debe limpiar error al escribir nombre válido', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={mockExistingTags}
      />
    );

    // Act - Primero nombre duplicado, luego válido
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Cortina');

    // Verificar error
    expect(
      screen.getByText('Ya existe una etiqueta con este nombre')
    ).toBeInTheDocument();

    // Cambiar a nombre válido
    await user.clear(nameInput);
    await user.type(nameInput, 'Toldo');

    // Assert - Error debe desaparecer
    expect(
      screen.queryByText('Ya existe una etiqueta con este nombre')
    ).not.toBeInTheDocument();
  });

  it('debe auto-generar abreviatura (primeras 2 letras uppercase)', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Act - Escribir nombre sin abreviatura
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Toldo');

    // Assert - Preview debe mostrar "TO" como abreviatura
    await waitFor(() => {
      expect(screen.getByText('TO')).toBeInTheDocument();
    });
  });

  it('debe limitar abreviatura a 2 caracteres uppercase', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Act - Intentar escribir 5 caracteres en abreviatura
    const abbrevInput = screen.getByLabelText(/Abreviatura/);
    await user.type(abbrevInput, 'abcde');

    // Assert - Solo debe tener 2 caracteres en uppercase
    expect(abbrevInput).toHaveValue('AB');
  });
});

// ============================================================================
// Tests: Interacción de Usuario
// ============================================================================

describe('CreateTagModal - Interacción de Usuario', () => {
  it('debe crear tag al hacer click en botón "Crear etiqueta"', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnCreateTag = jest.fn();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={mockOnCreateTag}
        existingTags={[]}
      />
    );

    // Act
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Toldo');

    const createButton = screen.getByRole('button', { name: /Crear etiqueta/ });
    await user.click(createButton);

    // Assert
    expect(mockOnCreateTag).toHaveBeenCalledWith('Toldo', 'primary', 'TO');
  });

  it('debe crear tag con Enter (keyboard)', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnCreateTag = jest.fn();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={mockOnCreateTag}
        existingTags={[]}
      />
    );

    // Act
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Toldo');
    await user.keyboard('{Enter}');

    // Assert
    expect(mockOnCreateTag).toHaveBeenCalledWith('Toldo', 'primary', 'TO');
  });

  it('debe cerrar modal después de crear (sin createAnother)', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Act
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Toldo');

    const createButton = screen.getByRole('button', { name: /Crear etiqueta/ });
    await user.click(createButton);

    // Assert
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('debe mantener abierto y limpiar campos (con createAnother)', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();
    const mockOnCreateTag = jest.fn();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onCreateTag={mockOnCreateTag}
        existingTags={[]}
      />
    );

    // Act - Activar checkbox "Crear otra"
    const checkbox = screen.getByRole('checkbox', {
      name: /Crear otra etiqueta después de esta/,
    });
    await user.click(checkbox);

    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Toldo');

    const createButton = screen.getByRole('button', { name: /Crear etiqueta/ });
    await user.click(createButton);

    // Assert - Modal NO debe cerrarse
    await waitFor(() => {
      expect(mockOnCreateTag).toHaveBeenCalled();
    });

    // Verificar que el input se limpió
    await waitFor(() => {
      expect(nameInput).toHaveValue('');
    });

    // Modal NO cerrado
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('debe cambiar color y actualizar preview en tiempo real', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Act - Escribir nombre
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Test');

    // Cambiar a color 'sky' (segundo botón en la grilla)
    const colorButtons = screen.getAllByRole('button', { name: /Azul Cielo/ });
    await user.click(colorButtons[0]);

    // Assert - Preview debe tener el nuevo color (verificar visualmente en badge)
    // El badge con "Test" debe existir en la vista previa
    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('debe permitir editar abreviatura manualmente', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnCreateTag = jest.fn();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={mockOnCreateTag}
        existingTags={[]}
      />
    );

    // Act
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Toldo');

    const abbrevInput = screen.getByLabelText(/Abreviatura/);
    await user.clear(abbrevInput);
    await user.type(abbrevInput, 'TL');

    const createButton = screen.getByRole('button', { name: /Crear etiqueta/ });
    await user.click(createButton);

    // Assert - Debe usar abreviatura manual
    expect(mockOnCreateTag).toHaveBeenCalledWith('Toldo', 'primary', 'TL');
  });
});

// ============================================================================
// Tests: Callbacks
// ============================================================================

describe('CreateTagModal - Callbacks', () => {
  it('debe llamar onCreateTag con datos correctos', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnCreateTag = jest.fn();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={mockOnCreateTag}
        existingTags={[]}
      />
    );

    // Act
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Nueva Tag');

    // Seleccionar color 'complete' (verde)
    const colorButtons = screen.getAllByRole('button', { name: /Verde/ });
    await user.click(colorButtons[0]);

    const createButton = screen.getByRole('button', { name: /Crear etiqueta/ });
    await user.click(createButton);

    // Assert
    expect(mockOnCreateTag).toHaveBeenCalledWith('Nueva Tag', 'complete', 'NU');
    expect(mockOnCreateTag).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onOpenChange al hacer click en Cancelar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Act
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelButton);

    // Assert
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('debe mostrar estado isCreating durante operación async', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnCreateTag = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={mockOnCreateTag}
        existingTags={[]}
      />
    );

    // Act
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Test');

    const createButton = screen.getByRole('button', { name: /Crear etiqueta/ });
    await user.click(createButton);

    // Assert - Verificar estado loading
    await waitFor(() => {
      expect(screen.getByText(/Creando.../)).toBeInTheDocument();
    });

    // Esperar a que termine
    await waitFor(
      () => {
        expect(screen.queryByText(/Creando.../)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});

// ============================================================================
// Tests: Limpieza de Estado
// ============================================================================

describe('CreateTagModal - Limpieza de Estado', () => {
  it('debe limpiar campos al cerrar modal', async () => {
    // Arrange
    const user = userEvent.setup();

    const { rerender } = render(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Act - Escribir datos
    const nameInput = screen.getByLabelText('Nombre');
    await user.type(nameInput, 'Test Tag');

    // Cerrar modal
    rerender(
      <CreateTagModal
        isOpen={false}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Reabrir modal
    rerender(
      <CreateTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onCreateTag={jest.fn()}
        existingTags={[]}
      />
    );

    // Assert - Campos deben estar vacíos
    const nameInputAfter = screen.getByLabelText('Nombre');
    expect(nameInputAfter).toHaveValue('');
  });
});
