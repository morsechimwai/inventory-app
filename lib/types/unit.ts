import type { Unit } from "@prisma/client"

export type CreateUnitInput = Omit<UnitDTO, "id">
export type UnitDTO = Omit<Unit, "userId" | "createdAt" | "updatedAt">
