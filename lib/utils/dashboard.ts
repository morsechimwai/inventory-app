import type { ProductDTO } from "@/lib/types/product";
import type {
  WeekProductData,
  EfficiencyMetrics,
  ProductWithDate,
} from "@/lib/types/dashboard";

export function calculateWeeklyProducts(
  allProducts: ProductWithDate[]
): WeekProductData[] {
  const now = new Date();
  const weekProductsData: WeekProductData[] = [];

  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLabel = `${String(weekStart.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(weekStart.getDate() + 1).padStart(2, "0")}`;

    const weekProducts = allProducts.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= weekStart && d <= weekEnd;
    });

    weekProductsData.push({ week: weekLabel, products: weekProducts.length });
  }

  return weekProductsData;
}

export function calculateEfficiencyMetrics(
  allProducts: ProductDTO[],
  totalProducts: number
): EfficiencyMetrics {
  const inStockCount = allProducts.filter((p) => p.quantity > 5).length;
  const lowStockCount = allProducts.filter(
    (p) => p.quantity <= 5 && p.quantity > 1
  ).length;
  const outOfStockCount = allProducts.filter((p) => p.quantity === 0).length;

  const inStockPercentage =
    totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const lowStockPercentage =
    totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const outOfStockPercentage =
    totalProducts > 0 ? Math.round((outOfStockCount / totalProducts) * 100) : 0;

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
      : null;

  return {
    efficiencyScore,
    inStockPercentage,
    lowStockPercentage,
    outOfStockPercentage,
  };
}

export function calculateWeeklyTrends(allProducts: ProductWithDate[]) {
  const now = new Date();

  const startOfThisWeek = new Date();
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  const thisWeekProducts = allProducts.filter(
    (p) => new Date(p.createdAt) >= startOfThisWeek
  );
  const lastWeekProducts = allProducts.filter(
    (p) =>
      new Date(p.createdAt) >= startOfLastWeek &&
      new Date(p.createdAt) < startOfThisWeek
  );

  const safePercent = (curr: number, prev: number) => {
    return prev > 0 ? ((curr - prev) / prev) * 100 : 0;
  };

  const productTrend = safePercent(
    thisWeekProducts.length,
    lastWeekProducts.length
  );

  const totalValueThisWeek = thisWeekProducts.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.quantity),
    0
  );
  const totalValueLastWeek = lastWeekProducts.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.quantity),
    0
  );
  const totalValueTrend = safePercent(totalValueThisWeek, totalValueLastWeek);

  const lowStockThisWeek = thisWeekProducts.filter(
    (p) => p.quantity <= 5
  ).length;
  const lowStockLastWeek = lastWeekProducts.filter(
    (p) => p.quantity <= 5
  ).length;
  const lowStockTrend = safePercent(lowStockThisWeek, lowStockLastWeek);

  return {
    productTrend,
    totalValueTrend,
    lowStockTrend,
  };
}
