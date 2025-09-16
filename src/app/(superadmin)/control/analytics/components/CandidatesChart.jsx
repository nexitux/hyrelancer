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

const chartData = [
  { gender: "male", candidates: 1234, fill: "#06b6d4" },
  { gender: "female", candidates: 1754, fill: "#8b5cf6" },
];

const chartConfig = {
  candidates: {
    label: "Candidates",
  },
  male: {
    label: "Male",
    color: "#06b6d4",
  },
  female: {
    label: "Female",
    color: "#8b5cf6",
  },
};

const CandidatesChart = () => {
  const totalCandidates = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.candidates, 0);
  }, []);

  return (
    <Card className="flex flex-col bg-white border border-gray-100 rounded-lg gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-gray-100">
        <CardTitle className="font-bold text-gray-900">
          Candidates
        </CardTitle>
        <button className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View All
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
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
              dataKey="candidates"
              nameKey="gender"
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
                          {totalCandidates.toLocaleString()}
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
          {/* Male Candidates */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Male Candidates</div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl md:text-2xl font-semibold text-gray-900">1,234</span>
              <span className="flex items-center text-sm font-medium text-green-500">
                <span className="mr-1">▲</span>
                0.23%
              </span>
            </div>
          </div>

          {/* Female Candidates */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-1">Female Candidates</div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl md:text-2xl font-semibold text-gray-900">1,754</span>
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