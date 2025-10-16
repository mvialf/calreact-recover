// src/components/modals/payments/BatchPaymentDialog.tsx
"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/format-utils';
import { formatDateForTable } from '@/utils/date-helpers';
import type { BatchPaymentGroup } from '@/types/payment';
import type { ProjectType } from '@/types/project';
import { CreditCard } from 'lucide-react';

interface BatchPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchPayment: BatchPaymentGroup | null;
  projectsMap: Record<string, ProjectType>;
}

export function BatchPaymentDialog({
  open,
  onOpenChange,
  batchPayment,
  projectsMap,
}: BatchPaymentDialogProps) {
  if (!batchPayment) return null;

  const totalAmount = batchPayment.totalAmount;
  const paymentCount = batchPayment.paymentCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles del Pago Batch</DialogTitle>
          <DialogDescription className="sr-only">
            Desglose completo del pago distribuido en {paymentCount} proyecto{paymentCount !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        {/* Información del batch */}
        <div className="space-y-4 px-6 py-4">
          {/* Header con información general */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Cliente:</span>
                <span className="font-medium">{batchPayment.clientName || 'Cliente no encontrado'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Fecha:</span>
                <span className="text-sm">{formatDateForTable(batchPayment.date)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Método:</span>
                <Badge variant="secondary" className="text-xs">
                  <CreditCard className="h-3 w-3 mr-1" />
                  {batchPayment.paymentMethod || 'No especificado'}
                </Badge>
              </div>
            </div>

            {/* Total del batch */}
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Total Pagado</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalAmount)}
              </div>
              <Badge variant="outline" className="text-xs mt-1">
                {paymentCount} pago{paymentCount !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Lista de distribuciones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Distribución por Proyecto</h4>
            </div>

            <div className="space-y-2">
              {batchPayment.subRows.map((payment) => {
                const project = projectsMap[payment.projectId];

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="font-medium">
                        {project?.projectNumber || 'Proyecto no encontrado'}
                      </div>
                      {project?.glosa && (
                        <div className="text-sm text-muted-foreground">
                          {project.glosa}
                        </div>
                      )}
                      {payment.notes && (
                        <div className="text-xs text-muted-foreground italic">
                          Nota: {payment.notes}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-bold text-lg">
                        {formatCurrency(payment.amount || 0)}
                      </div>
                      {payment.isAdjustment && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Ajuste
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumen final */}
          <Separator />
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium">Total Distribuido</span>
            <span className="text-xl font-bold">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
