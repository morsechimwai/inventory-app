"use client";

// Icons
import { SquarePen, Trash2, MoreHorizontal } from "lucide-react";

// Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Types
import { ColumnDef } from "@tanstack/react-table";
import { ProductDTO } from "@/lib/types/product";

export const columns = (
  onEdit: (product: ProductDTO) => void,
  onDelete: (product: ProductDTO) => void
): ColumnDef<ProductDTO>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ getValue }) =>
      getValue<string>() ? getValue<string>().toUpperCase() : "-",
  },
  {
    accessorKey: "price",
    header: "Price (THB)",
    cell: ({ getValue }) => getValue<number>().toFixed(2),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
  },
  {
    accessorKey: "lowStockAt",
    header: "Low Stock At",
    cell: ({ getValue }) => `< ${getValue<number>()}`,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit(product)}>
              <SquarePen className="size-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(product)}
            >
              <Trash2 className="size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
