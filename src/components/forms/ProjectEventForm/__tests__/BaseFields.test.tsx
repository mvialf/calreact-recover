/**
 * Tests para BaseFields - Form fields básicos
 *
 * Verifica:
 * - Rendering de campos base (eventDate, eventNotes)
 * - Integration con React Hook Form
 * - Disabled state
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseFields } from '../BaseFields';
import { mockFormContext } from './test-utils';

// Mock del Context
jest.mock('../Container', () => ({
  useProjectEventFormContext: () => mockFormContext,
}));

describe('BaseFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering básico', () => {
    it('debe renderizar campo eventDate', () => {
      render(<BaseFields />);

      const dateInput = screen.getByLabelText(/Fecha del Evento/i);
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    it('debe renderizar campo eventNotes', () => {
      render(<BaseFields />);

      const notesInput = screen.getByLabelText(/Notas del Evento/i);
      expect(notesInput).toBeInTheDocument();
      expect(notesInput).toHaveAttribute('rows', '3');
    });

    it('debe aplicar className correctamente', () => {
      const { container } = render(<BaseFields className="custom-base-fields" />);

      const baseFieldsDiv = container.firstChild;
      expect(baseFieldsDiv).toHaveClass('custom-base-fields');
    });
  });

  describe('Field placeholders', () => {
    it('debe mostrar placeholder en eventDate', () => {
      render(<BaseFields />);

      const dateInput = screen.getByLabelText(/Fecha del Evento/i);
      expect(dateInput).toHaveAttribute('placeholder', 'Seleccione la fecha del evento');
    });

    it('debe mostrar placeholder en eventNotes', () => {
      render(<BaseFields />);

      const notesInput = screen.getByLabelText(/Notas del Evento/i);
      expect(notesInput).toHaveAttribute(
        'placeholder',
        'Añadir notas opcionales sobre el evento...'
      );
    });
  });

  describe('Disabled state', () => {
    it('debe deshabilitar campos cuando disabled=true', () => {
      const disabledContext = { ...mockFormContext, disabled: true };
      jest.mocked(require('../Container').useProjectEventFormContext).mockReturnValue(
        disabledContext
      );

      render(<BaseFields />);

      const dateInput = screen.getByLabelText(/Fecha del Evento/i);
      const notesInput = screen.getByLabelText(/Notas del Evento/i);

      expect(dateInput).toBeDisabled();
      expect(notesInput).toBeDisabled();
    });

    it('debe habilitar campos cuando disabled=false', () => {
      render(<BaseFields />);

      const dateInput = screen.getByLabelText(/Fecha del Evento/i);
      const notesInput = screen.getByLabelText(/Notas del Evento/i);

      expect(dateInput).not.toBeDisabled();
      expect(notesInput).not.toBeDisabled();
    });
  });

  describe('User interactions', () => {
    it('debe permitir editar eventNotes', async () => {
      const user = userEvent.setup();

      render(<BaseFields />);

      const notesInput = screen.getByLabelText(/Notas del Evento/i);
      await user.clear(notesInput);
      await user.type(notesInput, 'Test notes content');

      // El campo debe tener el texto
      expect(notesInput).toHaveValue('Test notes content');
    });

    it('debe aplicar resize-none a textarea', () => {
      render(<BaseFields />);

      const notesInput = screen.getByLabelText(/Notas del Evento/i);
      expect(notesInput).toHaveClass('resize-none');
    });
  });

  describe('Required field indicator', () => {
    it('debe mostrar asterisco en eventDate (campo requerido)', () => {
      render(<BaseFields />);

      // El label debe contener "*" para indicar campo requerido
      expect(screen.getByText(/Fecha del Evento \*/i)).toBeInTheDocument();
    });

    it('eventNotes NO debe tener asterisco (campo opcional)', () => {
      render(<BaseFields />);

      const label = screen.getByText(/Notas del Evento/i);
      expect(label.textContent).not.toContain('*');
    });
  });
});
