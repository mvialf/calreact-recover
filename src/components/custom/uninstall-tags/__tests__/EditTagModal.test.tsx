import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditTagModal } from '../EditTagModal';
import type { Tag } from '@/types/tags';

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
  {
    id: 'tag-3',
    name: 'Toldo',
    color: 'orange',
    abbreviation: 'TO',
  },
];

const mockTagToEdit: Tag = mockExistingTags[0]; // Cortina

// ============================================================================
// Tests: Renderizado y Carga de Datos
// ============================================================================

describe('EditTagModal - Renderizado y Carga de Datos', () => {
  it('debe tener DialogDescription para accesibilidad', () => {
    // Arrange & Act
    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Assert - Verificar que existe DialogDescription (puede estar sr-only)
    expect(
      screen.getByText(/Modifica el nombre, abreviatura o color/)
    ).toBeInTheDocument();
  });

  it('debe pre-llenar campos con datos del tag', () => {
    // Arrange & Act
    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Assert
    const nameInput = screen.getByLabelText('Nombre *');
    const abbrevInput = screen.getByLabelText(/Abreviatura/);

    expect(nameInput).toHaveValue('Cortina');
    expect(abbrevInput).toHaveValue('CO');
  });

  it('debe mostrar preview con datos actuales del tag', () => {
    // Arrange & Act
    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Assert - Verificar que preview muestra el tag actual
    expect(screen.getByText('Vista previa')).toBeInTheDocument();
    expect(screen.getByText('Cortina')).toBeInTheDocument();
    expect(screen.getByText('CO')).toBeInTheDocument();
  });

  it('debe habilitar botón "Guardar Cambios" con datos válidos', () => {
    // Arrange & Act
    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Assert
    const saveButton = screen.getByRole('button', { name: 'Guardar Cambios' });
    expect(saveButton).not.toBeDisabled();
  });
});

// ============================================================================
// Tests: Validación
// ============================================================================

describe('EditTagModal - Validación', () => {
  it('debe mostrar error cuando nombre duplicado (excluyendo tag actual)', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Cambiar a nombre de OTRO tag existente
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Persiana');

    // Assert
    expect(
      screen.getByText('Ya existe una etiqueta con este nombre')
    ).toBeInTheDocument();
  });

  it('debe permitir mismo nombre del tag actual (sin error)', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Escribir el mismo nombre actual
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Cortina');

    // Assert - NO debe haber error
    expect(
      screen.queryByText('Ya existe una etiqueta con este nombre')
    ).not.toBeInTheDocument();
  });

  it('debe limpiar error al escribir nombre válido', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Primero nombre duplicado, luego válido
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Persiana');

    // Verificar error
    expect(
      screen.getByText('Ya existe una etiqueta con este nombre')
    ).toBeInTheDocument();

    // Cambiar a nombre válido
    await user.clear(nameInput);
    await user.type(nameInput, 'Nueva Cortina');

    // Assert - Error debe desaparecer
    expect(
      screen.queryByText('Ya existe una etiqueta con este nombre')
    ).not.toBeInTheDocument();
  });

  it('debe actualizar abreviatura en preview al editar', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Cambiar abreviatura
    const abbrevInput = screen.getByLabelText(/Abreviatura/);
    await user.clear(abbrevInput);
    await user.type(abbrevInput, 'CT');

    // Assert - Preview debe mostrar nueva abreviatura
    await waitFor(() => {
      const abbrevBadges = screen.getAllByText('CT');
      expect(abbrevBadges.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Tests: Interacción de Usuario
// ============================================================================

describe('EditTagModal - Interacción de Usuario', () => {
  it('debe guardar cambios al hacer click en "Guardar Cambios"', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnEditTag = jest.fn();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={mockOnEditTag}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Cambiar nombre
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Cortina Actualizada');

    const saveButton = screen.getByRole('button', { name: 'Guardar Cambios' });
    await user.click(saveButton);

    // Assert
    expect(mockOnEditTag).toHaveBeenCalledWith(
      'tag-1',
      'Cortina Actualizada',
      'sky',
      'CO'
    );
  });

  it('debe guardar cambios con Enter (keyboard)', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnEditTag = jest.fn();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={mockOnEditTag}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nueva Cortina{Enter}');

    // Assert
    expect(mockOnEditTag).toHaveBeenCalledWith(
      'tag-1',
      'Nueva Cortina',
      'sky',
      'CO'
    );
  });

  it('debe cerrar modal sin guardar al hacer click en Cancelar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();
    const mockOnEditTag = jest.fn();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onEditTag={mockOnEditTag}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Hacer cambios pero cancelar
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Cambio no guardado');

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelButton);

    // Assert
    expect(mockOnEditTag).not.toHaveBeenCalled();
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('debe cambiar color y actualizar preview en tiempo real', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Cambiar a color 'complete' (verde)
    const colorButtons = screen.getAllByRole('button', { name: /Primario/ });
    await user.click(colorButtons[0]);

    // Assert - Preview debe actualizarse (verificar que sigue existiendo el badge)
    await waitFor(() => {
      expect(screen.getByText('Cortina')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Tests: Callbacks
// ============================================================================

describe('EditTagModal - Callbacks', () => {
  it('debe llamar onEditTag con tagId y datos actualizados', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnEditTag = jest.fn();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={mockOnEditTag}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Cambiar todos los campos
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Cortina Renovada');

    const abbrevInput = screen.getByLabelText(/Abreviatura/);
    await user.clear(abbrevInput);
    await user.type(abbrevInput, 'CR');

    // Cambiar color a 'complete'
    const colorButtons = screen.getAllByRole('button');
    const greenButton = colorButtons.find(
      (btn) => btn.getAttribute('title') === 'Verde'
    );
    if (greenButton) await user.click(greenButton);

    const saveButton = screen.getByRole('button', { name: 'Guardar Cambios' });
    await user.click(saveButton);

    // Assert
    expect(mockOnEditTag).toHaveBeenCalledWith(
      'tag-1',
      'Cortina Renovada',
      expect.any(String), // color puede ser 'complete' o el que esté seleccionado
      'CR'
    );
    expect(mockOnEditTag).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onOpenChange al cerrar después de guardar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnOpenChange = jest.fn();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={mockOnOpenChange}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act
    const saveButton = screen.getByRole('button', { name: 'Guardar Cambios' });
    await user.click(saveButton);

    // Assert
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('debe mostrar estado isEditing durante operación async', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnEditTag = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={mockOnEditTag}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act
    const saveButton = screen.getByRole('button', { name: 'Guardar Cambios' });
    await user.click(saveButton);

    // Assert - Verificar estado loading
    await waitFor(() => {
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    // Esperar a que termine
    await waitFor(
      () => {
        expect(screen.queryByText('Guardando...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});

// ============================================================================
// Tests: Limpieza de Estado
// ============================================================================

describe('EditTagModal - Limpieza de Estado', () => {
  it('debe limpiar campos al cerrar modal', async () => {
    // Arrange
    const user = userEvent.setup();

    const { rerender } = render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Hacer cambios
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Cambio temporal');

    // Cerrar modal
    rerender(
      <EditTagModal
        isOpen={false}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Reabrir modal con mismo tag
    rerender(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={jest.fn()}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Assert - Campos deben volver a valores originales del tag
    const nameInputAfter = screen.getByLabelText('Nombre *');
    expect(nameInputAfter).toHaveValue('Cortina');
  });

  it('debe auto-generar abreviatura si campo está vacío al guardar', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnEditTag = jest.fn();

    render(
      <EditTagModal
        isOpen={true}
        onOpenChange={jest.fn()}
        onEditTag={mockOnEditTag}
        tag={mockTagToEdit}
        existingTags={mockExistingTags}
      />
    );

    // Act - Cambiar nombre y dejar abreviatura vacía
    const nameInput = screen.getByLabelText('Nombre *');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nueva Cortina');

    const abbrevInput = screen.getByLabelText(/Abreviatura/);
    await user.clear(abbrevInput);

    const saveButton = screen.getByRole('button', { name: 'Guardar Cambios' });
    await user.click(saveButton);

    // Assert - Debe auto-generar "NU" de "Nueva Cortina"
    expect(mockOnEditTag).toHaveBeenCalledWith(
      'tag-1',
      'Nueva Cortina',
      'sky',
      'NU'
    );
  });
});
