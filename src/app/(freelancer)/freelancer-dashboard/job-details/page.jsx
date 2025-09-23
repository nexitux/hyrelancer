"use client"
import { useState, useEffect, useRef } from 'react';
import {
    CaretDown,
    CaretUp,
    Stack,
    Desktop,
    MegaphoneSimple,
    Question,
    Bell,
    X,
    Heart,
    CalendarBlank,
    CheckCircle,
    MapPin,
    Star,
    PaperPlaneTilt,
    MagnifyingGlass,
    Minus,
    CheckSquare,
    List,
    CaretRight,
    CaretLeft,
    CaretDoubleLeft,
    CaretDoubleRight,
    ListDashes,
    User,
    Clock,
    CurrencyDollar,
    Briefcase,
    Eye,
    BookmarkSimple,
    Check,
    RocketLaunch,
    Sparkle
} from '@phosphor-icons/react';
import Head from 'next/head';
import Link from 'next/link';
import { useSelector } from 'react-redux';

const JobListingsPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(5);
    const [salaryRange, setSalaryRange] = useState({ min: 0, max: 3000 });
    const [sortOption, setSortOption] = useState('latest');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
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

    // Primary color
    const primaryColor = '#3a599c';
    const primaryHover = '#2d477a';

    // Format date to "X days ago"
    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    };

    // Fetch jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                
                // Check if we have a token
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
                
                // Check for unauthorized response
                if (response.status === 401) {
                    setError('Authentication failed. Please log in again.');
                    setLoading(false);
                    return;
                }
                
                const data = await response.json();
                console.log('API Response:', data); // Debug log
                
                if (data.job_list && Array.isArray(data.job_list)) {
                    // Map API data to match our job structure with proper error handling
                    const formattedJobs = data.job_list.map(job => {
                        // Safely parse salary values
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
                            rating: 4.5, // Default rating
                            description: job.cuj_desc || job.description || 'No description available',
                            tags: [job.cuj_job_type, job.cuj_work_mode, job.cuj_lang].filter(Boolean),
                        
                            price: salaryFrom > 0 ? `$${salaryFrom}` : 'Negotiable',
                            priceType: '/fixed-price',
                            image: job.cuj_img1 ? `https://test.hyrelancer.in/${job.cuj_img1}` : "/images/IMG-13.webp",
                            contact: {
                                name: job.cuj_contact_name || 'Contact',
                                email: job.cuj_contact_email || 'email@example.com',
                                mobile: job.cuj_contact_mobile || 'Not provided'
                            },
                            workMode: job.cuj_work_mode || 'Not specified',
                            jobType: job.cuj_job_type || 'Not specified',
                            experience: job.cuj_u_experience || 'Not specified',
                            employer: {
                                id: job.employer_id || job.id || 'unknown',
                                name: job.employer_name || job.name || 'Hyrelancer Client',
                                email: job.employer_email || job.email || 'contact@hyrelancer.in',
                                mobile: job.employer_mobile || job.mobile || 'Not provided',
                                address: job.employer_address || job.address || 'Not provided'
                            },
                            created_at: job.created_at // Keep original for sorting
                        };
                    });
                    
                    console.log('Formatted Jobs:', formattedJobs); // Debug log
                    setJobs(formattedJobs);
                } else {
                    console.log('No job_list found in response:', data);
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
            alert('Please login to apply for this job');
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
                // Find the job details for the success modal
                const appliedJob = jobs.find(job => job.id === jobId);
                setSuccessJob(appliedJob);
                setShowSuccessModal(true);
            } else {
                alert('Failed to apply: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error applying for job:', err);
            alert('Error applying for job. Please try again.');
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

            // For navbar shadow
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
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
            // Use the original created_at date for sorting
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
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
                    {/* Close button */}
                    <button
                        onClick={closeSuccessModal}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                    >
                        <X size={20} />
                    </button>
        
                    {/* Header */}
                    <div className="text-center pt-8 pb-6 px-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                            <Check size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted</h2>
                        <p className="text-gray-600">Your application has been sent successfully</p>
                    </div>
        
                    {/* Job details */}
                    {successJob && (
                        <div className="px-6 pb-6">
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
                                        <img 
                                            src={successJob.image} 
                                            alt={successJob.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f8fafc' stroke='%23e2e8f0'/%3E%3Ctext x='24' y='28' font-family='Arial' font-size='10' text-anchor='middle' fill='%236b7280'%3EJob%3C/text%3E%3C/svg%3E";
                                            }}
                                        />
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
                                                <CurrencyDollar size={12} />
                                                {successJob.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
        
                            
        
                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={closeSuccessModal}
                                    className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Continue
                                </button>
                              
                            </div>
        
                            {/* Footer note */}
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
                <meta name="description" content="Browse job listings on Hyrelancer" />
                <link rel="icon" href="/assets/images/fav.png" />
            </Head>

            {/* Breadcrumb */}
            <section className="breadcrumb relative">
                <div className="absolute inset-0">
                    <img
                        src="/images/breadcrumb_service.webp"
                        alt="Breadcrumb background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
                    <div className="max-w-4xl">
                        <div className="flex items-center text-white text-sm mb-2">
                            <Link href="/" className="hover:underline">Home</Link>
                            <span className="mx-2 opacity-40">/</span>
                            <span>For Candidates</span>
                            <span className="mx-2 opacity-40">/</span>
                            <span className="opacity-60">Jobs</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 lg:mb-6">Jobs List</h1>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 lg:py-8">
                {/* Top Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <select 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                        >
                            <option value="latest">Latest</option>
                            <option value="earliest">Earliest</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Salary Range:</span>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="3000"
                                    value={salaryRange.min}
                                    onChange={(e) => handleSalaryChange(e, 'min')}
                                    className="w-24 pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                    placeholder="Min"
                                />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="3000"
                                    value={salaryRange.max}
                                    onChange={(e) => handleSalaryChange(e, 'max')}
                                    className="w-24 pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading and Error States */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a599c]"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                        {error}
                        {error.includes('Authentication') && (
                            <Link href="/login" className="block mt-2 text-blue-600 hover:underline">
                                Go to Login Page
                            </Link>
                        )}
                    </div>
                )}

                {/* Job Listings */}
                <main className="w-full">
                    {!loading && !error && (
                        <>
                            <div className="space-y-6">
                                {currentJobs.length > 0 ? (
                                    currentJobs.map((job) => (
                                        <div key={job.id} className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 group hover:border-[#3a599c]/20 backdrop-blur-sm">
                                            {/* Premium Gradient Border */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#3a599c]/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            
                                            {/* Floating Save Button */}
                                            <div className="absolute top-4 right-4 z-10">
                                                <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-all duration-300 group-hover:scale-110">
                                                    <BookmarkSimple size={20} weight="regular" />
                                                </button>
                                            </div>

                                            <div className="relative p-6">
                                                <div className="flex flex-col lg:flex-row gap-6">
                                                    {/* Left Content */}
                                                    <div className="flex-1 space-y-4">
                                                        {/* Header Section */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-2 flex-1">
                                                                <Link href={`/freelancer-dashboard/job-list/${job.id}`} className="block">
                                                                    <h3 className="text-xl font-bold text-gray-900 hover:text-[#3a599c] transition-colors duration-300 line-clamp-2 group-hover:text-[#2d477a]">
                                                                        {job.title}
                                                                    </h3>
                                                                </Link>
                                                                
                                                                {/* Job Tags */}
                                                                <div className="flex flex-wrap gap-2">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
                                                                        <Briefcase size={12} className="mr-1" />
                                                                        {job.jobType}
                                                                    </span>
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200">
                                                                        <Desktop size={12} className="mr-1" />
                                                                        {job.workMode}
                                                                    </span>
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200">
                                                                        <Star size={12} className="mr-1" />
                                                                        {job.experience}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Meta Information */}
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                                <Clock size={16} className="text-[#3a599c]" />
                                                                <span className="font-medium">{job.posted}</span>
                                                            </div>
                                                            
                                                            {job.verified && (
                                                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                                                                    <CheckCircle size={16} className="text-green-600" />
                                                                    <span className="font-medium text-green-700">Verified Client</span>
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                                <MapPin size={16} className="text-[#3a599c]" />
                                                                <span className="font-medium">{job.location}</span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg">
                                                                <span className="font-bold text-yellow-600">{job.rating}</span>
                                                                <Star size={16} weight="fill" className="text-yellow-500" />
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        <div className="bg-gray-50/80 rounded-xl p-4">
                                                            <p className="text-gray-700 leading-relaxed line-clamp-3">
                                                                {job.description}
                                                            </p>
                                                        </div>

                                                        {/* Bottom Section */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                                            {/* Pricing & Proposals */}
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <CurrencyDollar size={18} className="text-[#3a599c]" />
                                                                        <span className="text-2xl font-bold text-gray-900">{job.price}</span>
                                                                        <span className="text-sm text-gray-500">{job.priceType}</span>
                                                                    </div>
                                                                </div>
                                                              
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex gap-3">
                                                                <Link
                                                                    href={`/freelancer-dashboard/job-list/${job.id}`}
                                                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm"
                                                                >
                                                                    <Eye size={16} />
                                                                    View Details
                                                                </Link>
                                                                <button
                                                                    onClick={() => applyForJob(job.id)}
                                                                    disabled={applying && applyingId === job.id}
                                                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-[#3a599c] to-[#1e3a5f] hover:from-[#2d477a] hover:to-[#0f1419] disabled:opacity-70 disabled:cursor-not-allowed"
                                                                >
                                                                    {applying && applyingId === job.id ? (
                                                                        'Applying...'
                                                                    ) : (
                                                                        <>
                                                                            <PaperPlaneTilt size={16} />
                                                                            Apply Now
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right Image Section */}
                                                    <div className="w-full lg:w-64 h-48 lg:h-52 relative rounded-xl overflow-hidden group/image">
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
                                                        <img
                                                            src={job.image}
                                                            alt={job.title}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            onError={(e) => {
                                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='208' viewBox='0 0 256 208'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f3f4f6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e5e7eb;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='256' height='208' fill='url(%23grad)'/%3E%3Ccircle cx='128' cy='80' r='20' fill='%239ca3af' opacity='0.5'/%3E%3Crect x='88' y='120' width='80' height='8' rx='4' fill='%239ca3af' opacity='0.5'/%3E%3Crect x='108' y='140' width='40' height='6' rx='3' fill='%239ca3af' opacity='0.3'/%3E%3C/svg%3E";
                                                            }}
                                                        />
                                                        
                                                        {/* Overlay Content */}
                                                        <div className="absolute bottom-3 left-3 right-3 z-20">
                                                            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                                                                <div className="text-xs font-medium text-gray-700 truncate">
                                                                    {job.salary}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Glow Effect */}
                                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#3a599c]/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Briefcase size={48} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-700 mb-3">No jobs found</h3>
                                        <p className="text-gray-500 max-w-md mx-auto">Try adjusting your filters or check back later for new opportunities. We're constantly adding new job listings!</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {currentJobs.length > 0 && (
                                <div className="mt-12 flex justify-center">
                                    <nav className="flex items-center gap-2 bg-white rounded-2xl shadow-lg p-2">
                                        <button
                                            onClick={() => paginate(1)}
                                            disabled={currentPage === 1}
                                            className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            <CaretDoubleLeft size={18} />
                                        </button>
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            <CaretLeft size={18} />
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                            <button
                                                key={number}
                                                onClick={() => paginate(number)}
                                                className={`min-w-[40px] h-10 rounded-xl font-semibold transition-all duration-300 ${
                                                    currentPage === number 
                                                        ? 'bg-gradient-to-r from-[#3a599c] to-[#1e3a5f] text-white shadow-lg scale-110' 
                                                        : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                                                }`}
                                            >
                                                {number}
                                            </button>
                                        ))}

                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages}
                                            className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            <CaretRight size={18} />
                                        </button>
                                        <button
                                            onClick={() => paginate(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                        >
                                            <CaretDoubleRight size={18} />
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Success Modal */}
            <SuccessModal />

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className="scroll-to-top-btn fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#3a599c] to-[#1e3a5f] text-white rounded-2xl shadow-2xl flex items-center justify-center opacity-0 transition-all duration-300 hover:scale-110 hover:shadow-3xl"
                aria-label="Scroll to top"
            >
                <CaretUp size={24} />
            </button>
        </>
    );
};

export default JobListingsPage;