import { MovementType, ReferenceType } from "@prisma/client"
import { z } from "zod"

const MAX_QUANTITY = 999_999_999_999
const MIN_QUANTITY = 0.001

export const stockMovementFormSchema = z.object({
  productId: z.cuid("Product is required"),
  movementType: z.nativeEnum(MovementType, "Movement type is required"),

  quantity: z.coerce
    .number<number>()
    .min(MIN_QUANTITY, "Quantity must be greater than 0")
    .max(MAX_QUANTITY, "Quantity must be less than 1,000,000,000,000"),

  unitCost: z.coerce.number<number>().min(0).max(999999999999).optional(),
  totalCost: z.coerce.number<number>().min(0).max(999999999999).optional(),

  referenceType: z.nativeEnum(ReferenceType, "Reference type is required"),
  referenceId: z
    .string()
    .trim()
    .max(191, "Reference ID must be shorter than 191 characters")
    .optional(),

  reason: z.string().trim().max(255, "Reason must be shorter than 255 characters").optional(),
}).superRefine((values, ctx) => {
  if (values.movementType === MovementType.IN) {
    if (values.unitCost === undefined || values.unitCost === null) {
      ctx.addIssue({
        path: ["unitCost"],
        code: z.ZodIssueCode.custom,
        message: "Unit cost is required for stock in movements.",
      })
    }
  }
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
