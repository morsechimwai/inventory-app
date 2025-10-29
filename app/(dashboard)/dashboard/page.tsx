// Next.js
import Link from "next/link";

// Components
import EfficiencyRadialChart from "@/components/charts/efficiency-radial-chart";
import ProductChart from "@/components/charts/product-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// Icons
import { BarChart2, ChartPie, PackageOpen } from "lucide-react";

// Actions
import { getDashboardMetrics } from "@/lib/actions/dashboard";

export default async function Dashboard() {
  const { keyMetrics, weekProductsData, efficiency } =
    await getDashboardMetrics();

  const { totalProducts, lowStock, totalValue, allProducts } = keyMetrics;
  const {
    efficiencyScore,
    inStockPercentage,
    lowStockPercentage,
    outOfStockPercentage,
  } = efficiency;

  // Efficiency metric cards
  const efficiencyMetrics = [
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

  // Mock recent products — ถ้าต้องการข้อมูลจริงให้ fetch ใน getDashboardMetrics()
  const recent = allProducts.slice(0, 5).map((p, i) => ({
    name: `Product ${i + 1}`,
    quantity: p.quantity,
    lowStockAt: 5,
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-muted-foreground font-sans">
          Welcome to the Dashboard! Here you can find an overview of your
          inventory and recent activity.
        </p>
      </div>

      {/* Key Metrics Section */}
      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch">
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-xl font-bold font-sans">Key Metrics</h2>
          <Card className="flex-1">
            <CardContent className="flex h-full w-full">
              {totalProducts > 0 ? (
                <div className="grid h-full flex-1 grid-cols-1 place-items-center gap-4 text-center sm:grid-cols-3 sm:items-center">
                  <div className="flex h-full flex-col items-center justify-center">
                    <p className="text-3xl font-bold font-sans">
                      {totalProducts}
                    </p>
                    <h3 className="text-base font-semibold font-sans">
                      Total Products
                    </h3>
                  </div>
                  <div className="flex h-full flex-col items-center justify-center">
                    <p className="text-3xl font-bold font-sans">
                      {totalValue.toFixed(0)}
                    </p>
                    <h3 className="text-base font-semibold font-sans">
                      Total Value
                    </h3>
                  </div>
                  <div className="flex h-full flex-col items-center justify-center">
                    <p className="text-3xl font-bold font-sans">{lowStock}</p>
                    <h3 className="text-base font-semibold font-sans">
                      Low Stock
                    </h3>
                  </div>
                </div>
              ) : (
                <Empty className="w-full">
                  <EmptyHeader className="w-full max-w-none">
                    <EmptyMedia variant="icon">
                      <BarChart2 className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No data available</EmptyTitle>
                    <EmptyDescription>
                      Add products to view your key metrics.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Chart */}
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-xl font-bold font-sans">New product per week</h2>
          <Card className="flex-1">
            <CardContent>
              <ProductChart data={weekProductsData} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stock Levels + Efficiency */}
      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 items-stretch">
        {/* Stock Levels */}
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-xl font-bold font-sans">Stock Levels</h2>
          <Card className="flex-1">
            <CardContent className="flex h-full w-full">
              {recent.length > 0 ? (
                <div className="flex-1 space-y-2">
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
                        className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2 sm:flex-row sm:items-center sm:justify-between"
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
                          <span>{product.quantity ? "units" : ""}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty className="w-full">
                  <EmptyHeader className="w-full max-w-none">
                    <EmptyMedia variant="icon">
                      <PackageOpen className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No Products</EmptyTitle>
                    <EmptyDescription>
                      Go to your inventory to add products.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="w-full max-w-none">
                    <Button asChild className="w-full">
                      <Link href="/inventory">View Inventory</Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Efficiency */}
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-xl font-bold font-sans">Efficiency</h2>
          <Card className="flex-1">
            <CardContent className="flex flex-col h-full w-full">
              {efficiencyScore === null ? (
                <Empty className="w-full h-full">
                  <EmptyHeader className="w-full max-w-none">
                    <EmptyMedia variant="icon">
                      <ChartPie className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No Efficiency Data</EmptyTitle>
                    <EmptyDescription>
                      Start tracking your efficiency by adding products to your
                      inventory.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <>
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

                  <div className="flex flex-1 flex-col mt-4">
                    <p className="mb-6 text-sm font-sans text-muted-foreground">
                      Your inventory management efficiency is at{" "}
                      <span className="font-semibold">{efficiencyScore}%</span>.
                      Keep maintaining optimal stock levels to minimize waste
                      and avoid backorders.
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
