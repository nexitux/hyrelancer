import { Users, UserCheck, MapPin, UserPlus, Bell, FileText } from 'lucide-react';

const StatsCards = () => {
    const stats = [
        {
            icon: Users,
            value: "256",
            label: "TOTAL EMPLOYERS",
            change: "-1.05%",
            isPositive: false,
            bgColor: "bg-purple-500",
            iconBg: "bg-purple-100"
        },
        {
            icon: UserCheck,
            value: "4,026",
            label: "TOTAL CANDIDATES",
            change: "+0.40%",
            isPositive: true,
            bgColor: "bg-blue-500",
            iconBg: "bg-blue-100"
        },
        {
            icon: MapPin,
            value: "48",
            label: "TOTAL LOCATIONS",
            change: "+0.82%",
            isPositive: true,
            bgColor: "bg-orange-500",
            iconBg: "bg-orange-100"
        },
        {
            icon: UserPlus,
            value: "1,116",
            label: "TOTAL RECRUITERS",
            change: "+0.21%",
            isPositive: true,
            bgColor: "bg-green-500",
            iconBg: "bg-green-100"
        },
        {
            icon: Bell,
            value: "1,468",
            label: "TOTAL SUBSCRIPTIONS",
            change: "-0.153",
            isPositive: false,
            bgColor: "bg-pink-500",
            iconBg: "bg-pink-100"
        },
        {
            icon: FileText,
            value: "34%",
            label: "RESUME UPLOAD RATIO",
            change: "+0.165%",
            isPositive: true,
            bgColor: "bg-cyan-500",
            iconBg: "bg-cyan-100"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center"
                >
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
            ))}
        </div>
    );
};

export default StatsCards;