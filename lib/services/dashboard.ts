// lib/services/dashboard.ts

import { prisma } from "@/lib/db/prisma"
import type { KeyMetrics, ProductWithDate } from "@/lib/types/dashboard"
import { Prisma } from "@prisma/client"

const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  sku: true,
  lowStockAt: true,
  currentStock: true,
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
  movements: {
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      unitCost: true,
      totalCost: true,
      quantity: true,
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
    const currentStock = Number(product.currentStock)
    const lowStockAt = product.lowStockAt ?? null
    const latestMovement = product.movements[0]

    let latestUnitCost = 0
    if (latestMovement) {
      if (latestMovement.unitCost !== null) {
        latestUnitCost = Number(latestMovement.unitCost)
      } else if (
        latestMovement.totalCost !== null &&
        latestMovement.quantity &&
        Number(latestMovement.quantity) > 0
      ) {
        latestUnitCost = Number(latestMovement.totalCost) / Number(latestMovement.quantity)
      }
    }

    const inventoryValue = Number((currentStock * latestUnitCost).toFixed(2))
    const isOutOfStock = currentStock <= 0
    const isLowStock =
      !isOutOfStock && lowStockAt !== null && lowStockAt > 0 ? currentStock <= lowStockAt : false

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      lowStockAt,
      currentStock,
      category: product.category ?? null,
      unit: product.unit ?? null,
      createdAt: product.createdAt,
      inventoryValue,
      latestUnitCost,
      isLowStock,
      isOutOfStock,
    }
  })
}

export async function getDashboardKeyMetrics(userId: string): Promise<KeyMetrics> {
  const allProducts = await getDashboardProducts(userId)

  const totalProducts = allProducts.length
  const lowStock = allProducts.filter((product) => product.isLowStock || product.isOutOfStock).length
  const totalValue = Number(
    allProducts.reduce((total, product) => total + product.inventoryValue, 0).toFixed(2)
  )

  return {
    totalProducts,
    lowStock,
    totalValue,
    allProducts,
  }
}
