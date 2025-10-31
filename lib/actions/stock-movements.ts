// lib/actions/stock-movements.ts
"use server"

// Next.js
import { revalidatePath } from "next/cache"

// Auth
import { getCurrentUser } from "@/lib/auth/auth"

// Services
import {
  createStockMovement,
  deleteStockMovementById,
  getStockMovementsByUserId,
  updateStockMovement,
} from "@/lib/services/stock-movements"

// Types
import type { ActionResult } from "@/lib/types/error"
import type { StockMovementInput, StockMovementDTO } from "@/lib/types/stock-movement"

// Error handling
import { withErrorHandling } from "@/lib/errors/with-error-handling"
import { AppError } from "@/lib/errors/app-error"

const REVALIDATE_PATH = "/inventory-activity"

export interface StockMovementCreateResult {
  message: string
  meta?: { userId: string }
}

export interface StockMovementListResult {
  message: string
  data: StockMovementDTO[]
  meta: { count: number; userId: string }
}

export interface StockMovementUpdateResult {
  message: string
  meta?: { id: string; userId: string; updatedAt?: string }
}

export interface StockMovementDeleteResult {
  message: string
  meta?: { id: string; userId: string }
}

// Create a new stock movement
export async function createStockMovementAction(
  data: StockMovementInput
): Promise<ActionResult<StockMovementCreateResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    await createStockMovement(user.id, data)
    revalidatePath(REVALIDATE_PATH)

    return {
      message: "Stock movement recorded successfully",
      meta: { userId: user.id },
    }
  })
}

// Read all stock movements for the current user
export async function getAllStockMovements(): Promise<ActionResult<StockMovementListResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    const stockMovements = await getStockMovementsByUserId(user.id)

    return {
      message: "Stock movements fetched successfully",
      data: stockMovements,
      meta: { count: stockMovements.length, userId: user.id },
    }
  })
}

// Update an existing stock movement by ID
export async function updateStockMovementAction(
  id: string,
  data: StockMovementInput
): Promise<ActionResult<StockMovementUpdateResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    await updateStockMovement(user.id, id, data)
    revalidatePath(REVALIDATE_PATH)

    return {
      message: "Stock movement updated successfully",
      meta: { id, userId: user.id, updatedAt: new Date().toISOString() },
    }
  })
}

// Delete a stock movement by ID
export async function deleteStockMovementAction(
  id: string
): Promise<ActionResult<StockMovementDeleteResult>> {
  return withErrorHandling(async () => {
    const user = await getCurrentUser()
    if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

    await deleteStockMovementById(user.id, id)
    revalidatePath(REVALIDATE_PATH)

    return {
      message: "Stock movement deleted successfully",
      meta: { id, userId: user.id },
    }
  })
}
