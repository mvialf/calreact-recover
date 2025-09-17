// assertion-helpers.ts - Helpers para assertions personalizadas en tests
// Centraliza assertions comunes y patterns de testing

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Helper para verificar elementos de formulario
export const formHelpers = {
  // Verificar que un formulario esté presente y tenga los campos esperados
  expectFormFields: (fieldNames: string[]) => {
    fieldNames.forEach(fieldName => {
      expect(screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') }))
        .toBeInTheDocument();
    });
  },

  // Llenar un formulario con datos
  fillForm: async (formData: Record<string, string>) => {
    const user = userEvent.setup();

    for (const [fieldName, value] of Object.entries(formData)) {
      const field = screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') });
      await user.clear(field);
      await user.type(field, value);
    }
  },

  // Verificar errores de validación
  expectValidationError: async (fieldName: string, errorText?: string) => {
    const field = screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') });
    expect(field).toHaveAttribute('aria-invalid', 'true');

    if (errorText) {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorText, 'i'))).toBeInTheDocument();
      });
    }
  },

  // Verificar que no hay errores
  expectNoValidationErrors: () => {
    const errorElements = screen.queryAllByRole('alert');
    errorElements.forEach(element => {
      expect(element).not.toBeInTheDocument();
    });
  },
};

// Helper para verificar estados de loading
export const loadingHelpers = {
  // Verificar que está mostrando loading
  expectLoading: (text = /loading|cargando/i) => {
    expect(screen.getByText(text)).toBeInTheDocument();
  },

  // Esperar a que termine el loading
  waitForLoadingToFinish: async (text = /loading|cargando/i) => {
    await waitFor(() => {
      expect(screen.queryByText(text)).not.toBeInTheDocument();
    });
  },

  // Verificar skeleton loaders
  expectSkeletonLoader: () => {
    const skeletons = screen.getAllByTestId(/skeleton|loading/i);
    expect(skeletons.length).toBeGreaterThan(0);
  },
};

// Helper para verificar listas y tablas
export const listHelpers = {
  // Verificar que una tabla tiene el número esperado de filas
  expectTableRows: (count: number) => {
    const rows = screen.getAllByRole('row');
    // Restar 1 para excluir el header
    expect(rows).toHaveLength(count + 1);
  },

  // Verificar que una lista está vacía
  expectEmptyList: (emptyText = /no hay|vacío|sin resultados/i) => {
    expect(screen.getByText(emptyText)).toBeInTheDocument();
  },

  // Verificar elementos de una lista
  expectListItems: (items: string[]) => {
    items.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  },

  // Buscar en una lista
  searchInList: async (searchTerm: string, inputLabel = /buscar|search/i) => {
    const user = userEvent.setup();
    const searchInput = screen.getByRole('textbox', { name: inputLabel });
    await user.clear(searchInput);
    await user.type(searchInput, searchTerm);
  },
};

// Helper para verificar modales y diálogos
export const modalHelpers = {
  // Verificar que un modal está abierto
  expectModalOpen: (modalTitle?: string) => {
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();

    if (modalTitle) {
      expect(screen.getByText(modalTitle)).toBeInTheDocument();
    }
  },

  // Cerrar un modal
  closeModal: async () => {
    const user = userEvent.setup();
    const closeButton = screen.getByRole('button', { name: /cerrar|close|×/i });
    await user.click(closeButton);
  },

  // Verificar que un modal está cerrado
  expectModalClosed: () => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

// Helper para verificar notificaciones/toasts
export const notificationHelpers = {
  // Verificar toast de éxito
  expectSuccessToast: async (message?: string) => {
    await waitFor(() => {
      const toast = screen.getByRole('status') || screen.getByTestId('toast');
      expect(toast).toBeInTheDocument();

      if (message) {
        expect(screen.getByText(new RegExp(message, 'i'))).toBeInTheDocument();
      }
    });
  },

  // Verificar toast de error
  expectErrorToast: async (message?: string) => {
    await waitFor(() => {
      const toast = screen.getByRole('alert') || screen.getByTestId('error-toast');
      expect(toast).toBeInTheDocument();

      if (message) {
        expect(screen.getByText(new RegExp(message, 'i'))).toBeInTheDocument();
      }
    });
  },
};

// Helper para verificar navegación
export const navigationHelpers = {
  // Verificar que estamos en una página específica
  expectCurrentPage: (pageTitle: string) => {
    expect(screen.getByRole('heading', { name: new RegExp(pageTitle, 'i') }))
      .toBeInTheDocument();
  },

  // Navegar usando breadcrumbs
  navigateWithBreadcrumb: async (breadcrumbText: string) => {
    const user = userEvent.setup();
    const breadcrumb = screen.getByRole('link', { name: new RegExp(breadcrumbText, 'i') });
    await user.click(breadcrumb);
  },
};

// Helper para verificar accesibilidad
export const accessibilityHelpers = {
  // Verificar que los elementos tienen labels apropiados
  expectProperLabels: (elements: string[]) => {
    elements.forEach(elementName => {
      const element = screen.getByRole('textbox', { name: new RegExp(elementName, 'i') });
      expect(element).toHaveAccessibleName();
    });
  },

  // Verificar navegación con teclado
  expectKeyboardNavigation: async () => {
    const user = userEvent.setup();

    // Tab through interactive elements
    await user.tab();
    expect(document.activeElement).toBeInTheDocument();

    // Should be able to activate with Enter/Space
    if (document.activeElement?.tagName === 'BUTTON') {
      await user.keyboard('{Enter}');
    }
  },

  // Verificar contraste y visibilidad
  expectVisibleText: (text: string) => {
    const element = screen.getByText(text);
    expect(element).toBeVisible();
    // Verificar que no tiene estilos que oculten el texto
    expect(element).not.toHaveStyle('opacity: 0');
    expect(element).not.toHaveStyle('visibility: hidden');
  },
};

// Export consolidado de todos los helpers
export const testHelpers = {
  form: formHelpers,
  loading: loadingHelpers,
  list: listHelpers,
  modal: modalHelpers,
  notification: notificationHelpers,
  navigation: navigationHelpers,
  accessibility: accessibilityHelpers,
};