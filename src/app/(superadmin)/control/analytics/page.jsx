"use client";
import dynamic from "next/dynamic";

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
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto grid gap-6">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Left Column - Subscriptions Overview */}
                    <div className="xl:col-span-2">
                        <div className="mb-8">
                            <StatsCards />
                        </div>
                        <div>
                            <SubscriptionsOverview />
                        </div>
                    </div>

                    {/* Right Section (Recent Jobs + Candidates + Recruiters) */}
                    <div className="xl:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top row */}
                            <RecentJobs />
                            <CandidatesChart />

                            {/* Bottom row spanning both columns */}
                            <div className="md:col-span-2">
                                <RecentRecruiters />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4">
                        <RegistersByCountry />
                    </div>
                    <div className="lg:col-span-5">
                        <TopCompanies />
                    </div>
                    <div className="lg:col-span-3">
                        <Acquisitions />
                    </div>
                </div>
                <div className="">
                    <RecentEmployers />
                </div>
            </div>
        </div>
    );
}
