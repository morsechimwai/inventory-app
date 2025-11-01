import { prisma } from "@/lib/db/prisma"
import type {
  StockMovementInput,
  StockMovementEntity,
  StockMovementDTO,
} from "@/lib/types/stock-movement"
import { AppError } from "@/lib/errors/app-error"

import type { Prisma } from "@prisma/client"
import { decimalToNumber } from "../utils/decimal"

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
// Movement delta calculator
// IN = +qty, OUT = -qty, ADJUST = signed value
// ─────────────────────────────────────────────────────────────

function calcDelta(type: "IN" | "OUT" | "ADJUST", qty: number) {
  if (type === "IN") return qty
  if (type === "OUT") return -qty
  return qty // ADJUST
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

    const movement = await tx.stockMovement.create({
      data: { ...data, userId },
    })

    const delta = calcDelta(data.movementType, decimalToNumber(data.quantity))

    await tx.product.update({
      where: { id: data.productId },
      data: {
        currentStock: { increment: delta },
      },
    })

    return movement
  })
}

// ─────────────────────────────────────────────────────────────
// READ STOCK MOVEMENTS BY USER ID
// ─────────────────────────────────────────────────────────────
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

  // convert Decimal to number for UI
  return movements.map((m) => ({
    ...m,
    quantity: Number(m.quantity),
    unitCost: m.unitCost !== null ? Number(m.unitCost) : null,
    totalCost: m.totalCost !== null ? Number(m.totalCost) : null,
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

    const undoDelta = calcDelta(old.movementType, decimalToNumber(old.quantity)) * -1
    const newDelta = calcDelta(data.movementType, decimalToNumber(data.quantity))

    // คืน stock เดิม
    await tx.product.update({
      where: { id: old.productId },
      data: { currentStock: { increment: undoDelta } },
    })

    // ใส่ stock ใหม่
    await tx.product.update({
      where: { id: productId },
      data: { currentStock: { increment: newDelta } },
    })

    return tx.stockMovement.update({
      where: { id },
      data,
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

    const undoDelta = calcDelta(old.movementType, decimalToNumber(old.quantity)) * -1

    await tx.product.update({
      where: { id: old.productId },
      data: { currentStock: { increment: undoDelta } },
    })

    return tx.stockMovement.delete({
      where: { id },
    })
  })
}
