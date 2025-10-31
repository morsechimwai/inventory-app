"use client"

// Icons
import { MoreVertical, SquarePen, Trash2 } from "lucide-react"

// Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Tables
import type { ColumnDef } from "@tanstack/react-table"

// Types
import type { StockMovementDTO } from "@/lib/types/stock-movement"
import { MovementType, ReferenceType } from "@prisma/client"

// Utils
import { formatCurrencyTHBText } from "@/lib/utils"

const dateFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
})

const quantityFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
})

const movementTypeLabels: Record<MovementType, string> = {
  [MovementType.IN]: "Stock In",
  [MovementType.OUT]: "Stock Out",
  [MovementType.ADJUST]: "Adjust",
}

const referenceTypeLabels: Record<ReferenceType, string> = {
  [ReferenceType.PURCHASE]: "Purchase",
  [ReferenceType.SALE]: "Sale",
  [ReferenceType.RETURN]: "Return",
  [ReferenceType.TRANSFER]: "Transfer",
  [ReferenceType.ADJUSTMENT]: "Adjustment",
  [ReferenceType.MANUAL]: "Manual",
}

export const columns = (
  onEdit: (movement: StockMovementDTO) => void,
  onDelete: (movement: StockMovementDTO) => void
): ColumnDef<StockMovementDTO>[] => [
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) => dateFormatter.format(new Date(row.original.createdAt)),
  },
  {
    accessorKey: "product.name",
    header: "Product",
    cell: ({ row }) => row.original.product.name,
  },
  {
    accessorKey: "movementType",
    header: "Type",
    cell: ({ row }) => movementTypeLabels[row.original.movementType],
  },
  {
    id: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const { quantity, product } = row.original
      const unitName = product.unit?.name
      return `${quantityFormatter.format(quantity)}${unitName ? ` ${unitName}` : ""}`
    },
  },
  {
    accessorKey: "unitCost",
    header: "Unit Cost",
    cell: ({ row }) => {
      const { unitCost } = row.original
      return unitCost !== null && unitCost !== undefined ? formatCurrencyTHBText(unitCost) : "-"
    },
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => {
      const { totalCost } = row.original
      return totalCost !== null && totalCost !== undefined ? formatCurrencyTHBText(totalCost) : "-"
    },
  },
  {
    accessorKey: "referenceType",
    header: "Reference",
    cell: ({ row }) => {
      const { referenceType, referenceId } = row.original
      const label = referenceTypeLabels[referenceType]
      return referenceId ? `${label} • ${referenceId}` : label
    },
  },
  {
    accessorKey: "reason",
    header: "Notes",
    cell: ({ row }) => row.original.reason ?? "-",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const movement = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-end" variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(movement)}>
              <SquarePen className="size-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(movement)}>
              <Trash2 className="size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
