"use server"

// Stack Auth
import { getCurrentUser } from "@/lib/auth/auth"

// App Error
import { AppError } from "@/lib/errors/app-error"

// Services
import { getDashboardKeyMetrics } from "@/lib/services/dashboard"

// Types
import type {
  DashboardMetrics,
  ProductWithDate,
  StockLevelItem,
  StockLevelState,
} from "@/lib/types/dashboard"

// Utils
import {
  calculateWeeklyProducts,
  calculateEfficiencyMetrics,
} from "@/lib/utils/dashboard"

const STOCK_LEVEL_PRIORITY: Record<StockLevelState, number> = {
  OUT_OF_STOCK: 0,
  LOW: 1,
  HEALTHY: 2,
}

function buildStockLevels(products: ProductWithDate[]): StockLevelItem[] {
  return products
    .slice()
    .sort((a, b) => {
      const severityDiff =
        STOCK_LEVEL_PRIORITY[a.stockLevel] - STOCK_LEVEL_PRIORITY[b.stockLevel]

      if (severityDiff !== 0) return severityDiff

      const stockDiff = a.currentStock - b.currentStock
      if (stockDiff !== 0) return stockDiff

      return b.createdAt.getTime() - a.createdAt.getTime()
    })
    .slice(0, 5)
    .map((product) => ({
      id: product.id,
      name: product.name,
      currentStock: product.currentStock,
      lowStockAt: product.lowStockAt,
      unitName: product.unit.name,
      stockLevel: product.stockLevel,
    }))
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const user = await getCurrentUser()
  if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

  const keyMetrics = await getDashboardKeyMetrics(user.id)

  const weekProductsData = calculateWeeklyProducts(keyMetrics.allProducts)
  const efficiency = calculateEfficiencyMetrics(
    keyMetrics.allProducts,
    keyMetrics.totalProducts
  )
  const stockLevels = buildStockLevels(keyMetrics.allProducts)

  return {
    keyMetrics,
    weekProductsData,
    efficiency,
    stockLevels,
  }
}
