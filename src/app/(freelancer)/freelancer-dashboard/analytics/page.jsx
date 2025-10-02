"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamic imports (client-only)
const EcommerceMetrics = dynamic(() => import("./components/EcommerceMetrics"), { ssr: false });
const MonthlyTarget = dynamic(() => import("./components/MonthlyTarget"), { ssr: false });
const StatisticsChart = dynamic(() => import("./components/StatisticsChart"), { ssr: false });
const DemographicCard = dynamic(() => import("./components/DemographicCard"), { ssr: false });
const RecentOrders = dynamic(() => import("./components/RecentOrders"), { ssr: false });
const AchievementsRoadmap = dynamic(() => import("./components/NotificationPanel"), { ssr: false });
const Badges = dynamic(() => import("./components/Badges"), { ssr: false });

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 pt-6 px-2">
          Dashboard
        </h1>

        {/* First Row - Two Columns on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ecommerce Metrics and Statistics Chart */}
          <div className="lg:col-span-2 space-y-6">
            <EcommerceMetrics />
            <StatisticsChart />
          </div>

          {/* Right Column - Notification Panel */}
          <div className="lg:col-span-1">
            <AchievementsRoadmap />
          </div>
        </div>

        {/* Second Row - Three Columns (Demographic Card, Monthly Target, and Badges) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DemographicCard />
          <MonthlyTarget />
          <Badges />
        </div>

        {/* Fourth Row - Recent Orders (Full Width) */}
        <div className="w-full">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
