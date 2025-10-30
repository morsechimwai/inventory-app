// Next.js
import Link from "next/link"

// Components
import EfficiencyRadialChart from "@/components/charts/efficiency-radial-chart"
import ProductChart from "@/components/charts/product-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

// Icons
import { BarChart2, ChartPie, PackageOpen, TrendingUp } from "lucide-react"

// Actions
import { getDashboardMetrics } from "@/lib/actions/dashboard"

// Utils
import { formatCurrencyTHBText } from "@/lib/utils"
import { calculateWeeklyTrends } from "@/lib/utils/dashboard"

export default async function DashboardPage() {
  const { keyMetrics, weekProductsData, efficiency } = await getDashboardMetrics()

  /**
   * :: Key metrics
   * totalProducts = total number of products
   * lowStock = number of low stock products
   * totalValue = total inventory value
   * allProducts = array of all products
   */
  const { totalProducts, lowStock, totalValue, allProducts } = keyMetrics

  /**
   * :: Weekly trends
   * productTrend = trend of new products added weekly
   * totalValueTrend = trend of total inventory value weekly
   * lowStockTrend = trend of low stock products weekly
   */
  const { productTrend, totalValueTrend, lowStockTrend } = calculateWeeklyTrends(allProducts)

  /**
   *  :: Efficiency metrics
   *  efficiencyScore = overall efficiency score
   *  inStockPercentage = percentage of products in stock
   *  lowStockPercentage = percentage of products low in stock
   *  outOfStockPercentage = percentage of products out of stock
   */
  const { efficiencyScore, inStockPercentage, lowStockPercentage, outOfStockPercentage } =
    efficiency

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
  ]

  // Mock recent products — ถ้าต้องการข้อมูลจริงให้ fetch ใน getDashboardMetrics()
  const recent = allProducts.slice(0, 5).map((p, i) => ({
    name: p.name,
    lowStockAt: 5,
  }))

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <p className="text-muted-foreground font-sans">
          Your inventory at a glance — recent activity, key stats, and quick shortcuts to keep
          everything running smoothly.
        </p>
      </div>

      {/* Key Metrics Section */}
      <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch">
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-xl font-bold font-sans">Key Metrics</h2>
          <Card className="flex-1">
            <CardContent className="flex h-full w-full">
              {totalProducts > 0 ? (
                <div className="grid h-full flex-1 grid-cols-1 place-items-center gap-4 text-center sm:grid-cols-3 sm:items-center">
                  <div className="flex h-full flex-col items-center justify-center">
                    <h3 className="text-base font-semibold font-sans">Total Products</h3>
                    <p className="text-3xl font-bold font-sans">{totalProducts}</p>
                    <div className="flex items-center justify-center">
                      <p
                        className={`text-sm font-medium font-sans ${
                          productTrend >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {productTrend >= 0 ? "+" : ""}
                        {productTrend.toFixed(1)}%
                      </p>
                      <TrendingUp
                        className={`size-3.5 ml-1 ${
                          productTrend >= 0 ? "text-emerald-400" : "text-red-400 rotate-180"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex h-full flex-col items-center justify-center">
                    <h3 className="text-base font-semibold font-sans">Low Stock</h3>
                    <p className="text-3xl font-bold font-sans">{lowStock}</p>
                    <div className="flex items-center justify-center">
                      <p
                        className={`text-sm font-medium font-sans ${
                          lowStockTrend >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {lowStockTrend >= 0 ? "+" : ""}
                        {lowStockTrend.toFixed(1)}%
                      </p>
                      <TrendingUp
                        className={`size-3.5 ml-1 ${
                          lowStockTrend >= 0 ? "text-emerald-400" : "text-red-400 rotate-180"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex h-full flex-col items-center justify-center">
                    <h3 className="text-base font-semibold font-sans">Total Value</h3>
                    <p className="text-3xl font-bold font-sans">
                      {formatCurrencyTHBText(totalValue).split(" ")[0]}
                      <span className="text-lg font-semibold font-sans ml-1">
                        {formatCurrencyTHBText(totalValue).split(" ")[1]}
                      </span>
                    </p>

                    <div className="flex items-center justify-center">
                      <p
                        className={`text-sm font-medium font-sans ${
                          totalValueTrend >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {totalValueTrend >= 0 ? "+" : ""}
                        {totalValueTrend.toFixed(1)}%
                      </p>
                      <TrendingUp
                        className={`size-3.5 ml-1 ${
                          totalValueTrend >= 0 ? "text-emerald-400" : "text-red-400 rotate-180"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <Empty className="w-full">
                  <EmptyHeader className="w-full max-w-none">
                    <EmptyMedia variant="icon">
                      <BarChart2 className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No insights yet</EmptyTitle>
                    <EmptyDescription>
                      Add your first product to see your inventory data here.
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
      <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch">
        {/* Stock Levels */}
        <div className="flex h-full flex-col gap-4">
          <h2 className="text-xl font-bold font-sans">Stock Levels</h2>
          <Card className="flex-1">
            <CardContent className="flex h-full w-full">
              {recent.length > 0 ? (
                <div className="flex-1 space-y-2">
                  {recent.map((product, key) => {
                    // const stockLevel =
                    //   product.quantity === 0
                    //     ? 0
                    //     : product.quantity <= (product.lowStockAt || 5)
                    //     ? 1
                    //     : 2

                    const bgColors = ["bg-red-400", "bg-amber-400", "bg-emerald-400"]
                    const textColors = ["text-red-400", "text-amber-400", "text-emerald-400"]

                    return (
                      <div
                        key={key}
                        className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        {/* <div className="flex items-center gap-2">
                          <span className={`w-4 h-2.5 rounded-full ${bgColors[stockLevel]}`} />
                          <p className="text-sm font-medium font-sans">{product.name}</p>
                        </div> */}
                        {/* <p className={`text-sm font-medium ${textColors[stockLevel]} font-sans`}>
                          <span>{product.quantity ? product.quantity : "out of stock"} </span>
                          <span>{product.quantity ? "units" : ""}</span>
                        </p> */}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty className="w-full">
                  <EmptyHeader className="w-full max-w-none">
                    <EmptyMedia variant="icon">
                      <PackageOpen className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No products yet</EmptyTitle>
                    <EmptyDescription>
                      Add products to start managing your inventory.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="w-full max-w-none">
                    <Button asChild className="w-full">
                      <Link href="/product">Go to products</Link>
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
                    <EmptyTitle>No efficiency data yet</EmptyTitle>
                    <EmptyDescription>
                      Add products to start seeing efficiency insights here.
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
                      <p className="text-4xl font-bold font-sans">{efficiencyScore}%</p>
                      <p className="text-xs text-muted-foreground font-sans">optimized stock</p>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col mt-4">
                    <p className="mb-6 text-sm font-sans text-muted-foreground">
                      Your inventory management efficiency is at{" "}
                      <span className="font-semibold">{efficiencyScore}%</span>. Keep maintaining
                      optimal stock levels to minimize waste and avoid backorders.
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {efficiencyMetrics.map((metric) => (
                        <div key={metric.key} className="rounded-lg border bg-muted/40 p-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-4 rounded-full ${metric.indicator}`} />
                            <p className="text-sm font-medium font-sans">{metric.label}</p>
                          </div>
                          <p className="mt-2 text-2xl font-bold font-sans">{metric.value}%</p>
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
  )
}
