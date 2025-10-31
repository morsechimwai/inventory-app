"use server";

// Stack Auth
import { getCurrentUser } from "@/lib/auth/auth";

// App Error
import { AppError } from "@/lib/errors/app-error";

// Services
import { getDashboardKeyMetrics } from "@/lib/services/dashboard";

// Types
import type { DashboardMetrics } from "@/lib/types/dashboard";

// Utils
import {
  calculateWeeklyProducts,
  calculateEfficiencyMetrics,
} from "@/lib/utils/dashboard";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHORIZED", "Please log in first.");

  const keyMetrics = await getDashboardKeyMetrics(user.id);

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
