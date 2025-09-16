"use client";

import Image from "next/image";
import { useParams } from 'next/navigation'; // Add this import
import { FaChevronDown, FaHeart, FaRegHeart, FaArrowRight } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import api from "@/config/api";
import PortfolioModal from "./Modal";

export default function Servicecards({ params }) {
  // Use useParams hook to get the slug from URL
  const urlParams = useParams();
  const slug = params?.slug || urlParams?.slug; // Fallback to URL params if props don't have slug
  
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);
  const [layout, setLayout] = useState("4");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const cardsRef = useRef([]);
  // Get slug from Redux
  console.log("Servicecards Debug:", { 
    propsSlug: params?.slug, 
    urlSlug: urlParams?.slug, 
    finalSlug: slug 
  });

  // Fetch portfolio data from API
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!slug) {
        setError('No slug available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/freelancerPortfolio/${slug}`);
        setPortfolioData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [slug]);

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '0') return null;
    return `https://test.hyrelancer.in/${imagePath.split('--')[0]}`;
  };

  // Process portfolio data into services format
  // Process portfolio data into services format
const getServicesData = () => {
  if (!portfolioData) return [];

  const allMedia = [
    ...(portfolioData.portfolio_img || []),
    ...(portfolioData.portfolio_vd || [])
  ];

  // If no portfolio items but we have media, create portfolio items from media
  if ((!portfolioData.u_portfolio || portfolioData.u_portfolio.length === 0) && allMedia.length > 0) {
    return allMedia.map((media, index) => ({
      id: media.fpoi_id,
      title: `Portfolio Item ${index + 1}`,
      description: media.fpoi_type === 'Video' ? 'Video Content' : 'Image Content',
      image: media.fpoi_type === 'Image' ? getImageUrl(media.fpoi_path) : null,
      videoUrl: media.fpoi_type === 'Video' ? media.fpoi_path : null,
      createdAt: new Date(media.created_at),
      portfolio: null,
      mediaType: media.fpoi_type,
      images: media.fpoi_type === 'Image' ? [media] : [],
      videos: media.fpoi_type === 'Video' ? [media] : []
    }));
  }

  // Original logic for when u_portfolio has items
  return (portfolioData.u_portfolio || []).map((portfolio, index) => ({
    id: portfolio.fpo_id,
    title: portfolio.fpo_title,
    description: portfolio.fpo_desc,
    image: getImageUrl(portfolio.fpo_img),
    createdAt: new Date(portfolio.created_at),
    portfolio: portfolio,
    images: (portfolioData.portfolio_img || []).filter(img => img.fpoi_fpo_id === portfolio.fpo_id),
    videos: (portfolioData.portfolio_vd || []).filter(vid => vid.fpoi_fpo_id === portfolio.fpo_id)
  }));
};

  const servicesData = getServicesData();

  const toggleFavorite = (id) => {
    setFavorites(favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id]);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSort = (option) => {
    setSortOption(option);
    setIsDropdownOpen(false);
    setVisibleCards([]);
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const openModal = (service) => {
    setSelectedPortfolio(service);
    setIsModalOpen(true);
  };

  const sortedServices = [...servicesData].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return b.createdAt.getTime() - a.createdAt.getTime();
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "random":
        return Math.random() - 0.5;
      default:
        return 0;
    }
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.dataset.index);
            setTimeout(() => {
              setVisibleCards(prev => {
                if (!prev.includes(cardIndex)) {
                  return [...prev, cardIndex];
                }
                return prev;
              });
            }, cardIndex * 150);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      cardsRef.current.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [sortedServices]);

  useEffect(() => {
    setVisibleCards([]);
  }, [sortOption]);

  const gridClasses = {
    "4": "xl:grid-cols-4",
    "3": "xl:grid-cols-3",
    "2": "xl:grid-cols-2"
  };

  // Loading state
  if (loading) {
    return (
      <div className="services lg:py-20 sm:py-14 py-10">
        <div className="container mx-auto max-w-7xl flex flex-col items-center">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
            <span className="text-gray-600">Loading portfolio...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="services lg:py-20 sm:py-14 py-10">
        <div className="container mx-auto max-w-7xl flex flex-col items-center">
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Portfolio</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="services lg:py-20 sm:py-14 py-10">
      <div className="container mx-auto max-w-7xl flex flex-col items-center">
        {/* Header */}
        {portfolioData?.u_profile && (
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {portfolioData.u_profile.fp_display_name}'s Portfolio
            </h1>
            {portfolioData.u_profile.fp_headline && (
              <p className="text-lg text-gray-600 mb-2">{portfolioData.u_profile.fp_headline}</p>
            )}
            {portfolioData.u_profile.fp_occupation && (
              <p className="text-gray-500">{portfolioData.u_profile.fp_occupation}</p>
            )}
          </div>
        )}

        {servicesData.length > 0 ? (
          <>
            {/* Filter section */}
            <div className="filter flex flex-wrap items-center justify-between gap-8 gap-y-3 relative w-full">
              {/* Layout toggle buttons - hidden on mobile */}
              <div className="hidden xl:flex items-center gap-2">
                <button
                  onClick={() => handleLayoutChange("4")}
                  className={`w-8 h-5 px-[px] py-0.5 grid grid-cols-4 grid-rows-2 place-items-center`}
                  aria-label="4 columns layout"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${layout === "4" ? "bg-black" : "bg-white border border-black"}`}
                    ></span>
                  ))}
                </button>

                <button
                  onClick={() => handleLayoutChange("3")}
                  className={`w-7 h-5 p-[2px] grid grid-cols-3 grid-rows-2 place-items-center`}
                  aria-label="3 columns layout"
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${layout === "3" ? "bg-black" : "bg-white border border-black"}`}
                    ></span>
                  ))}
                </button>

                <button
                  onClick={() => handleLayoutChange("2")}
                  className={`w-5 h-5 p-[2px] grid grid-cols-2 grid-rows-2 place-items-center`}
                  aria-label="2 columns layout"
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${layout === "2" ? "bg-black" : "bg-white border border-black"}`}
                    ></span>
                  ))}
                </button>
              </div>

              {/* Sort dropdown */}
              <div className="select_filter flex items-center gap-3 relative">
                <span className="caption1">Sort by:</span>
                <div
                  className="select_block sm:pr-16 pr-10 pl-3 py-1 border border-gray-300 rounded relative cursor-pointer"
                  onClick={toggleDropdown}
                >
                  <div className="select">
                    <span className="selected caption1 capitalize">
                      {sortOption === "default" ? "(default)" : sortOption}
                    </span>
                    <ul className={`list_option p-0 bg-white absolute top-full left-0 w-full mt-1 shadow-lg rounded z-10 ${isDropdownOpen ? "block" : "hidden"}`}>
                      <li
                        className="capitalize px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSort("newest")}
                      >
                        newest
                      </li>
                      <li
                        className="capitalize px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSort("oldest")}
                      >
                        oldest
                      </li>
                      <li
                        className="capitalize px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSort("random")}
                      >
                        random
                      </li>
                    </ul>
                  </div>
                  <FaChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>
              </div>
            </div>

            {/* Services List */}
            <ul className={`list_layout_cols list_services grid ${gridClasses[layout]} sm:grid-cols-2 md:gap-7.5 gap-5 w-full md:mt-10 mt-7`}>
              {sortedServices.map((service, index) => (
                <li
                  key={service.id}
                  ref={el => cardsRef.current[index] = el}
                  data-index={index}
                  className={`item h-full group transition-all duration-700 ease-out ${visibleCards.includes(index)
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-95'
                    }`}
                  style={{
                    transitionDelay: visibleCards.includes(index) ? '0ms' : '0ms'
                  }}
                >
                  <div className="service_item overflow-hidden relative h-full rounded-lg bg-white shadow-md duration-300 hover:shadow-xl hover:-translate-y-1">
                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorite(service.id)}
                      className="absolute top-3 right-3 z-10 p-2 bg-white/80 rounded-full backdrop-blur-sm 
                        opacity-0 group-hover:opacity-100 transition-all duration-200
                        hover:scale-110 hover:text-red-500 hover:bg-white/90"
                      aria-label={favorites.includes(service.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {favorites.includes(service.id) ? (
                        <FaHeart className="text-red-500 text-lg" />
                      ) : (
                        <FaRegHeart className="text-gray-500 text-lg hover:text-red-500" />
                      )}
                    </button>

                    <div className="service_thumb block overflow-hidden cursor-pointer" onClick={() => openModal(service)}>
                      {service.image ? (
                        <Image
                          src={service.image}
                          alt={service.title}
                          width={400}
                          height={300}
                          className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop";
                          }}
                        />
                      ) : (
                        <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="service_info py-5 px-4">
                      <div className="service_title text-lg font-semibold text-gray-900 duration-300 hover:text-[#3e5a9a] line-clamp-2 cursor-pointer"
                           onClick={() => openModal(service)}>
                        {service.title}
                      </div>
                      
                      {/* Portfolio description preview */}
                      {service.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}

                      {/* Media count */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        {service.images.length > 0 && (
                          <span>{service.images.length} Image{service.images.length !== 1 ? 's' : ''}</span>
                        )}
                        {service.videos.length > 0 && (
                          <span>{service.videos.length} Video{service.videos.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>

                      <div className="service_more_info mt-5 pt-4 border-t border-gray-300">
                        <button
                          onClick={() => openModal(service)}
                          className="btn_action w-full py-2 bg-white text-[#3e5a9a] font-semibold rounded-lg border border-[#3e5a9a] duration-300 hover:bg-[#3e5a9a] hover:text-white transform hover:scale-105 active:scale-95">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination - You can implement this based on your API pagination */}
            <ul className="list_pagination flex items-center justify-center gap-2 w-full md:mt-10 mt-7">
              {[1, 2, 3].map((page) => (
                <li key={page}>
                  <a
                    href="#"
                    className={`tab_btn -fill flex items-center justify-center w-10 h-10 rounded border border-gray-300 text-gray-800 duration-300 hover:border-black hover:scale-105 active:scale-95 ${page === 1 ? "active bg-[#3e5a9a] text-white border-[#3e5a9a]" : ""}`}
                  >
                    {page}
                  </a>
                </li>
              ))}
              <li>
                <a href="#" className="tab_btn -fill flex items-center justify-center w-10 h-10 rounded border border-gray-300 text-gray-800 duration-300 hover:bg-[#3e5a9a] hover:text-white hover:scale-105 active:scale-95">
                  <FaArrowRight />
                </a>
              </li>
            </ul>
          </>
        ) : (
          // No portfolio items
          <div className="text-center py-20">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Portfolio Items</h3>
            <p className="text-gray-600">
              {portfolioData?.u_profile?.fp_display_name || 'This freelancer'} hasn't uploaded any portfolio items yet.
            </p>
          </div>
        )}

        {/* Portfolio Modal */}
        <PortfolioModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          portfolioData={selectedPortfolio}
          getImageUrl={getImageUrl}
        />
      </div>

      {/* Loading overlay for transitions */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      )}
    </div>
  );
}