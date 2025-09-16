"use client";
import React, { useState } from 'react';
import { Search, ChevronDown, MapPin, Calendar, Trash2, DollarSign } from 'lucide-react';
import Jobs from "../../bookmarks/components/Jobs"

const UXUIDesignAlerts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Default');

    // Sample job data matching your design
    const jobsData = [
        {
            id: 1,
            company: { 
                name: "Rockstar Games New York", 
                color: "#22c55e" 
            },
            title: "Full Stack Developer",
            location: "Las Vegas, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "Brand"],
            salary: "$100 - $120",
            period: "hour"
        },
        {
            id: 2,
            company: { 
                name: "GlobalTech Partners", 
                color: "#3b82f6" 
            },
            title: "Senior DevOps Engineer",
            location: "California, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "Brand"],
            salary: "$60-$80",
            period: "day"
        },
        {
            id: 3,
            company: { 
                name: "PrimeEdge Solutions", 
                color: "#ef4444" 
            },
            title: "Senior UI/UX Designer",
            location: "California, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "UI/UX"],
            salary: "$850 - $900",
            period: "month"
        },
        {
            id: 4,
            company: { 
                name: "Stellar Enterprises", 
                color: "#8b5cf6" 
            },
            title: "Social Media Marketing",
            location: "New York, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "UX/UI"],
            salary: "$10 - $15",
            period: "hour"
        },
        {
            id: 5,
            company: { 
                name: "Rockstar Games New York", 
                color: "#06b6d4" 
            },
            title: "Mobile App Developer",
            location: "Las Vegas, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "UI/UX"],
            salary: "$450 - $550",
            period: "month"
        },
        {
            id: 6,
            company: { 
                name: "PrimeEdge Solutions", 
                color: "#10b981" 
            },
            title: "Digital Marketing",
            location: "California, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "UX/UI"],
            salary: "$10 - $15",
            period: "hour"
        }
    ];

    const filteredJobs = jobsData.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
                <div className="max-w-7xl mx-auto px-6 pt-8">
                    <h1 className="text-3xl font-bold text-gray-900">UX/UI Design Alerts</h1>
                </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search and Sort Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by keyword"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option>Sort By (Default)</option>
                                    <option>Company A-Z</option>
                                    <option>Company Z-A</option>
                                    <option>Salary High to Low</option>
                                    <option>Salary Low to High</option>
                                    <option>Most Recent</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jobs Grid */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                        <Jobs jobs={filteredJobs} />
                        
                        {/* Empty State */}
                        {filteredJobs.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-500 text-lg">No jobs found</div>
                                <div className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Info */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    Showing {filteredJobs.length} job alerts
                </div>
            </div>
        </div>
    );
};

export default UXUIDesignAlerts;