"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { formatCurrency } from "@/utils/format-utils"
import { formatDateForTable } from "@/utils/date-helpers"
import type { BatchedPaymentGroup } from "@/hooks/usePaymentsData"

interface BatchPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  batch: BatchedPaymentGroup | null
  onDeleteBatch?: (batchId: string) => void
}

export const BatchPaymentDialog = ({
  open,
  onOpenChange,
  batch,
  onDeleteBatch,
}: BatchPaymentDialogProps) => {
  if (!batch) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Desglose de Pago de Cliente</DialogTitle>
          <DialogDescription>
            Pago de {batch.summary.clientName} por {formatCurrency(batch.summary.totalAmount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información general del pago */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Método</div>
              <div className="font-medium">{batch.summary.paymentMethod}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Fecha</div>
              <div className="font-medium">
                {formatDateForTable(batch.summary.date)}
              </div>
            </div>
          </div>

          {/* Distribución por proyecto */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Distribución por Proyecto:</div>
            {batch.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-3 border rounded hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{payment.projectNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {payment.clientName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(payment.amount)}
                  </div>
                  {payment.notes && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {payment.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
            <div className="font-semibold">Total del Pago</div>
            <div className="font-bold text-lg">
              {formatCurrency(batch.summary.totalAmount)}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {onDeleteBatch && (
            <Button
              variant="destructive"
              onClick={() => {
                onDeleteBatch(batch.batchId)
                onOpenChange(false)
              }}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar batch completo
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
