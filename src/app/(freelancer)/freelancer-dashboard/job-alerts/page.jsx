"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit3, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { freelancerJobAPI } from '../../../../config/api';


const JobAlerts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('Default');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);

    const toggleAlert = (id) => {
        setAlerts(alerts.map(alert =>
            alert.id === id
                ? { ...alert, enabled: !alert.enabled, status: alert.enabled ? 'Disabled' : 'Enabled' }
                : alert
        ));
    };

    const deleteAlert = (id) => {
        setAlerts(alerts.filter(alert => alert.id !== id));
    };

    // Fetch applied job alerts from API
    useEffect(() => {
        const fetchAppliedJobAlerts = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching applied job alerts...');
                const response = await freelancerJobAPI.getAppliedJobAlert();
                console.log('API Response:', response);
                
                if (response) {
                    console.log('Response structure:', {
                        hasJobAppList: !!response.job_App_list,
                        jobAppListType: typeof response.job_App_list,
                        jobAppListValue: response.job_App_list
                    });
                    
                    setUserProfile(response.u_profile);
                    
                    // Handle different response structures
                    let jobList = [];
                    if (response.job_App_list) {
                        if (Array.isArray(response.job_App_list)) {
                            jobList = response.job_App_list;
                        } else if (response.job_App_list.data && Array.isArray(response.job_App_list.data)) {
                            jobList = response.job_App_list.data;
                        } else {
                            // Handle case where Laravel didn't call ->get()
                            console.warn('job_App_list is not an array, this might be a query builder object. Adding empty array as fallback.');
                            jobList = [];
                        }
                    }
                    
                    console.log('Processed job list:', jobList);
                    
                    // If we don't have jobs, show empty state but don't treat as error
                    if (!jobList || jobList.length === 0) {
                        console.log('No applied jobs found or empty response');
                        setAlerts([]);
                        return;
                    }
                    
                    // Transform API data to match our alert structure
                    const transformedAlerts = jobList.map((job, index) => ({
                        id: job.cuj_id || job.id || (index + 1),
                        title: job.cuj_title || job.title || `Applied Job ${index + 1}`,
                        status: 'Applied',
                        region: job.user?.country || job.country || 'Not specified',
                        categories: job.cuj_category ? [job.cuj_category] : (job.category ? [job.category] : ['General']),
                        tags: job.cuj_skills ? job.cuj_skills.split(',').map(skill => skill.trim()) : 
                              (job.skills ? job.skills.split(',').map(skill => skill.trim()) : ['applied']),
                        type: job.cuj_job_type || job.job_type || 'Contract',
                        jobsFound: 1, // Each job represents one applied position
                        frequency: 'Applied',
                        enabled: true,
                        applied_at: job.created_at || job.applied_at,
                        job_data: job // Store original job data for reference
                    }));
                    
                    console.log('Transformed alerts:', transformedAlerts);
                    setAlerts(transformedAlerts);
                } else {
                    console.log('No response data received');
                    setAlerts([]);
                }
            } catch (err) {
                console.error('Error fetching applied job alerts:', err);
                console.error('Error details:', {
                    message: err.message,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data
                });
                setError(`Failed to load applied job alerts: ${err.message || 'Unknown error'}. Please try again.`);
                setAlerts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAppliedJobAlerts();
    }, []);

    const getStatusBadge = (status) => {
        if (status === 'Applied') {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Applied</span>;
        }
        return status === 'Enabled'
            ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Enabled</span>
            : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Disabled</span>;
    };

    const filteredAlerts = alerts.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-800" />
                    <span className="text-gray-600">Loading applied job alerts...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-600 text-lg font-medium mb-2">Error Loading Data</div>
                    <div className="text-gray-500 mb-4">{error}</div>
                    <div className="space-y-2">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors w-full mb-2"
                        >
                            Retry
                        </button>
                        <button 
                            onClick={() => {
                                // Fallback: set empty alerts to show the interface
                                setError(null);
                                setAlerts([]);
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full"
                        >
                            View Empty List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-4 sm:pt-8">
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Applied Job Alerts</h1>
                    <p className="text-gray-600 mt-2">View your recently applied job positions</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Search and Sort Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by keyword"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-blue-800 text-sm placeholder-gray-500"
                                />
                            </div>

                          
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200">
                        <div className="grid grid-cols-12 gap-4 px-6 py-4">
                            <div className="col-span-6">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</h3>
                            </div>
                            <div className="col-span-2 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Type</h3>
                            </div>
                            <div className="col-span-1 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied Date</h3>
                            </div>
                            <div className="col-span-1 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
                            </div>
                            <div className="col-span-2 text-center">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</h3>
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                        {filteredAlerts.map((alert, index) => (
                            <div key={alert.id} className={`grid grid-cols-12 gap-4 px-6 py-6 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                {/* Title Column */}
                                <div className="col-span-6">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900 truncate">{alert.title}</h4>
                                                {getStatusBadge(alert.status)}
                                            </div>
                                            <div className="space-x-2 text-sm text-gray-500 flex flex-wrap">
                                                <div>
                                                    <span className="font-medium">Region:</span> {alert.region}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Categories:</span> {alert.categories.join(', ')}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Tags:</span> {alert.tags.join(', ')}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Type:</span> {alert.type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Type Column */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-gray-900 font-medium">{alert.type}</div>
                                    </div>
                                </div>

                                {/* Applied Date Column */}
                                <div className="col-span-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-base font-medium text-blue-800">
                                            {alert.applied_at ? new Date(alert.applied_at).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Column */}
                               

                                {/* Action Column */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <div className="flex items-center space-x-3">
                                        <Link href={{
                                            pathname: '/job-details',
                                            query: { id: alert.id }
                                        }}>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Job Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4">
                    {filteredAlerts.map((alert) => (
                        <div key={alert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 truncate">{alert.title}</h4>
                                        {getStatusBadge(alert.status)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <span className="font-medium text-blue-800">
                                            Applied: {alert.applied_at ? new Date(alert.applied_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="space-y-2 mb-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div>
                                        <span className="font-medium text-gray-900">Region:</span> {alert.region}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900">Type:</span> {alert.type}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="font-medium text-gray-900">Categories:</span> {alert.categories.join(', ')}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="font-medium text-gray-900">Tags:</span> {alert.tags.join(', ')}
                                    </div>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                                <Link href={{
                                    pathname: '/job-details',
                                    query: { id: alert.id }
                                }}>
                                    <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Job Details">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredAlerts.length === 0 && !loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
                        <div className="text-gray-500 text-lg">No  jobs Alerts found</div>
                        <div className="text-gray-400 text-sm mt-1">Start applying to jobs to see them here</div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-4 sm:mt-6 text-center text-sm text-gray-500">
                    Showing {filteredAlerts.length} of {alerts.length} applied jobs
                </div>
            </div>
         
        </div>
    );
};

export default JobAlerts;