"use client";
import React, { useState, useEffect } from 'react';
import { MessageSquare, FileText, ChevronLeft, ChevronRight, Check, X, AlertCircle, Eye, Edit, CheckCircle, XCircle, UserMinus, Clock } from 'lucide-react';
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
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showRemoveHistoryModal, setShowRemoveHistoryModal] = useState(false);
    const [selectedJobForRemoval, setSelectedJobForRemoval] = useState(null);
    const [removeReason, setRemoveReason] = useState('');
    const [removeHistory, setRemoveHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);

    const itemsPerPage = 10;

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (showConfirmModal || showRemoveModal || showRemoveHistoryModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showConfirmModal, showRemoveModal, showRemoveHistoryModal]);

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
                title: item.cuj_title, // Job title for reference
                freelancerName: item.name, // Freelancer name
                company: item.cuj_title, // Job title as company
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
                // Store raw values with defaults for consistent checks
                sjr_is_active: item.sjr_is_active ?? 1, // Default to 1 (pending) if undefined
                cuj_is_assigned: item.cuj_is_assigned ?? 0, // Default to 0 (not assigned) if undefined
                isRejected: (item.sjr_is_active ?? 1) === 2, // Check if rejected
                isAssigned: (item.cuj_is_assigned ?? 0) === 1, // Check if assigned
                companyId: item.company_id,
                receiverId: item.sjr_fe_u_id, // This is the freelancer user ID from the API
                freelancerId: item.sjr_fe_u_id, // Add freelancer ID for assign functionality
                icon: getJobIcon(item.cuj_title),
                status: getStatus({
                    sjr_is_active: item.sjr_is_active ?? 1,
                    cuj_is_assigned: item.cuj_is_assigned ?? 0
                }),
                statusColor: getStatusColor(getStatus({
                    sjr_is_active: item.sjr_is_active ?? 1,
                    cuj_is_assigned: item.cuj_is_assigned ?? 0
                }))
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
        // Check for removed status first
        if (item.sjr_is_active === 0 && item.cuj_is_assigned === 0) return 'Removed';
        // Check if assigned
        if (item.cuj_is_assigned === 1) return 'Assigned';
        // Check if rejected
        if (item.sjr_is_active === 2) return 'Rejected';
        // Default to pending
        return 'Pending';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Assigned':
                return 'bg-green-100 text-green-800';
            case 'Rejected':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Removed':
                return 'bg-orange-100 text-orange-800';
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
            message: 'Are you sure you want to reject this freelancer\'s request? This action cannot be undone.' 
        });
        setShowConfirmModal(true);
    };

    const handleAcceptJob = (jobId) => {
        const job = workItems.find(item => item.id === jobId);
        if (!job) return;

        setPendingAction({ 
            jobId, 
            action: 'accept', 
            message: 'Are you sure you want to assign this freelancer to the job? This action cannot be undone.' 
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
                const job = workItems.find(item => item.id === jobId);
                if (!job || !job.freelancerId) {
                    throw new Error('Freelancer ID not found for this job');
                }
                const encodedFreelancerId = encodeId(job.freelancerId);
                await api.get(`/assignFeJob/${encodedId}/${encodedFreelancerId}`);
                setWorkItems(prev => prev.map(item => 
                    item.id === jobId 
                        ? { 
                            ...item, 
                            isAssigned: true,
                            isRejected: false,
                            sjr_is_active: 1, // Keep as pending in SendJobRequest
                            cuj_is_assigned: 1, // Set as assigned
                            status: 'Assigned',
                            statusColor: getStatusColor('Assigned')
                        }
                        : item
                ));
                setToastType("success");
                setToastMessage("Freelancer assigned for this job successfully!");
            } else {
                await api.get(`/rejectFeJobRequest/${encodedId}`);
                setWorkItems(prev => prev.map(item => 
                    item.id === jobId 
                        ? { 
                            ...item, 
                            isRejected: true,
                            isAssigned: false,
                            sjr_is_active: 2, // Set to rejected in SendJobRequest
                            cuj_is_assigned: 0, // Ensure not assigned
                            status: 'Rejected',
                            statusColor: getStatusColor('Rejected')
                        }
                        : item
                ));
                setToastType("success");
                setToastMessage("Request rejected successfully!");
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

    // Remove Freelancer Functions
    const handleRemoveFreelancer = (job) => {
        setSelectedJobForRemoval(job);
        setRemoveReason('');
        setShowRemoveModal(true);
    };

    const handleViewRemoveHistory = async (jobId) => {
        try {
            setLoadingHistory(true);
            const encodedId = encodeId(jobId);
            const response = await api.get(`/removeReasonList/${encodedId}`);
            setRemoveHistory(response.data.reasonlist || []);
            setShowRemoveHistoryModal(true);
        } catch (err) {
            console.error('Error fetching removal history:', err);
            setRemoveHistory([]);
            setShowRemoveHistoryModal(true);
        } finally {
            setLoadingHistory(false);
        }
    };

    const submitRemoveFreelancer = async () => {
        if (!removeReason.trim()) {
            setToastType("error");
            setToastMessage("Please provide a reason for removal.");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        try {
            setRemoveLoading(true);
            const response = await api.post('/removeAssignedFreelancer', {
                cuj_id: selectedJobForRemoval.id,
                fp_u_id: selectedJobForRemoval.freelancerId,
                reason: removeReason.trim()
            });

            // Update the job status to removed
            setWorkItems(prev => prev.map(item => 
                item.id === selectedJobForRemoval.id 
                    ? { 
                        ...item, 
                        isAssigned: false,
                        isRejected: false,
                        sjr_is_active: 0, // Set to removed
                        cuj_is_assigned: 0, // Set as not assigned
                        status: 'Removed',
                        statusColor: getStatusColor('Removed')
                    }
                    : item
            ));

            setToastType("success");
            setToastMessage("Freelancer removed successfully!");
            setTimeout(() => setToastMessage(""), 3000);
            closeRemoveModal();
        } catch (err) {
            console.error('Error removing freelancer:', err);
            setToastType("error");
            setToastMessage("Failed to remove freelancer. Please try again.");
            setTimeout(() => setToastMessage(""), 5000);
        } finally {
            setRemoveLoading(false);
        }
    };

    const closeRemoveModal = () => {
        setShowRemoveModal(false);
        setSelectedJobForRemoval(null);
        setRemoveReason('');
    };

    const closeHistoryModal = () => {
        setShowRemoveHistoryModal(false);
        setRemoveHistory([]);
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Freelancer Requests</h1>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Freelancer Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Salary Range
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Requested On
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
                                                        {item.freelancerName}
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
                                                {(() => {
                                                    const isPending = item.sjr_is_active === 1 && item.cuj_is_assigned === 0;
                                                    const isAssigned = item.sjr_is_active === 1 && item.cuj_is_assigned === 1;
                                                    const isRejected = item.sjr_is_active === 2;
                                                    const isDisabled = isAssigned || isRejected;
                                                    return true; // Always show buttons
                                                })() && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAcceptJob(item.id)}
                                                            disabled={actionLoading[`accept_${item.id}`] || (item.sjr_is_active === 1 && item.cuj_is_assigned === 1) || item.sjr_is_active === 2}
                                                            className={`p-1.5 rounded border ${
                                                                actionLoading[`accept_${item.id}`] || (item.sjr_is_active === 1 && item.cuj_is_assigned === 1) || item.sjr_is_active === 2
                                                                    ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                                                                    : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
                                                            }`}
                                                            title="Assign Freelancer"
                                                            aria-label="Assign Freelancer"
                                                        >
                                                            {actionLoading[`accept_${item.id}`] ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectJob(item.id)}
                                                            disabled={actionLoading[`reject_${item.id}`] || (item.sjr_is_active === 1 && item.cuj_is_assigned === 1) || item.sjr_is_active === 2}
                                                            className={`p-1.5 rounded border ${
                                                                actionLoading[`reject_${item.id}`] || (item.sjr_is_active === 1 && item.cuj_is_assigned === 1) || item.sjr_is_active === 2
                                                                    ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                                                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                                                            }`}
                                                            title="Reject Request"
                                                            aria-label="Reject Request"
                                                        >
                                                            {actionLoading[`reject_${item.id}`] ? (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                                            ) : (
                                                                <XCircle className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                                {item.cuj_is_assigned === 1 && (
                                                    <button
                                                        onClick={() => handleRemoveFreelancer(item)}
                                                        className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded border border-orange-200"
                                                        title="Remove Freelancer"
                                                        aria-label="Remove Freelancer"
                                                    >
                                                        <UserMinus className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleViewRemoveHistory(item.id)}
                                                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200"
                                                    title="View Removal History"
                                                    aria-label="View Removal History"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </button>
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
                                        {item.freelancerName}
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
                                    <span className="text-gray-500">Requested On:</span>
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
                                {(() => {
                                    const isPending = item.sjr_is_active === 1 && item.cuj_is_assigned === 0;
                                    const isAssigned = item.sjr_is_active === 1 && item.cuj_is_assigned === 1;
                                    const isRejected = item.sjr_is_active === 2;
                                    const isDisabled = isAssigned || isRejected;
                                    return true; // Always show buttons
                                })() && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleAcceptJob(item.id)}
                                            disabled={actionLoading[`accept_${item.id}`] || (item.sjr_is_active === 1 && item.cuj_is_assigned === 1) || item.sjr_is_active === 2}
                                            className={`p-1.5 rounded border ${
                                                actionLoading[`accept_${item.id}`] || (item.sjr_is_active === 1 && item.cuj_is_assigned === 1) || item.sjr_is_active === 2
                                                    ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                                                    : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'
                                            }`}
                                            title="Assign Freelancer"
                                            aria-label="Assign Freelancer"
                                        >
                                            {actionLoading[`accept_${item.id}`] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleRejectJob(item.id)}
                                            disabled={actionLoading[`reject_${item.id}`] || (item.sjr_is_active === 1 && item.cuj_is_assigned === 1) || item.sjr_is_active === 2}
                                            className={`p-1.5 rounded border ${
                                                actionLoading[`reject_${item.id}`] || (item.sjr_is_active === 1 && item.cuj_is_assigned === 1) || item.sjr_is_active === 2
                                                    ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                                                    : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                                            }`}
                                            title="Reject Request"
                                            aria-label="Reject Request"
                                        >
                                            {actionLoading[`reject_${item.id}`] ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                )}
                                {item.cuj_is_assigned === 1 && (
                                    <button
                                        onClick={() => handleRemoveFreelancer(item)}
                                        className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded border border-orange-200"
                                        title="Remove Freelancer"
                                        aria-label="Remove Freelancer"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleViewRemoveHistory(item.id)}
                                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200"
                                    title="View Removal History"
                                    aria-label="View Removal History"
                                >
                                    <Clock className="w-4 h-4" />
                                </button>
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
                                {pendingAction.action === 'accept' ? 'Assign Freelancer' : 'Reject Request'}
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
                                {pendingAction.action === 'accept' ? 'Assign' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Freelancer Modal */}
            {showRemoveModal && selectedJobForRemoval && (
                <div className="fixed inset-0 flex items-center justify-center z-[70] backdrop-blur-[1px]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Remove Freelancer</h3>
                            <button
                                onClick={closeRemoveModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Job:</span> {selectedJobForRemoval.company}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Freelancer:</span> {selectedJobForRemoval.freelancerName}
                            </p>
                        </div>
                        
                        <div className="mb-6">
                            <label htmlFor="removeReason" className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Removal <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="removeReason"
                                value={removeReason}
                                onChange={(e) => setRemoveReason(e.target.value)}
                                placeholder="Please provide a reason for removing this freelancer..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                rows={4}
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeRemoveModal}
                                disabled={removeLoading}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRemoveFreelancer}
                                disabled={removeLoading || !removeReason.trim()}
                                className="px-4 py-2 text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {removeLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Removing...
                                    </>
                                ) : (
                                    'Remove Freelancer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove History Modal */}
            {showRemoveHistoryModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[70] backdrop-blur-[1px]">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-lg border max-h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Removal History</h3>
                            <button
                                onClick={closeHistoryModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Loading history...</span>
                                </div>
                            ) : removeHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No removal history for this job</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {removeHistory.map((item, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(item.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">Job:</span> {item.cuj_title}
                                            </p>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                                                <span className="font-medium">Reason:</span> {item.far_reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={closeHistoryModal}
                                className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Close
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