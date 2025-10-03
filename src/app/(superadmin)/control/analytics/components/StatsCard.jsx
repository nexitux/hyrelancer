import { Users, UserCheck, Briefcase, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const StatsCards = ({ dashboardData }) => {
    // Calculate completion percentage
    const completionPercentage = dashboardData?.tJobCount > 0 
        ? Math.round((dashboardData.tComJobCount / dashboardData.tJobCount) * 100)
        : 0;

    const stats = [
        {
            icon: Users,
            value: dashboardData?.FeCount?.toString() || "0",
            label: "TOTAL FREELANCERS",
            change: "+0.40%",
            isPositive: true,
            bgColor: "bg-purple-500",
            iconBg: "bg-purple-100",
            href: "/control/freelancelist"
        },
        {
            icon: UserCheck,
            value: dashboardData?.CuCount?.toString() || "0",
            label: "TOTAL CUSTOMERS",
            change: "+0.21%",
            isPositive: true,
            bgColor: "bg-blue-500",
            iconBg: "bg-blue-100",
            href: "/control/customerlist"
        },
        {
            icon: Briefcase,
            value: dashboardData?.tJobCount?.toString() || "0",
            label: "TOTAL JOBS",
            change: "+0.82%",
            isPositive: true,
            bgColor: "bg-orange-500",
            iconBg: "bg-orange-100",
            href: "/control/joblist"
        },
        {
            icon: CheckCircle,
            value: dashboardData?.tComJobCount?.toString() || "0",
            label: "COMPLETED JOBS",
            change: "+0.15%",
            isPositive: true,
            bgColor: "bg-green-500",
            iconBg: "bg-green-100",
            href: "/control/joblist?status=completed"
        },
        {
            icon: Clock,
            value: dashboardData?.tInProgressJobCount?.toString() || "0",
            label: "IN PROGRESS JOBS",
            change: "-0.05%",
            isPositive: false,
            bgColor: "bg-pink-500",
            iconBg: "bg-pink-100",
            href: "/control/joblist?status=in-progress"
        },
        {
            icon: TrendingUp,
            value: `${completionPercentage}%`,
            label: "COMPLETION RATE",
            change: "+0.165%",
            isPositive: true,
            bgColor: "bg-cyan-500",
            iconBg: "bg-cyan-100",
            href: "/control/analytics"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, index) => (
                <Link key={index} href={stat.href}>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer">
                        {/* Icon */}
                        <div
                            className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center mr-4`}
                        >
                            <stat.icon
                                className={`w-5 h-5 ${stat.bgColor.replace("bg-", "text-")}`}
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-xl font-semibold text-gray-900">
                                    {stat.value}
                                </div>
                                <div
                                    className={`flex items-center text-sm font-medium ${stat.isPositive ? "text-green-500" : "text-red-500"
                                        }`}
                                >
                                    <span className="mr-1">{stat.isPositive ? "▲" : "▼"}</span>
                                    {stat.change}
                                </div>
                            </div>

                            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                {stat.label}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default StatsCards;