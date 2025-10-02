import { render, screen } from '@testing-library/react';
import { LoadingButton } from '../LoadingButton';

describe('LoadingButton', () => {
  it('debe renderizar children cuando no está cargando', () => {
    // Arrange & Act
    render(<LoadingButton>Guardar Evento</LoadingButton>);

    // Assert
    expect(screen.getByRole('button', { name: /guardar evento/i })).toBeInTheDocument();
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('debe mostrar spinner cuando isLoading=true', () => {
    // Arrange & Act
    render(<LoadingButton isLoading>Guardar</LoadingButton>);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('debe mostrar loadingText cuando se proporciona', () => {
    // Arrange & Act
    render(
      <LoadingButton isLoading loadingText="Guardando evento...">
        Guardar
      </LoadingButton>
    );

    // Assert
    expect(screen.getByText(/guardando evento.../i)).toBeInTheDocument();
    expect(screen.queryByText(/^guardar$/i)).not.toBeInTheDocument();
  });

  it('debe estar deshabilitado cuando isLoading=true', () => {
    // Arrange & Act
    render(<LoadingButton isLoading>Guardar</LoadingButton>);

    // Assert
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('debe estar deshabilitado cuando disabled=true', () => {
    // Arrange & Act
    render(<LoadingButton disabled>Guardar</LoadingButton>);

    // Assert
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('debe estar deshabilitado cuando ambos isLoading y disabled son true', () => {
    // Arrange & Act
    render(
      <LoadingButton isLoading disabled>
        Guardar
      </LoadingButton>
    );

    // Assert
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('debe pasar props adicionales al Button', () => {
    // Arrange & Act
    render(
      <LoadingButton variant="destructive" size="lg" data-testid="custom-button">
        Eliminar
      </LoadingButton>
    );

    // Assert
    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-destructive'); // Shadcn genera bg-destructive para variant="destructive"
  });

  it('debe mantener children visibles cuando isLoading=true sin loadingText', () => {
    // Arrange & Act
    render(<LoadingButton isLoading>Guardar Evento</LoadingButton>);

    // Assert
    expect(screen.getByText(/guardar evento/i)).toBeInTheDocument();
  });

  it('debe aplicar className personalizado', () => {
    // Arrange & Act
    render(<LoadingButton className="custom-class">Guardar</LoadingButton>);

    // Assert
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('debe renderizar spinner con clases correctas', () => {
    // Arrange & Act
    render(<LoadingButton isLoading>Guardar</LoadingButton>);

    // Assert
    const spinner = screen.getByRole('button').querySelector('svg');
    expect(spinner).toHaveClass('mr-2');
    expect(spinner).toHaveClass('h-4');
    expect(spinner).toHaveClass('w-4');
    expect(spinner).toHaveClass('animate-spin');
  });
});
