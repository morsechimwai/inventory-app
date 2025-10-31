import type { ProductDTO } from "@/lib/types/product";

export type ProductWithDate = ProductDTO & {
  createdAt: Date;
  inventoryValue: number;
  latestUnitCost: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
};

export interface WeekProductData {
  week: string;
  products: number;
}

export interface EfficiencyMetrics {
  efficiencyScore: number | null;
  inStockPercentage: number;
  lowStockPercentage: number;
  outOfStockPercentage: number;
}

export interface KeyMetrics {
  totalProducts: number;
  lowStock: number;
  totalValue: number;
  allProducts: ProductWithDate[];
}

// Dashboard Metrics combining all data
export interface DashboardMetrics {
  keyMetrics: KeyMetrics;
  weekProductsData: WeekProductData[];
  efficiency: EfficiencyMetrics;
}
