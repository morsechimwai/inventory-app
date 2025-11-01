// Types
import type { WeekProductData, EfficiencyMetrics, ProductWithDate } from "@/lib/types/dashboard"

// Helper to format week labels like "Jan 01 - Jan 07"
import { formatWeekLabel } from "./formatters"

export const calculateWeeklyProducts = (allProducts: ProductWithDate[]): WeekProductData[] => {
  const now = new Date()
  const weekProductsData: WeekProductData[] = []

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() - i * 7)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const weekLabel = formatWeekLabel(weekStart)

    const weekProducts = allProducts.filter((p) => {
      const d = new Date(p.createdAt)
      return d >= weekStart && d <= weekEnd
    })

    weekProductsData.push({ week: weekLabel, products: weekProducts.length })
  }

  return weekProductsData
}

export const calculateEfficiencyMetrics = (
  allProducts: ProductWithDate[],
  totalProducts: number
): EfficiencyMetrics => {
  let inStockCount = 0
  let lowStockCount = 0
  let outOfStockCount = 0

  allProducts.forEach((product) => {
    if (product.isOutOfStock) {
      outOfStockCount += 1
    } else if (product.isLowStock) {
      lowStockCount += 1
    } else if (product.currentStock > 0) {
      inStockCount += 1
    }
  })

  const inStockPercentage = totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0
  const lowStockPercentage =
    totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0
  const outOfStockPercentage =
    totalProducts > 0 ? Math.round((outOfStockCount / totalProducts) * 100) : 0

  const efficiencyScore =
    totalProducts > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              inStockPercentage * 0.7 +
                (100 - lowStockPercentage) * 0.2 +
                (100 - outOfStockPercentage) * 0.1
            )
          )
        )
      : null

  return {
    efficiencyScore,
    inStockPercentage,
    lowStockPercentage,
    outOfStockPercentage,
  }
}

export function calculateWeeklyTrends(allProducts: ProductWithDate[]) {
  const now = new Date()

  const startOfThisWeek = new Date()
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  startOfThisWeek.setHours(0, 0, 0, 0)

  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7)

  const endOfLastWeek = new Date(startOfThisWeek)
  endOfLastWeek.setMilliseconds(-1)

  const thisWeekProducts = allProducts.filter((p) => new Date(p.createdAt) >= startOfThisWeek)
  const lastWeekProducts = allProducts.filter(
    (p) => new Date(p.createdAt) >= startOfLastWeek && new Date(p.createdAt) < startOfThisWeek
  )

  const safePercent = (curr: number, prev: number) => {
    return prev > 0 ? ((curr - prev) / prev) * 100 : 0
  }

  const productTrend = safePercent(thisWeekProducts.length, lastWeekProducts.length)

  const sumInventoryValue = (items: ProductWithDate[]) =>
    items.reduce((total, product) => total + product.inventoryValue, 0)

  const totalValueThisWeek = sumInventoryValue(thisWeekProducts)
  const totalValueLastWeek = sumInventoryValue(lastWeekProducts)
  const totalValueTrend = safePercent(totalValueThisWeek, totalValueLastWeek)

  const lowStockThisWeek = thisWeekProducts.filter(
    (product) => product.isLowStock || product.isOutOfStock
  ).length
  const lowStockLastWeek = lastWeekProducts.filter(
    (product) => product.isLowStock || product.isOutOfStock
  ).length
  const lowStockTrend = safePercent(lowStockThisWeek, lowStockLastWeek)

  return {
    productTrend,
    totalValueTrend,
    lowStockTrend,
  }
}
