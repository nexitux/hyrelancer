"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, FolderOpen, Eye, Play, Image as ImageIcon } from 'lucide-react';
import { capitalizeFirst, capitalizeWords } from "@/lib/utils";

const PortfolioSection = ({ 
  u_profile, 
  u_portfolio, 
  portfolio_img, 
  portfolio_vd,
  // Fallback to old prop names for backward compatibility
  portfolio, 
  portfolioImages, 
  portfolioEx 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use new data structure or fallback to old props
  const profileData = u_profile || portfolio;
  const portfolioData = u_portfolio || {};
  const imageData = portfolio_img || portfolioImages || [];
  const videoData = portfolio_vd || [];

  // Combine images and videos into one array
  const allPortfolioItems = [
    ...imageData.map(img => ({ 
      ...img, 
      fpoi_type: img.fpoi_type === 'Video' && (!img.fpoi_path || img.fpoi_path.includes('video.url.com') || img.fpoi_path.includes('dummy') || img.fpoi_path.includes('placeholder')) 
        ? 'Image' // Treat dummy video URLs as images
        : img.fpoi_type || 'Image' 
    })),
    ...videoData.map(vid => ({ ...vid, fpoi_type: 'Video' }))
  ];

  // Add the main portfolio image (fpo_img) as the first item if it exists
  if (portfolioData?.fpo_img && portfolioData.fpo_img !== '0') {
    const mainPortfolioImage = {
      fpoi_id: 'main',
      fpoi_type: 'Image',
      fpoi_path: portfolioData.fpo_img,
      fpoi_thumb: portfolioData.fpo_img,
      fpoi_is_active: 1,
      isMainImage: true
    };
    allPortfolioItems.unshift(mainPortfolioImage);
  }

  // Check if there's any portfolio data (either main portfolio object or portfolio items)
  const hasPortfolioData = (portfolioData && Object.keys(portfolioData).length > 0) || allPortfolioItems.length > 0;

  // derive slug from props or pathname fallback
  const deriveSlug = () => {
    // Check new data structure first
    if (profileData?.fp_slug) return profileData.fp_slug;
    if (profileData?.slug) return profileData.slug;
    if (profileData?.fpo_slug) return profileData.fpo_slug;
    if (profileData?.url) return profileData.url;
    
    // fallback: assume current URL contains the profile slug as last segment
    if (pathname) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
    }
    return null;
  };

  const profileSlug = deriveSlug();
  console.log("Portfolio Debug:", {
    profileData,
    profileSlug,
    portfolioData,
    allPortfolioItems,
    hasPortfolioData,
    mainPortfolioImage: portfolioData?.fpo_img,
    pathname,
    u_portfolio,
    portfolio_img,
    portfolio_vd,
    portfolioEx
  });

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '0') return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Handle the specific format from API: "uploads/freelancer/profile/f_profile_pic_1759086468.JPEG--f_profile_pic_1759086468.JPEG"
    if (imagePath.includes('--')) {
      return `https://backend.hyrelancer.in/${imagePath.split('--')[0]}`;
    }
    
    // For other formats, just prepend the base URL
    return `https://backend.hyrelancer.in/${imagePath}`;
  };

  // Process portfolio items from API
  const processedImages = allPortfolioItems && allPortfolioItems.length > 0 
    ? allPortfolioItems.map((item, index) => {
        const processedItem = {
          id: item.fpoi_id || index,
          src: item.fpoi_type === 'Image' ? getImageUrl(item.fpoi_path) : null,
          videoUrl: item.fpoi_type === 'Video' && item.fpoi_path && !item.fpoi_path.includes('video.url.com') ? item.fpoi_path : null,
          type: item.fpoi_type,
          alt: item.isMainImage 
            ? portfolioData?.fpo_title || profileData?.fp_headline || 'Main Portfolio Image'
            : profileData?.fp_headline || profileData?.fpo_title || `Portfolio item ${index + 1}`,
          thumbnail: item.fpoi_thumb ? getImageUrl(item.fpoi_thumb) : (
            item.fpoi_type === 'Image' ? getImageUrl(item.fpoi_path) : null
          )
        };
        console.log(`Processing portfolio item ${index}:`, {
          original: item,
          processed: processedItem
        });
        return processedItem;
      })
    : []; // No portfolio items - return empty array

  console.log("Final processedImages:", processedImages);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % processedImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // Get skills from portfolio expertise or fallback
  const skills = portfolioEx && portfolioEx.length > 0 
    ? portfolioEx.map(exp => exp.skill_name || exp.fpe_name).filter(Boolean)
    : profileData?.fp_occupation ? [profileData.fp_occupation] : ["Portfolio", "Creative Work"];

  const currentItem = processedImages[currentImageIndex];
  
  // Debug current item
  console.log("Current Portfolio Item:", {
    currentImageIndex,
    currentItem,
    totalItems: processedImages.length,
    imageSrc: currentItem?.src,
    imageType: currentItem?.type
  });

  // Navigate to services/{slug}#portfolio
  const handleViewAll = () => {
    if (profileSlug) {
      // use hash so browser jumps to #portfolio on services page
      router.push(`/services/${profileSlug}#portfolio`);
    } else {
      // fallback: go to services index
      router.push('/services');
    }
  };

  // Show debug info if no slug
  if (!profileSlug) {
    console.error("No slug available. Debug info:", {
      u_profile,
      portfolio,
      pathname,
      profileData
    });
  }

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{capitalizeFirst("Portfolio")}</h2>
        </div>

        {hasPortfolioData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Portfolio Display */}
            <div className="lg:col-span-2">
              {/* Main Image/Video Carousel */}
              <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[4/5] bg-gray-100">
                {currentItem.type === 'Video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    {currentItem.videoUrl && currentItem.videoUrl.startsWith('http') && !currentItem.videoUrl.includes('dummy') && !currentItem.videoUrl.includes('placeholder') ? (
                      <iframe
                        src={currentItem.videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white">
                        <Play className="w-16 h-16 mb-4 opacity-80" />
                        <p className="text-lg font-medium opacity-90">{capitalizeWords("Video Content")}</p>
                        <p className="text-sm opacity-70 text-center px-4">
                          {currentItem.videoUrl || capitalizeWords('Video preview not available')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : currentItem.src ? (
                  <>
                    <img
                      key={`${currentItem.id}-${currentImageIndex}`}
                      src={currentItem.src}
                      alt={currentItem.alt}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", currentItem.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", currentItem.src);
                      }}
                    />
                    {/* Error fallback - hidden by default */}
                    <div className="w-full h-full flex items-center justify-center bg-gray-200" style={{display: 'none'}}>
                      <div className="text-center text-gray-600">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-60" />
                        <p className="text-lg font-medium">{capitalizeWords("Image Failed to Load")}</p>
                        <p className="text-sm opacity-70">URL: {currentItem.src}</p>
                      </div>
                    </div>
                  </>
                ) : null}
                
                {/* Fallback placeholder */}
                {!currentItem.src && currentItem.type !== 'Video' && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center text-gray-600">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-60" />
                      <p className="text-lg font-medium">{capitalizeWords("No Image Available")}</p>
                      <p className="text-sm opacity-70">{capitalizeWords("Image failed to load")}</p>
                    </div>
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {processedImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                    
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 group"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {processedImages.length}
                </div>

              </div>

              {/* Thumbnail Gallery */}
              {processedImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {processedImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => goToImage(index)}
                      className={`relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        index === currentImageIndex
                          ? 'border-blue-500 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      {image.thumbnail ? (
                        <img
                          src={image.thumbnail}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          {image.type === 'Video' ? (
                            <Play className="w-6 h-6 text-gray-400" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      )}
                      {index === currentImageIndex && (
                        <div className="absolute inset-0 bg-blue-500/20"></div>
                      )}
                      
                      {/* Media type indicator on thumbnail */}
                      <div className="absolute top-1 right-1 bg-black/60 text-white px-1 py-0.5 rounded text-xs flex items-center gap-0.5">
                        {image.type === 'Video' ? (
                          <Play className="w-2 h-2" />
                        ) : (
                          <ImageIcon className="w-2 h-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Portfolio Info Sidebar */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {capitalizeWords(portfolioData?.fpo_title || profileData?.fp_headline || 'Portfolio Showcase')}
                </h3>
                
                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                    >
                      {capitalizeWords(skill)}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed text-sm mb-6">
                  {capitalizeFirst(portfolioData?.fpo_desc || profileData?.fp_desc || 
                  "A showcase of creative work and professional expertise. This portfolio demonstrates skills, experience, and the quality of work delivered to clients.")}
                </p>

                {/* Portfolio Stats */}
                {allPortfolioItems && allPortfolioItems.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {allPortfolioItems.length}
                        </div>
                        <div className="text-xs text-gray-600">{capitalizeWords("Media Items")}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {videoData.length}
                        </div>
                        <div className="text-xs text-gray-600">{capitalizeFirst("Videos")}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* View All Button */}
              <button
                onClick={handleViewAll}
                className="w-full group flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                disabled={!profileSlug}
              >
                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                {profileSlug ? capitalizeWords('View All') : capitalizeWords('No Profile Link')}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="flex justify-center mb-4">
                <FolderOpen className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{capitalizeWords("No Portfolio Added")}</h3>
              <p className="text-gray-500 text-sm">
                {capitalizeFirst("This freelancer hasn't added any portfolio items yet.")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioSection;