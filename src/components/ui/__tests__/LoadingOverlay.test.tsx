import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  describe('Visibilidad', () => {
    it('debe renderizar cuando visible es true', () => {
      render(<LoadingOverlay visible={true} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('no debe renderizar cuando visible es false', () => {
      render(<LoadingOverlay visible={false} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('debe mostrar spinner cuando está visible', () => {
      const { container } = render(<LoadingOverlay visible={true} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Mensajes', () => {
    it('debe mostrar mensaje por defecto', () => {
      render(<LoadingOverlay visible={true} />);

      const messages = screen.getAllByText('Cargando...');
      expect(messages[0]).toBeInTheDocument();
    });

    it('debe mostrar mensaje personalizado', () => {
      render(<LoadingOverlay visible={true} message="Guardando datos..." />);

      const messages = screen.getAllByText('Guardando datos...');
      expect(messages[0]).toBeInTheDocument();
    });

    it('debe tener mensaje en screen reader', () => {
      render(<LoadingOverlay visible={true} message="Processing" />);

      const srText = screen.getAllByText('Processing');
      expect(srText).toHaveLength(2); // Visible + sr-only
    });
  });

  describe('Opacidad', () => {
    it('debe aplicar opacidad light correctamente', () => {
      const { container } = render(
        <LoadingOverlay visible={true} opacity="light" />
      );

      const overlay = container.querySelector('.bg-background\\/60');
      expect(overlay).toBeInTheDocument();
    });

    it('debe aplicar opacidad medium correctamente (default)', () => {
      const { container } = render(<LoadingOverlay visible={true} />);

      const overlay = container.querySelector('.bg-background\\/80');
      expect(overlay).toBeInTheDocument();
    });

    it('debe aplicar opacidad dark correctamente', () => {
      const { container } = render(
        <LoadingOverlay visible={true} opacity="dark" />
      );

      const overlay = container.querySelector('.bg-background\\/90');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Tamaños de spinner', () => {
    it('debe aplicar tamaño sm correctamente', () => {
      const { container } = render(
        <LoadingOverlay visible={true} spinnerSize="sm" />
      );

      const spinner = container.querySelector('.h-6.w-6');
      expect(spinner).toBeInTheDocument();
    });

    it('debe aplicar tamaño md correctamente (default)', () => {
      const { container } = render(<LoadingOverlay visible={true} />);

      const spinner = container.querySelector('.h-8.w-8');
      expect(spinner).toBeInTheDocument();
    });

    it('debe aplicar tamaño lg correctamente', () => {
      const { container } = render(
        <LoadingOverlay visible={true} spinnerSize="lg" />
      );

      const spinner = container.querySelector('.h-12.w-12');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener role="status"', () => {
      render(<LoadingOverlay visible={true} />);

      const overlay = screen.getByRole('status');
      expect(overlay).toBeInTheDocument();
    });

    it('debe tener aria-live="polite"', () => {
      render(<LoadingOverlay visible={true} />);

      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute('aria-live', 'polite');
    });

    it('debe tener aria-busy="true"', () => {
      render(<LoadingOverlay visible={true} />);

      const overlay = screen.getByRole('status');
      expect(overlay).toHaveAttribute('aria-busy', 'true');
    });

    it('debe tener texto para screen readers', () => {
      render(<LoadingOverlay visible={true} message="Loading data" />);

      const srOnly = screen.getAllByText('Loading data');
      const hiddenText = srOnly.find(el => el.classList.contains('sr-only'));
      expect(hiddenText).toBeInTheDocument();
    });
  });

  describe('Estilos y posicionamiento', () => {
    it('debe tener posicionamiento absoluto', () => {
      const { container } = render(<LoadingOverlay visible={true} />);

      const overlay = container.querySelector('.absolute.inset-0');
      expect(overlay).toBeInTheDocument();
    });

    it('debe estar centrado', () => {
      const { container } = render(<LoadingOverlay visible={true} />);

      const overlay = container.querySelector('.flex.items-center.justify-center');
      expect(overlay).toBeInTheDocument();
    });

    it('debe tener z-index alto', () => {
      const { container } = render(<LoadingOverlay visible={true} />);

      const overlay = container.querySelector('.z-50');
      expect(overlay).toBeInTheDocument();
    });

    it('debe aplicar className personalizado', () => {
      const { container } = render(
        <LoadingOverlay visible={true} className="custom-overlay" />
      );

      const overlay = container.querySelector('.custom-overlay');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Animación de spinner', () => {
    it('debe tener clase animate-spin', () => {
      const { container } = render(<LoadingOverlay visible={true} />);

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('debe tener color primary en spinner', () => {
      const { container } = render(<LoadingOverlay visible={true} />);

      const spinner = container.querySelector('.text-primary');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Casos edge', () => {
    it('debe manejar mensaje vacío correctamente', () => {
      render(<LoadingOverlay visible={true} message="" />);

      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    it('debe cambiar de visible a hidden correctamente', () => {
      const { rerender } = render(<LoadingOverlay visible={true} />);

      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<LoadingOverlay visible={false} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
