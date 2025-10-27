"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDTO } from "@/lib/types/product";

type ProductTableMeta = {
  onEdit?: (product: ProductDTO) => void;
  onDelete?: (product: ProductDTO) => void;
};

export const columns: ColumnDef<ProductDTO>[] = [
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
    header: "Price",
    cell: ({ getValue }) => `${getValue<number>().toFixed(2)} THB`,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "lowStockAt",
    header: "Low Stock At",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const product = row.original;
      const meta = table.options.meta as ProductTableMeta | undefined;

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
            <DropdownMenuItem onSelect={() => meta?.onEdit?.(product)}>
              <Edit3 className="size-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => meta?.onDelete?.(product)}
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
