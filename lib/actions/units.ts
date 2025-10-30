// lib/actions/units.ts
"use server"

// Next.js
import { revalidatePath } from "next/cache"

// Stack Auth
import { getCurrentUser } from "@/lib/auth/auth"

// Services
import { createUnit, deleteUnitById, getUnitsByUserId, updateUnit } from "@/lib/services/units"

// Types
import type { ActionResult } from "@/lib/types/error"
import type { CreateUnitInput, UnitDTO } from "@/lib/types/unit"

// Error Handling
import { withErrorHandling } from "@/lib/errors/with-error-handling"
import { AppError } from "@/lib/errors/app-error"

export interface UnitCreateResult {
  message: string
  data?: UnitDTO
  meta?: { userId: string }
}

export interface UnitListResult {
  message: string
  data: UnitDTO[]
  meta: { count: number; userId: string }
}

export interface UnitUpdateResult {
  message: string
  meta?: { id: string; userId: string; updatedAt?: string }
}

export interface UnitDeleteResult {
  message: string
  meta?: { id: string; userId: string }
}

// Create a new unit (CRUD - Create)
export async function createUnitAction(
  data: CreateUnitInput
): Promise<ActionResult<UnitCreateResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    const unit = await createUnit(user.id, data)
    revalidatePath("/dashboard/unit")
    return {
      message: "Unit created successfully",
      data: unit,
      meta: { userId: user.id },
    }
  })
}

// Get all units for the current user (CRUD - Read)
export async function getAllUnits(): Promise<ActionResult<UnitListResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    const units = await getUnitsByUserId(user.id)
    return {
      message: "Units retrieved successfully",
      data: units,
      meta: { count: units.length, userId: user.id },
    }
  })
}

// Update an existing unit (CRUD - Update)
export async function updateUnitAction(
  id: string,
  data: Partial<UnitDTO>
): Promise<ActionResult<UnitUpdateResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    await updateUnit(user.id, id, data)
    revalidatePath("/dashboard/unit")
    return {
      message: "Unit updated successfully",
      meta: { id, userId: user.id, updatedAt: new Date().toISOString() },
    }
  })
}

// Delete unit by ID (CRUD - Delete)
export async function deleteUnitAction(id: string): Promise<ActionResult<UnitDeleteResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    await deleteUnitById(user.id, id)
    revalidatePath("/dashboard/unit")
    return {
      message: "Unit deleted successfully",
      meta: { id, userId: user.id },
    }
  })
}
