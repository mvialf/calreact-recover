/**
 * Tests para el sistema de modales compound
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, FormModal, useModalState } from '../index';
import '@testing-library/jest-dom';

// Mock para useToast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Componente de prueba para Modal compound
const TestModalCompound = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <Modal.Root isOpen={isOpen} onClose={onClose} title="Test Modal">
    <Modal.Content>
      <Modal.Header title="Modal de Prueba" description="Descripción de prueba" />
      <Modal.Body>
        <p>Contenido del modal</p>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Actions showCancel showSubmit cancelText="Cancelar" submitText="Guardar" />
      </Modal.Footer>
    </Modal.Content>
  </Modal.Root>
);

// Componente de prueba para FormModal
const TestFormModal = () => {
  const { isOpen, open, close } = useModalState();
  const [submitData, setSubmitData] = React.useState<any>(null);

  const handleSubmit = async (data: { name: string }) => {
    setSubmitData(data);
    // Para testing, cerramos el modal manualmente
    close();
  };

  return (
    <>
      <button onClick={open}>Abrir Modal</button>
      <FormModal
        isOpen={isOpen}
        onClose={close}
        title="Formulario de Prueba"
        formId="test-form"
        onSubmit={handleSubmit}
        submitText="Enviar"
        preventCloseOnSubmit={true}
      >
        <form 
          id="test-form" 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            handleSubmit(data as { name: string });
          }}
        >
          <input 
            name="name" 
            placeholder="Nombre"
            defaultValue="Test Value"
          />
        </form>
      </FormModal>
      {submitData && <div data-testid="submit-result">{submitData.name}</div>}
    </>
  );
};

describe('Sistema de Modales', () => {
  describe('Modal Compound Components', () => {
    it('debe renderizar correctamente cuando está abierto', () => {
      const onClose = jest.fn();
      
      render(<TestModalCompound isOpen={true} onClose={onClose} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal de Prueba')).toBeInTheDocument();
      expect(screen.getByText('Descripción de prueba')).toBeInTheDocument();
      expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    });

    it('no debe renderizar cuando está cerrado', () => {
      const onClose = jest.fn();
      
      render(<TestModalCompound isOpen={false} onClose={onClose} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('debe llamar onClose cuando se hace clic en cancelar', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      
      render(<TestModalCompound isOpen={true} onClose={onClose} />);
      
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('useModalState hook', () => {
    it('debe gestionar el estado de apertura/cierre correctamente', async () => {
      const user = userEvent.setup();
      
      const TestComponent = () => {
        const { isOpen, open, close } = useModalState();
        
        return (
          <>
            <button onClick={open}>Abrir</button>
            <button onClick={close}>Cerrar</button>
            <div data-testid="state">{isOpen ? 'abierto' : 'cerrado'}</div>
          </>
        );
      };

      render(<TestComponent />);
      
      expect(screen.getByTestId('state')).toHaveTextContent('cerrado');
      
      await user.click(screen.getByRole('button', { name: /abrir/i }));
      expect(screen.getByTestId('state')).toHaveTextContent('abierto');
      
      await user.click(screen.getByRole('button', { name: /cerrar/i }));
      expect(screen.getByTestId('state')).toHaveTextContent('cerrado');
    });
  });

  describe('FormModal', () => {
    it('debe conectar correctamente el formulario con el botón de envío', async () => {
      const user = userEvent.setup();
      
      render(<TestFormModal />);
      
      // Abrir el modal
      await user.click(screen.getByRole('button', { name: /abrir modal/i }));
      
      // Verificar que el modal está abierto
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Formulario de Prueba')).toBeInTheDocument();
      
      // Verificar que el input tiene el valor por defecto
      const input = screen.getByPlaceholderText('Nombre');
      expect(input).toHaveValue('Test Value');
      
      // Verificar que el botón de envío tiene el atributo form correcto
      const submitButton = screen.getByRole('button', { name: /enviar/i });
      expect(submitButton).toHaveAttribute('form', 'test-form');
    });

    it('debe manejar el envío del formulario cuando se hace clic en el botón externo', async () => {
      const user = userEvent.setup();
      
      render(<TestFormModal />);
      
      // Abrir el modal
      await user.click(screen.getByRole('button', { name: /abrir modal/i }));
      
      // Cambiar el valor del input
      const input = screen.getByPlaceholderText('Nombre');
      await user.clear(input);
      await user.type(input, 'Nuevo Nombre');
      
      // Hacer clic en el botón de envío (que está fuera del form)
      await user.click(screen.getByRole('button', { name: /enviar/i }));
      
      // Verificar que el formulario se envió correctamente
      await waitFor(() => {
        expect(screen.getByTestId('submit-result')).toHaveTextContent('Nuevo Nombre');
      }, { timeout: 3000 });
    });

    it('debe cerrar el modal después de envío exitoso', async () => {
      const user = userEvent.setup();
      
      render(<TestFormModal />);
      
      // Abrir el modal
      await user.click(screen.getByRole('button', { name: /abrir modal/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Enviar el formulario
      await user.click(screen.getByRole('button', { name: /enviar/i }));
      
      // Verificar que el modal se cerró
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Integración con React Hook Form', () => {
    it('debe funcionar correctamente con react-hook-form', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      
      const TestFormWithHookForm = () => {
        const { isOpen, open, close } = useModalState();
        
        return (
          <>
            <button onClick={open}>Abrir</button>
            <FormModal
              isOpen={isOpen}
              onClose={close}
              title="Hook Form Test"
              formId="hook-form-test"
              onSubmit={onSubmit}
            >
              <form 
                id="hook-form-test" 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData.entries());
                  onSubmit(data);
                }}
              >
                <input name="email" type="email" placeholder="Email" />
                <input name="password" type="password" placeholder="Password" />
              </form>
            </FormModal>
          </>
        );
      };

      render(<TestFormWithHookForm />);
      
      await user.click(screen.getByRole('button', { name: /abrir/i }));
      
      await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Password'), 'password123');
      
      await user.click(screen.getByRole('button', { name: /guardar/i }));
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });
  });
});