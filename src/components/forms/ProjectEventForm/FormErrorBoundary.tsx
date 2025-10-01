/**
 * FormErrorBoundary - Error Boundary específico para ProjectEventForm
 *
 * Wrapper sobre DialogErrorBoundary con logging especializado
 * para errores de formularios de eventos de proyecto.
 */

import React from 'react';
import { DialogErrorBoundary } from '@/components/error-boundary/DialogErrorBoundary';
import { errorBoundaryLogger } from '@/lib/logger';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  formMode?: 'lean' | 'full';
}

/**
 * Error boundary específico para formularios de eventos de proyecto
 */
export const FormErrorBoundary: React.FC<FormErrorBoundaryProps> = ({
  children,
  formMode = 'lean'
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    errorBoundaryLogger.error('ProjectEventForm error', {
      error,
      errorInfo,
      formMode,
      timestamp: new Date().toISOString(),
    });

    // Aquí podrías enviar a servicio de logging externo
    // como Sentry, LogRocket, etc.
  };

  // Fallback UI personalizado para errores de formulario
  const FormFallback = ({ error, resetError }: { error?: Error; resetError: () => void }) => (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="flex items-center space-x-2 text-destructive">
        <AlertTriangle className="h-6 w-6" />
        <h3 className="text-lg font-semibold">Error en el Formulario</h3>
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        Ha ocurrido un error inesperado al cargar el formulario de evento.
        Por favor, inténtalo de nuevo o contacta soporte si el problema persiste.
      </p>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Modo: <code className="bg-muted px-1 rounded">{formMode}</code></span>
      </div>

      {error && process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-muted-foreground max-w-md w-full">
          <summary className="cursor-pointer hover:text-foreground">
            Detalles técnicos (desarrollo)
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
            {error.message}
            {error.stack && '\n\n' + error.stack}
          </pre>
        </details>
      )}

      <Button onClick={resetError} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Reintentar
      </Button>
    </div>
  );

  return (
    <DialogErrorBoundary
      onError={handleError}
      fallback={FormFallback}
    >
      {children}
    </DialogErrorBoundary>
  );
};
