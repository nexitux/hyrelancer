"use client"

import { useState, useEffect } from "react";
import { TrendingDown, TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"
import { dashboardService } from '@/services/dashboardService';

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

const chartConfig = {
  count: {
    label: "Count",
  },
  total: {
    label: "Total",
    color: "#6366f1",
  },
  active: {
    label: "Active",
    color: "#3b82f6",
  },
  completed: {
    label: "Completed", 
    color: "#10b981",
  },
  inProgress: {
    label: "In Progress", 
    color: "#f59e0b",
  },
}

export default function PieChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getUserDashboard();
        const transformedData = dashboardService.transformDashboardData(data);
        
        // Transform job statistics into chart data
        const jobStats = [
          { category: "total", count: transformedData?.stats?.totalJobs || 0, fill: "var(--color-total)" },
          { category: "active", count: transformedData?.stats?.activeJobs || 0, fill: "var(--color-active)" },
          { category: "completed", count: transformedData?.stats?.completedJobs || 0, fill: "var(--color-completed)" },
          { category: "inProgress", count: transformedData?.stats?.inProgressJobs || 0, fill: "var(--color-inProgress)" },
        ];
        
        setChartData(jobStats);
      } catch (error) {
        console.error('Error fetching job stats:', error);
        // Set zero data on error
        setChartData([
          { category: "total", count: 0, fill: "var(--color-total)" },
          { category: "active", count: 0, fill: "var(--color-active)" },
          { category: "completed", count: 0, fill: "var(--color-completed)" },
          { category: "inProgress", count: 0, fill: "var(--color-inProgress)" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalJobs = chartData.find(item => item.category === "total")?.count || 0
  const activeJobs = chartData.find(item => item.category === "active")?.count || 0
  const activePercentage = totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0
  const isHighActivity = activePercentage > 50

  if (loading) {
    return (
      <Card className="relative overflow-hidden border border-gray-200 shadow-sm bg-white">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-base font-medium">Job Status</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Current job distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto aspect-square max-h-[270px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-base font-medium">Job Status</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Current job distribution
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
            <RadialBar dataKey="count" background cornerRadius={4}>
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
          {isHighActivity ? (
            <>
              <TrendingUp className="h-3 w-3 text-blue-600" />
              <span className="text-blue-600">High activity this month</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Steady job activity</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span>Active: {activeJobs}</span>
          <span>Total: {totalJobs}</span>
        </div>
      </CardFooter>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 opacity-50" />
    </Card>
  )
}