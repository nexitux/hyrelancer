"use client";
import React, { useState } from 'react';
import { Eye, MessageSquare, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatModal from './components/ChatModal';
import SubmitWorkModal from './components/SubmitWorkModal';
import JobModal from '../applied-jobs/components/JobModal';

const ActiveWorkDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const itemsPerPage = 10;

    const workItems = [
        {
            id: 1,
            title: "Full Stack Developer",
            company: "PrimeEdge Solutions",
            location: "Las Vegas, USA",
            type: "Job",
            pricing: "$410",
            dueDate: "Mar 29, 2024",
            status: "Doing",
            icon: "🏢"
        },
        {
            id: 2,
            title: "Social Media Marketing",
            company: "Apex Innovations",
            location: "Las Vegas, USA",
            type: "Job",
            pricing: "$266",
            dueDate: "Mar 29, 2024",
            status: "Ended",
            icon: "❄️"
        },
        {
            id: 3,
            title: "Need a UX designer to design a website on figma",
            company: "GlobalTech Partners",
            location: "Las Vegas, USA",
            type: "Project",
            pricing: "$470",
            dueDate: "Mar 29, 2024",
            status: "Approved",
            icon: "💚"
        },
        {
            id: 4,
            title: "Figma and photoshop expert needed for fulltime/part time long term contract",
            company: "Apex Innovations",
            location: "Las Vegas, USA",
            type: "Project",
            pricing: "$470",
            dueDate: "Mar 29, 2024",
            status: "Approved",
            icon: "✨"
        }
    ];

    const getStatusBadge = (status) => {
        const statusStyles = {
            Doing: "bg-blue-100 text-blue-800 border border-blue-200",
            Ended: "bg-yellow-100 text-yellow-800 border border-yellow-200",
            Approved: "bg-green-100 text-green-800 border border-green-200"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
                {status}
            </span>
        );
    };

    const totalPages = Math.ceil(workItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = workItems.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Active Work</h1>

                {/* Desktop Table */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Title</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Type</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Pricing</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Due In</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Status</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-6">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <span className="mr-2">{item.icon}</span>
                                                <span className="mr-3">{item.company}</span>
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                    </svg>
                                                    {item.location}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-900">{item.type}</td>
                                    <td className="py-4 px-6 text-gray-900 text-sm font-medium">{item.pricing}</td>
                                    <td className="py-4 px-6 text-gray-900 text-sm">{item.dueDate}</td>
                                    <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setIsJobModalOpen(true)}
                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
                                                <MessageSquare size={18} />
                                            </button>
                                            <button
                                                onClick={() => setIsWorkModalOpen(true)}
                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
                                                <FileText size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                    {currentItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h3>
                                {getStatusBadge(item.status)}
                            </div>

                            <div className="flex items-center text-gray-500 text-sm mb-3">
                                <span className="mr-2">{item.icon}</span>
                                <span className="mr-3">{item.company}</span>
                                <span className="flex items-center">
                                    📍 {item.location}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Type:</span>
                                    <span className="ml-2 text-gray-900">{item.type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Pricing:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{item.pricing}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500">Due:</span>
                                    <span className="ml-2 text-gray-900">{item.dueDate}</span>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setIsJobModalOpen(true)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                    <MessageSquare size={18} />
                                </button>
                                <button
                                    onClick={() => setIsWorkModalOpen(true)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                    <FileText size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm sm:px-6">
                    <div className="flex flex-1 justify-between items-center sm:hidden">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>

                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(endIndex, workItems.length)}</span> of{' '}
                                <span className="font-medium">{workItems.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === pageNumber
                                                ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                : 'text-gray-900'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            <JobModal
                isOpen={isJobModalOpen}
                onClose={() => setIsJobModalOpen(false)}
            />
            <ChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                companyName="PrimeEdge Solutions"
                location="Las Vegas, USA"
            />
            <SubmitWorkModal
                isOpen={isWorkModalOpen}
                onClose={() => setIsWorkModalOpen(false)} 
            />
        </div>
    );
};

export default ActiveWorkDashboard;