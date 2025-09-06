import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectForm, ProjectFormData } from '../compound/ProjectFormCompound';

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

describe('ProjectFormCompound', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado de componentes', () => {
    test('renderiza ProjectForm.BasicInfo correctamente', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit}>
          <ProjectForm.BasicInfo />
        </ProjectForm>
      );

      expect(screen.getByText('Información Básica')).toBeInTheDocument();
      expect(screen.getByLabelText(/Número de Proyecto/)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Cliente Select
      expect(screen.getByLabelText(/Descripción/)).toBeInTheDocument();
      expect(screen.getByTestId('date-picker')).toBeInTheDocument(); // Date picker mock
    });

    test('renderiza ProjectForm.ContactInfo correctamente', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit}>
          <ProjectForm.ContactInfo />
        </ProjectForm>
      );

      expect(screen.getByText('Información de Contacto')).toBeInTheDocument();
      expect(screen.getByLabelText(/Teléfono/)).toBeInTheDocument();
      expect(screen.getByTestId('address-input')).toBeInTheDocument(); // AddressInput mock
    });

    test('renderiza ProjectForm.ServiceDetails correctamente', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit}>
          <ProjectForm.ServiceDetails />
        </ProjectForm>
      );

      expect(screen.getByText('Detalles del Servicio')).toBeInTheDocument();
      expect(screen.getByLabelText(/Subtotal/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tasa de Impuesto/)).toBeInTheDocument();
      expect(screen.getByText('Estado del Proyecto')).toBeInTheDocument(); // Label text, no control association needed
    });

    test('renderiza ProjectForm.Actions correctamente', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit} showDefaultButtons>
          <ProjectForm.Actions />
        </ProjectForm>
      );

      expect(screen.getByRole('button', { name: /Crear Proyecto/ })).toBeInTheDocument();
    });
  });

  describe('Composición flexible', () => {
    test('permite composición personalizada de secciones', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit}>
          <ProjectForm.ServiceDetails />
          <ProjectForm.BasicInfo />
          <ProjectForm.ContactInfo />
          <ProjectForm.Actions />
        </ProjectForm>
      );

      const sections = screen.getAllByRole('heading', { level: 3 });
      expect(sections[0]).toHaveTextContent('Detalles del Servicio');
      expect(sections[1]).toHaveTextContent('Información Básica');
      expect(sections[2]).toHaveTextContent('Información de Contacto');
    });

    test('funciona sin mostrar botones por defecto', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit} showDefaultButtons={false}>
          <ProjectForm.BasicInfo />
        </ProjectForm>
      );

      expect(screen.queryByRole('button', { name: /Crear Proyecto/ })).not.toBeInTheDocument();
    });
  });

  describe('Validación de formulario', () => {
    test('muestra errores de validación para campos requeridos', async () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit}>
          <ProjectForm.BasicInfo />
          <ProjectForm.Actions />
        </ProjectForm>
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
        >
          <ProjectForm.BasicInfo />
          <ProjectForm.Actions />
        </ProjectForm>
      );

      const submitButton = screen.getByRole('button', { name: /Crear Proyecto/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            projectNumber: 'PR-2025-001',
            clientId: '1'
          }),
          expect.any(Object) // React form event
        );
      });
    });
  });

  describe('Funcionalidad de desinstalación', () => {
    test('muestra opciones de desinstalación cuando se activa', () => {
      renderWithQueryClient(
        <ProjectForm onSubmit={mockSubmit}>
          <ProjectForm.ServiceDetails />
        </ProjectForm>
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
        >
          <ProjectForm.ServiceDetails />
        </ProjectForm>
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