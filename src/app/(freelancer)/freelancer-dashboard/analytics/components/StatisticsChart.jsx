"use client";
import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";


// Chart Tab component with period selection
const ChartTab = ({ selectedPeriod, onPeriodChange }) => {
  const periods = ["Monthly", "Quarterly", "Annually"];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${selectedPeriod === period
              ? "bg-white text-blue-900 shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
        >
          {period}
        </button>
      ))}
    </div>
  );
};

// Chart header component
const ChartHeader = ({ title, subtitle, selectedPeriod, onPeriodChange }) => {
  return (
    <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between">
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
          {subtitle}
        </p>
      </div>
      <div className="flex items-start w-full gap-3 sm:justify-end">
        <ChartTab
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
        />
      </div>
    </div>
  );
};

// Chart data
const chartData = [
  { month: "Jan", Sales: 180, Revenue: 40 },
  { month: "Feb", Sales: 190, Revenue: 30 },
  { month: "Mar", Sales: 170, Revenue: 50 },
  { month: "Apr", Sales: 160, Revenue: 40 },
  { month: "May", Sales: 175, Revenue: 55 },
  { month: "Jun", Sales: 165, Revenue: 40 },
  { month: "Jul", Sales: 170, Revenue: 70 },
  { month: "Aug", Sales: 205, Revenue: 100 },
  { month: "Sep", Sales: 230, Revenue: 110 },
  { month: "Oct", Sales: 210, Revenue: 120 },
  { month: "Nov", Sales: 240, Revenue: 150 },
  { month: "Dec", Sales: 235, Revenue: 140 }
];

const chartConfig = {
  Sales: {
    label: "Sales",
    color: "#3b82f6",
  },
  Revenue: {
    label: "Revenue",
    color: "#10b981",
  },
};

// Main StatisticsChart component
export default function StatisticsChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Calculate trend for footer
  const totalCurrent = chartData.slice(-3).reduce((sum, item) => sum + item.Sales + item.Revenue, 0);
  const totalPrevious = chartData.slice(-6, -3).reduce((sum, item) => sum + item.Sales + item.Revenue, 0);
  const trendPercentage = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4">
      <ChartHeader
        title="Statistics"
        subtitle="Target you've set for each month"
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px] xl:min-w-full">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{
                top: 5,
                right: 15,
                left: 5,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig.Sales.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig.Sales.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig.Revenue.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig.Revenue.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
                className="dark:stroke-gray-700"
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: '#6B7280',
                  fontFamily: 'ui-sans-serif, system-ui'
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: '#6B7280',
                  fontFamily: 'ui-sans-serif, system-ui'
                }}
              />


              <Area
                dataKey="Revenue"
                type="monotone"
                fill="url(#fillRevenue)"
                fillOpacity={0.4}
                stroke={chartConfig.Revenue.color}
                strokeWidth={2}
                stackId="a"
              />

              <Area
                dataKey="Sales"
                type="monotone"
                fill="url(#fillSales)"
                fillOpacity={0.4}
                stroke={chartConfig.Sales.color}
                strokeWidth={2}
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex w-full items-start gap-2 text-sm mt-3">
        <div className="grid gap-2">
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by {Math.abs(trendPercentage)}% this quarter{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-gray-500 flex items-center gap-2 leading-none text-xs">
            {selectedPeriod} statistics overview
          </div>
        </div>
      </div>
    </div>
  );
}