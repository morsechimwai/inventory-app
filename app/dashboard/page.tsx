// Components
import EfficiencyRadialChart from "@/components/efficiency-radial-chart";
import ProductChart from "@/components/product-chart";
import SideBar from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

// Prisma Client
import { prisma } from "@/lib/prisma";
import { TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const userId = user.id;

  // Fetch key metrics
  const [totalProducts, lowStock, allProducts] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.count({
      where: { userId, lowStockAt: { not: null }, quantity: { lte: 5 } },
    }),
    prisma.product.findMany({
      where: { userId },
      select: { price: true, quantity: true, createdAt: true },
    }),
  ]);

  // Calculate new products per week for the last 12 weeks
  const now = new Date();
  const weekProductsData = [];

  // Loop through the last 12 weeks
  for (let i = 11; i >= 0; i--) {
    // Calculate week start
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);

    // Calculate week end
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Format week label as MM/DD
    const weekLabel = `${String(weekStart.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(weekStart.getDate() + 1).padStart(2, "0")}`;

    // Count products created in this week
    const weekProducts = allProducts.filter((product) => {
      const productDate = new Date(product.createdAt);
      return productDate >= weekStart && productDate <= weekEnd;
    });

    // Push week data to array
    weekProductsData.push({ week: weekLabel, products: weekProducts.length });
  }

  // Calculate total value of all products
  const totalValue = allProducts.reduce((sum, product) => {
    return sum + Number(product.price) * Number(product.quantity);
  }, 0);

  // Calculate stock level percentages
  const inStockCount = allProducts.filter(
    (product) => Number(product.quantity) > 5
  ).length;
  // Calculate low stock and out of stock counts
  const lowStockCount = allProducts.filter(
    (product) => Number(product.quantity) <= 5 && Number(product.quantity) > 1
  ).length;
  // Out of stock count
  const outOfStockCount = allProducts.filter(
    (product) => Number(product.quantity) === 0
  ).length;

  // Calculate percentages
  const inStockPercentage =
    totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const lowStockPercentage =
    totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const outOfStockPercentage =
    totalProducts > 0 ? Math.round((outOfStockCount / totalProducts) * 100) : 0;

  type EfficiencyMetricKey = "inStock" | "lowStock" | "outOfStock";

  const efficiencyMetrics: {
    key: EfficiencyMetricKey;
    label: string;
    value: number;
    indicator: string;
    description: string;
  }[] = [
    {
      key: "inStock",
      label: "In Stock",
      value: inStockPercentage,
      indicator: "bg-emerald-400",
      description: "Healthy stock coverage",
    },
    {
      key: "lowStock",
      label: "Low Stock",
      value: lowStockPercentage,
      indicator: "bg-amber-400",
      description: "Needs attention soon",
    },
    {
      key: "outOfStock",
      label: "Out of Stock",
      value: outOfStockPercentage,
      indicator: "bg-red-400",
      description: "Restock immediately",
    },
  ];

  const efficiencyScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(inStockPercentage * 0.8 + (100 - outOfStockPercentage) * 0.2)
    )
  );

  // Fetch recent products
  const recent = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <>
      <SideBar currentPath="/dashboard" />
      {/* Header */}
      <main className="ml-64 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-sans">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Dashboard! Here you can find an overview of your
            inventory and recent activity.
          </p>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch">
          {/* Key Metrics Cards */}
          <div className="flex h-full flex-col gap-4">
            <h2 className="text-xl font-bold font-sans">Key Metrics</h2>
            <Card className="flex-1">
              <CardContent className="grid grid-cols-3 gap-4 text-center h-full items-center">
                <div>
                  <p className="text-3xl font-bold font-sans">
                    {totalProducts}
                  </p>
                  <h3 className="text-base font-semibold font-sans">
                    Total Products
                  </h3>
                  <div className="flex items-center justify-center">
                    <p className="text-sm text-emerald-400 font-medium font-sans">
                      +{totalProducts}
                    </p>
                    <TrendingUp className="size-3.5 text-emerald-400 inline-block ml-1" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold font-sans">
                    {totalValue.toFixed(0)}
                  </p>
                  <h3 className="text-base font-semibold font-sans">
                    Total Value
                  </h3>
                  <div className="flex items-center justify-center">
                    <p className="text-sm text-emerald-400 font-medium font-sans">
                      +{totalValue.toFixed(0)}
                    </p>
                    <TrendingUp className="size-3.5 text-emerald-400 inline-block ml-1" />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold font-sans">{lowStock}</p>
                  <h3 className="text-base font-semibold font-sans">
                    Low Stock
                  </h3>
                  <div className="flex items-center justify-center">
                    <p className="text-sm text-emerald-400 font-medium font-sans">
                      +{lowStock}
                    </p>
                    <TrendingUp className="size-3.5 text-emerald-400 inline-block ml-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Overtime */}
          <div className="flex h-full flex-col gap-4">
            <h2 className="text-xl font-bold font-sans">
              New product per week
            </h2>
            <Card className="flex-1">
              <CardContent>
                <ProductChart data={weekProductsData} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stock Levels Cards */}
        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch">
          <div className="flex h-full flex-col gap-4">
            <h2 className="text-xl font-bold font-sans">Stock Levels</h2>
            <Card className="flex-1">
              <CardContent>
                <div className="space-y-2">
                  {recent.map((product, key) => {
                    const stockLevel =
                      product.quantity === 0
                        ? 0
                        : product.quantity <= (product.lowStockAt || 5)
                        ? 1
                        : 2;

                    const bgColors = [
                      "bg-red-400",
                      "bg-amber-400",
                      "bg-emerald-400",
                    ];
                    const textColors = [
                      "text-red-400",
                      "text-amber-400",
                      "text-emerald-400",
                    ];

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg p-2 bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-2.5 rounded-full ${bgColors[stockLevel]}`}
                          />
                          <p className="text-sm font-medium font-sans">
                            {product.name}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-medium ${textColors[stockLevel]} font-sans`}
                        >
                          <span>
                            {product.quantity
                              ? product.quantity
                              : "out of stock"}{" "}
                          </span>
                          <span> {product.quantity ? "units" : ""}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex h-full flex-col gap-4">
            <h2 className="text-xl font-bold font-sans">Efficiency</h2>
            <Card className="flex-1">
              <CardContent className="flex flex-col">
                <div className="relative flex flex-1 items-center justify-center">
                  <div className="w-full max-w-[280px]">
                    <EfficiencyRadialChart score={efficiencyScore} />
                  </div>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Efficiency
                    </p>
                    <p className="text-4xl font-bold font-sans">
                      {efficiencyScore}%
                    </p>
                    <p className="text-xs text-muted-foreground font-sans">
                      optimized stock
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-sans text-muted-foreground mb-6">
                    Your inventory management efficiency is at {efficiencyScore}
                    %. Keep maintaining optimal stock levels to minimize waste
                    and avoid backorders.
                  </p>
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-3">
                    {efficiencyMetrics.map((metric) => (
                      <div
                        key={metric.key}
                        className="rounded-lg border bg-muted/40 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-4 rounded-full ${metric.indicator}`}
                          />
                          <p className="text-sm font-medium font-sans">
                            {metric.label}
                          </p>
                        </div>
                        <p className="mt-2 text-2xl font-bold font-sans">
                          {metric.value}%
                        </p>
                        <p className="text-xs text-muted-foreground font-sans">
                          {metric.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
