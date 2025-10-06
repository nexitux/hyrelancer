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
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import LoginModal from '@/components/LoginModal/LoginModal';

const FreelancerGridPage = () => {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');
    const { user, isAuthenticated, userType } = useSelector(state => state.auth);
    
    // Debug logging
    console.log('🔍 UserList Debug:', {
        isAuthenticated,
        userType,
        user: user?.name,
        userTypeFromUser: user?.userType
    });
    
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
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

    const freelancers = [
        {
            id: 1,
            name: "Devon Lane",
            location: "Las Vegas, USA",
            rating: 4.9,
            reviews: 482,
            hourlyRate: 22,
            projects: 372,
            skills: ["Graphic & Design", "UX/UI"],
            verified: true,
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        {
            id: 2,
            name: "Guy Hawkins",
            location: "Cape Town, South Africa",
            rating: 4.9,
            reviews: 482,
            hourlyRate: 23,
            projects: 372,
            skills: ["Graphic & Design", "Figma"],
            verified: false,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            id: 3,
            name: "Kristin Watson",
            location: "Rio de Janeiro, Brazil",
            rating: 4.9,
            reviews: 482,
            hourlyRate: 32,
            projects: 372,
            skills: ["Development", "Programming"],
            verified: true,
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        {
            id: 4,
            name: "Robert Fox",
            location: "Sydney, Australia",
            rating: 4.9,
            reviews: 482,
            hourlyRate: 18,
            projects: 372,
            skills: ["Digital Marketing", "Video Editor"],
            verified: false,
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        {
            id: 5,
            name: "Dianne Russell",
            location: "Tokyo, Japan",
            rating: 4.9,
            reviews: 482,
            hourlyRate: 35,
            projects: 372,
            skills: ["UI/UX Design", "Web Design"],
            verified: true,
            image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face"
        },
        {
            id: 6,
            name: "Theresa Webb",
            location: "Paris, France",
            rating: 4.9,
            reviews: 482,
            hourlyRate: 28,
            projects: 372,
            skills: ["Writing", "Marketing"],
            verified: false,
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
        },
        {
            id: 7,
            name: "Jacob Jones",
            location: "Berlin, Germany",
            rating: 4.8,
            reviews: 356,
            hourlyRate: 30,
            projects: 298,
            skills: ["Development", "React"],
            verified: true,
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
        },
        {
            id: 8,
            name: "Jenny Wilson",
            location: "Toronto, Canada",
            rating: 4.7,
            reviews: 423,
            hourlyRate: 25,
            projects: 189,
            skills: ["Writing", "Content Writing"],
            verified: false,
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
        }
    ];

    const categories = [
        "All Categories",
        "Graphic & Design",
        "Writing",
        "Digital Marketing",
        "Development",
        "UI/UX Design"
    ];
    
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
    const filteredFreelancers = selectedCategory === "All Categories" 
        ? freelancers 
        : freelancers.filter(freelancer => 
            freelancer.skills.some(skill => 
                skill.toLowerCase().includes(selectedCategory.toLowerCase())
            )
        );

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

    const handleViewProfile = (freelancerId) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        
        // Check if user is a customer (case-insensitive) - check both Redux state and user object
        const currentUserType = userType || user?.userType;
        if (currentUserType?.toLowerCase() !== 'customer') {
            alert('Only customers can view freelancer profiles.');
            return;
        }
        
        // Navigate to profile page
        window.location.href = `/profileView/${freelancerId}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb */}
            <section className="breadcrumb relative">
                <div className="absolute inset-0">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900"></div>
                </div>

                <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
                    <div className="max-w-4xl">
                        <div className="flex items-center text-white text-sm mb-2">
                            <a href="/" className="hover:underline">Home</a>
                            <span className="mx-2 opacity-40">/</span>
                            <span>For Candidates</span>
                            <span className="mx-2 opacity-40">/</span>
                            <span className="opacity-60">Freelancers</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 lg:mb-6">
                            {selectedCategory === "All Categories" 
                                ? "Find Freelancers" 
                                : `Find ${selectedCategory} Freelancers`
                            }
                        </h1>

                        <form className="w-full max-w-full sm:max-w-4xl bg-white rounded-lg shadow p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0">
                            <div className="flex items-center px-3 sm:px-4 w-full border-b sm:border-b-0 sm:border-r border-gray-300 relative">
                                <Search
                                    size={20}
                                    className="text-gray-400 absolute left-3 pointer-events-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Job title, key words or company"
                                    className="w-full pl-10 py-2 sm:py-3 text-sm sm:text-base focus:outline-none"
                                />
                            </div>

                            <div
                                className="relative w-full sm:w-40 md:w-48 h-10 sm:h-12 flex items-center justify-between px-3 sm:px-4 border-b sm:border-b-0 sm:border-r border-gray-300 cursor-pointer"
                                onClick={() => setOpenLocation((v) => !v)}
                                ref={locationRef}
                            >
                                <span className="text-gray-800 text-sm sm:text-base truncate pr-2">
                                    {location}
                                </span>
                                <ChevronDown size={16} className="text-gray-400" />
                                {openLocation && (
                                    <ul className="absolute left-0 top-full mt-1 bg-white text-gray-900 rounded-lg shadow-lg w-full sm:w-40 md:w-48 max-h-60 overflow-y-auto z-50">
                                        {locations.map((item) => (
                                            <li
                                                key={item}
                                                className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-xs sm:text-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLocation(item);
                                                    setOpenLocation(false);
                                                }}
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div
                                className="relative w-full sm:w-40 md:w-48 h-10 sm:h-12 flex items-center justify-between px-3 sm:px-4 border-b sm:border-b-0 border-gray-300 cursor-pointer"
                                onClick={() => setOpenCategory((v) => !v)}
                                ref={categoryRef}
                            >
                                <span className="text-gray-800 text-sm sm:text-base truncate pr-2">
                                    {selectedCategory}
                                </span>
                                <ChevronDown size={16} className="text-gray-400" />
                                {openCategory && (
                                    <ul className="absolute left-0 top-full mt-1 bg-white text-gray-900 rounded-lg shadow-lg w-full sm:w-40 md:w-48 max-h-60 overflow-y-auto z-50">
                                        {categories.map((item) => (
                                            <li
                                                key={item}
                                                className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-xs sm:text-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCategory(item);
                                                    setOpenCategory(false);
                                                }}
                                            >
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="bg-[#3a599c] hover:bg-[#2d477a] text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-sm text-sm sm:text-base w-full sm:w-auto"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Search
                            </button>
                        </form>
                    </div>
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

                        {/* Category */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Category</h3>
                            <div className="relative">
                                <select 
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all"
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

                        {/* Service */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Service</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select Service</option>
                                    <option value="Male">Make Up</option>
                                    <option value="Female">Figma </option>
                                    <option value="Other">Logo</option>
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

                        {/* Age Range */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Age: <span className="text-[#3a599c]">0 - 60 Years Old</span></h3>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="60"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} 50%, #e5e7eb 50%, #e5e7eb 100%)`
                                    }}
                                />
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

                        {/* Hourly Rate Filter */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Filter by Hourly</h3>
                            <div className="flex justify-between mt-4 gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">min</span>
                                </div>
                                <Minus size={20} className="text-gray-400 mt-2" />
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="3000"
                                        className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">max</span>
                                </div>
                            </div>
                        </div>

                        {/* Experience Level */}
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

                        {/* Qualification */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Qualification</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select Qualification</option>
                                    <option value="High School">High School</option>
                                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                                    <option value="Master's Degree">Master's Degree</option>
                                    <option value="PhD">Other</option>
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

                    {/* Authentication Status Banner */}
                    {!isAuthenticated && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-blue-600 font-semibold text-sm">🔐</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-800">
                                        Please log in to view freelancer profiles
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        Only customers can access detailed freelancer profiles
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {isAuthenticated && (userType || user?.userType)?.toLowerCase() !== 'customer' && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-yellow-600 font-semibold text-sm">⚠️</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">
                                        Only customers can view freelancer profiles
                                    </p>
                                    <p className="text-xs text-yellow-600">
                                        Your account type: {userType || user?.userType}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {isAuthenticated && (userType || user?.userType)?.toLowerCase() === 'customer' && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-green-600 font-semibold text-sm">✅</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-green-800">
                                        Welcome, {user?.name || 'Customer'}!
                                    </p>
                                    <p className="text-xs text-green-600">
                                        You can view freelancer profiles and contact them
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

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
                                            <div className="flex gap-2 mb-4">
                                                {freelancer.skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Projects and Rate */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-semibold text-gray-800">{freelancer.projects}</span> Projects
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-800">
                                                        ${freelancer.hourlyRate}
                                                        <span className="text-sm font-normal text-gray-600">/Hours</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* View Profile Button */}
                                            <button
                                                onClick={() => handleViewProfile(freelancer.id)}
                                                disabled={isAuthenticated && (userType || user?.userType)?.toLowerCase() !== 'customer'}
                                                className="w-full py-3 border-2 border-[#3a599c] text-[#3a599c] hover:bg-[#3a599c] hover:text-white transition-colors rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{ borderColor: primaryColor }}
                                            >
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
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

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                        <button
                                            key={number}
                                            onClick={() => paginate(number)}
                                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md ${currentPage === number ? 'bg-[#3a599c] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                            style={currentPage === number ? { backgroundColor: primaryColor } : {}}
                                        >
                                            {number}
                                        </button>
                                    ))}

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
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No freelancers found</h3>
                            <p className="text-gray-600 mb-4">
                                {selectedCategory !== "All Categories" 
                                    ? `No freelancers found in ${selectedCategory}. Try a different category.`
                                    : "No freelancers match your search criteria."
                                }
                            </p>
                            <button 
                                className="px-4 py-2 bg-[#3a599c] text-white rounded-lg hover:bg-[#2d477a] transition-colors"
                                onClick={() => setSelectedCategory("All Categories")}
                            >
                                View All Freelancers
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
                                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]">
                                        <option>Select category</option>
                                        <option>Design & Creative</option>
                                        <option>Development</option>
                                        <option>Marketing</option>
                                        <option>Writing</option>
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

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={() => {
                    setShowLoginModal(false);
                    // Refresh the page or update state as needed
                }}
            />
        </div>
    );
};

export default FreelancerGridPage;