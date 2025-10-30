"use server";

// Stack Auth
import { getCurrentUser } from "@/lib/auth/auth";

// Prisma Client
import { prisma } from "@/lib/db/prisma";

// App Error
import { AppError } from "@/lib/errors/app-error";

// Types
import type {
  DashboardMetrics,
  KeyMetrics,
  ProductWithDate,
} from "@/lib/types/dashboard";

// Utils
import {
  calculateWeeklyProducts,
  calculateEfficiencyMetrics,
} from "@/lib/utils/dashboard";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.");

  const keyMetrics = await getKeyMetrics(user.id);

  const weekProductsData = calculateWeeklyProducts(keyMetrics.allProducts);
  const efficiency = calculateEfficiencyMetrics(
    keyMetrics.allProducts,
    keyMetrics.totalProducts
  );

  return {
    keyMetrics,
    weekProductsData,
    efficiency,
  };
}

async function getKeyMetrics(userId: string): Promise<KeyMetrics> {
  const [totalProducts, lowStock, allProducts] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.count({
      where: { userId, lowStockAt: { not: null } },
    }),
    prisma.product.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        sku: true,
        lowStockAt: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalProducts,
    lowStock,
    totalValue: 0,
    allProducts: allProducts as ProductWithDate[],
  };
}
