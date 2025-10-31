"use client"

// React
import { useCallback, useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"

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

// Icons
import type { LucideIcon } from "lucide-react"
import { ArrowDownToLine, ArrowUpToLine, History, Scale } from "lucide-react"

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
import { toNumberOrNull, toStringOrNull } from "@/lib/utils"

const movementTypeMeta: Record<
  MovementType,
  {
    buttonLabel: string
    createTitle: string
    editTitle: string
    description: string
    icon: LucideIcon
  }
> = {
  [MovementType.IN]: {
    buttonLabel: "Log Stock In",
    createTitle: "Log Stock In",
    editTitle: "Edit Stock In",
    description: "Capture stock that just arrived so your counts stay accurate.",
    icon: ArrowDownToLine,
  },
  [MovementType.OUT]: {
    buttonLabel: "Log Stock Out",
    createTitle: "Log Stock Out",
    editTitle: "Edit Stock Out",
    description: "Track what leaves the shelf — sales, usage, or transfers.",
    icon: ArrowUpToLine,
  },
  [MovementType.ADJUST]: {
    buttonLabel: "Log Adjustment",
    createTitle: "Log Adjustment",
    editTitle: "Edit Adjustment",
    description: "Make a quick correction after a stock check or audit.",
    icon: Scale,
  },
}

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
      quantity: toNumberOrNull(values.quantity),
      unitCost: toNumberOrNull(values.unitCost),
      totalCost: toNumberOrNull(values.totalCost),
      referenceType: values.referenceType,
      referenceId: toStringOrNull(values.referenceId),
      reason: toStringOrNull(values.reason),
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
    if (products.length === 0) {
      toast.info("Add a product first, then log your stock activity.")
      return
    }

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
        productId: movement.productId,
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

    const hasQuantity =
      quantityValue !== undefined && quantityValue !== null && quantityValue !== ""
    const hasUnitCost =
      unitCostValue !== undefined && unitCostValue !== null && unitCostValue !== ""

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
                <EmptyTitle>No activity yet.</EmptyTitle>
                <EmptyDescription>
                  Log your first stock movement to start a clean activity trail.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent className="flex flex-row justify-center gap-2">
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
              </EmptyContent>
              {products.length === 0 && (
                <EmptyContent className="text-sm text-muted-foreground">
                  Add a product first so we know which item you&apos;re updating.
                </EmptyContent>
              )}
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
                      <select
                        id={field.name}
                        ref={field.ref}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value || undefined)}
                        disabled={saving || products.length === 0}
                        aria-invalid={fieldState.invalid}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">
                          {products.length === 0 ? "No products yet" : "Select product"}
                        </option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
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
                    <FieldLabel htmlFor={field.name}>Quantity</FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        type="number"
                        inputMode="decimal"
                        step="0.001"
                        placeholder="e.g. 25"
                        autoComplete="off"
                        disabled={saving}
                        aria-invalid={fieldState.invalid}
                        onKeyDown={(event) => {
                          if (["e", "E", "+", "-"].includes(event.key)) event.preventDefault()
                        }}
                        {...field}
                      />
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
                    value === undefined || value === null || value === ""
                      ? ""
                      : Number(value).toFixed(2)
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
                          className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
