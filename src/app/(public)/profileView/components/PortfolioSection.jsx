"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, FolderOpen, Eye, Play, Image as ImageIcon } from 'lucide-react';

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
  const portfolioData = u_portfolio || [];
  const imageData = portfolio_img || portfolioImages || [];
  const videoData = portfolio_vd || [];

  // Combine images and videos into one array
  const allPortfolioItems = [
    ...imageData.map(img => ({ ...img, fpoi_type: 'Image' })),
    ...videoData.map(vid => ({ ...vid, fpoi_type: 'Video' }))
  ];

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
    allPortfolioItems,
    pathname
  });

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '0') return null;
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    return `https://test.hyrelancer.in/${imagePath.split('--')[0]}`;
  };

  // Process portfolio items from API
  const processedImages = allPortfolioItems && allPortfolioItems.length > 0 
    ? allPortfolioItems.map((item, index) => ({
        id: item.fpoi_id || index,
        src: item.fpoi_type === 'Image' ? getImageUrl(item.fpoi_path) : null,
        videoUrl: item.fpoi_type === 'Video' ? item.fpoi_path : null,
        type: item.fpoi_type,
        alt: profileData?.fp_headline || profileData?.fpo_title || `Portfolio item ${index + 1}`,
        thumbnail: item.fpoi_thumb ? getImageUrl(item.fpoi_thumb) : (
          item.fpoi_type === 'Image' ? getImageUrl(item.fpoi_path) : null
        )
      }))
    : profileData?.fp_img ? [{
        id: 1,
        src: getImageUrl(profileData.fp_img),
        type: 'Image',
        alt: profileData?.fp_headline || profileData?.fpo_title || "Portfolio showcase",
        thumbnail: getImageUrl(profileData.fp_img)
      }] : [
        {
          id: 1,
          src: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=800&fit=crop",
          type: 'Image',
          alt: profileData?.fp_headline || profileData?.fpo_title || "Portfolio showcase",
          thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&h=200&fit=crop"
        }
      ];

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
          <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
        </div>

        {processedImages.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Portfolio Display */}
            <div className="lg:col-span-2">
              {/* Main Image/Video Carousel */}
              <div className="relativerounded-2xl overflow-hidden mb-6 aspect-[4/5]">
                {currentItem.type === 'Video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    {currentItem.videoUrl && currentItem.videoUrl.startsWith('http') ? (
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
                        <p className="text-lg font-medium opacity-90">Video Content</p>
                        <p className="text-sm opacity-70 text-center px-4">
                          {currentItem.videoUrl || 'Video preview not available'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : currentItem.src ? (
                  <img
                    src={currentItem.src}
                    alt={currentItem.alt}
                    className="w-full h-full object-cover mix-blend-overlay opacity-90"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback placeholder */}
                {!currentItem.src && currentItem.type !== 'Video' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium opacity-90">Portfolio Item</p>
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
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {processedImages.length}
                </div>

                {/* Media Type Indicator */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  {currentItem.type === 'Video' ? (
                    <>
                      <Play className="w-3 h-3" />
                      Video
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3 h-3" />
                      Image
                    </>
                  )}
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
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20"></div>
                      )}
                      
                      {/* Media type indicator on thumbnail */}
                      <div className="absolute top-1 right-1 bg-black bg-opacity-60 text-white px-1 py-0.5 rounded text-xs flex items-center gap-0.5">
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
                  {profileData?.fp_headline || profileData?.fpo_title || 'Portfolio Showcase'}
                </h3>
                
                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed text-sm mb-6">
                  {profileData?.fp_desc || profileData?.fpo_desc || 
                  "A showcase of creative work and professional expertise. This portfolio demonstrates skills, experience, and the quality of work delivered to clients."}
                </p>

                {/* Portfolio Stats */}
                {allPortfolioItems && allPortfolioItems.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {allPortfolioItems.length}
                        </div>
                        <div className="text-xs text-gray-600">Media Items</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {videoData.length}
                        </div>
                        <div className="text-xs text-gray-600">Videos</div>
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
                {profileSlug ? 'View All' : 'No Profile Link'}
              </button>
            </div>
          </div>
        ) : (
          // No portfolio items available
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolio Items</h3>
            <p className="text-gray-600">This freelancer hasn't uploaded any portfolio items yet.</p>
            {!profileSlug && (
              <p className="text-red-600 text-sm mt-2">Debug: No slug available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioSection;