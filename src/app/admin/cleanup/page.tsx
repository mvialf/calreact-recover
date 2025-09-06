"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cleanVisitTimes, type CleanupResult } from '@/utils/cleanVisitTimes';

export default function CleanupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);

  const handleCleanup = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const cleanupResult = await cleanVisitTimes();
      setResult(cleanupResult);
    } catch (error) {
      setResult({
        success: false,
        processedCount: 0,
        totalCount: 0,
        errors: [`Error inesperado: ${error}`]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!result) return null;
    
    if (result.success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (result.processedCount > 0) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    if (!result) return null;
    
    if (result.success) {
      return result.processedCount > 0 
        ? `¡Éxito! Se actualizaron ${result.processedCount} de ${result.totalCount} visitas.`
        : `No se encontraron visitas que requieran actualización.`;
    } else if (result.processedCount > 0) {
      return `Completado con advertencias. Se actualizaron ${result.processedCount} de ${result.totalCount} visitas, pero hubo ${result.errors.length} errores.`;
    } else {
      return `Error: No se pudo actualizar ninguna visita.`;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administración - Limpieza de Datos</h1>
          <p className="text-muted-foreground">
            Herramientas para mantener la consistencia de los datos en la aplicación
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Limpiar Horas de Fechas de Visitas
            </CardTitle>
            <CardDescription>
              Esta herramienta eliminará las horas de todas las fechas de visitas en Firestore, 
              dejando solo la fecha (año, mes, día). Esto es útil para mantener consistencia 
              cuando no se requiere información de hora específica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Advertencia:</strong> Esta acción modificará permanentemente los datos en Firestore. 
                Asegúrate de tener un respaldo antes de continuar.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button 
                onClick={handleCleanup} 
                disabled={isLoading}
                variant={result?.success ? "secondary" : "default"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    {result ? "Ejecutar Nuevamente" : "Limpiar Fechas"}
                  </>
                )}
              </Button>
            </div>

            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : result.processedCount > 0 ? "border-yellow-200 bg-yellow-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <AlertDescription className="flex-1">
                    {getStatusMessage()}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {result && result.errors.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-700">Errores Encontrados</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-red-600 space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result && result.success && result.processedCount > 0 && (
              <Card className="border-green-200">
                <CardContent className="pt-4">
                  <div className="text-sm text-green-700">
                    <p><strong>Resumen de la operación:</strong></p>
                    <ul className="mt-2 space-y-1">
                      <li>• Total de visitas encontradas: {result.totalCount}</li>
                      <li>• Visitas actualizadas: {result.processedCount}</li>
                      <li>• Errores: {result.errors.length}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información Técnica</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>¿Qué hace esta herramienta?</strong><br />
              Convierte fechas como "2025-05-20 20:00:00" a "2025-05-20 00:00:00", 
              eliminando la información de hora pero manteniendo la fecha.
            </p>
            <p>
              <strong>¿Es seguro?</strong><br />
              Sí, solo modifica el campo scheduledDate de las visitas, manteniendo 
              todos los demás datos intactos.
            </p>
            <p>
              <strong>¿Puedo revertir los cambios?</strong><br />
              No automáticamente. Se recomienda hacer un respaldo antes de ejecutar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
