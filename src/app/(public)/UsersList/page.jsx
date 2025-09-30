"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  ChevronDown,
  ChevronUp,
  Search as SearchIcon,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  List,
  X,
  Minus,
} from "lucide-react";

const UsersList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Core data + UI state
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInfo, setSearchInfo] = useState({ keyword: "", category: "" });

  // New design states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(6);
  const [salaryRange, setSalaryRange] = useState({ min: 0, max: 3000 });
  const [radius, setRadius] = useState(100);
  const [experienceLevel, setExperienceLevel] = useState({
    entry: false,
    intermediate: false,
    expert: false,
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [location, setLocation] = useState("City, State or Zip");
  const [openCategory, setOpenCategory] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  
  // Filter states
  const [workTime, setWorkTime] = useState("");
  const [experience, setExperience] = useState("");
  const [sortBy, setSortBy] = useState("Default");
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  // small UI helpers
  const categoryRef = useRef(null);
  const locationRef = useRef(null);

  // favorites (Set to track fav ids)
  const [favorites, setFavorites] = useState(new Set());

  // theme colors
  const primaryColor = "#3e5a9a";
  const primaryHover = "#3e5a8a";

  const categories = [
    "All Categories",
    "Graphic & Design",
    "Writing",
    "Digital Marketing",
    "Development",
    "UI/UX Design",
  ];

  const locations = [
    "City, State or Zip",
    "Las Vegas, USA",
    "Cape Town, South Africa",
    "Sydney, Australia",
    "Tokyo, Japan",
  ];

  /* ------------------ Effects ------------------ */
  // Init: read search params, fetch if present, and add outside click handler
  useEffect(() => {
    const keyword = searchParams.get("search_key") || "";
    const category = searchParams.get("search_category") || "";

    setSearchInfo({ keyword, category });

    // map category id -> name if needed (placeholder)
    if (category) {
      setSelectedCategory("All Categories");
    }

    if (keyword || category) {
      fetchSearchResults(keyword, category);
    }

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
  }, [searchParams]);

  // Scroll listener for scroll-to-top button visibility
  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 300) setIsScrolled(true);
      else setIsScrolled(false);
    }
    window.addEventListener("scroll", onScroll);
    // initial check
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ------------------ API ------------------ */
  const fetchSearchResults = async (keyword, category) => {
    setLoading(true);
    setError(null);

    try {
      const body = {};
      if (keyword) body.search_key = keyword;
      if (category) body.search_category = category;

      const response = await fetch("https://test.hyrelancer.in/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to fetch results");

      const data = await response.json();
      // API returns { results: [...] }
      const resultsData = data.results || [];
      setAllResults(resultsData);
      setFilteredResults(resultsData);
      setResults(resultsData);
      setCurrentPage(1); // reset to page 1 on new results
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to load search results. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Helpers ------------------ */
  const handleBackToSearch = () => router.push("/");

  const formatPrice = (price) => {
    // Some fp_amt_hour values are strings, ensure number
    const p = Number(price) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(p);
  };

  const getProfileImage = (imagePath) => {
    if (!imagePath || imagePath === "0") {
      return "https://ui-avatars.com/api/?name=User&background=3e5a9a&color=fff";
    }
    // Handle double-filename format like "uploads/...--uploads/..."
    const cleanPath = imagePath.split("--")[0];
    // ensure it doesn't already include base URL
    if (cleanPath.startsWith("http") || cleanPath.startsWith("https")) return cleanPath;
    return `https://test.hyrelancer.in/${cleanPath}`;
  };

  const getLocationString = (user) => {
    const parts = [];
    if (user.fp_ci_id) parts.push("City");
    if (user.fp_st_id) parts.push("State");
    if (user.fp_co_id === 101 || String(user.fp_co_id) === "101") parts.push("India");
    return parts.length > 0 ? parts.join(", ") : "Location not specified";
  };

  const isVerified = (user) => {
    // API uses fp_is_verify as "0"/"1" or numbers
    return user && (user.fp_is_verify === "1" || user.fp_is_verify === 1 || user.fp_is_verify === true);
  };

  const getLanguages = (user) => {
    if (!user?.fp_lang || user.fp_lang === "0") return [];
    // e.g. "tamil,kannada," or "2,"
    return user.fp_lang.split(",").map((s) => s.trim()).filter(Boolean);
  };

  const toggleFavorite = (userId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleFilterModal = () => setShowFilterModal((v) => !v);

  const handleSalaryChange = (e, type) => {
    const value = parseInt(e.target.value || 0, 10);
    if (type === "min") setSalaryRange((prev) => ({ ...prev, min: value }));
    else setSalaryRange((prev) => ({ ...prev, max: value }));
  };

  const toggleExperienceLevel = (level) =>
    setExperienceLevel((prev) => ({ ...prev, [level]: !prev[level] }));

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  // Filtering logic
  const applyFilters = () => {
    let filtered = [...allResults];

    // Filter by salary range
    filtered = filtered.filter(user => {
      const userSalary = Number(user.fp_amt_hour) || 0;
      return userSalary >= salaryRange.min && userSalary <= salaryRange.max;
    });

    // Filter by work time
    if (workTime) {
      filtered = filtered.filter(user => {
        const completingTime = user.fp_completing_time?.toLowerCase() || "";
        const workTimeLower = workTime.toLowerCase();
        
        if (workTimeLower === "in a week") {
          return completingTime.includes("week") || completingTime.includes("7 days");
        } else if (workTimeLower === "24 hours") {
          return completingTime.includes("24") || completingTime.includes("1 day");
        } else if (workTimeLower === "after 2 days") {
          return completingTime.includes("2 day") || completingTime.includes("48");
        } else if (workTimeLower === "tomorrow") {
          return completingTime.includes("tomorrow") || completingTime.includes("1 day");
        }
        return true;
      });
    }

    // Filter by experience
    if (experience) {
      filtered = filtered.filter(user => {
        const userExperience = Number(user.fp_ex_year) || 0;
        const experienceLower = experience.toLowerCase();
        
        if (experienceLower === "0-to-1-year") {
          return userExperience >= 0 && userExperience <= 1;
        } else if (experienceLower === "2-to-5-year") {
          return userExperience >= 2 && userExperience <= 5;
        } else if (experienceLower === "5-to-10-year") {
          return userExperience >= 5 && userExperience <= 10;
        } else if (experienceLower === "10-year") {
          return userExperience > 10;
        }
        return true;
      });
    }

    // Filter by experience level checkboxes
    const hasExperienceLevelFilter = experienceLevel.entry || experienceLevel.intermediate || experienceLevel.expert;
    if (hasExperienceLevelFilter) {
      filtered = filtered.filter(user => {
        const userExperience = Number(user.fp_ex_year) || 0;
        
        if (experienceLevel.entry && userExperience >= 0 && userExperience <= 2) return true;
        if (experienceLevel.intermediate && userExperience >= 3 && userExperience <= 7) return true;
        if (experienceLevel.expert && userExperience >= 8) return true;
        
        return false;
      });
    }

    // Apply sorting
    if (sortBy !== "Default") {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "Newest":
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
          case "Price: Low to High":
            return (Number(a.fp_amt_hour) || 0) - (Number(b.fp_amt_hour) || 0);
          case "Price: High to Low":
            return (Number(b.fp_amt_hour) || 0) - (Number(a.fp_amt_hour) || 0);
          case "Rating":
            return (Number(b.rating) || 0) - (Number(a.rating) || 0);
          default:
            return 0;
        }
      });
    }

    setFilteredResults(filtered);
    setResults(filtered);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSalaryRange({ min: 0, max: 3000 });
    setWorkTime("");
    setExperience("");
    setExperienceLevel({ entry: false, intermediate: false, expert: false });
    setSortBy("Default");
    setFilteredResults(allResults);
    setResults(allResults);
    setCurrentPage(1);
  };

  /* ------------------ Pagination ------------------ */
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentFreelancers = filteredResults.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / cardsPerPage));

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  /* ------------------ Loading state ------------------ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e5a9a] mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching for freelancers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------ Render ------------------ */
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
              <button onClick={handleBackToSearch} className="hover:underline flex items-center gap-2">
                <ArrowLeft size={14} />
                Home
              </button>
              <span className="mx-2 opacity-40">/</span>
              <span>For Candidates</span>
              <span className="mx-2 opacity-40">/</span>
              <span className="opacity-60">Freelancers</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 lg:mb-6">
              {searchInfo.keyword ? `Results for "${searchInfo.keyword}"` : "Find Freelancers"}
            </h1>

          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Mobile Filter Button */}
        <button
          onClick={toggleFilterModal}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#3e5a9a] text-white p-3 rounded-full shadow-lg flex items-center justify-center"
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
                  <SearchIcon size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] text-sm"
                  placeholder="Job title, key words or company"
                  value={searchInfo.keyword}
                  onChange={(e) => setSearchInfo({ ...searchInfo, keyword: e.target.value })}
                />
              </div>
            </div>

            {/* Location */}
            {/* <div>
              <h3 className="font-semibold mb-3 text-gray-800">Location</h3>
              <div className="relative">
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] transition-all">
                  <option value="">Select location</option>
                  <option value="Africa">Africa</option>
                  <option value="Americas">Americas</option>
                  <option value="Antarctica">Antarctica</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="Oceania">Oceania</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div> */}

            {/* Category */}
            {/* <div>
              <h3 className="font-semibold mb-3 text-gray-800">Category</h3>
              <div className="relative">
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] transition-all"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div> */}

            {/* Service */}
            {/* <div>
              <h3 className="font-semibold mb-3 text-gray-800">Service</h3>
              <div className="relative">
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] transition-all">
                  <option value="">Select Service</option>
                  <option value="Male">Make Up</option>
                  <option value="Female">Figma</option>
                  <option value="Other">Logo</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div> */}

            {/* Job Types */}
            {/* <div>
              <h3 className="font-semibold mb-3 text-gray-800">Job Types</h3>
              <div className="relative">
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] transition-all">
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
            </div> */}

            {/* Age Range */}
            {/* <div>
              <h3 className="font-semibold mb-3 text-gray-800">
                Age: <span className="text-[#3e5a9a]">0 - 60 Years Old</span>
              </h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="60"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} 50%, #e5e7eb 50%, #e5e7eb 100%)`,
                  }}
                />
              </div>
            </div> */}

            {/* Salary Filter */}
            <div>
              <h3 className="font-semibold mb-3 text-gray-800">Filter by Salary</h3>
              <div className="flex justify-between mt-4 gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">&#8377;</span>
                  <input
                    type="number"
                    value={salaryRange.min}
                    onChange={(e) => handleSalaryChange(e, "min")}
                    min="0"
                    max={salaryRange.max}
                    className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a]"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">min</span>
                </div>
                <Minus size={20} className="text-gray-400 mt-2" />
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">&#8377;</span>
                  <input
                    type="number"
                    value={salaryRange.max}
                    onChange={(e) => handleSalaryChange(e, "max")}
                    min={salaryRange.min}
                    max="3000"
                    className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a]"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">max</span>
                </div>
              </div>
            </div>

            {/* Hourly Rate Filter */}
            {/* <div>
              <h3 className="font-semibold mb-3 text-gray-800">Filter by Hourly</h3>
              <div className="flex justify-between mt-4 gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">&#8377;</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a]"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">min</span>
                </div>
                <Minus size={20} className="text-gray-400 mt-2" />
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">&#8377;</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="3000"
                    className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a]"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">max</span>
                </div>
              </div>
            </div> */}

            {/* Work Time */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">Work Time</h3>
              <div className="relative">
                <select 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] transition-all"
                  value={workTime}
                  onChange={(e) => setWorkTime(e.target.value)}
                >
                  <option value="">Select Work Time</option>
                  <option value="In a Week">In a Week</option>
                  <option value="24 Hours">24 Hours</option>
                  <option value="After 2 Days">After 2 Days</option>
                  <option value="Tomorrow">Tomorrow</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Experience */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-800">Experience</h3>
              <div className="relative">
                <select 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] transition-all"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
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
            {/* <div>
              <h3 className="font-semibold mb-3 text-gray-800">Qualification</h3>
              <div className="relative">
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] transition-all">
                  <option value="">Select Qualification</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div> */}

            {/* Find Candidates Button */}
            <button
              className="w-full py-3 text-white rounded-lg font-medium transition-colors shadow-sm"
              style={{ backgroundColor: primaryColor }}
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            
            {/* Clear Filters Button */}
            <button
              className="w-full py-2 text-gray-600 border border-gray-300 rounded-lg font-medium transition-colors shadow-sm hover:bg-gray-50"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Freelancer Cards Grid */}
        <main className="w-full lg:w-3/4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                Sort by:{" "}
                <select 
                  className="ml-1 text-gray-800 font-medium border-none bg-transparent focus:outline-none"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    applyFilters();
                  }}
                >
                  <option>Default</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                </select>
              </span>
            </div>
            <div className="text-gray-600 text-sm">
              Showing {filteredResults.length === 0 ? 0 : indexOfFirstCard + 1}-
              {Math.min(indexOfLastCard, filteredResults.length)} of {filteredResults.length} results
              {searchInfo.keyword && ` for "${searchInfo.keyword}"`}
            </div>
          </div>

          {/* Freelancer Cards Grid */}
          {filteredResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {currentFreelancers.map((user) => (
                  <div key={user.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                    <div className="p-6">
                      {/* Header with Profile Image and Favorite */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={getProfileImage(user.fp_img)}
                              alt={user.fp_display_name || user.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                            />
                            {isVerified(user) && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#3e5a9a] rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              {user.fp_display_name || user.name}
                              {isVerified(user) && <span className="text-[#3e5a9a] text-sm">✓</span>}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{user.fp_occupation || "Freelancer"}</p>
                            <div className="text-xs text-gray-500 mt-1">
                              {user.fp_ex_year && user.fp_ex_year !== "0" && <span className="mr-2">{user.fp_ex_year} yrs</span>}
                              {user.fp_completing_time && <span className="mr-2">• {user.fp_completing_time}</span>}
                              {user.fp_available && <span>• {user.fp_available}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavorite(user.id)}
                          className={`p-2 rounded-full transition-colors ${favorites.has(user.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                          aria-label="Toggle favorite"
                        >
                          <Heart size={18} />
                        </button>
                      </div>

                      {/* Location and Rating */}
                      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{getLocationString(user)}</span>
                        </div>
                        {/* <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400" />
                          <span className="text-gray-800 font-medium">{user.rating ?? "4.9"}</span>
                          <span>({user.reviews ?? 482} reviews)</span>
                        </div> */}
                      </div>

                      {/* Headline / Tags */}
                      {user.fp_headline && user.fp_headline !== "0" && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 line-clamp-2">{user.fp_headline}</p>
                        </div>
                      )}

                      {/* Languages / profile tag */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getLanguages(user).slice(0, 4).map((lang, idx) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {lang}
                          </span>
                        ))}
                        {user.fp_profile_tag_line && user.fp_profile_tag_line !== "0" && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            {user.fp_profile_tag_line}
                          </span>
                        )}
                      </div>

                      {/* Projects and Rate */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">{user.projects ?? 0}</span> Projects
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">
                            {formatPrice(Number(user.fp_amt_hour) || 0)}
                            <span className="text-sm font-normal text-gray-600">/{user.fp_amount_for || "Hour"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push(`/profileView/${encodeURIComponent(user.fp_slug || user.fp_id)}`)}
                          className="flex-1 py-3 border-2 border-[#3e5a9a] text-[#3e5a9a] hover:bg-[#3e5a9a] hover:text-white transition-colors rounded-lg font-medium"
                          style={{ borderColor: primaryColor }}
                        >
                          View Profile
                        </button>

                        {/* <a
                          href={`mailto:${user.email}`}
                          className="flex-1 py-3 text-center bg-[#3e5a9a] text-white rounded-lg hover:bg-[#2d477a] transition-colors font-medium"
                        >
                          Contact
                        </a> */}
                      </div>
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
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md ${currentPage === number ? "bg-[#3e5a9a] text-white" : "text-gray-700 hover:bg-gray-100"}`}
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
                {searchInfo.keyword
                  ? `No freelancers found for "${searchInfo.keyword}". Try a different search.`
                  : "No freelancers match your search criteria."}
              </p>
              <button
                className="px-4 py-2 bg-[#3e5a9a] text-white rounded-lg hover:bg-[#3e5a8a] transition-colors"
                onClick={() => {
                  setSearchInfo({ keyword: "", category: "" });
                  clearFilters();
                  fetchSearchResults("", "");
                }}
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
              <button onClick={toggleFilterModal} className="text-gray-500 hover:text-gray-700 p-1">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Mobile Search */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Search</h3>
                <div className="relative">
                  <SearchIcon size={20} className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a] text-sm"
                    placeholder="Job title, key words or company"
                    value={searchInfo.keyword}
                    onChange={(e) => setSearchInfo({ ...searchInfo, keyword: e.target.value })}
                  />
                </div>
              </div>

              {/* Mobile Location */}
              {/* <div>
                <h3 className="font-semibold mb-2 text-gray-800">Location</h3>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a]">
                    <option>Select location</option>
                    <option>Africa</option>
                    <option>Americas</option>
                    <option>Asia</option>
                    <option>Europe</option>
                    <option>Oceania</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div> */}

              {/* Mobile Category */}
              {/* <div>
                <h3 className="font-semibold mb-2 text-gray-800">Category</h3>
                <div className="relative">
                  <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a]">
                    <option>Select category</option>
                    <option>Design & Creative</option>
                    <option>Development</option>
                    <option>Marketing</option>
                    <option>Writing</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div> */}

              {/* Mobile Salary Filter */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Filter by Salary</h3>
                <div className="flex justify-between mt-4 gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">&#8377;</span>
                    <input
                      type="number"
                      value={salaryRange.min}
                      onChange={(e) => handleSalaryChange(e, "min")}
                      min="0"
                      max={salaryRange.max}
                      className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">min</span>
                  </div>
                  <Minus size={20} className="text-gray-400 mt-2" />
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">&#8377;</span>
                    <input
                      type="number"
                      value={salaryRange.max}
                      onChange={(e) => handleSalaryChange(e, "max")}
                      min={salaryRange.min}
                      max="3000"
                      className="w-full pl-7 pr-10 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">max</span>
                  </div>
                </div>
              </div>

              {/* Mobile Work Time */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Work Time</h3>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a]"
                    value={workTime}
                    onChange={(e) => setWorkTime(e.target.value)}
                  >
                    <option value="">Select Work Time</option>
                    <option value="In a Week">In a Week</option>
                    <option value="24 Hours">24 Hours</option>
                    <option value="After 2 Days">After 2 Days</option>
                    <option value="Tomorrow">Tomorrow</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Mobile Experience */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Experience</h3>
                <div className="relative">
                  <select 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-[#3e5a9a] focus:border-[#3e5a9a]"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  >
                    <option value="">Select Experience</option>
                    <option value="0-To 1-Year">0 To 1 Year</option>
                    <option value="2-To-5-Year">2 To 5 Year</option>
                    <option value="5-To-10-Year">5 To 10 Year</option>
                    <option value="10-Year">More Than 10 Year</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Mobile Experience Level */}
              <div>
                <h3 className="font-semibold mb-2 text-gray-800">Experience Level</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={experienceLevel.entry} onChange={() => toggleExperienceLevel("entry")} className="w-4 h-4 text-[#3e5a9a] border-gray-300 rounded focus:ring-[#3e5a9a]" />
                    <span className="text-sm text-gray-700">Entry Level</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={experienceLevel.intermediate} onChange={() => toggleExperienceLevel("intermediate")} className="w-4 h-4 text-[#3e5a9a] border-gray-300 rounded focus:ring-[#3e5a9a]" />
                    <span className="text-sm text-gray-700">Intermediate</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={experienceLevel.expert} onChange={() => toggleExperienceLevel("expert")} className="w-4 h-4 text-[#3e5a9a] border-gray-300 rounded focus:ring-[#3e5a9a]" />
                    <span className="text-sm text-gray-700">Expert</span>
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 pb-2 space-y-2">
                <button 
                  onClick={() => {
                    applyFilters();
                    toggleFilterModal();
                  }} 
                  className="w-full py-3 text-white rounded-lg transition font-medium" 
                  style={{ backgroundColor: primaryColor }}
                >
                  Apply Filters
                </button>
                <button 
                  onClick={() => {
                    clearFilters();
                    toggleFilterModal();
                  }} 
                  className="w-full py-2 text-gray-600 border border-gray-300 rounded-lg transition font-medium hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top-btn fixed bottom-8 right-8 w-12 h-12 bg-[#3e5a9a] text-white rounded-full shadow-lg flex items-center justify-center transition-opacity duration-300 ${isScrolled ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: primaryColor }}
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
};

export default UsersList;
