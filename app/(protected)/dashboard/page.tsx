// Next.js
import Link from "next/link"

// Components
import EfficiencyRadialChart from "@/components/charts/efficiency-radial-chart"
import ProductChart from "@/components/charts/product-chart"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

// Icons
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart2,
  ChartPie,
  Clock3,
  HeartPulse,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  RefreshCw,
  TrendingUp,
  TrendingUpDown,
  Warehouse,
} from "lucide-react"

// Actions
import { getDashboardMetrics } from "@/lib/actions/dashboard"

// Utils
import { calculateWeeklyTrends } from "@/lib/utils/dashboard"
import { currencyFormatterTHB, formatRelativeTime, quantityFormatter } from "@/lib/utils/formatters"
import { Badge } from "@/components/ui/badge"

const STOCK_LEVEL_STYLES = {
  OUT_OF_STOCK: {
    bg: "bg-red-400",
    text: "text-red-400",
    label: "Out of Stock",
    icon: PackageOpen,
  },
  LOW: {
    bg: "bg-amber-400",
    text: "text-amber-400",
    label: "Low Stock",
    icon: PackagePlus,
  },
  HEALTHY: {
    bg: "bg-emerald-400",
    text: "text-emerald-400",
    label: "Healthy",
    icon: PackageCheck,
  },
} as const

const STOCK_LEVEL_LABELS: Record<keyof typeof STOCK_LEVEL_STYLES, string> = {
  OUT_OF_STOCK: "Needs immediate restock",
  LOW: "Below preferred threshold",
  HEALTHY: "Comfortable stock range",
}

const MOVEMENT_STYLES = {
  IN: {
    label: "Stock in",
    tone: "text-emerald-500",
    chip: "bg-emerald-500/10 text-emerald-600",
    icon: ArrowDownToLine,
    sign: "+",
  },
  OUT: {
    label: "Stock out",
    tone: "text-red-500",
    chip: "bg-red-500/10 text-red-600",
    icon: ArrowUpFromLine,
    sign: "−",
  },
  ADJUST: {
    label: "Adjustment",
    tone: "text-amber-500",
    chip: "bg-amber-500/10 text-amber-600",
    icon: RefreshCw,
    sign: "",
  },
} as const

export default async function DashboardPage() {
  const {
    keyMetrics,
    weekProductsData,
    efficiency,
    stockLevels,
    recentActivity,
    restockSuggestions,
  } = await getDashboardMetrics()

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

  const formatTrend = (trend: number) => {
    const isPositive = trend >= 0
    return {
      text: isPositive ? "text-emerald-600" : "text-red-600",
      icon: isPositive ? "text-emerald-600" : "text-red-600 rotate-180",
      bg: isPositive ? "bg-emerald-500/10" : "bg-red-500/10",
      prefix: isPositive ? "+" : "",
      value: trend.toFixed(1),
    }
  }

  const currencyParts = currencyFormatterTHB.format(totalValue).split(" ")
  const currencyLead = currencyParts[0] ?? ""
  const currencyRest = currencyParts.slice(1).join(" ")

  const keyMetricTiles = [
    {
      key: "totalProducts",
      title: "Total Products",
      primary: <p className="text-3xl font-bold font-sans">{totalProducts}</p>,
      trend: productTrend,
    },
    {
      key: "lowStock",
      title: "Low Stock",
      primary: <p className="text-3xl font-bold font-sans">{lowStock}</p>,
      trend: lowStockTrend,
    },
    {
      key: "totalValue",
      title: "Total Value",
      primary: (
        <p className="text-3xl font-bold font-sans">
          {currencyLead}
          {currencyRest ? (
            <span className="text-lg font-semibold font-sans ml-1">{currencyRest}</span>
          ) : null}
        </p>
      ),
      trend: totalValueTrend,
    },
  ]

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
          <Card className="flex-1">
            <CardHeader className="flex flex-col gap-2 border-b">
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <TrendingUpDown className="size-5" />
                </span>
                <div>
                  <CardTitle className="font-sans">Key Metrics</CardTitle>
                  <CardDescription className="font-sans">
                    Overview of your inventory performance this week.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex h-full w-full">
              {totalProducts > 0 ? (
                <div className="grid h-full flex-1 grid-cols-1 place-items-center gap-4 text-center sm:grid-cols-3 sm:items-center">
                  {keyMetricTiles.map(({ key, title, primary, trend }) => {
                    const { prefix, value, text, icon, bg } = formatTrend(trend)
                    return (
                      <div key={key} className="flex h-full flex-col items-center justify-center">
                        <div
                          className={`flex items-center justify-center px-2 ${bg} rounded-full mt-2`}
                        >
                          <p className={`text-sm font-medium font-sans ${text}`}>
                            {prefix}
                            {value}%
                          </p>
                          <TrendingUp className={`size-3.5 ml-1 ${icon}`} />
                        </div>
                        <div className="py-4">{primary}</div>

                        <h3 className="text-base font-semibold font-sans">{title}</h3>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty className="w-full">
                  <EmptyHeader className="w-full max-w-none">
                    <EmptyMedia variant="icon">
                      <TrendingUpDown className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No insights yet</EmptyTitle>
                    <EmptyDescription>
                      Add your first product to see your inventory data here.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
            <CardFooter className="[.border-t]:pt-4 border-t">
              <p className="text-sm text-muted-foreground font-sans">
                Trend percentages compare the current week against the previous week.
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Weekly Chart */}
        <div className="flex h-full flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="flex flex-col gap-2 border-b">
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                  <BarChart2 className="size-5" />
                </span>
                <div>
                  <CardTitle className="font-sans">New Products</CardTitle>
                  <CardDescription className="font-sans">
                    Products added over the past week.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
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
          <Card className="flex-1">
            <CardHeader className="flex flex-col gap-2 border-b">
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-pink-500/10 text-pink-600">
                  <HeartPulse className="size-5" />
                </span>
                <div>
                  <CardTitle className="font-sans">Stock Levels</CardTitle>
                  <CardDescription className="font-sans">
                    Current stock status across your products.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex h-full w-full">
              {stockLevels.length > 0 ? (
                <div className="flex-1 space-y-2">
                  {stockLevels.map((product) => {
                    const styles = STOCK_LEVEL_STYLES[product.stockLevel]
                    const isOutOfStock = product.stockLevel === "OUT_OF_STOCK"
                    const stockText = isOutOfStock
                      ? "Out of stock"
                      : `${quantityFormatter.format(product.currentStock)} ${product.unitName}`
                    const threshold =
                      product.lowStockAt !== null
                        ? `Min ${quantityFormatter.format(product.lowStockAt)} ${product.unitName}`
                        : null
                    const StockIcon = STOCK_LEVEL_STYLES[product.stockLevel].icon
                    return (
                      <div
                        key={product.id}
                        className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-10 items-center justify-center rounded-full text-white ${styles.bg}`}
                          >
                            <StockIcon className="size-5" />
                          </span>
                          <div>
                            <p className="text-sm font-medium font-sans">{product.name}</p>

                            <p className="text-xs text-muted-foreground font-sans">
                              <span className={`${styles.text}`}>{styles.label}</span> -{" "}
                              {STOCK_LEVEL_LABELS[product.stockLevel]}
                              {threshold ? ` · ${threshold}` : ""}
                            </p>
                          </div>
                        </div>

                        <p className={`text-sm font-base font-sans tracking-wider ${styles.text}`}>
                          {stockText}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty className="w-full">
                  <EmptyHeader className="w-full max-w-none">
                    <EmptyMedia variant="icon">
                      <HeartPulse className="size-8 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No product yet</EmptyTitle>
                    <EmptyDescription>
                      Add products to start managing your inventory.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Efficiency */}
        <div className="flex h-full flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="flex flex-col gap-2 border-b">
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
                  <ChartPie className="size-5" />
                </span>
                <div>
                  <CardTitle className="font-sans">Efficiency</CardTitle>
                  <CardDescription className="font-sans">
                    How well your inventory is optimized.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
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

      {/* Activity & Restock */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch">
        {/* Recent Activity */}
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-col gap-2 border-b">
            <div className="flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock3 className="size-5" />
              </span>
              <div>
                <CardTitle className="font-sans">Recent Activity</CardTitle>
                <CardDescription className="font-sans">
                  Latest movements captured across all products.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const style = MOVEMENT_STYLES[activity.movementType]
                  const quantity = quantityFormatter.format(Math.abs(activity.quantity))
                  const Icon = style.icon
                  const signSymbol =
                    activity.movementType === "IN"
                      ? "+"
                      : activity.movementType === "OUT"
                      ? "−"
                      : activity.quantity < 0
                      ? "−"
                      : activity.quantity > 0
                      ? "+"
                      : ""

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-3"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex size-9 items-center justify-center rounded-full ${style.chip}`}
                        >
                          <Icon className="size-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold font-sans">{activity.productName}</p>
                          <p className="text-xs text-muted-foreground font-sans">
                            {style.label}
                            {activity.reason ? ` · ${activity.reason}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold font-sans ${style.tone}`}>
                          {signSymbol}
                          {quantity} {activity.unitName}
                        </p>
                        <p className="text-xs text-muted-foreground font-sans">
                          {formatRelativeTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Empty className="w-full">
                <EmptyHeader className="w-full max-w-none">
                  <EmptyMedia variant="icon">
                    <Clock3 className="size-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No activity logged</EmptyTitle>
                  <EmptyDescription>
                    Record purchases, sales, or adjustments to see activity here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
          <CardFooter className="[.border-t]:pt-4 border-t">
            <Button asChild variant="outline" className="w-full">
              <Link href="/inventory-activity">Open inventory activity</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Restock suggestions */}
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-col gap-2 border-b">
            <div className="flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <PackagePlus className="size-5" />
              </span>
              <div>
                <CardTitle className="font-sans">Restock Suggestions</CardTitle>
                <CardDescription className="font-sans">
                  Products approaching their reorder point.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {restockSuggestions.length > 0 ? (
              <div className="space-y-3">
                {restockSuggestions.map((product) => {
                  const styles = STOCK_LEVEL_STYLES[product.stockLevel]
                  const thresholdLabel =
                    product.lowStockAt !== null
                      ? `Reorder at ${quantityFormatter.format(product.lowStockAt)} ${
                          product.unitName
                        }`
                      : "Set a reorder threshold"

                  const recommended =
                    product.recommendedOrder !== null
                      ? `${quantityFormatter.format(product.recommendedOrder)} ${product.unitName}`
                      : null

                  return (
                    <div
                      key={product.id}
                      className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold font-sans">{product.name}</p>
                        <p className="text-xs text-muted-foreground font-sans">
                          {product.categoryName ?? "Uncategorised"} · {thresholdLabel}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold font-sans ${styles.text}`}>
                          {quantityFormatter.format(product.currentStock)} {product.unitName}
                        </p>
                        <p className="text-xs text-muted-foreground font-sans">
                          {recommended ? `Order ~${recommended}` : "Monitor levels"}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <Empty className="w-full">
                <EmptyHeader className="w-full max-w-none">
                  <EmptyMedia variant="icon">
                    <PackageCheck className="size-8 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {allProducts.length === 0 ? "No products found" : "All caught up"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {allProducts.length === 0
                      ? "Add products and set reorder thresholds to receive restock suggestions."
                      : "No products are nearing their reorder points."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
          <CardFooter className="[.border-t]:pt-4 border-t">
            <Button asChild className="w-full">
              <Link href="/product">Review product catalog</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  )
}
