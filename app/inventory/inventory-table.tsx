"use client";

// React
import { useCallback } from "react";

// Components
import { DataTable } from "@/components/data-table";

// Columns
import { columns } from "./columns";
import { ProductDTO } from "@/lib/types/product";

interface InventoryTableProps {
  products: ProductDTO[];
  onEdit?: (product: ProductDTO) => void;
  onDelete?: (product: ProductDTO) => void;
}

export default function InventoryTable({
  products,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const handleEdit = useCallback(
    (product: ProductDTO) => {
      if (onEdit) {
        onEdit(product);
      } else {
        console.log("Edit product:", product);
      }
    },
    [onEdit]
  );

  const handleDelete = useCallback(
    (product: ProductDTO) => {
      if (onDelete) {
        onDelete(product);
      } else {
        console.log("Delete product:", product);
      }
    },
    [onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={products}
      meta={{
        onEdit: handleEdit,
        onDelete: handleDelete,
      }}
    />
  );
}
