"use client"

// Icons
import { SquarePen, Trash2, MoreVertical, Hash } from "lucide-react"

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
import { UnitDTO } from "@/lib/types/unit"

export const columns = (
  onEdit: (unit: UnitDTO) => void,
  onDelete: (unit: UnitDTO) => void
): ColumnDef<UnitDTO>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ getValue }) => (
      <span>
        <Hash className="inline-block mr-1 text-muted-foreground size-4" />
        {getValue<string>()}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const unit = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-end" variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(unit)}>
              <SquarePen className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(unit)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
