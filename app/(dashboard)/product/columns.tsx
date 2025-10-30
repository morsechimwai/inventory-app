"use client"

// Icons
import { SquarePen, Trash2, MoreVertical } from "lucide-react"

// Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Types
import { ColumnDef } from "@tanstack/react-table"
import { ProductDTO } from "@/lib/types/product"

// Utils
import { formatCurrencyTHB } from "@/lib/utils"

export const columns = (
  onEdit: (product: ProductDTO) => void,
  onDelete: (product: ProductDTO) => void
): ColumnDef<ProductDTO>[] => [
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ getValue }) => getValue<string>().toUpperCase() || "-",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: "categoryId",
    header: "Category",
    cell: ({ getValue }) => getValue<string>() || "-",
  },
  {
    accessorKey: "lowStockAt",
    header: "Low Stock At",
    cell: ({ getValue }) => (getValue<number>() ? `< ${getValue<number>()}` : `-`),
  },
  {
    accessorKey: "unitId",
    header: "Unit",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const product = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-end" variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(product)}>
              <SquarePen className="size-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(product)}>
              <Trash2 className="size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
