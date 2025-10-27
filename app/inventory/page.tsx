"use client";

// React
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";

// Validation
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Components
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/lib/actions/products";
import { toast } from "sonner";
import { Container, ListPlus, PlusCircle, SquarePen } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sku: z.string().optional(),
  price: z
    .number({ message: "Price is required" })
    .min(0, "Price must be at least 0"),
  quantity: z
    .number({ message: "Quantity is required" })
    .int("Quantity must be an integer")
    .min(0, "Quantity must be at least 0"),
  lowStockAt: z
    .number({ message: "Low stock must be a number" })
    .int("Low stock must be an integer")
    .min(0, "Low stock must be at least 0")
    .optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const defaultFormValues: ProductFormValues = {
  name: "",
  sku: undefined,
  price: 0,
  quantity: 0,
  lowStockAt: undefined,
};

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductDTO | null>(
    null
  );
  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Loading state
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultFormValues,
  });

  const loadProducts = useCallback(async () => {
    try {
      const result = await getAllProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadProducts().finally(() => setLoading(false));
  }, [loadProducts]);

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      setIsSheetOpen(open);
      if (!open) {
        setEditingProduct(null);
        form.reset(defaultFormValues);
      }
    },
    [form]
  );

  const handleOpenCreate = useCallback(() => {
    setEditingProduct(null);
    form.reset(defaultFormValues);
    setIsSheetOpen(true);
  }, [form]);

  const handleOpenEdit = useCallback(
    (product: ProductDTO) => {
      setEditingProduct(product);
      form.reset({
        name: product.name,
        sku: product.sku ?? undefined,
        price: product.price,
        quantity: product.quantity,
        lowStockAt: product.lowStockAt ?? undefined,
      });
      setIsSheetOpen(true);
    },
    [form]
  );

  const handleDelete = useCallback((product: ProductDTO) => {
    setProductToDelete(product);
  }, []);

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
    } finally {
      toast.dismiss(toastId);
      setDeleting(false);
      setProductToDelete(null);
    }
  }, [productToDelete]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);

    const trimmedSku = values.sku?.trim();
    const payload = {
      name: values.name,
      sku: trimmedSku && trimmedSku.length ? trimmedSku : null,
      price: values.price,
      quantity: values.quantity,
      lowStockAt: values.lowStockAt ?? null,
    };

    try {
      if (editingProduct) {
        const result = await updateProductAction(editingProduct.id, payload);
        if (result.success) {
          toast.success(`Updated ${values.name}`);
          await loadProducts();
          handleSheetOpenChange(false);
        } else {
          toast.error(`Failed to update ${values.name}`);
        }
      } else {
        const result = await createProductAction(payload);
        if (result.success) {
          toast.success(`Created ${values.name}`);
          await loadProducts();
          handleSheetOpenChange(false);
        } else {
          toast.error(`Failed to create ${values.name}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : error;
      console.error("Error saving product:", errorMessage);
      toast.error(`Error saving product: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  });

  const isEditing = Boolean(editingProduct);

  return (
    <>
      <SideBar currentPath="/inventory" />
      <main className="ml-64 p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold font-sans">Inventory</h1>
            <p className="text-muted-foreground font-sans">
              Manage your inventory and track your products here.
            </p>
          </div>
          {products.length > 0 && (
            <Button
              className="font-sans font-bold text-sm"
              onClick={handleOpenCreate}
              disabled={saving}
            >
              <ListPlus className="mr-1 size-4" />
              <span>Add Product</span>
            </Button>
          )}
        </div>

        {loading ? (
          <TableLoading />
        ) : (
          <DataTable
            columns={columns}
            data={products}
            meta={{
              onEdit: handleOpenEdit,
              onDelete: handleDelete,
            }}
            emptyComponent={
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Container className="size-8 p-1" />
                  </EmptyMedia>
                  <EmptyTitle>No Product Data</EmptyTitle>
                  <EmptyDescription>
                    Get started by adding your first product to the inventory.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent className="flex items-center">
                  <Button
                    className="font-sans font-bold text-sm"
                    onClick={handleOpenCreate}
                    disabled={saving}
                  >
                    <ListPlus className="mr-1 size-4" />
                    <span>Add Product</span>
                  </Button>
                </EmptyContent>
              </Empty>
            }
          />
        )}

        <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetContent side="right">
            <Form {...form}>
              <form className="flex h-full flex-col" onSubmit={onSubmit}>
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    {isEditing ? (
                      <SquarePen className="mr-1 size-4.5" />
                    ) : (
                      <ListPlus className="mr-1 size-4.5" />
                    )}
                    <span className="text-bold">
                      {isEditing ? "Edit Product" : "Add Product"}
                    </span>
                  </SheetTitle>
                  <SheetDescription>
                    {isEditing
                      ? "Update the product details below."
                      : "Add a new product to your inventory."}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input disabled={saving} {...field} />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          SKU
                          <span className="ml-1 text-sm font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={saving}
                            value={field.value ?? ""}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Price (THB)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              disabled={saving}
                              value={field.value ?? ""}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                if (nextValue === "") {
                                  field.onChange(undefined);
                                  return;
                                }
                                const parsed = Number(nextValue);
                                field.onChange(
                                  Number.isNaN(parsed) ? undefined : parsed
                                );
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              disabled={saving}
                              value={field.value ?? ""}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                if (nextValue === "") {
                                  field.onChange(undefined);
                                  return;
                                }
                                const parsed = Number(nextValue);
                                field.onChange(
                                  Number.isNaN(parsed) ? undefined : parsed
                                );
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="lowStockAt"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          Low Stock At
                          <span className="ml-1 text-sm font-normal text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            disabled={saving}
                            value={field.value ?? ""}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              if (nextValue === "") {
                                field.onChange(undefined);
                                return;
                              }
                              const parsed = Number(nextValue);
                              field.onChange(
                                Number.isNaN(parsed) ? undefined : parsed
                              );
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>

                <SheetFooter className="sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSheetOpenChange(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {isEditing ? "Save changes" : "Create product"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>

        <Dialog
          open={!!productToDelete}
          onOpenChange={(open) => {
            if (!open && !deleting) {
              setProductToDelete(null);
            }
          }}
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
