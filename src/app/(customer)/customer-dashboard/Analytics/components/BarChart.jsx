"use client"
import { TrendingUp, BarChart3, Calendar } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
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

export default function EnhancedBarChart() {
  const chartData = [
    { month: "January", jobs: 45, target: 50 },
    { month: "February", jobs: 30, target: 35 },
    { month: "March", jobs: 35, target: 40 },
    { month: "April", jobs: 25, target: 30 },
    { month: "May", jobs: 40, target: 45 },
    { month: "June", jobs: 30, target: 35 },
    { month: "July", jobs: 35, target: 40 },
    { month: "August", jobs: 50, target: 55 },
    { month: "September", jobs: 40, target: 45 },
    { month: "October", jobs: 45, target: 50 },
  ];

  const chartConfig = {
    jobs: {
      label: "Job Posts",
      color: "#3b82f6",
    },
    target: {
      label: "Target",
      color: "#93c5fd",
    },
  }

  // Calculate performance metrics
  const totalJobs = chartData.reduce((sum, item) => sum + item.jobs, 0);
  const averageJobs = Math.round(totalJobs / chartData.length);
  const lastMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];
  const growthRate = ((lastMonth.jobs - previousMonth.jobs) / previousMonth.jobs * 100).toFixed(1);
  const isPositiveGrowth = parseFloat(growthRate) > 0;

  return (
    <Card className="relative overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-slate-50/50 to-white">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-blue-100/50 to-transparent rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-violet-100/50 to-transparent rounded-full translate-y-12 -translate-x-12" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/10 shadow-sm">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Job Posting Performance
              </CardTitle>
            </div>
            <CardDescription className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>January - October 2024</span>
            </CardDescription>
          </div>
          
          {/* Performance indicator */}
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">{totalJobs}</div>
            <div className="text-xs text-muted-foreground">Total Posts</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 15,
                bottom: 5,
              }}
              barGap={4}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.2} 
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.slice(0, 3)}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                width={30}
              />
              <ChartTooltip
                cursor={{ 
                  fill: 'hsl(var(--muted))', 
                  opacity: 0.1,
                  radius: 4 
                }}
                content={<ChartTooltipContent 
                  indicator="dashed" 
                  className="bg-background/95 backdrop-blur-sm border shadow-lg rounded-lg"
                />}
              />
              <Bar
                dataKey="jobs"
                fill="var(--color-jobs)"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-300 hover:opacity-80"
              />
              <Bar
                dataKey="target"
                fill="var(--color-target)"
                radius={[4, 4, 0, 0]}
                opacity={0.3}
                className="transition-all duration-300"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      
      <CardFooter className="relative bg-gradient-to-r from-muted/20 to-transparent">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start gap-2 text-sm">
            <div className={`flex items-center gap-2 font-medium ${
              isPositiveGrowth ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${!isPositiveGrowth && 'rotate-180'}`} />
              <span>
                {isPositiveGrowth ? '+' : ''}{growthRate}% from last month
              </span>
            </div>
            <div className="text-muted-foreground text-xs">
              Average {averageJobs} job posts per month
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-sm bg-chart-1" />
              <span className="text-muted-foreground">Actual</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-sm bg-chart-2 opacity-30" />
              <span className="text-muted-foreground">Target</span>
            </div>
          </div>
        </div>
      </CardFooter>
      
      {/* Subtle accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
    </Card>
  );
}