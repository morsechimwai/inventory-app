import { z } from "zod"

export const unitFormSchema = z.object({
  name: z.string().trim().min(1, "Unit Name is required"),
})

export type UnitFormValues = z.infer<typeof unitFormSchema>

export const defaultFormValues: UnitFormValues = {
  name: "",
}
