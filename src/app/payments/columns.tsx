"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit,
  Trash2,
  MoreHorizontal,
  CreditCard,
  Banknote,
  Eye
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/custom/data-table/data-table-column-header"
import { ProjectSummary } from '@/components/summary/project-summary'
import { formatCurrency } from '@/utils/format-utils'
import { formatDateForTable } from '@/utils/date-helpers'
import { cn } from '@/lib/utils'
import type { Payment, PaymentTableRow, BatchPaymentGroup } from '@/types/payment'
import type { ProjectType } from '@/types/project'

// Tipos de pago con variantes de badge
const getPaymentTypeBadgeVariant = (paymentType: string) => {
  switch (paymentType?.toLowerCase()) {
    case 'proyecto':
      return 'default'
    case 'cliente':
      return 'secondary'
    case 'otro':
      return 'outline'
    default:
      return 'outline'
  }
}

// Métodos de pago con variantes de badge
const getPaymentMethodBadgeVariant = (paymentMethod: string) => {
  switch (paymentMethod?.toLowerCase()) {
    case 'transferencia':
      return 'default'
    case 'tarjeta de crédito':
      return 'secondary'
    case 'tarjeta de débito':
      return 'secondary'
    case 'efectivo':
      return 'outline'
    case 'cheque':
      return 'outline'
    case 'otro':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Tipo para Payment enriquecido con información del proyecto y cliente
interface EnrichedPayment extends Payment {
  clientName?: string
  projectNumber?: string
}

// Type guard para verificar si una fila es un batch parent
const isBatchParent = (row: PaymentTableRow): row is BatchPaymentGroup => {
  return 'type' in row && row.type === 'batch-parent';
};

interface PaymentsColumnsProps {
  onEdit: (payment: EnrichedPayment) => void
  onDelete: (payment: EnrichedPayment) => void
  onViewBatchDetails: (batchPayment: BatchPaymentGroup) => void
  onDeleteBatch: (batchPayment: BatchPaymentGroup) => void
  projectsMap: Record<string, ProjectType>
  clientsMap: Record<string, string>
}

export const createPaymentsColumns = ({
  onEdit,
  onDelete,
  onViewBatchDetails,
  onDeleteBatch,
  projectsMap,
  clientsMap,
}: PaymentsColumnsProps): ColumnDef<PaymentTableRow>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todas"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const rowData = row.original

      // Caso 1: Batch parent - mostrar cliente directo (mantener como está)
      if (isBatchParent(rowData)) {
        const clientName = clientsMap[rowData.clientId]
        return (
          <div className="font-medium">
            {clientName || 'Cliente no encontrado'}
          </div>
        )
      }

      // Caso 2: Pago individual de proyecto - usar ProjectSummary
      const payment = rowData as Payment
      const project = projectsMap[payment.projectId]

      if (!project) {
        return <span className="text-muted-foreground">Proyecto no encontrado</span>
      }

      const clientName = clientsMap[project.clientId]

      return (
        <ProjectSummary
          project={{
            projectNumber: project.projectNumber,
            clientName: clientName || 'Cliente no especificado',
            glosa: project.glosa,
          }}
          showProjectNumber={true}
          showClientInfo={true}
          layout="stacked"
          size="sm"
        />
      )
    },
    filterFn: (row, _id, value) => {
      const rowData = row.original
      const searchTerm = value.toLowerCase()

      // Batch parent - filtrar por clientId directo
      if (isBatchParent(rowData)) {
        const clientName = clientsMap[rowData.clientId] || ''
        return clientName.toLowerCase().includes(searchTerm)
      }

      // Pago individual - buscar en cliente Y proyecto
      const payment = rowData as Payment
      const project = projectsMap[payment.projectId]
      if (!project) return false

      const clientName = clientsMap[project.clientId] || ''

      // Buscar en: clientName, projectNumber, glosa
      return (
        clientName.toLowerCase().includes(searchTerm) ||
        project.projectNumber.toLowerCase().includes(searchTerm) ||
        (project.glosa || '').toLowerCase().includes(searchTerm)
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => {
      const rowData = row.original

      // Si es batch parent, mostrar total + badge de cantidad
      if (isBatchParent(rowData)) {
        return (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-primary">
              {formatCurrency(rowData.totalAmount)}
            </span>
            <Badge variant="secondary" className="text-xs">
              {rowData.paymentCount} pago{rowData.paymentCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        )
      }

      // Pago individual normal
      const payment = rowData as Payment
      const amount = payment.amount || 0
      const isAdjustment = payment.isAdjustment

      return (
        <div className="flex items-center space-x-2">
          <span className={cn(
            "font-medium",
            isAdjustment && "text-orange-600"
          )}>
            {formatCurrency(amount)}
          </span>
          {isAdjustment && (
            <Badge variant="outline" className="text-xs">
              Ajuste
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date") as Date | null

      return (
        <div className="text-sm">
          {formatDateForTable(date)}
        </div>
      )
    },
  },
  {
    accessorKey: "paymentMethod",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Método" />
    ),
    cell: ({ row }) => {
      const rowData = row.original
      const method = row.getValue("paymentMethod") as string

      if (!method) {
        return <span className="text-muted-foreground">—</span>
      }

      // Batch parents solo muestran el método, sin cuotas
      if (isBatchParent(rowData)) {
        const variant = getPaymentMethodBadgeVariant(method)
        return (
          <Badge variant={variant as any}>
            <div className="flex items-center space-x-1">
              {(method.toLowerCase().includes('tarjeta') || method.toLowerCase().includes('efectivo')) && (
                <CreditCard className="h-3 w-3" />
              )}
              {method.toLowerCase() === 'transferencia' && (
                <Banknote className="h-3 w-3" />
              )}
              <span>{method}</span>
            </div>
          </Badge>
        )
      }

      // Pago individual con posibles cuotas
      const payment = rowData as Payment
      const installments = payment.installments
      const variant = getPaymentMethodBadgeVariant(method)
      const isCreditCard = method.toLowerCase() === 'tarjeta de crédito'

      return (
        <div className="flex items-center space-x-2">
          <Badge variant={variant as any}>
            <div className="flex items-center space-x-1">
              {(method.toLowerCase().includes('tarjeta') || method.toLowerCase().includes('efectivo')) && (
                <CreditCard className="h-3 w-3" />
              )}
              {method.toLowerCase() === 'transferencia' && (
                <Banknote className="h-3 w-3" />
              )}
              <span>{method}</span>
            </div>
          </Badge>
          {isCreditCard && installments && installments > 1 && (
            <Badge variant="outline" className="text-xs">
              {installments} cuotas
            </Badge>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "paymentType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("paymentType") as string

      if (!type) {
        return <span className="text-muted-foreground">—</span>
      }

      const variant = getPaymentTypeBadgeVariant(type)

      return (
        <Badge variant={variant as any}>
          {type}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notas" />
    ),
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string

      if (!notes) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="max-w-[200px]">
          <span className="text-sm truncate block" title={notes}>
            {notes}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const rowData = row.original

      // Batch parents tienen dropdown de acciones
      if (isBatchParent(rowData)) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewBatchDetails(rowData)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles del batch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteBatch(rowData)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar batch completo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      // Solo pagos individuales tienen dropdown de acciones
      const payment = rowData as Payment

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onEdit(payment as EnrichedPayment)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar pago
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(payment as EnrichedPayment)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar pago
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Exportar opciones para filtros
export const PAYMENT_METHOD_OPTIONS = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta de crédito', label: 'Tarjeta de Crédito' },
  { value: 'tarjeta de débito', label: 'Tarjeta de Débito' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'otro', label: 'Otro' },
]

export const PAYMENT_TYPE_OPTIONS = [
  { value: 'proyecto', label: 'Proyecto' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'otro', label: 'Otro' },
]