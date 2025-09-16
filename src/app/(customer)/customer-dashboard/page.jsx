"use client";
import dynamic from "next/dynamic";

// Dynamically import the Analytics page, completely client-side
const Analytics = dynamic(() => import("../customer-dashboard/Analytics/page"), { ssr: false });

export default function DashboardHome() {
  return <Analytics />;
}
