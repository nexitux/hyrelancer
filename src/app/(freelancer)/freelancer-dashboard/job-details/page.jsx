"use client"
import { useState, useEffect } from 'react';
import {
    CaretDown,
    CaretUp,
    Desktop,
    CheckCircle,
    MapPin,
    Star,
    PaperPlaneTilt,
    CurrencyDollar,
    Briefcase,
    Eye,
    Clock,
    Users,
    RocketLaunch,
    Building,
    Calendar
} from '@phosphor-icons/react';
import Head from 'next/head';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { message } from 'antd';

const JobListingsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(6); // Even number for 2 per row
    const [salaryRange, setSalaryRange] = useState({ min: 0, max: 3000 });
    const [sortOption, setSortOption] = useState('latest');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(false);
    const [applyingId, setApplyingId] = useState(null);
    
    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successJob, setSuccessJob] = useState(null);

    // Get token from Redux store
    const token = useSelector((state) => state.auth.token);

    // Primary color scheme
    const primaryColor = '#2563eb';
    const primaryHover = '#1d4ed8';
    const gradientFrom = '#2563eb';
    const gradientTo = '#1e40af';

    // Format date to "X days ago"
    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
        return `${Math.floor(diffDays/30)} months ago`;
    };

    // Fetch jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                
                if (!token) {
                    setError('Authentication required. Please log in.');
                    setLoading(false);
                    return;
                }
                
                const response = await fetch('https://test.hyrelancer.in/api/getAllJobs', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.status === 401) {
                    setError('Authentication failed. Please log in again.');
                    setLoading(false);
                    return;
                }
                
                const data = await response.json();
                console.log('API Response:', data);
                
                if (data.job_list && Array.isArray(data.job_list)) {
                    const formattedJobs = data.job_list.map(job => {
                        const salaryFrom = job.cuj_salary_range_from ? parseInt(job.cuj_salary_range_from) : 0;
                        const salaryTo = job.cuj_salary_range_to ? parseInt(job.cuj_salary_range_to) : 0;
                        
                        return {
                            id: job.cuj_id || job.id || Math.random().toString(36).substr(2, 9),
                            title: job.cuj_title || 'Untitled Job',
                            posted: job.created_at ? formatDate(job.created_at) : 'Recently',
                            verified: job.cuj_is_active === 1 || job.is_active === 1,
                            location: job.cuj_location || job.location || 'Remote',
                            salary: salaryFrom > 0 ? `$${salaryFrom} - $${salaryTo}` : 'Not specified',
                            salary_from: salaryFrom,
                            rating: (Math.random() * 1 + 4).toFixed(1), // Random rating between 4.0-5.0
                            description: job.cuj_desc || job.description || 'No description available',
                            tags: [job.cuj_job_type, job.cuj_work_mode, job.cuj_lang].filter(Boolean),
                            price: salaryFrom > 0 ? `$${salaryFrom}` : 'Negotiable',
                            priceType: '/fixed-price',
                            image: job.cuj_img1 ? `https://test.hyrelancer.in/${job.cuj_img1}` : "/images/IMG-13.webp",
                            workMode: job.cuj_work_mode || 'Not specified',
                            jobType: job.cuj_job_type || 'Not specified',
                            experience: job.cuj_u_experience || 'Not specified',
                            employer: {
                                name: job.employer_name || job.name || 'Hyrelancer Client',
                                email: job.employer_email || job.email || 'contact@hyrelancer.in',
                            },
                            created_at: job.created_at,
                            applications: Math.floor(Math.random() * 50) + 1 // Random application count
                        };
                    });
                    
                    setJobs(formattedJobs);
                } else {
                    setJobs([]);
                    setError('No jobs found in response');
                }
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError('Failed to load jobs. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [token]);

    const handleSalaryChange = (e, type) => {
        const value = parseInt(e.target.value);
        if (type === 'min') {
            setSalaryRange(prev => ({ ...prev, min: value }));
        } else {
            setSalaryRange(prev => ({ ...prev, max: value }));
        }
    };

    const applyForJob = async (jobId) => {
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
            
            if (response.ok) {
                const appliedJob = jobs.find(job => job.id === jobId);
                setSuccessJob(appliedJob);
                setShowSuccessModal(true);
                message.success('Application submitted successfully!');
            } else {
                message.error('Failed to apply: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error applying for job:', err);
            message.error('Error applying for job. Please try again.');
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

    // Handle overlay click to close modal
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            closeSuccessModal();
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollToTopBtn = document.querySelector('.scroll-to-top-btn');
            if (window.scrollY > 300) {
                scrollToTopBtn?.classList.add('opacity-100');
            } else {
                scrollToTopBtn?.classList.remove('opacity-100');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Filter and sort jobs
    const filteredJobs = jobs
        .filter(job => {
            return job.salary_from >= salaryRange.min && job.salary_from <= salaryRange.max;
        })
        .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            
            if (sortOption === 'latest') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

    // Pagination logic
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
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
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto border border-gray-100">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle size={24} weight="fill" className="text-white" />
                        </div>
                    </div>
        
                    <div className="text-center pt-12 pb-8 px-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h2>
                        <p className="text-gray-600">Your application has been submitted successfully</p>
                    </div>
        
                    {successJob && (
                        <div className="px-6 pb-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                        <Briefcase size={24} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{successJob.title}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{successJob.employer?.name || 'Hyrelancer Client'}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {successJob.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CurrencyDollar size={12} />
                                                {successJob.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
        
                            <div className="flex gap-3">
                                <button
                                    onClick={closeSuccessModal}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
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

    return (
        <>
            <Head>
                <title>Job Listings | Hyrelancer</title>
                <meta name="description" content="Browse professional job listings on Hyrelancer" />
                <link rel="icon" href="/assets/images/fav.png" />
            </Head>

           

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 lg:py-12">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Jobs</p>
                                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Briefcase size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Remote Jobs</p>
                                <p className="text-2xl font-bold text-gray-900">{jobs.filter(job => job.location.toLowerCase().includes('remote')).length}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <Desktop size={24} className="text-green-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg. Salary</p>
                                <p className="text-2xl font-bold text-gray-900">$2,500</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                <CurrencyDollar size={24} className="text-amber-600" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">New Today</p>
                                <p className="text-2xl font-bold text-gray-900">{jobs.filter(job => job.posted === 'Today').length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Calendar size={24} className="text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-700">Sort by:</span>
                                <select 
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                >
                                    <option value="latest">Latest First</option>
                                    <option value="earliest">Earliest First</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-700">Salary Range:</span>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="3000"
                                            value={salaryRange.min}
                                            onChange={(e) => handleSalaryChange(e, 'min')}
                                            className="w-28 pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                            placeholder="Min"
                                        />
                                    </div>
                                    <span className="text-gray-400">-</span>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="3000"
                                            value={salaryRange.max}
                                            onChange={(e) => handleSalaryChange(e, 'max')}
                                            className="w-28 pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            Showing {currentJobs.length} of {filteredJobs.length} jobs
                        </div>
                    </div>
                </div>

                {/* Loading and Error States */}
                {loading && (
                    <div className="flex justify-center items-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading professional opportunities...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Jobs</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        {error.includes('Authentication') && (
                            <Link href="/login" className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                Go to Login
                            </Link>
                        )}
                    </div>
                )}

                {/* Modern Job Grid - 2 per row */}
                <main className="w-full">
                    {!loading && !error && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {currentJobs.length > 0 ? (
                                    currentJobs.map((job) => (
                                        <div key={job.id} className="group relative">
                                            <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden">
                                                {/* Premium Badge */}
                                                {job.verified && (
                                                    <div className="absolute top-4 right-4 z-10">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
                                                            <CheckCircle size={12} className="mr-1" />
                                                            Verified
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="p-6">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <Link href={`/freelancer-dashboard/job-list/${job.id}`} className="block">
                                                                <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
                                                                    {job.title}
                                                                </h3>
                                                            </Link>
                                                            <p className="text-blue-600 font-medium text-sm mt-1">{job.employer?.name}</p>
                                                        </div>
                                                    </div>

                                                    {/* Quick Stats */}
                                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <MapPin size={16} className="mr-2 text-blue-500" />
                                                            <span className="font-medium">{job.location}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <CurrencyDollar size={16} className="mr-2 text-green-500" />
                                                            <span className="font-medium">{job.salary}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Clock size={16} className="mr-2 text-purple-500" />
                                                            <span className="font-medium">{job.posted}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Users size={16} className="mr-2 text-orange-500" />
                                                            <span className="font-medium">{job.applications} applicants</span>
                                                        </div>
                                                    </div>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                            <Briefcase size={12} className="mr-1" />
                                                            {job.jobType}
                                                        </span>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                            <Desktop size={12} className="mr-1" />
                                                            {job.workMode}
                                                        </span>
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                            <Star size={12} className="mr-1" />
                                                            {job.experience}
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    <div className="mb-4">
                                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                                            {job.description}
                                                        </p>
                                                    </div>

                                                    {/* Rating and Price */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center">
                                                            <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                                                                <Star size={14} weight="fill" className="text-yellow-500 mr-1" />
                                                                <span className="text-sm font-semibold text-gray-900">{job.rating}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-gray-900">{job.price}</div>
                                                            <div className="text-xs text-gray-500">{job.priceType}</div>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-3">
                                                        <Link
                                                            href={`/freelancer-dashboard/job-list/${job.id}`}
                                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                                                        >
                                                            <Eye size={16} />
                                                            View Details
                                                        </Link>
                                                        <button
                                                            onClick={() => applyForJob(job.id)}
                                                            disabled={applying && applyingId === job.id}
                                                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                        >
                                                            {applying && applyingId === job.id ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                    Applying...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <PaperPlaneTilt size={16} />
                                                                    Apply Now
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Hover Effect */}
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2">
                                        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                                <Briefcase size={48} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-700 mb-3">No jobs match your criteria</h3>
                                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                                Try adjusting your salary range or check back later for new opportunities.
                                            </p>
                                            <button 
                                                onClick={() => setSalaryRange({ min: 0, max: 3000 })}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                            >
                                                Reset Filters
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Pagination */}
                            {currentJobs.length > 0 && totalPages > 1 && (
                                <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages} • {filteredJobs.length} total jobs
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <CaretUp size={16} className="rotate-90" />
                                            Previous
                                        </button>
                                        
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNumber;
                                                if (totalPages <= 5) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNumber = totalPages - 4 + i;
                                                } else {
                                                    pageNumber = currentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => paginate(pageNumber)}
                                                        className={`min-w-[40px] h-10 rounded-xl font-semibold transition-all duration-200 ${
                                                            currentPage === pageNumber 
                                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                            <CaretUp size={16} className="-rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Success Modal */}
            <SuccessModal />

            {/* Enhanced Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className="scroll-to-top-btn fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-2xl flex items-center justify-center opacity-0 transition-all duration-300 hover:scale-110 hover:shadow-3xl backdrop-blur-sm border border-white/20"
                aria-label="Scroll to top"
            >
                <CaretUp size={24} />
            </button>
        </>
    );
};

export default JobListingsPage;