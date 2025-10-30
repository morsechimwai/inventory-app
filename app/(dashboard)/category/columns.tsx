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
import { ColumnDef } from "@tanstack/react-table"
import { CategoryDTO } from "@/lib/types/category"

export const columns = (
  onEdit: (category: CategoryDTO) => void,
  onDelete: (category: CategoryDTO) => void
): ColumnDef<CategoryDTO>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ getValue }) => (
      <span>
        <Tags className="inline-block mr-1 text-muted-foreground size-4" />
        {getValue<string>()}
      </span>
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
