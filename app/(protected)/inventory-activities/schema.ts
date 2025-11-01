import { MovementType, ReferenceType } from "@prisma/client"
import { z } from "zod"

export const stockMovementFormSchema = z.object({
  productId: z.cuid("Product is required"),
  movementType: z.nativeEnum(MovementType, "Movement type is required"),

  quantity: z.coerce
    .number<number>()
    .min(0.001, "Quantity must be greater than 0")
    .max(999999999999, "Quantity must be less than 1,000,000,000,000"),

  unitCost: z.coerce.number<number>().min(0).max(999999999999).optional(),
  totalCost: z.coerce.number<number>().min(0).max(999999999999).optional(),

  referenceType: z.nativeEnum(ReferenceType, "Reference type is required"),
  referenceId: z
    .string()
    .trim()
    .max(191, "Reference ID must be shorter than 191 characters")
    .optional(),

  reason: z.string().trim().max(255, "Reason must be shorter than 255 characters").optional(),
})

export type StockMovementFormValues = z.infer<typeof stockMovementFormSchema>

export const defaultFormValues: StockMovementFormValues = {
  productId: "",
  movementType: MovementType.IN,
  quantity: 1,
  unitCost: undefined,
  totalCost: undefined,
  referenceType: ReferenceType.MANUAL,
  referenceId: undefined,
  reason: undefined,
}
