// lib/services/dashboard.ts

import { prisma } from "@/lib/db/prisma"
import type {
  KeyMetrics,
  ProductWithDate,
  StockBreakdown,
  StockLevelState,
  RecentActivityItem,
} from "@/lib/types/dashboard"
import { MovementType, Prisma } from "@prisma/client"
import { decimalToNumber } from "../utils/decimal"

const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  sku: true,
  lowStockAt: true,
  currentStock: true,
  avgCost: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  unit: {
    select: {
      id: true,
      name: true,
    },
  },
})

type ProductWithRelations = Prisma.ProductGetPayload<{ select: typeof productSelect }>

export async function getDashboardProducts(userId: string): Promise<ProductWithDate[]> {
  const products: ProductWithRelations[] = await prisma.product.findMany({
    where: { userId },
    select: productSelect,
    orderBy: { createdAt: "desc" },
  })

  return products.map((product) => {
    const currentStock = decimalToNumber(product.currentStock)
    const avgCost = decimalToNumber(product.avgCost)
    const lowStockAt = product.lowStockAt ?? null
    const latestUnitCost = avgCost
    const inventoryValue = Number((currentStock * avgCost).toFixed(2))
    const isOutOfStock = currentStock <= 0
    const isLowStock =
      !isOutOfStock && lowStockAt !== null && lowStockAt > 0 ? currentStock <= lowStockAt : false
    const stockLevel: StockLevelState = isOutOfStock
      ? "OUT_OF_STOCK"
      : isLowStock
      ? "LOW"
      : "HEALTHY"

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      lowStockAt,
      currentStock,
      category: product.category ?? null,
      unit: product.unit,
      createdAt: product.createdAt,
      inventoryValue,
      avgCost,
      latestUnitCost,
      isLowStock,
      isOutOfStock,
      stockLevel,
    }
  })
}

export async function getDashboardKeyMetrics(userId: string): Promise<KeyMetrics> {
  const allProducts = await getDashboardProducts(userId)

  const totalProducts = allProducts.length
  const stockBreakdown = allProducts.reduce<StockBreakdown>(
    (acc, product) => {
      if (product.stockLevel === "OUT_OF_STOCK") acc.outOfStock += 1
      else if (product.stockLevel === "LOW") acc.low += 1
      else acc.healthy += 1
      return acc
    },
    { healthy: 0, low: 0, outOfStock: 0 }
  )
  const lowStock = stockBreakdown.low + stockBreakdown.outOfStock
  const totalValue = Number(
    allProducts.reduce((total, product) => total + product.inventoryValue, 0).toFixed(2)
  )

  return {
    totalProducts,
    lowStock,
    totalValue,
    allProducts,
    stockBreakdown,
  }
}

type RecentMovementWithRelations = Prisma.StockMovementGetPayload<{
  select: {
    id: true
    movementType: true
    quantity: true
    reason: true
    createdAt: true
    product: {
      select: {
        name: true
        unit: { select: { name: true } }
      }
    }
  }
}>

export async function getRecentStockMovements(userId: string): Promise<RecentActivityItem[]> {
  const movements: RecentMovementWithRelations[] = await prisma.stockMovement.findMany({
    where: {
      userId,
      movementType: { in: [MovementType.IN, MovementType.OUT] },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: {
      id: true,
      movementType: true,
      quantity: true,
      reason: true,
      createdAt: true,
      product: {
        select: {
          name: true,
          unit: { select: { name: true } },
        },
      },
    },
  })

  return movements.map((movement) => ({
    id: movement.id,
    productName: movement.product.name,
    movementType: movement.movementType,
    quantity: decimalToNumber(movement.quantity),
    unitName: movement.product.unit.name,
    reason: movement.reason ?? null,
    createdAt: movement.createdAt,
  }))
}
