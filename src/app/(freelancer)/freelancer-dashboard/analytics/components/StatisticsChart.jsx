"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { freelancerDashboardService } from '@/services/freelancerDashboardService';


// Chart Tab component with period selection
const ChartTab = ({ selectedPeriod, onPeriodChange }) => {
  const periods = ["Monthly", "Yearly"];

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
  job: {
    label: "Applied Jobs",
    color: "#3b82f6",
  },
  complete: {
    label: "Completed Jobs",
    color: "#10b981",
  },
};

// Main StatisticsChart component
export default function StatisticsChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("Monthly");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState(0);
  const [assignedJobs, setAssignedJobs] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await freelancerDashboardService.getFreelancerDashboard();
        
        // Transform the API response format
        const monthlyData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        if (data?.data) {
          // New format: data with month-based structure (1-12)
          const sortedMonthKeys = Object.keys(data.data).sort((a, b) => parseInt(a) - parseInt(b));
          
          sortedMonthKeys.forEach((monthKey) => {
            const monthData = data.data[monthKey];
            const monthIndex = parseInt(monthKey) - 1; // Convert 1-12 to 0-11 for array index
            monthlyData.push({
              month: monthNames[monthIndex],
              job: monthData.job || 0,
              complete: monthData.complete || 0
            });
          });
        } else if (data?.MoAssignJobCount !== undefined || data?.MocomJobCount !== undefined) {
          // Old format: Monthly data with Mo* fields
          const currentMonth = new Date().getMonth(); // 0-11
          
          monthNames.forEach((month, index) => {
            if (index === currentMonth) {
              // Current month gets the actual data
              monthlyData.push({
                month: month,
                job: data.MoAssignJobCount || 0,
                complete: data.MocomJobCount || 0
              });
            } else {
              // Other months get zero
              monthlyData.push({
                month: month,
                job: 0,
                complete: 0
              });
            }
          });
        } else {
          // Fallback: Use total counts distributed across months
          const totalJobs = data?.AssignJobCount || 0;
          const totalCompleted = data?.comJobCount || 0;
          const currentMonth = new Date().getMonth();
          
          monthNames.forEach((month, index) => {
            if (index === currentMonth) {
              monthlyData.push({
                month: month,
                job: totalJobs,
                complete: totalCompleted
              });
            } else {
              monthlyData.push({
                month: month,
                job: 0,
                complete: 0
              });
            }
          });
        }
        
        setChartData(monthlyData);
        
        // Calculate totals for current period
        const totalJobs = monthlyData.reduce((sum, item) => sum + item.job, 0);
        const totalCompleted = monthlyData.reduce((sum, item) => sum + item.complete, 0);
        setAppliedJobs(totalJobs);
        setAssignedJobs(totalCompleted);
        
      } catch (error) {
        console.error('Error fetching freelancer dashboard data:', error);
        // Fallback to sample data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const fallbackData = monthNames.map(month => ({
          month: month,
          job: 0,
          complete: 0
        }));
        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to get data based on selected period
  const getDataForPeriod = (period) => {
    if (period === "Monthly") {
      // Show all months
      return chartData;
    } else if (period === "Yearly") {
      // Show yearly data using the same chartData (which already contains all 12 months)
      return chartData;
    }
    return chartData;
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Get current period data
  const currentData = getDataForPeriod(selectedPeriod);
  
  // Calculate trend for footer
  const totalCurrent = currentData.reduce((sum, item) => sum + item.job + item.complete, 0);
  const totalPrevious = selectedPeriod === "Monthly" ? 
    chartData.slice(-6, -3).reduce((sum, item) => sum + item.job + item.complete, 0) : 0;
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
        subtitle="Jobs and completed jobs overview"
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
                <linearGradient id="fillJob" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig?.job?.color || "#3b82f6"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig?.job?.color || "#3b82f6"}
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillComplete" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig?.complete?.color || "#10b981"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig?.complete?.color || "#10b981"}
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
                dataKey={selectedPeriod === "Yearly" ? "month" : "Date"}
                axisLine={false}
                tickLine={false}
                hide={selectedPeriod !== "Yearly"}
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
                dataKey="job"
                type="monotone"
                fill="url(#fillJob)"
                fillOpacity={0.4}
                stroke={chartConfig?.job?.color || "#3b82f6"}
                strokeWidth={2}
              />

              <Area
                dataKey="complete"
                type="monotone"
                fill="url(#fillComplete)"
                fillOpacity={0.4}
                stroke={chartConfig?.complete?.color || "#10b981"}
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
            <span className="text-muted-foreground">Jobs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span className="text-muted-foreground">Completed Jobs</span>
          </div>
        </div>
      </div>
    </div>
  );
}