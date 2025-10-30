import { z } from "zod"

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Category Name is required"),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

export const defaultFormValues: CategoryFormValues = {
  name: "",
}
