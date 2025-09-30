"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { freelancerDashboardService } from '@/services/freelancerDashboardService';


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

const chartConfig = {
  AppliedJobs: {
    label: "Applied Jobs",
    color: "#3b82f6",
  },
  AssignedJobs: {
    label: "Assigned Jobs",
    color: "#10b981",
  },
};

// Main StatisticsChart component
export default function StatisticsChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await freelancerDashboardService.getFreelancerDashboard();
        const transformedData = freelancerDashboardService.transformFreelancerDashboardData(data);
        
        // Create chart data with monthly job statistics
        const monthlyData = [
          { month: "Jan", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Feb", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Mar", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Apr", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "May", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Jun", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Jul", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Aug", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Sep", AppliedJobs: transformedData?.monthlyStats?.sentProposals || 0, AssignedJobs: transformedData?.monthlyStats?.assignedJobs || 0 },
          { month: "Oct", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Nov", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Dec", AppliedJobs: 0, AssignedJobs: 0 }
        ];
        
        setChartData(monthlyData);
      } catch (error) {
        console.error('Error fetching freelancer dashboard data:', error);
        // Fallback to sample data
        setChartData([
          { month: "Jan", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Feb", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Mar", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Apr", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "May", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Jun", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Jul", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Aug", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Sep", AppliedJobs: 0, AssignedJobs: 2 },
          { month: "Oct", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Nov", AppliedJobs: 0, AssignedJobs: 0 },
          { month: "Dec", AppliedJobs: 0, AssignedJobs: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to get data based on selected period
  const getDataForPeriod = (period) => {
    if (period === "Monthly") {
      return chartData;
    } else if (period === "Quarterly") {
      // Group monthly data into quarters
      const quarterlyData = [];
      const quarterNames = [
        "Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"
      ];
      
      for (let i = 0; i < chartData.length; i += 3) {
        const quarter = chartData.slice(i, i + 3);
        const quarterName = quarterNames[Math.floor(i / 3)];
        const appliedJobs = quarter.reduce((sum, item) => sum + item.AppliedJobs, 0);
        const assignedJobs = quarter.reduce((sum, item) => sum + item.AssignedJobs, 0);
        quarterlyData.push({
          month: quarterName,
          AppliedJobs: appliedJobs,
          AssignedJobs: assignedJobs
        });
      }
      return quarterlyData;
    } else if (period === "Annually") {
      // Sum all data for the year
      const appliedJobs = chartData.reduce((sum, item) => sum + item.AppliedJobs, 0);
      const assignedJobs = chartData.reduce((sum, item) => sum + item.AssignedJobs, 0);
      return [
        {
          month: "2025",
          AppliedJobs: appliedJobs,
          AssignedJobs: assignedJobs
        }
      ];
    }
    return chartData;
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Get current period data
  const currentData = getDataForPeriod(selectedPeriod);
  
  // Calculate trend for footer
  const totalCurrent = currentData.reduce((sum, item) => sum + item.AppliedJobs + item.AssignedJobs, 0);
  const totalPrevious = selectedPeriod === "Monthly" ? 
    chartData.slice(-6, -3).reduce((sum, item) => sum + item.AppliedJobs + item.AssignedJobs, 0) : 0;
  const trendPercentage = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-[300px] bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4">
      <ChartHeader
        title="Job Statistics"
        subtitle="Applied and assigned jobs overview"
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px] xl:min-w-full">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={currentData}
              margin={{
                top: 5,
                right: 15,
                left: 5,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="fillAppliedJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig.AppliedJobs.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig.AppliedJobs.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillAssignedJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig.AssignedJobs.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig.AssignedJobs.color}
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
                dataKey="AppliedJobs"
                type="monotone"
                fill="url(#fillAppliedJobs)"
                fillOpacity={0.4}
                stroke={chartConfig.AppliedJobs.color}
                strokeWidth={2}
              />

              <Area
                dataKey="AssignedJobs"
                type="monotone"
                fill="url(#fillAssignedJobs)"
                fillOpacity={0.4}
                stroke={chartConfig.AssignedJobs.color}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex w-full items-start justify-between gap-2 text-sm mt-3">
        <div className="grid gap-2">
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by {Math.abs(trendPercentage)}% this quarter{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-gray-500 flex items-center gap-2 leading-none text-xs">
            {selectedPeriod.toLowerCase()} statistics overview
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground">Applied Jobs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-muted-foreground">Assigned Jobs</span>
          </div>
        </div>
      </div>
    </div>
  );
}