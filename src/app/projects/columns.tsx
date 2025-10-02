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
import { ProjectSummary } from '@/components/summary'
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
      <DataTableColumnHeader column={column} title="Proyecto" />
    ),
    cell: ({ row }) => {
      const project = row.original
      return <ProjectSummary project={project} />
    },
    filterFn: (row, _id, value) => {
      const project = row.original
      const projectNumber = project.projectNumber || ''
      const clientName = project.clientName || ''
      const glosa = project.glosa || ''
      const searchTerm = value.toLowerCase()

      return projectNumber.toLowerCase().includes(searchTerm) ||
             clientName.toLowerCase().includes(searchTerm) ||
             glosa.toLowerCase().includes(searchTerm)
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" className="justify-center"/>
    ),
    cell: ({ row, table }) => {
      const status = row.getValue("status") as string
      const statusOption = PROJECT_STATUS_OPTIONS.find(opt => opt.value === status)
      const variant = getStatusBadgeVariant(status)
      const project = row.original

      // Obtener funciones del meta de la tabla
      const handleStatusChange = (table.options.meta as any)?.handleStatusChange
      const updateStatusMutation = (table.options.meta as any)?.updateStatusMutation

      if (!handleStatusChange) {
        return (
          <Badge 
          variant={variant}
          className="flex justify-center">
            {statusOption?.label || status}
          </Badge>
        )
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="p-0 h-auto font-normal "
              disabled={updateStatusMutation?.isPending}
            >
              <Badge variant={variant} className="cursor-pointer">
                {updateStatusMutation?.isPending && updateStatusMutation?.variables?.projectId === project.id
                  ? "Actualizando..."
                  : (statusOption?.label || status)
                }
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PROJECT_STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleStatusChange(project.id, option.value)}
                disabled={option.value === status || updateStatusMutation?.isPending}
              >
                <Badge variant={getStatusBadgeVariant(option.value)} className="mr-2">
                  {option.label}
                </Badge>
                {option.label}
                {option.value === status && " (Actual)"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Valor Proyecto" className="justify-end"/>
    ),
    cell: ({ row }) => {
      const totalValue = row.getValue("total") as number
      return (
        <div className="font-medium text-right">
          {formatCurrency(totalValue)}
        </div>
      )
    },
  },
  {
    accessorKey: "totalPayments",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Abonos" className="justify-end" />
    ),
    cell: ({ row }) => {
      const totalPaid = row.getValue("totalPayments") as number
      const percentage = row.original.totalPaymentPercentage
      const variant = getPaymentPercentageBadgeVariant(percentage)

      return (
        <div className="flex justify-end gap-2">
          <span className="font-medium">
            {formatCurrency(totalPaid)}
          </span>
          <Badge variant={variant} className="text-xs">
            {percentage?.toFixed(0)}%
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Saldo" className="justify-end" />
    ),
    cell: ({ row }) => {
      const balance = row.getValue("balance") as number
      return (
        <div className="font-medium text-right">
          {formatCurrency(balance)}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" className="justify-center"/>
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date
      return (
        <div className="text-sm text-center">
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