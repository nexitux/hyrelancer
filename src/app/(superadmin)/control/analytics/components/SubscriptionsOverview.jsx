import { ChevronDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
  { month: "01 Jan", basic: 80, pro: 35 },
  { month: "02 Jan", basic: 78, pro: 35 },
  { month: "03 Jan", basic: 40, pro: 60 },
  { month: "04 Jan", basic: 40, pro: 60 },
  { month: "05 Jan", basic: 35, pro: 10 },
  { month: "06 Jan", basic: 75, pro: 15 },
  { month: "07 Jan", basic: 75, pro: 55 },
  { month: "08 Jan", basic: 55, pro: 60 },
  { month: "09 Jan", basic: 50, pro: 40 },
  { month: "10 Jan", basic: 20, pro: 40 },
  { month: "11 Jan", basic: 20, pro: 80 },
  { month: "12 Jan", basic: 50, pro: 80 }
];

const chartConfig = {
  basic: {
    label: "Basic",
    color: "#8b5cf6",
  },
  pro: {
    label: "Pro",
    color: "#06b6d4",
  },
};

const SubscriptionsOverview = () => {
  return (
    <Card className="w-full bg-white border border-gray-100 gap-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100">
        <CardTitle className="font-bold text-gray-900">
          Subscriptions Overview
        </CardTitle>
        <button className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors">
          View All
          <ChevronDown className="w-3 h-3 ml-1" />
        </button>
      </CardHeader>
      
      <CardContent className="px-4 md:px-6">
        {/* Stats Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <div className="text-2xl font-bold text-gray-900">1,117</div>
            <div className="text-sm text-gray-500">Total Subscriptions</div>
          </div>
          
          <div className="text-center sm:text-left">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <div className="text-2xl font-bold text-gray-900">742</div>
            </div>
            <div className="text-sm text-gray-500">Basic Subscriptions</div>
          </div>
          
          <div className="text-center sm:text-left">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <div className="text-2xl font-bold text-gray-900">259</div>
            </div>
            <div className="text-sm text-gray-500">Pro Subscriptions</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-xs font-semibold text-gray-600">Basic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <span className="text-xs font-semibold text-gray-600">Pro</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 md:h-70">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3"
                stroke="#d0d3d6"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12, fill: '#64748b' }}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <ChartTooltip 
                cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} 
                content={<ChartTooltipContent />} 
              />
              <Line
                dataKey="basic"
                type="monotone"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Line
                dataKey="pro"
                type="monotone"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsOverview;