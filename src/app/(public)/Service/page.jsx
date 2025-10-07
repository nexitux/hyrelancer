"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Star, Heart, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import avatar from '../../../../public/images/service/avatar1.png';

const ServicesHome = () => {
    const [activeTab, setActiveTab] = useState('');
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
    const [visibleElements, setVisibleElements] = useState(new Set());
    const [isInitialized, setIsInitialized] = useState(false);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const tabRefs = useRef({});
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const tabsRef = useRef(null);
    const cardsRef = useRef([]);
    const moreButtonRef = useRef(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://hyre.hyrelancer.com/api/getSiteData');
                const data = await response.json();
                
                if (data && data.sc_list && data.se_list) {
                    // Set categories from sc_list
                    const transformedCategories = data.sc_list.map(category => ({
                        id: category.sc_id,
                        name: category.sc_name
                    }));
                    
                    // Add "All Services" option at the beginning
                    const allServicesCategory = { id: 'all', name: 'All Services' };
                    setCategories([allServicesCategory, ...transformedCategories]);
                    
                    // Set active tab to "All Services"
                    setActiveTab(allServicesCategory.name);
                    
                    // Transform services from se_list
                    const transformedServices = data.se_list.map((service, index) => {
                        // Find the category name for this service
                        const category = data.sc_list.find(cat => cat.sc_id === service.se_sc_id);
                        const categoryName = category ? category.sc_name : 'Other';
                        
                        // Generate a placeholder image based on service ID
                        const placeholderImage = `https://picsum.photos/400/300?random=${service.se_id}`;
                        
                        return {
                            id: service.se_id,
                            category: categoryName,
                            title: service.se_name || `${categoryName} service`,
                            description: service.se_desc || '',
                            rating: 4.5 + (Math.random() * 0.5), // Random rating between 4.5-5.0
                            reviews: Math.floor(Math.random() * 100) + 1, // Random reviews count
                            author: `User${service.se_id}`,
                            price: `₹${(Math.random() * 100 + 20).toFixed(2)}`,
                            image: service.se_img 
                                ? `https://hyre.hyrelancer.com/${service.se_img.split('--')[0]}`
                                : placeholderImage,
                            bgColor: 'bg-gradient-to-br from-blue-400 to-purple-500' // Default gradient
                        };
                    });
                    
                    setServices(transformedServices);
                }
            } catch (err) {
                console.error('Error fetching services:', err);
                setError('Failed to load services. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter services based on active tab
    const filteredServices = activeTab === 'All Services' 
        ? services 
        : services.filter(service => service.category === activeTab);

    // Get visible tabs (first 3 + "More" button)
    const visibleTabs = categories.slice(0, 3);
    const hiddenTabs = categories.slice(1);

    // Initialize after component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialized(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        if (!isInitialized || isLoading) return;

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
                rootMargin: '0px 0px -100px 0px', // Trigger when element is 100px from bottom of viewport
            }
        );

        // Observe header
        if (headerRef.current) {
            observer.observe(headerRef.current);
        }

        // Observe subheading
        const subheaderEl = document.querySelector('[data-animate-id="subheader"]');
        if (subheaderEl) {
            observer.observe(subheaderEl);
        }

        // Observe tabs
        if (tabsRef.current) {
            observer.observe(tabsRef.current);
        }

        // Observe cards
        cardsRef.current.forEach((card) => {
            if (card) {
                observer.observe(card);
            }
        });

        return () => observer.disconnect();
    }, [isInitialized, filteredServices, isLoading]);

    // Update tab indicator
    useEffect(() => {
        const updateIndicator = () => {
            const activeButton = tabRefs.current[activeTab];
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
        
        // Close dropdowns when clicking outside
        const handleClickOutside = (event) => {
            if (moreButtonRef.current && !moreButtonRef.current.contains(event.target)) {
                setIsMoreDropdownOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            window.removeEventListener('resize', updateIndicator);
            document.removeEventListener('mousedown', handleClickOutside);
            clearTimeout(timer);
        };
    }, [activeTab, categories]);

    // Reset card animations when tab changes
    useEffect(() => {
        setVisibleElements(prev => {
            const newSet = new Set(prev);
            // Keep header and tabs visible if they were already visible
            if (prev.has('header')) newSet.add('header');
            if (prev.has('subheader')) newSet.add('subheader');
            if (prev.has('tabs')) newSet.add('tabs');
            
            // Remove all card animations
            services.forEach(service => {
                newSet.delete(`card-${service.id}`);
            });
            return newSet;
        });
    }, [activeTab]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Services</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#3a599c] text-white rounded-md hover:bg-[#344e86] transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Feature Services</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover our featured services designed to elevate your experience
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <div className="animate-pulse bg-gray-300 h-10 w-64 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="animate-pulse bg-gray-300 h-48 w-full"></div>
                                <div className="p-4">
                                    <div className="animate-pulse bg-gray-300 h-4 w-1/3 mb-3 rounded"></div>
                                    <div className="animate-pulse bg-gray-300 h-6 w-full mb-4 rounded"></div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="animate-pulse bg-gray-300 w-8 h-8 rounded-full"></div>
                                            <div className="animate-pulse bg-gray-300 h-4 w-20 rounded"></div>
                                        </div>
                                        <div className="animate-pulse bg-gray-300 h-6 w-16 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
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
                        Feature Services
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
                        Discover our featured services designed to elevate your experience
                    </p>
                </div>

                {/* Tabs */}
                {categories.length > 0 && (
                    <div 
                        ref={tabsRef}
                        data-animate-id="tabs"
                        className={`flex justify-center mb-12 transition-all duration-700 ease-out ${
                            visibleElements.has('tabs') 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '400ms' }}
                    >
                        {/* Mobile Dropdown */}
                        <div className="sm:hidden relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-64 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#3e5a9a]"
                            >
                                <span className="font-medium text-gray-900">{activeTab}</span>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setActiveTab(category.name);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                                activeTab === category.name ? 'bg-blue-50 text-[#3e5a9a] font-medium' : 'text-gray-900'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Desktop Tabs */}
                        <div className="hidden sm:block relative overflow-x-auto">
                            <div
                                ref={containerRef}
                                className="flex space-x-4 md:space-x-8 lg:space-x-12 px-4 md:px-0"
                            >
                                {visibleTabs.map((category) => (
                                    <button
                                        key={category.id}
                                        ref={(el) => (tabRefs.current[category.name] = el)}
                                        onClick={() => setActiveTab(category.name)}
                                        className={`pb-4 font-medium transition-all duration-200 whitespace-nowrap text-sm md:text-base ${
                                            activeTab === category.name
                                                ? 'text-gray-900'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                                
                                {/* More dropdown button for additional categories */}
                                {hiddenTabs.length > 0 && (
                                    <div className="relative" ref={moreButtonRef}>
                                        <button
                                            onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                                            className={`pb-4 font-medium transition-all duration-200 whitespace-nowrap text-sm md:text-base flex items-center ${
                                                hiddenTabs.some(cat => cat.name === activeTab)
                                                    ? 'text-gray-900'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            More <ChevronDown className="w-4 h-4 ml-1" />
                                        </button>
                                        
                                        {isMoreDropdownOpen && (
                                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[150px]">
                                                {hiddenTabs.map((category) => (
                                                    <button
                                                        key={category.id}
                                                        onClick={() => {
                                                            setActiveTab(category.name);
                                                            setIsMoreDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                                            activeTab === category.name ? 'bg-blue-50 text-[#3e5a9a] font-medium' : 'text-gray-900'
                                                        }`}
                                                    >
                                                        {category.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Full width underline */}
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>

                            {/* Blue active indicator */}
                            <div
                                className="absolute bottom-0 h-0.5 bg-[#3e5a9a] transition-all duration-300 ease-in-out"
                                style={{
                                    left: `${indicatorStyle.left}px`,
                                    width: `${indicatorStyle.width}px`
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Service Cards Grid */}
                {filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredServices.map((service, index) => (
                            <div 
                                key={service.id}
                                ref={(el) => (cardsRef.current[index] = el)}
                                data-animate-id={`card-${service.id}`}
                                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-700 ease-out ${
                                    visibleElements.has(`card-${service.id}`) 
                                        ? 'opacity-100 translate-y-0' 
                                        : 'opacity-0 translate-y-12'
                                }`}
                                style={{
                                    transitionDelay: `${index * 150}ms`
                                }}
                            >
                                {/* Service Image */}
                                <div className="relative h-48 w-full bg-gradient-to-br from-blue-400 to-purple-500">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://picsum.photos/400/300?random=${service.id}`;
                                        }}
                                    />
                                    <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow z-10">
                                        <Heart className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                {/* Service Content */}
                                <div className="p-4">
                                    {/* Category */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-gray-500">{service.category}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm font-medium text-gray-700">{service.rating.toFixed(1)}</span>
                                            <span className="text-sm text-gray-500">({service.reviews})</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-base font-semibold text-gray-900 mb-4 line-clamp-2 leading-tight">
                                        {service.title}
                                    </h3>

                                    {/* Description */}
                                    {service.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {service.description.replace(/<[^>]*>/g, '')}
                                        </p>
                                    )}

                                    {/* Author and Price */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
                                                <Image 
                                                    src={avatar} 
                                                    alt="avatar" 
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{service.author}</span>
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">{service.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No services found in this category.</p>
                    </div>
                )}
            </div>
            
            {services.length > 0 && (
                <div className="mt-10 flex justify-center">
                    <a
                        href="/servicelist"
                        className="inline-flex items-center px-5 py-2.5 bg-[#3a599c] text-white rounded-full text-sm font-medium hover:bg-[#344e86] transition-colors shadow-sm"
                    >
                        View All Services
                        <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                </div>
            )}
        </div>
    );
};

export default ServicesHome;