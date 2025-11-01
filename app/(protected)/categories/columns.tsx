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
import { CategoryDTO } from "@/lib/types/category"
import { AppColumnDef } from "@/lib/types/data-table"

export const columns = (
  onEdit: (category: CategoryDTO) => void,
  onDelete: (category: CategoryDTO) => void
): AppColumnDef<CategoryDTO>[] => [
  {
    accessorKey: "name",
    header: "Name",
    enableSearch: true,
    cell: ({ row }) => (
      <div className="inline-flex items-center gap-1">
        <Tags className="size-3.5" />
        {row.original.name}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const category = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-end" variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <SquarePen className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(category)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
