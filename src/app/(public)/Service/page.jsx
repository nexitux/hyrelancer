"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Star, Heart, ChevronDown, ChevronRight, MoreHorizontal, ChevronLeft } from 'lucide-react';
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
    const [currentSlide, setCurrentSlide] = useState(0);
    const tabRefs = useRef({});
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const tabsRef = useRef(null);
    const cardsRef = useRef([]);
    const moreButtonRef = useRef(null);
    const carouselRef = useRef(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://backend.hyrelancer.in/api/getSiteData');
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
                                ? `https://backend.hyrelancer.in/${service.se_img.split('--')[0]}`
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

        // Observe description
        const descriptionEl = document.querySelector('[data-animate-id="description"]');
        if (descriptionEl) {
            observer.observe(descriptionEl);
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
            if (prev.has('description')) newSet.add('description');
            if (prev.has('tabs')) newSet.add('tabs');
            
            // Remove all card animations
            services.forEach(service => {
                newSet.delete(`card-${service.id}`);
            });
            return newSet;
        });
        setCurrentSlide(0); // Reset carousel to first slide
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
            <div className="min-h-screen bg-white py-16 px-4">
                <div className=" mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-sm font-medium text-[#3a599c] mb-2">Boost Your Working Flow</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Featured Services</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Discover our featured services designed to elevate your experience
                        </p>
                    </div>
                    <div className="flex justify-center mb-12">
                        <div className="flex gap-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse bg-gray-300 h-12 w-24 rounded-full"></div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                    <div className="animate-pulse bg-gray-300 h-48 w-full"></div>
                                    <div className="p-4">
                                        <div className="animate-pulse bg-gray-300 h-4 w-1/3 mb-3 rounded"></div>
                                        <div className="animate-pulse bg-gray-300 h-6 w-full mb-2 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Carousel navigation functions
    const nextSlide = () => {
        const maxSlides = Math.ceil(filteredServices.length / 4) - 1;
        setCurrentSlide(prev => prev < maxSlides ? prev + 1 : 0);
    };

    const prevSlide = () => {
        const maxSlides = Math.ceil(filteredServices.length / 4) - 1;
        setCurrentSlide(prev => prev > 0 ? prev - 1 : maxSlides);
    };

    return (
        <div className="min-h-screen bg-white py-16 px-4">
            <div className=" mx-auto"style={{ maxWidth: "1550px" }}>
                {/* Header */}
                <div className="text-center mb-12">
                    <p
                        ref={headerRef}
                        data-animate-id="header"
                        className={`text-sm font-medium text-[#3a599c] mb-2 transition-all duration-700 ease-out ${
                            visibleElements.has('header')
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '100ms' }}
                    >
                        Boost Your Working Flow
                    </p>
                    <h1
                        data-animate-id="subheader"
                        className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-all duration-700 ease-out ${
                            visibleElements.has('subheader')
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '250ms' }}
                    >
                        Featured Services
                    </h1>
                    <p
                        data-animate-id="description"
                        className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 ease-out ${
                            visibleElements.has('description')
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '400ms' }}
                    >
                        Discover our featured services designed to elevate your experience
                    </p>
                </div>

                {/* Filter Buttons */}
                {categories.length > 0 && (
                    <div 
                        ref={tabsRef}
                        data-animate-id="tabs"
                        className={`flex justify-center mb-12 transition-all duration-700 ease-out ${
                            visibleElements.has('tabs') 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{ transitionDelay: '500ms' }}
                    >
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.slice(0, 5).map((category) => (
                                <button
                                    key={category.id}
                                    ref={(el) => (tabRefs.current[category.name] = el)}
                                    onClick={() => setActiveTab(category.name)}
                                    className={`px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                                        activeTab === category.name
                                            ? 'bg-[#3a599c] text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:border-[#3a599c] hover:text-[#3a599c]'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Service Cards Carousel */}
                {filteredServices.length > 0 ? (
                    <div className="relative">
                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                        >
                            <ChevronRight className="w-6 h-6 text-gray-600" />
                        </button>

                        {/* Carousel Container */}
                        <div 
                            ref={carouselRef}
                            className="overflow-hidden"
                        >
                            <div 
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${currentSlide * 100}%)`
                                }}
                            >
                                {/* Create slides with 4 cards each */}
                                {Array.from({ length: Math.ceil(filteredServices.length / 5) }, (_, slideIndex) => (
                                    <div 
                                        key={slideIndex} 
                                        className="w-full flex-shrink-0"
                                        style={{ maxWidth: "1500px", margin: "0 auto" }} // Match top component width
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 px-6">
                                            {filteredServices.slice(slideIndex * 4, (slideIndex + 1) * 4).map((service, cardIndex) => {
                                                const globalIndex = slideIndex * 4 + cardIndex;
                                                return (
                                                    <div 
                                                        key={service.id}
                                                        ref={(el) => (cardsRef.current[globalIndex] = el)}
                                                        data-animate-id={`card-${service.id}`}
                                                        className={`bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-700 ease-out ${
                                                            visibleElements.has(`card-${service.id}`) 
                                                                ? 'opacity-100 translate-y-0' 
                                                                : 'opacity-0 translate-y-12'
                                                        }`}
                                                        style={{
                                                            transitionDelay: `${cardIndex * 150}ms`
                                                        }}
                                                    >
                                                        {/* Service Image */}
                                                        <div className="relative h-48 w-full rounded-lg p-2">
                                                            <div className="w-full h-full rounded-lg overflow-hidden">
                                                                <img
                                                                    src={service.image}
                                                                    alt={service.title}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = `https://picsum.photos/400/300?random=${service.id}`;
                                                                    }}
                                                                />
                                                            </div>
                                                            <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow z-10">
                                                                <Heart className="w-5 h-5 text-gray-600" />
                                                            </button>
                                                        </div>

                                                        {/* Service Content */}
                                                        <div className="p-4">
                                                            {/* Category */}
                                                            <div className="mb-3">
                                                                <span className="text-sm font-medium text-gray-500">{service.category}</span>
                                                            </div>

                                                            {/* Title */}
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                                                                {service.title}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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