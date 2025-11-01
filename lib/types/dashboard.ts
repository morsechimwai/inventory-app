import type { MovementType } from "@prisma/client"
import type { ProductDTO } from "@/lib/types/product"

export type StockLevelState = "OUT_OF_STOCK" | "LOW" | "HEALTHY"

export type ProductWithDate = ProductDTO & {
  createdAt: Date
  inventoryValue: number
  latestUnitCost: number | null
  isLowStock: boolean
  isOutOfStock: boolean
  stockLevel: StockLevelState
}

export interface WeekProductData {
  week: string
  products: number
}

export interface EfficiencyMetrics {
  efficiencyScore: number | null
  inStockPercentage: number
  lowStockPercentage: number
  outOfStockPercentage: number
}

export interface StockLevelItem {
  id: string
  name: string
  currentStock: number
  lowStockAt: number | null
  unitName: string
  stockLevel: StockLevelState
}

export interface StockBreakdown {
  healthy: number
  low: number
  outOfStock: number
}

export interface RecentActivityItem {
  id: string
  productName: string
  movementType: MovementType
  quantity: number
  unitName: string
  reason: string | null
  createdAt: Date
}

export interface RestockSuggestion {
  id: string
  name: string
  currentStock: number
  lowStockAt: number | null
  unitName: string
  categoryName: string | null
  stockLevel: StockLevelState
  recommendedOrder: number | null
}

export interface KeyMetrics {
  totalProducts: number
  lowStock: number
  totalValue: number
  allProducts: ProductWithDate[]
  stockBreakdown: StockBreakdown
}

// Dashboard Metrics combining all data
export interface DashboardMetrics {
  keyMetrics: KeyMetrics
  weekProductsData: WeekProductData[]
  efficiency: EfficiencyMetrics
  stockLevels: StockLevelItem[]
  recentActivity: RecentActivityItem[]
  restockSuggestions: RestockSuggestion[]
}
