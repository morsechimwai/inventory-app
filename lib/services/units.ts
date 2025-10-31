// lib/services/units.ts

import { prisma } from "@/lib/db/prisma"
import type { UnitEntity, UnitInput, UnitDTO } from "@/lib/types/unit"
import { AppError } from "../errors/app-error"

// Create a new unit (CRUD - Create)
export async function createUnit(userId: string, data: UnitInput): Promise<UnitEntity> {
  try {
    return prisma.unit.create({
      data: { ...data, userId },
    })
  } catch {
    throw new AppError("DB_CREATE_FAILED", "Failed to create unit.", {
      data,
    })
  }
}

// Get units by user ID (CRUD - Read)
export async function getUnitsByUserId(userId: string): Promise<UnitDTO[]> {
  const units = await prisma.unit.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return units
}

// Update an existing unit (CRUD - Update)
export async function updateUnit(
  userId: string,
  id: string,
  data: Partial<UnitInput>
): Promise<UnitEntity> {
  const existing = await prisma.unit.findFirst({
    where: { id, userId },
    select: { id: true },
  })

  if (!existing) throw new AppError("NOT_FOUND", "Unit not found.")

  try {
    return prisma.unit.update({
      where: { id },
      data,
    })
  } catch {
    throw new AppError("DB_UPDATE_FAILED", "Failed to update unit.", {
      id,
      data,
    })
  }
}

// Delete unit by ID (CRUD - Delete)
export async function deleteUnitById(userId: string, id: string): Promise<UnitEntity> {
  const existing = await prisma.unit.findFirst({
    where: { id, userId },
    select: { id: true },
  })

  if (!existing) throw new AppError("NOT_FOUND", "Unit not found.")

  try {
    return prisma.unit.delete({ where: { id } })
  } catch {
    throw new AppError("DB_DELETE_FAILED", "Failed to delete unit.", {
      id,
    })
  }
}
