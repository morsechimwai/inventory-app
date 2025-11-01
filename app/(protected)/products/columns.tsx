"use client"

// Icons
import { SquarePen, Trash2, MoreVertical, Tags } from "lucide-react"

// Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Types
import { ProductDTO } from "@/lib/types/product"
import { AppColumnDef } from "@/lib/types/data-table"

export const columns = (
  onEdit: (product: ProductDTO) => void,
  onDelete: (product: ProductDTO) => void
): AppColumnDef<ProductDTO>[] => [
  {
    accessorKey: "sku",
    header: "SKU",
    enableSearch: true,
    cell: ({ row }) => row.original.sku || "-",
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSearch: true,
    cell: ({ row }) => row.original.name || "-",
  },
  {
    accessorKey: "category.name",
    header: "Category",
    enableSearch: true,
    cell: ({ row }) => {
      const categoryName = row.original.category?.name
      return (
        <div className="inline-flex items-center gap-1">
          <Tags className="size-3.5" />
          <span>{categoryName ? categoryName : "Uncategorized"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "currentStock",
    header: "Current Stock",
    cell: ({ row }) => {
      const { currentStock, unit } = row.original
      const unitName = unit?.name
      return `${currentStock} ${unitName}`
    },
  },
  {
    accessorKey: "lowStockAt",
    header: "Low Stock At",
    cell: ({ row }) => {
      const { lowStockAt, unit } = row.original
      const unitName = unit?.name
      return lowStockAt ? `< ${lowStockAt} ${unitName}` : `-`
    },
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
