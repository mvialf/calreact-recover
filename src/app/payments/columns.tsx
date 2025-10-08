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

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { formatCurrency } from '@/utils/format-utils'
import { formatDateForTable } from '@/utils/date-helpers'
import type { Payment } from '@/types/payment'
import type { ProjectType } from '@/types/project'
import type { Client } from '@/types/client'
import type { BatchedPaymentGroup } from '@/hooks/usePaymentsData'

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

// Union type para filas que pueden ser batch o individuales
type PaymentRow = EnrichedPayment | BatchedPaymentGroup

// Helper para detectar si una fila es un batch
const isBatchGroup = (row: PaymentRow): row is BatchedPaymentGroup => {
  return 'summary' in row
}

interface PaymentsColumnsProps {
  onEdit: (payment: EnrichedPayment) => void
  onDelete: (payment: EnrichedPayment) => void
  onViewBatch?: (batchId: string) => void
  projectsMap: Record<string, ProjectType>
  clientsMap: Record<string, string>
}

export const createPaymentsColumns = ({
  onEdit,
  onDelete,
  onViewBatch,
  projectsMap,
  clientsMap,
}: PaymentsColumnsProps): ColumnDef<PaymentRow>[] => [
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
    accessorKey: "projectId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proyecto" />
    ),
    cell: ({ row }) => {
      const data = row.original

      // Si es un batch, mostrar "X proyectos"
      if (isBatchGroup(data)) {
        return (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {data.summary.projectCount} proyectos
            </Badge>
            {onViewBatch && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => onViewBatch(data.batchId)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver desglose
              </Button>
            )}
          </div>
        )
      }

      // Payment individual
      const payment = data as EnrichedPayment
      const project = projectsMap[payment.projectId]

      if (!project) {
        return <span className="text-muted-foreground">Proyecto no encontrado</span>
      }

      return (
        <div className="space-y-1">
          <div className="font-medium">
            {project.projectNumber}
          </div>
          {project.glosa && (
            <div className="text-sm text-muted-foreground">
              {project.glosa}
            </div>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const data = row.original

      if (isBatchGroup(data)) {
        // Buscar en todos los pagos del batch
        return data.payments.some(payment => {
          const project = projectsMap[payment.projectId]
          if (!project) return false

          const searchTerm = value.toLowerCase()
          return (
            project.projectNumber.toLowerCase().includes(searchTerm) ||
            (project.glosa || '').toLowerCase().includes(searchTerm)
          )
        })
      }

      const payment = data as EnrichedPayment
      const project = projectsMap[payment.projectId]
      if (!project) return false

      const searchTerm = value.toLowerCase()
      return (
        project.projectNumber.toLowerCase().includes(searchTerm) ||
        (project.glosa || '').toLowerCase().includes(searchTerm)
      )
    },
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const data = row.original

      // Si es batch, usar summary
      if (isBatchGroup(data)) {
        return (
          <div className="font-medium">
            {data.summary.clientName}
          </div>
        )
      }

      // Payment individual
      const payment = data as EnrichedPayment
      const project = projectsMap[payment.projectId]

      if (!project) {
        return <span className="text-muted-foreground">—</span>
      }

      const clientName = clientsMap[project.clientId]
      return (
        <div className="font-medium">
          {clientName || 'Cliente no encontrado'}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const data = row.original

      if (isBatchGroup(data)) {
        const searchTerm = value.toLowerCase()
        return data.summary.clientName.toLowerCase().includes(searchTerm)
      }

      const payment = data as EnrichedPayment
      const project = projectsMap[payment.projectId]
      if (!project) return false

      const clientName = clientsMap[project.clientId] || ''
      const searchTerm = value.toLowerCase()
      return clientName.toLowerCase().includes(searchTerm)
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => {
      const data = row.original

      // Si es batch, mostrar total
      if (isBatchGroup(data)) {
        return (
          <div className="flex items-center space-x-2">
            <span className="font-bold">
              {formatCurrency(data.summary.totalAmount)}
            </span>
          </div>
        )
      }

      // Payment individual
      const payment = data as EnrichedPayment
      const amount = payment.amount
      const isAdjustment = payment.isAdjustment

      return (
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${isAdjustment ? 'text-orange-600' : ''}`}>
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
      const data = row.original

      // Si es batch, usar summary.date
      if (isBatchGroup(data)) {
        return (
          <div className="text-sm">
            {formatDateForTable(data.summary.date)}
          </div>
        )
      }

      // Payment individual
      const payment = data as EnrichedPayment
      const date = payment.date

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
      const data = row.original

      // Si es batch, usar summary
      if (isBatchGroup(data)) {
        const method = data.summary.paymentMethod

        if (!method) {
          return <span className="text-muted-foreground">—</span>
        }

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

      // Payment individual
      const payment = data as EnrichedPayment
      const method = payment.paymentMethod
      const installments = payment.installments

      if (!method) {
        return <span className="text-muted-foreground">—</span>
      }

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
      const data = row.original

      // Si es batch, no tiene paymentType en summary
      if (isBatchGroup(data)) {
        return <span className="text-muted-foreground">—</span>
      }

      // Payment individual
      const payment = data as EnrichedPayment
      const type = payment.paymentType

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
      const data = row.original

      // Si es batch, no tiene notes en summary
      if (isBatchGroup(data)) {
        return <span className="text-muted-foreground">—</span>
      }

      // Payment individual
      const payment = data as EnrichedPayment
      const notes = payment.notes

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
      const data = row.original

      // Si es batch, no mostrar acciones (se manejan desde el modal)
      if (isBatchGroup(data)) {
        return null
      }

      // Payment individual
      const payment = data as EnrichedPayment

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
              onClick={() => onEdit(payment)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar pago
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(payment)}
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