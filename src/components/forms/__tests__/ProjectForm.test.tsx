import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectForm, ProjectFormData } from '../ProjectForm';

// Mock del servicio de clientes
jest.mock('@/services/clientService', () => ({
  getClients: jest.fn(() => Promise.resolve([
    { id: '1', name: 'Cliente Test', createdAt: new Date(), updatedAt: new Date() }
  ]))
}));

// Mock de componentes UI complejos
jest.mock('@/components/ui/addressInput', () => ({
  AddressInput: ({ value, onSelect, placeholder }: any) => (
    <input 
      data-testid="address-input"
      id="fullAddress"
      placeholder={placeholder}
      onChange={(e) => onSelect?.({ formatted_address: e.target.value })}
    />
  )
}));

jest.mock('@/components/ui/date-picker', () => ({
  InputDate: ({ date, onSelect, placeholder }: any) => (
    <input 
      data-testid="date-picker"
      id="date"
      type="date"
      value={date?.toISOString?.()?.split('T')[0] || ''}
      onChange={(e) => onSelect?.(new Date(e.target.value))}
      placeholder={placeholder}
    />
  )
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactNode) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ProjectForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado de componentes', () => {
    test('renderiza ProjectForm correctamente', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit} />
      );

      expect(screen.getByText('Información Básica')).toBeInTheDocument();
      expect(screen.getByLabelText(/Número de Proyecto/)).toBeInTheDocument();
      expect(screen.getAllByRole('combobox')[0]).toBeInTheDocument(); // Cliente Select
      expect(screen.getByLabelText(/Descripción/)).toBeInTheDocument();
      expect(screen.getByTestId('date-picker')).toBeInTheDocument(); // Date picker mock

      expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
      expect(screen.getByTestId('address-input')).toBeInTheDocument(); // AddressInput mock
    });

    test('renderiza secciones de servicio y acciones correctamente', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit} showDefaultButtons />
      );

      expect(screen.getByText('Detalles del Servicio')).toBeInTheDocument();
      expect(screen.getByLabelText(/Subtotal/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tasa de Impuesto/)).toBeInTheDocument();
      expect(screen.getByText('Estado del Proyecto')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Crear Proyecto/ })).toBeInTheDocument();
    });
  });

  describe('Configuración del formulario', () => {
    test('muestra secciones en orden fijo y predecible', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit} />
      );

      const sections = screen.getAllByRole('heading', { level: 3 });
      expect(sections[0]).toHaveTextContent('Información Básica');
      expect(sections[1]).toHaveTextContent('Información de Contacto');
      expect(sections[2]).toHaveTextContent('Detalles del Servicio');
    });

    test('funciona sin mostrar botones por defecto', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit} showDefaultButtons={false} />
      );

      expect(screen.queryByRole('button', { name: /Crear Proyecto/ })).not.toBeInTheDocument();
    });
  });

  describe('Validación de formulario', () => {
    test('muestra errores de validación para campos requeridos', async () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit} />
      );

      const submitButton = screen.getByRole('button', { name: /Crear Proyecto/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Número de proyecto es requerido/)).toBeInTheDocument();
        expect(screen.getByText(/Cliente es requerido/)).toBeInTheDocument();
      });

      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('ejecuta submit con formulario válido', async () => {
      // Usar defaultValues para evitar problemas de validación en testing
      renderWithQueryClient(
        <ProjectForm
          onSubmit={mockSubmit}
          defaultValues={{
            projectNumber: 'PR-2025-001',
            clientId: '1',
            date: new Date(),
            subtotal: 1000,
            taxRate: 19,
            status: 'ingresado'
          }}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Crear Proyecto/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            projectNumber: 'PR-2025-001',
            clientId: '1'
          })
        );
      });
    });
  });

  describe('Funcionalidad de desinstalación', () => {
    test('muestra opciones de desinstalación cuando se activa', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit} />
      );

      const uninstallCheckbox = screen.getByLabelText(/Requiere Desinstalación/);
      fireEvent.click(uninstallCheckbox);

      expect(screen.getByText('Tipos de Desinstalación')).toBeInTheDocument();
      expect(screen.getByLabelText('Aluminio')).toBeInTheDocument();
      expect(screen.getByLabelText('Madera')).toBeInTheDocument();
      expect(screen.getByLabelText('Fierro')).toBeInTheDocument();
    });
  });

  describe('Cálculos financieros', () => {
    test('calcula el total correctamente basado en subtotal e impuesto', async () => {
      renderWithQueryClient(
        <ProjectForm
          onSubmit={mockSubmit}
          defaultValues={{ subtotal: 1000, taxRate: 19 }}
        />
      );

      // El total debe ser 1000 * 1.19 = 1190
      await waitFor(() => {
        const totalInput = screen.getByDisplayValue('1190.00');
        expect(totalInput).toBeInTheDocument();
        expect(totalInput).toHaveAttribute('readOnly');
      });
    });
  });
});