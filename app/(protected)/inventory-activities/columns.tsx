"use client"

// Icons
import {
  ArrowDownToLine,
  ArrowUpToLine,
  LucideIcon,
  MoreVertical,
  SquarePen,
  Trash2,
} from "lucide-react"

// Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Types
import { AppColumnDef } from "@/lib/types/data-table"
import type { StockMovementDTO } from "@/lib/types/stock-movement"
import { MovementType, ReferenceType } from "@prisma/client"

// Utils
import { dateFormatter, quantityFormatter, currencyFormatterTHB } from "@/lib/utils/formatters"
import { createElement } from "react"

const movementTypeLabels: Record<MovementType, { title: string; icon: LucideIcon }> = {
  IN: {
    title: "Stock In",
    icon: ArrowDownToLine,
  },
  OUT: {
    title: "Stock Out",
    icon: ArrowUpToLine,
  },
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
): AppColumnDef<StockMovementDTO>[] => [
  {
    accessorKey: "createdAt",
    header: "When",
    enableSearch: true,
    cell: ({ row }) => dateFormatter.format(new Date(row.original.createdAt)),
  },
  {
    accessorKey: "product.name",
    header: "Product",
    enableSearch: true,
    cell: ({ row }) => row.original.product.name,
  },
  {
    accessorKey: "movementType",
    header: "Type",
    enableSearch: true,
    cell: ({ row }) => {
      const { movementType } = row.original
      const meta = movementType
        ? movementTypeLabels[movementType]
        : { title: movementType, icon: ArrowDownToLine }
      return (
        <div className="inline-flex items-center gap-1">
          {createElement(meta.icon, { className: "size-3.5" })}
          {meta.title}
        </div>
      )
    },
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
      return unitCost !== null && unitCost !== undefined
        ? currencyFormatterTHB.format(unitCost)
        : "-"
    },
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => {
      const { totalCost } = row.original
      return totalCost !== null && totalCost !== undefined
        ? currencyFormatterTHB.format(totalCost)
        : "-"
    },
  },
  {
    accessorKey: "referenceType",
    header: "Reference",
    enableSearch: true,
    cell: ({ row }) => {
      const { referenceType, referenceId } = row.original
      const label = referenceTypeLabels[referenceType]
      return referenceId ? `${label} • ${referenceId}` : label
    },
  },
  {
    accessorKey: "reason",
    header: "Notes",
    enableSearch: true,
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
