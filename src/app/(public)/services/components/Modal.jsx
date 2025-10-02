"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function PortfolioModal({ isOpen, onClose, portfolioData, getImageUrl }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
    const [isSliding, setIsSliding] = useState(false);

    // Responsive thumbnail count based on screen size
    const getThumbnailCount = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 3; // sm
            if (window.innerWidth < 1024) return 4; // md
            return 4; // lg and above
        }
        return 4;
    };

    const [thumbnailCount, setThumbnailCount] = useState(getThumbnailCount());

    // Process all media items from the portfolio
    const getPortfolioProjects = () => {
        if (!portfolioData) return [];

        const projects = [];
        
        // Add main portfolio image first if it exists
        if (portfolioData.image) {
            projects.push({
                id: portfolioData.id || 'main',
                title: portfolioData.title,
                type: 'image',
                image: portfolioData.image,
            });
        }
        
        // Add all images
        if (portfolioData.images && portfolioData.images.length > 0) {
            portfolioData.images.forEach((img, index) => {
                // Skip if this is the same as the main image
                if (portfolioData.image && getImageUrl(img.fpoi_path) === portfolioData.image) {
                    return;
                }
                
                projects.push({
                    id: img.fpoi_id,
                    title: `${portfolioData.title} - Image ${index + 1}`,
                    type: 'image',
                    image: getImageUrl(img.fpoi_path),
                });
            });
        }

        // Add all videos (handle dummy video URLs)
        if (portfolioData.videos && portfolioData.videos.length > 0) {
            portfolioData.videos.forEach((vid, index) => {
                // Check if it's a dummy video URL
                const isDummyVideo = !vid.fpoi_path || 
                    vid.fpoi_path.includes('video.url.com') || 
                    vid.fpoi_path.includes('dummy') || 
                    vid.fpoi_path.includes('placeholder');
                
                if (isDummyVideo) {
                    // Treat dummy video as image placeholder
                    projects.push({
                        id: vid.fpoi_id,
                        title: `${portfolioData.title} - Media ${index + 1}`,
                        type: 'image',
                        image: portfolioData.image || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
                    });
                } else {
                    // Real video
                    projects.push({
                        id: vid.fpoi_id,
                        title: `${portfolioData.title} - Video ${index + 1}`,
                        type: 'video',
                        image: portfolioData.image,
                        videoUrl: vid.fpoi_path,
                    });
                }
            });
        }

        // If no projects at all, create a placeholder
        if (projects.length === 0) {
            projects.push({
                id: 'placeholder',
                title: portfolioData.title || 'Portfolio Item',
                type: 'image',
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
            });
        }

        return projects;
    };

    const projects = getPortfolioProjects();

    // Update thumbnail count on resize
    const handleResize = () => {
        setThumbnailCount(getThumbnailCount());
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const nextSlide = () => {
        if (isSliding || projects.length === 0) return;
        setIsSliding(true);
        const newIndex = currentIndex === projects.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
        
        // Auto-adjust thumbnail view
        if (newIndex >= thumbnailStartIndex + thumbnailCount) {
            setThumbnailStartIndex(Math.min(newIndex - thumbnailCount + 1, projects.length - thumbnailCount));
        } else if (newIndex < thumbnailStartIndex) {
            setThumbnailStartIndex(Math.max(0, newIndex));
        }
        
        setTimeout(() => setIsSliding(false), 300);
    };

    const prevSlide = () => {
        if (isSliding || projects.length === 0) return;
        setIsSliding(true);
        const newIndex = currentIndex === 0 ? projects.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        
        // Auto-adjust thumbnail view
        if (newIndex < thumbnailStartIndex) {
            setThumbnailStartIndex(Math.max(0, newIndex));
        } else if (newIndex >= thumbnailStartIndex + thumbnailCount) {
            setThumbnailStartIndex(Math.min(newIndex - thumbnailCount + 1, projects.length - thumbnailCount));
        }
        
        setTimeout(() => setIsSliding(false), 300);
    };

    const visibleThumbnails = projects.slice(thumbnailStartIndex, thumbnailStartIndex + thumbnailCount);

    if (!isOpen || !portfolioData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-lg"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>

                {/* Scrollable Content */}
                <div className="overflow-y-auto scrollbar-hide max-h-[90vh] sm:max-h-[85vh] p-3 sm:p-4 md:p-5">
                    {/* Header */}
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-5 pr-12 sm:pr-16">
                        {portfolioData.title}
                    </h1>

                    {/* Description - NEW ADDITION */}
                    {portfolioData.description && (
                        <div className="mb-4 sm:mb-5">
                            <h2 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">About This Project</h2>
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    {portfolioData.description}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                        {/* Main Project Display */}
                        <div className="relative">
                            {/* Navigation Buttons - Hidden on very small screens */}
                            <button
                                onClick={prevSlide}
                                disabled={isSliding}
                                className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg items-center justify-center hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                            </button>

                            <button
                                onClick={nextSlide}
                                disabled={isSliding}
                                className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg items-center justify-center hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                            </button>

                            {/* Main Display with sliding animation */}
                            <div className="aspect-[4/3] sm:aspect-[4/3] md:aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative max-h-[300px] sm:max-h-[350px] md:max-h-[400px]">
                                <div 
                                    className="flex transition-transform duration-300 ease-in-out h-full"
                                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                                >
                                    {projects.map((project, index) => (
                                        <div key={project.id} className="w-full h-full flex-shrink-0">
                                            {project.type === 'video' ? (
                                                project.videoUrl && project.videoUrl.startsWith('http') && 
                                                !project.videoUrl.includes('video.url.com') && 
                                                !project.videoUrl.includes('dummy') && 
                                                !project.videoUrl.includes('placeholder') ? (
                                                    <iframe
                                                        src={project.videoUrl}
                                                        title={project.title}
                                                        className="w-full h-full"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                        <div className="text-center text-white">
                                                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent ml-1"></div>
                                                            </div>
                                                            <p className="text-lg font-medium">Video Content</p>
                                                            <p className="text-sm opacity-70 mt-2">
                                                                {project.videoUrl || 'Video preview not available'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <img
                                                    src={project.image}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop';
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Navigation Buttons - Only visible on small screens */}
                            <div className="flex sm:hidden justify-between items-center mt-3">
                                <button
                                    onClick={prevSlide}
                                    disabled={isSliding}
                                    className="w-10 h-10 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-all duration-200 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>

                                <span className="text-sm text-gray-500 font-medium">
                                    {currentIndex + 1} / {projects.length}
                                </span>

                                <button
                                    onClick={nextSlide}
                                    disabled={isSliding}
                                    className="w-10 h-10 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-all duration-200 disabled:opacity-50"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Project Title */}
                        <div className="text-center sm:text-left">
                            <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                                {projects[currentIndex]?.title}
                            </h2>
                        </div>

                        {/* Thumbnail Grid */}
                        {projects.length > 1 && (
                            <div className="space-y-2">
                                <h3 className="text-xs sm:text-sm font-medium text-gray-700">All Projects</h3>
                                <div className={`grid gap-1.5 sm:gap-2 ${thumbnailCount === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                                    {visibleThumbnails.map((project, index) => {
                                        const actualIndex = thumbnailStartIndex + index;
                                        return (
                                            <button
                                                key={project.id}
                                                onClick={() => {
                                                    setCurrentIndex(actualIndex);
                                                    if (actualIndex >= thumbnailStartIndex + thumbnailCount) {
                                                        setThumbnailStartIndex(Math.min(actualIndex - thumbnailCount + 1, projects.length - thumbnailCount));
                                                    } else if (actualIndex < thumbnailStartIndex) {
                                                        setThumbnailStartIndex(Math.max(0, actualIndex));
                                                    }
                                                }}
                                                className={`aspect-square rounded-md sm:rounded-lg overflow-hidden transition-all duration-200 relative ${
                                                    currentIndex === actualIndex
                                                        ? 'ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2'
                                                        : 'hover:opacity-75 hover:scale-105'
                                                }`}
                                            >
                                                <img
                                                    src={project.image}
                                                    alt={project.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=150&h=150&fit=crop';
                                                    }}
                                                />
                                                {project.type === 'video' && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                                            <div className="w-0 h-0 border-l-[4px] sm:border-l-[6px] border-l-gray-800 border-t-[3px] sm:border-t-[4px] border-t-transparent border-b-[3px] sm:border-b-[4px] border-b-transparent ml-0.5 sm:ml-1"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Thumbnail Navigation Indicators */}
                                {projects.length > thumbnailCount && (
                                    <div className="flex justify-center space-x-1.5 mt-2">
                                        {Array.from({ length: Math.ceil(projects.length / thumbnailCount) }).map((_, index) => {
                                            const isActive = Math.floor(thumbnailStartIndex / thumbnailCount) === index;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setThumbnailStartIndex(index * thumbnailCount)}
                                                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                                        isActive ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}