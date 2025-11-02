"use client"

// React
import { useCallback, useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"

// Next.js
import Link from "next/link"

// Validation
import { zodResolver } from "@hookform/resolvers/zod"

// UI Components
import { Button } from "@/components/ui/button"
import TableLoading from "@/components/skeleton/table-loading"
import { DataTable } from "@/components/data-table"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import SelectCombobox, { type ComboboxOption } from "@/components/ui/select-combobox"

// Icons
import type { LucideIcon } from "lucide-react"
import { ArrowDownToLine, ArrowUpToLine, History, Forklift } from "lucide-react"

// Toast
import { toast } from "sonner"

// Data Table Columns
import { columns } from "./columns"

// Schema
import { defaultFormValues, stockMovementFormSchema, type StockMovementFormValues } from "./schema"

// Types
import type { StockMovementDTO } from "@/lib/types/stock-movement"
import type { ProductDTO } from "@/lib/types/product"
import { MovementType, ReferenceType } from "@prisma/client"

// Actions
import {
  createStockMovementAction,
  deleteStockMovementAction,
  getAllStockMovements,
  updateStockMovementAction,
} from "@/lib/actions/stock-movements"
import { getAllProducts } from "@/lib/actions/products"

// Meta info for movement types
type MovementDetail = {
  buttonLabel: string
  createTitle: string
  editTitle: string
  description: string
  icon: LucideIcon
}

const movementTypeMeta: Record<MovementType, MovementDetail> = {
  [MovementType.IN]: {
    buttonLabel: "Stock In",
    createTitle: "Stock In",
    editTitle: "Edit Stock In",
    description: "Capture stock that just arrived so your counts stay accurate.",
    icon: ArrowDownToLine,
  },
  [MovementType.OUT]: {
    buttonLabel: "Stock Out",
    createTitle: "Stock Out",
    editTitle: "Edit Stock Out",
    description: "Track what leaves the shelf — sales, usage, or transfers.",
    icon: ArrowUpToLine,
  },
  [MovementType.ADJUST]: {
    buttonLabel: "Adjustment",
    createTitle: "Adjustment",
    editTitle: "Edit Adjustment",
    description: "Correct stock by difference: + adds, - subtracts.",
    icon: Forklift,
  },
}

// Reference type options
const referenceTypeOptions = Object.values(ReferenceType)
const movementButtonOrder: MovementType[] = [MovementType.IN, MovementType.OUT, MovementType.ADJUST]

export default function InventoryActivityPage() {
  // Form
  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementFormSchema),
    defaultValues: defaultFormValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  // State
  const [stockMovements, setStockMovements] = useState<StockMovementDTO[]>([])
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [editingStockMovement, setEditingStockMovement] = useState<StockMovementDTO | null>(null)
  const [stockMovementToDelete, setStockMovementToDelete] = useState<StockMovementDTO | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Derived state
  const isEditing = Boolean(editingStockMovement)
  const currentMovementType = form.watch("movementType") ?? MovementType.IN
  const movementMeta = movementTypeMeta[currentMovementType]
  const SheetIcon = movementMeta.icon
  const headerTitle = isEditing ? movementMeta.editTitle : movementMeta.createTitle
  const headerDescription = isEditing
    ? "Update the activity details below."
    : movementMeta.description
  const selectedProductId = form.watch("productId")
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  )
  const productOptions = useMemo<ComboboxOption[]>(
    () =>
      products.map((product) => ({
        label: product.sku ? `${product.name} | ${product.sku}` : product.name,
        value: product.id,
      })),
    [products]
  )
  const quantityValue = form.watch("quantity")
  const unitCostValue = form.watch("unitCost")

  // Load stock movements
  const loadStockMovements = useCallback(async () => {
    try {
      const result = await getAllStockMovements()

      if (result.success) {
        setStockMovements(result.data?.data ?? [])
      } else {
        toast.error(result.errorMessage ?? "Failed to load activity")
        console.error(result.errorMessage, result.code, result.meta)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to load activity.")
    }
  }, [])

  // Load products for selects
  const loadProducts = useCallback(async () => {
    try {
      const result = await getAllProducts()

      if (result.success) {
        setProducts(result.data?.data ?? [])
      } else {
        toast.error(result.errorMessage ?? "Failed to load products")
        console.error(result.errorMessage, result.code, result.meta)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to load products.")
    }
  }, [])

  // Submit handler
  const onSubmit = async (values: StockMovementFormValues) => {
    const toastId = toast.loading(isEditing ? "Updating activity..." : "Logging activity...")
    setSaving(true)

    const payload = {
      productId: values.productId,
      movementType: values.movementType,
      quantity: values.quantity,
      unitCost: values.unitCost ?? null,
      totalCost: values.totalCost ?? null,
      referenceType: values.referenceType,
      referenceId: values.referenceId ?? null,
      reason: values.reason ?? null,
    }

    try {
      if (isEditing && editingStockMovement) {
        const result = await updateStockMovementAction(editingStockMovement.id, payload)
        if (result.success) {
          toast.success(result.data?.message ?? "Activity updated.", { id: toastId })
          handleSheetOpenChange(false)
          await loadStockMovements()
        } else {
          toast.error(result.errorMessage ?? "Failed to update activity.", { id: toastId })
          console.error(result.errorMessage, result.code, result.meta)
        }
      } else {
        const result = await createStockMovementAction(payload)
        if (result.success) {
          toast.success(result.data?.message ?? "Activity logged.", { id: toastId })
          handleSheetOpenChange(false)
          await loadStockMovements()
        } else {
          toast.error(result.errorMessage ?? "Failed to log activity.", { id: toastId })
          console.error(result.errorMessage, result.code, result.meta)
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong."
      toast.error(errorMessage, { id: toastId })
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  // Confirm delete handler
  const confirmDelete = async () => {
    if (!stockMovementToDelete) return

    setDeleting(true)
    const toastId = toast.loading("Removing activity...")
    try {
      const result = await deleteStockMovementAction(stockMovementToDelete.id)

      if (result.success) {
        toast.success("Activity removed.", { id: toastId })
        await loadStockMovements()
      } else {
        toast.error(result.errorMessage ?? "Failed to remove activity.", { id: toastId })
        console.error(result.errorMessage, result.code, result.meta)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove activity."
      toast.error(errorMessage, { id: toastId })
      console.error(error)
    } finally {
      setDeleting(false)
      setStockMovementToDelete(null)
    }
  }

  // Handle sheet open/close
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) {
      setEditingStockMovement(null)
      form.reset(defaultFormValues)
    }
  }

  // Open create sheet
  const handleOpenCreate = (movementType: MovementType) => {
    setEditingStockMovement(null)
    form.reset({
      ...defaultFormValues,
      movementType,
      productId: products[0]?.id ?? "",
    })
    setIsSheetOpen(true)
  }

  // Open edit sheet
  const handleOpenEdit = useCallback(
    (movement: StockMovementDTO) => {
      setEditingStockMovement(movement)
      form.reset({
        productId: movement.product.id,
        movementType: movement.movementType,
        quantity: movement.quantity,
        unitCost: movement.unitCost ?? undefined,
        totalCost: movement.totalCost ?? undefined,
        referenceType: movement.referenceType,
        referenceId: movement.referenceId ?? undefined,
        reason: movement.reason ?? undefined,
      })
      setIsSheetOpen(true)
    },
    [form]
  )

  // Handle delete
  const handleDelete = useCallback((movement: StockMovementDTO) => {
    setStockMovementToDelete(movement)
  }, [])

  // Memoized columns
  const memoizedColumns = useMemo(
    () => columns(handleOpenEdit, handleDelete),
    [handleOpenEdit, handleDelete]
  )

  // Load data on mount
  useEffect(() => {
    setLoading(true)
    Promise.all([loadStockMovements(), loadProducts()]).finally(() => setLoading(false))
  }, [loadProducts, loadStockMovements])

  // Auto-select first product when creating
  useEffect(() => {
    if (!isSheetOpen) return
    if (editingStockMovement) return
    if (products.length === 0) return

    const currentProductId = form.getValues("productId")
    if (!currentProductId) {
      form.setValue("productId", products[0].id)
    }
  }, [editingStockMovement, form, isSheetOpen, products])

  useEffect(() => {
    if (!isSheetOpen) return

    const hasQuantity = quantityValue !== undefined && quantityValue !== null && quantityValue !== 0
    const hasUnitCost = unitCostValue !== undefined && unitCostValue !== null && unitCostValue !== 0

    const currentTotal = form.getValues("totalCost")

    if (!hasQuantity || !hasUnitCost) {
      if (currentTotal !== undefined) {
        form.setValue("totalCost", undefined, { shouldDirty: false })
      }
      return
    }

    const parsedQuantity = Number(quantityValue)
    const parsedUnitCost = Number(unitCostValue)

    if (Number.isNaN(parsedQuantity) || Number.isNaN(parsedUnitCost)) {
      if (currentTotal !== undefined) {
        form.setValue("totalCost", undefined, { shouldDirty: false })
      }
      return
    }

    const computed = Number((parsedQuantity * parsedUnitCost).toFixed(2))

    if (currentTotal !== computed) {
      form.setValue("totalCost", computed, { shouldDirty: false })
    }
  }, [form, isSheetOpen, quantityValue, unitCostValue])

  const disableCreateButtons = products.length === 0 || saving

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-muted-foreground font-sans">
          Keep an eye on every stock change — what came in, what went out, and the tweaks in
          between.
        </p>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {stockMovements.length > 0 &&
            movementButtonOrder.map((type) => {
              const { buttonLabel, icon: Icon } = movementTypeMeta[type]
              return (
                <Button
                  key={type}
                  className="font-sans font-bold text-sm"
                  onClick={() => handleOpenCreate(type)}
                  disabled={disableCreateButtons}
                >
                  <Icon className="mr-1 size-4" />
                  <span>{buttonLabel}</span>
                </Button>
              )
            })}
        </div>
      </div>

      {loading ? (
        <TableLoading />
      ) : (
        <DataTable
          columns={memoizedColumns}
          data={stockMovements}
          emptyComponent={
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History className="size-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No activity yet</EmptyTitle>
              </EmptyHeader>
              <EmptyContent className="mt-2">
                {products.length === 0 ? (
                  <>
                    <EmptyDescription className="text-sm text-amber-500">
                      Add a product first so we know which item you&apos;re updating.
                    </EmptyDescription>
                    <Button variant="link" asChild>
                      <Link href="/products" className="font-sans font-bold text-sm">
                        Add Product
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2">
                      {movementButtonOrder.map((type) => {
                        const { buttonLabel, icon: Icon } = movementTypeMeta[type]
                        return (
                          <Button
                            key={type}
                            className="font-sans font-bold text-sm"
                            onClick={() => handleOpenCreate(type)}
                            disabled={disableCreateButtons}
                          >
                            <Icon className="mr-1 size-4" />
                            <span>{buttonLabel}</span>
                          </Button>
                        )
                      })}
                    </div>
                    <EmptyDescription>
                      Log your first stock movement to start a clean activity trail.
                    </EmptyDescription>
                  </>
                )}
              </EmptyContent>
            </Empty>
          }
        />
      )}

      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" className="w-[95vw]">
          <form className="flex h-full flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center">
                <SheetIcon className="mr-1 size-4.5" />
                <span className="text-bold">{headerTitle}</span>
              </SheetTitle>
              <SheetDescription>{headerDescription}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Product */}
              <Controller
                control={form.control}
                name="productId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Product</FieldLabel>
                    <FieldContent>
                      <SelectCombobox
                        id={field.name}
                        value={field.value ? String(field.value) : undefined}
                        onChange={(next) => field.onChange(next ?? "")}
                        onBlur={field.onBlur}
                        disabled={saving || products.length === 0}
                        placeholder={
                          products.length === 0 ? "No products available" : "Search product..."
                        }
                        options={productOptions}
                        ariaInvalid={fieldState.invalid}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Quantity */}
              <Controller
                control={form.control}
                name="quantity"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Quantity
                      {selectedProduct ? ` (${selectedProduct.unit.name})` : ""}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        type="number"
                        inputMode="decimal"
                        step="0.001"
                        placeholder={
                          currentMovementType === MovementType.ADJUST ? "+5 or -3" : "e.g. 25"
                        }
                        autoComplete="off"
                        disabled={saving}
                        aria-invalid={fieldState.invalid}
                        onKeyDown={(event) => {
                          const isAdjust = form.getValues("movementType") === MovementType.ADJUST

                          // Always block scientific notation
                          if (["e", "E"].includes(event.key)) return event.preventDefault()

                          // Allow +/- only in ADJUST mode
                          if (!isAdjust && ["+", "-"].includes(event.key))
                            return event.preventDefault()
                        }}
                        {...field}
                      />
                      {currentMovementType === MovementType.ADJUST && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter difference: +5 to add stock, -2 to remove stock.
                        </p>
                      )}
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Unit Cost */}
              <Controller
                control={form.control}
                name="unitCost"
                render={({ field, fieldState }) => {
                  const { value, onChange, ...fieldProps } = field
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Unit Cost{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          placeholder="e.g. 120.00"
                          autoComplete="off"
                          disabled={saving}
                          aria-invalid={fieldState.invalid}
                          value={value ?? ""}
                          onChange={(event) =>
                            onChange(event.target.value === "" ? undefined : event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (["e", "E", "+", "-"].includes(event.key)) event.preventDefault()
                          }}
                          {...fieldProps}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )
                }}
              />

              {/* Total Cost */}
              <Controller
                control={form.control}
                name="totalCost"
                render={({ field, fieldState }) => {
                  const { value, ref, name } = field
                  const displayValue =
                    value === undefined || value === null ? "" : Number(value).toFixed(2)
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Total Cost{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={name}
                          ref={ref}
                          name={name}
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          placeholder="Calculated automatically"
                          autoComplete="off"
                          disabled
                          readOnly
                          aria-invalid={fieldState.invalid}
                          value={displayValue}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )
                }}
              />

              {/* Reference Type */}
              <Controller
                control={form.control}
                name="referenceType"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Reference Type{" "}
                      <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                    </FieldLabel>
                    <FieldContent>
                      <select
                        id={field.name}
                        ref={field.ref}
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value as ReferenceType)}
                        disabled={saving}
                        aria-invalid={fieldState.invalid}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {referenceTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option.charAt(0) + option.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Reference ID */}
              <Controller
                control={form.control}
                name="referenceId"
                render={({ field, fieldState }) => {
                  const { value, onChange, ...fieldProps } = field
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Reference ID{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          type="text"
                          placeholder="Invoice, PO, or document number"
                          autoComplete="off"
                          disabled={saving}
                          aria-invalid={fieldState.invalid}
                          value={value ?? ""}
                          onChange={(event) =>
                            onChange(event.target.value === "" ? undefined : event.target.value)
                          }
                          {...fieldProps}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )
                }}
              />

              {/* Reason */}
              <Controller
                control={form.control}
                name="reason"
                render={({ field, fieldState }) => {
                  const { value, onChange, ...fieldProps } = field
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Notes{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </FieldLabel>
                      <FieldContent>
                        <textarea
                          id={field.name}
                          placeholder={
                            currentMovementType === MovementType.ADJUST
                              ? "e.g. Counted on 12 Nov — corrected after stock check."
                              : "Add context for future you."
                          }
                          disabled={saving}
                          aria-invalid={fieldState.invalid}
                          value={value ?? ""}
                          onChange={(event) =>
                            onChange(event.target.value === "" ? undefined : event.target.value)
                          }
                          className="flex min-h-18 max-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...fieldProps}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )
                }}
              />
            </div>

            <SheetFooter className="border-t sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSheetOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {isEditing ? "Save changes" : movementMeta.buttonLabel}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!stockMovementToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setStockMovementToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <p>
              Are you sure you want to delete this entry for{" "}
              <strong>{stockMovementToDelete?.product.name}</strong>?
            </p>
            <p className="text-sm text-red-500">
              Will undo this change (stock will shift by{" "}
              {stockMovementToDelete?.quantity ? stockMovementToDelete?.quantity * -1 : 0}).
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStockMovementToDelete(null)}
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
    </section>
  )
}
