// lib/services/units.ts

// Types
import type { UnitEntity, UnitInput, UnitDTO } from "@/lib/types/unit"

// Database client
import { prisma } from "@/lib/db/prisma"

// Security
import { sanitizeInput } from "@/lib/security/sanitize"

// App error handling
import { AppError } from "../errors/app-error"

// Helper to assert unit ownership
async function assertUnitOwnership(userId: string, unitId: string) {
  const unit = await prisma.unit.findFirst({
    where: { id: unitId, userId },
    select: { id: true },
  })

  if (!unit) throw new AppError("NOT_FOUND", "Unit not found.")
}

// Create a new unit (CRUD - Create)
export async function createUnit(userId: string, data: UnitInput): Promise<UnitEntity> {
  try {
    // Sanitize input
    const cleanName = sanitizeInput(data.name)

    // Create unit
    return prisma.unit.create({
      data: { ...data, userId, name: cleanName },
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
  try {
    // Ensure the unit belongs to the user
    await assertUnitOwnership(userId, id)

    // Sanitize input if name is being updated
    const cleanName = data.name ? sanitizeInput(data.name) : undefined

    // Update unit
    return prisma.unit.update({
      where: { id },
      data: {
        ...data,
        name: cleanName,
      },
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
  try {
    // Ensure the unit belongs to the user
    await assertUnitOwnership(userId, id)
    return prisma.unit.delete({ where: { id } })
  } catch {
    throw new AppError("DB_DELETE_FAILED", "Failed to delete unit.", {
      id,
    })
  }
}
