"use server"

// Stack Auth
import { getCurrentUser } from "@/lib/auth/auth"

// App Error
import { AppError } from "@/lib/errors/app-error"

// Services
import { getDashboardKeyMetrics, getRecentStockMovements } from "@/lib/services/dashboard"

// Types
import type {
  DashboardMetrics,
  ProductWithDate,
  StockLevelItem,
  StockLevelState,
  RestockSuggestion,
} from "@/lib/types/dashboard"

// Utils
import { calculateWeeklyProducts, calculateEfficiencyMetrics } from "@/lib/utils/dashboard"

const STOCK_LEVEL_PRIORITY: Record<StockLevelState, number> = {
  OUT_OF_STOCK: 0,
  LOW: 1,
  HEALTHY: 2,
}

const buildStockLevels = (products: ProductWithDate[]): StockLevelItem[] => {
  return products
    .slice()
    .sort((a, b) => {
      const severityDiff = STOCK_LEVEL_PRIORITY[a.stockLevel] - STOCK_LEVEL_PRIORITY[b.stockLevel]

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

const buildRestockSuggestions = (products: ProductWithDate[]): RestockSuggestion[] => {
  return products
    .filter(
      (product) =>
        product.stockLevel !== "HEALTHY" ||
        (product.lowStockAt !== null && product.currentStock <= product.lowStockAt)
    )
    .sort((a, b) => {
      const severityDiff = STOCK_LEVEL_PRIORITY[a.stockLevel] - STOCK_LEVEL_PRIORITY[b.stockLevel]
      if (severityDiff !== 0) return severityDiff

      const urgencyA =
        a.stockLevel === "OUT_OF_STOCK"
          ? Number.MAX_SAFE_INTEGER
          : a.lowStockAt !== null
          ? a.lowStockAt - a.currentStock
          : -1
      const urgencyB =
        b.stockLevel === "OUT_OF_STOCK"
          ? Number.MAX_SAFE_INTEGER
          : b.lowStockAt !== null
          ? b.lowStockAt - b.currentStock
          : -1

      if (urgencyA !== urgencyB) return urgencyB - urgencyA

      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    .slice(0, 6)
    .map((product) => {
      const recommended =
        product.lowStockAt !== null
          ? Math.max(product.lowStockAt - product.currentStock, 0) || product.lowStockAt
          : product.stockLevel === "OUT_OF_STOCK"
          ? 1
          : null

      return {
        id: product.id,
        name: product.name,
        currentStock: product.currentStock,
        lowStockAt: product.lowStockAt,
        unitName: product.unit.name,
        categoryName: product.category?.name ?? null,
        stockLevel: product.stockLevel,
        recommendedOrder: recommended,
      }
    })
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const user = await getCurrentUser()
  if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.")

  const [keyMetrics, recentActivity] = await Promise.all([
    getDashboardKeyMetrics(user.id),
    getRecentStockMovements(user.id),
  ])

  const weekProductsData = calculateWeeklyProducts(keyMetrics.allProducts)
  const efficiency = calculateEfficiencyMetrics(keyMetrics.allProducts, keyMetrics.totalProducts)
  const stockLevels = buildStockLevels(keyMetrics.allProducts)
  const restockSuggestions = buildRestockSuggestions(keyMetrics.allProducts)

  return {
    keyMetrics,
    weekProductsData,
    efficiency,
    stockLevels,
    recentActivity,
    restockSuggestions,
  }
}
