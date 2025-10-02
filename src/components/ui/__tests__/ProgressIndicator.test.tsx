import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from '../ProgressIndicator';

describe('ProgressIndicator', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar correctamente', () => {
      render(<ProgressIndicator value={50} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });

    it('debe mostrar el valor de progreso correcto', () => {
      render(<ProgressIndicator value={75} label="Uploading" />);

      expect(screen.getByText('Uploading')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('debe renderizar sin label', () => {
      render(<ProgressIndicator value={50} />);

      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });
  });

  describe('Valores de progreso', () => {
    it('debe clampear valores negativos a 0', () => {
      render(<ProgressIndicator value={-10} label="Test" />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('debe clampear valores mayores a 100', () => {
      render(<ProgressIndicator value={150} label="Test" />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('debe manejar valor 0 correctamente', () => {
      render(<ProgressIndicator value={0} label="Test" />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('debe manejar valor 100 correctamente', () => {
      render(<ProgressIndicator value={100} label="Test" />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Modo indeterminado', () => {
    it('debe renderizar en modo indeterminado', () => {
      render(<ProgressIndicator indeterminate label="Loading" />);

      expect(screen.getByText('Loading')).toBeInTheDocument();
      expect(screen.queryByText('%')).not.toBeInTheDocument();
    });

    it('debe tener clase animate-pulse en modo indeterminado', () => {
      const { container } = render(<ProgressIndicator indeterminate />);

      const progressBar = container.querySelector('.animate-pulse');
      expect(progressBar).toBeInTheDocument();
    });

    it('debe tener width 100% en modo indeterminado', () => {
      const { container } = render(<ProgressIndicator indeterminate />);

      const progressBar = container.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Tamaños', () => {
    it('debe aplicar tamaño sm correctamente', () => {
      const { container } = render(<ProgressIndicator size="sm" value={50} />);

      const wrapper = container.querySelector('.h-1');
      expect(wrapper).toBeInTheDocument();
    });

    it('debe aplicar tamaño md correctamente (default)', () => {
      const { container } = render(<ProgressIndicator value={50} />);

      const wrapper = container.querySelector('.h-2');
      expect(wrapper).toBeInTheDocument();
    });

    it('debe aplicar tamaño lg correctamente', () => {
      const { container } = render(<ProgressIndicator size="lg" value={50} />);

      const wrapper = container.querySelector('.h-3');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Variantes de color', () => {
    it('debe aplicar variante default correctamente', () => {
      const { container } = render(<ProgressIndicator variant="default" value={50} />);

      const progressBar = container.querySelector('.bg-primary');
      expect(progressBar).toBeInTheDocument();
    });

    it('debe aplicar variante success correctamente', () => {
      const { container } = render(<ProgressIndicator variant="success" value={50} />);

      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('debe aplicar variante warning correctamente', () => {
      const { container } = render(<ProgressIndicator variant="warning" value={50} />);

      const progressBar = container.querySelector('.bg-yellow-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('debe aplicar variante destructive correctamente', () => {
      const { container } = render(<ProgressIndicator variant="destructive" value={50} />);

      const progressBar = container.querySelector('.bg-destructive');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener atributos ARIA correctos con valor', () => {
      render(<ProgressIndicator value={60} label="Download" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      expect(progressbar).toHaveAttribute('aria-valuenow', '60');
      expect(progressbar).toHaveAttribute('aria-label', 'Download');
    });

    it('debe tener atributos ARIA correctos en modo indeterminado', () => {
      render(<ProgressIndicator indeterminate label="Processing" />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      expect(progressbar).not.toHaveAttribute('aria-valuenow');
      expect(progressbar).toHaveAttribute('aria-label', 'Processing');
    });

    it('debe tener aria-label por defecto cuando no hay label prop', () => {
      render(<ProgressIndicator value={50} />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'Progress indicator');
    });
  });

  describe('Estilos personalizados', () => {
    it('debe aplicar className personalizado', () => {
      const { container } = render(
        <ProgressIndicator value={50} className="custom-class" />
      );

      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Ancho de barra de progreso', () => {
    it('debe establecer width correcto basado en valor', () => {
      const { container } = render(<ProgressIndicator value={75} />);

      const progressBar = container.querySelector('[style*="width: 75%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('debe establecer width 0% para valor 0', () => {
      const { container } = render(<ProgressIndicator value={0} />);

      const progressBar = container.querySelector('[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('debe establecer width 100% para valor 100', () => {
      const { container } = render(<ProgressIndicator value={100} />);

      const progressBar = container.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
