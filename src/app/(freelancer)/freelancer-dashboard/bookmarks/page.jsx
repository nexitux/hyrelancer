"use client";
// components/Bookmarks.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Projects from './components/Projects';
import Jobs from './components/Jobs';
// import Employers from './components/Employers';

const Bookmarks = () => {
    const [activeTab, setActiveTab] = useState('Projects');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Sample data
    const projectsData = [
        {
            id: 1,
            title: "Figma mockup needed for a new website for Electrical contractor business website",
            postedDate: "2 days ago",
            location: "Las Vegas, USA",
            budget: "2.8K spent",
            rating: 4,
            description: "I am looking for a talented UX/UI Designer to create screens for my basic product idea. The project involves designing a web application with modern UI components and responsive layouts.",
            tags: ["Graphic Design", "Website Design", "Figma"],
            proposals: 50,
            price: 170
        },
        {
            id: 2,
            title: "I need you to design a email confirming for a ticket buying in a beautiful modern way for mobile",
            postedDate: "2 days ago",
            location: "Las Vegas, USA",
            budget: "2.8K spent",
            rating: 5,
            description: "I am looking for a talented UX/UI Designer to create screens for my basic product idea. The project involves designing a web application with email templates and mobile-first approach.",
            tags: ["Graphic Design", "Website Design", "Figma"],
            proposals: 50,
            price: 170
        },
        {
            id: 3,
            title: "Website Design (Web & Responsive) for an Online Tutoring Website",
            postedDate: "3 days ago",
            location: "Las Vegas, USA",
            budget: "2.8K spent",
            rating: 4,
            description: "Looking for an experienced web designer to create a comprehensive tutoring platform with user dashboard, booking system, and payment integration.",
            tags: ["Website Design", "UX/UI", "Responsive Design"],
            proposals: 35,
            price: 250
        },
        {
            id: 4,
            title: "UX/UI Designer | Brander to Redesign the First Screen of the Main Page",
            postedDate: "3 days ago",
            location: "Las Vegas, USA",
            budget: "2.8K spent",
            rating: 5,
            description: "Need a creative designer to redesign our landing page with focus on conversion optimization and modern design trends.",
            tags: ["UX/UI", "Branding", "Landing Page"],
            proposals: 42,
            price: 180
        },
        {
            id: 5,
            title: "Mobile App Development for iOS and Android",
            postedDate: "4 days ago",
            location: "California, USA",
            budget: "5.2K spent",
            rating: 5,
            description: "Looking for experienced mobile developers to build a cross-platform application with React Native framework.",
            tags: ["Mobile Development", "React Native", "iOS", "Android"],
            proposals: 28,
            price: 320
        },
        {
            id: 6,
            title: "E-commerce Platform Development with Payment Integration",
            postedDate: "5 days ago",
            location: "New York, USA",
            budget: "8.5K spent",
            rating: 4,
            description: "Need full-stack developers to build a complete e-commerce solution with modern payment gateways and inventory management.",
            tags: ["E-commerce", "Full Stack", "Payment Gateway"],
            proposals: 65,
            price: 450
        },
        {
            id: 7,
            title: "Logo Design and Brand Identity Package",
            postedDate: "1 week ago",
            location: "Texas, USA",
            budget: "1.5K spent",
            rating: 5,
            description: "Creative designer needed for complete brand identity including logo, business cards, letterhead, and brand guidelines.",
            tags: ["Logo Design", "Branding", "Identity"],
            proposals: 45,
            price: 200
        }
    ];

    const jobsData = [
        {
            id: 1,
            company: { name: "Rockstar Games New York", color: "#22c55e" },
            title: "Full Stack Developer",
            location: "Las Vegas, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "Brand"],
            salary: "$100 - $120",
            period: "hour"
        },
        {
            id: 2,
            company: { name: "GlobalTech Partners", color: "#3b82f6" },
            title: "Senior DevOps Engineer",
            location: "California, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "Brand"],
            salary: "$60-$80",
            period: "day"
        },
        {
            id: 3,
            company: { name: "PrimeEdge Solutions", color: "#ef4444" },
            title: "Senior UI/UX Designer",
            location: "California, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "UI/UX"],
            salary: "$850 - $900",
            period: "month"
        },
        {
            id: 4,
            company: { name: "Stellar Enterprises", color: "#8b5cf6" },
            title: "Social Media Marketing",
            location: "New York, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "UX/UI"],
            salary: "$10 - $15",
            period: "hour"
        },
        {
            id: 5,
            company: { name: "Rockstar Games New York", color: "#06b6d4" },
            title: "Mobile App Developer",
            location: "Las Vegas, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "UI/UX"],
            salary: "$450 - $550",
            period: "month"
        },
        {
            id: 6,
            company: { name: "PrimeEdge Solutions", color: "#10b981" },
            title: "Digital Marketing",
            location: "California, USA",
            postedDate: "2 days ago",
            tags: ["Parttime", "UX/UI"],
            salary: "$10 - $15",
            period: "hour"
        },
        {
            id: 7,
            company: { name: "TechFlow Industries", color: "#f59e0b" },
            title: "Frontend Developer",
            location: "Florida, USA",
            postedDate: "3 days ago",
            tags: ["Fulltime", "React"],
            salary: "$4000 - $5000",
            period: "month"
        },
        {
            id: 8,
            company: { name: "DataMind Corp", color: "#14b8a6" },
            title: "Data Scientist",
            location: "Washington, USA",
            postedDate: "4 days ago",
            tags: ["Fulltime", "Python"],
            salary: "$80 - $100",
            period: "hour"
        }
    ];

    // const employersData = [
    //     {
    //         id: 1,
    //         name: "Bright Future",
    //         location: "Las Vegas, USA",
    //         rating: 4,
    //         color: "#3b82f6"
    //     },
    //     {
    //         id: 2,
    //         name: "Innovations",
    //         location: "New York, USA",
    //         rating: 5,
    //         color: "#f59e0b"
    //     },
    //     {
    //         id: 3,
    //         name: "CoreTech",
    //         location: "Texas, USA",
    //         rating: 5,
    //         color: "#22c55e"
    //     },
    //     {
    //         id: 4,
    //         name: "GlobalTech Partners",
    //         location: "California, USA",
    //         rating: 5,
    //         color: "#3b82f6"
    //     },
    //     {
    //         id: 5,
    //         name: "PrimeEdge Solutions",
    //         location: "Nevada, USA",
    //         rating: 5,
    //         color: "#8b5cf6"
    //     },
    //     {
    //         id: 6,
    //         name: "Stellar Enterprises",
    //         location: "Georgia, USA",
    //         rating: 4,
    //         color: "#ef4444"
    //     },
    //     {
    //         id: 7,
    //         name: "EliteTech Solutions",
    //         location: "Idaho, USA",
    //         rating: 4,
    //         color: "#f59e0b"
    //     },
    //     {
    //         id: 8,
    //         name: "Apex Innovations",
    //         location: "New Mexico, USA",
    //         rating: 5,
    //         color: "#22c55e"
    //     },
    //     {
    //         id: 9,
    //         name: "Infinity Solutions",
    //         location: "Colorado, USA",
    //         rating: 4,
    //         color: "#6366f1"
    //     }
    // ];

    const getCurrentData = () => {
        let data;
        switch (activeTab) {
            case 'Projects':
                data = projectsData;
                break;
            case 'Jobs':
                data = jobsData;
                break;
            // case 'Employers':
            //     data = employersData;
            //     break;
            default:
                data = [];
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    };

    const getTotalPages = () => {
        let totalItems;
        switch (activeTab) {
            case 'Projects':
                totalItems = projectsData.length;
                break;
            case 'Jobs':
                totalItems = jobsData.length;
                break;
            // case 'Employers':
            //     totalItems = employersData.length;
            //     break;
            default:
                totalItems = 0;
        }
        return Math.ceil(totalItems / itemsPerPage);
    };

    const renderTabContent = () => {
        const currentData = getCurrentData();

        switch (activeTab) {
            case 'Projects':
                return <Projects projects={currentData} />;
            case 'Jobs':
                return <Jobs jobs={currentData} />;
            // case 'Employers':
            //     return <Employers employers={currentData} />;
            default:
                return null;
        }
    };

    const Pagination = () => {
        const totalPages = getTotalPages();

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center space-x-2">
                <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                        <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNumber
                                    ? 'text-white bg-blue-600 border border-blue-600'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header outside the card */}
            <div className="max-w-[1600px] mx-auto px-4 pt-8 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 pb-8">
                {/* Main Card Container */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex px-6">
                            {['Projects', 'Jobs'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {renderTabContent()}
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <Pagination />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bookmarks;