import type { MovementType, ReferenceType, StockMovement } from "@prisma/client"

// Entity
export type StockMovementEntity = StockMovement

// Form input
export type StockMovementInput = {
  productId: string
  movementType: MovementType
  quantity: number
  unitCost?: number | null
  totalCost?: number | null
  referenceType: ReferenceType
  referenceId: string | null
  reason: string | null
}

// DTO for output with relation
export type StockMovementDTO = {
  id: string
  movementType: MovementType
  quantity: number
  unitCost: number | null
  totalCost: number | null
  referenceType: ReferenceType
  referenceId: string | null
  reason: string | null
  product: {
    id: string
    name: string
    unit: {
      id: string
      name: string
    }
  }
  createdAt: Date
  updatedAt: Date
}
