'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DialogErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface DialogErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class DialogErrorBoundary extends React.Component<
  DialogErrorBoundaryProps,
  DialogErrorBoundaryState
> {
  constructor(props: DialogErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DialogErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DialogErrorBoundary capturó un error:', error, errorInfo);
    
    // Llamar al callback de error si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Si se proporciona un componente fallback personalizado, usarlo
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Componente fallback por defecto
      return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4 bg-card rounded-lg border border-destructive/20">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Error en el Diálogo</h3>
          </div>
          
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Ha ocurrido un error inesperado al cargar este diálogo. Por favor, inténtalo de nuevo.
          </p>
          
          {this.state.error && (
            <details className="text-xs text-muted-foreground max-w-md">
              <summary className="cursor-pointer hover:text-foreground">
                Detalles técnicos
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {this.state.error.message}
                {this.state.error.stack && '\n\n' + this.state.error.stack}
              </pre>
            </details>
          )}
          
          <Button onClick={this.resetError} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar con componentes funcionales
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error capturado por useErrorHandler:', error, errorInfo);
    
    // Aquí podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
  }, []);

  return handleError;
};

// Componente wrapper para facilitar el uso
export const withDialogErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
) => {
  const WrappedComponent = (props: P) => (
    <DialogErrorBoundary fallback={fallback}>
      <Component {...props} />
    </DialogErrorBoundary>
  );

  WrappedComponent.displayName = `withDialogErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
