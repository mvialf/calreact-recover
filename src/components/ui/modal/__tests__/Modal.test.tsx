/**
 * Tests para el sistema de modales compound
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, useModalState } from '../index';
import '@testing-library/jest-dom';

// Mock para sonner
jest.mock('sonner', () => ({
  toast: jest.fn()
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

});