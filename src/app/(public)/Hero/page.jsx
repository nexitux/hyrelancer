"use client";

import React, { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { useRouter } from 'next/navigation';

/**
 * HeroSection Component
 * 
 * A professional hero section with video background, search functionality,
 * and statistics display. Designed to match the exact layout from the provided image.
 */
const HeroSection = () => {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');

  // Memoized search handler for better performance
  const handleSearch = useCallback(() => {
    const queryParams = new URLSearchParams();
    if (searchKeyword.trim()) {
      queryParams.append('search_key', searchKeyword.trim());
    }
    router.push(`/UsersList?${queryParams.toString()}`);
  }, [searchKeyword, router]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  // Handle popular search selection
  const handlePopularSearch = useCallback((label) => {
    setSearchKeyword(label);
    handleSearch();
  }, [handleSearch]);

  // Static data - in production, these could come from props or API
  const popularSearches = [
    { id: 1, label: "Graphics" },
    { id: 2, label: "Website" },
    { id: 3, label: "Logo" },
    { id: 4, label: "Development" },
  ];

  const statistics = [
    { id: 1, number: "0", label: "Happy Customers" },
    { id: 2, number: "+1K", label: "Daily services at your Doorsteps" },
    { id: 3, number: "0+", label: "Happy Customers" },
  ];

  return (
    <div className="pt-10 px-4 bg-white">
      <div className="mx-auto w-full max-w-full">
        {/* Hero Section with Video Background */}
        <section className="relative rounded-[32px] shadow-lg overflow-hidden min-h-[600px] md:min-h-[700px]">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-fill"
            src="/images/bg.mp4"
            aria-label="Background video showing professional work environment"
          />
          
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Main Content Container */}
          <div className="relative z-10 flex flex-col justify-center items-center min-h-[600px] md:min-h-[700px] px-6 md:px-12 lg:px-16">
            
            {/* Header Section */}
            <header className="text-center mb-12 max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
                Find The Right Freelance Service,{" "}
                <span className="text-[#3a599c]">Right</span> Away
              </h1>
              <p className="text-white text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
                Find skilled freelancers for any project. Discover top services
                and hire the best talent
              </p>
            </header>

            {/* Search Section */}
            <div className="w-full max-w-4xl mx-auto">
              {/* Search Form */}
              <form
                className="bg-white rounded-full h-16 md:h-20 shadow-xl mb-8"
                onSubmit={handleSubmit}
              >
                <div className="flex items-center h-full pl-6 pr-4  gap-4">
                  <input
                    id="service-search"
                    type="search"
                    placeholder="What Service are you looking for?"
                    className="flex-1 text-gray-600 text-base md:text-lg font-medium outline-none bg-transparent placeholder-gray-400"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    aria-label="Search for freelance services"
                  />
                  <button
                    type="submit"
                    className="w-12 h-12 md:w-14 md:h-14 bg-[#3a599c] rounded-full flex items-center justify-center hover:bg-[#2d4678] transition-all duration-200 transform hover:scale-105"
                    aria-label="Search for services"
                  >
                    <Search className="w-6 h-6 md:w-6 md:h-6 text-white" />
                  </button>
                </div>
              </form>

              {/* Popular Searches */}
              <div className="text-center">
                <h3 className="text-white text-lg font-semibold mb-6">
                  Popular Searches
                </h3>
                <nav className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                  {popularSearches.map((search) => (
                    <button
                      key={search.id}
                      className="px-6 py-2.5 rounded-full border-2 border-white text-white text-sm md:text-base font-medium hover:bg-white/10 hover:border-white/80 transition-all duration-200 transform hover:scale-105"
                      type="button"
                      onClick={() => handlePopularSearch(search.label)}
                      aria-label={`Search for ${search.label} services`}
                    >
                      {search.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section - Positioned to overlay the hero */}
        <div className="relative -mt-16 md:-mt-20 z-20 flex justify-center">
          <div className="bg-white rounded-[32px] shadow-2xl py-6 px-2 md:p-10 lg:p-8 mx-4 md:mx-8 w-full" style={{ maxWidth: "1500px" }}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16 w-full px-4 md:px-8">
              {/* Statistics Items */}
              {statistics.map((stat, index) => (
                <React.Fragment key={stat.id}>
                  <div className="flex flex-col items-center md:items-center gap-2 flex-1 text-center">
                    <div className="text-[#3a599c] text-4xl md:text-5xl lg:text-6xl font-bold leading-none">
                      {stat.number}
                    </div>
                    <p className="text-gray-700 text-sm md:text-base lg:text-lg font-medium max-w-xs">
                      {stat.label}
                    </p>
                  </div>
                  {/* Divider - only show between items on desktop */}
                  {index < statistics.length - 1 && (
                    <div className="hidden md:block w-px h-20 bg-gray-200" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;