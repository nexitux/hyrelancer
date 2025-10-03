"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { adminDashboardApi } from "@/config/adminApi";

const StatsCards = dynamic(() => import("./components/StatsCard"), { ssr: false });
const RecentJobs = dynamic(() => import("./components/RecentJobs"), { ssr: false });
const RecentRecruiters = dynamic(() => import("./components/RecentRecruiters"), { ssr: false });
const SubscriptionsOverview = dynamic(() => import("./components/SubscriptionsOverview"), { ssr: false });
const CandidatesChart = dynamic(() => import("./components/CandidatesChart"), { ssr: false });
const Acquisitions = dynamic(() => import("./components/Acquisitions"), { ssr: false });
const RegistersByCountry = dynamic(() => import("./components/RegistersByCountry"), { ssr: false });
const TopCompanies = dynamic(() => import("./components/TopCompanies"), { ssr: false });
const RecentEmployers = dynamic(() => import("./components/RecentEmployers"), { ssr: false });

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await adminDashboardApi.getDashboardData();
                setDashboardData(data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-gray-600 mb-4">Error loading dashboard data</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto grid gap-6">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Left Column - Subscriptions Overview */}
                    <div className="xl:col-span-2">
                        <div className="mb-8">
                            <StatsCards dashboardData={dashboardData} />
                        </div>
                        <div>
                            <SubscriptionsOverview dashboardData={dashboardData} />
                        </div>
                    </div>

                    {/* Right Section (Recent Jobs + Candidates + Recruiters) */}
                    <div className="xl:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top row */}
                            <RecentJobs dashboardData={dashboardData} />
                            <CandidatesChart dashboardData={dashboardData} />

                            {/* Bottom row spanning both columns */}
                            <div className="md:col-span-2">
                                <RecentRecruiters dashboardData={dashboardData} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4">
                        <RegistersByCountry />
                    </div>
                    <div className="lg:col-span-5">
                        <TopCompanies />
                    </div>
                    <div className="lg:col-span-3">
                        <Acquisitions />
                    </div>
                </div> */}
                <div className="">
                    <RecentEmployers dashboardData={dashboardData} />
                </div>
            </div>
        </div>
    );
}
