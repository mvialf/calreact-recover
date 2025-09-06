'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId: string;
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ 
    error?: Error; 
    errorInfo?: React.ErrorInfo;
    resetError: () => void;
    errorId: string;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId: string) => void;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      errorId: this.generateErrorId()
    };
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = this.state.errorId;
    
    console.group(`🚨 GlobalErrorBoundary - Error ${errorId}`);


    console.groupEnd();

    // Detectar si es un error relacionado con diálogos
    const isDialogError = this.isDialogRelatedError(error, errorInfo);
    if (isDialogError) {

    }

    // Detectar si es el error específico de createUnhandledError
    const isUnhandledError = error.message?.includes('createUnhandledError') || 
                           error.stack?.includes('createUnhandledError') ||
                           errorInfo.componentStack?.includes('Dialog');
    
    if (isUnhandledError) {

    }

    // Llamar al callback de error si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }

    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorId
    });

    // Intentar recuperación automática para errores menores
    if (this.retryCount < this.maxRetries && this.isRecoverableError(error)) {
      setTimeout(() => {
        this.retryCount++;

        this.resetError();
      }, 1000);
    }
  }

  private isDialogRelatedError(error: Error, errorInfo: React.ErrorInfo): boolean {
    const errorString = error.toString().toLowerCase();
    const stackString = error.stack?.toLowerCase() || '';
    const componentStack = errorInfo.componentStack?.toLowerCase() || '';

    const dialogKeywords = [
      'dialog',
      'modal',
      'description',
      'aria-describedby',
      'radix-ui',
      'dialogcontent',
      'dialogdescription'
    ];

    return dialogKeywords.some(keyword => 
      errorString.includes(keyword) || 
      stackString.includes(keyword) || 
      componentStack.includes(keyword)
    );
  }

  private isRecoverableError(error: Error): boolean {
    // Errores que pueden ser recuperables
    const recoverablePatterns = [
      /hydration/i,
      /missing.*description/i,
      /aria-describedby/i,
      /dialog.*description/i
    ];

    return recoverablePatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.stack || '')
    );
  }

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorId: this.generateErrorId()
    });
  };

  private reloadPage = () => {
    window.location.reload();
  };

  private goHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si se proporciona un componente fallback personalizado, usarlo
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error} 
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
            errorId={this.state.errorId}
          />
        );
      }

      // Componente fallback por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold text-foreground">
                Error Inesperado
              </h1>
              <p className="text-muted-foreground">
                Ha ocurrido un error inesperado en la aplicación. 
                Puedes intentar recargar la página o volver al inicio.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={this.resetError} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
              
              <Button onClick={this.reloadPage} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar Página
              </Button>
              
              <Button onClick={this.goHome} variant="ghost" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Button>
            </div>

            {/* Información técnica colapsable */}
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Detalles técnicos (ID: {this.state.errorId})
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md text-xs space-y-2">
                {this.state.error && (
                  <div>
                    <strong>Error:</strong>
                    <pre className="whitespace-pre-wrap break-words mt-1">
                      {this.state.error.message}
                    </pre>
                  </div>
                )}
                
                {this.state.error?.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap break-words mt-1 max-h-32 overflow-y-auto">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                
                {this.state.errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap break-words mt-1 max-h-32 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para usar con el Error Boundary
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {

    
    // Aquí podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
    
    // Para desarrollo, mostrar el error en la consola
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Error Handler Details');

      console.groupEnd();
    }
  }, []);

  return handleError;
};

// Componente wrapper para facilitar el uso
export const withGlobalErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ 
    error?: Error; 
    errorInfo?: React.ErrorInfo;
    resetError: () => void;
    errorId: string;
  }>
) => {
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary fallback={fallback}>
      <Component {...props} />
    </GlobalErrorBoundary>
  );

  WrappedComponent.displayName = `withGlobalErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
