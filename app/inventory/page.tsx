"use client";

// React
import { useState, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/components/data-table";
import TableLoading from "@/components/skeleton/table-loading";
import { toast } from "sonner";

// Icons
import { Container, Info, ListPlus, SquarePen } from "lucide-react";

// Types
import { ProductDTO } from "@/lib/types/product";

// Data Table Columns
import { columns } from "./columns";

// Actions
import { getAllProducts } from "@/lib/actions/products";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/lib/actions/products";

// Validation
import { zodResolver } from "@hookform/resolvers/zod";
import {
  defaultFormValues,
  productFormSchema,
  ProductFormValues,
} from "./schemas";

export default function InventoryPage() {
  // Custom Hook Form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultFormValues,
    mode: "onSubmit",
  });

  // Products state
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

  // Load products
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

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingProduct(null);
      form.reset(defaultFormValues);
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    form.reset(defaultFormValues);
    setIsSheetOpen(true);
  };

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

  // Memoized columns for DataTable
  const memoizedColumns = useMemo(
    () => columns(handleOpenEdit, handleDelete),
    [handleOpenEdit, handleDelete]
  );

  const confirmDelete = async () => {
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
  };

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
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-muted-foreground font-sans">
          Manage your inventory and track your products here.
        </p>
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
          columns={memoizedColumns}
          data={products}
          emptyComponent={
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Container className="size-8 p-1" />
                </EmptyMedia>
                <EmptyTitle>No Data</EmptyTitle>
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
                        <Input type="text" disabled={saving} {...field} />
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
                        <span>SKU</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-3.5 text-sm font-normal" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Stock Keeping Unit (SKU)</p>
                          </TooltipContent>
                        </Tooltip>

                        <span className="text-sm font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input type="text" disabled={saving} {...field} />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field, fieldState }) => {
                      const { value, ...fieldProps } = field;
                      const inputValue =
                        !isEditing && !fieldState.isDirty
                          ? ""
                          : value ?? "";

                      return (
                        <FormItem>
                          <FormLabel>Price (THB)</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              disabled={saving}
                              value={inputValue}
                              {...fieldProps}
                            />
                          </FormControl>
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field, fieldState }) => {
                      const { value, ...fieldProps } = field;
                      const inputValue =
                        !isEditing && !fieldState.isDirty
                          ? ""
                          : value ?? "";

                      return (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              disabled={saving}
                              value={inputValue}
                              {...fieldProps}
                            />
                          </FormControl>
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="lowStockAt"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>
                        <span>Low Stock At</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="size-3.5 text-sm font-normal" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Low stock threshold</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="text-sm font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input type="text" disabled={saving} {...field} />
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
                  {isEditing ? "Save changes" : "Add product"}
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
    </div>
  );
}
