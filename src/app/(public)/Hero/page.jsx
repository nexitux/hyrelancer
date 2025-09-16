"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const router = useRouter();
  const categoryRef = useRef(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDisplay, setCategoryDisplay] = useState('Select Category');
  const [openDropdown, setOpenDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      // You'll need to create this endpoint in your backend to fetch categories
      const response = await fetch('https://test.hyrelancer.in/api/categories');
      if (response.ok) {
        const data = await response.json();
        // Assuming the response has categories with sc_id and sc_name
        setCategories(data.categories || []);
      } else {
        // Fallback to hardcoded categories if API doesn't exist yet
        setCategories([
          { sc_id: 1, sc_name: 'Web Development' },
          { sc_id: 2, sc_name: 'Logo Design' },
          { sc_id: 3, sc_name: 'SEO Services' },
          { sc_id: 4, sc_name: 'Makeup Artists' },
          { sc_id: 5, sc_name: 'Electricians' },
          { sc_id: 6, sc_name: 'Plumbing Services' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { sc_id: 1, sc_name: 'Web Development' },
        { sc_id: 2, sc_name: 'Logo Design' },
        { sc_id: 3, sc_name: 'SEO Services' },
        { sc_id: 4, sc_name: 'Makeup Artists' },
        { sc_id: 5, sc_name: 'Electricians' },
        { sc_id: 6, sc_name: 'Plumbing Services' }
      ]);
    }
    setLoadingCategories(false);
  };

  const handleDropdownToggle = () => {
    setOpenDropdown((prev) => !prev);
  };

  const handleCategorySelect = (category, e) => {
  e.stopPropagation();
  console.log('Selected category:', category); // Debug log
  setSelectedCategory(category.sc_id);
  setCategoryDisplay(category.sc_name);
  setOpenDropdown(false);
  console.log('Category display set to:', category.sc_name); // Debug log
};

  const handleSearch = () => {
    // Build query parameters
    const queryParams = new URLSearchParams();

    if (searchKeyword.trim()) {
      queryParams.append('search_key', searchKeyword.trim());
    }

    if (selectedCategory) {
      queryParams.append('search_category', selectedCategory);
    }

    // Navigate to results page with query parameters
    router.push(`/UsersList?${queryParams.toString()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section
      className="relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-28 bg-cover bg-center min-h-[400px] sm:min-h-[500px] w-full"
      style={{
        backgroundImage: `url('/images/banner.png')`
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-start items-start w-full">
        {/* Hero Content */}
        <div className="mb-8 sm:mb-12 md:mb-16 w-full text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
            Find The Right Freelance
            <br />
            Service, Right Away
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white max-w-full sm:max-w-2xl">
            Find skilled freelancers for any project. Discover top services and hire the best talent.
          </p>
        </div>

        {/* Search Form */}
        <div className="w-full max-w-full sm:max-w-4xl">
          {/* Mobile-only: Search Input (separate row) */}
          <div className="sm:hidden bg-white rounded-lg shadow p-2 mb-2">
            <div className="flex items-center px-3 w-full h-12">
              <Search className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="What service are you looking for?"
                className="w-full py-2 text-sm focus:outline-none placeholder-gray-500"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          {/* Desktop/Tablet container */}
          <div className="hidden sm:flex bg-white rounded-lg shadow p-2 sm:p-3 flex-row items-center overflow-visible relative z-30 gap-2 sm:gap-0">
            {/* Search Icon + Input */}
            <div className="flex items-center px-3 sm:px-4 w-full border-b sm:border-b-0 sm:border-r border-gray-300">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="What service are you looking for?"
                className="w-full py-2 sm:py-3 text-sm sm:text-base focus:outline-none"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Dropdown */}
            <div
              className="relative w-full sm:w-40 md:w-48 h-10 sm:h-12 flex items-center justify-between px-3 sm:px-4 bg-white cursor-pointer border-r border-gray-300"
              onClick={handleDropdownToggle}
              ref={categoryRef}
            >
              <span className="text-gray-700 text-sm sm:text-base truncate pr-2">
                {loadingCategories ? 'Loading...' : categoryDisplay}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
              {openDropdown && !loadingCategories && (
                <ul
                  className="absolute left-0 top-full mt-1 bg-white text-black rounded-lg shadow-lg w-full sm:w-40 md:w-48 max-h-60 overflow-y-auto border border-gray-200"
                  style={{ zIndex: 9999 }}
                >
                  <li
                    className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 text-xs sm:text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(null);
                      setCategoryDisplay('Select Category');
                      setOpenDropdown(false);
                    }}
                  >
                    All Categories
                  </li>
                  {categories.map((item) => (
                    <li
                      key={item.sc_id}
                      className="px-3 sm:px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-xs sm:text-sm"
                      onClick={(e) => handleCategorySelect(item, e)} // Pass event here
                    >
                      {item.sc_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-[#3e5a9a] hover:bg-[#3e5a8a] text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-sm text-sm sm:text-base w-full sm:w-auto transition-colors"
            >
              Search
            </button>
          </div>

          {/* Mobile-only: Category + Button (separate row) */}
          <div className="sm:hidden flex gap-2 w-full">
            <div className="flex-1 bg-white rounded-lg shadow">
              <div
                className="relative w-full h-12 flex items-center justify-between px-4 cursor-pointer"
                onClick={handleDropdownToggle}
                ref={categoryRef}
              >
                <span className="text-gray-700 text-sm truncate pr-2">
                  {loadingCategories ? 'Loading...' : categoryDisplay}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
                {openDropdown && !loadingCategories && (
                  <ul className="absolute left-0 right-0 top-full mt-1 bg-white text-black rounded-lg shadow-lg w-full max-h-60 overflow-y-auto border border-gray-200 z-50">
                    <li
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(null);
                        setCategoryDisplay('Select Category');
                        setOpenDropdown(false);
                      }}
                    >
                      All Categories
                    </li>
                    {categories.map((item) => (
                      <li
                        key={item.sc_id}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm"
                        onClick={(e) => handleCategorySelect(item, e)} // Pass event here
                      >
                        {item.sc_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#3e5a9a] hover:bg-[#3e5a8a] text-white font-semibold px-6 py-3 rounded-lg text-sm w-auto transition-colors shadow"
            >
              Search
            </button>
          </div>
        </div>

        {/* Top Services */}
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 py-3 mt-6 sm:mt-8">
          <h2 className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">Top Services:</h2>
          <div className="flex flex-wrap gap-2">
            {["Graphics", "Website", "Logo", "Development"].map((service) => (
              <span
                key={service}
                onClick={() => {
                  setSearchKeyword(service);
                  handleSearch();
                }}
                className="text-white border border-gray-300 hover:border-[#3e5a9a] hover:bg-white hover:text-[#3e5a9a] px-2 sm:px-3 py-1 rounded-sm text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;