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
    User
} from '@phosphor-icons/react';
import Head from 'next/head';
import Link from 'next/link';

const JobListingsPage = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(5);
    const [salaryRange, setSalaryRange] = useState({ min: 0, max: 3000 });
    const [radius, setRadius] = useState(100);
    const [experienceLevel, setExperienceLevel] = useState({
        entry: false,
        intermediate: false,
        expert: false
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

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

    const handleRadiusChange = (e) => {
        setRadius(parseInt(e.target.value));
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

    const [jobItems, setJobItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState(["All Categories"]);
    const [locations, setLocations] = useState(["City, State or Zip"]);

    const [category, setCategory] = useState(categories[0]);
    const [location, setLocation] = useState(locations[0]);
    const [openCategory, setOpenCategory] = useState(false);
    const [openLocation, setOpenLocation] = useState(false);

    const categoryRef = useRef(null);
    const locationRef = useRef(null);
    const mobileMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setOpenCategory(false);
            }
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setOpenLocation(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setMobileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch jobs data
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                // TODO: Replace with your actual API endpoint
                // Example: const response = await fetch('https://backend.hyrelancer.in/api/jobs');
                const response = await fetch('/api/jobs');
                if (response.ok) {
                    const data = await response.json();
                    setJobItems(data.jobs || []);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                // Keep empty array if API fails
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Pagination logic
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobItems.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(jobItems.length / jobsPerPage);

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

    return (
        <>
            <Head>
                <title>Job Listings | Hyrelancer</title>
                <meta name="description" content="Browse job listings on Hyrelancer" />
                <link rel="icon" href="/assets/images/fav.png" />
            </Head>




            {/* Breadcrumb */}
            <section className="breadcrumb   relative">
                <div className="absolute inset-0 ">
                    <img
                        src="/images/breadcrumb_service.webp"
                        alt="Breadcrumb background"
                        className="w-full h-full object-cover "
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

                        <form className="w-full max-w-full sm:max-w-4xl bg-white rounded-lg shadow p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0">
                            <div className="flex items-center px-3 sm:px-4 w-full border-b sm:border-b-0 sm:border-r border-gray-300 relative">
                                <MagnifyingGlass
                                    size={20}
                                    className="text-gray-400 absolute left-3 pointer-events-none"
                                />
                                <input
                                    type="text"
                                    placeholder="Skill, Industry"
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
                                <CaretDown size={16} className="text-gray-400" />
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
                                    {category}
                                </span>
                                <CaretDown size={16} className="text-gray-400" />
                                {openCategory && (
                                    <ul className="absolute left-0 top-full mt-1 bg-white text-gray-900 rounded-lg shadow-lg w-full sm:w-40 md:w-48 max-h-60 overflow-y-auto z-50">
                                        {categories.map((item) => (
                                            <li
                                                key={item}
                                                className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-xs sm:text-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCategory(item);
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

                        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 mt-4 sm:mt-6 lg:mt-8">
                            <h2 className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Top Services:</h2>
                            <div className="flex flex-wrap gap-2">
                                {["Graphics", "Website", "Logo", "Development"].map((service) => (
                                    <span
                                        key={service}
                                        className="text-white border border-gray-300 hover:border-[#3a599c] hover:bg-white hover:text-[#3a599c] px-2 sm:px-3 py-1 rounded-sm text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>
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
                                    <MagnifyingGlass size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] text-sm"
                                    placeholder="Skill, Industry"
                                />
                            </div>
                        </div>

                        {/* Location Dropdown - Modern */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Location</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select location</option>
                                    <option value="Africa">Africa</option>
                                    <option value="Americas">Americas</option>
                                    <option value="Antarctica">Antarctica</option>
                                    <option value="Asia">Asia</option>
                                    <option value="Europe">Europe</option>
                                    <option value="Oceania">Oceania</option>
                                    <option value="Australia and New Zealand">Australia and New Zealand</option>
                                </select>
                            </div>
                        </div>

                        {/* Category Dropdown - Modern */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Category</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select category</option>
                                    <option value="Accounting & Consulting">Accounting & Consulting</option>
                                    <option value="Admin Support">Admin Support</option>
                                    <option value="Customer Service">Customer Service</option>
                                    <option value="Design & Creative">Design & Creative</option>
                                    <option value="Data Science & Analytics">Data Science & Analytics</option>
                                    <option value="Engineering & Architecture">Engineering & Architecture</option>
                                    <option value="IT & Networking">IT & Networking</option>
                                </select>
                            </div>
                        </div>

                        {/* Job Types Dropdown - Modern */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Job Types</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select job types</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Full Time">Full Time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="On-site">On-site</option>
                                    <option value="Part Time">Part Time</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Temporary">Temporary</option>
                                </select>
                            </div>
                        </div>

                        {/* Salary Filter */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-3 text-gray-800">Filter by Salary</h3>
                            <div className="mt-4">
                                <div className="relative h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="absolute h-2 bg-[#3a599c] rounded-full"
                                        style={{
                                            left: `₹{(salaryRange.min / 3000) * 100}%`,
                                            right: `₹{100 - (salaryRange.max / 3000) * 100}%`,
                                            backgroundColor: primaryColor
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-4 gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="3000"
                                            value={salaryRange.min}
                                            onChange={(e) => handleSalaryChange(e, 'min')}
                                            className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                            placeholder="Min"
                                        />
                                    </div>
                                    <div className="flex items-center px-2 text-gray-400">
                                        <Minus size={16} />
                                    </div>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="3000"
                                            value={salaryRange.max}
                                            onChange={(e) => handleSalaryChange(e, 'max')}
                                            className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hourly Filter */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Filter by Hourly</h3>
                            <div className="flex justify-between gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                        placeholder="Min"
                                    />
                                </div>
                                <div className="flex items-center px-2 text-gray-400">
                                    <Minus size={16} />
                                </div>
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Radius Filter */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-800">Radius</h3>
                                <span className="font-medium text-[#3a599c]">{radius}km</span>
                            </div>
                            <div className="mt-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={radius}
                                    onChange={handleRadiusChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    style={{ accentColor: primaryColor }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1km</span>
                                    <span>100km</span>
                                </div>
                            </div>
                        </div>

                        {/* Industry Dropdown - Modern */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Industry</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select industry</option>
                                    <option value="Development">Development</option>
                                    <option value="Management">Management</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Html & Css">Html & Css</option>
                                    <option value="Seo">Seo</option>
                                    <option value="Banking">Banking</option>
                                    <option value="Design Graphics">Design Graphics</option>
                                </select>
                            </div>
                        </div>

                        {/* Career Level Dropdown - Modern */}
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-800">Career Level</h3>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                    <option value="">Select career level</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Officer">Officer</option>
                                    <option value="Student">Student</option>
                                    <option value="Executive">Executive</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-3 text-gray-800">Experience Level</h3>
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

                        {/* Find Jobs Button */}
                        <button
                            className="w-full py-3 bg-[#3a599c] text-white rounded-lg font-medium transition-colors hover:bg-[#2d477a] shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Find Jobs
                        </button>

                        {/* Job Alert */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800">Job Alert</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]"
                                        placeholder="Title alert"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Frequency</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] transition-all">
                                            <option value="">Select frequency</option>
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Fortnightly">Fortnightly</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Biannually">Biannually</option>
                                            <option value="Annually">Annually</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    className="w-full py-2.5 bg-[#3a599c] text-white rounded-lg font-medium text-sm transition-colors hover:bg-[#2d477a]"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Save Job Alert
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Job Listings */}
                <main className="w-full lg:w-[950px]">
                    
                    <div className="space-y-4 sm:space-y-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a599c] mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading jobs...</p>
                                </div>
                            </div>
                        ) : currentJobs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Stack size={48} className="mx-auto" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No jobs found</h3>
                                <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
                            </div>
                        ) : (
                            currentJobs.map((job) => (
                            <div key={job.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    <div className="flex-1 p-4 sm:p-6">
                                        <Link href="/job-list" className="block text-lg font-semibold text-[#3a599c] hover:text-[#000000] transition">
                                            {job.title}
                                        </Link>
                                        <div className="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                            <div className="flex items-center gap-1 text-black">
                                                <CalendarBlank size={16} />
                                                <span>{job.posted}</span>
                                            </div>
                                            {job.verified && (
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle size={16} className="text-green-500" />
                                                    <span className='text-black'>Verified</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1 text-black">
                                                <MapPin size={16} />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-black">
                                                <span>{job.spent}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <span>{job.rating}</span>
                                                <Star size={16} weight="fill" />
                                            </div>
                                        </div>
                                        <p className="mt-3 sm:mt-4 text-gray-700 text-sm line-clamp-3 sm:line-clamp-4">
                                            {job.description}
                                        </p>
                                        <div className="mt-3 sm:mt-4 flex gap-2 flex-wrap">
                                            {job.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className={`text-xs font-medium px-3 py-1 rounded-full ₹{tag === 'Featured' ? 'bg-red-100 text-red-800' :
                                                        tag === 'Saled' ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <div className="text-xs sm:text-sm text-gray-500">
                                                    Proposals: <span className="font-semibold text-black">{job.proposals}</span>
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                                    <span className="font-semibold text-lg sm:text-xl text-gray-800">{job.price}</span>
                                                    <span className="ml-1">{job.priceType}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <Link
                                                    href="#"
                                                    className="inline-block px-4 sm:px-5 py-1.5 sm:py-2 text-white rounded-md text-xs sm:text-sm font-medium transition"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    Bid Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-64 h-48 md:h-auto relative">
                                        <img
                                            src={job.image}
                                            alt="Project"
                                            className="w-full h-full object-cover object-center"
                                        />
                                        <div className="absolute top-3 right-3 p-1 rounded-full bg-white/80">
                                            <button className="text-gray-600 hover:text-red-500 transition">
                                                <Heart size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && currentJobs.length > 0 && (
                        <div className="mt-6 sm:mt-8 flex justify-center">
                        <nav className="flex items-center gap-1">
                            <button
                                onClick={() => paginate(1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CaretDoubleLeft size={18} />
                            </button>
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CaretLeft size={18} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md ₹{currentPage === number ? 'bg-[#3a599c] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
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
                                <CaretRight size={18} />
                            </button>
                            <button
                                onClick={() => paginate(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CaretDoubleRight size={18} />
                            </button>
                        </nav>
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
                            {/* Search */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Search</h3>
                                <div className="relative">
                                    <MagnifyingGlass
                                        size={20}
                                        className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                                    />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c] text-sm"
                                        placeholder="Skill, Industry"
                                    />
                                </div>
                            </div>

                            {/* Location Dropdown */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Location</h3>
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]">
                                    <option>Select location</option>
                                    <option>Africa</option>
                                    <option>Americas</option>
                                    <option>Antarctica</option>
                                    <option>Asia</option>
                                    <option>Europe</option>
                                    <option>Oceania</option>
                                    <option>Australia and New Zealand</option>
                                </select>
                            </div>

                            {/* Category Dropdown */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Category</h3>
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]">
                                    <option>Select category</option>
                                    <option>Accounting & Consulting</option>
                                    <option>Admin Support</option>
                                    <option>Customer Service</option>
                                    <option>Design & Creative</option>
                                    <option>Data Science & Analytics</option>
                                    <option>Engineering & Architecture</option>
                                    <option>IT & Networking</option>
                                </select>
                            </div>

                            {/* Job Types Dropdown */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Job Types</h3>
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] focus:ring-2 focus:ring-[#3a599c] focus:border-[#3a599c]">
                                    <option>Select job types</option>
                                    <option>Freelance</option>
                                    <option>Full Time</option>
                                    <option>Internship</option>
                                    <option>On-site</option>
                                    <option>Part Time</option>
                                    <option>Remote</option>
                                    <option>Temporary</option>
                                </select>
                            </div>

                            {/* Salary Filter */}
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800">Filter by Salary</h3>
                                <div className="mt-4">
                                    <div className="relative h-2 bg-gray-200 rounded-full">
                                        <div
                                            className="absolute h-2 bg-[#3a599c] rounded-full"
                                            style={{
                                                left: `₹{(salaryRange.min / 3000) * 100}%`,
                                                right: `₹{100 - (salaryRange.max / 3000) * 100}%`,
                                                backgroundColor: primaryColor
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-4 gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
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
                                        <Minus size={20} className="text-gray-400" />
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₹</span>
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
                            </div>

                            {/* Experience Level */}
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
                <CaretUp size={24} />
            </button>
        </>
    );
};

export default JobListingsPage;