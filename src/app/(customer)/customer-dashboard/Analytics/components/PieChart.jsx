"use client"

import { TrendingDown, TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { category: "spent", amount: 7500, fill: "var(--color-spent)" },
  { category: "remaining", amount: 2500, fill: "var(--color-remaining)" },
  { category: "spent", amount: 5500, fill: "var(--color-spent)" },
  { category: "remaining", amount: 3500, fill: "var(--color-remaining)" },
  { category: "remaining", amount: 4500, fill: "var(--color-remaining)" },
]

const chartConfig = {
  amount: {
    label: "Amount",
  },
  spent: {
    label: "Spent",
    color: "#3b82f6",
  },
  remaining: {
    label: "Remaining", 
    color: "#93c5fd",
  },
}

export default function PieChart() {
  const totalBudget = chartData.reduce((sum, item) => sum + item.amount, 0)
  const spentAmount = chartData.find(item => item.category === "spent")?.amount || 0
  const spentPercentage = Math.round((spentAmount / totalBudget) * 100)
  const isOverBudget = spentPercentage > 80

  return (
    <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base font-medium">Budget Usage</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Monthly spending overview
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[270px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={270}
            innerRadius={30}
            outerRadius={90}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="category" />}
            />
            <RadialBar dataKey="amount" background cornerRadius={4}>
              <LabelList
                position="insideStart"
                dataKey="category"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={10}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          {isOverBudget ? (
            <>
              <TrendingUp className="h-3 w-3 text-destructive" />
              <span className="text-destructive">High usage this month</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">On track with budget</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>Spent: ${spentAmount.toLocaleString()}</span>
          <span>Total: ${totalBudget.toLocaleString()}</span>
        </div>
      </CardFooter>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
    </Card>
  )
}