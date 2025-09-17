// Declaraciones de tipos globales para los matchers de Jest-DOM
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveTextContent(text: string | RegExp): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | string[] | number): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toHaveStyle(css: string): R;
      toHaveFocus(): R;
      toContainHTML(html: string): R;
    }
  }
}

// Tipos útiles para testing
export type MockedFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;
export type MockedClass<T> = jest.MockedClass<T>;
export type MockedObject<T> = jest.MockedObject<T>;
export type TestComponent<P = {}> = React.ComponentType<P>;
export type TestProps<P = {}> = P;