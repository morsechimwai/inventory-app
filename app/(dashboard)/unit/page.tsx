"use client"

// React
import { useCallback, useEffect, useMemo, useState } from "react"

// Components
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
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"

// Icons
import { CircleSlash2, Hash, ListPlus, SquarePen } from "lucide-react"

// Types
import { UnitDTO } from "@/lib/types/unit"

// React Hook Form
import { Controller, useForm } from "react-hook-form"

// Validation
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { defaultFormValues, unitFormSchema } from "./schema"

// Actions
import {
  createUnitAction,
  deleteUnitAction,
  getAllUnits,
  updateUnitAction,
} from "@/lib/actions/units"

import { columns } from "./columns"

export default function UnitPage() {
  // Custom Hook Form
  const form = useForm<z.infer<typeof unitFormSchema>>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: defaultFormValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  // Unit state
  const [units, setUnits] = useState<UnitDTO[]>([])
  const [editingUnit, setEditingUnit] = useState<UnitDTO | null>(null)
  const [unitToDelete, setUnitToDelete] = useState<UnitDTO | null>(null)
  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  // Loading state
  const [loading, setLoading] = useState<boolean>(true)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // Load Units
  const loadUnits = useCallback(async () => {
    try {
      const result = await getAllUnits()
      if (result.success) {
        setUnits(result.data?.data ?? [])
      } else {
        toast.error(result.errorMessage ?? "Failed to load units")
        console.error(result.errorMessage, result.code, result.meta)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to load units.")
    }
  }, [])

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof unitFormSchema>) => {
    const toastId = toast.loading(editingUnit ? "Updating unit..." : "Creating unit...")
    setSaving(true)

    // Prepare payload
    const payload = { name: values.name }

    try {
      if (editingUnit) {
        // Update existing unit
        const result = await updateUnitAction(editingUnit.id, payload)
        if (result.success) {
          toast.success("Unit updated successfully.", { id: toastId })
          setIsSheetOpen(false)
          loadUnits()
        } else {
          toast.error(result.errorMessage ?? "Failed to update unit.", { id: toastId })
          console.error(result.errorMessage, result.code, result.meta)
        }
      } else {
        // Create new unit
        const result = await createUnitAction(payload)
        if (result.success) {
          toast.success("Unit created successfully.", { id: toastId })
          setIsSheetOpen(false)
          loadUnits()
        } else {
          toast.error(result.errorMessage ?? "Failed to create unit.", { id: toastId })
          console.error(result.errorMessage, result.code, result.meta)
        }
      }
    } catch (error) {
      // Standardize error message
      const errorMessage = error instanceof Error ? error.message : error

      // Log and show error
      toast.error(`${errorMessage}`, { id: toastId })
      console.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Confirm delete unit
  const confirmDelete = async () => {
    if (!unitToDelete) return

    setDeleting(true)
    const toastId = toast.loading(`Deleting ${unitToDelete.name}...`)
    try {
      const result = await deleteUnitAction(unitToDelete.id)

      if (result.success) {
        toast.success(`Deleted ${unitToDelete.name} successfully.`, { id: toastId })
        await loadUnits()
      } else {
        toast.error(result.errorMessage ?? "Failed to delete unit.", { id: toastId })
        console.error(result.errorMessage, result.code, result.meta)
      }
    } catch (error) {
      // Standardize error message
      const errorMessage = error instanceof Error ? error.message : error

      // Log and show error
      toast.error(`${errorMessage}`, { id: toastId })
      console.error(errorMessage)
    } finally {
      setDeleting(false)
      setUnitToDelete(null)
    }
  }

  // Handle sheet open/close
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) {
      setEditingUnit(null)
      form.reset(defaultFormValues)
    }
  }

  // Open create unit sheet
  const handleOpenCreate = () => {
    setEditingUnit(null)
    form.reset(defaultFormValues)
    setIsSheetOpen(true)
  }

  // Open edit unit sheet
  const handleOpenEdit = useCallback(
    (unit: UnitDTO) => {
      setEditingUnit(unit)
      form.reset({
        name: unit.name,
      })
      setIsSheetOpen(true)
    },
    [form]
  )

  // Handle delete unit
  const handleDelete = useCallback((unit: UnitDTO) => {
    setUnitToDelete(unit)
  }, [])

  // Memoized columns for DataTable
  const memoizedColumns = useMemo(
    () => columns(handleOpenEdit, handleDelete),
    [handleOpenEdit, handleDelete]
  )

  // Load units on mount
  useEffect(() => {
    loadUnits().finally(() => setLoading(false))
  }, [loadUnits])

  const isEditing = Boolean(editingUnit)

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-muted-foreground font-sans">
          Set up and manage measurement units to ensure consistent and accurate product quantities.
        </p>
        {units.length > 0 && (
          <Button
            className="font-sans font-bold text-sm"
            onClick={handleOpenCreate}
            disabled={saving}
          >
            <ListPlus className="mr-1 size-4" />
            <span>Add Unit</span>
          </Button>
        )}
      </div>

      {loading ? (
        <TableLoading />
      ) : (
        <DataTable
          columns={memoizedColumns}
          data={units}
          emptyComponent={
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CircleSlash2 className="size-6 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No units yet</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  className="font-sans font-bold text-sm"
                  onClick={handleOpenCreate}
                  disabled={saving}
                >
                  <ListPlus className="mr-1 size-4" />
                  <span>Add Unit</span>
                </Button>
              </EmptyContent>
              <EmptyDescription>
                Units help standardize product measurements across your inventory.
              </EmptyDescription>
            </Empty>
          }
        />
      )}

      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent>
          <form className="flex h-full flex-col" onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center">
                {isEditing ? (
                  <SquarePen className="mr-1 size-4.5" />
                ) : (
                  <ListPlus className="mr-1 size-4.5" />
                )}
                <span className="text-bold">{isEditing ? "Edit Unit" : "Add Unit"}</span>
              </SheetTitle>
              <SheetDescription>
                {isEditing
                  ? "Update the unit details below."
                  : "Add a new unit to keep product quantities consistent."}
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
                        placeholder="e.g. Piece"
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
            </div>

            <SheetFooter className="sm:flex-row sm:justify-end border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSheetOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {isEditing ? "Save changes" : "Add Unit"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!unitToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setUnitToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <p>
              Are you sure you want to delete <strong>{unitToDelete?.name}</strong>?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitToDelete(null)} disabled={deleting}>
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
