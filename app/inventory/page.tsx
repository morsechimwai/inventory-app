"use client";

// React
import { useState, useCallback, useEffect } from "react";

// Components
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SideBar from "@/components/sidebar";
import { DataTable } from "@/components/data-table";
import TableLoading from "@/components/skeleton/table-loading";

// Data Table Columns
import { columns } from "./columns";

// Types
import { ProductDTO } from "@/lib/types/product";

// Actions
import { getAllProducts } from "@/lib/actions/products";
import {
  deleteProductAction,
  updateProductAction,
} from "@/lib/actions/products";
import { toast } from "sonner";

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [productToDelete, setProductToDelete] = useState<ProductDTO | null>(
    null
  );

  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    setDeleting(true);
    const toastId = toast.loading(`Deleting ${productToDelete.name}...`);
    try {
      const result = await deleteProductAction(productToDelete.id);

      if (result.success) {
        setProducts((prev) =>
          prev.filter((product) => product.id !== productToDelete.id)
        );
        toast.success(`Deleted ${productToDelete.name}`);
      } else {
        toast.error(`Failed to delete ${productToDelete.name}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(`Error deleting ${productToDelete.name}`);
      setDeleting(false);
    } finally {
      setProductToDelete(null);
      setDeleting(false);
      toast.dismiss(toastId);
    }
  }, [productToDelete]);

  const handleEdit = useCallback(async (product: ProductDTO) => {
    const result = await updateProductAction(product.id, product);
    if (result.success) console.log("Updated:", product.name);
  }, []);

  const handleDelete = useCallback((product: ProductDTO) => {
    setProductToDelete(product);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getAllProducts();
        if (result.success && result.data) setProducts(result.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <SideBar currentPath="/inventory" />
      <main className="ml-64 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your inventory and track your products here.
          </p>
        </div>

        {loading ? (
          <TableLoading />
        ) : (
          <DataTable
            columns={columns}
            data={products}
            meta={{
              onEdit: handleEdit,
              onDelete: handleDelete,
            }}
          />
        )}

        <Dialog
          open={!!productToDelete}
          onOpenChange={() => setProductToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <p>
                Are you sure you want to delete{" "}
                <strong>{productToDelete?.name}</strong>?
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                className="text-red-100"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleting}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}
