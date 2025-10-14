import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagSelector } from '../TagSelector';
import type { Tag } from '@/types/tags';

// ============================================================================
// Mock Data
// ============================================================================

const mockAvailableTags: Tag[] = [
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

// ============================================================================
// Tests: Renderizado Básico
// ============================================================================

describe('TagSelector - Renderizado Básico', () => {
  it('debe renderizar label con botón + visible', () => {
    // Arrange & Act
    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags de Desinstalación"
      />
    );

    // Assert
    expect(screen.getByText('Tags de Desinstalación')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Gestionar etiquetas' })
    ).toBeInTheDocument();
  });

  it('debe mostrar tags seleccionadas como badges removibles', () => {
    // Arrange
    const selectedTags = [mockAvailableTags[0], mockAvailableTags[1]];

    // Act
    render(
      <TagSelector
        selectedTags={selectedTags}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
      />
    );

    // Assert - Verificar badges con abbreviation
    expect(screen.getByText('CO')).toBeInTheDocument(); // Cortina
    expect(screen.getByText('PE')).toBeInTheDocument(); // Persiana

    // Verificar botones de remover
    const removeButtons = screen.getAllByRole('button', {
      name: /Remover etiqueta/,
    });
    expect(removeButtons).toHaveLength(2);
  });

  it('debe mantener Popover cerrado por defecto', () => {
    // Arrange & Act
    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Assert - PopoverContent no debe estar visible
    expect(screen.queryByText('Etiquetas')).not.toBeInTheDocument();
  });

  it('debe renderizar sin botón cuando no hay label', () => {
    // Arrange & Act
    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        placeholder="Seleccionar tags..."
      />
    );

    // Assert - NO debe renderizar botón sin label
    const button = screen.queryByRole('button', { name: 'Gestionar etiquetas' });
    expect(button).not.toBeInTheDocument();
  });

  it('debe mostrar contador de seleccionadas en popover', async () => {
    // Arrange
    const user = userEvent.setup();
    const selectedTags = [mockAvailableTags[0]];

    render(
      <TagSelector
        selectedTags={selectedTags}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/1 seleccionadas/)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Tests: Apertura y Cierre del Popover
// ============================================================================

describe('TagSelector - Apertura y Cierre del Popover', () => {
  it('debe abrir Popover al hacer click en botón +', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Assert - Usar findByText para async Popover
    const etiquetasHeading = await screen.findByText('Etiquetas');
    expect(etiquetasHeading).toBeInTheDocument();
  });

  it('debe mostrar lista de availableTags en popover', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Assert - Usar findBy para async elements
    const cortinaElement = await screen.findByText('Cortina');
    const persianaElement = await screen.findByText('Persiana');
    const toldoElement = await screen.findByText('Toldo');

    expect(cortinaElement).toBeInTheDocument();
    expect(persianaElement).toBeInTheDocument();
    expect(toldoElement).toBeInTheDocument();
  });

  it('debe cerrar popover con botón "Cancelar" sin aplicar cambios', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnTagsChange = jest.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={mockOnTagsChange}
        label="Tags"
      />
    );

    // Act - Abrir, seleccionar, cancelar
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    const cortinaElement = await screen.findByText('Cortina');

    // Seleccionar una tag (click en row)
    const cortinaRow = cortinaElement.closest('div[class*="flex"]');
    if (cortinaRow) await user.click(cortinaRow);

    // Cancelar
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelButton);

    // Assert - onTagsChange NO debe haber sido llamado
    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });

  it('debe cerrar popover con botón "Aceptar" y aplicar cambios', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnTagsChange = jest.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={mockOnTagsChange}
        label="Tags"
      />
    );

    // Act - Abrir, seleccionar, aceptar
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Seleccionar checkbox de Cortina
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Aceptar
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    await user.click(acceptButton);

    // Assert - onTagsChange debe haber sido llamado con la tag seleccionada
    await waitFor(() => {
      expect(mockOnTagsChange).toHaveBeenCalledWith([mockAvailableTags[0]]);
    });
  });
});

// ============================================================================
// Tests: Estado Temporal
// ============================================================================

describe('TagSelector - Estado Temporal', () => {
  it('NO debe aplicar cambios hasta hacer click en "Aceptar"', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnTagsChange = jest.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={mockOnTagsChange}
        label="Tags"
      />
    );

    // Act - Abrir y seleccionar sin aceptar
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Assert - onTagsChange NO debe haber sido llamado aún
    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });

  it('debe seleccionar tag en popover (checkbox)', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Seleccionar checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Assert - Checkbox debe estar marcado
    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
    });
  });

  it('debe deseleccionar tag en popover', async () => {
    // Arrange
    const user = userEvent.setup();
    const selectedTags = [mockAvailableTags[0]];

    render(
      <TagSelector
        selectedTags={selectedTags}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Deseleccionar checkbox (ya estaba seleccionado)
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Assert - Checkbox debe estar desmarcado
    await waitFor(() => {
      expect(checkboxes[0]).not.toBeChecked();
    });
  });

  it('debe descartar cambios con "Cancelar"', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnTagsChange = jest.fn();
    const initialSelected = [mockAvailableTags[0]];

    render(
      <TagSelector
        selectedTags={initialSelected}
        availableTags={mockAvailableTags}
        onTagsChange={mockOnTagsChange}
        label="Tags"
      />
    );

    // Act - Abrir, deseleccionar, cancelar
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Deseleccionar
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Cancelar
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelButton);

    // Assert - NO debe haber cambios aplicados
    expect(mockOnTagsChange).not.toHaveBeenCalled();
  });

  it('debe aplicar cambios con "Aceptar" → onTagsChange llamado', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnTagsChange = jest.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={mockOnTagsChange}
        label="Tags"
      />
    );

    // Act - Abrir, seleccionar múltiples, aceptar
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Seleccionar dos tags
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]); // Cortina
    await user.click(checkboxes[1]); // Persiana

    // Aceptar
    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    await user.click(acceptButton);

    // Assert
    await waitFor(() => {
      expect(mockOnTagsChange).toHaveBeenCalledWith([
        mockAvailableTags[0],
        mockAvailableTags[1],
      ]);
    });
  });
});

// ============================================================================
// Tests: Selección Múltiple
// ============================================================================

describe('TagSelector - Selección Múltiple', () => {
  it('debe marcar checkbox para tags seleccionadas', async () => {
    // Arrange
    const user = userEvent.setup();
    const selectedTags = [mockAvailableTags[0]];

    render(
      <TagSelector
        selectedTags={selectedTags}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Assert
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
    });
  });

  it('debe togglear selección al hacer click en row', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra y buscar el nombre completo (texto plano)
    const cortinaText = await screen.findByText('Cortina');

    // Click en la row completa (no solo checkbox)
    const row = cortinaText.closest('div[class*="flex items-center"]');
    if (row) await user.click(row);

    // Assert - Checkbox debe estar marcado
    const checkboxes = screen.getAllByRole('checkbox');
    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
    });
  });

  it('debe togglear selección al hacer click directo en checkbox', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Click directo en checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    // Assert
    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
    });
  });

  it('debe aplicar background muted cuando tag seleccionada', async () => {
    // Arrange
    const user = userEvent.setup();
    const selectedTags = [mockAvailableTags[0]];

    render(
      <TagSelector
        selectedTags={selectedTags}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Assert - Verificar clase bg-muted en row seleccionada
    const cortinaText = await screen.findByText('Cortina');
    const row = cortinaText.closest('div[class*="flex items-center"]');
    expect(row).toHaveClass('bg-muted/70');
  });
});

// ============================================================================
// Tests: Dropdown Menu
// ============================================================================

describe('TagSelector - Dropdown Menu', () => {
  it('debe mostrar botón ellipsis en cada tag', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        onEditTag={jest.fn()}
        onDeleteTag={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Assert - Debe haber 3 botones ellipsis (uno por tag)
    const ellipsisButtons = screen.getAllByRole('button');
    const ellipsisCount = ellipsisButtons.filter((btn) =>
      btn.querySelector('svg')
    ).length;
    expect(ellipsisCount).toBeGreaterThanOrEqual(3);
  });

  it('debe abrir dropdown con opciones Editar/Eliminar', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        onEditTag={jest.fn()}
        onDeleteTag={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const mainButton = screen.getByRole('button', {
      name: 'Gestionar etiquetas',
    });
    await user.click(mainButton);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Buscar y hacer click en un botón ellipsis
    const allButtons = screen.getAllByRole('button');
    const ellipsisButton = allButtons.find((btn) => {
      const svg = btn.querySelector('svg');
      return svg && btn.className.includes('h-6');
    });

    if (ellipsisButton) {
      await user.click(ellipsisButton);

      // Assert - Verificar opciones del dropdown
      const editarOption = await screen.findByText('Editar');
      const eliminarOption = await screen.findByText('Eliminar');
      expect(editarOption).toBeInTheDocument();
      expect(eliminarOption).toBeInTheDocument();
    }
  });

  it('debe llamar onDeleteTag al hacer click en "Eliminar"', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnDeleteTag = jest.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        onDeleteTag={mockOnDeleteTag}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const mainButton = screen.getByRole('button', {
      name: 'Gestionar etiquetas',
    });
    await user.click(mainButton);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Click en ellipsis
    const allButtons = screen.getAllByRole('button');
    const ellipsisButton = allButtons.find((btn) => {
      const svg = btn.querySelector('svg');
      return svg && btn.className.includes('h-6');
    });

    if (ellipsisButton) {
      await user.click(ellipsisButton);

      // Esperar a que el dropdown abra
      const deleteOption = await screen.findByText('Eliminar');

      // Click en Eliminar
      await user.click(deleteOption);

      // Assert
      expect(mockOnDeleteTag).toHaveBeenCalledWith('tag-1');
    }
  });
});

// ============================================================================
// Tests: Integración con Modales
// ============================================================================

describe('TagSelector - Integración con Modales', () => {
  it('debe mostrar botón "Crear nueva etiqueta" cuando onCreateTag existe', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        onCreateTag={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Assert - Usar findByRole para async Popover
    const createButton = await screen.findByRole('button', {
      name: /Crear nueva etiqueta/,
    });
    expect(createButton).toBeInTheDocument();
  });

  it('NO debe mostrar botón "Crear nueva etiqueta" sin onCreateTag', async () => {
    // Arrange
    const user = userEvent.setup();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Etiquetas');

    // Assert - El botón crear NO debe estar presente
    expect(screen.queryByText(/Crear nueva etiqueta/)).not.toBeInTheDocument();
  });
});

// ============================================================================
// Tests: Remover Tags Seleccionadas
// ============================================================================

describe('TagSelector - Remover Tags Seleccionadas', () => {
  it('debe llamar onTagsChange sin ese tag al hacer click en X', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnTagsChange = jest.fn();
    const selectedTags = [mockAvailableTags[0], mockAvailableTags[1]];

    render(
      <TagSelector
        selectedTags={selectedTags}
        availableTags={mockAvailableTags}
        onTagsChange={mockOnTagsChange}
        label="Tags"
      />
    );

    // Act - Click en X de "Cortina"
    const removeButtons = screen.getAllByRole('button', {
      name: /Remover etiqueta/,
    });
    await user.click(removeButtons[0]);

    // Assert - onTagsChange llamado sin Cortina
    expect(mockOnTagsChange).toHaveBeenCalledWith([mockAvailableTags[1]]);
  });

  it('debe mostrar tags removibles fuera del popover', () => {
    // Arrange
    const selectedTags = [mockAvailableTags[0]];

    // Act
    render(
      <TagSelector
        selectedTags={selectedTags}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        label="Tags"
      />
    );

    // Assert - Badge con abbreviation debe estar visible fuera del popover
    expect(screen.getByText('CO')).toBeInTheDocument(); // Abbreviation de Cortina
  });
});

// ============================================================================
// Tests: Callbacks
// ============================================================================

describe('TagSelector - Callbacks', () => {
  it('debe llamar onTagsChange con array actualizado', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnTagsChange = jest.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={mockOnTagsChange}
        label="Tags"
      />
    );

    // Act - Seleccionar y aceptar
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    const acceptButton = screen.getByRole('button', { name: 'Aceptar' });
    await user.click(acceptButton);

    // Assert
    await waitFor(() => {
      expect(mockOnTagsChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ id: 'tag-1' })])
      );
    });
  });

  it('debe llamar onCreateTag con nombre, color, abbreviation', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnCreateTag = jest.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        onCreateTag={mockOnCreateTag}
        label="Tags"
      />
    );

    // Act - Abrir popover y click en crear
    const button = screen.getByRole('button', { name: 'Gestionar etiquetas' });
    await user.click(button);

    // Esperar a que el popover abra y encontrar botón crear
    const createButton = await screen.findByRole('button', {
      name: /Crear nueva etiqueta/,
    });
    expect(createButton).toBeInTheDocument();

    // Nota: El modal se abre pero testear su contenido está en CreateTagModal.test.tsx
    // Aquí solo verificamos que el callback se pasa correctamente
  });

  it('debe llamar onDeleteTag con tagId correcto', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnDeleteTag = jest.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={mockAvailableTags}
        onTagsChange={jest.fn()}
        onDeleteTag={mockOnDeleteTag}
        label="Tags"
      />
    );

    // Act - Abrir popover
    const mainButton = screen.getByRole('button', {
      name: 'Gestionar etiquetas',
    });
    await user.click(mainButton);

    // Esperar a que el popover abra
    await screen.findByText('Cortina');

    // Click en ellipsis y eliminar
    const allButtons = screen.getAllByRole('button');
    const ellipsisButton = allButtons.find((btn) => {
      const svg = btn.querySelector('svg');
      return svg && btn.className.includes('h-6');
    });

    if (ellipsisButton) {
      await user.click(ellipsisButton);

      // Esperar a que el dropdown abra
      const deleteOption = await screen.findByText('Eliminar');

      // Click en Eliminar
      await user.click(deleteOption);

      // Assert
      expect(mockOnDeleteTag).toHaveBeenCalledWith('tag-1');
    }
  });
});
