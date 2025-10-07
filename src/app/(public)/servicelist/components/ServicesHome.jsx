"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Star, Heart, ChevronDown, Search, Filter, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ServicesHome = () => {
    const router = useRouter();
    // State management
    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubcategory, setActiveSubcategory] = useState(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('popular');
    const [visibleElements, setVisibleElements] = useState(new Set());
    const [isInitialized, setIsInitialized] = useState(false);
    const [apiData, setApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Refs
    const tabRefs = useRef({});
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const tabsRef = useRef(null);
    const cardsRef = useRef([]);

    // Fetch API data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch('https://hyre.hyrelancer.com/api/getSiteData');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();
                setApiData(data);
                
                // Set the first category as active by default
                if (data.se_list && data.se_list.length > 0) {
                    // Find the first valid category (skip "Other")
                    const firstValidCategory = data.se_list.find(service => service.se_name !== "Other");
                    if (firstValidCategory) {
                        setActiveCategory(firstValidCategory.se_ca_id.toString());
                    }
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Extract unique categories from API data
    const getCategoriesFromApi = () => {
        if (!apiData || !apiData.se_list) return [];
        
        const categoriesMap = new Map();
        
        apiData.se_list.forEach(service => {
            // Skip the "Other" category
            if (service.se_name === "Other") return;
            
            if (!categoriesMap.has(service.se_ca_id)) {
                categoriesMap.set(service.se_ca_id, {
                    id: service.se_ca_id,
                    name: `Category ${service.se_ca_id}`, // You might need to adjust this based on actual API structure
                    subcategories: new Map()
                });
            }
            
            // Add subcategories
            if (service.se_sc_id && !categoriesMap.get(service.se_ca_id).subcategories.has(service.se_sc_id)) {
                categoriesMap.get(service.se_ca_id).subcategories.set(
                    service.se_sc_id, 
                    `Subcategory ${service.se_sc_id}` // You might need to adjust this based on actual API structure
                );
            }
        });
        
        return Array.from(categoriesMap.values()).map(cat => ({
            ...cat,
            subcategories: Array.from(cat.subcategories.values())
        }));
    };

    // Get services for the current category
    const getServicesForCurrentCategory = () => {
        if (!apiData || !apiData.se_list || !activeCategory) return [];
        
        return apiData.se_list.filter(service => {
            // Skip the "Other" category
            if (service.se_name === "Other") return false;
            
            return service.se_ca_id.toString() === activeCategory;
        });
    };

    // Get subcategories for the current category
    const getSubcategoriesForCurrentCategory = () => {
        if (!apiData || !apiData.se_list || !activeCategory) return [];
        
        const subcategoriesMap = new Map();
        
        apiData.se_list.forEach(service => {
            // Skip the "Other" category and services not in current category
            if (service.se_name === "Other" || service.se_ca_id.toString() !== activeCategory) return;
            
            if (service.se_sc_id && !subcategoriesMap.has(service.se_sc_id)) {
                subcategoriesMap.set(
                    service.se_sc_id, 
                    `Subcategory ${service.se_sc_id}` // You might need to adjust this based on actual API structure
                );
            }
        });
        
        return Array.from(subcategoriesMap.values());
    };

    // Filter services based on active category, subcategory, and search query
    const filteredServices = getServicesForCurrentCategory().filter(service => {
        const matchesSubcategory = activeSubcategory ? service.se_sc_id.toString() === activeSubcategory : true;
        const matchesSearch = service.se_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (service.se_desc && service.se_desc.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return matchesSubcategory && matchesSearch;
    });

    // Sort services based on selected option
    const sortedServices = [...filteredServices].sort((a, b) => {
        switch(sortOption) {
            case 'popular':
                // Using se_id as a placeholder for popularity
                return b.se_id - a.se_id;
            case 'rating':
                // Placeholder rating logic
                return (b.se_id % 5) - (a.se_id % 5);
            case 'price-low':
                // Placeholder price logic
                return a.se_id - b.se_id;
            case 'price-high':
                // Placeholder price logic
                return b.se_id - a.se_id;
            case 'delivery':
                // Placeholder delivery time logic
                return (a.se_id % 7) - (b.se_id % 7);
            default:
                return 0;
        }
    });

    // Initialize after component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialized(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        if (!isInitialized) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleElements((prev) => new Set([...prev, entry.target.dataset.animateId]));
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px',
            }
        );

        if (headerRef.current) observer.observe(headerRef.current);
        
        const subheaderEl = document.querySelector('[data-animate-id="subheader"]');
        if (subheaderEl) observer.observe(subheaderEl);

        if (tabsRef.current) observer.observe(tabsRef.current);

        cardsRef.current.forEach((card) => {
            if (card) observer.observe(card);
        });

        return () => observer.disconnect();
    }, [isInitialized, filteredServices]);

    // Update tab indicator
    useEffect(() => {
        const updateIndicator = () => {
            if (!activeCategory) return;
            
            const activeButton = tabRefs.current[activeCategory];
            const container = containerRef.current;

            if (activeButton && container) {
                const containerRect = container.getBoundingClientRect();
                const buttonRect = activeButton.getBoundingClientRect();

                setIndicatorStyle({
                    left: buttonRect.left - containerRect.left,
                    width: buttonRect.width
                });
            }
        };

        const timer = setTimeout(updateIndicator, 10);
        window.addEventListener('resize', updateIndicator);
        return () => {
            window.removeEventListener('resize', updateIndicator);
            clearTimeout(timer);
        };
    }, [activeCategory]);

    // Reset animations when category changes
    useEffect(() => {
        setVisibleElements(prev => {
            const newSet = new Set(prev);
            if (prev.has('header')) newSet.add('header');
            if (prev.has('subheader')) newSet.add('subheader');
            if (prev.has('tabs')) newSet.add('tabs');
            
            return newSet;
        });
    }, [activeCategory, activeSubcategory]);

    // Handle view service click
    const handleViewService = (service) => {
        // Navigate to freelancer list for this service
        router.push(`/servicelist/${service.se_id}/freelancers?serviceName=${encodeURIComponent(service.se_name)}&serviceId=${service.se_id}`);
      };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e5a9a] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading services...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500">Error: {error}</p>
                    <button 
                        className="mt-4 px-4 py-2 bg-[#3e5a9a] text-white rounded-lg hover:bg-[#2d4475] transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Get categories from API
    const categories = getCategoriesFromApi();

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1
                        ref={headerRef}
                        data-animate-id="header"
                        className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-all duration-700 ease-out ${
                            visibleElements.has('header')
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '100ms' }}
                    >
                        Featured Services
                    </h1>
                    <p
                        data-animate-id="subheader"
                        className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 ease-out ${
                            visibleElements.has('subheader')
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '250ms' }}
                    >
                        Discover our professional services designed to help your business grow
                    </p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3e5a9a] focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            
                            
                            {isSubcategoryOpen && activeCategory && (
                                <div className="absolute z-10 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200">
                                    <div className="py-1">
                                        <button
                                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${!activeSubcategory ? 'bg-blue-50 text-[#3e5a9a]' : 'text-gray-700'}`}
                                            onClick={() => {
                                                setActiveSubcategory(null);
                                                setIsSubcategoryOpen(false);
                                            }}
                                        >
                                            All Subcategories
                                        </button>
                                        {getSubcategoriesForCurrentCategory().map((subcat, index) => (
                                            <button
                                                key={index}
                                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${activeSubcategory === subcat ? 'bg-blue-50 text-[#3e5a9a]' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    setActiveSubcategory(subcat);
                                                    setIsSubcategoryOpen(false);
                                                }}
                                            >
                                                {subcat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="relative">
                            <select
                                className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3e5a9a] focus:border-transparent text-sm font-medium text-gray-700"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="delivery">Fastest Delivery</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                {categories.length > 0 && (
                    <div 
                        ref={tabsRef}
                        data-animate-id="tabs"
                        className={`flex justify-center mb-8 transition-all duration-700 ease-out ${
                            visibleElements.has('tabs') 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '400ms' }}
                    >
                        {/* Mobile Dropdown */}
                        <div className="sm:hidden relative w-full">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3e5a9a]"
                            >
                                <span className="font-medium text-gray-900">
                                    {activeCategory ? `Category ${activeCategory}` : 'Select Category'}
                                </span>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setActiveCategory(category.id.toString());
                                                setActiveSubcategory(null);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                                activeCategory === category.id.toString() ? 'bg-blue-50 text-[#3e5a9a] font-medium' : 'text-gray-900'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Desktop Tabs */}
                        <div className="hidden sm:block relative overflow-x-auto w-full">
                            <div
                                ref={containerRef}
                                className="flex space-x-4 md:space-x-8 lg:space-x-12 px-4 md:px-0"
                            >
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        ref={(el) => (tabRefs.current[category.id] = el)}
                                        onClick={() => {
                                            setActiveCategory(category.id.toString());
                                            setActiveSubcategory(null);
                                        }}
                                        className={`pb-4 font-medium transition-all duration-200 whitespace-nowrap text-sm md:text-base ${
                                            activeCategory === category.id.toString()
                                                ? 'text-gray-900'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>

                            {/* Full width underline */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>

                            {/* Blue active indicator */}
                            {activeCategory && (
                                <div
                                    className="absolute bottom-0 h-0.5 bg-[#3e5a9a] transition-all duration-300 ease-in-out"
                                    style={{
                                        left: `${indicatorStyle.left}px`,
                                        width: `${indicatorStyle.width}px`
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Results count */}
                <div className="mb-6 px-4 md:px-0">
                    <p className="text-gray-600">
                        Showing {sortedServices.length} {sortedServices.length === 1 ? 'service' : 'services'} 
                        {activeSubcategory ? ` in Subcategory ${activeSubcategory}` : ''}
                    </p>
                </div>

                {/* Service Cards Grid */}
                {sortedServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sortedServices.map((service, index) => (
                            <div 
                                key={service.se_id}
                                ref={(el) => (cardsRef.current[index] = el)}
                                data-animate-id={`card-${service.se_id}`}
                                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-700 ease-out flex flex-col ${
                                    visibleElements.has(`card-${service.se_id}`) 
                                        ? 'opacity-100 translate-y-0' 
                                        : 'opacity-0 translate-y-12'
                                }`}
                                style={{
                                    transitionDelay: `${index * 100}ms`
                                }}
                            >
                                {/* Service Image */}
                                <div className="relative h-48 w-full bg-gradient-to-br from-purple-500 to-blue-600">
                                    {service.se_img ? (
                                        <Image
                                            src={`https://hyre.hyrelancer.com/${service.se_img}`}
                                            alt={service.se_name}
                                            fill
                                            className="w-full h-full object-cover"
                                            priority={index < 4}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white">
                                            <span className="text-lg font-semibold">No Image</span>
                                        </div>
                                    )}
                                    <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow z-10">
                                        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                                    </button>
                                    
                                   
                                </div>

                                {/* Service Content */}
                                <div className="p-4 flex-grow flex flex-col">
                                    {/* Category */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subcategory {service.se_sc_id}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-medium text-gray-700">4.5</span>
                                            <span className="text-xs text-gray-500">(25)</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                                        {service.se_name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {service.se_desc || 'No description available'}
                                    </p>

                                   

                                </div>

                                {/* View Button */}
                                <button 
                                    onClick={() => handleViewService(service)}
                                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-[#3e5a9a] font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    View Service
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-600">
                            Try adjusting your search or filter criteria
                        </p>
                        <button 
                            className="mt-4 px-4 py-2 bg-[#3e5a9a] text-white rounded-lg hover:bg-[#2d4475] transition-colors"
                            onClick={() => {
                                setSearchQuery('');
                                setActiveSubcategory(null);
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesHome;