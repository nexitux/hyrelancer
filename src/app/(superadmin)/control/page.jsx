"use client";
import dynamic from "next/dynamic";

// Dynamically import the Analytics page, completely client-side
const Analytics = dynamic(() => import("./analytics/page"), { ssr: false });

export default function DashboardHome() {
  return <Analytics />;
}