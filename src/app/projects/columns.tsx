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
  SquarePen,
  Trash2,
  DollarSign,
  FileText,
  MoreHorizontal
} from "lucide-react"
import { format as formatDate } from 'date-fns'
import { es } from 'date-fns/locale'

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ProjectClientDisplay } from '@/components/client-display'
import { formatCurrency } from '@/utils/format-helpers'
import {
  getPaymentPercentageBadgeVariant,
  getStatusBadgeVariant,
  PROJECT_STATUS_OPTIONS
} from '@/lib/constants'
import type { EnrichedProject } from '@/types/project'

interface ProjectsColumnsProps {
  onEdit: (project: EnrichedProject) => void
  onDelete: (project: EnrichedProject) => void
  onAddPayment: (project: EnrichedProject) => void
  onViewAccountStatement: (project: EnrichedProject) => void
}

export const createProjectsColumns = ({
  onEdit,
  onDelete,
  onAddPayment,
  onViewAccountStatement,
}: ProjectsColumnsProps): ColumnDef<EnrichedProject>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
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
    accessorKey: "projectNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="N° Proyecto" />
    ),
    cell: ({ row }) => {
      const projectNumber = row.getValue("projectNumber") as string
      return (
        <div className="font-medium">
          {projectNumber}
        </div>
      )
    },
  },
  {
    accessorKey: "glosa",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      const glosa = row.getValue("glosa") as string
      return (
        <div className="max-w-[300px] truncate font-medium">
          {glosa || "Sin descripción"}
        </div>
      )
    },
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cliente" />
    ),
    cell: ({ row }) => {
      const project = row.original
      return <ProjectClientDisplay project={project} />
    },
    filterFn: (row, id, value) => {
      const project = row.original
      const clientName = project.clientName || ''
      return clientName.toLowerCase().includes(value.toLowerCase())
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const statusOption = PROJECT_STATUS_OPTIONS.find(opt => opt.value === status)
      const variant = getStatusBadgeVariant(status)

      return (
        <Badge variant={variant}>
          {statusOption?.label || status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "totalPaymentPercentage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="% Pagado" />
    ),
    cell: ({ row }) => {
      const percentage = row.getValue("totalPaymentPercentage") as number
      const variant = getPaymentPercentageBadgeVariant(percentage)

      return (
        <Badge variant={variant}>
          {percentage?.toFixed(1)}%
        </Badge>
      )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor Total" />
    ),
    cell: ({ row }) => {
      const totalValue = row.getValue("total") as number
      return (
        <div className="font-medium">
          {formatCurrency(totalValue)}
        </div>
      )
    },
  },
  {
    accessorKey: "totalPayments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Pagado" />
    ),
    cell: ({ row }) => {
      const totalPaid = row.getValue("totalPayments") as number
      return (
        <div className="font-medium text-green-600">
          {formatCurrency(totalPaid)}
        </div>
      )
    },
  },
  {
    accessorKey: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Saldo" />
    ),
    cell: ({ row }) => {
      const balance = row.getValue("balance") as number
      return (
        <div className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(balance)}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Creación" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date
      return (
        <div className="text-sm">
          {createdAt ? formatDate(createdAt, 'dd/MM/yyyy', { locale: es }) : 'N/A'}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const project = row.original

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
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <SquarePen className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddPayment(project)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Agregar Pago
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewAccountStatement(project)}>
              <FileText className="mr-2 h-4 w-4" />
              Estado de Cuenta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]