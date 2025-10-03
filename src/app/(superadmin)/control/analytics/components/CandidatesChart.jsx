import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const CandidatesChart = ({ dashboardData }) => {
  const chartData = React.useMemo(() => [
    { type: "freelancers", count: dashboardData?.FeCount || 0, fill: "#06b6d4" },
    { type: "customers", count: dashboardData?.CuCount || 0, fill: "#8b5cf6" },
  ], [dashboardData?.FeCount, dashboardData?.CuCount]);

  const chartConfig = {
    count: {
      label: "Users",
    },
    freelancers: {
      label: "Freelancers",
      color: "#06b6d4",
    },
    customers: {
      label: "Customers",
      color: "#8b5cf6",
    },
  };

  const totalUsers = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col bg-white border border-gray-100 rounded-lg gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-100">
        <CardTitle className="font-bold text-gray-900">
          Users Distribution
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[200px] w-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="type"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={0}
              startAngle={90}
              endAngle={450}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 10}
                          className="fill-gray-900 text-xl font-semibold"
                        >
                          Total
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 15}
                          className="fill-gray-900 text-base"
                        >
                          {totalUsers.toLocaleString()}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      {/* Stats Footer */}
      <div className="px-4 md:px-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Freelancers */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Freelancers</div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl md:text-2xl font-semibold text-gray-900">{dashboardData?.FeCount || 0}</span>
              <span className="flex items-center text-sm font-medium text-green-500">
                <span className="mr-1">▲</span>
                0.23%
              </span>
            </div>
          </div>

          {/* Customers */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Customers</div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl md:text-2xl font-semibold text-gray-900">{dashboardData?.CuCount || 0}</span>
              <span className="flex items-center text-sm font-medium text-red-500">
                <span className="mr-1">▼</span>
                0.11%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CandidatesChart;