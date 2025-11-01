"use client"

import { Area, AreaChart, CartesianGrid, Label, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface ProductChart {
  week: string
  products: number
}

const chartConfig = {
  products: {
    label: "Products",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function ProductChart({ data }: { data: ProductChart[] }) {
  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="week" fontSize={12} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis fontSize={12} tickLine={false} axisLine allowDecimals={false}>
            <Label
              value="Products"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: "middle", fontSize: 14 }}
            />
          </YAxis>
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Area
            dataKey="products"
            type="natural"
            fill="oklch(74.6% 0.16 232.661)"
            fillOpacity={0.4}
            stroke="oklch(74.6% 0.16 232.661)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
