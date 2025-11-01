import { z } from "zod"

export const unitFormSchema = z.object({
  name: z.string().trim().min(1, "Unit name is required"),
})

export type UnitFormValues = z.infer<typeof unitFormSchema>

export const defaultFormValues: UnitFormValues = {
  name: "",
}
