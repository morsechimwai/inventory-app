import type { Unit } from "@prisma/client"

// Entity
export type UnitEntity = Unit

// Form input
export type UnitInput = Omit<Unit, "id" | "userId" | "createdAt" | "updatedAt">

// DTO for output
export type UnitDTO = {
  id: string
  name: string
}
