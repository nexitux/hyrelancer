"use client";
import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Users, Package, DollarSign, TrendingUp, CheckCircle, Clock, PlayCircle, Send } from "lucide-react";
import { freelancerDashboardService } from '@/services/freelancerDashboardService';

// Trend indicator component
const TrendIndicator = ({ type, value }) => {
  const isPositive = type === 'success';
  const ArrowIcon = isPositive ? ArrowUp : ArrowDown;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
      isPositive 
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' 
        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
    }`}>
      <ArrowIcon className="w-3 h-3" />
      {value}
    </div>
  );
};

// Individual metric card component
const MetricCard = ({ 
  icon: Icon, 
  title, 
  value, 
  changeType, 
  changeValue, 
  gradient 
}) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      {/* Gradient background accent */}
      <div className={`absolute inset-0 opacity-[0.03] ${gradient}`}></div>
      
      <div className="relative p-4">
        {/* Main content layout */}
        <div className="flex items-center justify-between">
          {/* Left side content */}
          <div className="flex flex-col space-y-3">
            {/* Trend indicator at top */}
            <TrendIndicator type={changeType} value={changeValue} />
            
            {/* Title */}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wide uppercase">
              {title}
            </p>
            
            {/* Value */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {value}
            </h3>
          </div>
          
          {/* Right side icon */}
          <div className={`p-3 rounded-xl ${gradient} bg-opacity-10 flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Subtle bottom accent line */}
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${gradient} opacity-60`}></div>
      </div>
    </div>
  );
};

// Main component
export default function EcommerceMetrics() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await freelancerDashboardService.getFreelancerDashboard();
        const transformedData = freelancerDashboardService.transformFreelancerDashboardData(data);
        setDashboardData(transformedData);
      } catch (error) {
        console.error('Error fetching freelancer dashboard data:', error);
        // Fallback to sample data
        setDashboardData({
          stats: {
            sentProposals: 0,
            assignedJobs: 2,
            completedJobs: 1,
            startedJobs: 0,
            pendingJobs: 0,
          },
          monthlyStats: {
            sentProposals: 0,
            assignedJobs: 2,
            completedJobs: 1,
            startedJobs: 0,
            pendingJobs: 0,
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const metricsData = [
    {
      icon: Send,
      title: "Applied Jobs",
      value: dashboardData?.stats?.sentProposals?.toString() || "0",
      changeType: "success",
      changeValue: `${dashboardData?.monthlyStats?.sentProposals || 0} this month`,
      gradient: "bg-gradient-to-br from-blue-100 to-blue-300"
    },
    {
      icon: Package,
      title: "Assigned Jobs", 
      value: dashboardData?.stats?.assignedJobs?.toString() || "0",
      changeType: "success",
      changeValue: `${dashboardData?.monthlyStats?.assignedJobs || 0} this month`,
      gradient: "bg-gradient-to-br from-purple-100 to-purple-300"
    },
    {
      icon: CheckCircle,
      title: "Completed Jobs",
      value: dashboardData?.stats?.completedJobs?.toString() || "0",
      changeType: "success", 
      changeValue: `${dashboardData?.monthlyStats?.completedJobs || 0} this month`,
      gradient: "bg-gradient-to-br from-emerald-100 to-green-300"
    },
    {
      icon: Clock,
      title: "Pending Jobs",
      value: dashboardData?.stats?.pendingJobs?.toString() || "0",
      changeType: "error",
      changeValue: `${dashboardData?.monthlyStats?.pendingJobs || 0} this month`,
      gradient: "bg-gradient-to-br from-amber-100 to-yellow-200"
    }
  ];

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800/50">
                <div className="relative p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-3">
                      <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                      <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                    </div>
                    <div className="animate-pulse bg-gray-200 h-12 w-12 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1600px] mx-auto">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metricsData.map((metric, index) => (
            <MetricCard
              key={index}
              icon={metric.icon}
              title={metric.title}
              value={metric.value}
              changeType={metric.changeType}
              changeValue={metric.changeValue}
              gradient={metric.gradient}
            />
          ))}
        </div>
      </div>
    </div>
  );
}