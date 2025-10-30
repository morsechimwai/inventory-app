"use client"

// React
import { useCallback, useEffect, useMemo, useState } from "react"

// Components
import { Button } from "@/components/ui/button"
import TableLoading from "@/components/skeleton/table-loading"
import { DataTable } from "@/components/data-table"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
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
import { ListPlus, Shapes, SquarePen } from "lucide-react"

// Types
import { CategoryDTO } from "@/lib/types/category"

// React Hook Form
import { Controller, useForm } from "react-hook-form"

// Validation
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { categoryFormSchema, defaultFormValues } from "./schema"
import {
  createCategoryAction,
  deleteCategoryAction,
  getAllCategories,
  updateCategoryAction,
} from "@/lib/actions/categories"

import { columns } from "./columns"

export default function CategoryPage() {
  // Custom Hook Form
  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultFormValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  // Category state
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryDTO | null>(null)
  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  // Loading state
  const [loading, setLoading] = useState<boolean>(true)
  const [deleting, setDeleting] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // Load Categories
  const loadCategories = useCallback(async () => {
    try {
      const result = await getAllCategories()
      if (result.success) {
        setCategories(result.data?.data ?? [])
      } else {
        toast.error(result.errorMessage ?? "Failed to load categories")
        console.error(result.errorMessage, result.code, result.meta)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to load categories.")
    }
  }, [])

  // Handle from submission
  const onSubmit = async (values: z.infer<typeof categoryFormSchema>) => {
    const toastId = toast.loading(editingCategory ? "Updating category..." : "Creating category...")
    setSaving(true)

    // Prepare payload
    const payload = { name: values.name }

    try {
      if (editingCategory) {
        // Update existing category
        const result = await updateCategoryAction(editingCategory.id, payload)
        if (result.success) {
          toast.success("Category updated successfully.", { id: toastId })
          setIsSheetOpen(false)
          loadCategories()
        } else {
          toast.error(result.errorMessage ?? "Failed to update category.", { id: toastId })
          console.error(result.errorMessage, result.code, result.meta)
        }
      } else {
        // Create new category
        const result = await createCategoryAction(payload)
        if (result.success) {
          toast.success("Category created successfully.", { id: toastId })
          setIsSheetOpen(false)
          loadCategories()
        } else {
          toast.error(result.errorMessage ?? "Failed to create category.", { id: toastId })
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

  // Confirm delete category
  const confirmDelete = async () => {
    if (!categoryToDelete) return

    setDeleting(true)
    const toastId = toast.loading(`Deleting ${categoryToDelete.name}...`)
    try {
      const result = await deleteCategoryAction(categoryToDelete.id)

      if (result.success) {
        toast.success(`Deleted ${categoryToDelete.name} successfully.`, { id: toastId })
        await loadCategories()
      } else {
        toast.error(result.errorMessage ?? "Failed to delete category.", { id: toastId })
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
      setCategoryToDelete(null)
    }
  }

  // Handle sheet open/close
  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) {
      setEditingCategory(null)
      form.reset()
    }
  }

  // Open create category sheet
  const handleOpenCreate = () => {
    setEditingCategory(null)
    form.reset()
    setIsSheetOpen(true)
  }

  // Open edit category sheet
  const handleOpenEdit = useCallback(
    (category: CategoryDTO) => {
      setEditingCategory(category)
      form.reset({
        name: category.name,
      })
      setIsSheetOpen(true)
    },
    [form]
  )

  // Handle delete category
  const handleDelete = useCallback((category: CategoryDTO) => {
    setCategoryToDelete(category)
  }, [])

  // Memoized columns for DataTable
  const memoizedColumns = useMemo(
    () => columns(handleOpenEdit, handleDelete),
    [handleOpenEdit, handleDelete]
  )

  // Load categories on mount
  useEffect(() => {
    loadCategories().finally(() => setLoading(false))
  }, [loadCategories])

  const isEditing = Boolean(editingCategory)

  return (
    <section className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-muted-foreground font-sans">
          Manage your inventory and track your products here.
        </p>
        {categories.length > 0 && (
          <Button
            className="font-sans font-bold text-sm"
            onClick={handleOpenCreate}
            disabled={saving}
          >
            <ListPlus className="mr-1 size-4" />
            <span>Add Category</span>
          </Button>
        )}
      </div>

      {loading ? (
        <TableLoading />
      ) : (
        <DataTable
          columns={memoizedColumns}
          data={categories}
          emptyComponent={
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Shapes className="size-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No categories found.</EmptyTitle>
                <Button
                  className="mt-4 font-sans font-bold text-sm"
                  onClick={handleOpenCreate}
                  disabled={saving}
                >
                  <ListPlus className="mr-1 size-4" />
                  <span>Add Category</span>
                </Button>
              </EmptyHeader>
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
                <span className="text-bold">{isEditing ? "Edit Category" : "Add Category"}</span>
              </SheetTitle>
              <SheetDescription>
                {isEditing
                  ? "Update the category details below."
                  : "Add a new category to your inventory."}
              </SheetDescription>
            </SheetHeader>

            {/*  */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => {
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <FieldContent>
                        <Input
                          id={field.name}
                          type="text"
                          placeholder="e.g. Electronics"
                          autoComplete="off"
                          disabled={saving}
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        <FieldError errors={[fieldState.error]} />
                      </FieldContent>
                    </Field>
                  )
                }}
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
                {isEditing ? "Save changes" : "Add Category"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setCategoryToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <p>
              Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)} disabled={deleting}>
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
