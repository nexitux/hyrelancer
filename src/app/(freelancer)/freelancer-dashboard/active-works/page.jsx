"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import SubmitWorkModal from './components/SubmitWorkModal';
import { freelancerJobAPI } from '@/config/api';

const ActiveWorkDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [workItems, setWorkItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const itemsPerPage = 10;

    // Fetch assigned jobs from API
    useEffect(() => {
        const fetchAssignedJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await freelancerJobAPI.getFeAssignedJobList();
                
                if (response && response.job_assigned_list) {
                    const formattedJobs = response.job_assigned_list.map(job => {
                        // Calculate salary range
                        const salaryFrom = job.cuj_salary_range_from;
                        const salaryTo = job.cuj_salary_range_to;
                        const budget = salaryFrom && salaryTo ? `₹${salaryFrom} - ₹${salaryTo}` : 
                                     salaryFrom ? `₹${salaryFrom}+` : 'Not Specified';
                        
                        return {
                            id: job.cuj_id,
                            title: job.cuj_title || job.cuj_desc || 'Untitled Job',
                            company: job.freelancer?.name || job.cuj_contact_name || 'Unknown Company',
                            location: job.cuj_location || 'Remote',
                            type: job.cuj_job_type || 'Full-Time',
                            pricing: budget,
                            dueDate: job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Not Set',
                            status: mapJobStatus(job.cuj_job_status),
                            icon: getJobIcon(job.cuj_job_type),
                            originalData: job,
                            // Additional API fields
                            budget: budget,
                            jobStatus: job.cuj_job_status,
                            created_at: job.created_at,
                            updated_at: job.updated_at,
                            description: job.cuj_desc,
                            contactName: job.cuj_contact_name,
                            contactEmail: job.cuj_contact_email,
                            contactMobile: job.cuj_contact_mobile,
                            workMode: job.cuj_work_mode,
                            languages: job.cuj_lang,
                            experience: job.cuj_u_experience
                        };
                    });
                    
                    setWorkItems(formattedJobs);
                }
            } catch (err) {
                console.error('Error fetching assigned jobs:', err);
                setError('Failed to fetch job list. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignedJobs();
    }, []);

    // Helper function to map backend status to UI status
    const mapJobStatus = (status) => {
        switch (status) {
            case 'in_progress':
            case 'doing':
            case 'started':
                return 'Doing';
            case 'completed':
            case 'finished':
            case 'approved':
                return 'Approved';
            case 'ended':
            case 'cancelled':
            case 'rejected':
                return 'Ended';
            default:
                return status || 'Doing';
        }
    };

    // Helper function to get job icon based on type
    const getJobIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'design':
            case 'ux':
            case 'ui':
                return '🎨';
            case 'development':
            case 'coding':
                return '💻';
            case 'marketing':
            case 'social media':
                return '📱';
            case 'writing':
            case 'content':
                return '📝';
            default:
                return '🏢';
        }
    };

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Assigned Jobs</h1>
                    <p className="text-gray-600">Manage your assigned freelance jobs and track progress</p>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
                        notification.type === 'success' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                        {notification.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 mr-2" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mr-2" />
                        )}
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-3 hover:text-red-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-lg text-gray-600">Loading jobs...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && workItems.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Jobs</h3>
                        <p className="text-gray-500">You don't have any assigned jobs at the moment.</p>
                    </div>
                )}

                {/* Desktop Table */}
                {!loading && !error && workItems.length > 0 && (
                <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Job Title</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Client</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Type</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Salary Range</th>
                                <th className="text-left py-4 px-6 font-medium text-gray-500 uppercase text-sm">Location</th>
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
                                            {item.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description.substring(0, 60)}...</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-gray-900">
                                            <div className="font-medium">{item.company}</div>
                                            {item.contactEmail && (
                                                <div className="text-sm text-gray-600">{item.contactEmail}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-900">{item.type}</td>
                                    <td className="py-4 px-6 text-gray-900 text-sm font-medium">{item.pricing}</td>
                                    <td className="py-4 px-6 text-gray-900 text-sm">{item.location}</td>
                                    <td className="py-4 px-6">{getStatusBadge(item.status)}</td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => {
                                                setSelectedJob(item);
                                                setIsWorkModalOpen(true);
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors cursor-pointer">
                                            Manage Job
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}

                {/* Mobile Cards */}
                {!loading && !error && workItems.length > 0 && (
                <div className="lg:hidden space-y-4">
                    {currentItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.title}</h3>
                                    {item.contactEmail && (
                                        <p className="text-sm text-gray-600 mb-2">{item.contactEmail}</p>
                                    )}
                                </div>
                                {getStatusBadge(item.status)}
                            </div>

                            {item.description && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">{item.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase">Company</span>
                                    <span className="text-gray-900 font-medium">{item.company}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase">Type</span>
                                    <span className="text-gray-900 font-medium">{item.type}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase">Salary Range</span>
                                    <span className="text-gray-900 font-medium">{item.pricing}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-500 text-xs uppercase">Location</span>
                                    <span className="text-gray-900 font-medium">{item.location}</span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => {
                                        setSelectedJob(item);
                                        setIsWorkModalOpen(true);
                                    }}
                                    className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors cursor-pointer">
                                    Manage Job
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {/* Pagination */}
                {!loading && !error && workItems.length > 0 && (
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
                )}
            </div>
            <SubmitWorkModal
                isOpen={isWorkModalOpen}
                onClose={() => {
                    setIsWorkModalOpen(false);
                    setSelectedJob(null);
                }}
                jobData={selectedJob}
                jobId={selectedJob?.id}
                onJobStatusUpdate={() => {
                    // Refresh the job list when status is updated
                    window.location.reload();
                }}
            />
        </div>
    );
};

export default ActiveWorkDashboard;