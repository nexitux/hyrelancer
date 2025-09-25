"use client";
import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, ChevronLeft, ChevronRight, Check, X, AlertCircle, Eye, Edit, CheckCircle, XCircle } from 'lucide-react';
import api from '@/config/api';
import EnhancedChatModal from './components/ChatModal';

const ActiveWorkDashboard = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
    const [selectedJobForChat, setSelectedJobForChat] = useState(null);
    const [workItems, setWorkItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const itemsPerPage = 10;

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (showConfirmModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showConfirmModal]);

    const encodeId = (id) => {
        return btoa(id.toString());
    };

    const fetchAppliedJobs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/getAppliedReJob');
            const data = response.data;
            
            // Debug: Log the receiver ID for verification
            if (data.job_Re_list && data.job_Re_list.length > 0) {
                console.log('Sample job item receiver ID (sjr_fe_u_id):', data.job_Re_list[0].sjr_fe_u_id);
            }
            
            const transformedData = data.job_Re_list.map(item => ({
                id: item.cuj_id,
                title: item.cuj_title,
                company: item.name,
                location: item.cuj_location || 'Not specified',
                type: item.cuj_job_type,
                pricing: `$${item.cuj_salary_range_from} - $${item.cuj_salary_range_to}`,
                dueDate: new Date(item.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                description: item.cuj_desc,
                experience: item.cuj_u_experience,
                workMode: item.cuj_work_mode,
                languages: item.cuj_lang,
                contactEmail: item.cuj_contact_email,
                contactMobile: item.cuj_contact_mobile,
                contactName: item.cuj_contact_name,
                isRejected: item.cuj_is_rejected === 1,
                isAssigned: item.cuj_is_assigned === 1,
                companyId: item.company_id,
                // Use the correct receiver ID from the API response
                receiverId: item.sjr_fe_u_id, // This is the freelancer user ID from the API
                icon: getJobIcon(item.cuj_title),
                status: getStatus(item),
                statusColor: getStatusColor(getStatus(item))
            }));
            
            setWorkItems(transformedData);
            setError(null);
        } catch (err) {
            setError('Failed to load jobs. Please try again.');
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    const getJobIcon = (title) => {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('developer') || titleLower.includes('programming')) return '💻';
        if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) return '🎨';
        if (titleLower.includes('marketing')) return '📈';
        if (titleLower.includes('writing') || titleLower.includes('content')) return '✍️';
        return '🏢';
    };

    const getStatus = (item) => {
        if (item.isRejected) return 'Rejected';
        if (item.isAssigned) return 'Accepted';
        return 'Pending';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleRejectJob = (jobId) => {
        const job = workItems.find(item => item.id === jobId);
        if (!job) return;

        setPendingAction({ 
            jobId, 
            action: 'reject', 
            message: 'Are you sure you want to reject this job? This action cannot be undone.' 
        });
        setShowConfirmModal(true);
    };

    const handleAcceptJob = (jobId) => {
        const job = workItems.find(item => item.id === jobId);
        if (!job) return;

        setPendingAction({ 
            jobId, 
            action: 'accept', 
            message: 'Are you sure you want to accept this job? You will be assigned to this work.' 
        });
        setShowConfirmModal(true);
    };

    const confirmAction = async () => {
        if (!pendingAction) return;

        try {
            const { jobId, action } = pendingAction;
            const encodedId = encodeId(jobId);
            
            setActionLoading(prev => ({ ...prev, [`${action}_${jobId}`]: true }));

            if (action === 'accept') {
                await api.get(`/acceptJob/${encodedId}`);
                setWorkItems(prev => prev.map(item => 
                    item.id === jobId 
                        ? { 
                            ...item, 
                            isAssigned: true,
                            isRejected: false,
                            status: 'Accepted',
                            statusColor: getStatusColor('Accepted')
                        }
                        : item
                ));
                setToastType("success");
                setToastMessage("Job accepted successfully!");
            } else {
                await api.get(`/rejectJob/${encodedId}`);
                setWorkItems(prev => prev.map(item => 
                    item.id === jobId 
                        ? { 
                            ...item, 
                            isRejected: true,
                            isAssigned: false,
                            status: 'Rejected',
                            statusColor: getStatusColor('Rejected')
                        }
                        : item
                ));
                setToastType("success");
                setToastMessage("Job rejected successfully!");
            }

            setTimeout(() => setToastMessage(""), 3000);
        } catch (err) {
            console.error(`Error ${pendingAction.action}ing job:`, err);
            setToastType("error");
            setToastMessage(`Failed to ${pendingAction.action} job. Please try again.`);
            setTimeout(() => setToastMessage(""), 5000);
        } finally {
            setActionLoading(prev => ({ ...prev, [`${pendingAction.action}_${pendingAction.jobId}`]: false }));
            setShowConfirmModal(false);
            setPendingAction(null);
        }
    };

    const cancelAction = () => {
        setShowConfirmModal(false);
        setPendingAction(null);
    };

    const handleChatClick = (job) => {
        console.log('=== CHAT CLICK DEBUG ===');
        console.log('Full job object:', job);
        console.log('Company ID:', job.companyId);
        console.log('User ID:', job.userId);
        console.log('Freelancer ID:', job.freelancerId);
        console.log('All available IDs:', {
            userId: job.userId,
            freelancerId: job.freelancerId,
            companyId: job.companyId
        });
        
        // Use the correct receiver ID from the API response
        const targetUserId = job.receiverId;
        console.log('Selected Target User ID (receiverId):', targetUserId);
        console.log('Target User ID type:', typeof targetUserId);
        console.log('Target User ID is valid:', targetUserId && targetUserId !== 'null' && targetUserId !== 'undefined');
        
        setSelectedJobForChat(job);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedJobForChat(null);
    };

    useEffect(() => {
        fetchAppliedJobs();
    }, []);

    const totalPages = Math.ceil(workItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = workItems.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">Loading jobs...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <div className="ml-3">
                            <p className="text-gray-800 font-medium">{error}</p>
                            <button 
                                onClick={fetchAppliedJobs}
                                className="mt-2 text-blue-600 hover:text-blue-800 underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Active Work</h1>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Job Title
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Salary Range
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Applied On
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading jobs...</td>
                                    </tr>
                                )}
                                {error && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-red-600">{error}</td>
                                    </tr>
                                )}
                                {!loading && !error && currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No jobs found</td>
                                    </tr>
                                )}
                                {!loading && !error && currentItems.map((item) => (
                                    <tr key={item.id} className="group hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{item.company} • {item.location}</p>
                                                    {item.workMode && (
                                                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {item.workMode}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {item.type}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.pricing}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.dueDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.statusColor}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleChatClick(item)}
                                                    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                                                    title="Chat"
                                                    aria-label="Chat"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setIsWorkModalOpen(true)}
                                                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                                                    title="View Details"
                                                    aria-label="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {!item.isRejected && !item.isAssigned && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptJob(item.id)}
                                                            disabled={actionLoading[`accept_${item.id}`]}
                                                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded border border-green-200"
                                                            title="Accept Job"
                                                            aria-label="Accept Job"
                                                        >
                                                            {actionLoading[`accept_${item.id}`] ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectJob(item.id)}
                                                            disabled={actionLoading[`reject_${item.id}`]}
                                                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200"
                                                            title="Reject Job"
                                                            aria-label="Reject Job"
                                                        >
                                                            {actionLoading[`reject_${item.id}`] ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                            ) : (
                                                                <XCircle className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                    {currentItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center text-xs text-gray-500 mb-2">
                                        <span>{item.company} • {item.location}</span>
                                    </div>
                                    {item.workMode && (
                                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                                            {item.workMode}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Type:</span>
                                    <span className="ml-1 text-gray-900">{item.type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Salary:</span>
                                    <span className="ml-1 text-gray-900 font-medium">{item.pricing}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Applied On:</span>
                                    <span className="ml-1 text-gray-900">{item.dueDate}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.statusColor}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 opacity-100">
                                    <button
                                        onClick={() => handleChatClick(item)}
                                        className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                                        title="Chat"
                                        aria-label="Chat"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setIsWorkModalOpen(true)}
                                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                                        title="View Details"
                                        aria-label="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                                {!item.isRejected && !item.isAssigned && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleAcceptJob(item.id)}
                                            disabled={actionLoading[`accept_${item.id}`]}
                                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded border border-green-200"
                                            title="Accept Job"
                                            aria-label="Accept Job"
                                        >
                                            {actionLoading[`accept_${item.id}`] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleRejectJob(item.id)}
                                            disabled={actionLoading[`reject_${item.id}`]}
                                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200"
                                            title="Reject Job"
                                            aria-label="Reject Job"
                                        >
                                            {actionLoading[`reject_${item.id}`] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="mt-6 bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>

                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(endIndex, workItems.length)}</span> of{' '}
                                <span className="font-medium">{workItems.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {[...Array(totalPages)].map((_, index) => {
                                    const page = index + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Chat Modal */}
            {isModalOpen && selectedJobForChat && (
                <EnhancedChatModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    companyName={selectedJobForChat.company}
                    location={selectedJobForChat.location}
                    targetUserId={selectedJobForChat.receiverId}
                    jobTitle={selectedJobForChat.title}
                    showInbox={false}
                />
            )}

            {/* Submit Work Modal */}
            {isWorkModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-medium mb-4">Job Details</h3>
                        <p className="text-gray-600 mb-4">Detailed job information will be displayed here.</p>
                        <button
                            onClick={() => setIsWorkModalOpen(false)}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && pendingAction && (
                <div className="fixed inset-0 flex items-center justify-center z-[70] backdrop-blur-[1px]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border">
                        <div className="flex items-center mb-4">
                            <div className={`p-2 rounded-full mr-3 ${
                                pendingAction.action === 'accept' 
                                    ? 'bg-green-100' 
                                    : 'bg-red-100'
                            }`}>
                                {pendingAction.action === 'accept' ? (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {pendingAction.action === 'accept' ? 'Accept Job' : 'Reject Job'}
                            </h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            {pendingAction.message}
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelAction}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                    pendingAction.action === 'accept'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {pendingAction.action === 'accept' ? 'Accept' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastMessage && (
                <div className="fixed top-4 right-4 z-[60]">
                    <div className={`flex items-center gap-2 rounded-xl border shadow-md px-4 py-2 text-sm ${
                        toastType === 'success' 
                            ? 'border-green-200 bg-green-50 text-green-800' 
                            : 'border-red-200 bg-red-50 text-red-800'
                    }`}>
                        {toastType === 'success' ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        )}
                        <span>{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveWorkDashboard;