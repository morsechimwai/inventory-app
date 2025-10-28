"use client";

// React
import { useState, useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";

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
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { defaultFormValues, productFormSchema } from "./schemas";

export default function InventoryPage() {
  // Custom Hook Form
  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultFormValues,
    mode: "onBlur",
    reValidateMode: "onChange",
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

      if (result.success) {
        setProducts(result.data?.data ?? []);
      } else {
        toast.error(result.errorMessage ?? "Failed to load products");
        console.error(result.errorMessage, result.code);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load products."
      );
    }
  }, []);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    const toastId = toast.loading(
      editingProduct ? "Updating product..." : "Creating product..."
    );
    setSaving(true);

    // Prepare payload
    const payload = {
      name: values.name,
      sku: values.sku ?? null,
      price: values.price,
      quantity: values.quantity,
      lowStockAt: values.lowStockAt ?? null,
    };

    try {
      if (editingProduct) {
        // Edit existing product
        const result = await updateProductAction(editingProduct.id, payload);
        if (result.success) {
          toast.success(`${result.data?.message}`, { id: toastId });
          handleSheetOpenChange(false);
          await loadProducts();
        } else {
          toast.error(`${result.errorMessage}`, { id: toastId });
          console.error(result.errorMessage, result.code);
        }
      } else {
        // Create new product
        const result = await createProductAction(payload);
        if (result.success) {
          toast.success(`${result.data?.message}`, { id: toastId });
          handleSheetOpenChange(false);
          await loadProducts();
        } else {
          toast.error(`${result.errorMessage}`, { id: toastId });
          console.error(result.errorMessage, result.code);
        }
      }
    } catch (error) {
      // Standardize error message
      const errorMessage = error instanceof Error ? error.message : error;

      // Log and show error
      toast.error(`${errorMessage}`, { id: toastId });
      console.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Confirm delete product
  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    const toastId = toast.loading(`Deleting ${productToDelete.name}...`);
    try {
      const result = await deleteProductAction(productToDelete.id);

      if (result.success) {
        toast.success(`Deleted ${productToDelete.name}`);
        await loadProducts();
      } else {
        toast.error(`Failed to delete ${productToDelete.name}`);
        console.error(result.errorMessage, result.code);
      }
    } catch (error) {
      // Standardize error message
      const errorMessage = error instanceof Error ? error.message : error;

      // Log and show error
      toast.error(`${errorMessage}`, { id: toastId });
      console.error(errorMessage);
    } finally {
      setDeleting(false);
      setProductToDelete(null);
    }
  };

  // Handle sheet open/close
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingProduct(null);
      form.reset(defaultFormValues);
    }
  };

  // Open create product sheet
  const handleOpenCreate = () => {
    setEditingProduct(null);
    form.reset(defaultFormValues);
    setIsSheetOpen(true);
  };

  // Open edit product sheet
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

  // Handle delete product
  const handleDelete = useCallback((product: ProductDTO) => {
    setProductToDelete(product);
  }, []);

  // Memoized columns for DataTable
  const memoizedColumns = useMemo(
    () => columns(handleOpenEdit, handleDelete),
    [handleOpenEdit, handleDelete]
  );

  // Load on mount
  useEffect(() => {
    setLoading(true);
    loadProducts().finally(() => setLoading(false));
  }, [loadProducts]);

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
                <EmptyTitle>No product found.</EmptyTitle>
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
          <form
            className="flex h-full flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
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
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        type="text"
                        autoComplete="off"
                        disabled={saving}
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="sku"
                render={({ field, fieldState }) => {
                  const { value, ...fieldProps } = field;

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
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
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          type="text"
                          autoComplete="off"
                          disabled={saving}
                          value={value ?? ""}
                          aria-invalid={fieldState.invalid}
                          {...fieldProps}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  );
                }}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="price"
                  render={({ field, fieldState }) => {
                    const { value, ...fieldProps } = field;
                    const inputValue =
                      !isEditing && !fieldState.isDirty ? "" : value ?? "";

                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Price (THB)
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id={field.name}
                            type="number"
                            autoComplete="off"
                            disabled={saving}
                            value={inputValue}
                            aria-invalid={fieldState.invalid}
                            {...fieldProps}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                      </Field>
                    );
                  }}
                />

                <Controller
                  control={form.control}
                  name="quantity"
                  render={({ field, fieldState }) => {
                    const { value, ...fieldProps } = field;
                    const inputValue =
                      !isEditing && !fieldState.isDirty ? "" : value ?? "";

                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                        <FieldContent>
                          <Input
                            id={field.name}
                            type="number"
                            autoComplete="off"
                            disabled={saving}
                            value={inputValue}
                            aria-invalid={fieldState.invalid}
                            {...fieldProps}
                          />
                          <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                      </Field>
                    );
                  }}
                />
              </div>

              <Controller
                control={form.control}
                name="lowStockAt"
                render={({ field, fieldState }) => {
                  const { value, onChange, ...fieldProps } = field;
                  const inputValue = value ?? "";

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
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
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          type="number"
                          autoComplete="off"
                          disabled={saving}
                          value={inputValue}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            onChange(nextValue === "" ? undefined : nextValue);
                          }}
                          aria-invalid={fieldState.invalid}
                          {...fieldProps}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  );
                }}
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
