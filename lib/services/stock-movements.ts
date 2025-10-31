// lib/services/stock-movements.ts

import { prisma } from "@/lib/db/prisma"
import type {
  StockMovementDTO,
  StockMovementInput,
  StockMovementEntity,
} from "@/lib/types/stock-movement"
import { AppError } from "@/lib/errors/app-error"

//
import { decimalToNumber } from "../utils/decimal"

// Helper to assert product ownership
async function assertProductOwnership(userId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, userId },
    select: { id: true },
  })

  if (!product) throw new AppError("NOT_FOUND", "Product not found.")
}

// Create a new stock movement (CRUD - Create)
export async function createStockMovement(
  userId: string,
  data: StockMovementInput
): Promise<StockMovementEntity> {
  try {
    // Ensure the product belongs to the user
    await assertProductOwnership(userId, data.productId)

    // Create the stock movement
    return await prisma.stockMovement.create({
      data: { ...data, userId },
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError("DB_CREATE_FAILED", "Failed to create stock movement.", { data })
  }
}

// Get stock movements by user ID (CRUD - Read)
export async function getStockMovementsByUserId(userId: string): Promise<StockMovementDTO[]> {
  const movements = await prisma.stockMovement.findMany({
    where: { userId },
    select: {
      id: true,
      movementType: true,
      quantity: true,
      unitCost: true,
      totalCost: true,
      referenceType: true,
      referenceId: true,
      reason: true,
      product: {
        select: {
          id: true,
          name: true,
          unit: {
            select: { id: true, name: true },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return movements.map((m) => ({
    ...m,
    quantity: decimalToNumber(m.quantity),
    unitCost: m.unitCost !== null ? decimalToNumber(m.unitCost) : null,
    totalCost: m.totalCost !== null ? decimalToNumber(m.totalCost) : null,
  }))
}

// Update existing stock movement (CRUD - Update)
export async function updateStockMovement(
  userId: string,
  id: string,
  data: StockMovementInput
): Promise<StockMovementEntity> {
  const existing = await prisma.stockMovement.findFirst({
    where: { id, userId },
    select: { id: true, productId: true },
  })

  if (!existing) throw new AppError("NOT_FOUND", "Stock movement not found.")

  const productId = data.productId ?? existing.productId
  await assertProductOwnership(userId, productId)

  try {
    return await prisma.stockMovement.update({
      where: { id },
      data,
    })
  } catch {
    throw new AppError("DB_UPDATE_FAILED", "Failed to update stock movement.", { id, data })
  }
}

// Delete stock movement by ID (CRUD - Delete)
export async function deleteStockMovementById(
  userId: string,
  id: string
): Promise<StockMovementEntity> {
  const existing = await prisma.stockMovement.findFirst({
    where: { id, userId },
    select: { id: true },
  })

  if (!existing) throw new AppError("NOT_FOUND", "Stock movement not found.")

  try {
    return await prisma.stockMovement.delete({ where: { id } })
  } catch {
    throw new AppError("DB_DELETE_FAILED", "Failed to delete stock movement.", { id })
  }
}
