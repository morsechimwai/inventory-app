"use client";

import * as React from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface EfficiencyRadialChartProps {
  score: number;
}

const chartConfig = {
  score: {
    label: "Efficiency",
    color: "oklch(70.2% 0.183 293.541)",
  },
} satisfies ChartConfig;

export default function EfficiencyRadialChart({
  score,
}: EfficiencyRadialChartProps) {
  const normalizedScore = React.useMemo(
    () => Math.max(0, Math.min(100, score)),
    [score]
  );

  const chartData = React.useMemo(
    () => [
      {
        name: "score",
        value: normalizedScore,
        fill: "var(--color-score)",
      },
    ],
    [normalizedScore]
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[260px] w-full"
    >
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={-270}
        innerRadius={82}
        outerRadius={100}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          tick={false}
          dataKey="value"
        />
        <RadialBar dataKey="value" background cornerRadius={6} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value) => [`Score ${value}%`]}
            />
          }
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
