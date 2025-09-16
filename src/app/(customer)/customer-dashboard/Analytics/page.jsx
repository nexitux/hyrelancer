// pages/dashboard/page.jsx (or app/dashboard/page.jsx for App Router)
"use client";
import React from "react";
import dynamic from "next/dynamic";

const StatsCards = dynamic(() => import("./components/StatsCards"), { ssr: false });
const BarChart = dynamic(() => import("./components/BarChart"), { ssr: false });
const PieChart = dynamic(() => import("./components/PieChart"), { ssr: false });
const WorldMap = dynamic(() => import("./components/WorldMap"), { ssr: false });
const Notifications = dynamic(() => import("./components/Notifications"), { ssr: false });
const RecentApplications = dynamic(() => import("./components/RecentApplications"), { ssr: false });
const ActiveJobs = dynamic(() => import("./components/ActiveJobs"), { ssr: false });

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[]1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats Cards Row */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Posting Performance (spans 2 columns) */}
          <div className="lg:col-span-2">
            <BarChart />
          </div>

          {/* Right Column - Budget Usage */}
          <div>
            <Notifications />
          </div>
        </div>

        {/* Second Row Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Job Funnel */}
          <div>
            <PieChart />
            {/* <JobFunnel /> */}
          </div>

          {/* Middle Column - Application Locations */}
          <div>
            <WorldMap />
          </div>

          {/* Right Column - Notifications and Active Jobs */}
          <div className="space-y-6">
       
            <ActiveJobs />
          </div>
        </div>

        {/* Bottom Row - Recent Applications (full width) */}
        <div className="mt-6">
          <RecentApplications />
        </div>
      </div>
    </div>
  );
}