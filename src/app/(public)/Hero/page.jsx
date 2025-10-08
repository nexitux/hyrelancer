"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useCountAnimationOnView } from '../../../hooks/useCountAnimation';
import { capitalizeFirst } from '../../../lib/utils';

/**
 * HeroSection Component
 * 
 * A professional hero section with video background, search functionality,
 * and statistics display. Designed to match the exact layout from the provided image.
 */
const HeroSection = () => {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // API service function for fetching suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://hyre.hyrelancer.com/api/getSuggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sugg: query.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions && data.suggestions.length > 0);
        setSelectedSuggestionIndex(-1); // Reset selection when new suggestions load
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search input handler
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchKeyword(value);

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced API call
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce delay
  }, [fetchSuggestions]);

  // Memoized search handler for better performance
  const handleSearch = useCallback(() => {
    const queryParams = new URLSearchParams();
    if (searchKeyword.trim()) {
      queryParams.append('search_key', searchKeyword.trim());
    }
    router.push(`/UsersList?${queryParams.toString()}`);
  }, [searchKeyword, router]);

  // Handle suggestion selection - only fill input, don't search
  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchKeyword(suggestion);
    setShowSuggestions(false);
    // Focus back to input after selection
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle Enter key press and arrow navigation
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        // If a suggestion is selected, use it
        handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
      } else {
        // Otherwise, perform search with current input
        handleSearch();
      }
    } else if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  }, [handleSearch, handleSuggestionSelect, showSuggestions, selectedSuggestionIndex, suggestions]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    handleSearch();
  }, [handleSearch]);

  // Handle popular search selection
  const handlePopularSearch = useCallback((label) => {
    setSearchKeyword(label);
    setShowSuggestions(false);
    handleSearch();
  }, [handleSearch]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Animated Statistics Component
  const AnimatedStat = ({ stat }) => {
    const [count, elementRef] = useCountAnimationOnView(stat.number, 2000);
    
    return (
      <div ref={elementRef} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 text-center min-w-0">
        <div className="text-[#3a599c] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none">
          {count.toLocaleString()}{stat.suffix}
        </div>
        <p className="text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg font-medium max-w-full sm:max-w-xs px-2 sm:px-0">
          {stat.label}
        </p>
      </div>
    );
  };

  // Static data - in production, these could come from props or API
  const popularSearches = [
    { id: 1, label: "Graphics" },
    { id: 2, label: "Website" },
    { id: 3, label: "Logo" },
    { id: 4, label: "Development" },
  ];

  const statistics = [
    { id: 1, number: 1000, label: "Happy Customers", suffix: "+" },
    { id: 2, number: 1000, label: "Daily services at your Doorsteps", suffix: "+" },
    { id: 3, number: 500, label: "Happy Freelancers", suffix: "+" },
  ];

  return (
    <div className="pt-4 sm:pt-6 md:pt-8 lg:pt-10 px-3 sm:px-4 md:px-6 lg:px-8 py-6 bg-white">
      <div className="mx-auto w-full max-w-full">
        {/* Hero Section with Video Background */}
        <section className="relative rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-lg overflow-hidden min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] xl:min-h-[700px]">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover sm:object-fill"
            src="/images/bg.mp4"
            aria-label="Background video showing professional work environment"
          />
          
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 sm:bg-black/35" />
          
          {/* Main Content Container */}
          <div className="relative z-10 flex flex-col justify-center items-center min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] xl:min-h-[700px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            
            {/* Header Section */}
            <header className="text-center mb-8 sm:mb-10 md:mb-12 max-w-5xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-5 md:mb-6 drop-shadow-lg leading-tight sm:leading-tight">
                Find The Right Freelance Service,{" "}
                <span className="text-[#3a599c]">Right</span> Away
              </h1>
              <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-medium max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
                Find skilled freelancers for any project. Discover top services
                and hire the best talent
              </p>
            </header>

            {/* Search Section */}
            <div className="w-full max-w-5xl mx-auto relative z-10">
              {/* Search Form */}
              <form
                className="bg-white rounded-full h-14 sm:h-16 md:h-18 lg:h-20 shadow-xl mb-6 sm:mb-7 md:mb-8 relative"
                onSubmit={handleSubmit}
              >
                <div className="flex items-center h-full pl-4 sm:pl-5 md:pl-6 pr-3 sm:pr-4 gap-3 sm:gap-4">
                  <input
                    ref={searchInputRef}
                    id="service-search"
                    type="search"
                    placeholder="What Service are you looking for?"
                    className="flex-1 text-gray-600 text-sm sm:text-base md:text-lg font-medium outline-none bg-transparent placeholder-gray-400"
                    value={searchKeyword}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => {
                      if (suggestions.length > 0 && searchKeyword.trim()) {
                        setShowSuggestions(true);
                      }
                    }}
                    aria-label="Search for freelance services"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#3a599c] rounded-full flex items-center justify-center hover:bg-[#2d4678] transition-all duration-200 transform hover:scale-105 active:scale-95"
                    aria-label="Search for services"
                  >
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </div>
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-[99999] max-h-60 overflow-y-auto custom-scrollbar"
                    style={{ zIndex: 99999, maxHeight: '15rem', overflowY: 'auto' }}
                  >
                    {isLoading ? (
                      <div className="px-4 py-3 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3a599c]"></div>
                          <span className="ml-2 text-sm">Searching...</span>
                        </div>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`w-full px-4 py-2.5 text-left transition-colors duration-150 flex items-center gap-3 text-sm sm:text-base ${
                              index === selectedSuggestionIndex
                                ? 'bg-[#3a599c] text-white'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-[#3a599c]'
                            }`}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            onMouseEnter={() => setSelectedSuggestionIndex(index)}
                          >
                            <Search className={`w-4 h-4 flex-shrink-0 ${
                              index === selectedSuggestionIndex ? 'text-white' : 'text-gray-400'
                            }`} />
                             <span className="font-medium truncate">{capitalizeFirst(suggestion)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-center text-gray-500 text-sm">
                        No suggestions found
                      </div>
                    )}
                  </div>
                )}
              </form>
              {/* Custom scrollbar styles for suggestions dropdown */}
              <style jsx>{`
                .custom-scrollbar {
                  scrollbar-width: thin;
                  scrollbar-color: #3a599c #f4f4f4;
                }
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                  background: #f4f4f4;
                  border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #3a599c;
                  border-radius: 8px;
                }
              `}</style>

              

              {/* Popular Searches */}
              <div className="text-center">
                <h3 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-5 md:mb-6">
                  Popular Searches
                </h3>
                <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
                  {popularSearches.map((search) => (
                    <button
                      key={search.id}
                      className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full border-2 border-white text-white text-xs sm:text-sm md:text-base font-medium hover:bg-white/10 hover:border-white/80 transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[44px] sm:min-h-[48px] flex items-center justify-center"
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
        <div className="relative -mt-12 sm:-mt-14 md:-mt-16 lg:-mt-18 xl:-mt-20 z-20 flex justify-center">
          <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[32px] shadow-2xl py-4 sm:py-5 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 mx-3 sm:mx-4 md:mx-6 lg:mx-8 w-full max-w-7xl">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 w-full px-2 sm:px-4 md:px-6 lg:px-8">
              {/* Statistics Items */}
              {statistics.map((stat, index) => (
                <React.Fragment key={stat.id}>
                  <AnimatedStat stat={stat} />
                  {/* Divider - show between items on tablet and desktop */}
                  {index < statistics.length - 1 && (
                    <div className="hidden sm:block w-px h-16 sm:h-18 md:h-20 bg-gray-200" />
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