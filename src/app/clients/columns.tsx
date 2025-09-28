"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SquarePen,
  Trash2,
  GanttChartSquare,
  DollarSign,
  FileText,
  Loader2
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { Client } from '@/types/client'

interface ClientsColumnsProps {
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
  onRegisterPayment: (clientId: string) => void
  onAccountStatement: () => void
  isRowMutating: (client: Client) => boolean
}

export const createClientsColumns = ({
  onEdit,
  onDelete,
  onRegisterPayment,
  onAccountStatement,
  isRowMutating,
}: ClientsColumnsProps): ColumnDef<Client>[] => [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const client = row.original
      const isMutating = isRowMutating(client)

      return (
        <div className={`font-medium ${isMutating ? 'opacity-50' : ''}`}>
          {name}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const name = row.getValue(id) as string
      return name?.toLowerCase().includes(value.toLowerCase()) ?? false
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string
      const client = row.original
      const isMutating = isRowMutating(client)

      if (!phone) {
        return <span className={`text-muted-foreground ${isMutating ? 'opacity-50' : ''}`}>—</span>
      }

      return (
        <div className={isMutating ? 'opacity-50' : ''}>
          {phone}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Correo Electrónico" />
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      const client = row.original
      const isMutating = isRowMutating(client)

      if (!email) {
        return <span className={`text-muted-foreground ${isMutating ? 'opacity-50' : ''}`}>—</span>
      }

      return (
        <div className={isMutating ? 'opacity-50' : ''}>
          {email}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const email = row.getValue(id) as string
      return email?.toLowerCase().includes(value.toLowerCase()) ?? false
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original
      const isMutating = isRowMutating(client)

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isMutating}
                aria-label="Más acciones para el cliente"
              >
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GanttChartSquare className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => onRegisterPayment(client.id)}
                disabled={isMutating}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Registrar Pago</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onAccountStatement}
                disabled={isMutating}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Estado de cuenta</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => onEdit(client)}
                disabled={isMutating}
              >
                <SquarePen className="mr-2 h-4 w-4" />
                <span>Editar cliente</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onDelete(client)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                disabled={isMutating}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Eliminar cliente</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]