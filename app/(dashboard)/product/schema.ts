import { z } from "zod"

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Product Name is required"),
  sku: z.string().trim().optional(),
  lowStockAt: z.coerce
    .number<number>()
    .int("Low stock must be an integer")
    .min(0, "Low stock must be at least 0")
    .max(9999999999, "Low stock must be less than 10,000,000,000")
    .optional(),
  categoryId: z.string().trim().optional(),
  unitId: z.string().trim().min(1, "Unit is required"),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export const defaultFormValues: ProductFormValues = {
  name: "",
  sku: undefined,
  lowStockAt: undefined,
  categoryId: undefined,
  unitId: "",
}
