import type { MovementType, ReferenceType, StockMovement } from "@prisma/client"

// Entity
export type StockMovementEntity = StockMovement

// Form input
export type StockMovementInput = Pick<
  StockMovement,
  "productId" | "movementType" | "quantity" | "referenceType"
> &
  Partial<Pick<StockMovement, "unitCost" | "totalCost" | "referenceId" | "reason">>

// DTO for output with relation
export type StockMovementDTO = {
  id: string
  productId: string
  product: {
    id: string
    name: string
    unit: { id: string; name: string } | null
  }
  movementType: MovementType
  quantity: number
  unitCost: number | null
  totalCost: number | null
  referenceType: ReferenceType
  referenceId: string | null
  reason: string | null
  createdAt: Date
  updatedAt: Date
}
