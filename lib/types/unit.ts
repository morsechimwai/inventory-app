import type { Unit } from "@prisma/client"

// Entity
export type UnitEntity = Unit

// Form input
export type UnitInput = Pick<Unit, "name">

// DTO for output
export type UnitDTO = {
  id: string
  name: string
}
