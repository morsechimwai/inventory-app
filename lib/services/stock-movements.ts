// lib/services/stock-movements.ts
// Services for managing stock movements in the inventory system

// Prisma Client
import { MovementType } from "@prisma/client"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db/prisma"

// Types
import type {
  StockMovementInput,
  StockMovementEntity,
  StockMovementDTO,
} from "@/lib/types/stock-movement"

// Utils
import { decimalToNumber } from "../utils/decimal"
import {
  applyMovementMAC,
  revertMovementMAC,
  type ProductSnapshot,
} from "../utils/stock-movement-math"

// App error handling
import { AppError } from "@/lib/errors/app-error"

// ─────────────────────────────────────────────────────────────
// Product Ownership Check (Overloaded for prisma/tx)
// ─────────────────────────────────────────────────────────────

// Overload signatures for prisma transaction client
async function assertProductOwnership(
  userId: string,
  productId: string,
  tx: Prisma.TransactionClient
): Promise<void>

// Default signature for main prisma client
async function assertProductOwnership(userId: string, productId: string): Promise<void>

// Implementation
async function assertProductOwnership(
  userId: string,
  productId: string,
  tx: Prisma.TransactionClient = prisma
) {
  const product = await tx.product.findFirst({
    where: { id: productId, userId },
    select: { id: true },
  })

  if (!product) throw new AppError("NOT_FOUND", "Product not found or unauthorized.")
}

// ─────────────────────────────────────────────────────────────
// Get Product Snapshot (currentStock, avgCost)
// ─────────────────────────────────────────────────────────────
async function getProductSnapshot(
  tx: Prisma.TransactionClient,
  productId: string
): Promise<ProductSnapshot> {
  const product = await tx.product.findUnique({
    where: { id: productId },
    select: { currentStock: true, avgCost: true },
  })

  if (!product) throw new AppError("NOT_FOUND", "Product not found.")

  return {
    currentStock: product.currentStock,
    avgCost: product.avgCost,
  }
}

// ─────────────────────────────────────────────────────────────
// Update Product Caches (currentStock, avgCost)
// ─────────────────────────────────────────────────────────────
async function updateProductCaches(
  tx: Prisma.TransactionClient,
  productId: string,
  snapshot: ProductSnapshot
) {
  await tx.product.update({
    where: { id: productId },
    data: {
      currentStock: snapshot.currentStock,
      avgCost: snapshot.avgCost,
    },
  })
}

// ─────────────────────────────────────────────────────────────
// CREATE STOCK MOVEMENT
// ─────────────────────────────────────────────────────────────

export async function createStockMovement(
  userId: string,
  data: StockMovementInput
): Promise<StockMovementEntity> {
  return prisma.$transaction(async (tx) => {
    await assertProductOwnership(userId, data.productId, tx)

    const snapshot = await getProductSnapshot(tx, data.productId)
    const computation = applyMovementMAC(snapshot, {
      movementType: data.movementType,
      quantity: Number(data.quantity),
      unitCost: data.unitCost ?? null,
    })

    const movement = await tx.stockMovement.create({
      data: {
        ...data,
        userId,
        unitCost: computation.unitCost,
        totalCost: computation.totalCost,
      },
    })

    await updateProductCaches(tx, data.productId, computation.nextState)

    return movement
  })
}

// ─────────────────────────────────────────────────────────────
// READ STOCK MOVEMENTS BY USER ID
// ─────────────────────────────────────────────────────────────
export async function getStockMovementsByUserId(userId: string): Promise<StockMovementDTO[]> {
  const movements = await prisma.stockMovement.findMany({
    where: {
      userId,
      movementType: { in: [MovementType.IN, MovementType.OUT] },
    },
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

  // convert Decimal to number for UI
  return movements.map((m) => ({
    ...m,
    quantity: decimalToNumber(m.quantity),
    unitCost: m.unitCost !== null ? decimalToNumber(m.unitCost) : null,
    totalCost: m.totalCost !== null ? decimalToNumber(m.totalCost) : null,
  }))
}

// ─────────────────────────────────────────────────────────────
// UPDATE STOCK MOVEMENT (Undo → Apply)
// ─────────────────────────────────────────────────────────────

export async function updateStockMovement(
  userId: string,
  id: string,
  data: StockMovementInput
): Promise<StockMovementEntity> {
  return prisma.$transaction(async (tx) => {
    const old = await tx.stockMovement.findFirst({
      where: { id, userId },
    })

    if (!old) throw new AppError("NOT_FOUND", "Stock movement not found.")

    const productId = data.productId ?? old.productId

    await assertProductOwnership(userId, productId, tx)
    const oldProductSnapshot = await getProductSnapshot(tx, old.productId)
    const revertedState = revertMovementMAC(oldProductSnapshot, old)

    await updateProductCaches(tx, old.productId, revertedState)

    let baseSnapshot: ProductSnapshot
    if (productId === old.productId) {
      baseSnapshot = revertedState
    } else {
      baseSnapshot = await getProductSnapshot(tx, productId)
    }

    const computation = applyMovementMAC(baseSnapshot, {
      movementType: data.movementType,
      quantity: Number(data.quantity),
      unitCost: data.unitCost ?? null,
    })

    await updateProductCaches(tx, productId, computation.nextState)

    return tx.stockMovement.update({
      where: { id },
      data: {
        ...data,
        productId,
        unitCost: computation.unitCost,
        totalCost: computation.totalCost,
      },
    })
  })
}

// ─────────────────────────────────────────────────────────────
// DELETE STOCK MOVEMENT (Undo effect)
// ─────────────────────────────────────────────────────────────

export async function deleteStockMovementById(
  userId: string,
  id: string
): Promise<StockMovementEntity> {
  return prisma.$transaction(async (tx) => {
    const old = await tx.stockMovement.findFirst({
      where: { id, userId },
    })

    if (!old) throw new AppError("NOT_FOUND", "Stock movement not found.")

    await assertProductOwnership(userId, old.productId, tx)
    const snapshot = await getProductSnapshot(tx, old.productId)
    const revertedState = revertMovementMAC(snapshot, old)

    await updateProductCaches(tx, old.productId, revertedState)

    return tx.stockMovement.delete({
      where: { id },
    })
  })
}
