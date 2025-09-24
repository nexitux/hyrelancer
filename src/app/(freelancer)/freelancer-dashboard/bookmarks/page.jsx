"use client";
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar, Star, Trash2, Briefcase, Clock, DollarSign, AlertCircle, Check, X, PaperPlaneTilt, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';

const Bookmarks = () => {
    const [activeTab, setActiveTab] = useState('Projects');
    const [currentPage, setCurrentPage] = useState(1);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [infoMessage, setInfoMessage] = useState({ text: '', type: '' });

    // Apply job states
    const [applying, setApplying] = useState(false);
    const [applyingId, setApplyingId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successJob, setSuccessJob] = useState(null);

    // Modal for backend error messages (e.g., already applied)
    const [showBackendModal, setShowBackendModal] = useState(false);
    const [backendModal, setBackendModal] = useState({
        title: '',
        message: '',
        icon: null,
        type: 'info', // 'info', 'error', 'warning'
    });

    const itemsPerPage = 6;

    // Get token from localStorage
    const getToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    };

    // Check authentication
    const isAuthenticated = () => {
        const token = getToken();
        if (!token) {
            setError('Authentication required. Please log in.');
            setLoading(false);
            return false;
        }
        return true;
    };

    // Fetch bookmarks from API with token
    const fetchBookmarks = async () => {
        if (!isAuthenticated()) return;

        try {
            setLoading(true);
            setError(null);
            const token = getToken();

            const response = await axios.get('https://test.hyrelancer.in/api/getBookmark', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.data) {
                setBookmarks(response.data.data);
            } else {
                setBookmarks([]);
                setInfoMessage({ text: 'No bookmarks found', type: 'info' });
            }
        } catch (err) {
            console.error('Error fetching bookmarks:', err);

            if (err.response?.status === 401) {
                setError('Unauthorized. Please log in again.');
            } else if (err.response?.status === 500) {
                setError('Server error. Please try again later.');
            } else {
                setError('Failed to fetch bookmarks. Please check your connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Apply for job function (with backend message modal)
    const applyForJob = async (jobId, jobTitle) => {
        const token = getToken();
        if (!token) {
            message.error('Please login to apply for this job');
            return;
        }

        setApplying(true);
        setApplyingId(jobId);

        try {
            const encodedId = typeof window !== 'undefined' ? window.btoa(String(jobId)) : Buffer.from(String(jobId)).toString('base64');
            const response = await fetch(`https://test.hyrelancer.in/api/sendRequestForJob/${encodedId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok && data.status) {
                // Success
                const appliedBookmark = bookmarks.find(bookmark => bookmark.customer_job?.cuj_id === jobId);
                if (appliedBookmark) {
                    setSuccessJob({
                        id: appliedBookmark.customer_job.cuj_id,
                        title: appliedBookmark.customer_job.cuj_title || jobTitle,
                        employer: {
                            name: appliedBookmark.customer_job.cuj_contact_name || 'Hyrelancer Client'
                        },
                        location: appliedBookmark.customer_job.cuj_location || 'Remote',
                        price: appliedBookmark.customer_job.cuj_salary_range_from ?
                            `$${appliedBookmark.customer_job.cuj_salary_range_from}` : 'Negotiable'
                    });
                }
                setShowSuccessModal(true);
                // message.success('Application submitted successfully!'); // Now handled by modal
            } else {
                // Show backend message in modal (e.g., already applied, etc.)
                let modalType = 'error';
                let icon = <AlertTriangle size={32} className="text-yellow-500" />;
                let title = 'Application Failed';
                let msg = data.message || 'Unknown error occurred.';

                // Try to detect "already applied" or similar
                if (
                    typeof data.message === 'string' &&
                    (data.message.toLowerCase().includes('already applied') ||
                        data.message.toLowerCase().includes('already sent') ||
                        data.message.toLowerCase().includes('already') ||
                        data.message.toLowerCase().includes('duplicate'))
                ) {
                    modalType = 'warning';
                    icon = <AlertTriangle size={32} className="text-yellow-500" />;
                    title = 'Already Applied';
                    msg = data.message;
                } else if (data.message) {
                    modalType = 'error';
                    icon = <X size={32} className="text-red-500" />;
                    title = 'Application Failed';
                    msg = data.message;
                }

                setBackendModal({
                    title,
                    message: msg,
                    icon,
                    type: modalType,
                });
                setShowBackendModal(true);
            }
        } catch (err) {
            console.error('Error applying for job:', err);
            setBackendModal({
                title: 'Error',
                message: 'Error applying for job. Please try again.',
                icon: <X size={32} className="text-red-500" />,
                type: 'error',
            });
            setShowBackendModal(true);
        } finally {
            setApplying(false);
            setApplyingId(null);
        }
    };

    // Close success modal
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setSuccessJob(null);
    };

    // Close backend modal
    const closeBackendModal = () => {
        setShowBackendModal(false);
        setBackendModal({
            title: '',
            message: '',
            icon: null,
            type: 'info',
        });
    };

    // Handle overlay click to close modal
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeSuccessModal();
        }
    };

    // Handle overlay click to close backend modal
    const handleBackendOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeBackendModal();
        }
    };

    // Success Modal Component
    const SuccessModal = () => {
        if (!showSuccessModal) return null;

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={handleOverlayClick}
            >
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                    <button
                        onClick={closeSuccessModal}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    >
                        <X size={20} />
                    </button>

                    <div className="text-center pt-8 pb-6 px-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                            <Check size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted</h2>
                        <p className="text-gray-600">Your application has been sent successfully</p>
                    </div>

                    {successJob && (
                        <div className="px-6 pb-6">
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Briefcase size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{successJob.title}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{successJob.employer?.name || 'Hyrelancer Client'}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {successJob.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign size={12} />
                                                {successJob.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={closeSuccessModal}
                                    className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Continue Browsing
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                You'll be notified when the client reviews your application
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Backend Message Modal Component
    const BackendMessageModal = () => {
        if (!showBackendModal) return null;

        let iconBg = 'bg-yellow-50';
        let iconRing = 'ring-yellow-100';
        let icon = backendModal.icon;
        if (backendModal.type === 'error') {
            iconBg = 'bg-red-50';
            iconRing = 'ring-red-100';
        } else if (backendModal.type === 'info') {
            iconBg = 'bg-blue-50';
            iconRing = 'ring-blue-100';
        }

        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={handleBackendOverlayClick}
            >
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                    <button
                        onClick={closeBackendModal}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                    <div className="text-center pt-8 pb-6 px-6">
                        <div className={`w-16 h-16 mx-auto mb-4 ${iconBg} rounded-full flex items-center justify-center ring-4 ${iconRing}`}>
                            {icon}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{backendModal.title}</h2>
                        <p className="text-gray-600">{backendModal.message}</p>
                    </div>
                    <div className="px-6 pb-6">
                        <button
                            onClick={closeBackendModal}
                            className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Delete bookmark with token
    const deleteBookmark = async (jobId) => {
        if (!isAuthenticated()) return;

        try {
            const token = getToken();
            const response = await axios.get(`https://test.hyrelancer.in/api/deleteBookmark/${jobId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                // Remove from local state using job ID
                setBookmarks(prev => prev.filter(bookmark => bookmark.customer_job.cuj_id !== jobId));
                message.success('Bookmark removed successfully');
            } else {
                throw new Error('Failed to delete bookmark');
            }
        } catch (err) {
            console.error('Error deleting bookmark:', err);

            if (err.response?.status === 401) {
                setError('Unauthorized. Please log in again.');
            } else {
                message.error('Failed to remove bookmark');
            }
        }
    };

    // Confirm before deleting
    const confirmDelete = (jobId, jobTitle) => {
        if (window.confirm(`Are you sure you want to remove "${jobTitle}" from bookmarks?`)) {
            deleteBookmark(jobId);
        }
    };

    // Format date to relative time
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    // Format salary range
    const formatSalary = (from, to) => {
        if (!from && !to) return 'Salary not specified';
        if (!from) return `Up to $${to}`;
        if (!to) return `From $${from}`;
        return `$${from} - $${to}`;
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    // Handle retry after error
    const handleRetry = () => {
        setError(null);
        setInfoMessage({ text: '', type: '' });
        fetchBookmarks();
    };

    // Handle login redirect
    const handleLoginRedirect = () => {
        window.location.href = '/login';
    };

    // Projects Component with API data integration
    const Projects = ({ projects }) => {
        if (projects.length === 0 && !loading) {
            return (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Briefcase className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarked jobs</h3>
                    <p className="text-gray-600">You haven't bookmarked any jobs yet.</p>
                </div>
            );
        }

        return (
            <div className="grid gap-6 md:grid-cols-2">
                {projects.map((bookmark) => {
                    const job = bookmark.customer_job;
                    const jobTitle = job.cuj_title || 'Untitled Job';
                    const jobId = job.cuj_id;

                    return (
                        <div key={bookmark.jb_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:border-blue-200 relative">
                            {/* Remove Bookmark Button */}
                            <button
                                onClick={() => confirmDelete(jobId, jobTitle)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-2 border rounded-full hover:border-red-200 transition-colors bg-white"
                                title="Remove bookmark"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="pr-8">
                                <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-4">
                                    {jobTitle}
                                </h3>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {formatRelativeTime(job.created_at)}
                                    </div>

                                    {job.cuj_location && (
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {job.cuj_location}
                                        </div>
                                    )}

                                    <div className="flex items-center text-green-600 font-medium">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        {formatSalary(job.cuj_salary_range_from, job.cuj_salary_range_to)}
                                    </div>

                                    <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {job.cuj_job_type || 'Not specified'}
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4 text-sm line-clamp-3">
                                    {job.cuj_desc || 'No description provided.'}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.cuj_work_mode && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                            {job.cuj_work_mode}
                                        </span>
                                    )}

                                    {job.cuj_lang && job.cuj_lang.split(',').map((language, index) => (
                                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                            {language.trim()}
                                        </span>
                                    ))}

                                    {job.cuj_u_experience && (
                                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                                            {job.cuj_u_experience}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-sm text-gray-600">
                                        Contact: {job.cuj_contact_name || 'Not specified'}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {job.cuj_contact_email || 'No email'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => applyForJob(jobId, jobTitle)}
                                disabled={applying && applyingId === jobId}
                                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-600 py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] transition-all duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {applying && applyingId === jobId ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        <Star size={16} />
                                        Apply Now
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getCurrentData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return bookmarks.slice(startIndex, startIndex + itemsPerPage);
    };

    const getTotalPages = () => {
        return Math.ceil(bookmarks.length / itemsPerPage);
    };

    const renderTabContent = () => {
        // Show authentication error
        if (error && error.includes('Authentication')) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-400 mb-4">
                        <AlertCircle className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleLoginRedirect}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-12">
                    <div className="text-red-400 mb-4">
                        <Briefcase className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading bookmarks</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        const currentData = getCurrentData();

        switch (activeTab) {
            case 'Projects':
                return <Projects projects={currentData} />;
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
            {/* Success Modal */}
            <SuccessModal />
            {/* Backend Message Modal */}
            <BackendMessageModal />

            {/* Header outside the card */}
            <div className="max-w-[1600px] mx-auto px-4 pt-8 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
                <p className="text-gray-600 mt-2">Manage your saved job listings</p>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 pb-8">
                {/* Message Alert */}
                {infoMessage.text && (
                    <div className={`mb-4 px-4 py-3 rounded-lg ${infoMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {infoMessage.text}
                    </div>
                )}

                {/* Main Card Container */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex px-6">
                            {['Projects'].map((tab) => (
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
                                    {tab} {bookmarks.length > 0 && `(${bookmarks.length})`}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {renderTabContent()}
                    </div>

                    {/* Pagination */}
                    {!loading && bookmarks.length > itemsPerPage && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <Pagination />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bookmarks;