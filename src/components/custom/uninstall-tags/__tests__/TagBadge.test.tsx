import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagBadge } from '../TagBadge';
import type { Tag, TagColor } from '@/types/tags';
import { TAG_COLORS } from '../colors';

// ============================================================================
// Mock Data
// ============================================================================

const createMockTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 'test-tag-1',
  name: 'Test Tag',
  color: 'primary',
  abbreviation: 'TT',
  ...overrides,
});

// ============================================================================
// Tests: Renderizado Básico
// ============================================================================

describe('TagBadge - Renderizado Básico', () => {
  it('debe renderizar con nombre completo cuando no hay abbreviation', () => {
    // Arrange
    const tag = createMockTag({ abbreviation: undefined });

    // Act
    render(<TagBadge tag={tag} />);

    // Assert
    expect(screen.getByText('Test Tag')).toBeInTheDocument();
  });

  it('debe renderizar con abbreviation cuando existe', () => {
    // Arrange
    const tag = createMockTag({ abbreviation: 'TT' });

    // Act
    render(<TagBadge tag={tag} />);

    // Assert
    expect(screen.getByText('TT')).toBeInTheDocument();
  });

  it('debe renderizar con diferentes colores', () => {
    // Arrange
    const colors: TagColor[] = ['yellow', 'sky', 'orange', 'complete', 'purple'];

    colors.forEach((color) => {
      const tag = createMockTag({ color, name: 'Test Tag', abbreviation: 'TT' });
      const { unmount } = render(<TagBadge tag={tag} />);

      // Assert - Verificar que el badge se renderiza (con abbreviation)
      expect(screen.getByText('TT')).toBeInTheDocument();

      // Cleanup para siguiente iteración
      unmount();
    });
  });

  it('debe truncar nombres largos con max-w-[120px]', () => {
    // Arrange
    const longName = 'Este es un nombre muy largo que debería truncarse';
    const tag = createMockTag({ name: longName, abbreviation: undefined });

    // Act
    render(<TagBadge tag={tag} />);

    // Assert - Verificar clase truncate
    const textElement = screen.getByText(longName);
    expect(textElement).toHaveClass('truncate');
    expect(textElement).toHaveClass('max-w-[120px]');
  });

  it('debe mostrar title attribute para hover', () => {
    // Arrange
    const tag = createMockTag({ name: 'Cortina', abbreviation: 'CO' });

    // Act
    render(<TagBadge tag={tag} />);

    // Assert - Verificar title en span (badge muestra abbreviation)
    const textElement = screen.getByText('CO');
    expect(textElement).toHaveAttribute('title', 'Cortina');
  });
});

// ============================================================================
// Tests: Props Removable
// ============================================================================

describe('TagBadge - Props Removable', () => {
  it('debe mostrar botón X cuando removable=true', () => {
    // Arrange
    const tag = createMockTag();

    // Act
    render(<TagBadge tag={tag} removable={true} onRemove={jest.fn()} />);

    // Assert - Buscar botón con aria-label
    const removeButton = screen.getByRole('button', {
      name: `Remover etiqueta ${tag.name}`,
    });
    expect(removeButton).toBeInTheDocument();
  });

  it('NO debe mostrar botón X cuando removable=false', () => {
    // Arrange
    const tag = createMockTag();

    // Act
    render(<TagBadge tag={tag} removable={false} />);

    // Assert - No debe existir botón
    const removeButton = screen.queryByRole('button', {
      name: `Remover etiqueta ${tag.name}`,
    });
    expect(removeButton).not.toBeInTheDocument();
  });

  it('debe llamar onRemove con tagId correcto al hacer click en X', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnRemove = jest.fn();
    const tag = createMockTag({ id: 'tag-123' });

    // Act
    render(<TagBadge tag={tag} removable={true} onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', {
      name: `Remover etiqueta ${tag.name}`,
    });
    await user.click(removeButton);

    // Assert
    expect(mockOnRemove).toHaveBeenCalledWith('tag-123');
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('debe prevenir propagación de evento al hacer click en botón remover', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockOnRemove = jest.fn();
    const mockOnClick = jest.fn();
    const tag = createMockTag();

    // Act
    render(
      <div onClick={mockOnClick}>
        <TagBadge tag={tag} removable={true} onRemove={mockOnRemove} />
      </div>
    );

    const removeButton = screen.getByRole('button', {
      name: `Remover etiqueta ${tag.name}`,
    });
    await user.click(removeButton);

    // Assert - onRemove llamado pero NO el onClick del padre
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnClick).not.toHaveBeenCalled();
  });
});

// ============================================================================
// Tests: Colores Hex Directos
// ============================================================================

describe('TagBadge - Colores Hex', () => {
  it('debe aplicar colores hex usando style attribute', () => {
    // Arrange
    const tag = createMockTag({ color: 'sky' });

    // Act
    const { container } = render(<TagBadge tag={tag} />);

    // Assert - Verificar que se aplicaron los estilos inline con valores hex (sin borde)
    const badge = container.querySelector('.inline-flex') as HTMLElement;
    expect(badge.style.backgroundColor).toBe(TAG_COLORS.sky.bg);
    expect(badge.style.color).toBe(TAG_COLORS.sky.text);
  });

  it('debe aplicar colores para todos los TagColor disponibles', () => {
    // Arrange
    const colors: TagColor[] = ['yellow', 'sky', 'orange', 'complete', 'purple', 'primary', 'secondary', 'destructive'];

    colors.forEach((color) => {
      const tag = createMockTag({ color, abbreviation: 'XX' });
      const { container, unmount } = render(<TagBadge tag={tag} />);

      // Assert - Verificar estilos inline para cada color (sin borde)
      const badge = container.querySelector('.inline-flex') as HTMLElement;
      expect(badge.style.backgroundColor).toBe(TAG_COLORS[color].bg);
      expect(badge.style.color).toBe(TAG_COLORS[color].text);

      // Cleanup
      unmount();
    });
  });
});

// ============================================================================
// Tests: Accesibilidad
// ============================================================================

describe('TagBadge - Accesibilidad', () => {
  it('debe tener aria-label correcto en botón de remover', () => {
    // Arrange
    const tag = createMockTag({ name: 'Cortina' });

    // Act
    render(<TagBadge tag={tag} removable={true} onRemove={jest.fn()} />);

    // Assert
    const removeButton = screen.getByRole('button', {
      name: 'Remover etiqueta Cortina',
    });
    expect(removeButton).toHaveAttribute(
      'aria-label',
      'Remover etiqueta Cortina'
    );
  });

  it('debe tener focus ring visible para navegación por teclado', () => {
    // Arrange
    const tag = createMockTag();

    // Act
    const { container } = render(
      <TagBadge tag={tag} removable={true} onRemove={jest.fn()} />
    );

    // Assert - Verificar clases de focus ring
    const badge = container.querySelector('.inline-flex');
    expect(badge).toHaveClass('focus:outline-none');
    expect(badge).toHaveClass('focus:ring-2');
    expect(badge).toHaveClass('focus:ring-ring');
    expect(badge).toHaveClass('focus:ring-offset-2');
  });

  it('debe ser accesible con forwardRef', () => {
    // Arrange
    const tag = createMockTag();
    const ref = jest.fn();

    // Act
    render(<TagBadge tag={tag} ref={ref as any} />);

    // Assert - Verificar que el ref fue llamado
    expect(ref).toHaveBeenCalled();
  });
});

// ============================================================================
// Tests: Integración y Edge Cases
// ============================================================================

describe('TagBadge - Edge Cases', () => {
  it('debe manejar nombres vacíos correctamente', () => {
    // Arrange
    const tag = createMockTag({ name: '', abbreviation: undefined });

    // Act
    render(<TagBadge tag={tag} />);

    // Assert - Debe renderizar span vacío
    const textElement = screen.getByTitle('');
    expect(textElement).toHaveTextContent('');
  });

  it('debe aplicar className personalizado', () => {
    // Arrange
    const tag = createMockTag();
    const customClass = 'custom-badge-class';

    // Act
    const { container } = render(
      <TagBadge tag={tag} className={customClass} />
    );

    // Assert
    const badge = container.querySelector('.inline-flex');
    expect(badge).toHaveClass(customClass);
  });

  it('debe pasar props adicionales al div contenedor', () => {
    // Arrange
    const tag = createMockTag();

    // Act
    const { container } = render(
      <TagBadge tag={tag} data-testid="custom-badge" />
    );

    // Assert
    const badge = container.querySelector('[data-testid="custom-badge"]');
    expect(badge).toBeInTheDocument();
  });
});
