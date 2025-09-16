"use client"
import { useState, useEffect, useRef } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Search,
    Heart,
    Star,
    MapPin,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    List,
    X,
    Minus,
    ArrowRight
} from 'lucide-react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import api from '../../../../../config/api';

const FreelancerGridPage = ({ serviceId: propServiceId, serviceName: propServiceName }) => {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const routeServiceId = params?.serviceId;

    // Use the serviceId from props if available, otherwise from params
    const serviceId = propServiceId || params?.serviceId;
    const categoryFromUrl = searchParams.get('category');
    const serviceNameFromUrl = searchParams.get('serviceName');

    // Use the serviceName from props if available, otherwise from URL
    const serviceName = propServiceName || serviceNameFromUrl;

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(6);
    const [salaryRange, setSalaryRange] = useState({ min: 0, max: 3000 });
    const [radius, setRadius] = useState(100);
    const [experienceLevel, setExperienceLevel] = useState({
        entry: false,
        intermediate: false,
        expert: false
    });
    const [isScrolled, setIsScrolled] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "All Categories");
    const [freelancers, setFreelancers] = useState([]);
    const [filteredFreelancers, setFilteredFreelancers] = useState([]);
    const [categories, setCategories] = useState(["All Categories"]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [allServices, setAllServices] = useState([]);

    // Primary color
    const primaryColor = '#3a599c';
    const primaryHover = '#2d477a';

    const toggleFilterModal = () => {
        setShowFilterModal(!showFilterModal);
    };

    const handleSalaryChange = (e, type) => {
        const value = parseInt(e.target.value);
        if (type === 'min') {
            setSalaryRange(prev => ({ ...prev, min: value }));
        } else {
            setSalaryRange(prev => ({ ...prev, max: value }));
        }
    };

    const toggleExperienceLevel = (level) => {
        setExperienceLevel(prev => ({
            ...prev,
            [level]: !prev[level]
        }));
    };

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                const response = await api.get('/getSiteData');
                setAllServices(response.data.se_list || []);
            } catch (error) {
                console.error('Error fetching site data:', error);
            }
        };

        fetchSiteData();
    }, []);

    useEffect(() => {
        const fetchFreelancersByService = async () => {
            try {
                setLoading(true);
                setError(null);

                // Validate serviceId
                if (!serviceId) {
                    setLoading(false);
                    setError('Service ID is required');
                    return;
                }
                const numericServiceId = typeof serviceId === 'string' ? parseInt(serviceId) : serviceId;
                if (isNaN(numericServiceId)) {
                    setLoading(false);
                    setError('Invalid Service ID');
                    return;
                }
                console.log('Fetching service details for ID:', numericServiceId);

                // Find service details from allServices or fetch individually
                let service = null;
                let serviceSlug = '';

                if (allServices.length > 0) {
                    // Find service in the pre-fetched list
                    service = allServices.find(s => s.se_id === parseInt(serviceId));
                    if (service) {
                        serviceSlug = service.se_slug;
                        setServiceDetails(service);
                    }
                }

                // If service not found in pre-fetched list, fetch it individually
                // if (!service) {
                //     const serviceResponse = await api.get(`/getService/${serviceId}`);
                //     console.log('Service response:', serviceResponse.data);

                //     if (!serviceResponse.data || !serviceResponse.data.se_list) {
                //         throw new Error('Service not found');
                //     }

                //     service = serviceResponse.data.se_list;
                //     serviceSlug = service.se_slug;
                //     setServiceDetails(service);
                // }

              

                // Fetch freelancers for this service
                const freelancersResponse = await api.get(`/getServiceUser/${serviceSlug}/${serviceId}`);
                console.log('Freelancers response:', freelancersResponse.data);

                if (!freelancersResponse.data) {
                    console.warn('No freelancers data received');
                    setFreelancers([]);
                    setFilteredFreelancers([]);
                    return;
                }

                // Handle the response structure
                let freelancersList = [];

                if (freelancersResponse.data.fe_service_list && Array.isArray(freelancersResponse.data.fe_service_list)) {
                    freelancersList = freelancersResponse.data.fe_service_list;
                } else if (freelancersResponse.data.fe_service_list) {
                    // If it's a single object, wrap it in an array
                    freelancersList = [freelancersResponse.data.fe_service_list];
                } else if (Array.isArray(freelancersResponse.data)) {
                    // If response is directly an array
                    freelancersList = freelancersResponse.data;
                } else {
                    console.warn('No fe_service_list found in response');
                    freelancersList = [];
                }

                console.log('Processing freelancers list:', freelancersList);

                const freelancerData = freelancersList.map((freelancer, index) => {
                    // Handle image URL properly
                    let imageUrl = "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face";

                    if (freelancer.fp_img) {
                        // Clean up the image path - remove duplicate filenames
                        let cleanImagePath = freelancer.fp_img;
                        if (cleanImagePath.includes('--')) {
                            cleanImagePath = cleanImagePath.split('--')[0];
                        }
                        // Remove leading slash if present
                        cleanImagePath = cleanImagePath.replace(/^\//, '');
                        imageUrl = `https://test.hyrelancer.in/${cleanImagePath}`;
                    }

                    return {
                        id: freelancer.fp_id || index,
                        name: freelancer.fp_display_name || freelancer.name || "Unknown",
                        location: freelancer.address || "Location not specified",
                        rating: 4.9, // Default rating since it's not in API
                        reviews: 482, // Default reviews count
                        hourlyRate: parseInt(freelancer.fp_amt_hour) || 20,
                        projects: 372, // Default projects count
                        skills: [service.se_name],
                        services: [parseInt(serviceId)],
                        verified: freelancer.fp_is_verify === "1",
                        image: imageUrl,
                        headline: freelancer.fp_headline || "",
                        description: freelancer.fp_desc || "",
                        experience: freelancer.fp_ex_year || "0",
                        occupation: freelancer.fp_occupation || "",
                        availability: freelancer.fp_available || "Available now",
                        completingTime: freelancer.fp_completing_time || "As per requirement"
                    };
                });

                console.log('Processed freelancer data:', freelancerData);

                setFreelancers(freelancerData);
                setFilteredFreelancers(freelancerData);

                // Extract categories from freelancer skills
                const uniqueCategories = [...new Set(freelancerData.flatMap(f => f.skills))];
                setCategories(["All Categories", ...uniqueCategories]);

            } catch (error) {
                console.error('Error fetching freelancers:', error);
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    config: error.config
                });

                let errorMessage = 'Failed to load freelancers';

                if (error.response?.status === 404) {
                    errorMessage = 'Service not found or no freelancers available for this service';
                } else if (error.response?.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (error.message.includes('Network Error')) {
                    errorMessage = 'Network error. Please check your connection.';
                } else {
                    errorMessage = error.message;
                }

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchFreelancersByService();
        } else {
            setLoading(false);
            setError('Service ID is missing');
        }
    }, [serviceId, allServices]);

    const getServiceSlug = (serviceId) => {
        const service = allServices.find(s => s.se_id === parseInt(serviceId));
        return service ? service.se_slug : '';
    };
    const displayServiceName = serviceName || serviceDetails?.se_name || 'Freelancers';


    useEffect(() => {
        const handleScroll = () => {
            const scrollToTopBtn = document.querySelector('.scroll-to-top-btn');
            if (window.scrollY > 300) {
                scrollToTopBtn?.classList.add('opacity-100');
            } else {
                scrollToTopBtn?.classList.remove('opacity-100');
            }

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

    const locations = [
        "City, State or Zip",
        "Las Vegas, USA",
        "Cape Town, South Africa",
        "Sydney, Australia",
        "Tokyo, Japan",
    ];

    const [location, setLocation] = useState(locations[0]);
    const [openCategory, setOpenCategory] = useState(false);
    const [openLocation, setOpenLocation] = useState(false);

    const categoryRef = useRef(null);
    const locationRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setOpenCategory(false);
            }
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setOpenLocation(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter freelancers based on selected category
    useEffect(() => {
        if (selectedCategory === "All Categories") {
            setFilteredFreelancers(freelancers);
        } else {
            const filtered = freelancers.filter(freelancer =>
                freelancer.skills.some(skill =>
                    skill.toLowerCase().includes(selectedCategory.toLowerCase())
                )
            );
            setFilteredFreelancers(filtered);
        }
        setCurrentPage(1); // Reset to first page when filter changes
    }, [selectedCategory, freelancers]);

    // Pagination logic
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentFreelancers = filteredFreelancers.slice(indexOfFirstCard, indexOfLastCard);
    const totalPages = Math.ceil(filteredFreelancers.length / cardsPerPage);

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

    const handleViewProfile = (freelancer) => {
        // Navigate to freelancer profile page using the freelancer's ID
        router.push(`/freelancer/${freelancer.id}?name=${encodeURIComponent(freelancer.name)}`);
      };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a599c] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading freelancers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="mb-4">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                        <p className="text-red-500 mb-4">{error}</p>
                        <div className="text-sm text-gray-600 mb-6">
                            <p>Service ID: {serviceId}</p>
                            <p>Service Name: {serviceName || 'Not provided'}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button
                            className="w-full px-4 py-2 bg-[#3a599c] text-white rounded-lg hover:bg-[#2d477a] transition-colors"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                        <button
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            onClick={() => router.back()}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <section className="breadcrumb relative">
                <div className="absolute inset-0">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900"></div>
                </div>

                <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">

                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 lg:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Mobile Filter Button */}
                <button
                    onClick={toggleFilterModal}
                    className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#3a599c] text-white p-3 rounded-full shadow-lg flex items-center justify-center"
                    aria-label="Open filters"
                    style={{ backgroundColor: primaryColor }}
                >
                    <List size={24} />
                    <span className="ml-2 text-sm font-medium">Filters</span>
                </button>

                {/* Sidebar - Desktop */}
                <aside className="hidden lg:block w-full lg:w-1/4 bg-white p-6 rounded-xl shadow-sm h-fit sticky top-4 border border-gray-100">
                    <div className="space-y-6">
                        {/* Search */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Search</h3>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] text-sm"
                                    placeholder="Job title, key words or company"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Location</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select location</option>
                                    <option value="Africa">Africa</option>
                                    <option value="Americas">Americas</option>
                                    <option value="Antarctica">Antarctica</option>
                                    <option value="Asia">Asia</option>
                                    <option value="Europe">Europe</option>
                                    <option value="Oceania">Oceania</option>
                                    <option value="Australia and New Zealand">Australia and New Zealand</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                      

                        {/* Job Types */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Job Types</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select job types</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="On-site">On-site</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Temporary">Temporary</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>



                        {/* Salary Filter */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Filter by Salary</h3>
                            <div className="flex justify-between mt-4 gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                    <input
                                        type="number"
                                        value={salaryRange.min}
                                        onChange={(e) => handleSalaryChange(e, 'min')}
                                        min="0"
                                        max={salaryRange.max}
                                        className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">min</span>
                                </div>
                                <Minus size={20} className="text-gray-400 mt-2" />
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                    <input
                                        type="number"
                                        value={salaryRange.max}
                                        onChange={(e) => handleSalaryChange(e, 'max')}
                                        min={salaryRange.min}
                                        max="3000"
                                        className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">max</span>
                                </div>
                            </div>
                        </div>

                        

                        {/* Work Time */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-3 text-gray-800">Work Time</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select Work Time</option>
                                    <option value="In a Week">In a Week</option>
                                    <option value="24 Hours">24 Hours</option>
                                    <option value="After 2 Days">After 2 Days</option>
                                    <option value="Tomorrow">Tomorrow</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-3 text-gray-800">Experience</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select Experience</option>
                                    <option value="0-To 1-Year">0 To 1 Year</option>
                                    <option value="2-To-5-Year">2 To 5 Year</option>
                                    <option value="5-To-10-Year">5 To 10 Year</option>
                                    <option value="10-Year">More Than 10 Year</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>


                        {/* Find Candidates Button */}
                        <button
                            className="w-full py-3 text-white rounded-lg font-medium transition-colors shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Find Candidates
                        </button>
                    </div>
                </aside>

                {/* Freelancer Cards Grid */}
                <main className="w-full lg:w-3/4">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600 text-sm">
                                Sort by: <select className="ml-1 text-gray-800 font-medium border-none bg-transparent focus:outline-none">
                                    <option>Default</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Rating</option>
                                </select>
                            </span>
                        </div>
                        <div className="text-gray-600 text-sm">
                            Showing {indexOfFirstCard + 1}-{Math.min(indexOfLastCard, filteredFreelancers.length)} of {filteredFreelancers.length} results
                            {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
                        </div>
                    </div>

                    {/* Freelancer Cards Grid */}
                    {filteredFreelancers.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {currentFreelancers.map((freelancer) => (
                                    <div key={freelancer.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                                        <div className="p-6">
                                            {/* Header with Profile Image and Favorite */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img
                                                            src={freelancer.image}
                                                            alt={freelancer.name}
                                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                                                           
                                                        />
                                                        {freelancer.verified && (
                                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#3a599c] rounded-full flex items-center justify-center">
                                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                                            {freelancer.name}
                                                            {freelancer.verified && (
                                                                <span className="text-[#3a599c] text-sm">✓</span>
                                                            )}
                                                        </h3>
                                                        {freelancer.occupation && (
                                                            <p className="text-sm text-gray-500 capitalize">{freelancer.occupation}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <Heart size={20} />
                                                </button>
                                            </div>

                                            {/* Location and Rating */}
                                            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={16} />
                                                    <span>{freelancer.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star size={16} fill="currentColor" className="text-yellow-400" />
                                                    <span className="text-gray-800 font-medium">{freelancer.rating}</span>
                                                    <span>({freelancer.reviews} reviews)</span>
                                                </div>
                                            </div>

                                            {/* Skills */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {freelancer.skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Experience and Availability */}
                                            <div className="flex items-center justify-between mb-4 text-sm">
                                                <div className="text-gray-600">
                                                    <span className="font-semibold text-gray-800">{freelancer.experience}</span> years experience
                                                </div>
                                                <div className="text-green-600 font-medium">
                                                    {freelancer.availability}
                                                </div>
                                            </div>

                                            {/* Headline */}
                                            {freelancer.headline && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                    {freelancer.headline}
                                                </p>
                                            )}

                                            {/* Projects and Rate */}
                                            <div className="flex items-center justify-between mb-6">

                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-800">
                                                        ${freelancer.hourlyRate}
                                                        <span className="text-sm font-normal text-gray-600">/Hour</span>
                                                    </div>
                                                    {freelancer.completingTime && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Delivery: {freelancer.completingTime}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* View Profile Button */}
                                            <button
                                                onClick={() => handleViewProfile(freelancer)}
                                                className="w-full py-3 border-2 border-[#3a599c] text-[#3a599c] hover:bg-[#3a599c] hover:text-white transition-colors rounded-lg font-medium"
                                                style={{ borderColor: primaryColor }}
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center">
                                    <nav className="flex items-center gap-1">
                                        <button
                                            onClick={() => paginate(1)}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronsLeft size={18} />
                                        </button>
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>

                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let pageNumber;
                                            if (totalPages <= 5) {
                                                pageNumber = i + 1;
                                            } else {
                                                if (currentPage <= 3) {
                                                    pageNumber = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNumber = totalPages - 4 + i;
                                                } else {
                                                    pageNumber = currentPage - 2 + i;
                                                }
                                            }

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => paginate(pageNumber)}
                                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md ${currentPage === pageNumber ? 'bg-[#3a599c] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                                    style={currentPage === pageNumber ? { backgroundColor: primaryColor } : {}}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                        <button
                                            onClick={() => paginate(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronsRight size={18} />
                                        </button>
                                    </nav>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No freelancers found</h3>
                            <p className="text-gray-600 mb-4">
                                {selectedCategory !== "All Categories"
                                    ? `No freelancers found in ${selectedCategory}. Try a different category.`
                                    : "No freelancers available for this service at the moment."
                                }
                            </p>
                            <button
                                className="px-4 py-2 bg-[#3a599c] text-white rounded-lg hover:bg-[#2d477a] transition-colors"
                                onClick={() => setSelectedCategory("All Categories")}
                            >
                                View All Categories
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile Filter Modal */}
            {showFilterModal && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
                    <div className="bg-white rounded-t-xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button
                                onClick={toggleFilterModal}
                                className="text-gray-500 hover:text-gray-700 p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Mobile Search */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Search</h3>
                                <div className="relative">
                                    <Search
                                        size={20}
                                        className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                                    />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] text-sm"
                                        placeholder="Job title, key words or company"
                                    />
                                </div>
                            </div>

                            {/* Mobile Location Dropdown */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Location</h3>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]">
                                        <option>Select location</option>
                                        <option>Africa</option>
                                        <option>Americas</option>
                                        <option>Asia</option>
                                        <option>Europe</option>
                                        <option>Oceania</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Mobile Category */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Category</h3>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            {/* Mobile Salary Filter */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Filter by Salary</h3>
                                <div className="flex justify-between mt-4 gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                        <input
                                            type="number"
                                            value={salaryRange.min}
                                            onChange={(e) => handleSalaryChange(e, 'min')}
                                            min="0"
                                            max={salaryRange.max}
                                            className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">min</span>
                                    </div>
                                    <Minus size={20} className="text-gray-400 mt-2" />
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                        <input
                                            type="number"
                                            value={salaryRange.max}
                                            onChange={(e) => handleSalaryChange(e, 'max')}
                                            min={salaryRange.min}
                                            max="3000"
                                            className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">max</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Experience Level */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Experience Level</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={experienceLevel.entry}
                                            onChange={() => toggleExperienceLevel('entry')}
                                            className="w-4 h-4 text-[#3a599c] border-gray-300 rounded focus:ring-[#3a599c]"
                                        />
                                        <span className="text-sm text-gray-700">Entry Level</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={experienceLevel.intermediate}
                                            onChange={() => toggleExperienceLevel('intermediate')}
                                            className="w-4 h-4 text-[#3a599c] border-gray-300 rounded focus:ring-[#3a599c]"
                                        />
                                        <span className="text-sm text-gray-700">Intermediate</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={experienceLevel.expert}
                                            onChange={() => toggleExperienceLevel('expert')}
                                            className="w-4 h-4 text-[#3a599c] border-gray-300 rounded focus:ring-[#3a599c]"
                                        />
                                        <span className="text-sm text-gray-700">Expert</span>
                                    </label>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white pt-4 pb-2">
                                <button
                                    onClick={toggleFilterModal}
                                    className="w-full py-3 text-white rounded-lg transition font-medium"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className="scroll-to-top-btn fixed bottom-8 right-8 w-12 h-12 bg-[#3a599c] text-white rounded-full shadow-lg flex items-center justify-center opacity-0 transition-opacity duration-300 hover:bg-[#2d477a]"
                style={{ backgroundColor: primaryColor }}
                aria-label="Scroll to top"
            >
                <ChevronUp size={24} />
            </button>
        </div>
    );
};

export default FreelancerGridPage;